import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

type DocsNode = string | { pages?: DocsNode[] };

const docsConfigPath = fileURLToPath(new URL('../../../docs/docs.json', import.meta.url));

const flattenPages = (pages: DocsNode[] = []): string[] =>
  pages.flatMap((page) => {
    if (typeof page === 'string') {
      return [page];
    }

    return flattenPages(page.pages);
  });

export const getDocsRoutes = () => {
  const docsConfig = JSON.parse(fs.readFileSync(docsConfigPath, 'utf8')) as {
    navigation?: { groups?: Array<{ pages?: DocsNode[] }> };
  };

  const pages = docsConfig.navigation?.groups?.flatMap((group) => flattenPages(group.pages)) ?? [];

  return [...new Set(['/docs', ...pages.map((page) => `/docs/${page}`)])];
};
