#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  buildGraph,
  diffGraphs,
  formatRunPlan,
  generateAgents,
  generateCodemapMermaid,
  generateMermaid,
  generateRunbook,
  generateSummary,
  getRunPlan,
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
  .command('run')
  .description('Generate a run plan for a service and its dependencies')
  .argument('<service>', 'Service name to run')
  .option('--graph <path>', 'Path to graph.json', '.devgraph/graph.json')
  .option('--runbook', 'Generate a markdown runbook file for AI agents')
  .option('--json', 'Output as JSON')
  .option('--exec', 'Execute the run plan (start all services)')
  .action(
    async (
      service: string,
      options: { graph: string; runbook?: boolean; json?: boolean; exec?: boolean }
    ) => {
      const graphPath = path.resolve(workspaceRoot, options.graph);

      // Load graph
      let graphData;
      try {
        const raw = await readFile(graphPath, 'utf8');
        graphData = JSON.parse(raw);
      } catch {
        console.error(`Graph file not found at: ${graphPath}`);
        console.log('\nRun "devgraph build" first to generate graph.json');
        process.exitCode = 1;
        return;
      }

      // Generate run plan
      const result = getRunPlan(graphData, service);

      if (!result.ok) {
        if (result.error === 'not_found') {
          console.error(`Service not found: ${result.service}`);
          console.log('\nAvailable services:');
          for (const name of Object.keys(graphData.services)) {
            console.log(`  - ${name}`);
          }
        } else if (result.error === 'cycle') {
          console.error(`Dependency cycle detected: ${result.path.join(' → ')}`);
        } else if (result.error === 'missing_dependency') {
          console.error(
            `Service "${result.service}" depends on "${result.missing}" which is not defined`
          );
        }
        process.exitCode = 1;
        return;
      }

      const { plan } = result;

      // Output mode: JSON
      if (options.json) {
        console.log(JSON.stringify(plan, null, 2));
        return;
      }

      // Output mode: Runbook
      if (options.runbook) {
        const runbookDir = path.join(path.dirname(graphPath), 'runbooks');
        await mkdir(runbookDir, { recursive: true });
        const runbookPath = path.join(runbookDir, `${service}.md`);
        const runbookContent = generateRunbook(plan);
        await writeFile(runbookPath, runbookContent);
        console.log(`Runbook generated: ${runbookPath}`);
        return;
      }

      // Output mode: Exec
      if (options.exec) {
        console.log(BANNER);
        console.log(`Starting services for: ${service}\n`);

        for (let i = 0; i < plan.steps.length; i++) {
          const step = plan.steps[i];
          console.log(`[${i + 1}/${plan.steps.length}] Starting ${step.service}...`);

          if (!step.command) {
            console.log(`      ⚠ No dev command defined, skipping`);
            continue;
          }

          console.log(`      → ${step.command}`);

          // For exec, we spawn the command in the background
          // This is a simple implementation - real version might use proper process management
          const proc = spawn(step.command, [], {
            shell: true,
            stdio: 'inherit',
            detached: false,
          });

          // Wait a bit for the service to start
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Check if process died immediately
          if (proc.exitCode !== null && proc.exitCode !== 0) {
            console.log(`      ✗ Failed to start`);
            process.exitCode = 1;
            return;
          }

          console.log(`      ✓ Started`);
        }

        console.log(`\n✓ All ${plan.steps.length} services started`);
        console.log('Press Ctrl+C to stop all.\n');

        // Keep the process running
        await new Promise(() => {});
        return;
      }

      // Default: Print formatted plan
      console.log(formatRunPlan(plan));
    }
  );

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
