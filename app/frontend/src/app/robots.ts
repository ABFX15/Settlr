import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://settlr.dev'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/dashboard/',
                    '/client-dashboard/',
                    '/analytics/',
                    '/history/',
                    '/offramp/',
                    '/igaming/',
                    '/checkout/',
                    '/me/',
                    '/merchant/',
                    '/create/',
                    '/test-sdk/',
                    '/claim/',
                    '/invoice/',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/igaming/'],
            },
            // Explicitly allow AI search engine bots
            { userAgent: 'GPTBot', allow: '/' },
            { userAgent: 'ChatGPT-User', allow: '/' },
            { userAgent: 'Google-Extended', allow: '/' },
            { userAgent: 'ClaudeBot', allow: '/' },
            { userAgent: 'anthropic-ai', allow: '/' },
            { userAgent: 'PerplexityBot', allow: '/' },
            { userAgent: 'Bytespider', allow: '/' },
            { userAgent: 'CCBot', allow: '/' },
            { userAgent: 'cohere-ai', allow: '/' },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
