/**
 * Receipt encryption (NaCl box).
 *
 * Encrypts payment receipt details so that ONLY the merchant's wallet
 * can decrypt them. Storage (Supabase) and observers see only an
 * opaque ciphertext; the merchant decrypts in their dashboard using a
 * key derived deterministically from a wallet signature.
 *
 * Why a derived key (not the Ed25519 wallet key directly)?
 * Solana wallets sign with Ed25519, but NaCl box uses X25519. Rather
 * than convert the wallet key (which would also weaken the wallet's
 * security model), each merchant generates a long-lived X25519 keypair
 * by signing a fixed deterministic message with their wallet. The
 * private key never leaves the browser; the public key is published
 * to the merchants table for customers to encrypt against.
 *
 * Threat model:
 *   - Supabase admins / DB readers: cannot decrypt payloads
 *   - Network observers: cannot decrypt payloads
 *   - Anyone without the merchant wallet's signing capability: cannot
 *     decrypt
 *   - Merchant losing wallet access: receipts unrecoverable (acceptable
 *     trade-off for self-custody)
 */

import nacl from "tweetnacl";
import bs58 from "bs58";

/**
 * Deterministic message every merchant signs to derive their long-lived
 * receipt-decryption keypair. Versioned so the scheme can evolve.
 */
export const RECEIPT_KEY_DERIVATION_MESSAGE =
    "Settlr receipt encryption key v1 — sign to derive decryption key";

export interface ReceiptKeypair {
    /** X25519 public key (32 bytes) — base58 encoded, safe to publish */
    publicKey: string;
    /** X25519 secret key (32 bytes) — base58 encoded, KEEP IN BROWSER ONLY */
    secretKey: string;
}

export interface ReceiptPlaintext {
    paymentId: string;
    amount: number;
    currency: string;
    customerWallet: string;
    merchantWallet: string;
    memo?: string;
    items?: Array<{ description: string; quantity: number; price: number }>;
    customerEmail?: string;
    timestamp: string;
}

export interface EncryptedReceipt {
    /** base64 ciphertext */
    ciphertext: string;
    /** base64 24-byte nonce */
    nonce: string;
    /** base58 sender (ephemeral) X25519 public key */
    ephemeralPublicKey: string;
    /** base58 recipient X25519 public key (for sanity checking on decrypt) */
    recipientPublicKey: string;
    /** version of the encryption scheme */
    version: 1;
}

// ─── Key derivation ────────────────────────────────────────────────

/**
 * Derive a long-lived X25519 keypair from a wallet signature over the
 * fixed derivation message. The same wallet always derives the same
 * keypair. The signature itself is never stored.
 */
export function deriveReceiptKeypair(walletSignatureBytes: Uint8Array): ReceiptKeypair {
    if (walletSignatureBytes.length !== 64) {
        throw new Error(
            `Wallet signature must be 64 bytes; got ${walletSignatureBytes.length}`
        );
    }
    // Use first 32 bytes of the signature as the X25519 seed.
    // tweetnacl's box.keyPair.fromSecretKey clamps appropriately.
    const seed = walletSignatureBytes.slice(0, 32);
    const kp = nacl.box.keyPair.fromSecretKey(seed);
    return {
        publicKey: bs58.encode(kp.publicKey),
        secretKey: bs58.encode(kp.secretKey),
    };
}

// ─── Encryption ────────────────────────────────────────────────────

/**
 * Encrypt a receipt for a specific recipient. Uses NaCl box with an
 * ephemeral sender keypair so the sender doesn't need a long-lived key.
 */
export function encryptReceipt(
    receipt: ReceiptPlaintext,
    recipientPublicKeyBase58: string
): EncryptedReceipt {
    const recipientPk = bs58.decode(recipientPublicKeyBase58);
    if (recipientPk.length !== 32) {
        throw new Error("Recipient public key must be 32 bytes");
    }

    const ephemeral = nacl.box.keyPair();
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const message = new TextEncoder().encode(JSON.stringify(receipt));

    const ciphertext = nacl.box(
        message,
        nonce,
        recipientPk,
        ephemeral.secretKey
    );

    return {
        ciphertext: toBase64(ciphertext),
        nonce: toBase64(nonce),
        ephemeralPublicKey: bs58.encode(ephemeral.publicKey),
        recipientPublicKey: recipientPublicKeyBase58,
        version: 1,
    };
}

/**
 * Decrypt a receipt with the merchant's secret key. Throws on
 * authentication failure (tamper detection) or wrong recipient.
 */
export function decryptReceipt(
    encrypted: EncryptedReceipt,
    secretKeyBase58: string
): ReceiptPlaintext {
    const secretKey = bs58.decode(secretKeyBase58);
    const ephemeralPk = bs58.decode(encrypted.ephemeralPublicKey);
    const nonce = fromBase64(encrypted.nonce);
    const ciphertext = fromBase64(encrypted.ciphertext);

    const plaintext = nacl.box.open(
        ciphertext,
        nonce,
        ephemeralPk,
        secretKey
    );
    if (!plaintext) {
        throw new Error(
            "Decryption failed — wrong key, tampered ciphertext, or corrupt payload"
        );
    }
    return JSON.parse(new TextDecoder().decode(plaintext)) as ReceiptPlaintext;
}

// ─── Hashing for on-chain anchoring ────────────────────────────────

/**
 * Hash an encrypted receipt for on-chain anchoring. The hash binds the
 * stored ciphertext to a transaction so the merchant can prove which
 * encrypted blob corresponds to which payment. Uses SHA-256 of the
 * canonical JSON representation.
 */
export async function hashEncryptedReceipt(
    encrypted: EncryptedReceipt
): Promise<string> {
    const canonical = JSON.stringify({
        c: encrypted.ciphertext,
        n: encrypted.nonce,
        e: encrypted.ephemeralPublicKey,
        r: encrypted.recipientPublicKey,
        v: encrypted.version,
    });
    const bytes = new TextEncoder().encode(canonical);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return bs58.encode(new Uint8Array(digest));
}

// ─── base64 helpers (browser + Node compatible) ────────────────────

function toBase64(bytes: Uint8Array): string {
    if (typeof Buffer !== "undefined") {
        return Buffer.from(bytes).toString("base64");
    }
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
    if (typeof Buffer !== "undefined") {
        return new Uint8Array(Buffer.from(b64, "base64"));
    }
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}
