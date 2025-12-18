import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, Transaction, sendAndConfirmRawTransaction } from '@solana/web3.js';

// Fee payer configuration
const FEE_PAYER_SECRET = process.env.FEE_PAYER_SECRET_KEY;
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

// USDC devnet mint
const USDC_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
const FEE_AMOUNT = 10000; // 0.01 USDC

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// GET - Return relay config
export async function GET() {
    if (!FEE_PAYER_SECRET) {
        return NextResponse.json({ error: 'Relay not configured' }, { status: 500 });
    }

    try {
        const secretKey = JSON.parse(FEE_PAYER_SECRET);
        const feePayer = Keypair.fromSecretKey(Uint8Array.from(secretKey));

        // Derive fee account (USDC ATA for fee payer)
        const { getAssociatedTokenAddress } = await import('@solana/spl-token');
        const { PublicKey } = await import('@solana/web3.js');
        const feeAccount = await getAssociatedTokenAddress(
            new PublicKey(USDC_MINT),
            feePayer.publicKey
        );

        return NextResponse.json({
            feePayer: feePayer.publicKey.toBase58(),
            endpoints: {
                transfer: {
                    tokens: [{
                        mint: USDC_MINT,
                        symbol: 'USDC',
                        decimals: 6,
                        fee: FEE_AMOUNT,
                        account: feeAccount.toBase58(),
                    }]
                }
            },
            rateLimit: 60,
        }, { headers: corsHeaders });
    } catch (error) {
        console.error('Config error:', error);
        return NextResponse.json({ error: 'Invalid configuration' }, { status: 500, headers: corsHeaders });
    }
}

// OPTIONS - CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}
