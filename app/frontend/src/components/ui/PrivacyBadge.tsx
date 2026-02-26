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
        className={`inline-flex items-center ${sizeClasses[size]} rounded-full bg-[#F5F5F5] text-[#94A3B8]`}
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
        className={`inline-flex items-center ${sizeClasses[size]} rounded-full bg-[#10B981]/15 border border-[#a78bfa]/30 text-[#059669] cursor-pointer hover:border-[#a78bfa]/50 transition-colors`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <ShieldCheck size={iconSizes[size]} className="text-[#059669]" />
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
          className="absolute top-full left-0 mt-2 z-50 w-80 p-4 rounded-lg bg-white/95 border border-[#a78bfa]/20 shadow-xl backdrop-blur-sm"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#059669] font-medium">
              <Shield size={16} />
              MagicBlock PER Privacy
            </div>

            <p className="text-xs text-[#94A3B8]">
              This transaction uses Fully Homomorphic Encryption. The amount is
              encrypted on-chain and only visible to authorized parties.
            </p>

            {encryptedHandle && (
              <div className="space-y-1">
                <div className="text-xs text-[#94A3B8]">
                  Encrypted Handle (on-chain):
                </div>
                <code className="block text-xs bg-white/50 rounded p-2 text-cyan-400 font-mono break-all">
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
              <div className="pt-2 border-t border-[#E5E7EB]">
                {revealed ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#94A3B8]">
                      Decrypted Amount:
                    </span>
                    <span className="text-[#059669] font-mono font-medium">
                      {decryptedAmount}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleDecrypt}
                    disabled={isDecrypting}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded bg-[#10B981]/15 border border-[#a78bfa]/30 text-[#059669] text-xs hover:bg-[#10B981]/25 transition-colors disabled:opacity-50"
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
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] pt-2 border-t border-[#E5E7EB]">
                <EyeOff size={12} />
                You don&apos;t have decryption access
              </div>
            )}

            <a
              href="https://docs.magicblock.gg/pages/private-ephemeral-rollups-pers/introduction/onchain-privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-[#059669] hover:text-[#059669]/80"
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
      <div className="p-4 rounded-lg bg-[#F5F5F5] border border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-3 text-[#4A5568] font-medium">
          <Eye size={16} />
          Regular Payment
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#94A3B8]">Amount:</span>
            <span className="text-[#059669] font-mono">{publicAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#94A3B8]">Visibility:</span>
            <span className="text-yellow-400">Anyone on explorer</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[#E5E7EB] text-xs text-[#94A3B8]">
          ⚠️ Amount visible to everyone on Solscan/Explorer
        </div>
      </div>

      {/* Private Transaction */}
      <div className="p-4 rounded-lg bg-[#10B981]/[0.06] border border-[#a78bfa]/20">
        <div className="flex items-center gap-2 mb-3 text-[#059669] font-medium">
          <ShieldCheck size={16} />
          Private Receipt (PER)
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-start">
            <span className="text-[#94A3B8]">On-chain:</span>
            <code className="text-cyan-400 font-mono text-xs max-w-[140px] truncate">
              {privateHandle}
            </code>
          </div>
          <div className="flex justify-between">
            <span className="text-[#94A3B8]">Visibility:</span>
            <span className="text-[#059669]">Only you & merchant</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[#a78bfa]/20">
          {showDecrypted ? (
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#94A3B8]">Decrypted:</span>
              <span className="text-[#059669] font-mono">
                {decryptedAmount || publicAmount}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setShowDecrypted(true)}
              className="w-full text-xs py-1.5 rounded bg-[#10B981]/15 text-[#059669] hover:bg-[#10B981]/25 transition-colors"
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
    <div className="rounded-lg bg-[#0d0d14] border border-[#E5E7EB] overflow-hidden">
      {/* Mock explorer header */}
      <div className="px-4 py-2 bg-[#F5F5F5] border-b border-[#E5E7EB] flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-[#10B981]/80" />
        </div>
        <span className="text-xs text-[#94A3B8] ml-2">
          {isPrivate
            ? "solscan.io/account/PrivateReceipt..."
            : "solscan.io/account/PaymentReceipt..."}
        </span>
      </div>

      {/* Account data preview */}
      <div className="p-4 font-mono text-xs space-y-2">
        <div className="text-[#94A3B8]">// Account Data</div>
        <div className="pl-2 space-y-1">
          {isPrivate ? (
            <>
              <div>
                <span className="text-[#059669]">encrypted_amount_handle</span>
                <span className="text-[#94A3B8]">: </span>
                <span className="text-cyan-400">
                  {encryptedHandle || "0x7a3f...9bc2"}
                </span>
              </div>
              <div>
                <span className="text-[#059669]">customer</span>
                <span className="text-[#94A3B8]">: </span>
                <span className="text-[#059669]">&quot;8xPb...7Kq&quot;</span>
              </div>
              <div>
                <span className="text-[#059669]">merchant</span>
                <span className="text-[#94A3B8]">: </span>
                <span className="text-[#059669]">&quot;3nKq...2Rm&quot;</span>
              </div>
              <div className="text-[#94A3B8] italic mt-2">
                // Amount hidden - only handles visible
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="text-[#059669]">amount</span>
                <span className="text-[#94A3B8]">: </span>
                <span className="text-yellow-400">{amount}</span>
                <span className="text-[#94A3B8]"> // Visible to everyone!</span>
              </div>
              <div>
                <span className="text-[#059669]">customer</span>
                <span className="text-[#94A3B8]">: </span>
                <span className="text-[#059669]">&quot;8xPb...7Kq&quot;</span>
              </div>
              <div>
                <span className="text-[#059669]">merchant</span>
                <span className="text-[#94A3B8]">: </span>
                <span className="text-[#059669]">&quot;3nKq...2Rm&quot;</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
