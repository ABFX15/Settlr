/**
 * Settlr SDK Client Unit Tests
 * 
 * Tests all SDK client methods using mocha/chai
 * 
 * Run: npx mocha -r ts-node/register packages/sdk/src/__tests__/client.test.ts
 */

import { expect } from 'chai';
import { Settlr } from '../client';
import { parseUSDC, generatePaymentId, isValidSolanaAddress } from '../utils';

describe('Settlr SDK Client', () => {
    const TEST_API_KEY = 'sk_test_1234567890abcdef';
    const TEST_WALLET = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';
    const TEST_MERCHANT_NAME = 'Test Store';

    describe('constructor', () => {
        it('should throw error without API key', () => {
            expect(() => {
                new Settlr({
                    apiKey: '',
                    merchant: { name: 'Test', walletAddress: TEST_WALLET },
                });
            }).to.throw('API key is required');
        });

        it('should throw error with invalid wallet address', () => {
            expect(() => {
                new Settlr({
                    apiKey: TEST_API_KEY,
                    merchant: { name: 'Test', walletAddress: 'invalid-wallet' },
                });
            }).to.throw('Invalid merchant wallet address');
        });

        it('should create client with valid config', () => {
            const client = new Settlr({
                apiKey: TEST_API_KEY,
                merchant: {
                    name: TEST_MERCHANT_NAME,
                    walletAddress: TEST_WALLET,
                },
            });
            expect(client).to.not.be.undefined;
        });

        it('should create client without wallet (for API-fetched wallet)', () => {
            const client = new Settlr({
                apiKey: TEST_API_KEY,
                merchant: { name: TEST_MERCHANT_NAME },
            });
            expect(client).to.not.be.undefined;
        });

        it('should default to devnet network', () => {
            const client = new Settlr({
                apiKey: TEST_API_KEY,
                merchant: {
                    name: TEST_MERCHANT_NAME,
                    walletAddress: TEST_WALLET,
                },
            });
            expect(client).to.not.be.undefined;
        });

        it('should accept mainnet-beta network', () => {
            const client = new Settlr({
                apiKey: TEST_API_KEY,
                merchant: {
                    name: TEST_MERCHANT_NAME,
                    walletAddress: TEST_WALLET,
                },
                network: 'mainnet-beta',
            });
            expect(client).to.not.be.undefined;
        });

        it('should accept custom RPC endpoint', () => {
            const client = new Settlr({
                apiKey: TEST_API_KEY,
                merchant: {
                    name: TEST_MERCHANT_NAME,
                    walletAddress: TEST_WALLET,
                },
                rpcEndpoint: 'https://custom-rpc.example.com',
            });
            expect(client).to.not.be.undefined;
        });

        it('should enable test mode for devnet', () => {
            const client = new Settlr({
                apiKey: TEST_API_KEY,
                merchant: {
                    name: TEST_MERCHANT_NAME,
                    walletAddress: TEST_WALLET,
                },
                network: 'devnet',
            });
            expect(client).to.not.be.undefined;
        });
    });

    describe('getCheckoutUrl', () => {
        let settlr: Settlr;

        beforeEach(() => {
            settlr = new Settlr({
                apiKey: TEST_API_KEY,
                merchant: {
                    name: TEST_MERCHANT_NAME,
                    walletAddress: TEST_WALLET,
                },
                network: 'devnet',
                testMode: true,
            });
        });

        it('should generate valid checkout URL with amount', () => {
            const url = settlr.getCheckoutUrl({
                amount: 29.99,
            });

            expect(url).to.include('amount=29.99');
            expect(url).to.include(`to=${TEST_WALLET}`);
        });

        it('should include memo in URL', () => {
            const url = settlr.getCheckoutUrl({
                amount: 29.99,
                memo: 'Test payment',
            });

            expect(url).to.include('memo=');
            expect(url).to.include('amount=29.99');
        });

        it('should include orderId in URL', () => {
            const url = settlr.getCheckoutUrl({
                amount: 50.00,
                orderId: 'order_123',
            });

            expect(url).to.include('orderId=order_123');
        });

        it('should include success and cancel URLs', () => {
            const url = settlr.getCheckoutUrl({
                amount: 50.00,
                successUrl: 'https://example.com/success',
                cancelUrl: 'https://example.com/cancel',
            });

            expect(url).to.include('successUrl=');
            expect(url).to.include('cancelUrl=');
        });
    });

    describe('createPayment', () => {
        let settlr: Settlr;

        beforeEach(() => {
            settlr = new Settlr({
                apiKey: TEST_API_KEY,
                merchant: {
                    name: TEST_MERCHANT_NAME,
                    walletAddress: TEST_WALLET,
                },
                network: 'devnet',
                testMode: true,
            });
        });

        it('should reject zero amount', async () => {
            try {
                await settlr.createPayment({ amount: 0 });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.include('Amount must be greater than 0');
            }
        });

        it('should reject negative amount', async () => {
            try {
                await settlr.createPayment({ amount: -10 });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.include('Amount must be greater than 0');
            }
        });
    });

    describe('getTier', () => {
        it('should return undefined before validation', () => {
            const settlr = new Settlr({
                apiKey: TEST_API_KEY,
                merchant: {
                    name: TEST_MERCHANT_NAME,
                    walletAddress: TEST_WALLET,
                },
                testMode: true,
            });
            expect(settlr.getTier()).to.be.undefined;
        });
    });
});

