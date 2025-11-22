#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  buildGraph,
  generateAgents,
  generateMermaid,
  generateSummary,
  parseMarkdownFiles,
} from '@devgraph/core';
import { Command } from 'commander';

const program = new Command();

program.name('devgraph').description('DevGraph CLI').version('0.0.0');

async function handleParse(patterns: string[]) {
  const pats = patterns.length ? patterns : ['**/*.md'];
  const { blocks, errors } = await parseMarkdownFiles(pats);
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
    console.log(`Validated ${blocks.length} blocks from patterns: ${pats.join(', ')}`);
  });

program
  .command('build')
  .description('Build graph.json, summary, agents, and mermaid outputs')
  .argument('[paths...]', 'Markdown files or globs (default **/*.md)')
  .option('--out-dir <dir>', 'Output directory', '.devgraph')
  .action(async (paths: string[], options: { outDir: string }) => {
    const { pats, blocks, errors } = await handleParse(paths);
    if (errors.length) {
      console.error(`Found ${errors.length} error(s):`);
      for (const err of errors) console.error(`- ${err.file}: ${err.message}`);
      process.exitCode = 1;
      return;
    }

    const graph = buildGraph(blocks);
    const outDir = path.resolve(options.outDir);
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

    console.log(
      `Built graph (${Object.keys(graph.services).length} services) from patterns: ${pats.join(', ')}`
    );
    console.log(`Outputs written to ${outDir}`);
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
