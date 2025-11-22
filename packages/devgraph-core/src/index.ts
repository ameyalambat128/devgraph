import { readFile } from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import yaml from 'yaml';
import { z } from 'zod';

export type DevgraphBlockType = 'service' | 'api' | 'env';

export interface DevgraphBlock<T = unknown> {
  type: DevgraphBlockType;
  file: string;
  data: T;
}

export interface ServiceBlock {
  name: string;
  type: string;
  commands?: Record<string, string>;
  depends?: string[];
}

export interface ApiBlock {
  service: string;
  routes: Record<string, unknown>;
}

export interface EnvBlock {
  service: string;
  vars: Record<string, string>;
}

export interface Devgraph {
  services: Record<string, ServiceBlock & { apis?: ApiBlock[]; env?: EnvBlock[] }>;
  apis: Record<string, ApiBlock>;
}

export interface ParseError {
  file: string;
  message: string;
}

export interface ParseResult {
  blocks: DevgraphBlock[];
  errors: ParseError[];
}

export interface ParseOptions {
  cwd?: string;
}

const serviceSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  commands: z.record(z.string()).optional(),
  depends: z.array(z.string()).optional(),
});

const apiSchema = z.object({
  service: z.string().min(1),
  routes: z.record(z.unknown()),
});

const envSchema = z.object({
  service: z.string().min(1),
  vars: z.record(z.string()),
});

function parseBlock(
  lang: string | null | undefined,
  value: string,
  file: string
): DevgraphBlock | ParseError | null {
  if (!lang || !lang.startsWith('devgraph-')) return null;
  const type = lang.replace('devgraph-', '') as DevgraphBlockType;
  if (!['service', 'api', 'env'].includes(type)) {
    return { file, message: `Unknown devgraph block type "${type}"` };
  }

  let data: unknown;
  try {
    data = yaml.parse(value);
  } catch (error) {
    return { file, message: `YAML parse error: ${(error as Error).message}` };
  }

  if (type === 'service') {
    const parsed = serviceSchema.safeParse(data);
    if (!parsed.success) {
      return { file, message: `Invalid service block: ${parsed.error.message}` };
    }
    return { type, file, data: parsed.data };
  }

  if (type === 'api') {
    const parsed = apiSchema.safeParse(data);
    if (!parsed.success) {
      return { file, message: `Invalid api block: ${parsed.error.message}` };
    }
    return { type, file, data: parsed.data };
  }

  if (type === 'env') {
    const parsed = envSchema.safeParse(data);
    if (!parsed.success) {
      return { file, message: `Invalid env block: ${parsed.error.message}` };
    }
    return { type, file, data: parsed.data };
  }

  return null;
}

export async function parseMarkdownFiles(
  patterns: string[],
  options: ParseOptions = {}
): Promise<ParseResult> {
  const cwd = options.cwd ?? process.cwd();
  const files = await fg(patterns, { cwd, absolute: true, onlyFiles: true });
  const blocks: DevgraphBlock[] = [];
  const errors: ParseError[] = [];

  for (const abs of files) {
    const content = await readFile(abs, 'utf8');
    const tree = unified().use(remarkParse).parse(content);

    visit(tree, 'code', (node: any) => {
      const result = parseBlock(node.lang, node.value, path.relative(cwd, abs));
      if (!result) return;
      if ('message' in result) {
        errors.push(result);
      } else {
        blocks.push(result);
      }
    });
  }

  return { blocks, errors };
}

export function buildGraph(blocks: DevgraphBlock[]): Devgraph {
  const services: Devgraph['services'] = {};
  const apis: Devgraph['apis'] = {};

  for (const block of blocks) {
    if (block.type === 'service') {
      const data = block.data as ServiceBlock;
      if (!services[data.name]) {
        services[data.name] = { ...data };
      }
    }
  }

  for (const block of blocks) {
    if (block.type === 'api') {
      const data = block.data as ApiBlock;
      apis[`${data.service}`] = data;
      const svc = services[data.service];
      if (svc) {
        svc.apis = [...(svc.apis ?? []), data];
      }
    }
    if (block.type === 'env') {
      const data = block.data as EnvBlock;
      const svc = services[data.service];
      if (svc) {
        svc.env = [...(svc.env ?? []), data];
      }
    }
  }

  return { services, apis };
}

export function generateSummary(graph: Devgraph): string {
  const lines: string[] = ['# Summary', '', '## Services'];
  const services = Object.values(graph.services);

  if (!services.length) {
    lines.push('- None found.');
  }

  for (const svc of services) {
    lines.push(`- ${svc.name} (${svc.type})`);
    if (svc.commands && Object.keys(svc.commands).length) {
      lines.push('  - commands:');
      for (const [k, v] of Object.entries(svc.commands)) {
        lines.push(`    - ${k}: ${v}`);
      }
    }
    if (svc.depends && svc.depends.length) {
      lines.push(`  - depends: ${svc.depends.join(', ')}`);
    }
    if (svc.apis && svc.apis.length) {
      lines.push('  - apis:');
      for (const api of svc.apis) {
        const routes = api.routes || {};
        for (const route of Object.keys(routes)) {
          lines.push(`    - ${route}`);
        }
      }
    }
    if (svc.env && svc.env.length) {
      lines.push('  - env vars:');
      for (const env of svc.env) {
        lines.push(...Object.keys(env.vars).map((k) => `    - ${k}`));
      }
    }
  }

  return lines.join('\n') + '\n';
}