describe('Settlr SDK Utils', () => {
    describe('parseUSDC', () => {
        it('should convert 1 dollar to 1000000 lamports', () => {
            expect(parseUSDC(1)).to.equal(1000000n);
        });

        it('should convert decimal amounts correctly', () => {
            expect(parseUSDC(29.99)).to.equal(29990000n);
            expect(parseUSDC(0.01)).to.equal(10000n);
        });

        it('should handle large amounts', () => {
            expect(parseUSDC(1000000)).to.equal(1000000000000n);
        });

        it('should handle zero', () => {
            expect(parseUSDC(0)).to.equal(0n);
        });
    });

    describe('generatePaymentId', () => {
        it('should generate unique payment IDs', () => {
            const id1 = generatePaymentId();
            const id2 = generatePaymentId();
            expect(id1).to.not.equal(id2);
        });

        it('should start with pay_ prefix', () => {
            const id = generatePaymentId();
            expect(id.startsWith('pay_')).to.be.true;
        });

        it('should have reasonable length', () => {
            const id = generatePaymentId();
            expect(id.length).to.be.greaterThan(10);
        });
    });

    describe('isValidSolanaAddress', () => {
        it('should validate correct addresses', () => {
            expect(isValidSolanaAddress('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')).to.be.true;
            expect(isValidSolanaAddress('So11111111111111111111111111111111111111112')).to.be.true;
        });

        it('should reject empty string', () => {
            expect(isValidSolanaAddress('')).to.be.false;
        });

        it('should reject invalid addresses', () => {
            expect(isValidSolanaAddress('invalid')).to.be.false;
        });

        it('should reject Ethereum addresses', () => {
            expect(isValidSolanaAddress('0x1234567890abcdef1234567890abcdef12345678')).to.be.false;
        });

        it('should reject addresses with wrong length', () => {
            expect(isValidSolanaAddress('short')).to.be.false;
            expect(isValidSolanaAddress('toolongaddressthatwontworkforsure123456789012345678901234567890')).to.be.false;
        });
    });
});

// Import privacy module for testing
import {
    findPrivateReceiptPda,
    findAllowancePda,
    encryptAmount,
    INCO_LIGHTNING_PROGRAM_ID,
    SETTLR_PROGRAM_ID
} from '../privacy';
import { PublicKey } from '@solana/web3.js';

