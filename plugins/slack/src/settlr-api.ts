/**
 * Settlr API Client — lightweight HTTP wrapper used by the Slack bot.
 *
 * Mirrors the shape of @settlr/sdk PayoutClient but is standalone so this
 * bot package has zero dependency on the SDK monorepo at runtime.
 */

export interface PayoutRecord {
  id: string;
  email: string;
  amount: number;
  currency: string;
  memo?: string;
  metadata?: Record<string, string>;
  status: string;
  claimUrl: string;
  recipientWallet?: string;
  txSignature?: string;
  batchId?: string;
  createdAt: string;
  fundedAt?: string;
  claimedAt?: string;
  expiresAt: string;
}

export interface BatchResult {
  id: string;
  status: string;
  total: number;
  count: number;
  payouts: Array<{
    id: string;
    email: string;
    amount: number;
    status: string;
    claimUrl: string;
  }>;
  createdAt: string;
}

export interface BalanceResult {
  wallet: string;
  usdc: number;
}

export class SettlrAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = "https://settlr.dev") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
        ...(options.headers as Record<string, string>),
      },
    });

    const data = await res.json();

    if (!res.ok) {
      const msg =
        (data as Record<string, string>).error ||
        `API error ${res.status}`;
      throw new Error(msg);
    }

    return data as T;
  }

  // ── Payouts ─────────────────────────────────────────────────────────

  async createPayout(opts: {
    email: string;
    amount: number;
    memo?: string;
    metadata?: Record<string, string>;
  }): Promise<PayoutRecord> {
    return this.request<PayoutRecord>("/api/payouts", {
      method: "POST",
      body: JSON.stringify({
        email: opts.email,
        amount: opts.amount,
        currency: "USDC",
        memo: opts.memo,
        metadata: opts.metadata,
      }),
    });
  }

  async createBatch(
    payouts: Array<{ email: string; amount: number; memo?: string }>
  ): Promise<BatchResult> {
    return this.request<BatchResult>("/api/payouts/batch", {
      method: "POST",
      body: JSON.stringify({ payouts }),
    });
  }

  async getPayout(id: string): Promise<PayoutRecord> {
    return this.request<PayoutRecord>(
      `/api/payouts/${encodeURIComponent(id)}`
    );
  }

  async getBalance(): Promise<BalanceResult> {
    return this.request<BalanceResult>("/api/balance");
  }
}
