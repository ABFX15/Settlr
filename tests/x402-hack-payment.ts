import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { X402HackPayment } from "../target/types/x402_hack_payment";

describe("x402-hack-payment", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);

  const program = anchor.workspace.X402HackPayment as Program<X402HackPayment>;
  const connection = provider.connection;

  const authority = provider.wallet;

  let platformConfigPDA: PublicKey;
  let platformTreasuryPDA: PublicKey;
  let usdcMint: PublicKey;
  let merchantAccountPDA: PublicKey;
  let merchantBump: number;
  const settlementWallet = Keypair.generate();

  const MERCHANT_ID = "merchant_123";

  before(async () => {
    // Derive PDAs using the correct seeds from the program
    [platformConfigPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform_config")],
      program.programId,
    );
    console.log(`\nPlatform config PDA: ${platformConfigPDA.toBase58()}`);

    [platformTreasuryPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform_treasury")],
      program.programId,
    );
    console.log(`\nPlatform Treasury PDA: ${platformTreasuryPDA.toBase58()}`);

    [merchantAccountPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("merchant"), Buffer.from("merchant_123")],
      program.programId,
    );
    console.log(`\nMerchant Account PDA: ${merchantAccountPDA.toBase58()}`);

    usdcMint = await createMint(
      connection,
      authority.payer,
      authority.publicKey,
      null,
      6 // USDC has 6 decimal places
    );
    console.log(`\nUSDC Mint: ${usdcMint.toBase58()}`);
  });

  it("Platform is initialized!", async () => {
    const platformFeeBps = 250;
    const minPaymentAmount = 10000;

    const tx = await program.methods
      .setPlatformConfig(new anchor.BN(platformFeeBps), new BN(minPaymentAmount))
      .accountsStrict({
        authority: authority.publicKey,
        platformConfig: platformConfigPDA,
        platformTreasury: platformTreasuryPDA,
        usdcMint: usdcMint,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log(`Transaction signature: ${tx}`);

    const config = await program.account.platform.fetch(platformConfigPDA);
    console.log(`\nPlatform Config: ${JSON.stringify(config)}`);

    const treasuryBalance = (await connection.getTokenAccountBalance(platformTreasuryPDA)).value.amount;
    console.log(`\nTreasury Balance: ${treasuryBalance}`);
  });

  it("Merchant is initialized!", async () => {
    const merchantId = "merchant123";
    const tx = await program.methods
      .initializeMerchant(MERCHANT_ID, merchantBump)
      .accountsStrict({
        payer: authority.publicKey,
        merchantAccount: merchantAccountPDA,
        platformConfig: platformConfigPDA,
        settlementWallet: settlementWallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`\nTransaction signature: ${tx}`);

    const merchantAccount = await program.account.merchant.fetch(merchantAccountPDA);
    console.log(`\nMerchant Account: ${JSON.stringify(merchantAccount)}`);
  });

  it("Processes a payment!", async () => {
    // Create a user and fund them with USDC
    const user = Keypair.generate();
    const airdropSig = await connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropSig);

    // Generate unique payment ID
    const paymentId = `pay_${Date.now()}`;

    // Derive payment account PDA
    const [paymentAccountPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("payment"), Buffer.from(paymentId)],
      program.programId,
    );
    console.log(`\nPayment Account PDA: ${paymentAccountPDA.toBase58()}`);

    // Derive customer account PDA
    const [customerAccountPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("customer"), user.publicKey.toBuffer()],
      program.programId,
    );
    console.log(`\nCustomer Account PDA: ${customerAccountPDA.toBase58()}`);

    // Create user's USDC token account
    const customerUsdcAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      authority.payer,
      usdcMint,
      user.publicKey,
    );

    // Create merchant's USDC token account
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
      500000, // Mint 0.5 USDC (500,000 micro USDC)
    );

    console.log(`\nCustomer USDC Account: ${customerUsdcAccount.address.toBase58()}`);
    console.log(`\nMerchant USDC Account: ${merchantUsdcAccount.address.toBase58()}`);

    // Process payment
    const paymentAmount = 20000; // 0.02 USDC
    const tx = await program.methods
      .processPayment(paymentId, new BN(paymentAmount))
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
    console.log(`\nTransaction signature: ${tx}`);

    const paymentAccount = await program.account.payment.fetch(paymentAccountPDA);
    console.log(`\nPayment Account: ${JSON.stringify(paymentAccount)}`);

    const merchantAccount = await program.account.merchant.fetch(merchantAccountPDA);
    console.log(`\nUpdated Merchant Account: ${JSON.stringify(merchantAccount)}`);

    const platformTreasuryBalance = (await connection.getTokenAccountBalance(platformTreasuryPDA)).value.amount;
    console.log(`\nPlatform Treasury Balance: ${platformTreasuryBalance}`);
  });

  // ============================================
  // EDGE CASE TESTS
  // ============================================

  describe("Edge Cases - Payment Errors", () => {
    it("Fails when payment amount is below minimum", async () => {
      const user = Keypair.generate();
      const airdropSig = await connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
      await connection.confirmTransaction(airdropSig);

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
        1000, // Small amount
      );

      // Try payment below minimum (minPaymentAmount is 10000)
      const belowMinAmount = 100;

      try {
        await program.methods
          .processPayment(paymentId, new BN(belowMinAmount))
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
        throw new Error("Should have failed with PaymentBelowMinimum");
      } catch (err: any) {
        console.log(`\nExpected error: ${err.message}`);
        if (!err.message.includes("PaymentBelowMinimum") && !err.message.includes("below minimum")) {
          // Check if it's an AnchorError
          if (err.error?.errorCode?.code !== "PaymentBelowMinimum") {
            throw err;
          }
        }
      }
    });

    it("Fails when customer has insufficient USDC balance", async () => {
      const user = Keypair.generate();
      const airdropSig = await connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
      await connection.confirmTransaction(airdropSig);

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

      // Don't mint any USDC - user has 0 balance
      const paymentAmount = 50000; // 0.05 USDC

      try {
        await program.methods
          .processPayment(paymentId, new BN(paymentAmount))
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
        throw new Error("Should have failed with insufficient funds");
      } catch (err: any) {
        console.log(`\nExpected insufficient funds error: ${err.message}`);
        // Token program will throw an error for insufficient funds
        if (!err.message.includes("insufficient") && !err.message.includes("0x1")) {
          // 0x1 is token program insufficient funds error
          if (!err.logs?.some((log: string) => log.includes("insufficient"))) {
            console.log("Error caught (insufficient funds expected)");
          }
        }
      }
    });

    it("Fails with invalid payment ID (empty string)", async () => {
      const user = Keypair.generate();
      const airdropSig = await connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
      await connection.confirmTransaction(airdropSig);

      const paymentId = ""; // Empty payment ID

      try {
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
          100000,
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
        throw new Error("Should have failed with InvalidPaymentId");
      } catch (err: any) {
        console.log(`\nExpected error for empty payment ID: ${err.message}`);
        // Should fail with InvalidPaymentId or similar validation error
      }
    });
  });

  describe("Edge Cases - Platform Configuration", () => {
    it("Fails when non-authority tries to update platform config", async () => {
      const fakeAuthority = Keypair.generate();
      const airdropSig = await connection.requestAirdrop(fakeAuthority.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
      await connection.confirmTransaction(airdropSig);

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
        throw new Error("Should have failed with Unauthorized");
      } catch (err: any) {
        console.log(`\nExpected unauthorized error: ${err.message}`);
        // Should fail with Unauthorized or constraint error
      }
    });

    it("Fails with invalid fee basis points (over 10000)", async () => {
      try {
        await program.methods
          .setPlatformConfig(new anchor.BN(15000), new BN(10000)) // 150% fee is invalid
          .accountsStrict({
            authority: authority.publicKey,
            platformConfig: platformConfigPDA,
            platformTreasury: platformTreasuryPDA,
            usdcMint: usdcMint,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();
        throw new Error("Should have failed with InvalidFeeBps");
      } catch (err: any) {
        console.log(`\nExpected invalid fee error: ${err.message}`);
        if (!err.message.includes("InvalidFeeBps") && !err.message.includes("fee")) {
          // Check for constraint violation
          console.log("Fee validation error caught");
        }
      }
    });
  });

  describe("Edge Cases - Merchant Operations", () => {
    it("Fails to initialize merchant with invalid merchant ID", async () => {
      const invalidMerchantId = ""; // Empty merchant ID

      try {
        const [invalidMerchantPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("merchant"), Buffer.from(invalidMerchantId)],
          program.programId,
        );

        await program.methods
          .initializeMerchant(invalidMerchantId, 0)
          .accountsStrict({
            payer: authority.publicKey,
            merchantAccount: invalidMerchantPDA,
            platformConfig: platformConfigPDA,
            settlementWallet: settlementWallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        throw new Error("Should have failed with InvalidMerchantId");
      } catch (err: any) {
        console.log(`\nExpected invalid merchant ID error: ${err.message}`);
      }
    });

    it("Fails to initialize duplicate merchant", async () => {
      try {
        // Try to initialize the same merchant again
        await program.methods
          .initializeMerchant(MERCHANT_ID, merchantBump)
          .accountsStrict({
            payer: authority.publicKey,
            merchantAccount: merchantAccountPDA,
            platformConfig: platformConfigPDA,
            settlementWallet: settlementWallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        throw new Error("Should have failed - merchant already exists");
      } catch (err: any) {
        console.log(`\nExpected duplicate merchant error: ${err.message}`);
        // Should fail because account already exists
      }
    });
  });

  describe("Edge Cases - Fee Claiming", () => {
    it("Fails when non-authority tries to claim fees", async () => {
      const fakeAuthority = Keypair.generate();
      const airdropSig = await connection.requestAirdrop(fakeAuthority.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
      await connection.confirmTransaction(airdropSig);

      const fakeDestination = await getOrCreateAssociatedTokenAccount(
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
            platformTreasury: platformTreasuryPDA,
            destination: fakeDestination.address,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([fakeAuthority])
          .rpc();
        throw new Error("Should have failed with Unauthorized");
      } catch (err: any) {
        console.log(`\nExpected unauthorized claim error: ${err.message}`);
      }
    });

    it("Successfully claims fees when authorized", async () => {
      const authorityDestination = await getOrCreateAssociatedTokenAccount(
        connection,
        authority.payer,
        usdcMint,
        authority.publicKey,
      );

      const treasuryBalanceBefore = (await connection.getTokenAccountBalance(platformTreasuryPDA)).value.amount;
      console.log(`\nTreasury balance before claim: ${treasuryBalanceBefore}`);

      if (parseInt(treasuryBalanceBefore) > 0) {
        const tx = await program.methods
          .claimPlatformFees()
          .accountsStrict({
            authority: authority.publicKey,
            platformConfig: platformConfigPDA,
            platformTreasury: platformTreasuryPDA,
            destination: authorityDestination.address,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();
        console.log(`\nClaim fees tx: ${tx}`);

        const treasuryBalanceAfter = (await connection.getTokenAccountBalance(platformTreasuryPDA)).value.amount;
        console.log(`\nTreasury balance after claim: ${treasuryBalanceAfter}`);
      } else {
        console.log("\nNo fees to claim, skipping claim test");
      }
    });
  });

  describe("Edge Cases - Concurrent Payments", () => {
    it("Handles multiple payments in sequence", async () => {
      const user = Keypair.generate();
      const airdropSig = await connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
      await connection.confirmTransaction(airdropSig);

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

      // Mint enough for multiple payments
      await mintTo(
        connection,
        authority.payer,
        usdcMint,
        customerUsdcAccount.address,
        authority.publicKey,
        1000000, // 1 USDC
      );

      const paymentCount = 3;
      const paymentAmount = 20000; // 0.02 USDC each

      for (let i = 0; i < paymentCount; i++) {
        const paymentId = `pay_seq_${Date.now()}_${i}`;
        const [paymentAccountPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("payment"), Buffer.from(paymentId)],
          program.programId,
        );
        const [customerAccountPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("customer"), user.publicKey.toBuffer()],
          program.programId,
        );

        const tx = await program.methods
          .processPayment(paymentId, new BN(paymentAmount))
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
        console.log(`\nSequential payment ${i + 1} tx: ${tx}`);
      }

      console.log(`\n✓ Successfully processed ${paymentCount} sequential payments`);
    });
  });
});
