export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    date: string; // YYYY-MM-DD
    author: string;
    readTime: string; // e.g. "5 min read"
    tags: string[];
    /** The full post body — supports basic HTML if you want formatting */
    content: string;
}

/*
 * ─────────────────────────────────────────────────
 *  HOW TO ADD A NEW BLOG POST
 * ─────────────────────────────────────────────────
 *  1. Copy one of the objects below
 *  2. Change the slug (must be unique, URL-safe)
 *  3. Fill in title, excerpt, date, content
 *  4. That's it — the listing + post page auto-generate
 * ─────────────────────────────────────────────────
 */

export const posts: BlogPost[] = [
    {
        slug: "accept-crypto-payments-without-wallet",
        title: "How to Accept Crypto Payments Without Requiring a Wallet",
        excerpt:
            "Most crypto payment gateways force your customers to install a wallet, buy gas tokens, and figure out on-chain transactions. Here's how to remove that friction entirely with embedded wallets and gasless transactions.",
        date: "2026-02-16",
        author: "Adam Bryant",
        readTime: "6 min read",
        tags: ["crypto payments", "embedded wallets", "UX", "Solana"],
        content: `
      <p>The biggest barrier to crypto adoption in commerce isn't technology — it's UX. According to <a href="https://triple-a.io/cryptocurrency-ownership-data" target="_blank" rel="noopener noreferrer">Triple-A's 2024 data</a>, there are over 562 million crypto owners globally. But the vast majority of e-commerce checkouts still require customers to:</p>

      <ul>
        <li>Install a browser extension wallet (Phantom, MetaMask)</li>
        <li>Fund it with SOL or ETH for gas fees</li>
        <li>Understand transaction signing and approval flows</li>
      </ul>

      <p>That's a checkout flow with a 90%+ drop-off rate for non-crypto-native users. Compare that to Stripe's one-click checkout.</p>

      <h2>The Solution: Embedded Wallets</h2>

      <p>Embedded wallets (sometimes called "invisible wallets") are wallets that are created and managed behind the scenes. The customer never sees a seed phrase, never installs an extension, never thinks about gas.</p>

      <p>At Settlr, we integrate <strong>Privy</strong> for embedded wallet infrastructure. Here's what the customer experience looks like:</p>

      <ol>
        <li>Customer enters their <strong>email address</strong> (or uses Google/Apple sign-in)</li>
        <li>A wallet is created instantly in the background</li>
        <li>They confirm the payment amount and click "Pay"</li>
        <li>The transaction executes gaslessly on Solana in under 1 second</li>
      </ol>

      <p>From the customer's perspective, it feels like paying with Venmo or Apple Pay — not crypto.</p>

      <h2>Gasless Transactions with Kora</h2>

      <p>Even with an embedded wallet, someone has to pay the gas. On Ethereum, that's often $5–50 per transaction. On Solana, gas is fractions of a cent — but it still requires the user to hold SOL.</p>

      <p>We use <strong>Kora</strong> (backed by the Solana Foundation) to sponsor all transaction fees. Your customers pay $0 in gas. You pay $0 in gas. The transaction cost is covered by the network's fee sponsorship program.</p>

      <h2>Integration: One React Component</h2>

      <p>Here's what the developer integration looks like:</p>

      <pre><code>npm install @settlr/sdk</code></pre>

      <p>Then drop the checkout component into your app:</p>

      <pre><code>&lt;SettlrCheckout
  merchantId="your-merchant-id"
  amount={49.99}
  currency="USDC"
  onSuccess={(tx) =&gt; console.log("Paid!", tx)}
/&gt;</code></pre>

      <p>That's it. No wallet integration code, no gas estimation, no chain switching logic. Most teams go from zero to production in under 30 minutes.</p>

      <h2>The Numbers</h2>

      <ul>
        <li><strong>Fee:</strong> 1% flat (vs Stripe's 2.9% + 30¢)</li>
        <li><strong>Settlement:</strong> Under 1 second (vs 2–7 business days)</li>
        <li><strong>Chargebacks:</strong> Zero (stablecoin payments are final)</li>
        <li><strong>Countries:</strong> 180+ (vs Stripe's 47 payout countries)</li>
      </ul>

      <p>If you're building an AI tool, SaaS product, or any global-first business and want to accept payments without the friction of traditional crypto checkout, <a href="/onboarding">get started with Settlr</a> — it takes less than 30 minutes.</p>
    `,
    },
    {
        slug: "settlr-vs-stripe-crypto-payments",
        title: "Settlr vs Stripe: Why Crypto-Native Teams Are Switching",
        excerpt:
            "Stripe charges 2.9% + 30¢ per transaction and settles in 2–7 days. Settlr charges 1% flat and settles instantly. Here's a detailed breakdown of when each makes sense.",
        date: "2026-02-14",
        author: "Adam Bryant",
        readTime: "7 min read",
        tags: ["comparison", "Stripe", "fees", "settlement"],
        content: `
      <p>Stripe is the gold standard for fiat payment processing. It's reliable, well-documented, and handles the complexity of credit card networks, PCI compliance, and cross-border banking.</p>

      <p>But if your business primarily deals in digital goods, SaaS subscriptions, or serves a global audience — especially in regions where Stripe doesn't support payouts — the calculus changes dramatically.</p>

      <h2>Fee Comparison</h2>

      <p>On $10,000/month in revenue:</p>

      <ul>
        <li><strong>Stripe:</strong> $290 + ~$9 in per-transaction fees = <strong>~$299/month</strong></li>
        <li><strong>Settlr:</strong> $100 flat = <strong>$100/month</strong></li>
        <li><strong>Annual savings:</strong> $2,388</li>
      </ul>

      <p>At $50,000/month, the savings grow to <strong>$11,940/year</strong>. And there are zero chargeback fees — stablecoin transactions are irreversible by design.</p>

      <h2>Settlement Speed</h2>

      <p>Stripe settles to your bank account in 2 business days (standard) or up to 7 days for new accounts. Weekends and holidays add delays. According to the <a href="https://www.federalreserve.gov" target="_blank" rel="noopener noreferrer">Federal Reserve</a>, the average ACH settlement is 1–3 business days.</p>

      <p>Settlr settles in under 1 second. Solana's finality is approximately 400ms per the <a href="https://solana.com/docs" target="_blank" rel="noopener noreferrer">Solana documentation</a>. Funds land in your wallet immediately — weekends, holidays, 3am, doesn't matter.</p>

      <h2>Global Coverage</h2>

      <p>Stripe supports payouts to 47 countries (source: <a href="https://stripe.com/global" target="_blank" rel="noopener noreferrer">stripe.com/global</a>). If your merchant is in a country Stripe doesn't cover, you're locked out entirely.</p>

      <p>Settlr works in 180+ countries. Anyone with an internet connection can accept payments — no bank account required. This is particularly impactful for teams in Latin America, Africa, and Southeast Asia.</p>

      <h2>When Stripe Still Makes Sense</h2>

      <p>Stripe is better when:</p>
      <ul>
        <li>Your customers only pay with credit/debit cards</li>
        <li>You need complex invoicing with net-30/60 terms</li>
        <li>You're in a heavily regulated industry requiring fiat-only rails</li>
      </ul>

      <p>For everything else — especially digital products, AI tools, SaaS, and creator/freelancer payments — Settlr offers dramatically better economics and speed. <a href="/compare">See the full comparison →</a></p>
    `,
    },
    {
        slug: "solana-payment-integration-react",
        title: "How to Integrate Solana Payments in React (Step-by-Step Guide)",
        excerpt:
            "A practical developer guide to accepting USDC payments on Solana in your React or Next.js app. From npm install to production checkout in under 30 minutes.",
        date: "2026-02-10",
        author: "Adam Bryant",
        readTime: "8 min read",
        tags: ["developer guide", "React", "Solana", "USDC", "SDK"],
        content: `
      <p>This guide walks you through integrating Solana-based USDC payments into a React or Next.js application using the Settlr SDK. By the end, you'll have a working checkout that accepts stablecoin payments with zero gas fees and instant settlement.</p>

      <h2>Prerequisites</h2>

      <ul>
        <li>A React or Next.js application</li>
        <li>Node.js 18+</li>
        <li>A Settlr merchant account (<a href="/onboarding">sign up here — takes 2 minutes</a>)</li>
      </ul>

      <h2>Step 1: Install the SDK</h2>

      <pre><code>npm install @settlr/sdk</code></pre>

      <p>The SDK is written in TypeScript and includes React components, hooks, and a REST client. Full types are included — no @types package needed.</p>

      <h2>Step 2: Add the Provider</h2>

      <p>Wrap your app (or the checkout page) with the Settlr provider:</p>

      <pre><code>import { SettlrProvider } from "@settlr/sdk";

export default function App({ children }) {
  return (
    &lt;SettlrProvider merchantId="your-merchant-id"&gt;
      {children}
    &lt;/SettlrProvider&gt;
  );
}</code></pre>

      <h2>Step 3: Add the Checkout Component</h2>

      <pre><code>import { SettlrCheckout } from "@settlr/sdk";

export function PaymentPage() {
  return (
    &lt;SettlrCheckout
      amount={49.99}
      currency="USDC"
      description="Pro Plan — Monthly"
      onSuccess={(result) =&gt; {
        console.log("Transaction hash:", result.txHash);
        // Redirect to success page
      }}
      onError={(error) =&gt; {
        console.error("Payment failed:", error);
      }}
    /&gt;
  );
}</code></pre>

      <p>The component handles everything: wallet creation (via Privy embedded wallets), token selection, gas sponsorship (via Kora), transaction signing, and confirmation.</p>

      <h2>Step 4: Handle Webhooks</h2>

      <p>For server-side confirmation, set up a webhook endpoint:</p>

      <pre><code>// app/api/webhooks/settlr/route.ts
import { verifySettlrWebhook } from "@settlr/sdk/webhooks";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-settlr-signature")!;

  const event = verifySettlrWebhook(body, signature, process.env.SETTLR_WEBHOOK_SECRET!);

  if (event.type === "payment.completed") {
    // Fulfill the order
    await fulfillOrder(event.data.merchantOrderId);
  }

  return new Response("OK", { status: 200 });
}</code></pre>

      <h2>Step 5: Go Live</h2>

      <p>That's it. No Solana program deployment, no RPC configuration, no wallet adapter setup. The SDK abstracts all of that.</p>

      <h2>What You Get</h2>

      <ul>
        <li><strong>1% flat fees</strong> — no per-transaction fixed costs</li>
        <li><strong>Sub-second settlement</strong> — funds in your wallet instantly</li>
        <li><strong>Zero gas for customers</strong> — sponsored by Kora/Solana Foundation</li>
        <li><strong>Embedded wallets</strong> — customers pay with email, no extension needed</li>
        <li><strong>Recurring billing</strong> — built-in subscription support</li>
      </ul>

      <p>For the full API reference, see our <a href="/docs">documentation</a>. For questions, reach out via our <a href="/help">support page</a>.</p>
    `,
    },
    {
        slug: "stripe-banned-your-business",
        title: "Stripe Banned Your Business? Here's What to Do Next",
        excerpt:
            "Your Stripe account got suspended, your payments are frozen, and you're scrambling for answers. You're not alone — and there's a way forward that doesn't involve high-risk merchant accounts.",
        date: "2026-02-15",
        author: "Adam Bryant",
        readTime: "9 min read",
        tags: ["Stripe", "high-risk", "payment processing", "crypto payments"],
        content: `
      <p>You woke up to the email nobody wants: <em>"Your Stripe account has been suspended."</em> Your payments are frozen, your customers can't check out, and you're scrambling for answers. Sound familiar? You're not alone — and there's a way forward.</p>

      <h2>Why Stripe Shuts Down "High-Risk" Businesses</h2>

      <p>Stripe operates on a shared merchant account model. That means every business on their platform shares the same underlying payment infrastructure. When one business generates too many chargebacks or operates in a category Stripe considers risky, it threatens the whole pool. So Stripe's response is simple: cut you off first, explain later.</p>

      <p>The list of industries Stripe restricts or outright bans is long — and growing. It includes:</p>

      <ul>
        <li>CBD and cannabis products</li>
        <li>Nutraceuticals and supplements</li>
        <li>Online gambling and gaming</li>
        <li>Adult content and services</li>
        <li>Firearms and ammunition</li>
        <li>Vaping and tobacco</li>
        <li>Debt collection</li>
        <li>Cryptocurrency-related businesses</li>
        <li>Subscription services with high chargeback rates</li>
        <li>Even some legal services</li>
      </ul>

      <p>If you're in any of these spaces, it's not a matter of <em>if</em> Stripe will shut you down — it's <em>when</em>. Even businesses that have been processing happily for months can wake up to a frozen account with no warning.</p>

      <h2>The Real Cost of Getting Dropped</h2>

      <p>The suspension email is just the beginning. Here's what actually happens:</p>

      <p><strong>Your revenue stops immediately.</strong> Every minute your checkout is broken, you're losing sales. For an ecommerce business doing $10k/month, even a week of downtime is $2,500 gone.</p>

      <p><strong>Your funds get held.</strong> Stripe typically holds your balance for 90–120 days to cover potential chargebacks. That's your money, sitting in limbo, while you try to keep the lights on.</p>

      <p><strong>You're flagged in the system.</strong> Getting terminated by one processor makes it harder to get approved by the next one. Your business ends up on the MATCH list (Member Alert to Control High-Risk Merchants), which is essentially a blacklist that other traditional processors check before approving you.</p>

      <p><strong>Your customers lose trust.</strong> Failed payments, broken checkout pages, and "payment method not accepted" errors erode the trust you've spent months or years building.</p>

      <h2>The Traditional "Solution" (And Why It Sucks)</h2>

      <p>The standard advice is to find a "high-risk merchant account provider." These exist, and they'll approve you. But here's what nobody tells you upfront:</p>

      <ul>
        <li><strong>Setup fees of $200–$500.</strong> Before you've processed a single transaction.</li>
        <li><strong>Processing rates of 3–8%.</strong> Compare that to Stripe's 2.9% + 30¢. On $50,000/month in sales, that's an extra $500–$2,500 in fees every month.</li>
        <li><strong>Rolling reserves.</strong> Many high-risk processors hold 5–10% of your revenue in reserve for 6 months. That's cash you can't touch.</li>
        <li><strong>Long approval times.</strong> While Stripe gets you live in minutes, traditional high-risk accounts take days to weeks, requiring extensive documentation, financial history, and sometimes personal guarantees.</li>
        <li><strong>They can still drop you.</strong> Even specialised high-risk processors use the same underlying card network rails. If Visa or Mastercard decide your industry is too hot, your processor's hands are tied.</li>
      </ul>

      <p>You're essentially paying a premium to rent someone else's infrastructure — infrastructure that can be pulled away from you at any time for reasons outside your control.</p>

      <h2>There's a Third Option: Crypto Payments Without the Crypto Complexity</h2>

      <p>Here's what most business owners don't realise: you can accept crypto payments from your customers without anyone needing a wallet, without gas fees eating into your margins, and without the card networks having any say in what you're allowed to sell.</p>

      <p>That's the approach we built Settlr around.</p>

      <p>Your customer pays with their email address — no MetaMask, no seed phrases, no "connect wallet" popups that scare away 90% of buyers. Behind the scenes, the payment settles in USDC on Solana, which means it's fast (under a second), cheap (zero gas fees to you), and private.</p>

      <p>For you as a merchant, it's one React component dropped into your checkout. That's the entire integration.</p>

      <p><strong>No setup fees. No rolling reserves. No MATCH list. No card network politics.</strong></p>

      <p>The card networks can't ban you from a payment rail they don't control. That's the fundamental shift.</p>

      <h2>Who This Works For</h2>

      <p>Settlr isn't trying to replace Stripe for your local bakery. It's built for businesses where traditional payment processing is either unavailable, unreliable, or unreasonably expensive:</p>

      <ul>
        <li><strong>CBD and cannabis brands</strong> tired of having their third processor in two years</li>
        <li><strong>Supplement companies</strong> dealing with "nutraceutical" classification headaches</li>
        <li><strong>Gaming and gambling platforms</strong> that can't get approved anywhere mainstream</li>
        <li><strong>Adult content creators and platforms</strong> locked out of conventional payments</li>
        <li><strong>Subscription businesses</strong> with chargeback rates that scare traditional processors</li>
        <li><strong>International sellers</strong> dealing with cross-border payment complexity and fees</li>
        <li><strong>Any business</strong> that's been burned by Stripe, PayPal, or Square and wants a backup that can't be taken away</li>
      </ul>

      <h2>Getting Started Takes Five Minutes</h2>

      <p>There's no application process, no underwriting review, no waiting for approval. You drop a React component into your site, configure your settlement preferences, and you're live.</p>

      <p>Your customers see a clean, simple payment flow — enter email, confirm amount, done. No wallet downloads, no crypto jargon, no friction.</p>

      <p>If you've been shut down by Stripe and you're tired of playing the high-risk merchant account game, <a href="/onboarding">try Settlr free</a>. Your checkout shouldn't depend on whether a card network approves of your business model.</p>

      <p>Have questions about switching? Reach out at <a href="mailto:adam@settlr.dev">adam@settlr.dev</a> — we've helped dozens of businesses that were dropped by traditional processors get back to accepting payments within hours, not weeks.</p>
    `,
    },
    {
        slug: "accept-crypto-payments-no-wallet-required",
        title:
            "How to Accept Crypto Payments on Your Website (Without Making Customers Download a Wallet)",
        excerpt:
            "Crypto payments promise lower fees, no chargebacks, and no payment processor gatekeeping. But most of your customers don't have a wallet. Here's how to offer crypto checkout without losing 95% of your buyers.",
        date: "2026-02-13",
        author: "Adam Bryant",
        readTime: "10 min read",
        tags: [
            "crypto payments",
            "ecommerce",
            "wallets",
            "UX",
            "Solana",
            "USDC",
        ],
        content: `
      <p>Crypto payments promise lower fees, no chargebacks, and no payment processor gatekeeping. But there's a problem: most of your customers don't have a crypto wallet. Here's how to offer crypto checkout without losing 95% of your buyers at the payment screen.</p>

      <h2>The Crypto Payment Problem Nobody Talks About</h2>

      <p>If you've looked into accepting crypto on your site, you've probably seen solutions that go something like this: add a "Pay with Crypto" button, the customer clicks it, a popup asks them to connect their MetaMask wallet, and… they leave.</p>

      <p>That's not a hypothetical. Studies consistently show that wallet-based crypto checkout has abandonment rates above 90%. And it makes sense — you're asking someone who just wants to buy a product to:</p>

      <ol>
        <li>Install a browser extension</li>
        <li>Create a wallet</li>
        <li>Write down a seed phrase</li>
        <li>Fund it from an exchange</li>
        <li>Approve a transaction</li>
        <li>Pay gas fees</li>
      </ol>

      <p>All to buy a $40 product.</p>

      <p>For most ecommerce businesses, traditional crypto payment gateways create more friction than they remove. You wanted fewer barriers to payment, and instead you added six new ones.</p>

      <h2>What If Crypto Payments Worked Like Normal Payments?</h2>

      <p>The technology exists to settle payments on a blockchain without requiring the buyer to interact with blockchain infrastructure at all. No wallet. No seed phrase. No gas fees. No browser extension.</p>

      <p>The customer's experience: enter email, confirm the amount, done. The payment settles in USDC (a stablecoin pegged 1:1 to the US dollar) on Solana in under a second.</p>

      <p>That's not a future roadmap — it's how <a href="/onboarding">Settlr</a> works today.</p>

      <p>From the customer's perspective, it feels like any other checkout. From your perspective, you get all the benefits that made crypto payments attractive in the first place.</p>

      <h2>Why This Matters for Your Business</h2>

      <h3>No More Payment Processor Risk</h3>

      <p>Traditional card payments flow through a chain of intermediaries: your payment processor, the acquiring bank, the card network (Visa/Mastercard), and the issuing bank. Any one of them can decide your business is too risky and cut you off.</p>

      <p>With email-based crypto payments, there's no intermediary with a "ban" button. Your payments settle directly on Solana. No card network policies, no processor terms of service, no sudden account freezes.</p>

      <h3>Zero Gas Fees</h3>

      <p>One of the biggest complaints about crypto payments — especially on Ethereum — is gas fees. A $5 purchase shouldn't cost $15 in gas. Solana's transaction costs are fractions of a cent, and with Settlr, the gas cost to you is zero. Your margins stay intact regardless of transaction size.</p>

      <h3>No Chargebacks</h3>

      <p>Chargebacks cost US merchants over $100 billion annually. They're not just a financial drain — a chargeback rate above 1% can get you flagged or dropped by your processor. Crypto payments on a blockchain are final. No disputes filed through a bank, no friendly fraud, no chargeback fees. If there's a legitimate customer issue, you handle it directly through your own refund policy — on your terms.</p>

      <h3>Instant Settlement</h3>

      <p>Card payments take 2–7 business days to hit your bank account. Crypto settles in seconds. For businesses managing cash flow tightly (which is most startups and small businesses), getting paid today instead of next week is a meaningful difference.</p>

      <h3>Works Internationally Without Complexity</h3>

      <p>Accepting payments from a customer in Germany, Nigeria, or Japan through traditional rails means dealing with currency conversion, international card fees, and country-specific regulations. USDC is USDC regardless of where the buyer is. One integration, global reach.</p>

      <h2>How the Integration Actually Works</h2>

      <p>If you're a developer (or have one on your team), the integration is a single React component:</p>

      <pre><code>import { SettlrCheckout } from '@settlr/react'

&lt;SettlrCheckout
  amount={49.99}
  currency="USD"
  onSuccess={(payment) =&gt; handleSuccess(payment)}
  onError={(error) =&gt; handleError(error)}
/&gt;</code></pre>

      <p>That's it. No backend payment server to maintain. No webhook infrastructure to build. No PCI compliance to worry about since you never touch card data — because there are no cards involved.</p>

      <p>The component handles the entire payment flow: collecting the customer's email, processing the payment, settling in USDC, and returning a confirmation.</p>

      <p>For non-developers, we're working on no-code plugins for Shopify, WooCommerce, and other platforms. But if you've got even basic React experience, you can be live in under 10 minutes.</p>

      <h2>"But My Customers Don't Use Crypto"</h2>

      <p>That's exactly the point. They don't need to.</p>

      <p>Your customer enters their email and confirms a dollar amount. They don't see the word "blockchain." They don't interact with a wallet. They don't need to own any cryptocurrency. The settlement layer is invisible to them — just like your customers don't think about ACH transfers and interchange fees when they tap their credit card.</p>

      <p>You're not asking your customers to adopt crypto. You're using crypto infrastructure to give them a simpler, cheaper payment experience.</p>

      <h2>When Does This Make Sense?</h2>

      <p>Email-based crypto payments aren't the right fit for every business. Here's where they shine:</p>

      <ul>
        <li><strong>You're in a "high-risk" industry.</strong> If you sell CBD, supplements, adult content, gaming products, or anything else that traditional processors restrict, crypto payments free you from that gatekeeping entirely.</li>
        <li><strong>You sell internationally.</strong> If a meaningful chunk of your customers are outside your home country, you'll save significantly on cross-border fees and currency conversion.</li>
        <li><strong>You're tired of chargebacks.</strong> If friendly fraud or disputes are eating into your margins, irreversible crypto payments solve the problem at the protocol level.</li>
        <li><strong>You want a backup payment method.</strong> Even if Stripe is working fine today, having a parallel payment option means a processor shutdown doesn't mean a revenue shutdown.</li>
        <li><strong>Your customers are younger and tech-comfortable.</strong> Millennial and Gen Z buyers are increasingly comfortable with non-traditional payment methods. Email-based crypto checkout meets them where they are.</li>
      </ul>

      <h2>Getting Started</h2>

      <p>You can integrate Settlr into your site today — no application, no approval process, no setup fees. Just a React component and a few minutes.</p>

      <p>Head to <a href="/onboarding">settlr.dev</a> to get your API key and start accepting payments that no processor can take away from you.</p>

      <p>Building something in a high-risk vertical and not sure if Settlr is the right fit? Drop us a line at <a href="mailto:adam@settlr.dev">adam@settlr.dev</a> — we're happy to walk you through the integration and answer questions about your specific use case.</p>
    `,
    },
];
