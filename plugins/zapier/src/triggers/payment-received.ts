/**
 * Trigger: New Payment Received
 *
 * Fires when a customer completes a USDC payment via checkout.
 * Polls the payments list endpoint filtered by status=confirmed.
 */

const trigger = {
  key: "payment_received",
  noun: "Payment",

  display: {
    label: "Payment Received",
    description: "Triggers when a USDC payment is confirmed on-chain.",
    important: true,
  },

  operation: {
    perform: async (z: any, bundle: any) => {
      const baseUrl = bundle.authData.baseUrl || "https://settlr.dev";
      const response = await z.request({
        url: `${baseUrl}/api/payments`,
        method: "GET",
        headers: {
          "X-API-Key": bundle.authData.apiKey,
        },
        params: {
          status: "confirmed",
          limit: "25",
        },
      });

      return response.data.data || response.data;
    },

    sample: {
      id: "pay_sample456",
      amount: 29.99,
      currency: "USDC",
      memo: "Premium subscription",
      status: "confirmed",
      payerWallet: "3xJ7...",
      merchantWallet: "5FHw...",
      txSignature: "5tKp...",
      createdAt: "2025-03-15T10:00:00Z",
      confirmedAt: "2025-03-15T10:00:02Z",
    },

    outputFields: [
      { key: "id", label: "Payment ID" },
      { key: "amount", label: "Amount (USDC)", type: "number" },
      { key: "status", label: "Status" },
      { key: "memo", label: "Memo" },
      { key: "payerWallet", label: "Payer Wallet" },
      { key: "txSignature", label: "Transaction Signature" },
      { key: "confirmedAt", label: "Confirmed At", type: "datetime" },
    ],
  },
};

export default trigger;
