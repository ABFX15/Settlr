/**
 * Settlr Bubble.io Plugin — Server-side Action: Send Payout
 *
 * Paste this into Bubble's plugin editor under "Server-side actions"
 * for the "send_payout" action.
 */

async function(properties, context) {
  const baseUrl = context.keys.base_url || "https://settlr.dev";
  const apiKey = context.keys.api_key;

  const response = await fetch(`${baseUrl}/api/payouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      email: properties.email,
      amount: properties.amount,
      currency: "USDC",
      memo: properties.memo || "",
      metadata: { source: "bubble" },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Payout API error: ${response.status}`);
  }

  return {
    payout_id: data.id,
    email: data.email,
    amount: data.amount,
    status: data.status,
    claim_url: data.claimUrl,
    created_at: data.createdAt,
  };
}
