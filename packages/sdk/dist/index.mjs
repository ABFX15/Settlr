// src/client.ts
import {
  Connection,
  PublicKey as PublicKey2,
  Transaction,
  TransactionInstruction
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  TokenAccountNotFoundError
} from "@solana/spl-token";

// src/constants.ts
import { PublicKey } from "@solana/web3.js";
var USDC_MINT_DEVNET = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
var USDC_MINT_MAINNET = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
var SETTLR_API_URL = {
  production: "https://settlr.dev/api",
  development: "http://localhost:3000/api"
};
var SETTLR_CHECKOUT_URL = {
  production: "https://settlr.dev/pay",
  development: "http://localhost:3000/pay"
};
var SUPPORTED_NETWORKS = ["devnet", "mainnet-beta"];
var USDC_DECIMALS = 6;
var DEFAULT_RPC_ENDPOINTS = {
  devnet: "https://api.devnet.solana.com",
  "mainnet-beta": "https://api.mainnet-beta.solana.com"
};

// src/utils.ts
function formatUSDC(lamports, decimals = 2) {
  const amount = Number(lamports) / Math.pow(10, USDC_DECIMALS);
  return amount.toFixed(decimals);
}
function parseUSDC(amount) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return BigInt(Math.round(num * Math.pow(10, USDC_DECIMALS)));
}
function shortenAddress(address, chars = 4) {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
function generatePaymentId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `pay_${timestamp}${random}`;
}
function isValidSolanaAddress(address) {
  try {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
  } catch {
    return false;
  }
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function retry(fn, maxRetries = 3, baseDelay = 1e3) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await sleep(baseDelay * Math.pow(2, i));
      }
    }
  }
  throw lastError;
}

