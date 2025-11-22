import { readFile } from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import yaml from 'yaml';

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
  routes: Record<string, Record<string, unknown> | unknown>;
}

export interface EnvBlock {
  service: string;
  vars: Record<string, string>;
}

export interface Devgraph {
  services: Record<string, (ServiceBlock & { apis?: ApiBlock[]; env?: EnvBlock[] })>;
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

function parseBlock(lang: string | null | undefined, value: string, file: string): DevgraphBlock | ParseError | null {
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

  // Basic validation per type.
  if (type === 'service') {
    const svc = data as Partial<ServiceBlock>;
    if (!svc?.name || !svc?.type) {
      return { file, message: 'service block requires name and type' };
    }
  }
  if (type === 'api') {
    const api = data as Partial<ApiBlock>;
    if (!api?.service || !api?.routes) {
      return { file, message: 'api block requires service and routes' };
    }
  }
  if (type === 'env') {
    const env = data as Partial<EnvBlock>;
    if (!env?.service || !env?.vars) {
      return { file, message: 'env block requires service and vars' };
    }
  }

  return { type, file, data };
}

export async function parseMarkdownFiles(patterns: string[], options: ParseOptions = {}): Promise<ParseResult> {
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
      services[data.name] = { ...data };
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
        for (const [route, meta] of Object.entries(routes)) {
          lines.push(`    - ${route}${meta ? ' ' : ''}`);
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
    const lines: string[] = [`# AGENTS.md (${svc.name})`, '', '## Overview', `${svc.name} service (${svc.type}).`, ''];
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
        for (const [route] of Object.entries(api.routes || {})) {
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
    if (svc.depends) {
      for (const dep of svc.depends) {
        lines.push(`${svc.name} --> ${dep}`);
      }
    }
    if (!svc.depends || svc.depends.length === 0) {
      lines.push(`${svc.name}`);
    }
  }
  return lines.join('\n') + '\n';
}
