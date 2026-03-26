import type { MetadataRoute } from 'next';
import { getDocsRoutes } from '@/lib/docs-routes';

const siteUrl = 'https://devgraph.ameyalambat.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ['/', ...getDocsRoutes()].map((pathname, index) => ({
    url: pathname === '/' ? siteUrl : `${siteUrl}${pathname}`,
    lastModified,
    changeFrequency: pathname === '/' ? 'weekly' : 'monthly',
    priority: index === 0 ? 1 : pathname === '/docs' ? 0.9 : 0.7,
  }));
}