// src/client.ts
var Settlr = class {
  constructor(config) {
    this.validated = false;
    if (!config.apiKey) {
      throw new Error("API key is required. Get one at https://settlr.dev/dashboard");
    }
    const walletAddress = typeof config.merchant.walletAddress === "string" ? config.merchant.walletAddress : config.merchant.walletAddress.toBase58();
    if (!isValidSolanaAddress(walletAddress)) {
      throw new Error("Invalid merchant wallet address");
    }
    const network = config.network ?? "devnet";
    const testMode = config.testMode ?? network === "devnet";
    this.config = {
      merchant: {
        ...config.merchant,
        walletAddress
      },
      apiKey: config.apiKey,
      network,
      rpcEndpoint: config.rpcEndpoint ?? DEFAULT_RPC_ENDPOINTS[network],
      testMode
    };
    this.apiBaseUrl = testMode ? SETTLR_API_URL.development : SETTLR_API_URL.production;
    this.connection = new Connection(this.config.rpcEndpoint, "confirmed");
    this.usdcMint = network === "devnet" ? USDC_MINT_DEVNET : USDC_MINT_MAINNET;
    this.merchantWallet = new PublicKey2(walletAddress);
  }
  /**
   * Validate API key with Settlr backend
   */
  async validateApiKey() {
    if (this.validated) return;
    try {
      const response = await fetch(`${this.apiBaseUrl}/sdk/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.config.apiKey
        },
        body: JSON.stringify({
          walletAddress: this.config.merchant.walletAddress
        })
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Invalid API key" }));
        throw new Error(error.error || "API key validation failed");
      }
      const data = await response.json();
      if (!data.valid) {
        throw new Error(data.error || "Invalid API key");
      }
      this.validated = true;
      this.merchantId = data.merchantId;
      this.tier = data.tier;
    } catch (error) {
      if (error instanceof Error && error.message.includes("fetch")) {
        if (this.config.apiKey.startsWith("sk_test_")) {
          this.validated = true;
          this.tier = "free";
          return;
        }
      }
      throw error;
    }
  }
  /**
   * Get the current tier
   */
  getTier() {
    return this.tier;
  }
  /**
   * Create a payment link
   * 
   * @example
   * ```typescript
   * const payment = await settlr.createPayment({
   *   amount: 29.99,
   *   memo: 'Order #1234',
   *   successUrl: 'https://mystore.com/success',
   * });
   * 
   * console.log(payment.checkoutUrl);
   * // https://settlr.dev/pay?amount=29.99&merchant=...
   * ```
   */
  async createPayment(options) {
    await this.validateApiKey();
    const { amount, memo, orderId, metadata, successUrl, cancelUrl, expiresIn = 3600 } = options;
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }
    const paymentId = generatePaymentId();
    const amountLamports = parseUSDC(amount);
    const createdAt = /* @__PURE__ */ new Date();
    const expiresAt = new Date(createdAt.getTime() + expiresIn * 1e3);
    const baseUrl = this.config.testMode ? SETTLR_CHECKOUT_URL.development : SETTLR_CHECKOUT_URL.production;
    const params = new URLSearchParams({
      amount: amount.toString(),
      merchant: this.config.merchant.name,
      to: this.config.merchant.walletAddress
    });
    if (memo) params.set("memo", memo);
    if (orderId) params.set("orderId", orderId);
    if (successUrl) params.set("successUrl", successUrl);
    if (cancelUrl) params.set("cancelUrl", cancelUrl);
    if (paymentId) params.set("paymentId", paymentId);
    const checkoutUrl = `${baseUrl}?${params.toString()}`;
    const qrCode = await this.generateQRCode(checkoutUrl);
    const payment = {
      id: paymentId,
      amount,
      amountLamports,
      status: "pending",
      merchantAddress: this.config.merchant.walletAddress,
      checkoutUrl,
      qrCode,
      memo,
      orderId,
      metadata,
      createdAt,
      expiresAt
    };
    return payment;
  }
  /**
   * Build a transaction for direct payment (for wallet integration)
   * 
   * @example
   * ```typescript
   * const tx = await settlr.buildTransaction({
   *   payerPublicKey: wallet.publicKey,
   *   amount: 29.99,
   * });
   * 
   * const signature = await wallet.sendTransaction(tx, connection);
   * ```
   */
  async buildTransaction(options) {
    await this.validateApiKey();
    const { payerPublicKey, amount, memo } = options;
    const amountLamports = parseUSDC(amount);
    const payerAta = await getAssociatedTokenAddress(this.usdcMint, payerPublicKey);
    const merchantAta = await getAssociatedTokenAddress(this.usdcMint, this.merchantWallet);
    const instructions = [];
    try {
      await getAccount(this.connection, merchantAta);
    } catch (error) {
      if (error instanceof TokenAccountNotFoundError) {
        instructions.push(
          createAssociatedTokenAccountInstruction(
            payerPublicKey,
            merchantAta,
            this.merchantWallet,
            this.usdcMint
          )
        );
      } else {
        throw error;
      }
    }
    instructions.push(
      createTransferInstruction(
        payerAta,
        merchantAta,
        payerPublicKey,
        BigInt(amountLamports)
      )
    );
    if (memo) {
      const MEMO_PROGRAM_ID = new PublicKey2("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
      instructions.push(
        new TransactionInstruction({
          keys: [{ pubkey: payerPublicKey, isSigner: true, isWritable: false }],
          programId: MEMO_PROGRAM_ID,
          data: Buffer.from(memo, "utf-8")
        })
      );
    }
    const { blockhash } = await this.connection.getLatestBlockhash();
    const transaction = new Transaction();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payerPublicKey;
    transaction.add(...instructions);
    return transaction;
  }
  /**
   * Execute a direct payment (requires wallet adapter)
   * 
   * @example
   * ```typescript
   * const result = await settlr.pay({
   *   wallet,
   *   amount: 29.99,
   *   memo: 'Order #1234',
   * });
   * 
   * if (result.success) {
   *   console.log('Paid!', result.signature);
   * }
   * ```
   */
  async pay(options) {
    const { wallet, amount, memo, txOptions } = options;
    try {
      const transaction = await this.buildTransaction({
        payerPublicKey: wallet.publicKey,
        amount,
        memo
      });
      const signedTx = await wallet.signTransaction(transaction);
      const signature = await retry(
        () => this.connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: txOptions?.skipPreflight ?? false,
          preflightCommitment: txOptions?.commitment ?? "confirmed",
          maxRetries: txOptions?.maxRetries ?? 3
        }),
        3
      );
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
      await this.connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature
      });
      return {
        success: true,
        signature,
        amount,
        merchantAddress: this.merchantWallet.toBase58()
      };
    } catch (error) {
      return {
        success: false,
        signature: "",
        amount,
        merchantAddress: this.merchantWallet.toBase58(),
        error: error instanceof Error ? error.message : "Payment failed"
      };
    }
  }
  /**
   * Check payment status by transaction signature
   */
  async getPaymentStatus(signature) {
    try {
      const status = await this.connection.getSignatureStatus(signature);
      if (!status.value) {
        return "pending";
      }
      if (status.value.err) {
        return "failed";
      }
      if (status.value.confirmationStatus === "confirmed" || status.value.confirmationStatus === "finalized") {
        return "completed";
      }
      return "pending";
    } catch {
      return "failed";
    }
  }
  /**
   * Create a hosted checkout session (like Stripe Checkout)
   * 
   * @example
   * ```typescript
   * const session = await settlr.createCheckoutSession({
   *   amount: 29.99,
   *   description: 'Premium Plan',
   *   successUrl: 'https://mystore.com/success',
   *   cancelUrl: 'https://mystore.com/cancel',
   *   webhookUrl: 'https://mystore.com/api/webhooks/settlr',
   * });
   * 
   * // Redirect customer to hosted checkout
   * window.location.href = session.url;
   * ```
   */
  async createCheckoutSession(options) {
    const { amount, description, metadata, successUrl, cancelUrl, webhookUrl } = options;
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }
    const baseUrl = this.config.testMode ? "http://localhost:3000" : "https://settlr.dev";
    const response = await fetch(`${baseUrl}/api/checkout/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.config.apiKey && { "Authorization": `Bearer ${this.config.apiKey}` }
      },
      body: JSON.stringify({
        merchantId: this.config.merchant.name.toLowerCase().replace(/\s+/g, "-"),
        merchantName: this.config.merchant.name,
        merchantWallet: this.config.merchant.walletAddress,
        amount,
        description,
        metadata,
        successUrl,
        cancelUrl,
        webhookUrl
      })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to create checkout session");
    }
    return response.json();
  }
  /**
   * Get merchant's USDC balance
   */
  async getMerchantBalance() {
    try {
      const ata = await getAssociatedTokenAddress(this.usdcMint, this.merchantWallet);
      const account = await getAccount(this.connection, ata);
      return Number(account.amount) / 1e6;
    } catch {
      return 0;
    }
  }
  /**
   * Generate QR code for payment URL
   */
  async generateQRCode(url) {
    const encoded = encodeURIComponent(url);
    return `data:image/svg+xml,${encoded}`;
  }
  /**
   * Get the connection instance
   */
  getConnection() {
    return this.connection;
  }
  /**
   * Get merchant wallet address
   */
  getMerchantAddress() {
    return this.merchantWallet;
  }
  /**
   * Get USDC mint address
   */
  getUsdcMint() {
    return this.usdcMint;
  }
};