export function generateAgents(graph: Devgraph): Record<string, string> {
  const result: Record<string, string> = {};
  for (const svc of Object.values(graph.services)) {
    const lines: string[] = [
      `# AGENTS.md (${svc.name})`,
      '',
      '## Overview',
      `${svc.name} service (${svc.type}).`,
      '',
    ];
    if (svc.commands && Object.keys(svc.commands).length) {
      lines.push('## Commands');
      for (const [k, v] of Object.entries(svc.commands)) {
        lines.push(`- ${k}: ${v}`);
      }
      lines.push('');
    }
    if (svc.depends && svc.depends.length) {
      lines.push('## Dependencies');
      for (const dep of svc.depends) lines.push(`- ${dep}`);
      lines.push('');
    }
    if (svc.apis && svc.apis.length) {
      lines.push('## APIs');
      for (const api of svc.apis) {
        for (const route of Object.keys(api.routes || {})) {
          lines.push(`- ${route}`);
        }
      }
      lines.push('');
    }
    if (svc.env && svc.env.length) {
      lines.push('## Env Vars');
      for (const env of svc.env) {
        for (const key of Object.keys(env.vars)) lines.push(`- ${key}`);
      }
      lines.push('');
    }
    result[svc.name] = lines.join('\n').trim() + '\n';
  }
  return result;
}

export function generateMermaid(graph: Devgraph): string {
  const lines = ['graph LR'];
  for (const svc of Object.values(graph.services)) {
    if (svc.depends && svc.depends.length) {
      for (const dep of svc.depends) {
        lines.push(`${svc.name} --> ${dep}`);
      }
    } else {
      lines.push(`${svc.name}`);
    }
  }
  return lines.join('\n') + '\n';
}

export function diffGraphs(newGraph: Devgraph, oldGraph: Devgraph): string {
  const lines: string[] = ['# Integration Notes', ''];
  const newServices = new Set(Object.keys(newGraph.services));
  const oldServices = new Set(Object.keys(oldGraph.services));

  const added = [...newServices].filter((s) => !oldServices.has(s));
  const removed = [...oldServices].filter((s) => !newServices.has(s));

  if (added.length) {
    lines.push('## Added services', ...added.map((s) => `- ${s}`), '');
  }
  if (removed.length) {
    lines.push('## Removed services', ...removed.map((s) => `- ${s}`), '');
  }

  for (const name of Object.keys(newGraph.services)) {
    const next = newGraph.services[name];
    const prev = oldGraph.services[name];
    if (!prev) continue;
    const svcLines: string[] = [];

    const prevDeps = new Set(prev.depends ?? []);
    const nextDeps = new Set(next.depends ?? []);
    const addedDeps = [...nextDeps].filter((d) => !prevDeps.has(d));
    const removedDeps = [...prevDeps].filter((d) => !nextDeps.has(d));
    if (addedDeps.length || removedDeps.length) {
      svcLines.push('  - Dependencies:');
      if (addedDeps.length) svcLines.push(`    - Added: ${addedDeps.join(', ')}`);
      if (removedDeps.length) svcLines.push(`    - Removed: ${removedDeps.join(', ')}`);
    }

    const prevCmds = prev.commands ?? {};
    const nextCmds = next.commands ?? {};
    const cmdChanges: string[] = [];
    for (const key of new Set([...Object.keys(prevCmds), ...Object.keys(nextCmds)])) {
      if (!(key in prevCmds)) cmdChanges.push(`    - Added ${key}: ${nextCmds[key]}`);
      else if (!(key in nextCmds)) cmdChanges.push(`    - Removed ${key}: ${prevCmds[key]}`);
      else if (prevCmds[key] !== nextCmds[key]) {
        cmdChanges.push(`    - Updated ${key}: ${prevCmds[key]} -> ${nextCmds[key]}`);
      }
    }
    if (cmdChanges.length) {
      svcLines.push('  - Commands:');
      svcLines.push(...cmdChanges);
    }

    const prevEnvVars = collectEnv(prev);
    const nextEnvVars = collectEnv(next);
    const envAdded = [...nextEnvVars].filter((v) => !prevEnvVars.has(v));
    const envRemoved = [...prevEnvVars].filter((v) => !nextEnvVars.has(v));
    if (envAdded.length || envRemoved.length) {
      svcLines.push('  - Env vars:');
      if (envAdded.length) svcLines.push(`    - Added: ${envAdded.join(', ')}`);
      if (envRemoved.length) svcLines.push(`    - Removed: ${envRemoved.join(', ')}`);
    }

    const prevRoutes = collectRoutes(prev);
    const nextRoutes = collectRoutes(next);
    const routesAdded = [...nextRoutes].filter((r) => !prevRoutes.has(r));
    const routesRemoved = [...prevRoutes].filter((r) => !nextRoutes.has(r));
    if (routesAdded.length || routesRemoved.length) {
      svcLines.push('  - APIs:');
      if (routesAdded.length) svcLines.push(`    - Added: ${routesAdded.join(', ')}`);
      if (routesRemoved.length) svcLines.push(`    - Removed: ${routesRemoved.join(', ')}`);
    }

    if (svcLines.length) {
      lines.push(`## ${name}`, ...svcLines, '');
    }
  }

  if (lines.length === 2) lines.push('No changes detected.');
  return lines.join('\n').trim() + '\n';
}

function collectEnv(svc: ServiceBlock & { env?: EnvBlock[] }): Set<string> {
  const vars = new Set<string>();
  for (const env of svc.env ?? []) {
    Object.keys(env.vars || {}).forEach((k) => vars.add(k));
  }
  return vars;
}

function collectRoutes(svc: ServiceBlock & { apis?: ApiBlock[] }): Set<string> {
  const routes = new Set<string>();
  for (const api of svc.apis ?? []) {
    Object.keys(api.routes || {}).forEach((k) => routes.add(k));
  }
  return routes;
}
