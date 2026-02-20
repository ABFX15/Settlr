/**
 * Action: Send Payout
 *
 * Sends USDC to a recipient by email address. They receive a claim link.
 */

const create = {
  key: "send_payout",
  noun: "Payout",

  display: {
    label: "Send Payout",
    description: "Send USDC to a recipient by email address.",
    important: true,
  },

  operation: {
    inputFields: [
      {
        key: "email",
        label: "Recipient Email",
        type: "string" as const,
        required: true,
        helpText: "The email of the person you want to pay.",
      },
      {
        key: "amount",
        label: "Amount (USDC)",
        type: "number" as const,
        required: true,
        helpText: "The amount in USDC to send.",
      },
      {
        key: "memo",
        label: "Memo",
        type: "string" as const,
        required: false,
        helpText: "A note included in the claim email.",
      },
    ],

    perform: async (z: any, bundle: any) => {
      const baseUrl = bundle.authData.baseUrl || "https://settlr.dev";
      const response = await z.request({
        url: `${baseUrl}/api/payouts`,
        method: "POST",
        headers: {
          "X-API-Key": bundle.authData.apiKey,
          "Content-Type": "application/json",
        },
        body: {
          email: bundle.inputData.email,
          amount: bundle.inputData.amount,
          currency: "USDC",
          memo: bundle.inputData.memo,
          metadata: {
            source: "zapier",
            zap_id: bundle.meta?.zap?.id || "unknown",
          },
        },
      });

      return response.data;
    },

    sample: {
      id: "po_zap_sample",
      email: "alice@example.com",
      amount: 250.0,
      currency: "USDC",
      memo: "Payment from Zapier",
      status: "sent",
      claimUrl: "https://settlr.dev/claim/abc123",
      createdAt: "2025-03-15T10:00:00Z",
      expiresAt: "2025-03-22T10:00:00Z",
    },

    outputFields: [
      { key: "id", label: "Payout ID" },
      { key: "email", label: "Recipient Email" },
      { key: "amount", label: "Amount (USDC)", type: "number" },
      { key: "status", label: "Status" },
      { key: "claimUrl", label: "Claim URL" },
      { key: "createdAt", label: "Created At", type: "datetime" },
    ],
  },
};

export default create;
