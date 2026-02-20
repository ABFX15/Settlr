/**
 * Settlr API Client — standalone HTTP wrapper for the Shopify app.
 */

export interface PaymentResult {
  id: string;
  amount: number;
  currency: string;
  status: string;
  checkoutUrl: string;
  createdAt: string;
}

export interface PaymentStatus {
  id: string;
  status: string;
  txSignature?: string;
  confirmedAt?: string;
}

export class SettlrAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = "https://settlr.dev") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
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
      throw new Error((data as any).error || `API error ${res.status}`);
    }
    return data as T;
  }

  async createPayment(opts: {
    amount: number;
    memo?: string;
    redirectUrl?: string;
    webhookUrl?: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentResult> {
    return this.request<PaymentResult>("/api/payments", {
      method: "POST",
      body: JSON.stringify({
        amount: opts.amount,
        currency: "USDC",
        memo: opts.memo,
        redirectUrl: opts.redirectUrl,
        webhookUrl: opts.webhookUrl,
        metadata: opts.metadata,
      }),
    });
  }

  async getPayment(id: string): Promise<PaymentStatus> {
    return this.request<PaymentStatus>(`/api/payments/${encodeURIComponent(id)}`);
  }

  async refundPayment(id: string, amount: number, reason?: string) {
    return this.request<{ id: string; status: string }>(
      `/api/payments/${encodeURIComponent(id)}/refund`,
      {
        method: "POST",
        body: JSON.stringify({ amount, reason }),
      }
    );
  }
}
