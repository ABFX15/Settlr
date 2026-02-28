"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Highlight } from "prism-react-renderer";
import {
  Play,
  Copy,
  Check,
  RotateCcw,
  ChevronDown,
  Loader2,
  CheckCircle2,
  X,
  Zap,
  CreditCard,
  Wallet,
} from "lucide-react";

// Dracula Soft theme - softer version of Dracula colors
const draculaSoft = {
  plain: {
    color: "#f8f8f2",
    backgroundColor: "#0d0d14",
  },
  styles: [
    {
      types: ["prolog", "constant", "builtin"],
      style: { color: "#bd93f9" }, // Purple
    },
    {
      types: ["inserted", "function"],
      style: { color: "#50fa7b" }, // Green
    },
    {
      types: ["deleted"],
      style: { color: "#ff5555" }, // Red
    },
    {
      types: ["changed"],
      style: { color: "#ffb86c" }, // Orange
    },
    {
      types: ["punctuation", "symbol"],
      style: { color: "#f8f8f2" }, // White
    },
    {
      types: ["string", "char", "tag", "selector"],
      style: { color: "#f1fa8c" }, // Yellow
    },
    {
      types: ["keyword", "variable"],
      style: { color: "#ff79c6" }, // Pink
    },
    {
      types: ["comment"],
      style: { color: "#6272a4", fontStyle: "italic" as const }, // Comment gray
    },
    {
      types: ["attr-name"],
      style: { color: "#50fa7b" }, // Green for attributes
    },
    {
      types: ["attr-value", "template-string"],
      style: { color: "#f1fa8c" }, // Yellow
    },
    {
      types: ["number", "boolean"],
      style: { color: "#bd93f9" }, // Purple for numbers
    },
    {
      types: ["class-name", "maybe-class-name"],
      style: { color: "#8be9fd" }, // Cyan for class names
    },
    {
      types: ["imports", "exports"],
      style: { color: "#ff79c6" }, // Pink
    },
    {
      types: ["operator"],
      style: { color: "#ff79c6" }, // Pink
    },
    {
      types: ["property"],
      style: { color: "#50fa7b" }, // Green
    },
    {
      types: ["regex"],
      style: { color: "#ff5555" }, // Red
    },
  ],
};

// Pre-built examples
const examples = [
  {
    id: "simple",
    name: "Simple Payment",
    description: "Basic payment button",
    code: `<SettlrCheckout
  amount={9.99}
  memo="Coffee Order"
  onSuccess={(tx) => console.log('Paid!', tx)}
/>`,
  },
  {
    id: "custom-button",
    name: "Custom Button",
    description: "Styled payment button",
    code: `<SettlrCheckout
  amount={49.99}
  memo="Pro Subscription"
  buttonText="Subscribe Now"
  buttonStyle={{
    background: 'linear-gradient(to right, #a855f7, #22d3ee)',
    padding: '16px 32px',
    borderRadius: '12px',
    fontSize: '18px'
  }}
  onSuccess={(tx) => alert('Welcome to Pro!')}
/>`,
  },
  {
    id: "dynamic",
    name: "Dynamic Amount",
    description: "Cart total checkout",
    code: `const cartTotal = 129.99;
const orderId = 'ORD-' + Date.now();

<SettlrCheckout
  amount={cartTotal}
  memo={\`Order \${orderId}\`}
  metadata={{ orderId, items: 3 }}
  onSuccess={async (tx) => {
    await saveOrder(orderId, tx.signature);
    router.push('/success');
  }}
  onError={(err) => toast.error(err.message)}
/>`,
  },
  {
    id: "subscription",
    name: "Subscription",
    description: "Recurring payment setup",
    code: `<SettlrCheckout
  amount={19.99}
  memo="Monthly Plan"
  recurring={{
    interval: 'monthly',
    startDate: new Date()
  }}
  buttonText="Start Subscription"
  onSuccess={(tx) => {
    console.log('Subscription started!');
    console.log('Tx:', tx.signature);
  }}
/>`,
  },
];

interface PlaygroundProps {
  defaultCode?: string;
  showExamples?: boolean;
}

