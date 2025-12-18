import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
    createAssociatedTokenAccountInstruction,
    createTransferInstruction,
    getAssociatedTokenAddress
} from "@solana/spl-token";

export type TokenFee = {
    mint: string;
    account?: string; // Optional - will be derived from feePayer if not provided
    symbol?: string;
    decimals: number;
    fee: number;
};

export type OctaneConfig = {
    feePayer: string;
    rpcUrl?: string;
    rateLimit?: number;
    maxSignatures?: number;
    lamportsPerSignature?: number;
    corsOrigin?: boolean;
    endpoints?: {
        transfer?: { tokens: TokenFee[] },
        createAssociatedAccount?: { token: TokenFee[] },
        whirlpoolSwap?: { token: TokenFee[] }
    };
};

// Use our own relay API (same origin, no CORS issues)
const OCTANE_ENDPOINT = process.env.NEXT_PUBLIC_OCTANE_ENDPOINT || '/api/relay';

export async function loadOctaneConfig(): Promise<OctaneConfig> {
    const response = await fetch(OCTANE_ENDPOINT);
    return response.json();
}

// Helper to encode transaction to base64
function encodeTransaction(transaction: Transaction): string {
    const serialized = transaction.serialize({ requireAllSignatures: false });
    // Use btoa for browser compatibility (Buffer may not be available)
    if (typeof Buffer !== 'undefined') {
        return Buffer.from(serialized).toString('base64');
    }
    // Fallback for browser
    return btoa(String.fromCharCode(...serialized));
}

export async function createAssociatedTokenAccount(transaction: Transaction): Promise<string> {
    const response = await fetch(OCTANE_ENDPOINT + '/createAssociatedTokenAccount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            transaction: encodeTransaction(transaction),
        }),
    });
    const data = await response.json();
    return data.signature as string;
}

export async function transferTokenWithFee(transaction: Transaction): Promise<string> {
    console.log('Sending transaction to Octane...');
    console.log('Transaction signatures:', transaction.signatures.map(s => ({
        publicKey: s.publicKey.toBase58(),
        signature: s.signature ? 'present' : 'null'
    })));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout (reduced)

    try {
        const encodedTx = encodeTransaction(transaction);
        console.log('Encoded transaction length:', encodedTx.length);
        console.log('About to fetch Octane endpoint...');

        const response = await fetch(OCTANE_ENDPOINT + '/transfer', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                transaction: encodedTx,
            }),
            signal: controller.signal,
        });
        console.log('Fetch completed!');
        clearTimeout(timeoutId);

        console.log('Octane response status:', response.status);
        const text = await response.text();
        console.log('Octane raw response:', text);

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error('Invalid JSON response from Octane: ' + text);
        }

        console.log('Octane response data:', data);
        if (data.error || data.message) {
            throw new Error(data.error || data.message || 'Octane transfer failed');
        }
        if (!data.signature) {
            throw new Error('No signature returned from Octane: ' + JSON.stringify(data));
        }
        return data.signature as string;
    } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            // Transaction may have still succeeded - Octane processes async
            throw new Error('Payment is being processed. The relay is slow but your transaction may have succeeded. Please check your wallet balance and Solana Explorer.');
        }
        throw err;
    }
}

export async function buildTransaction(
    connection: Connection,
    feePayer: PublicKey,
    fee: TokenFee,
    mint: PublicKey,
    sender: PublicKey,
    recipient: PublicKey,
    transferAmountInDecimals: number,
): Promise<Transaction> {
    // Fee account is either explicit or derive from feePayer's ATA
    const feeAccount = fee.account
        ? new PublicKey(fee.account)
        : await getAssociatedTokenAddress(mint, feePayer);

    const feeIx = createTransferInstruction(
        await getAssociatedTokenAddress(mint, sender),
        feeAccount,
        sender,
        fee.fee
    );
    const transferIx = createTransferInstruction(
        await getAssociatedTokenAddress(mint, sender),
        await getAssociatedTokenAddress(mint, recipient),
        sender,
        transferAmountInDecimals
    );
    return (new Transaction({
        recentBlockhash: (await connection.getLatestBlockhashAndContext()).value.blockhash,
        feePayer: feePayer,
    })).add(feeIx, transferIx);
}

export async function buildTransactionToCreateAccount(
    connection: Connection,
    feePayer: PublicKey,
    fee: TokenFee,
    mint: PublicKey,
    sender: PublicKey,
    recipient: PublicKey
): Promise<Transaction> {
    // Fee account is either explicit or derive from feePayer's ATA
    const feeAccount = fee.account
        ? new PublicKey(fee.account)
        : await getAssociatedTokenAddress(mint, feePayer);

    const feeInstruction = createTransferInstruction(
        await getAssociatedTokenAddress(mint, sender),
        feeAccount,
        sender,
        fee.fee
    );
    const accountInstruction = createAssociatedTokenAccountInstruction(
        feePayer,
        await getAssociatedTokenAddress(mint, recipient),
        recipient,
        mint
    );
    return (new Transaction({
        recentBlockhash: (await connection.getRecentBlockhashAndContext()).value.blockhash,
        feePayer: feePayer,
    }).add(feeInstruction, accountInstruction));
}

export async function buildTransactionWithAccountCheck(
    connection: Connection,
    feePayer: PublicKey,
    fee: TokenFee,
    mint: PublicKey,
    sender: PublicKey,
    recipient: PublicKey,
    transferAmountInDecimals: number,
): Promise<Transaction> {
    const recipientAta = await getAssociatedTokenAddress(mint, recipient);
    const accountInfo = await connection.getAccountInfo(recipientAta);

    // Fee account is either explicit or derive from feePayer's ATA
    const feeAccount = fee.account
        ? new PublicKey(fee.account)
        : await getAssociatedTokenAddress(mint, feePayer);

    const tx = new Transaction({
        recentBlockhash: (await connection.getLatestBlockhashAndContext()).value.blockhash,
        feePayer: feePayer,
    });

    // Fee instruction first (Octane requirement)
    tx.add(createTransferInstruction(
        await getAssociatedTokenAddress(mint, sender),
        feeAccount,
        sender,
        fee.fee
    ));

    // Create ATA if it doesn't exist
    if (!accountInfo) {
        tx.add(createAssociatedTokenAccountInstruction(
            feePayer,
            recipientAta,
            recipient,
            mint
        ));
    }

    // Transfer
    tx.add(createTransferInstruction(
        await getAssociatedTokenAddress(mint, sender),
        recipientAta,
        sender,
        transferAmountInDecimals
    ));

    return tx;
}