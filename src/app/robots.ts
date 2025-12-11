import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://flumberico.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/dashboard/',
                    '/profile/',
                    '/settings/',
                    '/onboarding/',
                    '/preferences/',
                    '/applications/',
                    '/analytics/',
                    '/auth/',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/dashboard/',
                    '/profile/',
                    '/settings/',
                    '/onboarding/',
                    '/preferences/',
                    '/applications/',
                    '/analytics/',
                    '/auth/',
                ],
                crawlDelay: 0,
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