// src/react.tsx
import { createContext, useContext, useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { jsx } from "react/jsx-runtime";
var SettlrContext = createContext(null);
function SettlrProvider({ children, config }) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const settlr = useMemo(() => {
    return new Settlr({
      ...config,
      rpcEndpoint: connection.rpcEndpoint
    });
  }, [config, connection.rpcEndpoint]);
  const value = useMemo(
    () => ({
      settlr,
      connected: wallet.connected,
      createPayment: (options) => {
        return settlr.createPayment(options);
      },
      pay: async (options) => {
        if (!wallet.publicKey || !wallet.signTransaction) {
          return {
            success: false,
            signature: "",
            amount: options.amount,
            merchantAddress: settlr.getMerchantAddress().toBase58(),
            error: "Wallet not connected"
          };
        }
        return settlr.pay({
          wallet: {
            publicKey: wallet.publicKey,
            signTransaction: wallet.signTransaction
          },
          amount: options.amount,
          memo: options.memo
        });
      },
      getBalance: () => {
        return settlr.getMerchantBalance();
      }
    }),
    [settlr, wallet]
  );
  return /* @__PURE__ */ jsx(SettlrContext.Provider, { value, children });
}
function useSettlr() {
  const context = useContext(SettlrContext);
  if (!context) {
    throw new Error("useSettlr must be used within a SettlrProvider");
  }
  return context;
}

