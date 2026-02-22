"use client";

import { motion } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Info,
} from "lucide-react";
import { useState } from "react";

interface PrivacyBadgeProps {
  isPrivate: boolean;
  encryptedHandle?: string;
  decryptedAmount?: string;
  canDecrypt?: boolean;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export function PrivacyBadge({
  isPrivate,
  encryptedHandle,
  decryptedAmount,
  canDecrypt = false,
  size = "md",
  showTooltip = true,
}: PrivacyBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const handleDecrypt = async () => {
    if (!canDecrypt || revealed) return;

    setIsDecrypting(true);
    // Simulate PER TEE decryption (permissioned access)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRevealed(true);
    setIsDecrypting(false);
  };

  if (!isPrivate) {
    return (
      <span
        className={`inline-flex items-center ${sizeClasses[size]} rounded-full bg-white/[0.06] text-white/50`}
      >
        <Eye size={iconSizes[size]} />
        <span>Public</span>
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <motion.button
        onClick={() => showTooltip && setShowDetails(!showDetails)}
        className={`inline-flex items-center ${sizeClasses[size]} rounded-full bg-[#a78bfa]/15 border border-[#a78bfa]/30 text-[#a78bfa] cursor-pointer hover:border-[#a78bfa]/50 transition-colors`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <ShieldCheck size={iconSizes[size]} className="text-[#a78bfa]" />
        <span>PER Private</span>
        {showTooltip && (
          <Info size={iconSizes[size] - 2} className="opacity-50" />
        )}
      </motion.button>

      {/* Tooltip/Details Panel */}
      {showDetails && showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 mt-2 z-50 w-80 p-4 rounded-lg bg-[#050507]/95 border border-[#a78bfa]/20 shadow-xl backdrop-blur-sm"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#a78bfa] font-medium">
              <Shield size={16} />
              MagicBlock PER Privacy
            </div>

            <p className="text-xs text-white/50">
              This transaction uses Fully Homomorphic Encryption. The amount is
              encrypted on-chain and only visible to authorized parties.
            </p>

            {encryptedHandle && (
              <div className="space-y-1">
                <div className="text-xs text-white/40">
                  Encrypted Handle (on-chain):
                </div>
                <code className="block text-xs bg-black/50 rounded p-2 text-cyan-400 font-mono break-all">
                  {encryptedHandle.length > 32
                    ? `${encryptedHandle.slice(
                        0,
                        16,
                      )}...${encryptedHandle.slice(-16)}`
                    : encryptedHandle}
                </code>
              </div>
            )}

            {canDecrypt && (
              <div className="pt-2 border-t border-white/[0.06]">
                {revealed ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50">
                      Decrypted Amount:
                    </span>
                    <span className="text-green-400 font-mono font-medium">
                      {decryptedAmount}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleDecrypt}
                    disabled={isDecrypting}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded bg-[#a78bfa]/15 border border-[#a78bfa]/30 text-[#a78bfa] text-xs hover:bg-[#a78bfa]/25 transition-colors disabled:opacity-50"
                  >
                    {isDecrypting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Unlock size={12} />
                        </motion.div>
                        Decrypting via PER...
                      </>
                    ) : (
                      <>
                        <Lock size={12} />
                        Decrypt with Wallet
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {!canDecrypt && (
              <div className="flex items-center gap-2 text-xs text-white/40 pt-2 border-t border-white/[0.06]">
                <EyeOff size={12} />
                You don&apos;t have decryption access
              </div>
            )}

            <a
              href="https://docs.magicblock.gg/pages/private-ephemeral-rollups-pers/introduction/onchain-privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-[#a78bfa] hover:text-[#a78bfa]/80"
            >
              Learn about PER privacy →
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Visual comparison component for demos
interface PrivacyComparisonProps {
  publicAmount: string;
  privateHandle: string;
  decryptedAmount?: string;
}

export function PrivacyComparison({
  publicAmount,
  privateHandle,
  decryptedAmount,
}: PrivacyComparisonProps) {
  const [showDecrypted, setShowDecrypted] = useState(false);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Public Transaction */}
      <div className="p-4 rounded-lg bg-white/[0.04] border border-white/[0.06]">
        <div className="flex items-center gap-2 mb-3 text-white/70 font-medium">
          <Eye size={16} />
          Regular Payment
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/40">Amount:</span>
            <span className="text-green-400 font-mono">{publicAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Visibility:</span>
            <span className="text-yellow-400">Anyone on explorer</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/[0.06] text-xs text-white/40">
          ⚠️ Amount visible to everyone on Solscan/Explorer
        </div>
      </div>

      {/* Private Transaction */}
      <div className="p-4 rounded-lg bg-[#a78bfa]/[0.06] border border-[#a78bfa]/20">
        <div className="flex items-center gap-2 mb-3 text-[#a78bfa] font-medium">
          <ShieldCheck size={16} />
          Private Receipt (PER)
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-start">
            <span className="text-white/40">On-chain:</span>
            <code className="text-cyan-400 font-mono text-xs max-w-[140px] truncate">
              {privateHandle}
            </code>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Visibility:</span>
            <span className="text-[#a78bfa]">Only you & merchant</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[#a78bfa]/20">
          {showDecrypted ? (
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/50">Decrypted:</span>
              <span className="text-green-400 font-mono">
                {decryptedAmount || publicAmount}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setShowDecrypted(true)}
              className="w-full text-xs py-1.5 rounded bg-[#a78bfa]/15 text-[#a78bfa] hover:bg-[#a78bfa]/25 transition-colors"
            >
              🔓 Simulate Decrypt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Explorer preview showing what the account looks like
export function ExplorerPreview({
  isPrivate,
  amount,
  encryptedHandle,
}: {
  isPrivate: boolean;
  amount: string;
  encryptedHandle?: string;
}) {
  return (
    <div className="rounded-lg bg-[#0d0d14] border border-white/[0.06] overflow-hidden">
      {/* Mock explorer header */}
      <div className="px-4 py-2 bg-white/[0.04] border-b border-white/[0.06] flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-white/50 ml-2">
          {isPrivate
            ? "solscan.io/account/PrivateReceipt..."
            : "solscan.io/account/PaymentReceipt..."}
        </span>
      </div>

      {/* Account data preview */}
      <div className="p-4 font-mono text-xs space-y-2">
        <div className="text-white/40">// Account Data</div>
        <div className="pl-2 space-y-1">
          {isPrivate ? (
            <>
              <div>
                <span className="text-[#a78bfa]">encrypted_amount_handle</span>
                <span className="text-white/40">: </span>
                <span className="text-cyan-400">
                  {encryptedHandle || "0x7a3f...9bc2"}
                </span>
              </div>
              <div>
                <span className="text-[#a78bfa]">customer</span>
                <span className="text-white/40">: </span>
                <span className="text-blue-400">&quot;8xPb...7Kq&quot;</span>
              </div>
              <div>
                <span className="text-[#a78bfa]">merchant</span>
                <span className="text-white/40">: </span>
                <span className="text-blue-400">&quot;3nKq...2Rm&quot;</span>
              </div>
              <div className="text-white/30 italic mt-2">
                // Amount hidden - only handles visible
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="text-green-400">amount</span>
                <span className="text-white/40">: </span>
                <span className="text-yellow-400">{amount}</span>
                <span className="text-white/40"> // Visible to everyone!</span>
              </div>
              <div>
                <span className="text-green-400">customer</span>
                <span className="text-white/40">: </span>
                <span className="text-blue-400">&quot;8xPb...7Kq&quot;</span>
              </div>
              <div>
                <span className="text-green-400">merchant</span>
                <span className="text-white/40">: </span>
                <span className="text-blue-400">&quot;3nKq...2Rm&quot;</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
