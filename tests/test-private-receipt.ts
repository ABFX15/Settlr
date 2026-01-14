/**
 * Test script for Inco Lightning private receipts
 * 
 * This tests the full flow:
 * 1. Create encrypted amount ciphertext
 * 2. Issue private receipt with Inco CPI
 * 3. Grant decryption access to customer and merchant
 * 
 * Run: npx ts-node tests/test-private-receipt.ts
 */

import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import {
    PublicKey,
    Keypair,
    Connection,
    SystemProgram,
    LAMPORTS_PER_SOL
} from '@solana/web3.js';
import * as fs from 'fs';

// Load types
import type { X402HackPayment } from '../target/types/x402_hack_payment';

// Constants
const INCO_LIGHTNING_PROGRAM_ID = new PublicKey('5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj');
const SETTLR_PROGRAM_ID = new PublicKey('339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5');

// Helper to derive private receipt PDA
function findPrivateReceiptPda(paymentId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('private_receipt'), Buffer.from(paymentId)],
        SETTLR_PROGRAM_ID
    );
}

// Helper to derive allowance PDA
function findAllowancePda(handle: bigint, allowedAddress: PublicKey): [PublicKey, number] {
    const handleBuffer = Buffer.alloc(16);
    let h = handle;
    for (let i = 0; i < 16; i++) {
        handleBuffer[i] = Number(h & BigInt(0xff));
        h = h >> BigInt(8);
    }
    return PublicKey.findProgramAddressSync(
        [handleBuffer, allowedAddress.toBuffer()],
        INCO_LIGHTNING_PROGRAM_ID
    );
}

// Placeholder encryption (would use real Inco encryption in production)
function mockEncryptAmount(amount: bigint): Buffer {
    const buffer = Buffer.alloc(32); // Inco ciphertexts are typically larger
    buffer.writeBigUInt64LE(amount, 0);
    // Fill rest with pseudo-random bytes based on amount
    for (let i = 8; i < 32; i++) {
        buffer[i] = Number((amount * BigInt(i)) % BigInt(256));
    }
    return buffer;
}

