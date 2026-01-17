/**
 * Mobile Game Integration Utilities
 * 
 * Simple helpers for integrating Settlr payments in mobile games.
 * Works with Unity, Unreal, native iOS/Android, React Native, etc.
 * 
 * The simplest integration is URL-based - just open the checkout URL
 * and listen for the callback.
 */

export interface MobileCheckoutOptions {
    /** Amount in USDC */
    amount: number;
    /** Merchant wallet address */
    merchantWallet: string;
    /** Optional: Merchant display name */
    merchantName?: string;
    /** Optional: Payment description */
    memo?: string;
    /** URL to redirect after success */
    successUrl?: string;
    /** URL to redirect on cancel */
    cancelUrl?: string;
    /** Optional: Your order/transaction ID */
    orderId?: string;
    /** Optional: Customer ID for one-click */
    customerId?: string;
}

export interface MobileCheckoutResult {
    success: boolean;
    signature?: string;
    orderId?: string;
    error?: string;
}

/**
 * Generate a checkout URL for mobile games
 * 
 * Usage in Unity (C#):
 * ```csharp
 * string url = $"https://settlr.dev/checkout?amount={amount}&merchant={wallet}";
 * Application.OpenURL(url);
 * ```
 * 
 * Usage in Swift:
 * ```swift
 * let url = "https://settlr.dev/checkout?amount=\(amount)&merchant=\(wallet)"
 * UIApplication.shared.open(URL(string: url)!)
 * ```
 */
export function generateCheckoutUrl(
    options: MobileCheckoutOptions,
    baseUrl: string = 'https://settlr.dev'
): string {
    const params = new URLSearchParams();

    params.set('amount', options.amount.toString());
    params.set('merchant', options.merchantWallet);

    if (options.merchantName) params.set('name', options.merchantName);
    if (options.memo) params.set('memo', options.memo);
    if (options.successUrl) params.set('success_url', options.successUrl);
    if (options.cancelUrl) params.set('cancel_url', options.cancelUrl);
    if (options.orderId) params.set('order_id', options.orderId);
    if (options.customerId) params.set('customer_id', options.customerId);

    return `${baseUrl}/checkout?${params.toString()}`;
}

/**
 * Generate a deep link for mobile app integration
 * 
 * For apps that register a custom URL scheme (e.g., mygame://)
 * the success/cancel URLs can redirect back to the app.
 * 
 * Example:
 * - successUrl: "mygame://payment-success?order=123"
 * - cancelUrl: "mygame://payment-cancel?order=123"
 */
export function generateDeepLinkCheckout(
    options: MobileCheckoutOptions,
    appScheme: string,
    baseUrl: string = 'https://settlr.dev'
): string {
    const orderId = options.orderId || `order_${Date.now()}`;

    return generateCheckoutUrl({
        ...options,
        orderId,
        successUrl: `${appScheme}://payment-success?order=${orderId}`,
        cancelUrl: `${appScheme}://payment-cancel?order=${orderId}`,
    }, baseUrl);
}

/**
 * Parse the callback URL when user returns to app
 * 
 * Usage in Swift:
 * ```swift
 * func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
 *     if url.scheme == "mygame" && url.host == "payment-success" {
 *         let signature = URLComponents(url: url, resolvingAgainstBaseURL: true)?
 *             .queryItems?.first(where: { $0.name == "signature" })?.value
 *         // Handle success
 *     }
 * }
 * ```
 */
export function parseCallbackUrl(url: string): MobileCheckoutResult {
    try {
        const parsed = new URL(url);
        const params = parsed.searchParams;

        if (parsed.host === 'payment-success' || parsed.pathname.includes('success')) {
            return {
                success: true,
                signature: params.get('signature') || undefined,
                orderId: params.get('order') || params.get('order_id') || undefined,
            };
        }

        if (parsed.host === 'payment-cancel' || parsed.pathname.includes('cancel')) {
            return {
                success: false,
                orderId: params.get('order') || params.get('order_id') || undefined,
                error: 'Payment cancelled by user',
            };
        }

        return {
            success: false,
            error: 'Unknown callback URL format',
        };
    } catch {
        return {
            success: false,
            error: 'Failed to parse callback URL',
        };
    }
}