// src/components.tsx
import {
  useState,
  useCallback
} from "react";
import { Fragment, jsx as jsx2, jsxs } from "react/jsx-runtime";
var defaultStyles = {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontWeight: 600,
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "none",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  primary: {
    background: "linear-gradient(135deg, #f472b6 0%, #67e8f9 100%)",
    color: "white"
  },
  secondary: {
    background: "#12121a",
    color: "white",
    border: "1px solid rgba(255,255,255,0.1)"
  },
  outline: {
    background: "transparent",
    color: "#f472b6",
    border: "2px solid #f472b6"
  },
  sm: {
    padding: "8px 16px",
    fontSize: "14px"
  },
  md: {
    padding: "12px 24px",
    fontSize: "16px"
  },
  lg: {
    padding: "16px 32px",
    fontSize: "18px"
  },
  disabled: {
    opacity: 0.5,
    cursor: "not-allowed"
  },
  loading: {
    opacity: 0.8
  }
};
function BuyButton({
  amount,
  memo,
  orderId,
  children,
  onSuccess,
  onError,
  onProcessing,
  useRedirect = false,
  successUrl,
  cancelUrl,
  className,
  style,
  disabled = false,
  variant = "primary",
  size = "md"
}) {
  const { pay, createPayment, connected } = useSettlr();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle");
  const handleClick = useCallback(async () => {
    if (disabled || loading) return;
    setLoading(true);
    setStatus("processing");
    onProcessing?.();
    try {
      if (useRedirect) {
        const payment = await createPayment({
          amount,
          memo,
          orderId,
          successUrl,
          cancelUrl
        });
        window.location.href = payment.checkoutUrl;
      } else {
        const result = await pay({ amount, memo });
        if (result.success) {
          setStatus("success");
          onSuccess?.({
            signature: result.signature,
            amount: result.amount,
            merchantAddress: result.merchantAddress
          });
        } else {
          throw new Error(result.error || "Payment failed");
        }
      }
    } catch (error) {
      setStatus("error");
      onError?.(error instanceof Error ? error : new Error("Payment failed"));
    } finally {
      setLoading(false);
    }
  }, [
    amount,
    memo,
    orderId,
    disabled,
    loading,
    useRedirect,
    successUrl,
    cancelUrl,
    pay,
    createPayment,
    onSuccess,
    onError,
    onProcessing
  ]);
  const buttonStyle = {
    ...defaultStyles.base,
    ...defaultStyles[variant],
    ...defaultStyles[size],
    ...disabled ? defaultStyles.disabled : {},
    ...loading ? defaultStyles.loading : {},
    ...style
  };
  const buttonContent = loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx2(Spinner, {}),
    "Processing..."
  ] }) : children || `Pay $${amount.toFixed(2)}`;
  return /* @__PURE__ */ jsx2(
    "button",
    {
      onClick: handleClick,
      disabled: disabled || loading || !connected,
      className,
      style: buttonStyle,
      type: "button",
      children: !connected ? "Connect Wallet" : buttonContent
    }
  );
}
function Spinner() {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 16 16",
      fill: "none",
      style: { animation: "spin 1s linear infinite" },
      children: [
        /* @__PURE__ */ jsx2("style", { children: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }` }),
        /* @__PURE__ */ jsx2(
          "circle",
          {
            cx: "8",
            cy: "8",
            r: "6",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeDasharray: "32",
            strokeDashoffset: "12"
          }
        )
      ]
    }
  );
}
var widgetStyles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    borderRadius: "16px",
    overflow: "hidden",
    maxWidth: "400px",
    width: "100%"
  },
  containerDark: {
    background: "#12121a",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "white"
  },
  containerLight: {
    background: "white",
    border: "1px solid #e5e7eb",
    color: "#111827"
  },
  header: {
    padding: "24px",
    borderBottom: "1px solid rgba(255,255,255,0.1)"
  },
  productImage: {
    width: "64px",
    height: "64px",
    borderRadius: "12px",
    objectFit: "cover",
    marginBottom: "16px"
  },
  productName: {
    fontSize: "20px",
    fontWeight: 600,
    margin: "0 0 4px 0"
  },
  productDescription: {
    fontSize: "14px",
    opacity: 0.7,
    margin: 0
  },
  body: {
    padding: "24px"
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px"
  },
  label: {
    fontSize: "14px",
    opacity: 0.7
  },
  value: {
    fontSize: "14px",
    fontWeight: 500
  },
  total: {
    fontSize: "24px",
    fontWeight: 700
  },
  divider: {
    height: "1px",
    background: "rgba(255,255,255,0.1)",
    margin: "16px 0"
  },
  footer: {
    padding: "24px",
    paddingTop: "0"
  },
  branding: {
    textAlign: "center",
    fontSize: "12px",
    opacity: 0.5,
    marginTop: "16px"
  }
};
function CheckoutWidget({
  amount,
  productName,
  productDescription,
  productImage,
  merchantName,
  memo,
  orderId,
  onSuccess,
  onError,
  onCancel,
  className,
  style,
  theme = "dark",
  showBranding = true
}) {
  const { connected } = useSettlr();
  const [status, setStatus] = useState("idle");
  const containerStyle = {
    ...widgetStyles.container,
    ...theme === "dark" ? widgetStyles.containerDark : widgetStyles.containerLight,
    ...style
  };
  const dividerStyle = {
    ...widgetStyles.divider,
    background: theme === "dark" ? "rgba(255,255,255,0.1)" : "#e5e7eb"
  };
  return /* @__PURE__ */ jsxs("div", { className, style: containerStyle, children: [
    /* @__PURE__ */ jsxs("div", { style: widgetStyles.header, children: [
      productImage && /* @__PURE__ */ jsx2(
        "img",
        {
          src: productImage,
          alt: productName,
          style: widgetStyles.productImage
        }
      ),
      /* @__PURE__ */ jsx2("h2", { style: widgetStyles.productName, children: productName }),
      productDescription && /* @__PURE__ */ jsx2("p", { style: widgetStyles.productDescription, children: productDescription })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: widgetStyles.body, children: [
      /* @__PURE__ */ jsxs("div", { style: widgetStyles.row, children: [
        /* @__PURE__ */ jsx2("span", { style: widgetStyles.label, children: "Subtotal" }),
        /* @__PURE__ */ jsxs("span", { style: widgetStyles.value, children: [
          "$",
          amount.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: widgetStyles.row, children: [
        /* @__PURE__ */ jsx2("span", { style: widgetStyles.label, children: "Network Fee" }),
        /* @__PURE__ */ jsx2("span", { style: widgetStyles.value, children: "$0.01" })
      ] }),
      /* @__PURE__ */ jsx2("div", { style: dividerStyle }),
      /* @__PURE__ */ jsxs("div", { style: widgetStyles.row, children: [
        /* @__PURE__ */ jsx2("span", { style: widgetStyles.label, children: "Total" }),
        /* @__PURE__ */ jsxs("span", { style: widgetStyles.total, children: [
          "$",
          (amount + 0.01).toFixed(2),
          " USDC"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: widgetStyles.footer, children: [
      /* @__PURE__ */ jsx2(
        BuyButton,
        {
          amount,
          memo: memo || productName,
          orderId,
          onSuccess: (result) => {
            setStatus("success");
            onSuccess?.(result);
          },
          onError: (error) => {
            setStatus("error");
            onError?.(error);
          },
          onProcessing: () => setStatus("processing"),
          size: "lg",
          style: { width: "100%" },
          children: status === "success" ? "\u2713 Payment Complete" : status === "error" ? "Payment Failed - Retry" : `Pay $${(amount + 0.01).toFixed(2)} USDC`
        }
      ),
      showBranding && /* @__PURE__ */ jsxs("p", { style: widgetStyles.branding, children: [
        "Secured by ",
        /* @__PURE__ */ jsx2("strong", { children: "Settlr" }),
        " \u2022 Powered by Solana"
      ] })
    ] })
  ] });
}
function usePaymentLink(config) {
  const {
    merchantWallet,
    merchantName,
    baseUrl = "https://settlr.dev/pay"
  } = config;
  const generateLink = useCallback(
    (options) => {
      const params = new URLSearchParams({
        amount: options.amount.toString(),
        merchant: merchantName,
        to: merchantWallet
      });
      if (options.memo) params.set("memo", options.memo);
      if (options.orderId) params.set("orderId", options.orderId);
      if (options.successUrl) params.set("successUrl", options.successUrl);
      if (options.cancelUrl) params.set("cancelUrl", options.cancelUrl);
      return `${baseUrl}?${params.toString()}`;
    },
    [merchantWallet, merchantName, baseUrl]
  );
  const generateQRCode = useCallback(
    async (options) => {
      const link = generateLink(options);
      const qrUrl = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(
        link
      )}&choe=UTF-8`;
      return qrUrl;
    },
    [generateLink]
  );
  return {
    generateLink,
    generateQRCode
  };
}

