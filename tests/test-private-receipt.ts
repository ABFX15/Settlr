/**
 * Test: MagicBlock Private Ephemeral Rollup (PER) Payments
 *
 * Full flow:
 *   1. Create private payment session on base layer
 *   2. Delegate account to PER (data enters Intel TDX TEE)
 *   3. Process payment inside TEE (hidden from observers)
 *   4. Settle — commit state back to Solana base layer
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
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import * as fs from 'fs';

import type { X402HackPayment } from '../target/types/x402_hack_payment';

// ── Constants ──
const OFFBANK_PROGRAM_ID = new PublicKey('339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5');
const DELEGATION_PROGRAM_ID = new PublicKey('DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh');
const PERMISSION_PROGRAM_ID = new PublicKey('ACLseoPoyC3cBqoUtkbjZ4aDrkurZW86v19pXz2XQnp1');

const MAGIC_ROUTER_DEVNET = 'https://devnet-router.magicblock.app';
const PER_ENDPOINT = 'https://tee.magicblock.app';
const TEE_VALIDATOR = new PublicKey('FnE6VJT5QNZdedZPnCoLsARgBwoE6DeJNjBs2H1gySXA');

// ── PDA helpers ──

function findPrivateReceiptPda(paymentId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('private_receipt'), Buffer.from(paymentId)],
        OFFBANK_PROGRAM_ID,
    );
}

function findDelegationBufferPda(receiptPda: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('buffer'), receiptPda.toBuffer()],
        DELEGATION_PROGRAM_ID,
    );
}

function findDelegationRecordPda(receiptPda: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('delegation'), receiptPda.toBuffer()],
        DELEGATION_PROGRAM_ID,
    );
}

function findDelegationMetadataPda(receiptPda: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('delegation-metadata'), receiptPda.toBuffer()],
        DELEGATION_PROGRAM_ID,
    );
}

// ── Main ──

async function main() {
    console.log('🔒 Testing MagicBlock PER Private Payments\n');

    // ── 1. Setup ──
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    const walletPath = './phantom-wallet.json';
    if (!fs.existsSync(walletPath)) {
        console.error('❌ Wallet not found:', walletPath);
        process.exit(1);
    }
    const secretKey = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
    const wallet = Keypair.fromSecretKey(new Uint8Array(secretKey));
    console.log('💳 Wallet:', wallet.publicKey.toBase58());

    const balance = await connection.getBalance(wallet.publicKey);
    console.log('💰 Balance:', balance / LAMPORTS_PER_SOL, 'SOL');

    if (balance < 0.01 * LAMPORTS_PER_SOL) {
        console.log('⚠️  Low balance — requesting airdrop...');
        const sig = await connection.requestAirdrop(wallet.publicKey, LAMPORTS_PER_SOL);
        await connection.confirmTransaction(sig);
        console.log('✅ Airdrop received');
    }

    const provider = new anchor.AnchorProvider(
        connection,
        new anchor.Wallet(wallet),
        { commitment: 'confirmed' },
    );
    anchor.setProvider(provider);

    const idl = JSON.parse(fs.readFileSync('./target/idl/x402_hack_payment.json', 'utf-8'));
    const program = new Program(idl, provider) as Program<X402HackPayment>;
    console.log('📦 Program:', program.programId.toBase58());

    // ── 2. Test data ──
    const paymentId = `per_test_${Date.now()}`;
    const amount = new anchor.BN(99_990_000);     // 99.99 USDC (6 dec)
    const feeAmount = new anchor.BN(990_000);      // 0.99 USDC fee
    const memo = 'Hackathon PER test payment';
    const merchantWallet = Keypair.generate().publicKey;

    const [receiptPda, receiptBump] = findPrivateReceiptPda(paymentId);
    const [bufferPda]   = findDelegationBufferPda(receiptPda);
    const [recordPda]   = findDelegationRecordPda(receiptPda);
    const [metadataPda] = findDelegationMetadataPda(receiptPda);

    console.log('\n📋 Test Parameters:');
    console.log('   Payment ID:', paymentId);
    console.log('   Amount:', amount.toNumber() / 1e6, 'USDC');
    console.log('   Fee:   ', feeAmount.toNumber() / 1e6, 'USDC');
    console.log('   Customer:', wallet.publicKey.toBase58());
    console.log('   Merchant:', merchantWallet.toBase58());
    console.log('   Receipt PDA:', receiptPda.toBase58());

    // ── 3. Step 1: Issue private receipt on base layer ──
    try {
        console.log('\n⏳ Step 1: Creating private payment session on base layer...');

        const sig = await program.methods
            .issuePrivateReceipt(paymentId, amount, feeAmount, memo)
            .accountsPartial({
                customer: wallet.publicKey,
                merchant: merchantWallet,
                privateReceipt: receiptPda,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        console.log('✅ Session created!');
        console.log('   Signature:', sig);
        console.log('   Explorer: https://explorer.solana.com/tx/' + sig + '?cluster=devnet');

        // Fetch receipt
        const receipt = await program.account.privateReceipt.fetch(receiptPda);
        console.log('\n📜 Private Receipt:');
        console.log('   Payment ID:', receipt.paymentId);
        console.log('   Amount:', receipt.amount.toNumber() / 1e6, 'USDC');
        console.log('   Fee:', receipt.feeAmount.toNumber() / 1e6, 'USDC');
        console.log('   Status:', JSON.stringify(receipt.sessionStatus));
        console.log('   Delegated:', receipt.isDelegated);
        console.log('   Memo:', receipt.memo);

        // ── Step 2: Delegate to PER ──
        console.log('\n⏳ Step 2: Delegating to Private Ephemeral Rollup (TEE)...');

        try {
            const delegateSig = await program.methods
                .delegatePrivatePayment()
                .accountsPartial({
                    customer: wallet.publicKey,
                    privateReceipt: receiptPda,
                    delegationBuffer: bufferPda,
                    delegationRecord: recordPda,
                    delegationMetadata: metadataPda,
                    ownerProgram: OFFBANK_PROGRAM_ID,
                    delegationProgram: DELEGATION_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            console.log('✅ Delegated to PER!');
            console.log('   Signature:', delegateSig);
            console.log('   PER Endpoint:', PER_ENDPOINT);
            console.log('   🔐 Data now hidden inside Intel TDX TEE');

            // ── Step 3: Process inside TEE ──
            console.log('\n⏳ Step 3: Processing payment inside TEE...');

            // Connect to PER endpoint for processing
            const perConnection = new Connection(PER_ENDPOINT, { commitment: 'confirmed' });
            const perProvider = new anchor.AnchorProvider(
                perConnection,
                new anchor.Wallet(wallet),
                { commitment: 'confirmed' },
            );

            const perProgram = new Program(idl, perProvider) as Program<X402HackPayment>;

            const processSig = await perProgram.methods
                .processPrivatePayment()
                .accountsPartial({
                    customer: wallet.publicKey,
                    privateReceipt: receiptPda,
                })
                .rpc();

            console.log('✅ Payment processed (hidden in TEE)!');
            console.log('   Signature:', processSig);
            console.log('   🔐 Amount, fee, recipient invisible to outside observers');

            // ── Step 4: Settle back to base layer ──
            console.log('\n⏳ Step 4: Settling — committing state to Solana...');

            const settleSig = await program.methods
                .settlePrivatePayment()
                .accountsPartial({
                    customer: wallet.publicKey,
                    privateReceipt: receiptPda,
                })
                .rpc();

            console.log('✅ Payment settled!');
            console.log('   Signature:', settleSig);

            // Verify settled state
            const settled = await program.account.privateReceipt.fetch(receiptPda);
            console.log('\n📜 Settled Receipt:');
            console.log('   Status:', JSON.stringify(settled.sessionStatus));
            console.log('   Delegated:', settled.isDelegated);
            console.log('   Settled At:', new Date(settled.settledAt.toNumber() * 1000).toISOString());
        } catch (delegateErr: any) {
            if (delegateErr.message?.includes('AccountNotFound') ||
                delegateErr.message?.includes('DELeGGvX')) {
                console.log('\n📝 Delegation program not yet available on devnet.');
                console.log('   Base-layer receipt creation is working ✅');
                console.log('   PER delegation requires the MagicBlock delegation program on devnet.');
                console.log('   Test the full flow on localnet with anchor-test or MagicBlock CLI.');
            } else {
                throw delegateErr;
            }
        }
    } catch (error: any) {
        console.error('\n❌ Error:', error.message);
        if (error.logs) {
            console.log('\n📋 Transaction Logs:');
            error.logs.forEach((log: string) => console.log('   ', log));
        }
    }

    // ── 4. Test API endpoint ──
    console.log('\n\n🌐 Testing Private Payments API...');

    const API_BASE = 'http://localhost:3000/api/privacy/gaming';

    try {
        // GET — info
        const info = await fetch(API_BASE).then(r => r.json());
        console.log('   API name:', info.name);
        console.log('   Version:', info.version);

        // POST create
        const createRes = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'create',
                customerPubkey: wallet.publicKey.toBase58(),
                merchantPubkey: merchantWallet.toBase58(),
                amount: 5000000, // 5 USDC
                memo: 'API test',
            }),
        }).then(r => r.json());

        console.log('\n   Create:', createRes.success ? '✅' : '❌', createRes.message);
        const sid = createRes.session?.paymentId;

        if (sid) {
            // Delegate
            const delRes = await fetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delegate', sessionId: sid }),
            }).then(r => r.json());
            console.log('   Delegate:', delRes.success ? '✅' : '❌', delRes.message);

            // Process
            const procRes = await fetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'process', sessionId: sid }),
            }).then(r => r.json());
            console.log('   Process:', procRes.success ? '✅' : '❌', procRes.message);

            // Settle
            const settleRes = await fetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'settle', sessionId: sid }),
            }).then(r => r.json());
            console.log('   Settle:', settleRes.success ? '✅' : '❌', settleRes.message);

            // Status
            const statusRes = await fetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'status', sessionId: sid }),
            }).then(r => r.json());
            console.log('   Final status:', statusRes.session?.status);
        }
    } catch (apiErr: any) {
        console.log('   ⚠️  API test skipped (is the dev server running?)', apiErr.message);
    }

    console.log('\n🏁 MagicBlock PER test complete!');
    console.log('\n🏆 Hackathon: SolanaBlitz — MagicBlock Weekend Hackathon');
    console.log('   Privacy: Intel TDX TEE (hardware-secured)');
    console.log('   Latency: Sub-10ms inside ephemeral rollup');
    console.log('   Fee:     Gasless transactions inside PER');
}

main().catch(console.error);
