/**
 * Action: Create Payment Link
 *
 * Generates a hosted checkout link a customer can use to pay in USDC.
 */

const create = {
  key: "create_payment_link",
  noun: "Payment Link",

  display: {
    label: "Create Payment Link",
    description: "Generate a USDC checkout link to send to a customer.",
  },

  operation: {
    inputFields: [
      {
        key: "amount",
        label: "Amount (USDC)",
        type: "number" as const,
        required: true,
        helpText: "The amount the customer will pay.",
      },
      {
        key: "memo",
        label: "Description",
        type: "string" as const,
        required: false,
        helpText: "Shown to the customer at checkout.",
      },
      {
        key: "redirect_url",
        label: "Success Redirect URL",
        type: "string" as const,
        required: false,
        helpText: "Where to redirect after successful payment.",
      },
    ],

    perform: async (z: any, bundle: any) => {
      const baseUrl = bundle.authData.baseUrl || "https://settlr.dev";
      const response = await z.request({
        url: `${baseUrl}/api/payments`,
        method: "POST",
        headers: {
          "X-API-Key": bundle.authData.apiKey,
          "Content-Type": "application/json",
        },
        body: {
          amount: bundle.inputData.amount,
          memo: bundle.inputData.memo,
          redirectUrl: bundle.inputData.redirect_url,
          metadata: {
            source: "zapier",
            zap_id: bundle.meta?.zap?.id || "unknown",
          },
        },
      });

      return response.data;
    },

    sample: {
      id: "pay_zap_sample",
      amount: 49.99,
      currency: "USDC",
      memo: "Invoice #1234",
      status: "pending",
      checkoutUrl: "https://settlr.dev/checkout/abc123",
      createdAt: "2025-03-15T10:00:00Z",
    },

    outputFields: [
      { key: "id", label: "Payment ID" },
      { key: "amount", label: "Amount (USDC)", type: "number" },
      { key: "status", label: "Status" },
      { key: "checkoutUrl", label: "Checkout URL" },
      { key: "createdAt", label: "Created At", type: "datetime" },
    ],
  },
};

export default create;
