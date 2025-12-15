import { NextResponse } from 'next/server';
import { getFeePayerBalance, getFeePayerTokenBalance, getFeePayerKeypair } from '@/relay';
import { getConfig } from '@/config';

export async function GET() {
    try {
        const feePayer = getFeePayerKeypair().publicKey.toBase58();
        const config = getConfig();

        const solBalance = await getFeePayerBalance();

        const tokenBalances = await Promise.all(
            config.tokens.map(async (token) => ({
                mint: token.mint,
                symbol: token.symbol,
                balance: await getFeePayerTokenBalance(token.mint),
                balanceFormatted: (await getFeePayerTokenBalance(token.mint) / Math.pow(10, token.decimals)).toFixed(token.decimals),
            }))
        );

        return NextResponse.json({
            feePayer,
            solBalance: solBalance.toFixed(9),
            tokenBalances,
            status: solBalance > 0.001 ? 'healthy' : 'low_sol',
        });
    } catch (error) {
        console.error('Health check error:', error);
        return NextResponse.json(
            { status: 'error', error: 'Health check failed' },
            { status: 500 }
        );
    }
}
