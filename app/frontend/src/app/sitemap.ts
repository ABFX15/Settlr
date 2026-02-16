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
            url: `${baseUrl}/demo`,
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
            url: `${baseUrl}/help`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/industries/ai-saas`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        ...blogEntries,
        {
            url: `${baseUrl}/checkout`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/offramp`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/compare`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
    ]
}
