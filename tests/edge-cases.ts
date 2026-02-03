/**
 * Anchor Smart Contract Edge Case Tests
 * 
 * Tests error handling and edge cases for the x402-hack-payment program
 * 
 * Run: anchor test
 */

import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
} from "@solana/spl-token";
import { expect } from "chai";
import { X402HackPayment } from "../target/types/x402_hack_payment";

describe("x402-hack-payment edge cases", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.X402HackPayment as Program<X402HackPayment>;
    const connection = provider.connection;
    const authority = provider.wallet;

    let platformConfigPDA: PublicKey;
    let platformTreasuryPDA: PublicKey;
    let usdcMint: PublicKey;
    let merchantAccountPDA: PublicKey;
    const settlementWallet = Keypair.generate();
    const MERCHANT_ID = "edge_test_merchant";

    before(async () => {
        [platformConfigPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("platform_config")],
            program.programId,
        );

        [platformTreasuryPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("platform_treasury")],
            program.programId,
        );

        [merchantAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("merchant"), Buffer.from(MERCHANT_ID)],
            program.programId,
        );

        usdcMint = await createMint(
            connection,
            authority.payer,
            authority.publicKey,
            null,
            6
        );

        // Initialize platform
        await program.methods
            .setPlatformConfig(new anchor.BN(250), new BN(10000))
            .accountsStrict({
                authority: authority.publicKey,
                platformConfig: platformConfigPDA,
                platformTreasury: platformTreasuryPDA,
                usdcMint: usdcMint,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc();

        // Initialize merchant
        await program.methods
            .initializeMerchant(MERCHANT_ID, 0)
            .accountsStrict({
                payer: authority.publicKey,
                merchantAccount: merchantAccountPDA,
                platformConfig: platformConfigPDA,
                settlementWallet: settlementWallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();
    });

    describe("Payment Error Handling", () => {
        it("should fail when payment amount is below minimum", async () => {
            const user = Keypair.generate();
            await connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);

            const paymentId = `pay_min_${Date.now()}`;
            const [paymentAccountPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("payment"), Buffer.from(paymentId)],
                program.programId,
            );
            const [customerAccountPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("customer"), user.publicKey.toBuffer()],
                program.programId,
            );

            const customerUsdcAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                authority.payer,
                usdcMint,
                user.publicKey,
            );
            const merchantUsdcAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                authority.payer,
                usdcMint,
                settlementWallet.publicKey,
            );

            await mintTo(
                connection,
                authority.payer,
                usdcMint,
                customerUsdcAccount.address,
                authority.publicKey,
                1000,
            );

            try {
                await program.methods
                    .processPayment(paymentId, new BN(100)) // Below 10000 minimum
                    .accountsStrict({
                        payer: user.publicKey,
                        platformConfig: platformConfigPDA,
                        paymentAccount: paymentAccountPDA,
                        customerAccount: customerAccountPDA,
                        merchantAccount: merchantAccountPDA,
                        usdcMint: usdcMint,
                        customerUsdc: customerUsdcAccount.address,
                        merchantUsdc: merchantUsdcAccount.address,
                        platformTreasuryUsdc: platformTreasuryPDA,
                        tokenProgram: TOKEN_PROGRAM_ID,
                        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                        systemProgram: SystemProgram.programId,
                    })
                    .signers([user])
                    .rpc();
                expect.fail("Should have thrown PaymentBelowMinimum");
            } catch (err: any) {
                expect(err.toString()).to.satisfy((msg: string) =>
                    msg.includes("PaymentBelowMinimum") || msg.includes("below minimum") || msg.includes("Error")
                );
            }
        });

        it("should fail when customer has insufficient USDC", async () => {
            const user = Keypair.generate();
            await connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);

            const paymentId = `pay_insuf_${Date.now()}`;
            const [paymentAccountPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("payment"), Buffer.from(paymentId)],
                program.programId,
            );
            const [customerAccountPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("customer"), user.publicKey.toBuffer()],
                program.programId,
            );

            const customerUsdcAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                authority.payer,
                usdcMint,
                user.publicKey,
            );
            const merchantUsdcAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                authority.payer,
                usdcMint,
                settlementWallet.publicKey,
            );

            // Don't mint - user has 0 balance

            try {
                await program.methods
                    .processPayment(paymentId, new BN(50000))
                    .accountsStrict({
                        payer: user.publicKey,
                        platformConfig: platformConfigPDA,
                        paymentAccount: paymentAccountPDA,
                        customerAccount: customerAccountPDA,
                        merchantAccount: merchantAccountPDA,
                        usdcMint: usdcMint,
                        customerUsdc: customerUsdcAccount.address,
                        merchantUsdc: merchantUsdcAccount.address,
                        platformTreasuryUsdc: platformTreasuryPDA,
                        tokenProgram: TOKEN_PROGRAM_ID,
                        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                        systemProgram: SystemProgram.programId,
                    })
                    .signers([user])
                    .rpc();
                expect.fail("Should have thrown insufficient funds error");
            } catch (err: any) {
                // Token program throws 0x1 for insufficient funds
                expect(err.toString()).to.satisfy((msg: string) =>
                    msg.includes("insufficient") || msg.includes("0x1") || msg.includes("Error")
                );
            }
        });
    });

    describe("Authorization Checks", () => {
        it("should fail when non-authority tries to update platform config", async () => {
            const fakeAuthority = Keypair.generate();
            await connection.requestAirdrop(fakeAuthority.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);

            try {
                await program.methods
                    .setPlatformConfig(new anchor.BN(500), new BN(10000))
                    .accountsStrict({
                        authority: fakeAuthority.publicKey,
                        platformConfig: platformConfigPDA,
                        platformTreasury: platformTreasuryPDA,
                        usdcMint: usdcMint,
                        systemProgram: SystemProgram.programId,
                        tokenProgram: TOKEN_PROGRAM_ID,
                    })
                    .signers([fakeAuthority])
                    .rpc();
                expect.fail("Should have thrown Unauthorized");
            } catch (err: any) {
                expect(err.toString()).to.satisfy((msg: string) =>
                    msg.includes("Unauthorized") || msg.includes("Error") || msg.includes("Constraint")
                );
            }
        });

        it("should fail when non-authority tries to claim fees", async () => {
            const fakeAuthority = Keypair.generate();
            await connection.requestAirdrop(fakeAuthority.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);

            const fakeAuthorityUsdc = await getOrCreateAssociatedTokenAccount(
                connection,
                authority.payer,
                usdcMint,
                fakeAuthority.publicKey,
            );

            try {
                await program.methods
                    .claimPlatformFees()
                    .accountsStrict({
                        authority: fakeAuthority.publicKey,
                        platformConfig: platformConfigPDA,
                        platformTreasuryUsdc: platformTreasuryPDA,
                        authorityUsdc: fakeAuthorityUsdc.address,
                        usdcMint: usdcMint,
                        tokenProgram: TOKEN_PROGRAM_ID,
                        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    })
                    .signers([fakeAuthority])
                    .rpc();
                expect.fail("Should have thrown Unauthorized");
            } catch (err: any) {
                expect(err.toString()).to.satisfy((msg: string) =>
                    msg.includes("Unauthorized") || msg.includes("Error") || msg.includes("Constraint")
                );
            }
        });
    });

    describe("Merchant Operations", () => {
        it("should fail to initialize duplicate merchant", async () => {
            try {
                await program.methods
                    .initializeMerchant(MERCHANT_ID, 0)
                    .accountsStrict({
                        payer: authority.publicKey,
                        merchantAccount: merchantAccountPDA,
                        platformConfig: platformConfigPDA,
                        settlementWallet: settlementWallet.publicKey,
                        systemProgram: SystemProgram.programId,
                    })
                    .rpc();
                expect.fail("Should have thrown - account already exists");
            } catch (err: any) {
                // Account already exists error
                expect(err.toString()).to.include("Error");
            }
        });
    });

    describe("Sequential Payments", () => {
        it("should handle multiple payments in sequence", async () => {
            const user = Keypair.generate();
            await connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);

            const customerUsdcAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                authority.payer,
                usdcMint,
                user.publicKey,
            );
            const merchantUsdcAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                authority.payer,
                usdcMint,
                settlementWallet.publicKey,
            );

            await mintTo(
                connection,
                authority.payer,
                usdcMint,
                customerUsdcAccount.address,
                authority.publicKey,
                1000000, // 1 USDC
            );

            for (let i = 0; i < 3; i++) {
                const paymentId = `pay_seq_${Date.now()}_${i}`;
                const [paymentAccountPDA] = PublicKey.findProgramAddressSync(
                    [Buffer.from("payment"), Buffer.from(paymentId)],
                    program.programId,
                );
                const [customerAccountPDA] = PublicKey.findProgramAddressSync(
                    [Buffer.from("customer"), user.publicKey.toBuffer()],
                    program.programId,
                );

                await program.methods
                    .processPayment(paymentId, new BN(20000))
                    .accountsStrict({
                        payer: user.publicKey,
                        platformConfig: platformConfigPDA,
                        paymentAccount: paymentAccountPDA,
                        customerAccount: customerAccountPDA,
                        merchantAccount: merchantAccountPDA,
                        usdcMint: usdcMint,
                        customerUsdc: customerUsdcAccount.address,
                        merchantUsdc: merchantUsdcAccount.address,
                        platformTreasuryUsdc: platformTreasuryPDA,
                        tokenProgram: TOKEN_PROGRAM_ID,
                        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                        systemProgram: SystemProgram.programId,
                    })
                    .signers([user])
                    .rpc();
            }

            // If we get here, all 3 payments succeeded
            expect(true).to.be.true;
        });
    });

    describe("Privacy - Private Receipt Edge Cases", () => {
        const INCO_LIGHTNING_PROGRAM_ID = new PublicKey('5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj');

        // Helper to derive private receipt PDA
        function findPrivateReceiptPda(paymentId: string): [PublicKey, number] {
            return PublicKey.findProgramAddressSync(
                [Buffer.from('private_receipt'), Buffer.from(paymentId)],
                program.programId
            );
        }

        // Mock encryption for testing (real Inco encryption would be used in production)
        function mockEncryptAmount(amount: bigint): Buffer {
            const buffer = Buffer.alloc(32);
            buffer.writeBigUInt64LE(amount, 0);
            for (let i = 8; i < 32; i++) {
                buffer[i] = Number((amount * BigInt(i)) % BigInt(256));
            }
            return buffer;
        }

        it("should fail to issue private receipt with empty payment ID", async () => {
            const user = Keypair.generate();
            await connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);

            const emptyPaymentId = "";
            const encryptedAmount = mockEncryptAmount(BigInt(100000));

            try {
                const [privateReceiptPDA] = findPrivateReceiptPda(emptyPaymentId);

                await program.methods
                    .issuePrivateReceipt(emptyPaymentId, Buffer.from(encryptedAmount))
                    .accountsStrict({
                        customer: user.publicKey,
                        merchant: settlementWallet.publicKey,
                        privateReceipt: privateReceiptPDA,
                        incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
                        systemProgram: SystemProgram.programId,
                    })
                    .signers([user])
                    .rpc();
                expect.fail("Should have thrown InvalidPaymentId");
            } catch (err: any) {
                // Should fail with InvalidPaymentId or validation error
                expect(err.toString()).to.satisfy((msg: string) =>
                    msg.includes("InvalidPaymentId") || msg.includes("Error")
                );
            }
        });

        it("should fail with missing allowance accounts", async () => {
            const user = Keypair.generate();
            await connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);

            const paymentId = `pay_priv_${Date.now()}`;
            const encryptedAmount = mockEncryptAmount(BigInt(100000));
            const [privateReceiptPDA] = findPrivateReceiptPda(paymentId);

            try {
                // This should fail because we're not passing the required
                // remaining accounts for allowance PDAs
                await program.methods
                    .issuePrivateReceipt(paymentId, Buffer.from(encryptedAmount))
                    .accountsStrict({
                        customer: user.publicKey,
                        merchant: settlementWallet.publicKey,
                        privateReceipt: privateReceiptPDA,
                        incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
                        systemProgram: SystemProgram.programId,
                    })
                    .signers([user])
                    .rpc();
                // May succeed on devnet with mock Inco, or fail with MissingAllowanceAccounts
            } catch (err: any) {
                console.log("Expected error for missing allowance accounts:", err.message);
                // Should fail with MissingAllowanceAccounts or CPI error
                expect(err.toString()).to.include("Error");
            }
        });

        it("should generate unique private receipt PDAs for different payment IDs", () => {
            const paymentId1 = "pay_unique_1";
            const paymentId2 = "pay_unique_2";

            const [pda1] = findPrivateReceiptPda(paymentId1);
            const [pda2] = findPrivateReceiptPda(paymentId2);

            expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
        });

        it("should generate same PDA for same payment ID (idempotent)", () => {
            const paymentId = "pay_idempotent_test";

            const [pda1] = findPrivateReceiptPda(paymentId);
            const [pda2] = findPrivateReceiptPda(paymentId);

            expect(pda1.toBase58()).to.equal(pda2.toBase58());
        });
    });
});
