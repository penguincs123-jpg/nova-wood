import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://novawoodeg.com';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/checkout', '/account'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
