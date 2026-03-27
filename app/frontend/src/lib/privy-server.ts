/**
 * Privy Server-Side SDK Utilities (DISABLED)
 *
 * Privy has been removed. These stubs exist so API routes that import
 * from this module still compile without errors.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getPrivyClient(): any {
    throw new Error("Privy has been removed. Use wallet-adapter instead.");
}

export function isPrivyGaslessEnabled(): boolean {
    return false;
}

export function getFeePayerWalletId(): string | undefined {
    return undefined;
}

export function getFeePayerAddress(): string | undefined {
    return undefined;
}

export async function sponsorAndSendTransaction(_params: {
    serializedTransaction: string;
    isMainnet?: boolean;
}): Promise<{ hash: string }> {
    throw new Error("Privy gasless has been removed.");
}

export async function createFeePayerWallet(): Promise<{ id: string; address: string }> {
    throw new Error("Privy has been removed.");
}

/**
 * Get wallet info from the API
 */
export async function getWallet(walletId: string) {
    const client = getPrivyClient();
    return client.walletApi.getWallet({ id: walletId });
}
