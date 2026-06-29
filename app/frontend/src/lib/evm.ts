/**
 * Lightweight EVM (Ethereum / Base) USDC payments for the checkout.
 *
 * Uses the buyer's injected EVM provider (MetaMask, Coinbase Wallet, etc.)
 * directly — no wagmi/RainbowKit dependency. The buyer pays USDC (an ERC-20
 * transfer) straight to the merchant's EVM address: self-custodial, no bridge,
 * no third party. USDC is 6 decimals on EVM chains, same as Solana.
 *
 * (Consolidating EVM receipts back to one chain via Circle CCTP is a later
 * enhancement; v1 settles to the merchant's wallet on the chain they were paid.)
 */

export interface EvmChain {
  key: "base" | "ethereum";
  chainId: number;
  hex: string;
  name: string;
  usdc: string;
  rpc: string;
  explorer: string;
}

export const EVM_CHAINS: Record<"base" | "ethereum", EvmChain> = {
  base: {
    key: "base",
    chainId: 8453,
    hex: "0x2105",
    name: "Base",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    rpc: "https://mainnet.base.org",
    explorer: "https://basescan.org",
  },
  ethereum: {
    key: "ethereum",
    chainId: 1,
    hex: "0x1",
    name: "Ethereum",
    usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    rpc: "https://eth.llamarpc.com",
    explorer: "https://etherscan.io",
  },
};

export function isEvmAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getEvmProvider(): any | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).ethereum || null;
}

export interface EvmWallet {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any;
}

// EIP-6963: wallets announce themselves so a dApp can let the user choose
// (instead of whichever extension grabbed window.ethereum). Phantom, MetaMask,
// Coinbase Wallet, Rabby, etc. all support it.
const announced: EvmWallet[] = [];
if (typeof window !== "undefined") {
  window.addEventListener(
    "eip6963:announceProvider",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any) => {
      const d = event?.detail;
      if (d?.info?.uuid && !announced.some((w) => w.uuid === d.info.uuid)) {
        announced.push({
          uuid: d.info.uuid,
          name: d.info.name,
          icon: d.info.icon,
          rdns: d.info.rdns,
          provider: d.provider,
        });
      }
    },
  );
}

/** Discover the EVM wallets installed in this browser (EIP-6963, with a
 * legacy window.ethereum fallback). */
export function getEvmWallets(): EvmWallet[] {
  if (typeof window === "undefined") return [];
  window.dispatchEvent(new Event("eip6963:requestProvider"));

  if (announced.length === 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eth = (window as any).ethereum;
    if (eth) {
      const providers = eth.providers || [eth];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      providers.forEach((p: any, i: number) => {
        const name = p.isMetaMask
          ? "MetaMask"
          : p.isCoinbaseWallet
            ? "Coinbase Wallet"
            : p.isPhantom
              ? "Phantom"
              : "Browser wallet";
        if (!announced.some((w) => w.name === name)) {
          announced.push({
            uuid: "legacy-" + i,
            name,
            icon: "",
            rdns: "",
            provider: p,
          });
        }
      });
    }
  }
  return [...announced];
}

/** ABI-encode ERC-20 transfer(address,uint256). */
function encodeTransfer(to: string, amountBaseUnits: bigint): string {
  const selector = "a9059cbb";
  const addr = to.toLowerCase().replace(/^0x/, "").padStart(64, "0");
  const amt = amountBaseUnits.toString(16).padStart(64, "0");
  return "0x" + selector + addr + amt;
}

/**
 * Send a USDC payment on the chosen EVM chain to `merchant`. Prompts the wallet
 * to connect and switch chains as needed. Returns the transaction hash.
 */
export async function payUsdcEvm(args: {
  chain: "base" | "ethereum";
  merchant: string;
  amountUsd: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider?: any;
}): Promise<{ txHash: string; from: string }> {
  const provider = args.provider || getEvmProvider();
  if (!provider) throw new Error("No Ethereum wallet found");
  if (!isEvmAddress(args.merchant)) {
    throw new Error("Merchant EVM address is invalid");
  }
  const c = EVM_CHAINS[args.chain];

  const accounts: string[] = await provider.request({
    method: "eth_requestAccounts",
  });
  const from = accounts?.[0];
  if (!from) throw new Error("No account connected");

  // Make sure the wallet is on the target chain.
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: c.hex }],
    });
  } catch (e) {
    // 4902 = chain not added to the wallet — add it, then it's selected.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((e as any)?.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: c.hex,
            chainName: c.name,
            rpcUrls: [c.rpc],
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            blockExplorerUrls: [c.explorer],
          },
        ],
      });
    } else {
      throw e;
    }
  }

  const amountBase = BigInt(Math.round(args.amountUsd * 1_000_000));
  const data = encodeTransfer(args.merchant, amountBase);
  const txHash: string = await provider.request({
    method: "eth_sendTransaction",
    params: [{ from, to: c.usdc, data }],
  });
  return { txHash, from };
}

/** Poll for the transaction receipt; resolves true on success. */
export async function waitForEvmReceipt(
  txHash: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider?: any,
  timeoutMs = 120_000,
): Promise<boolean> {
  provider = provider || getEvmProvider();
  if (!provider) return false;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await provider.request({
        method: "eth_getTransactionReceipt",
        params: [txHash],
      });
      if (r) return r.status === "0x1";
    } catch {
      /* keep polling */
    }
    await new Promise((res) => setTimeout(res, 2500));
  }
  return false;
}
