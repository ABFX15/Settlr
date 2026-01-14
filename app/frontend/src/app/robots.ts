import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://settlr.dev'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/dashboard/', '/analytics/', '/history/', '/offramp/', '/igaming/'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/igaming/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