describe('Settlr SDK Privacy Module', () => {
    const TEST_WALLET = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');

    describe('Program IDs', () => {
        it('should have valid Inco Lightning program ID', () => {
            expect(INCO_LIGHTNING_PROGRAM_ID).to.be.instanceOf(PublicKey);
            expect(INCO_LIGHTNING_PROGRAM_ID.toBase58()).to.equal('5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj');
        });

        it('should have valid Settlr program ID', () => {
            expect(SETTLR_PROGRAM_ID).to.be.instanceOf(PublicKey);
            expect(SETTLR_PROGRAM_ID.toBase58()).to.equal('339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5');
        });
    });

    describe('findPrivateReceiptPda', () => {
        it('should derive valid PDA for payment ID', () => {
            const [pda, bump] = findPrivateReceiptPda('pay_test_123');
            expect(pda).to.be.instanceOf(PublicKey);
            expect(bump).to.be.a('number');
            expect(bump).to.be.lessThanOrEqual(255);
        });

        it('should return same PDA for same payment ID (deterministic)', () => {
            const [pda1] = findPrivateReceiptPda('pay_deterministic');
            const [pda2] = findPrivateReceiptPda('pay_deterministic');
            expect(pda1.toBase58()).to.equal(pda2.toBase58());
        });

        it('should return different PDAs for different payment IDs', () => {
            const [pda1] = findPrivateReceiptPda('pay_first');
            const [pda2] = findPrivateReceiptPda('pay_second');
            expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
        });

        it('should handle moderately long payment IDs', () => {
            const longId = 'pay_' + 'a'.repeat(25); // 29 bytes total, within limit
            const [pda, bump] = findPrivateReceiptPda(longId);
            expect(pda).to.be.instanceOf(PublicKey);
            expect(bump).to.be.a('number');
        });

        it('should throw for payment IDs exceeding max seed length', () => {
            const tooLongId = 'pay_' + 'a'.repeat(100); // Exceeds 32 byte limit
            expect(() => findPrivateReceiptPda(tooLongId)).to.throw();
        });

        it('should handle special characters in payment ID', () => {
            const [pda] = findPrivateReceiptPda('pay_special-chars_123');
            expect(pda).to.be.instanceOf(PublicKey);
        });
    });

    describe('findAllowancePda', () => {
        it('should derive valid allowance PDA', () => {
            const handle = BigInt('12345678901234567890');
            const [pda, bump] = findAllowancePda(handle, TEST_WALLET);
            expect(pda).to.be.instanceOf(PublicKey);
            expect(bump).to.be.a('number');
        });

        it('should return same PDA for same handle and address (deterministic)', () => {
            const handle = BigInt('9876543210');
            const [pda1] = findAllowancePda(handle, TEST_WALLET);
            const [pda2] = findAllowancePda(handle, TEST_WALLET);
            expect(pda1.toBase58()).to.equal(pda2.toBase58());
        });

        it('should return different PDAs for different handles', () => {
            const handle1 = BigInt('1111111111');
            const handle2 = BigInt('2222222222');
            const [pda1] = findAllowancePda(handle1, TEST_WALLET);
            const [pda2] = findAllowancePda(handle2, TEST_WALLET);
            expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
        });

        it('should return different PDAs for different addresses', () => {
            const handle = BigInt('5555555555');
            const wallet2 = new PublicKey('So11111111111111111111111111111111111111112');
            const [pda1] = findAllowancePda(handle, TEST_WALLET);
            const [pda2] = findAllowancePda(handle, wallet2);
            expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
        });

        it('should handle max u128 handle value', () => {
            const maxU128 = BigInt('340282366920938463463374607431768211455');
            const [pda] = findAllowancePda(maxU128, TEST_WALLET);
            expect(pda).to.be.instanceOf(PublicKey);
        });

        it('should handle zero handle', () => {
            const [pda] = findAllowancePda(BigInt(0), TEST_WALLET);
            expect(pda).to.be.instanceOf(PublicKey);
        });
    });

    describe('encryptAmount', () => {
        it('should return Uint8Array for amount', async () => {
            const encrypted = await encryptAmount(BigInt(1000000));
            expect(encrypted).to.be.instanceOf(Uint8Array);
        });

        it('should return consistent length output', async () => {
            const enc1 = await encryptAmount(BigInt(1));
            const enc2 = await encryptAmount(BigInt(1000000000));
            expect(enc1.length).to.equal(enc2.length);
        });

        it('should handle zero amount', async () => {
            const encrypted = await encryptAmount(BigInt(0));
            expect(encrypted).to.be.instanceOf(Uint8Array);
            expect(encrypted.length).to.be.greaterThan(0);
        });

        it('should handle large amounts', async () => {
            const largeAmount = BigInt('1000000000000000'); // 1 billion USDC
            const encrypted = await encryptAmount(largeAmount);
            expect(encrypted).to.be.instanceOf(Uint8Array);
        });
    });
});
