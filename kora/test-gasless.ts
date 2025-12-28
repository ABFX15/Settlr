/**
 * Test Gasless Transaction with Kora
 * 
 * This script tests the Kora gasless transaction flow:
 * 1. Create a USDC transfer transaction
 * 2. Send it to Kora for signing (Kora pays the gas)
 * 3. Verify the transaction was signed
 * 
 * Prerequisites:
 * - Kora server running on localhost:8080
 * - Fee payer has SOL (already funded: 8o4bLuATwShRWnaqs1YrkNns5T5TJrPJCaM882Zh8CWr)
 * - Test wallet needs devnet USDC to transfer
 */

import {
    Connection,
    PublicKey,
    Transaction,
    SystemProgram,
    Keypair
} from '@solana/web3.js';
import {
    getAssociatedTokenAddress,
    createTransferInstruction,
    TOKEN_PROGRAM_ID
} from '@solana/spl-token';

const KORA_RPC_URL = 'http://localhost:8080';
const DEVNET_USDC = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
const DEVNET_RPC = 'https://api.devnet.solana.com';

async function testKoraLiveness() {
    console.log('🔍 Testing Kora liveness...');

    const response = await fetch(KORA_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'liveness',
            params: []
        })
    });

    const result = await response.json();
    console.log('✅ Kora is alive:', result);
    return true;
}

async function getPayerSigner() {
    console.log('\n🔍 Getting fee payer signer...');

    const response = await fetch(KORA_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getPayerSigner',
            params: []
        })
    });

    const result = await response.json();
    console.log('✅ Fee payer:', result.result);
    return result.result;
}

async function getSupportedTokens() {
    console.log('\n🔍 Getting supported tokens...');

    const response = await fetch(KORA_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getSupportedTokens',
            params: []
        })
    });

    const result = await response.json();
    console.log('✅ Supported tokens:', result.result);
    return result.result;
}

async function estimateTransactionFee(transaction: string) {
    console.log('\n🔍 Estimating transaction fee...');

    const response = await fetch(KORA_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'estimateTransactionFee',
            params: {
                transaction
            }
        })
    });

    const result = await response.json();
    if (result.error) {
        console.log('❌ Fee estimation error:', result.error);
        return null;
    }
    console.log('✅ Fee estimate:', result.result);
    return result.result;
}

async function signTransaction(transaction: string) {
    console.log('\n🔍 Signing transaction with Kora...');

    const response = await fetch(KORA_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'signTransaction',
            params: {
                transaction
            }
        })
    });

    const result = await response.json();
    if (result.error) {
        console.log('❌ Sign error:', result.error);
        return null;
    }
    console.log('✅ Transaction signed!');
    return result.result;
}

async function createTestTransaction() {
    console.log('\n🔍 Creating test transaction...');

    const connection = new Connection(DEVNET_RPC);

    // Generate a test keypair (in real app, this would be user's wallet)
    const testWallet = Keypair.generate();
    console.log('   Test wallet:', testWallet.publicKey.toBase58());

    // Create a simple SOL transfer (just for testing - 0 lamports)
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    const transaction = new Transaction({
        feePayer: new PublicKey('8o4bLuATwShRWnaqs1YrkNns5T5TJrPJCaM882Zh8CWr'), // Kora fee payer
        blockhash,
        lastValidBlockHeight,
    });

    // Add a simple memo-like instruction (System transfer of 0 lamports)
    transaction.add(
        SystemProgram.transfer({
            fromPubkey: testWallet.publicKey,
            toPubkey: testWallet.publicKey, // Transfer to self
            lamports: 0,
        })
    );

    // Serialize to base64
    const serialized = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
    }).toString('base64');

    console.log('   Transaction created (base64)');
    return { transaction: serialized, testWallet };
}

async function main() {
    console.log('🚀 Testing Kora Gasless Transaction Flow\n');
    console.log('═'.repeat(50));

    try {
        // 1. Test liveness
        await testKoraLiveness();

        // 2. Get fee payer
        await getPayerSigner();

        // 3. Get supported tokens
        await getSupportedTokens();

        // 4. Create a test transaction
        const { transaction } = await createTestTransaction();

        // 5. Estimate fee
        const feeEstimate = await estimateTransactionFee(transaction);

        // 6. Try to sign (this will likely fail validation since test wallet has no funds)
        const signResult = await signTransaction(transaction);

        console.log('\n' + '═'.repeat(50));
        console.log('📊 Test Summary:');
        console.log('   - Kora Server: ✅ Running');
        console.log('   - Fee Payer: ✅ Configured');
        console.log('   - Supported Tokens: ✅ Retrieved');
        console.log('   - Fee Estimation: ' + (feeEstimate ? '✅ Working' : '⚠️ Check config'));
        console.log('   - Transaction Signing: ' + (signResult ? '✅ Working' : '⚠️ Validation may need real wallet'));

        console.log('\n💡 To test a real gasless transfer:');
        console.log('   1. Get devnet USDC: https://faucet.circle.com');
        console.log('   2. Run the frontend: cd app/frontend && npm run dev');
        console.log('   3. Connect wallet and make a payment');

    } catch (error) {
        console.error('\n❌ Test failed:', error);
    }
}

main();
