import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://novawoodeg.com';

  // In production, fetch slugs from backend
  const staticRoutes = [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/products`, lastModified: new Date() },
    { url: `${baseUrl}/cart`, lastModified: new Date() },
    { url: `${baseUrl}/checkout`, lastModified: new Date() },
    { url: `${baseUrl}/account`, lastModified: new Date() },
    { url: `${baseUrl}/pages/about`, lastModified: new Date() },
    { url: `${baseUrl}/pages/faq`, lastModified: new Date() },
    { url: `${baseUrl}/pages/privacy`, lastModified: new Date() },
    { url: `${baseUrl}/pages/terms`, lastModified: new Date() },
  ];

  return staticRoutes;
}
