import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildProjectGraph, generateGraphReport, queryGraph } from '../src/index';

describe('buildProjectGraph', () => {
  it('builds a hybrid graph, honors ignore rules, and reuses cache entries', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'devgraph-hybrid-'));

    mkdirSync(join(dir, 'services/api/src'), { recursive: true });
    mkdirSync(join(dir, 'services/db/src'), { recursive: true });
    mkdirSync(join(dir, 'docs'), { recursive: true });
    mkdirSync(join(dir, 'dist'), { recursive: true });

    writeFileSync(
      join(dir, 'docs/architecture.md'),
      [
        '# Architecture',
        '',
        '```devgraph-service',
        'name: api',
        'type: node',
        'paths:',
        '  - services/api',
        'depends:',
        '  - db',
        'commands:',
        '  dev: pnpm dev',
        '```',
        '',
        '```devgraph-service',
        'name: db',
        'type: postgres',
        'paths:',
        '  - services/db',
        '```',
        '',
        'The api service documents the docs and runtime.',
      ].join('\n'),
      'utf8'
    );

    writeFileSync(
      join(dir, 'services/api/src/index.ts'),
      "import '../../db/src/client';\nexport const service = 'api';\n",
      'utf8'
    );
    writeFileSync(join(dir, 'services/db/src/client.ts'), "export const client = 'db';\n", 'utf8');
    writeFileSync(join(dir, 'dist/generated.js'), 'console.log("ignore me")\n', 'utf8');
    writeFileSync(join(dir, '.devgraphignore'), 'dist/**\n', 'utf8');

    const first = await buildProjectGraph(['.'], {
      cwd: dir,
      outDir: '.devgraph',
    });

    expect(first.errors).toHaveLength(0);
    expect(first.graph.knowledgeGraph).toBeDefined();
    expect(first.graph.knowledgeGraph?.nodes.some((node) => node.id === 'service:api')).toBe(true);
    expect(
      first.graph.knowledgeGraph?.nodes.some((node) => node.id === 'file:services/api/src/index.ts')
    ).toBe(true);
    expect(
      first.graph.knowledgeGraph?.edges.some(
        (edge) =>
          edge.relation === 'owns' &&
          edge.source === 'service:api' &&
          edge.target === 'file:services/api/src/index.ts'
      )
    ).toBe(true);
    expect(
      first.graph.knowledgeGraph?.nodes.some((node) => node.path === 'dist/generated.js')
    ).toBe(false);

    const report = generateGraphReport(first.graph);
    expect(report).toContain('## God Nodes');
    expect(report).toContain('## Coverage Gaps');

    const query = queryGraph(first.graph, 'api client');
    expect(query).toContain('Query Result');
    expect(query).toContain('index.ts');

    const second = await buildProjectGraph(['.'], {
      cwd: dir,
      outDir: '.devgraph',
    });

    expect(second.cache.reused).toBeGreaterThan(0);
  });
});
