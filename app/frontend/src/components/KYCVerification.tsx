"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";

interface KYCVerificationProps {
  userId: string; // wallet address or email
  onVerified?: () => void;
  onError?: (error: string) => void;
  level?: "basic-kyc-level" | "gaming-kyc-level" | "enhanced-kyc-level";
}

type KYCStatus =
  | "loading"
  | "verified"
  | "not_started"
  | "pending"
  | "rejected"
  | "error";

export function KYCVerification({
  userId,
  onVerified,
  onError,
  level = "basic-kyc-level",
}: KYCVerificationProps) {
  const [status, setStatus] = useState<KYCStatus>("loading");
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [showSDK, setShowSDK] = useState(false);

  // Check current verification status
  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/kyc/status?userId=${encodeURIComponent(userId)}`
      );
      const data = await res.json();

      if (data.verified) {
        setStatus("verified");
        onVerified?.();
      } else if (data.status === "pending") {
        setStatus("pending");
      } else if (data.status === "rejected") {
        setStatus("rejected");
      } else {
        setStatus("not_started");
      }
    } catch (err) {
      console.error("Failed to check KYC status:", err);
      setStatus("error");
      onError?.("Failed to check verification status");
    }
  }, [userId, onVerified, onError]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Load Sumsub WebSDK
  useEffect(() => {
    if (typeof window !== "undefined" && !sdkLoaded) {
      const script = document.createElement("script");
      script.src =
        "https://static.sumsub.com/idensic/static/sns-websdk-builder.js";
      script.async = true;
      script.onload = () => setSdkLoaded(true);
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [sdkLoaded]);

  // Initialize Sumsub SDK
  const startVerification = async () => {
    if (!sdkLoaded) {
      onError?.("Verification SDK not loaded");
      return;
    }

    try {
      // Get access token from our API
      const res = await fetch("/api/kyc/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, level }),
      });

      if (!res.ok) {
        throw new Error("Failed to get verification token");
      }

      const { token } = await res.json();

      // Initialize Sumsub WebSDK
      const snsWebSdkInstance = (window as any).snsWebSdk
        .init(token, () => getNewAccessToken())
        .withConf({
          lang: "en",
          theme: "dark",
        })
        .withOptions({
          addViewportTag: false,
          adaptIframeHeight: true,
        })
        .on("idCheck.onStepCompleted", (payload: any) => {
          console.log("Step completed:", payload);
        })
        .on("idCheck.onError", (error: any) => {
          console.error("Verification error:", error);
          onError?.(error.message || "Verification failed");
        })
        .on("idCheck.applicantStatus", (payload: any) => {
          console.log("Applicant status:", payload);
          if (payload.reviewStatus === "completed") {
            if (payload.reviewResult?.reviewAnswer === "GREEN") {
              setStatus("verified");
              setShowSDK(false);
              onVerified?.();
            } else {
              setStatus("rejected");
              setShowSDK(false);
            }
          }
        })
        .build();

      snsWebSdkInstance.launch("#sumsub-websdk-container");
      setShowSDK(true);
    } catch (err) {
      console.error("Failed to start verification:", err);
      onError?.("Failed to start verification");
    }
  };

  // Get new token if expired
  const getNewAccessToken = async () => {
    const res = await fetch("/api/kyc/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, level }),
    });
    const { token } = await res.json();
    return token;
  };

  // Render based on status
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (status === "verified") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center"
      >
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-400" />
        <h3 className="text-lg font-semibold text-white">Identity Verified</h3>
        <p className="mt-1 text-sm text-gray-400">
          Your identity has been verified successfully
        </p>
      </motion.div>
    );
  }

  if (status === "pending") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-center"
      >
        <Clock className="mx-auto mb-3 h-12 w-12 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">
          Verification Pending
        </h3>
        <p className="mt-1 text-sm text-gray-400">
          We're reviewing your documents. This usually takes a few minutes.
        </p>
        <button
          onClick={checkStatus}
          className="mt-4 text-sm text-yellow-400 hover:underline"
        >
          Check status
        </button>
      </motion.div>
    );
  }

  if (status === "rejected") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center"
      >
        <XCircle className="mx-auto mb-3 h-12 w-12 text-red-400" />
        <h3 className="text-lg font-semibold text-white">
          Verification Failed
        </h3>
        <p className="mt-1 text-sm text-gray-400">
          We couldn't verify your identity. Please try again with clear
          documents.
        </p>
        <button
          onClick={startVerification}
          className="mt-4 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/30"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  if (status === "error") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center"
      >
        <AlertCircle className="mx-auto mb-3 h-12 w-12 text-red-400" />
        <h3 className="text-lg font-semibold text-white">Error</h3>
        <p className="mt-1 text-sm text-gray-400">
          Something went wrong. Please try again.
        </p>
        <button
          onClick={checkStatus}
          className="mt-4 text-sm text-purple-400 hover:underline"
        >
          Retry
        </button>
      </motion.div>
    );
  }

  // Not started - show start verification UI
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-6"
    >
      {showSDK ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Identity Verification
            </h3>
            <button
              onClick={() => setShowSDK(false)}
              className="text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
          <div
            id="sumsub-websdk-container"
            className="min-h-[500px] rounded-lg bg-[#0a0a0f]"
          />
        </div>
      ) : (
        <div className="text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">
            Identity Verification Required
          </h3>
          <p className="mt-2 text-sm text-gray-400">
            To continue, we need to verify your identity. This helps keep
            everyone safe and complies with regulations.
          </p>
          <ul className="mt-4 space-y-2 text-left text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span>Government-issued ID (passport, driver's license)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span>A selfie for facial verification</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span>Takes about 2 minutes</span>
            </li>
          </ul>
          <button
            onClick={startVerification}
            disabled={!sdkLoaded}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#a855f7] to-[#22d3ee] px-6 py-3 font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
          >
            {sdkLoaded ? "Start Verification" : "Loading..."}
          </button>
          <p className="mt-3 text-xs text-gray-500">
            Powered by Sumsub. Your data is encrypted and secure.
          </p>
        </div>
      )}
    </motion.div>
  );
}