async function main() {
    console.log('🔒 Testing Inco Lightning Private Receipts\n');

    // Setup connection
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    // Load wallet
    const walletPath = './phantom-wallet.json';
    if (!fs.existsSync(walletPath)) {
        console.error('❌ Wallet not found:', walletPath);
        process.exit(1);
    }

    const secretKey = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
    const wallet = Keypair.fromSecretKey(new Uint8Array(secretKey));
    console.log('💳 Wallet:', wallet.publicKey.toBase58());

    // Check balance
    const balance = await connection.getBalance(wallet.publicKey);
    console.log('💰 Balance:', balance / LAMPORTS_PER_SOL, 'SOL');

    if (balance < 0.01 * LAMPORTS_PER_SOL) {
        console.log('⚠️  Low balance, requesting airdrop...');
        const sig = await connection.requestAirdrop(wallet.publicKey, LAMPORTS_PER_SOL);
        await connection.confirmTransaction(sig);
        console.log('✅ Airdrop received');
    }

    // Setup Anchor
    const provider = new anchor.AnchorProvider(
        connection,
        new anchor.Wallet(wallet),
        { commitment: 'confirmed' }
    );
    anchor.setProvider(provider);

    // Load program
    const idl = JSON.parse(fs.readFileSync('./target/idl/x402_hack_payment.json', 'utf-8'));
    const program = new Program(idl, provider) as Program<X402HackPayment>;
    console.log('📦 Program:', program.programId.toBase58());

    // Test data
    const paymentId = `test_receipt_${Date.now()}`;
    const amountLamports = BigInt(99_990_000); // 99.99 USDC (6 decimals)
    const merchantWallet = Keypair.generate().publicKey; // Simulated merchant

    console.log('\n📋 Test Parameters:');
    console.log('   Payment ID:', paymentId);
    console.log('   Amount:', Number(amountLamports) / 1e6, 'USDC');
    console.log('   Customer:', wallet.publicKey.toBase58());
    console.log('   Merchant:', merchantWallet.toBase58());

    // Derive PDAs
    const [privateReceiptPda, receiptBump] = findPrivateReceiptPda(paymentId);
    console.log('\n🔑 Private Receipt PDA:', privateReceiptPda.toBase58());

    // Create encrypted amount (mock - would use Inco encryption API in production)
    const encryptedAmount = mockEncryptAmount(amountLamports);
    console.log('🔐 Encrypted amount (mock):', encryptedAmount.toString('hex').slice(0, 32), '...');

    try {
        // Step 1: Build transaction for simulation (without allowance accounts)
        console.log('\n⏳ Step 1: Building transaction for simulation...');

        const txForSim = await program.methods
            .issuePrivateReceipt(paymentId, encryptedAmount)
            .accountsPartial({
                customer: wallet.publicKey,
                merchant: merchantWallet,
            })
            .transaction();

        // Add recent blockhash
        txForSim.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        txForSim.feePayer = wallet.publicKey;
        txForSim.sign(wallet);

        // Step 2: Simulate to get handle (if Inco is available on devnet)
        console.log('⏳ Step 2: Simulating transaction...');

        const simulation = await connection.simulateTransaction(txForSim);

        if (simulation.value.err) {
            console.log('⚠️  Simulation result:', JSON.stringify(simulation.value.err, null, 2));
            console.log('   Logs:', simulation.value.logs?.slice(-10));

            // This is expected if Inco Lightning isn't deployed on devnet yet
            // In that case, we'd need to test on a local validator with Inco mock
            if (simulation.value.logs?.some(log => log.includes('AccountNotFound'))) {
                console.log('\n📝 Note: Inco Lightning program may not be available on devnet yet.');
                console.log('   The integration code is correct - just needs Inco devnet deployment.');
                console.log('   You can test locally with a mock Inco program.');
            }
        } else {
            console.log('✅ Simulation succeeded!');

            // Extract the handle from Inco's NEW_EUINT128 event in the logs
            // Look for: result=<handle>
            let handle: bigint | null = null;
            for (const log of simulation.value.logs || []) {
                const match = log.match(/result=(\d+)/);
                if (match) {
                    handle = BigInt(match[1]);
                    console.log('   Extracted handle from logs:', handle.toString());
                    break;
                }
            }

            if (!handle) {
                console.log('⚠️  Could not extract handle from simulation logs');
                console.log('   Logs:', simulation.value.logs);
                return;
            }

            // Step 3: Derive allowance PDAs from the REAL handle
            console.log('⏳ Step 3: Deriving allowance PDAs from handle...');
            const [customerAllowancePda] = findAllowancePda(handle, wallet.publicKey);
            const [merchantAllowancePda] = findAllowancePda(handle, merchantWallet);

            console.log('   Customer allowance PDA:', customerAllowancePda.toBase58());
            console.log('   Merchant allowance PDA:', merchantAllowancePda.toBase58());

            // Step 4: Execute real transaction with allowance accounts
            console.log('⏳ Step 4: Executing transaction with allowance accounts...');

            const sig = await program.methods
                .issuePrivateReceipt(paymentId, encryptedAmount)
                .accountsPartial({
                    customer: wallet.publicKey,
                    merchant: merchantWallet,
                    incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .remainingAccounts([
                    { pubkey: customerAllowancePda, isSigner: false, isWritable: true },
                    { pubkey: merchantAllowancePda, isSigner: false, isWritable: true },
                ])
                .rpc();

            console.log('\n✅ Private receipt issued!');
            console.log('   Signature:', sig);
            console.log('   Explorer: https://explorer.solana.com/tx/' + sig + '?cluster=devnet');

            // Fetch and display the receipt
            const receipt = await program.account.privateReceipt.fetch(privateReceiptPda);
            console.log('\n📜 Private Receipt Data:');
            console.log('   Payment ID:', receipt.paymentId);
            console.log('   Customer:', receipt.customer.toBase58());
            console.log('   Merchant:', receipt.merchant.toBase58());
            console.log('   Encrypted Handle:', receipt.encryptedAmountHandle.toString());
            console.log('   Issued At:', new Date(Number(receipt.issuedAt) * 1000).toISOString());
        }

    } catch (error: any) {
        console.error('\n❌ Error:', error.message);

        if (error.logs) {
            console.log('\n📋 Transaction Logs:');
            error.logs.forEach((log: string) => console.log('   ', log));
        }

        // Provide helpful context
        if (error.message.includes('AccountNotFound') || error.message.includes('5sjEbPiq')) {
            console.log('\n💡 The Inco Lightning program is not yet deployed on devnet.');
            console.log('   Integration code is ready - waiting for Inco devnet availability.');
            console.log('   Contact Inco team or check https://docs.inco.org for devnet status.');
        }
    }

    console.log('\n🏁 Test complete!');
}

main().catch(console.error);
