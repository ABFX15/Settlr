import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, Transaction, VersionedTransaction } from '@solana/web3.js';

// Fee payer configuration
const FEE_PAYER_SECRET = process.env.FEE_PAYER_SECRET_KEY;
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// OPTIONS - CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// POST - Sign and submit transaction
export async function POST(request: NextRequest) {
    console.log('Relay transfer request received');

    if (!FEE_PAYER_SECRET) {
        return NextResponse.json(
            { error: 'Relay not configured' },
            { status: 500, headers: corsHeaders }
        );
    }

    try {
        const body = await request.json();
        const { transaction: txBase64 } = body;

        if (!txBase64) {
            return NextResponse.json(
                { error: 'Missing transaction' },
                { status: 400, headers: corsHeaders }
            );
        }

        console.log('Decoding transaction...');

        // Decode the transaction
        const txBuffer = Buffer.from(txBase64, 'base64');
        const tx = Transaction.from(txBuffer);

        // Load fee payer keypair
        const secretKey = JSON.parse(FEE_PAYER_SECRET);
        const feePayer = Keypair.fromSecretKey(Uint8Array.from(secretKey));

        console.log('Fee payer:', feePayer.publicKey.toBase58());

        // Verify the transaction has the correct fee payer
        if (!tx.feePayer || tx.feePayer.toBase58() !== feePayer.publicKey.toBase58()) {
            return NextResponse.json(
                { error: 'Invalid fee payer' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Verify user has signed
        const userSignature = tx.signatures.find(
            (sig) => sig.publicKey.toBase58() !== feePayer.publicKey.toBase58() && sig.signature !== null
        );
        if (!userSignature) {
            return NextResponse.json(
                { error: 'Transaction must be signed by user' },
                { status: 400, headers: corsHeaders }
            );
        }

        console.log('User signature verified, signing as fee payer...');

        // Connect to Solana
        const connection = new Connection(RPC_URL, 'confirmed');

        // Sign as fee payer
        tx.partialSign(feePayer);

        console.log('Sending transaction...');

        // Send and confirm
        const signature = await connection.sendRawTransaction(tx.serialize(), {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
        });

        console.log('Transaction sent:', signature);

        // Wait for confirmation (with timeout)
        const confirmation = await connection.confirmTransaction(signature, 'confirmed');

        if (confirmation.value.err) {
            console.error('Transaction failed:', confirmation.value.err);
            return NextResponse.json(
                { error: 'Transaction failed on chain', details: confirmation.value.err },
                { status: 500, headers: corsHeaders }
            );
        }

        console.log('Transaction confirmed:', signature);

        return NextResponse.json(
            { signature },
            { status: 200, headers: corsHeaders }
        );

    } catch (error: unknown) {
        console.error('Relay transfer error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: message },
            { status: 500, headers: corsHeaders }
        );
    }
}
