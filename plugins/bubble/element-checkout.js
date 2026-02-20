/**
 * Settlr Bubble.io Plugin — Element Code
 *
 * This runs inside the Bubble plugin element runtime.
 * It renders the checkout button and handles the payment flow.
 *
 * In Bubble's plugin editor, paste this into the "Element code" field
 * of the SettlrCheckout element.
 */

function(instance, properties, context) {
  // ── Render ────────────────────────────────────────────────────────

  const container = instance.canvas;
  if (!container) return;

  const amount = properties.amount || 0;
  const description = properties.description || "";
  const buttonText = properties.button_text || "Pay with USDC";
  const buttonColor = properties.button_color || "#3B82F6";
  const redirectUrl = properties.redirect_url || window.location.href;

  // Build UI
  container.innerHTML = "";

  const btn = document.createElement("button");
  btn.textContent = buttonText;
  btn.style.cssText = `
    background: ${buttonColor};
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    font-family: system-ui, sans-serif;
    transition: opacity 0.2s;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  `;

  // USDC icon (inline SVG)
  const icon = document.createElement("span");
  icon.innerHTML = `<svg width="18" height="18" viewBox="0 0 32 32" fill="white"><circle cx="16" cy="16" r="16" fill="none"/><path d="M16 2a14 14 0 1 0 0 28 14 14 0 0 0 0-28zm0 25.2a11.2 11.2 0 0 1 0-22.4 11.2 11.2 0 0 1 0 22.4z" fill="currentColor" opacity="0.3"/><text x="16" y="21" text-anchor="middle" font-size="14" font-weight="bold" fill="currentColor">$</text></svg>`;
  btn.prepend(icon);

  btn.addEventListener("mouseenter", () => { btn.style.opacity = "0.9"; });
  btn.addEventListener("mouseleave", () => { btn.style.opacity = "1"; });

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    btn.textContent = "Creating payment...";

    try {
      // Call the plugin's "create_payment" API action
      const result = await context.async(async (cb) => {
        try {
          const res = await instance.data.create_payment(
            amount,
            description,
            redirectUrl,
            context.currentUser?.get("_id") || ""
          );
          cb(null, res);
        } catch (err) {
          cb(err);
        }
      });

      // Expose states
      instance.publishState("payment_id", result.id);
      instance.publishState("checkout_url", result.checkoutUrl);
      instance.publishState("payment_status", result.status);

      // Trigger event
      instance.triggerEvent("payment_created");

      // Redirect to Settlr checkout
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (err) {
      console.error("[Settlr] Payment creation failed:", err);
      instance.triggerEvent("payment_failed");
      btn.textContent = "Payment failed — retry";
      btn.disabled = false;
    }
  });

  container.appendChild(btn);

  // Add amount display below button
  if (amount > 0) {
    const amountLabel = document.createElement("div");
    amountLabel.textContent = `$${amount.toFixed(2)} USDC`;
    amountLabel.style.cssText = `
      text-align: center;
      font-size: 12px;
      color: #888;
      margin-top: 6px;
      font-family: system-ui, sans-serif;
    `;
    container.appendChild(amountLabel);
  }
}