export function InteractivePlayground({
  defaultCode = examples[0].code,
  showExamples = true,
}: PlaygroundProps) {
  const [code, setCode] = useState(defaultCode);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<
    "idle" | "email" | "payment" | "processing" | "success"
  >("idle");
  const [selectedExample, setSelectedExample] = useState(examples[0]);
  const [showExampleDropdown, setShowExampleDropdown] = useState(false);

  // Parse amount from code
  const parseAmount = () => {
    // First try direct number: amount={9.99} or amount: 9.99
    const directMatch = code.match(/amount[=:]\s*\{?\s*(\d+\.?\d*)/);
    if (directMatch && directMatch[1]) {
      return parseFloat(directMatch[1]);
    }

    // Check if amount uses a variable like amount={cartTotal}
    const varMatch = code.match(
      /amount[=:]\s*\{?\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}?/,
    );
    if (varMatch && varMatch[1]) {
      const varName = varMatch[1];
      // Look for the variable assignment: const cartTotal = 129.99 or let cartTotal = 129.99
      const varValueMatch = code.match(
        new RegExp(`(?:const|let|var)\\s+${varName}\\s*=\\s*(\\d+\\.?\\d*)`),
      );
      if (varValueMatch && varValueMatch[1]) {
        return parseFloat(varValueMatch[1]);
      }
    }

    return 9.99;
  };

  // Parse memo from code
  const parseMemo = () => {
    const match = code.match(/memo[=:]\s*["'`]([^"'`]+)["'`]/);
    return match ? match[1] : "Payment";
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(selectedExample.code);
    setShowPreview(false);
    setCheckoutStep("idle");
  };

  const handleRun = () => {
    setIsRunning(true);
    setShowPreview(true);
    setCheckoutStep("idle");
    setTimeout(() => setIsRunning(false), 500);
  };

  const handleLoadExample = (example: (typeof examples)[0]) => {
    setSelectedExample(example);
    setCode(example.code);
    setShowExampleDropdown(false);
    setShowPreview(false);
    setCheckoutStep("idle");
  };

  const simulateCheckout = () => {
    setCheckoutStep("email");
  };

  const simulatePayment = () => {
    setCheckoutStep("payment");
  };

  const simulateProcess = () => {
    setCheckoutStep("processing");
    setTimeout(() => {
      setCheckoutStep("success");
    }, 2000);
  };

  return (
    <div className="rounded-2xl border border-[#E2E2D1] bg-[#0d0d14] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E2D1] bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/60" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
            <div className="h-3 w-3 rounded-full bg-[#1B6B4A]/60" />
          </div>
          <span className="text-sm font-medium text-[#3B4963]">
            Interactive Playground
          </span>
        </div>

        {/* Example Selector */}
        {showExamples && (
          <div className="relative">
            <button
              onClick={() => setShowExampleDropdown(!showExampleDropdown)}
              className="flex items-center gap-2 rounded-lg border border-[#E2E2D1] bg-[#F5F5F5] px-3 py-1.5 text-sm text-[#0C1829] transition-colors hover:bg-[#F5F5F5]"
            >
              <span>{selectedExample.name}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  showExampleDropdown ? "rotate-180" : ""
                }`}
              />
            </button>
            <AnimatePresence>
              {showExampleDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[#E2E2D1] bg-[#12121a] p-2 shadow-xl"
                >
                  {examples.map((example) => (
                    <button
                      key={example.id}
                      onClick={() => handleLoadExample(example)}
                      className={`flex w-full flex-col items-start rounded-lg px-3 py-2 text-left transition-colors ${
                        selectedExample.id === example.id
                          ? "bg-[#1B6B4A]/10 text-[#155939]"
                          : "text-[#3B4963] hover:bg-[#F5F5F5] hover:text-[#0C1829]"
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {example.name}
                      </span>
                      <span className="text-xs text-[#7C8A9E]">
                        {example.description}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2">
        {/* Code Editor */}
        <div className="border-b border-[#E2E2D1] lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-[#E2E2D1] px-4 py-2">
            <span className="text-xs font-medium text-[#7C8A9E]">
              component.tsx
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="rounded p-1.5 text-[#7C8A9E] transition-colors hover:bg-[#F5F5F5] hover:text-[#0C1829]"
                title="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={handleCopy}
                className="rounded p-1.5 text-[#7C8A9E] transition-colors hover:bg-[#F5F5F5] hover:text-[#0C1829]"
                title="Copy"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-[#155939]" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="relative h-64 overflow-auto">
            {/* Syntax Highlighted Code Display */}
            <Highlight theme={draculaSoft} code={code} language="tsx">
              {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre
                  className="absolute inset-0 m-0 overflow-auto p-4 font-mono text-sm"
                  style={{
                    ...style,
                    lineHeight: "1.6",
                    backgroundColor: "transparent",
                  }}
                >
                  {tokens.map((line, i) => (
                    <div
                      key={i}
                      {...getLineProps({ line })}
                      className="table-row"
                    >
                      <span
                        className="table-cell select-none pr-4 text-right text-[#7C8A9E]/60 text-xs"
                        style={{ width: "2rem" }}
                      >
                        {i + 1}
                      </span>
                      <span className="table-cell">
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token })} />
                        ))}
                      </span>
                    </div>
                  ))}
                </pre>
              )}
            </Highlight>
            {/* Hidden textarea for editing */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="absolute inset-0 h-full w-full resize-none bg-transparent p-4 pl-12 font-mono text-sm text-transparent caret-white outline-none"
              style={{
                lineHeight: "1.6",
                tabSize: 2,
                caretColor: "white",
              }}
            />
          </div>
          {/* Action Bar */}
          <div className="flex items-center justify-between border-t border-[#E2E2D1] px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-[#7C8A9E]">
              <Zap className="h-3 w-3 text-yellow-400" />
              <span>Devnet Mode</span>
            </div>
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0C1829] shadow-lg shadow-[#0C1829]/5 transition-all hover:shadow-[#0C1829]/5 disabled:opacity-50"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Try It
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-[#08080c]">
          <div className="flex items-center justify-between border-b border-[#E2E2D1] px-4 py-2">
            <span className="text-xs font-medium text-[#7C8A9E]">Preview</span>
            {showPreview && (
              <button
                onClick={() => {
                  setShowPreview(false);
                  setCheckoutStep("idle");
                }}
                className="rounded p-1 text-[#7C8A9E] transition-colors hover:bg-[#F5F5F5] hover:text-[#0C1829]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex h-64 items-center justify-center p-4">
            <AnimatePresence mode="wait">
              {!showPreview ? (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-[#7C8A9E]"
                >
                  <Play className="mx-auto mb-3 h-8 w-8" />
                  <p className="text-sm">Click "Try It" to see the preview</p>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-xs"
                >
                  <CheckoutSimulator
                    amount={parseAmount()}
                    memo={parseMemo()}
                    step={checkoutStep}
                    onStartCheckout={simulateCheckout}
                    onEnterEmail={simulatePayment}
                    onConfirmPayment={simulateProcess}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#E2E2D1] bg-white px-4 py-3">
        <div className="flex items-center justify-between text-xs text-[#7C8A9E]">
          <span>💡 Edit the code above and click "Try It" to see changes</span>
          <a
            href="/demo"
            className="text-[#155939] transition-colors hover:text-[#155939]/80"
          >
            Try with real payments →
          </a>
        </div>
      </div>
    </div>
  );
}

// Checkout simulator component
function CheckoutSimulator({
  amount,
  memo,
  step,
  onStartCheckout,
  onEnterEmail,
  onConfirmPayment,
}: {
  amount: number;
  memo: string;
  step: "idle" | "email" | "payment" | "processing" | "success";
  onStartCheckout: () => void;
  onEnterEmail: () => void;
  onConfirmPayment: () => void;
}) {
  const [email, setEmail] = useState("");

  if (step === "idle") {
    return (
      <button
        onClick={onStartCheckout}
        className="w-full rounded-xl bg-white py-4 text-lg font-semibold text-[#0C1829] shadow-lg shadow-[#0C1829]/5 transition-all hover:shadow-[#0C1829]/5"
      >
        Pay ${amount.toFixed(2)}
      </button>
    );
  }

  if (step === "email") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-4 rounded-xl border border-[#E2E2D1] bg-[#12121a] p-4"
      >
        <div className="text-center">
          <p className="text-lg font-semibold text-[#0C1829]">
            ${amount.toFixed(2)}
          </p>
          <p className="text-sm text-[#7C8A9E]">{memo}</p>
        </div>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-[#E2E2D1] bg-[#F5F5F5] px-4 py-3 text-[#0C1829] placeholder:text-[#7C8A9E] focus:border-purple-500/50 focus:outline-none"
        />
        <button
          onClick={onEnterEmail}
          className="w-full rounded-lg bg-purple-500 py-3 font-semibold text-white transition-colors hover:bg-[#1B6B4A]"
        >
          Continue
        </button>
      </motion.div>
    );
  }

  if (step === "payment") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-3 rounded-xl border border-[#E2E2D1] bg-[#12121a] p-4"
      >
        <div className="text-center">
          <p className="text-lg font-semibold text-[#0C1829]">
            ${amount.toFixed(2)}
          </p>
          <p className="text-sm text-[#7C8A9E]">{memo}</p>
        </div>
        <div className="space-y-2">
          <button
            onClick={onConfirmPayment}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#512da8] py-3 font-semibold text-[#0C1829] transition-colors hover:bg-[#5e35b1]"
          >
            <Wallet className="h-5 w-5" />
            Pay with Wallet
          </button>
          <button
            onClick={onConfirmPayment}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E2E2D1] py-3 font-semibold text-[#0C1829] transition-colors hover:bg-[#F5F5F5]"
          >
            <CreditCard className="h-5 w-5" />
            Pay with Card
          </button>
        </div>
      </motion.div>
    );
  }

  if (step === "processing") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full space-y-4 rounded-xl border border-[#E2E2D1] bg-[#12121a] p-6 text-center"
      >
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#1B6B4A]" />
        <div>
          <p className="font-semibold text-[#0C1829]">Processing Payment</p>
          <p className="text-sm text-[#7C8A9E]">Confirming on Solana...</p>
        </div>
      </motion.div>
    );
  }

  if (step === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full space-y-4 rounded-xl border border-[#1B6B4A]/20 bg-[#1B6B4A]/5 p-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <CheckCircle2 className="mx-auto h-12 w-12 text-[#1B6B4A]" />
        </motion.div>
        <div>
          <p className="font-semibold text-[#0C1829]">Payment Successful!</p>
          <p className="text-sm text-[#7C8A9E]">
            ${amount.toFixed(2)} • {memo}
          </p>
        </div>
        <div className="rounded-lg bg-white/20 px-3 py-2 font-mono text-xs text-[#155939]">
          tx: 5Kj2...x8mN
        </div>
      </motion.div>
    );
  }

  return null;
}
