import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  buildGraph,
  diffGraphs,
  generateMermaid,
  generateSummary,
  parseMarkdownFiles,
} from '../src/index';

describe('parse and build', () => {
  it('parses service/api/env blocks and builds graph', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'devgraph-'));
    const md = `
\n\n\`\`\`devgraph-service
name: api
type: node
commands:
  dev: pnpm dev
  build: pnpm build
\`\`\`
\n\n\`\`\`devgraph-api
service: api
routes:
  GET /health: {}
  POST /v1/user: {}
\`\`\`
\n\n\`\`\`devgraph-env
service: api
vars:
  PORT: "3000"
\`\`\`
`;
    const file = join(dir, 'spec.md');
    writeFileSync(file, md, 'utf8');

    const { blocks, errors } = await parseMarkdownFiles(['**/*.md'], { cwd: dir });
    expect(errors).toHaveLength(0);
    expect(blocks).toHaveLength(3);

    const graph = buildGraph(blocks);
    expect(Object.keys(graph.services)).toEqual(['api']);
    expect(graph.services.api.commands?.dev).toBe('pnpm dev');
    expect(graph.services.api.apis?.[0].routes).toHaveProperty('GET /health');
    expect(graph.services.api.env?.[0].vars).toHaveProperty('PORT', '3000');

    const summary = generateSummary(graph);
    expect(summary).toContain('api (node)');

    const mermaid = generateMermaid(graph);
    expect(mermaid).toContain('graph LR');
  });
});

describe('diffGraphs', () => {
  it('detects additions and removals', () => {
    const base = {
      services: {
        api: {
          name: 'api',
          type: 'node',
          commands: { dev: 'pnpm dev' },
          depends: [],
          apis: [],
          env: [],
        },
      },
      apis: {},
    };
    const next = {
      services: {
        api: {
          name: 'api',
          type: 'node',
          commands: { dev: 'pnpm dev --host' },
          depends: ['db'],
          apis: [{ service: 'api', routes: { 'GET /health': {} } }],
          env: [{ service: 'api', vars: { PORT: '3001' } }],
        },
        web: { name: 'web', type: 'next', depends: ['api'] },
      },
      apis: {},
    };

    const diff = diffGraphs(next as any, base as any);
    expect(diff).toContain('Added services');
    expect(diff).toContain('web');
    expect(diff).toContain('Dependencies');
    expect(diff).toContain('APIs');
  });
});
