#!/usr/bin/env node
import {
  getStatus,
  queryGraph,
  readGraph,
  syncProject,
  watchProject,
  type StatusResult,
  type SyncResult,
} from '@devgraph/core';
import { Command } from 'commander';
import { VERSION } from './version.js';

const program = new Command();
const workspaceRoot = process.env.PNPM_WORKSPACE_ROOT || process.cwd();

function printSyncResult(result: SyncResult) {
  const preview = (paths: string[]) =>
    paths.length <= 12 ? paths : [...paths.slice(0, 12), `...and ${paths.length - 12} more`];

  console.log(`Synced ${result.stats.indexed} file(s) into ${result.paths.graphPath}`);
  console.log(
    `Changed ${result.stats.changed}, reused ${result.stats.reused}, removed ${result.stats.removed}`
  );
  if (result.changedPaths.length > 0) {
    console.log(`Updated: ${preview(result.changedPaths).join(', ')}`);
  }
  if (result.removedPaths.length > 0) {
    console.log(`Removed: ${preview(result.removedPaths).join(', ')}`);
  }
}

function printStatus(status: StatusResult) {
  console.log(`Index version: ${status.version}`);
  console.log(`Extraction version: ${status.extractionVersion}`);
  console.log(`Indexed files: ${status.indexedFiles}`);
  console.log(`Changed files: ${status.changedFiles}`);
  console.log(`Manifest: ${status.manifestPath}`);
  console.log(`Graph: ${status.graphPath}`);
  if (status.lastSyncAt) {
    console.log(`Last sync: ${status.lastSyncAt}`);
  }
  if (status.staleFiles.length > 0) {
    console.log(`Stale: ${status.staleFiles.join(', ')}`);
  }
}

program
  .name('devgraph')
  .description('Persistent local code memory for AI coding assistants')
  .version(VERSION);

program
  .command('build')
  .description('Sync changed code into the local memory graph')
  .argument('[paths...]', 'Files, directories, or globs to index')
  .option('--out-dir <dir>', 'Output directory', '.devgraph')
  .option('--force', 'Bypass the shrink guard')
  .option('--json', 'Print the sync result as JSON')
  .action(async (paths: string[], options: { outDir: string; force?: boolean; json?: boolean }) => {
    try {
      const result = await syncProject(paths, {
        cwd: workspaceRoot,
        outDir: options.outDir,
        force: options.force,
      });

      if (result.guarded) {
        console.error('Refusing to overwrite the graph because the rebuild shrank too much.');
        console.error('Re-run with --force if this is intentional.');
        process.exitCode = 1;
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      printSyncResult(result);
    } catch (error) {
      console.error((error as Error).message);
      process.exitCode = 1;
    }
  });

program
  .command('watch')
  .description('Watch the repo and keep the local memory graph fresh')
  .argument('[paths...]', 'Files, directories, or globs to index')
  .option('--out-dir <dir>', 'Output directory', '.devgraph')
  .option('--force', 'Bypass the shrink guard')
  .option('--debounce <ms>', 'Debounce time in milliseconds', '300')
  .action(
    async (paths: string[], options: { outDir: string; force?: boolean; debounce: string }) => {
      try {
        const watcher = await watchProject(paths, {
          cwd: workspaceRoot,
          outDir: options.outDir,
          force: options.force,
          debounceMs: Number(options.debounce) || 300,
          onSync(result) {
            if (result.guarded) {
              console.error(
                'Watch sync refused to overwrite the graph because it shrank too much.'
              );
              return;
            }

            printSyncResult(result);
          },
        });

        const shutdown = () => {
          watcher.close();
          process.exit(0);
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
        console.log('Watching for changes. Press Ctrl+C to stop.');
        await new Promise(() => {});
      } catch (error) {
        console.error((error as Error).message);
        process.exitCode = 1;
      }
    }
  );

program
  .command('query')
  .description('Query the local memory graph for code understanding')
  .argument('<question>', 'Question to ask against the graph')
  .option('--graph <path>', 'Path to graph.json', '.devgraph/graph.json')
  .option('--budget <n>', 'Approximate word budget for the response', '500')
  .option('--json', 'Print the query result as JSON')
  .action(async (question: string, options: { graph: string; budget: string; json?: boolean }) => {
    try {
      const graph = await readGraph(options.graph);
      const response = queryGraph(graph, question, {
        budget: Number(options.budget) || 500,
      });

      if (options.json) {
        console.log(JSON.stringify(response.result, null, 2));
        return;
      }

      console.log(response.text);
    } catch (error) {
      console.error((error as Error).message);
      process.exitCode = 1;
    }
  });

program
  .command('status')
  .description('Show local memory graph health and freshness')
  .argument('[paths...]', 'Files, directories, or globs to inspect')
  .option('--out-dir <dir>', 'Output directory', '.devgraph')
  .option('--json', 'Print the status as JSON')
  .action(async (paths: string[], options: { outDir: string; json?: boolean }) => {
    try {
      const status = await getStatus(paths, {
        cwd: workspaceRoot,
        outDir: options.outDir,
      });

      if (options.json) {
        console.log(JSON.stringify(status, null, 2));
        return;
      }

      printStatus(status);
    } catch (error) {
      console.error((error as Error).message);
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv);
