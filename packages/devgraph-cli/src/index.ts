#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  buildGraph,
  diffGraphs,
  generateAgents,
  generateCodemapMermaid,
  generateMermaid,
  generateSummary,
  parseMarkdownFiles,
} from '@devgraph/core';
import { Command } from 'commander';
import { startStudioServer } from './studio/server.js';
import { openBrowser } from './studio/open-browser.js';

const BANNER = `
╔══════════════════════════════════════╗
║           D E V G R A P H            ║
║       One graph. Every repo.         ║
╚══════════════════════════════════════╝
`;

const program = new Command();
const workspaceRoot = process.env.PNPM_WORKSPACE_ROOT || process.cwd();

program.name('devgraph').description(BANNER).version('0.1.0');

async function handleParse(patterns: string[]) {
  const pats = patterns.length ? patterns : ['**/*.md'];
  const { blocks, errors } = await parseMarkdownFiles(pats, { cwd: workspaceRoot });
  return { pats, blocks, errors };
}

program
  .command('validate')
  .description('Validate devgraph blocks in markdown files')
  .argument('[paths...]', 'Markdown files or globs (default **/*.md)')
  .action(async (paths: string[]) => {
    const { pats, blocks, errors } = await handleParse(paths);
    if (errors.length) {
      console.error(`Found ${errors.length} error(s):`);
      for (const err of errors) console.error(`- ${err.file}: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    if (!blocks.length) {
      console.log('No devgraph blocks found.\n');
      console.log('Add blocks to your markdown like this:\n');
      console.log('  ```devgraph-service');
      console.log('  name: my-service');
      console.log('  type: node');
      console.log('  commands:');
      console.log('    dev: npm run dev');
      console.log('  ```\n');
      console.log('Then run: devgraph build "**/*.md"\n');
      console.log('Docs: https://devgraph.ameyalambat.com');
      return;
    }
    console.log(`Validated ${blocks.length} blocks from patterns: ${pats.join(', ')}`);
  });

program
  .command('build')
  .description('Build graph.json, summary, agents, and mermaid outputs')
  .argument('[paths...]', 'Markdown files or globs (default **/*.md)')
  .option('--out-dir <dir>', 'Output directory', '.devgraph')
  .option('--compare <path>', 'Optional previous graph.json to diff against')
  .action(async (paths: string[], options: { outDir: string; compare?: string }) => {
    const { pats, blocks, errors } = await handleParse(paths);
    if (errors.length) {
      console.error(`Found ${errors.length} error(s):`);
      for (const err of errors) console.error(`- ${err.file}: ${err.message}`);
      process.exitCode = 1;
      return;
    }

    if (!blocks.length) {
      console.log('No devgraph blocks found.\n');
      console.log('Add blocks to your markdown like this:\n');
      console.log('  ```devgraph-service');
      console.log('  name: my-service');
      console.log('  type: node');
      console.log('  commands:');
      console.log('    dev: npm run dev');
      console.log('  ```\n');
      console.log('Then run: devgraph build "**/*.md"\n');
      console.log('Docs: https://devgraph.ameyalambat.com');
      return;
    }

    const graph = buildGraph(blocks);
    const outDir = path.resolve(workspaceRoot, options.outDir);
    await mkdir(outDir, { recursive: true });

    const graphPath = path.join(outDir, 'graph.json');
    await writeFile(graphPath, JSON.stringify(graph, null, 2));

    const summaryPath = path.join(outDir, 'summary.md');
    await writeFile(summaryPath, generateSummary(graph));

    const agentsDir = path.join(outDir, 'agents');
    await mkdir(agentsDir, { recursive: true });
    const agents = generateAgents(graph);
    for (const [name, content] of Object.entries(agents)) {
      await writeFile(path.join(agentsDir, `${name}.md`), content);
    }

    const mermaidPath = path.join(outDir, 'system.mmd');
    await writeFile(mermaidPath, generateMermaid(graph));
    await maybeRenderMermaid(mermaidPath, path.join(outDir, 'system.png'));

    const codemapPath = path.join(outDir, 'codemap.mmd');
    await writeFile(codemapPath, generateCodemapMermaid(graph));
    await maybeRenderMermaid(codemapPath, path.join(outDir, 'codemap.png'));

    if (options.compare) {
      try {
        const prevPath = path.resolve(workspaceRoot, options.compare);
        const prevRaw = await readFile(prevPath, 'utf8');
        const prevGraph = JSON.parse(prevRaw);
        const diff = diffGraphs(graph, prevGraph);
        await writeFile(path.join(outDir, 'integration_notes.md'), diff);
      } catch (err) {
        console.error(`Could not generate diff: ${(err as Error).message}`);
      }
    }

    console.log(
      `Built graph (${Object.keys(graph.services).length} services) from patterns: ${pats.join(', ')}`
    );
    console.log(`Outputs written to ${outDir}`);
  });

program
  .command('studio')
  .description('Start DevGraph Studio server to visualize and edit your graph')
  .option('--port <port>', 'Port to run the server on', '9111')
  .option('--graph <path>', 'Path to graph.json', '.devgraph/graph.json')
  .option('--no-open', 'Do not open browser automatically')
  .action(async (options: { port: string; graph: string; open: boolean }) => {
    const port = parseInt(options.port, 10);
    const graphPath = path.resolve(workspaceRoot, options.graph);

    // Check if graph.json exists
    try {
      await access(graphPath);
    } catch {
      console.error(`Graph file not found at: ${graphPath}`);
      console.log('\nRun "devgraph build" first to generate graph.json');
      process.exitCode = 1;
      return;
    }

    console.log(BANNER);
    console.log('Starting DevGraph Studio...\n');

    try {
      await startStudioServer({ port, graphPath });
      console.log(`Studio server running at: http://localhost:${port}`);
      console.log(`Graph API available at:   http://localhost:${port}/api/graph`);
      console.log('\nPress Ctrl+C to stop the server.\n');

      if (options.open) {
        openBrowser(`http://localhost:${port}`);
      }
    } catch (error) {
      console.error(`Failed to start server: ${(error as Error).message}`);
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv);

async function maybeRenderMermaid(input: string, output: string) {
  // Try using locally installed @mermaid-js/mermaid-cli (mmdc).
  const mmdc = path.join(process.cwd(), 'node_modules', '.bin', 'mmdc');
  await new Promise<void>((resolve) => {
    const proc = spawn(mmdc, ['-i', input, '-o', output], { stdio: 'ignore' });
    proc.on('error', () => resolve()); // missing binary
    proc.on('exit', () => resolve());
  });
}
