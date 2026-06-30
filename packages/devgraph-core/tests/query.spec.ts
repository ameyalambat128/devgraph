import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { queryGraph, syncProject } from '../src/index';

describe('queryGraph', () => {
  it('finds implementation files from code-first graph data', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'devgraph-query-'));

    mkdirSync(join(dir, 'packages/devgraph-cli/src'), { recursive: true });
    mkdirSync(join(dir, 'packages/devgraph-core/src'), { recursive: true });

    writeFileSync(
      join(dir, 'packages/devgraph-cli/src/index.ts'),
      [
        "import { syncProject } from '../../devgraph-core/src/sync';",
        '',
        "program.command('build').action(async () => syncProject(['.']));",
      ].join('\n')
    );
    writeFileSync(
      join(dir, 'packages/devgraph-core/src/sync.ts'),
      ['export async function syncProject() {', "  return 'ok';", '}'].join('\n')
    );

    const build = await syncProject(['.'], {
      cwd: dir,
      outDir: '.devgraph',
    });

    const response = queryGraph(build.graph, 'where is devgraph build implemented');

    expect(
      response.result.files.some((file) => file.path === 'packages/devgraph-cli/src/index.ts')
    ).toBe(true);
    expect(response.text).toContain('packages/devgraph-cli/src/index.ts');
  });
});
