/**
 * Offbank checkout widget loader.
 *
 * Add to any site:
 *   <script src="https://offbankpay.com/embed.js"></script>
 *
 * Then either:
 *   1. Declarative — add data attributes to any clickable element:
 *      <button data-offbank-checkout
 *              data-merchant="MERCHANT_WALLET"
 *              data-amount="49.99"
 *              data-name="Acme Wholesale"
 *              data-order="INV-1023">Pay with USDC</button>
 *
 *   2. Programmatic:
 *      OffbankCheckout.open({
 *        merchant: "MERCHANT_WALLET", amount: 49.99,
 *        name: "Acme Wholesale", orderId: "INV-1023",
 *        webhook: "https://acme.com/hooks/offbank",
 *        onSuccess: function (d) {  d.signature, d.sessionId  },
 *        onClose: function () {}
 *      });
 */
(function () {
  "use strict";

  var ORIGIN = "https://offbankpay.com";
  try {
    if (document.currentScript && document.currentScript.src) {
      ORIGIN = new URL(document.currentScript.src).origin;
    }
  } catch (e) {
    /* keep default */
  }

  function open(opts) {
    opts = opts || {};
    var params = new URLSearchParams();

    if (opts.session) {
      // Secure mode: amount + merchant fixed server-side.
      params.set("session", String(opts.session));
    } else {
      var merchant = opts.merchant;
      var amount = opts.amount;
      if (!merchant || !amount) {
        console.error(
          "[Offbank] `merchant` and `amount` (or `session`) are required.",
        );
        return;
      }
      params.set("merchant", String(merchant));
      params.set("amount", String(amount));
      params.set("name", opts.name || "");
      params.set("order", opts.orderId || opts.order || "");
      if (opts.webhook) params.set("webhook", opts.webhook);
      // Optional line items: [{ name, qty, price }] — shown as an order summary.
      if (opts.items) {
        try {
          params.set(
            "items",
            typeof opts.items === "string"
              ? opts.items
              : JSON.stringify(opts.items),
          );
        } catch (e) {
          /* ignore malformed items */
        }
      }
    }

    // Optional EVM (Ethereum/Base) receiving address — enables paying from an
    // Ethereum wallet (MetaMask etc.) in addition to Solana.
    if (opts.evm) params.set("evm", String(opts.evm));

    // Sandbox/demo mode — the checkout can be completed without a real payment.
    if (opts.sandbox) params.set("sandbox", "1");

    var overlay = document.createElement("div");
    overlay.setAttribute("data-offbank-overlay", "");
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:2147483647;background:rgba(15,23,42,.55);" +
      "display:flex;align-items:center;justify-content:center;padding:16px;" +
      "-webkit-tap-highlight-color:transparent;";

    var frame = document.createElement("iframe");
    frame.src = ORIGIN + "/embed/checkout?" + params.toString();
    frame.style.cssText =
      "width:100%;max-width:420px;height:620px;max-height:92vh;border:0;" +
      "border-radius:16px;background:#fff;box-shadow:0 24px 60px rgba(0,0,0,.32);";
    frame.setAttribute("allow", "clipboard-write");
    overlay.appendChild(frame);
    document.body.appendChild(overlay);

    var prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function cleanup() {
      window.removeEventListener("message", onMessage);
      document.body.style.overflow = prevOverflow;
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    function onMessage(e) {
      if (e.origin !== ORIGIN) return;
      var d = e.data || {};
      if (d.type === "offbank:checkout:success") {
        cleanup();
        if (typeof opts.onSuccess === "function") opts.onSuccess(d);
      } else if (d.type === "offbank:checkout:close") {
        cleanup();
        if (typeof opts.onClose === "function") opts.onClose(d);
      }
    }

    window.addEventListener("message", onMessage);

    // Click the dimmed backdrop to dismiss.
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) {
        cleanup();
        if (typeof opts.onClose === "function")
          opts.onClose({ type: "offbank:checkout:close" });
      }
    });
  }

  // Declarative binding via data attributes.
  function bind(root) {
    var els = (root || document).querySelectorAll("[data-offbank-checkout]");
    for (var i = 0; i < els.length; i++) {
      (function (el) {
        if (el.__offbankBound) return;
        el.__offbankBound = true;
        el.addEventListener("click", function (ev) {
          ev.preventDefault();
          open({
            merchant: el.getAttribute("data-merchant"),
            amount: el.getAttribute("data-amount"),
            name: el.getAttribute("data-name"),
            orderId: el.getAttribute("data-order"),
            webhook: el.getAttribute("data-webhook"),
            evm: el.getAttribute("data-evm"),
            onSuccess: function (d) {
              el.dispatchEvent(
                new CustomEvent("offbank:success", {
                  detail: d,
                  bubbles: true,
                }),
              );
            },
          });
        });
      })(els[i]);
    }
  }

  if (document.readyState !== "loading") bind();
  else document.addEventListener("DOMContentLoaded", function () { bind(); });

  window.OffbankCheckout = { open: open, bind: bind };
})();
