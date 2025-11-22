#!/usr/bin/env node
import { Command } from 'commander';
import { buildGraph, parseMarkdownFiles } from '@devgraph/core';

const program = new Command();

program
  .name('devgraph')
  .description('DevGraph CLI (stub)')
  .version('0.0.0');

program
  .command('validate')
  .description('Validate devgraph blocks in markdown files')
  .argument('<paths...>', 'Markdown files or globs')
  .action((paths: string[]) => {
    const { blocks } = parseMarkdownFiles(paths);
    console.log(`Validated ${blocks.length} blocks`);
  });

program
  .command('build')
  .description('Build graph.json and summary outputs (stub)')
  .argument('<paths...>', 'Markdown files or globs')
  .action((paths: string[]) => {
    const { blocks } = parseMarkdownFiles(paths);
    const graph = buildGraph(blocks);
    console.log(`Built graph with ${Object.keys(graph.services).length} services`);
  });

program.parse(process.argv);