/**
 * REST API endpoint info for server-side integration
 * 
 * Mobile games can use these APIs directly without the SDK:
 * 
 * 1. Create checkout session:
 *    POST /api/checkout/create
 *    { amount, merchantWallet, memo }
 *    → { sessionId, checkoutUrl }
 * 
 * 2. Check payment status:
 *    GET /api/checkout/status?session={sessionId}
 *    → { status: 'pending' | 'completed' | 'expired', signature? }
 * 
 * 3. One-click payment (for returning players):
 *    POST /api/one-click
 *    { action: 'charge', customerWallet, merchantWallet, amount }
 *    → { success, signature }
 */
export const REST_API = {
    createSession: '/api/checkout/create',
    checkStatus: '/api/checkout/status',
    oneClick: '/api/one-click',
    webhook: '/api/webhooks', // For server-to-server notifications
};

/**
 * Example Unity C# integration code
 * (For documentation purposes)
 */
export const UNITY_EXAMPLE = `
// SettlrPayment.cs - Drop into your Unity project

using UnityEngine;
using UnityEngine.Networking;
using System.Collections;

public class SettlrPayment : MonoBehaviour
{
    public string merchantWallet = "YOUR_WALLET_ADDRESS";
    public string settlrUrl = "https://settlr.dev";
    
    // Call this to start a payment
    public void StartPayment(float amount, string orderId, System.Action<bool, string> callback)
    {
        string url = $"{settlrUrl}/checkout?amount={amount}&merchant={merchantWallet}&order_id={orderId}";
        
        // Add deep link callback (register mygame:// scheme in your app)
        url += $"&success_url=mygame://payment-success?order={orderId}";
        url += $"&cancel_url=mygame://payment-cancel?order={orderId}";
        
        Application.OpenURL(url);
        
        // Start polling for completion
        StartCoroutine(PollPaymentStatus(orderId, callback));
    }
    
    IEnumerator PollPaymentStatus(string orderId, System.Action<bool, string> callback)
    {
        string statusUrl = $"{settlrUrl}/api/checkout/status?order_id={orderId}";
        
        for (int i = 0; i < 60; i++) // Poll for 5 minutes
        {
            using (UnityWebRequest request = UnityWebRequest.Get(statusUrl))
            {
                yield return request.SendWebRequest();
                
                if (request.result == UnityWebRequest.Result.Success)
                {
                    var response = JsonUtility.FromJson<PaymentStatusResponse>(request.downloadHandler.text);
                    
                    if (response.status == "completed")
                    {
                        callback(true, response.signature);
                        yield break;
                    }
                    else if (response.status == "expired" || response.status == "cancelled")
                    {
                        callback(false, null);
                        yield break;
                    }
                }
            }
            
            yield return new WaitForSeconds(5f); // Check every 5 seconds
        }
        
        callback(false, "Timeout");
    }
    
    [System.Serializable]
    class PaymentStatusResponse
    {
        public string status;
        public string signature;
    }
}
`;

/**
 * Example React Native integration
 */
export const REACT_NATIVE_EXAMPLE = `
// SettlrPayment.tsx - React Native component

import { Linking, Alert } from 'react-native';
import { useEffect } from 'react';

const SETTLR_URL = 'https://settlr.dev';
const APP_SCHEME = 'mygame';

export function useSettlrPayment(onSuccess: (sig: string) => void) {
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      if (url.includes('payment-success')) {
        const sig = new URL(url).searchParams.get('signature');
        if (sig) onSuccess(sig);
      }
    };
    
    Linking.addEventListener('url', handleDeepLink);
    return () => Linking.removeAllListeners('url');
  }, [onSuccess]);
  
  const startPayment = async (amount: number, merchantWallet: string) => {
    const orderId = \`order_\${Date.now()}\`;
    const url = \`\${SETTLR_URL}/checkout?amount=\${amount}&merchant=\${merchantWallet}\` +
      \`&success_url=\${APP_SCHEME}://payment-success?order=\${orderId}\` +
      \`&cancel_url=\${APP_SCHEME}://payment-cancel?order=\${orderId}\`;
    
    await Linking.openURL(url);
  };
  
  return { startPayment };
}
`;
