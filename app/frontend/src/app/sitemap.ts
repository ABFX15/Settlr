import { MetadataRoute } from 'next'
import { posts } from './blog/posts'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://settlr.dev'
    const lastModified = new Date()

    const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date + 'T00:00:00'),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }))

    return [
        // ── Core pages ──
        {
            url: baseUrl,
            lastModified,
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/docs`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/compare`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/onboarding`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/demo`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/help`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/send-payments`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/waitlist`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/about`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified,
            changeFrequency: 'yearly',
            priority: 0.3,
        },

        // ── Blog ──
        {
            url: `${baseUrl}/blog`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        ...blogEntries,

        // ── Industries ──
        {
            url: `${baseUrl}/industries/cannabis`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/industries/cannabis-b2b-payments`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.8,
        },

        // ── Integrations ──
        {
            url: `${baseUrl}/integrations`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/integrations/shopify`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/integrations/woocommerce`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/integrations/zapier`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/integrations/slack`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/integrations/bubble`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.7,
        },

        // ── Products ──
        {
            url: `${baseUrl}/products/invoices`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/products/payment-links`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.8,
        },

        // ── Compliance & Learn ──
        {
            url: `${baseUrl}/compliance`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/learn`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/learn/exile-tax`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.9,
        },

        // ── Comparison pages (high-intent SEO) ──
        {
            url: `${baseUrl}/vs/stripe-connect`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/compare/settlr-vs-high-risk-merchant-accounts`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/compare/settlr-vs-cash-armored-cars`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
    ]
}
