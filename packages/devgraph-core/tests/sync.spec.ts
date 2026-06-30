import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getStatus, syncProject } from '../src/index';

describe('syncProject', () => {
  it('indexes code-first files incrementally and ignores noise by default', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'devgraph-sync-'));

    mkdirSync(join(dir, 'packages/devgraph-cli/src'), { recursive: true });
    mkdirSync(join(dir, 'packages/devgraph-core/src'), { recursive: true });
    mkdirSync(join(dir, 'examples'), { recursive: true });
    mkdirSync(join(dir, 'internal-docs/marketing'), { recursive: true });
    mkdirSync(join(dir, 'apps/docs'), { recursive: true });
    mkdirSync(join(dir, 'apps/web/public'), { recursive: true });

    writeFileSync(join(dir, 'README.md'), '# DevGraph\n');
    writeFileSync(join(dir, 'AGENTS.md'), '# Agent instructions\n');
    writeFileSync(
      join(dir, 'packages/devgraph-cli/src/index.ts'),
      "export const command = 'build';\n"
    );
    writeFileSync(
      join(dir, 'packages/devgraph-core/src/sync.ts'),
      "export async function syncProject() { return 'ok'; }\n"
    );
    writeFileSync(join(dir, 'packages/devgraph-core/src/config.json'), '{ "extends": "./base" }\n');
    writeFileSync(join(dir, 'examples/sample.md'), '# example noise\n');
    writeFileSync(join(dir, 'internal-docs/marketing/plan.md'), '# internal noise\n');
    writeFileSync(join(dir, 'apps/docs/introduction.mdx'), '# docs noise\n');
    writeFileSync(join(dir, 'apps/web/public/logo.svg'), '<svg></svg>\n');

    const first = await syncProject(['.'], {
      cwd: dir,
      outDir: '.devgraph',
    });

    expect(first.stats.discovered).toBe(5);
    expect(first.graph.documents.map((doc) => doc.path).sort()).toEqual([
      'AGENTS.md',
      'README.md',
      'packages/devgraph-cli/src/index.ts',
      'packages/devgraph-core/src/config.json',
      'packages/devgraph-core/src/sync.ts',
    ]);

    const second = await syncProject(['.'], {
      cwd: dir,
      outDir: '.devgraph',
    });

    expect(second.stats.changed).toBe(0);
    expect(second.stats.reused).toBe(5);

    writeFileSync(
      join(dir, 'packages/devgraph-core/src/sync.ts'),
      "export async function syncProject() { return 'changed'; }\n"
    );

    const statusBefore = await getStatus(['.'], {
      cwd: dir,
      outDir: '.devgraph',
    });
    expect(statusBefore.changedFiles).toBe(1);
    expect(statusBefore.staleFiles).toContain('packages/devgraph-core/src/sync.ts');

    const third = await syncProject(['.'], {
      cwd: dir,
      outDir: '.devgraph',
    });
    expect(third.changedPaths).toEqual(['packages/devgraph-core/src/sync.ts']);

    rmSync(join(dir, 'packages/devgraph-cli/src/index.ts'));

    const fourth = await syncProject(['.'], {
      cwd: dir,
      outDir: '.devgraph',
    });

    expect(fourth.removedPaths).toEqual(['packages/devgraph-cli/src/index.ts']);
    expect(
      fourth.graph.documents.some((doc) => doc.path === 'packages/devgraph-cli/src/index.ts')
    ).toBe(false);
  });
});
