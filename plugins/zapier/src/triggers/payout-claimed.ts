/**
 * Trigger: New Payout Claimed
 *
 * Fires when a recipient claims a payout (clicks the claim link and
 * provides their wallet address). Uses polling against the payouts list
 * endpoint filtered by status=claimed.
 */

const trigger = {
  key: "payout_claimed",
  noun: "Payout",

  display: {
    label: "Payout Claimed",
    description: "Triggers when a recipient claims a USDC payout.",
    important: true,
  },

  operation: {
    perform: async (z: any, bundle: any) => {
      const baseUrl = bundle.authData.baseUrl || "https://settlr.dev";
      const response = await z.request({
        url: `${baseUrl}/api/payouts`,
        method: "GET",
        headers: {
          "X-API-Key": bundle.authData.apiKey,
        },
        params: {
          status: "claimed",
          limit: "25",
        },
      });

      return response.data.data || response.data;
    },

    sample: {
      id: "po_sample123",
      email: "alice@example.com",
      amount: 250.0,
      currency: "USDC",
      memo: "March data labeling",
      status: "claimed",
      claimUrl: "https://settlr.dev/claim/abc123",
      recipientWallet: "5FHwkrdxABvqVR8zuTY...",
      txSignature: "4vJ9JU1bJJE96FWSJKvH...",
      createdAt: "2025-03-15T10:00:00Z",
      claimedAt: "2025-03-15T14:30:00Z",
      expiresAt: "2025-03-22T10:00:00Z",
    },

    outputFields: [
      { key: "id", label: "Payout ID" },
      { key: "email", label: "Recipient Email" },
      { key: "amount", label: "Amount (USDC)", type: "number" },
      { key: "status", label: "Status" },
      { key: "memo", label: "Memo" },
      { key: "recipientWallet", label: "Recipient Wallet" },
      { key: "txSignature", label: "Transaction Signature" },
      { key: "claimedAt", label: "Claimed At", type: "datetime" },
    ],
  },
};

export default trigger;
