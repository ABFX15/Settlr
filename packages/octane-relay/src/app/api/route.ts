import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/config';
import { getFeePayerKeypair } from '@/relay';

export async function GET() {
    try {
        const config = getConfig();
        const feePayer = getFeePayerKeypair().publicKey.toBase58();

        return NextResponse.json({
            feePayer,
            endpoints: {
                transfer: {
                    tokens: config.tokens.map(t => ({
                        mint: t.mint,
                        symbol: t.symbol,
                        decimals: t.decimals,
                        fee: t.fee,
                    })),
                },
            },
            rateLimit: config.rateLimit,
        });
    } catch (error) {
        console.error('Config error:', error);
        return NextResponse.json(
            { error: 'Relay not configured' },
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
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