// src/webhooks.ts
import crypto from "crypto";
function generateWebhookSignature(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}
function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = generateWebhookSignature(payload, secret);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}
function parseWebhookPayload(rawBody, signature, secret) {
  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    throw new Error("Invalid webhook signature");
  }
  const payload = JSON.parse(rawBody);
  return payload;
}
function createWebhookHandler(options) {
  const { secret, handlers, onError } = options;
  return async (req, res) => {
    try {
      let rawBody;
      if (typeof req.body === "string") {
        rawBody = req.body;
      } else if (Buffer.isBuffer(req.body)) {
        rawBody = req.body.toString("utf8");
      } else {
        rawBody = JSON.stringify(req.body);
      }
      const signature = req.headers["x-settlr-signature"];
      if (!signature) {
        res.status(400).json({ error: "Missing signature header" });
        return;
      }
      const event = parseWebhookPayload(rawBody, signature, secret);
      const handler = handlers[event.type];
      if (handler) {
        await handler(event);
      }
      res.status(200).json({ received: true });
    } catch (error) {
      if (onError && error instanceof Error) {
        onError(error);
      }
      if (error instanceof Error && error.message === "Invalid webhook signature") {
        res.status(401).json({ error: "Invalid signature" });
      } else {
        res.status(500).json({ error: "Webhook processing failed" });
      }
    }
  };
}
export {
  BuyButton,
  CheckoutWidget,
  SETTLR_CHECKOUT_URL,
  SUPPORTED_NETWORKS,
  Settlr,
  SettlrProvider,
  USDC_MINT_DEVNET,
  USDC_MINT_MAINNET,
  createWebhookHandler,
  formatUSDC,
  parseUSDC,
  parseWebhookPayload,
  shortenAddress,
  usePaymentLink,
  useSettlr,
  verifyWebhookSignature
};
