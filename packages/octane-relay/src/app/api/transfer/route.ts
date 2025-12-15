import { NextRequest, NextResponse } from 'next/server';
import { Transaction } from '@solana/web3.js';
import { getConfig } from '@/config';
import {
    validateTransaction,
    signAsFeePlayer,
    submitTransaction,
    getFeePayerKeypair,
} from '@/relay';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { transaction: txBase64, mint } = body;

        if (!txBase64) {
            return NextResponse.json(
                { error: 'Missing transaction' },
                { status: 400 }
            );
        }

        // Decode transaction
        const txBuffer = Buffer.from(txBase64, 'base64');
        const transaction = Transaction.from(txBuffer);

        // Find token config
        const config = getConfig();
        const tokenConfig = config.tokens.find(t =>
            mint ? t.mint === mint : true
        );

        if (!tokenConfig) {
            return NextResponse.json(
                { error: 'Unsupported token for fees' },
                { status: 400 }
            );
        }

        // Validate transaction has fee payment
        const validation = await validateTransaction(transaction, tokenConfig);
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        // Set fee payer
        transaction.feePayer = getFeePayerKeypair().publicKey;

        // Sign as fee payer
        const signedTx = signAsFeePlayer(transaction);

        // Submit to network
        const { signature } = await submitTransaction(signedTx);

        return NextResponse.json({
            status: 'ok',
            signature,
        });
    } catch (error) {
        console.error('Transfer error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Transfer failed' },
            { status: 500 }
        );
    }
}

// Handle CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
