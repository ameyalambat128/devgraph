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
  line?: number;
  data: T;
}

export interface HealthCheck {
  http?: string;
  tcp?: number;
  command?: string;
}

export interface ServiceBlock {
  name: string;
  type: string;
  commands?: Record<string, string>;
  depends?: string[];
  ports?: number[];
  healthcheck?: HealthCheck;
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
  line?: number;
  column?: number;
}

export interface ParseResult {
  blocks: DevgraphBlock[];
  errors: ParseError[];
}

export interface ParseOptions {
  cwd?: string;
}

const healthCheckSchema = z.object({
  http: z.string().optional(),
  tcp: z.number().optional(),
  command: z.string().optional(),
});

const serviceSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  commands: z.record(z.string()).optional(),
  depends: z.array(z.string()).optional(),
  ports: z.array(z.number()).optional(),
  healthcheck: healthCheckSchema.optional(),
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
  file: string,
  line?: number
): DevgraphBlock | ParseError | null {
  if (!lang || !lang.startsWith('devgraph-')) return null;
  const type = lang.replace('devgraph-', '') as DevgraphBlockType;
  if (!['service', 'api', 'env'].includes(type)) {
    return { file, line, message: `Unknown devgraph block type "${type}"` };
  }

  let data: unknown;
  try {
    data = yaml.parse(value);
  } catch (error) {
    return { file, line, message: `YAML parse error: ${(error as Error).message}` };
  }

  if (type === 'service') {
    const parsed = serviceSchema.safeParse(data);
    if (!parsed.success) {
      return { file, line, message: `Invalid service block: ${parsed.error.message}` };
    }
    return { type, file, line, data: parsed.data };
  }

  if (type === 'api') {
    const parsed = apiSchema.safeParse(data);
    if (!parsed.success) {
      return { file, line, message: `Invalid api block: ${parsed.error.message}` };
    }
    return { type, file, line, data: parsed.data };
  }

  if (type === 'env') {
    const parsed = envSchema.safeParse(data);
    if (!parsed.success) {
      return { file, line, message: `Invalid env block: ${parsed.error.message}` };
    }
    return { type, file, line, data: parsed.data };
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
      const line = node.position?.start?.line;
      const result = parseBlock(node.lang, node.value, path.relative(cwd, abs), line);
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
  const lines: string[] = [];
  const services = Object.values(graph.services);
  const timestamp = new Date().toISOString().split('T')[0];

  lines.push('# DevGraph Summary');
  lines.push('');
  lines.push(`> Generated by DevGraph on ${timestamp}`);
  lines.push('');

  // Stats
  const totalApis = services.reduce(
    (acc, svc) =>
      acc + (svc.apis?.reduce((a, api) => a + Object.keys(api.routes || {}).length, 0) || 0),
    0
  );
  const totalEnvVars = services.reduce(
    (acc, svc) =>
      acc + (svc.env?.reduce((a, env) => a + Object.keys(env.vars || {}).length, 0) || 0),
    0
  );

  lines.push(`**${services.length}** services | **${totalApis}** API routes | **${totalEnvVars}** env vars`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Services table
  lines.push('## Services');
  lines.push('');

  if (!services.length) {
    lines.push('No services found.');
  } else {
    lines.push('| Service | Type | Dependencies |');
    lines.push('|---------|------|--------------|');
    for (const svc of services) {
      const deps = svc.depends?.join(', ') || '—';
      lines.push(`| **${svc.name}** | ${svc.type} | ${deps} |`);
    }
  }
  lines.push('');

  // Per-service details
  for (const svc of services) {
    lines.push(`### ${svc.name}`);
    lines.push('');

    if (svc.commands && Object.keys(svc.commands).length) {
      lines.push('**Commands:**');
      lines.push('```bash');
      for (const [cmd, script] of Object.entries(svc.commands)) {
        lines.push(`${script}  # ${cmd}`);
      }
      lines.push('```');
      lines.push('');
    }

    if (svc.apis && svc.apis.length) {
      lines.push('**API Routes:**');
      lines.push('| Route | Description |');
      lines.push('|-------|-------------|');
      for (const api of svc.apis) {
        for (const [route, desc] of Object.entries(api.routes || {})) {
          const description = typeof desc === 'string' ? desc : '—';
          lines.push(`| \`${route}\` | ${description} |`);
        }
      }
      lines.push('');
    }

    if (svc.env && svc.env.length) {
      lines.push('**Environment Variables:**');
      lines.push('| Variable | Default |');
      lines.push('|----------|---------|');
      for (const env of svc.env) {
        for (const [key, val] of Object.entries(env.vars)) {
          lines.push(`| \`${key}\` | \`${val}\` |`);
        }
      }
      lines.push('');
    }
  }

  return lines.join('\n') + '\n';
}

export function generateAgents(graph: Devgraph): Record<string, string> {
  const result: Record<string, string> = {};
  const timestamp = new Date().toISOString().split('T')[0];

  for (const svc of Object.values(graph.services)) {
    const lines: string[] = [];

    // Header
    lines.push(`# AGENTS.md — ${svc.name}`);
    lines.push('');
    lines.push(`> Auto-generated by DevGraph on ${timestamp}`);
    lines.push('');

    // Overview
    lines.push('## Overview');
    lines.push('');
    lines.push(`**${svc.name}** is a \`${svc.type}\` service.`);
    if (svc.depends && svc.depends.length) {
      lines.push(`This service depends on: ${svc.depends.map((d) => `\`${d}\``).join(', ')}.`);
    }
    lines.push('');

    // Quick Start (commands as code block)
    if (svc.commands && Object.keys(svc.commands).length) {
      lines.push('## Quick Start');
      lines.push('');
      lines.push('```bash');
      for (const [cmd, script] of Object.entries(svc.commands)) {
        lines.push(`${script}  # ${cmd}`);
      }
      lines.push('```');
      lines.push('');
    }

    // API Endpoints as table
    if (svc.apis && svc.apis.length) {
      lines.push('## API Endpoints');
      lines.push('');
      lines.push('| Method | Path | Description |');
      lines.push('|--------|------|-------------|');
      for (const api of svc.apis) {
        for (const [route, desc] of Object.entries(api.routes || {})) {
          const parts = route.split(' ');
          const method = parts.length > 1 ? parts[0] : 'GET';
          const path = parts.length > 1 ? parts.slice(1).join(' ') : route;
          const description = typeof desc === 'string' && desc ? desc : '—';
          lines.push(`| \`${method}\` | \`${path}\` | ${description} |`);
        }
      }
      lines.push('');
    }

    // Environment Variables as table
    if (svc.env && svc.env.length) {
      lines.push('## Environment Variables');
      lines.push('');
      lines.push('| Variable | Default |');
      lines.push('|----------|---------|');
      for (const env of svc.env) {
        for (const [key, val] of Object.entries(env.vars)) {
          lines.push(`| \`${key}\` | \`${val}\` |`);
        }
      }
      lines.push('');
    }

    // Dependencies section (if any)
    if (svc.depends && svc.depends.length) {
      lines.push('## Dependencies');
      lines.push('');
      lines.push('This service communicates with:');
      for (const dep of svc.depends) {
        const depSvc = graph.services[dep];
        if (depSvc) {
          lines.push(`- **${dep}** (\`${depSvc.type}\`)`);
        } else {
          lines.push(`- **${dep}**`);
        }
      }
      lines.push('');
    }

    result[svc.name] = lines.join('\n').trim() + '\n';
  }
  return result;
}

export function generateMermaid(graph: Devgraph): string {
  return generateServiceMermaid(graph);
}

export function generateServiceMermaid(graph: Devgraph): string {
  const lines = ['graph LR'];
  const services = Object.keys(graph.services).sort();

  const ensureNode = (name: string, type?: string) => {
    const id = sanitizeId(name);
    const label = type ? `${name} (${type})` : name;
    lines.push(`${id}["${label}"]`);
    return id;
  };

  const declared = new Set<string>();

  for (const name of services) {
    const svc = graph.services[name];
    const id = ensureNode(name, svc.type);
    declared.add(id);
    if (svc.depends && svc.depends.length) {
      const deps = [...svc.depends].sort();
      for (const dep of deps) {
        const depId = ensureNode(dep, graph.services[dep]?.type);
        declared.add(depId);
        lines.push(`${id} --> ${depId}`);
      }
    }
  }

  // Make sure standalone nodes still appear even if no edges.
  for (const name of services) {
    const id = sanitizeId(name);
    if (!declared.has(id)) {
      const svc = graph.services[name];
      lines.push(`${id}["${name} (${svc.type})"]`);
    }
  }

  return uniqueLines(lines).join('\n') + '\n';
}

export function generateCodemapMermaid(graph: Devgraph): string {
  const lines: string[] = ['graph LR'];

  // Monorepo-level view (apps/packages/docs/examples).
  push(lines, 'repo[devgraph (turborepo)]');
  push(lines, 'repo --> pkg_core["@devgraph/core"]');
  push(lines, 'repo --> pkg_cli["devgraph-cli"]');
  push(lines, 'repo --> pkg_web["apps/web (docs)"]');
  push(lines, 'repo --> pkg_config["packages/tsconfig + config"]');
  push(lines, 'repo --> pkg_examples["examples/*.md"]');
  push(lines, 'repo --> pkg_docs["docs/DEVLOG.md"]');

  // Relationships between packages.
  push(lines, 'pkg_cli --> pkg_core');
  push(lines, 'pkg_web --> pkg_core');

  // Pipeline view (Markdown -> parser -> outputs).
  push(lines, 'md[Markdown (*.md)] --> blocks[devgraph-* blocks]');
  push(lines, 'pkg_examples --> md');
  push(lines, 'blocks --> parser["@devgraph/core (parser/graph)"]');
  push(lines, 'cli["devgraph-cli"] --> parser');
  push(lines, 'parser --> graphjson[.devgraph/graph.json]');
  push(lines, 'parser --> summary[.devgraph/summary.md]');
  push(lines, 'parser --> agents[.devgraph/agents/*.md]');
  push(lines, 'parser --> mmd[.devgraph/system.mmd/png]');
  push(lines, 'parser --> codemap[.devgraph/codemap.mmd/png]');
  push(lines, 'parser --> diff[.devgraph/integration_notes.md]');

  // Service-level overlay (if any).
  const services = Object.keys(graph.services).sort();
  for (const name of services) {
    const svc = graph.services[name];
    const id = sanitizeId(`svc_${name}`);
    push(lines, `${id}["${name} (${svc.type})"]`);
    push(lines, `graphjson --> ${id}`);
    if (svc.depends && svc.depends.length) {
      for (const dep of [...svc.depends].sort()) {
        const depId = sanitizeId(`svc_${dep}`);
        push(lines, `${id} --> ${depId}`);
      }
    }
  }

  return uniqueLines(lines).join('\n') + '\n';
}

function sanitizeId(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, '_');
}

function push(lines: string[], value: string) {
  lines.push(value);
}

function uniqueLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of lines) {
    if (!seen.has(line)) {
      seen.add(line);
      result.push(line);
    }
  }
  return result;
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

// Re-export agents module
export {
  generateAgentsEnhanced,
  formatAgentsResult,
  inferCommands,
  inferLandmarks,
  inferServiceData,
} from './agents/index.js';
export type {
  GenerateAgentsOptions,
  GenerateAgentsResult,
  InferredCommands,
  InferredData,
} from './agents/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Run Plan
// ─────────────────────────────────────────────────────────────────────────────

export interface RunPlanStep {
  service: string;
  type: string;
  command: string | null;
  env: Record<string, string>;
  ports?: number[];
  healthcheck?: HealthCheck;
}

export interface RunPlan {
  target: string;
  steps: RunPlanStep[];
}

export type RunPlanResult =
  | { ok: true; plan: RunPlan }
  | { ok: false; error: 'not_found'; service: string }
  | { ok: false; error: 'cycle'; path: string[] }
  | { ok: false; error: 'missing_dependency'; service: string; missing: string };

// ─────────────────────────────────────────────────────────────────────────────
// Impact Analysis (Blast Radius)
// ─────────────────────────────────────────────────────────────────────────────

export interface ImpactAnalysis {
  target: string;
  directConsumers: string[];
  transitiveConsumers: string[];
  totalAffectedCount: number;
  affectedApiRouteCount: number;
}

export type ImpactAnalysisResult =
  | { ok: true; impact: ImpactAnalysis }
  | { ok: false; error: 'not_found'; service: string }
  | { ok: false; error: 'cycle'; path: string[] };

export interface CoordinationTask {
  service: string;
  type: string;
  relationship: 'direct' | 'transitive';
  dependencyPath: string[];
  commands: { dev: string | null; test: string | null; build: string | null };
  searchTerms: string[];
}

export interface CoordinationPlan {
  target: string;
  targetType: string;
  reason: string;
  tasks: CoordinationTask[];
  summary: { totalAffectedServices: number; directConsumers: number; transitiveConsumers: number };
}

export type CoordinationResult =
  | { ok: true; plan: CoordinationPlan }
  | { ok: false; error: 'not_found'; service: string }
  | { ok: false; error: 'cycle'; path: string[] };

/**
 * Collect all dependencies for a service (recursive).
 */
function collectDependencies(
  graph: Devgraph,
  serviceName: string,
  visited: Set<string> = new Set(),
  path: string[] = []
): { deps: string[] } | { cycle: string[] } {
  if (path.includes(serviceName)) {
    return { cycle: [...path, serviceName] };
  }
  if (visited.has(serviceName)) {
    return { deps: [] };
  }

  visited.add(serviceName);
  const service = graph.services[serviceName];
  if (!service) {
    return { deps: [] };
  }

  const allDeps: string[] = [];
  for (const dep of service.depends ?? []) {
    const result = collectDependencies(graph, dep, visited, [...path, serviceName]);
    if ('cycle' in result) {
      return result;
    }
    allDeps.push(...result.deps, dep);
  }

  return { deps: allDeps };
}

/**
 * Topological sort using Kahn's algorithm.
 * Returns services in order they should be started (dependencies first).
 */
function topologicalSort(graph: Devgraph, services: string[]): string[] {
  const serviceSet = new Set(services);
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  // Initialize
  for (const name of services) {
    inDegree.set(name, 0);
    adjacency.set(name, []);
  }

  // Build adjacency and in-degree
  for (const name of services) {
    const svc = graph.services[name];
    if (svc?.depends) {
      for (const dep of svc.depends) {
        if (serviceSet.has(dep)) {
          adjacency.get(dep)!.push(name);
          inDegree.set(name, (inDegree.get(name) ?? 0) + 1);
        }
      }
    }
  }

  // Kahn's algorithm
  const queue: string[] = [];
  for (const [name, degree] of inDegree) {
    if (degree === 0) queue.push(name);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);
    for (const neighbor of adjacency.get(current) ?? []) {
      const newDegree = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  return sorted;
}

/**
 * Generate a run plan for a service and all its dependencies.
 */
export function getRunPlan(graph: Devgraph, serviceName: string): RunPlanResult {
  const service = graph.services[serviceName];
  if (!service) {
    return { ok: false, error: 'not_found', service: serviceName };
  }

  // Collect all dependencies
  const depResult = collectDependencies(graph, serviceName);
  if ('cycle' in depResult) {
    return { ok: false, error: 'cycle', path: depResult.cycle };
  }

  // Check for missing dependencies
  const allServices = new Set([serviceName, ...depResult.deps]);
  for (const name of allServices) {
    const svc = graph.services[name];
    if (!svc) {
      return { ok: false, error: 'missing_dependency', service: serviceName, missing: name };
    }
  }

  // Topological sort
  const sorted = topologicalSort(graph, [...allServices]);

  // Build steps
  const steps: RunPlanStep[] = sorted.map((name) => {
    const svc = graph.services[name];
    const envVars: Record<string, string> = {};
    for (const env of svc.env ?? []) {
      Object.assign(envVars, env.vars);
    }

    return {
      service: name,
      type: svc.type,
      command: svc.commands?.dev ?? null,
      env: envVars,
      ports: svc.ports,
      healthcheck: svc.healthcheck,
    };
  });

  return {
    ok: true,
    plan: { target: serviceName, steps },
  };
}

/**
 * Format run plan as a human-readable string.
 */
export function formatRunPlan(plan: RunPlan): string {
  const lines: string[] = [];
  const width = 45;

  lines.push(`╭${'─'.repeat(width)}╮`);
  lines.push(`│  Run Plan: ${plan.target.padEnd(width - 14)}│`);
  lines.push(`╰${'─'.repeat(width)}╯`);
  lines.push('');
  lines.push('Dependencies (run in order):');

  // Calculate column widths
  const maxServiceLen = Math.max(...plan.steps.map((s) => s.service.length), 7);
  const maxCmdLen = Math.max(...plan.steps.map((s) => (s.command ?? 'not defined').length), 7);

  // Header
  lines.push(`┌───┬${'─'.repeat(maxServiceLen + 2)}┬${'─'.repeat(maxCmdLen + 2)}┐`);
  lines.push(`│ # │ ${'Service'.padEnd(maxServiceLen)} │ ${'Command'.padEnd(maxCmdLen)} │`);
  lines.push(`├───┼${'─'.repeat(maxServiceLen + 2)}┼${'─'.repeat(maxCmdLen + 2)}┤`);

  // Rows
  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i];
    const num = String(i + 1).padStart(1);
    const cmd = step.command ?? 'not defined';
    lines.push(`│ ${num} │ ${step.service.padEnd(maxServiceLen)} │ ${cmd.padEnd(maxCmdLen)} │`);
  }

  lines.push(`└───┴${'─'.repeat(maxServiceLen + 2)}┴${'─'.repeat(maxCmdLen + 2)}┘`);

  // Environment variables
  const servicesWithEnv = plan.steps.filter((s) => Object.keys(s.env).length > 0);
  if (servicesWithEnv.length > 0) {
    lines.push('');
    lines.push('Environment Variables:');
    for (const step of servicesWithEnv) {
      const vars = Object.keys(step.env).join(', ');
      lines.push(`  ${step.service}: ${vars}`);
    }
  }

  lines.push('');
  lines.push(`Run with: devgraph run ${plan.target} --exec`);

  return lines.join('\n');
}

/**
 * Generate a runbook markdown file for AI agents.
 */
export function generateRunbook(plan: RunPlan): string {
  const lines: string[] = [];

  lines.push(`# Runbook: Start ${plan.target}`);
  lines.push('');
  lines.push('> Auto-generated by DevGraph');
  lines.push('');

  lines.push('## Prerequisites');
  lines.push('');
  lines.push('- [ ] Required dependencies installed');
  lines.push('- [ ] Environment variables configured');
  lines.push('');

  lines.push('## Steps');
  lines.push('');

  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i];
    lines.push(`### Step ${i + 1}: Start ${step.service}`);
    lines.push('');

    if (step.command) {
      lines.push('```bash');
      lines.push(step.command);
      lines.push('```');
    } else {
      lines.push('> ⚠️ No dev command defined for this service.');
    }
    lines.push('');

    if (step.healthcheck) {
      if (step.healthcheck.http) {
        lines.push(`**Wait for**: \`${step.healthcheck.http}\` returns 200`);
      } else if (step.healthcheck.tcp) {
        lines.push(`**Wait for**: Port ${step.healthcheck.tcp} accepting connections`);
      } else if (step.healthcheck.command) {
        lines.push(`**Wait for**: \`${step.healthcheck.command}\` exits 0`);
      }
      lines.push('');
    }

    if (Object.keys(step.env).length > 0) {
      lines.push('**Environment:**');
      for (const [key, value] of Object.entries(step.env)) {
        lines.push(`- \`${key}=${value}\``);
      }
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('');
  lines.push(`✅ **Success**: All ${plan.steps.length} services started for ${plan.target}`);

  return lines.join('\n');
}

function buildReverseDepMap(graph: Devgraph): Map<string, string[]> {
  const reverseMap = new Map<string, string[]>();

  for (const serviceName of Object.keys(graph.services)) {
    reverseMap.set(serviceName, []);
  }

  for (const [serviceName, service] of Object.entries(graph.services)) {
    for (const dep of service.depends ?? []) {
      const dependents = reverseMap.get(dep);
      if (dependents) {
        dependents.push(serviceName);
      }
    }
  }

  return reverseMap;
}

function collectDependents(
  revMap: Map<string, string[]>,
  name: string,
  visited: Set<string> = new Set(),
  path: string[] = []
): { dependents: string[] } | { cycle: string[] } {
  if (path.includes(name)) {
    return { cycle: [...path, name] };
  }
  if (visited.has(name)) {
    return { dependents: [] };
  }

  visited.add(name);
  const direct = revMap.get(name) ?? [];
  const all: string[] = [];

  for (const dep of direct) {
    const result = collectDependents(revMap, dep, visited, [...path, name]);
    if ('cycle' in result) {
      return result;
    }
    all.push(dep, ...result.dependents);
  }

  return { dependents: all };
}

export function getImpactAnalysis(
  graph: Devgraph,
  serviceName: string
): ImpactAnalysisResult {
  const service = graph.services[serviceName];
  if (!service) {
    return { ok: false, error: 'not_found', service: serviceName };
  }

  const reverseMap = buildReverseDepMap(graph);
  const directConsumers = reverseMap.get(serviceName) ?? [];

  const result = collectDependents(reverseMap, serviceName);
  if ('cycle' in result) {
    return { ok: false, error: 'cycle', path: result.cycle };
  }

  const directSet = new Set(directConsumers);
  const transitiveConsumers = result.dependents.filter((name) => !directSet.has(name));

  const allAffected = new Set([...directConsumers, ...transitiveConsumers]);
  let affectedApiRouteCount = 0;
  for (const affectedService of allAffected) {
    const svc = graph.services[affectedService];
    if (svc?.apis) {
      for (const api of svc.apis) {
        affectedApiRouteCount += Object.keys(api.routes || {}).length;
      }
    }
  }

  return {
    ok: true,
    impact: {
      target: serviceName,
      directConsumers: directConsumers.sort(),
      transitiveConsumers: transitiveConsumers.sort(),
      totalAffectedCount: allAffected.size,
      affectedApiRouteCount,
    },
  };
}

export function formatImpactAnalysis(impact: ImpactAnalysis): string {
  const lines: string[] = [];
  const width = 50;

  lines.push(`╭${'─'.repeat(width)}╮`);
  lines.push(`│  Blast Radius: ${impact.target.padEnd(width - 18)}│`);
  lines.push(`╰${'─'.repeat(width)}╯`);
  lines.push('');

  const riskLevel =
    impact.totalAffectedCount === 0
      ? 'LOW'
      : impact.totalAffectedCount <= 2
        ? 'MEDIUM'
        : 'HIGH';

  lines.push(`Risk Level: ${riskLevel}`);
  lines.push(`  ${impact.totalAffectedCount} service(s) affected`);
  lines.push(`  ${impact.affectedApiRouteCount} API route(s) potentially impacted`);
  lines.push('');

  if (impact.directConsumers.length === 0 && impact.transitiveConsumers.length === 0) {
    lines.push('No services depend on this service.');
    lines.push('Changes here have minimal blast radius.');
    return lines.join('\n');
  }

  if (impact.directConsumers.length > 0) {
    lines.push('Direct Consumers (immediate dependents):');
    const maxLen = Math.max(...impact.directConsumers.map((s) => s.length), 7);
    lines.push(`┌${'─'.repeat(maxLen + 4)}┐`);
    for (const consumer of impact.directConsumers) {
      lines.push(`│  ${consumer.padEnd(maxLen + 1)} │`);
    }
    lines.push(`└${'─'.repeat(maxLen + 4)}┘`);
    lines.push('');
  }

  if (impact.transitiveConsumers.length > 0) {
    lines.push('Transitive Consumers (indirect dependents):');
    const maxLen = Math.max(...impact.transitiveConsumers.map((s) => s.length), 7);
    lines.push(`┌${'─'.repeat(maxLen + 4)}┐`);
    for (const consumer of impact.transitiveConsumers) {
      lines.push(`│  ${consumer.padEnd(maxLen + 1)} │`);
    }
    lines.push(`└${'─'.repeat(maxLen + 4)}┘`);
    lines.push('');
  }

  lines.push('Impact Chain:');
  lines.push(`  ${impact.target} ──┬──> ${impact.directConsumers.join(', ') || '(none)'}`);
  if (impact.transitiveConsumers.length > 0) {
    lines.push(`${' '.repeat(impact.target.length + 2)}   └──>> ${impact.transitiveConsumers.join(', ')}`);
  }

  return lines.join('\n');
}

export function generateImpactRunbook(impact: ImpactAnalysis, graph: Devgraph): string {
  const lines: string[] = [];
  const timestamp = new Date().toISOString().split('T')[0];

  lines.push(`# Impact Runbook: ${impact.target}`);
  lines.push('');
  lines.push(`> Auto-generated by DevGraph on ${timestamp}`);
  lines.push('');

  lines.push('## Summary');
  lines.push('');
  lines.push(
    `Changes to **${impact.target}** affect **${impact.totalAffectedCount}** downstream service(s).`
  );
  lines.push('');

  if (impact.totalAffectedCount === 0) {
    lines.push('This service has no dependents. Changes are isolated.');
    return lines.join('\n');
  }

  lines.push('## Risk Assessment');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Direct Consumers | ${impact.directConsumers.length} |`);
  lines.push(`| Transitive Consumers | ${impact.transitiveConsumers.length} |`);
  lines.push(`| Total Affected Services | ${impact.totalAffectedCount} |`);
  lines.push(`| Affected API Routes | ${impact.affectedApiRouteCount} |`);
  lines.push('');

  lines.push('## Affected Services');
  lines.push('');

  const allAffected = [...impact.directConsumers, ...impact.transitiveConsumers];
  for (const serviceName of allAffected) {
    const svc = graph.services[serviceName];
    const isDirect = impact.directConsumers.includes(serviceName);
    const relationship = isDirect ? 'Direct' : 'Transitive';

    lines.push(`### ${serviceName} (${relationship})`);
    lines.push('');
    lines.push(`**Type:** ${svc?.type ?? 'unknown'}`);
    lines.push('');

    if (svc?.apis && svc.apis.length > 0) {
      lines.push('**Exposed APIs:**');
      for (const api of svc.apis) {
        for (const route of Object.keys(api.routes || {})) {
          lines.push(`- \`${route}\``);
        }
      }
      lines.push('');
    }

    if (svc?.commands?.test) {
      lines.push('**Test Command:**');
      lines.push('```bash');
      lines.push(svc.commands.test);
      lines.push('```');
      lines.push('');
    }
  }

  lines.push('## Pre-Deployment Checklist');
  lines.push('');
  lines.push('Before deploying changes to this service:');
  lines.push('');
  lines.push(`- [ ] Run tests for ${impact.target}`);
  for (const serviceName of allAffected) {
    const svc = graph.services[serviceName];
    if (svc?.commands?.test) {
      lines.push(`- [ ] Run tests for ${serviceName}: \`${svc.commands.test}\``);
    } else {
      lines.push(`- [ ] Verify ${serviceName} compatibility`);
    }
  }
  lines.push('- [ ] Review API contract changes');
  lines.push('- [ ] Update dependent service configurations if needed');
  lines.push('- [ ] Coordinate deployment order with affected teams');
  lines.push('');

  lines.push('## Suggested Deployment Order');
  lines.push('');
  lines.push('When deploying breaking changes, use this order:');
  lines.push('');
  lines.push(`1. Update **${impact.target}** with backward compatibility`);

  let stepNumber = 2;
  for (const consumer of impact.directConsumers) {
    lines.push(`${stepNumber}. Update **${consumer}** to use new API`);
    stepNumber++;
  }
  for (const consumer of impact.transitiveConsumers) {
    lines.push(`${stepNumber}. Verify **${consumer}** still works`);
    stepNumber++;
  }
  lines.push(`${stepNumber}. Remove backward compatibility from **${impact.target}**`);

  return lines.join('\n');
}

function findDependencyPath(
  revMap: Map<string, string[]>,
  from: string,
  to: string
): string[] {
  const queue: string[][] = [[from]];
  const visited = new Set<string>([from]);

  while (queue.length > 0) {
    const currentPath = queue.shift()!;
    const currentNode = currentPath[currentPath.length - 1];

    if (currentNode === to) {
      return currentPath;
    }

    for (const dependent of revMap.get(currentNode) ?? []) {
      if (!visited.has(dependent)) {
        visited.add(dependent);
        queue.push([...currentPath, dependent]);
      }
    }
  }

  return [from, to];
}

function generateSearchTerms(targetName: string, graph: Devgraph): string[] {
  const terms: string[] = [targetName];
  const envPrefix = targetName.toUpperCase().replace(/-/g, '_');
  terms.push(`${envPrefix}_URL`, `${envPrefix}_API_URL`, `${envPrefix}_HOST`);

  const targetService = graph.services[targetName];
  if (targetService?.env) {
    for (const env of targetService.env) {
      for (const key of Object.keys(env.vars)) {
        if (!terms.includes(key)) terms.push(key);
      }
    }
  }

  return terms;
}

export function getCoordinationPlan(
  graph: Devgraph,
  serviceName: string
): CoordinationResult {
  const targetService = graph.services[serviceName];
  if (!targetService) {
    return { ok: false, error: 'not_found', service: serviceName };
  }

  const impactResult = getImpactAnalysis(graph, serviceName);
  if (!impactResult.ok) {
    return impactResult;
  }
  const { impact } = impactResult;

  const revMap = buildReverseDepMap(graph);
  const tasks: CoordinationTask[] = [];
  const searchTerms = generateSearchTerms(serviceName, graph);

  for (const consumerName of impact.directConsumers) {
    const svc = graph.services[consumerName];
    tasks.push({
      service: consumerName,
      type: svc?.type ?? 'unknown',
      relationship: 'direct',
      dependencyPath: [serviceName, consumerName],
      commands: {
        dev: svc?.commands?.dev ?? null,
        test: svc?.commands?.test ?? null,
        build: svc?.commands?.build ?? null,
      },
      searchTerms,
    });
  }

  for (const consumerName of impact.transitiveConsumers) {
    const svc = graph.services[consumerName];
    const depPath = findDependencyPath(revMap, serviceName, consumerName);
    tasks.push({
      service: consumerName,
      type: svc?.type ?? 'unknown',
      relationship: 'transitive',
      dependencyPath: depPath,
      commands: {
        dev: svc?.commands?.dev ?? null,
        test: svc?.commands?.test ?? null,
        build: svc?.commands?.build ?? null,
      },
      searchTerms,
    });
  }

  const reason =
    impact.totalAffectedCount === 0
      ? `Changes to ${serviceName} have no downstream impact.`
      : impact.totalAffectedCount === 1
        ? `Changes to ${serviceName} require coordination with 1 downstream service.`
        : `Changes to ${serviceName} require coordination with ${impact.totalAffectedCount} downstream services.`;

  return {
    ok: true,
    plan: {
      target: serviceName,
      targetType: targetService.type,
      reason,
      tasks,
      summary: {
        totalAffectedServices: impact.totalAffectedCount,
        directConsumers: impact.directConsumers.length,
        transitiveConsumers: impact.transitiveConsumers.length,
      },
    },
  };
}

export function formatCoordinationPlan(plan: CoordinationPlan): string {
  const lines: string[] = [];
  const width = 55;

  lines.push(`╭${'─'.repeat(width)}╮`);
  lines.push(`│  Coordination Plan: ${plan.target.padEnd(width - 23)}│`);
  lines.push(`╰${'─'.repeat(width)}╯`);
  lines.push('');
  lines.push(plan.reason);
  lines.push('');

  if (plan.tasks.length === 0) {
    lines.push('No coordination needed. This service has no dependents.');
    return lines.join('\n');
  }

  lines.push('Summary:');
  lines.push(`  ${plan.summary.directConsumers} direct consumer(s)`);
  lines.push(`  ${plan.summary.transitiveConsumers} transitive consumer(s)`);
  lines.push('');

  const directTasks = plan.tasks.filter((t) => t.relationship === 'direct');
  const transitiveTasks = plan.tasks.filter((t) => t.relationship === 'transitive');

  const formatTasksTable = (tasks: CoordinationTask[]): string[] => {
    const tableLines: string[] = [];
    const maxSvcLen = Math.max(...tasks.map((t) => t.service.length), 7);
    const maxTestLen = Math.max(...tasks.map((t) => (t.commands.test ?? 'none').length), 4);

    tableLines.push(`┌${'─'.repeat(maxSvcLen + 2)}┬${'─'.repeat(maxTestLen + 2)}┐`);
    tableLines.push(`│ ${'Service'.padEnd(maxSvcLen)} │ ${'Test'.padEnd(maxTestLen)} │`);
    tableLines.push(`├${'─'.repeat(maxSvcLen + 2)}┼${'─'.repeat(maxTestLen + 2)}┤`);

    for (const task of tasks) {
      const test = task.commands.test ?? 'none';
      tableLines.push(`│ ${task.service.padEnd(maxSvcLen)} │ ${test.padEnd(maxTestLen)} │`);
    }

    tableLines.push(`└${'─'.repeat(maxSvcLen + 2)}┴${'─'.repeat(maxTestLen + 2)}┘`);
    return tableLines;
  };

  if (directTasks.length > 0) {
    lines.push('Direct Consumers (update first):');
    lines.push(...formatTasksTable(directTasks));
    lines.push('');
  }

  if (transitiveTasks.length > 0) {
    lines.push('Transitive Consumers (verify after):');
    lines.push(...formatTasksTable(transitiveTasks));
    lines.push('');
  }

  const allTerms = new Set<string>();
  for (const task of plan.tasks) {
    for (const term of task.searchTerms) {
      allTerms.add(term);
    }
  }
  const uniqueTerms = [...allTerms].slice(0, 8);
  lines.push('Search Terms:');
  lines.push(`  ${uniqueTerms.join(', ')}`);
  lines.push('');
  lines.push(`Generate runbook: devgraph coordinate ${plan.target} --runbook`);

  return lines.join('\n');
}

export function generateCoordinationRunbook(plan: CoordinationPlan, _graph: Devgraph): string {
  const lines: string[] = [];
  const timestamp = new Date().toISOString().split('T')[0];

  lines.push(`# Coordination Runbook: ${plan.target}`);
  lines.push('');
  lines.push(`> Auto-generated by DevGraph on ${timestamp}`);
  lines.push('');

  lines.push('## Summary');
  lines.push('');
  lines.push(plan.reason);
  lines.push('');
  lines.push('| Metric | Count |');
  lines.push('|--------|-------|');
  lines.push(`| Direct Consumers | ${plan.summary.directConsumers} |`);
  lines.push(`| Transitive Consumers | ${plan.summary.transitiveConsumers} |`);
  lines.push(`| Total Affected | ${plan.summary.totalAffectedServices} |`);
  lines.push('');

  if (plan.tasks.length === 0) {
    lines.push('No downstream services depend on this service.');
    lines.push('Changes can be made without coordination.');
    return lines.join('\n');
  }

  const allTerms = new Set<string>();
  for (const task of plan.tasks) {
    for (const term of task.searchTerms) {
      allTerms.add(term);
    }
  }

  lines.push('## Search Terms');
  lines.push('');
  lines.push('Use these terms to find integration points in dependent services:');
  lines.push('');
  for (const term of allTerms) {
    lines.push(`- \`${term}\``);
  }
  lines.push('');

  lines.push('## Affected Services');
  lines.push('');

  for (const task of plan.tasks) {
    const relationshipLabel = task.relationship === 'direct' ? 'Direct Consumer' : 'Transitive Consumer';

    lines.push(`### ${task.service}`);
    lines.push('');
    lines.push(`**Type:** ${task.type}`);
    lines.push(`**Relationship:** ${relationshipLabel}`);
    lines.push(`**Path:** ${task.dependencyPath.join(' → ')}`);
    lines.push('');

    lines.push('**Commands:**');
    lines.push('');
    if (task.commands.dev) lines.push(`- Dev: \`${task.commands.dev}\``);
    if (task.commands.test) lines.push(`- Test: \`${task.commands.test}\``);
    if (task.commands.build) lines.push(`- Build: \`${task.commands.build}\``);
    if (!task.commands.dev && !task.commands.test && !task.commands.build) {
      lines.push('- (No commands defined)');
    }
    lines.push('');

    lines.push('**Checklist:**');
    lines.push('');
    lines.push(`- [ ] Search for \`${plan.target}\` references in ${task.service}`);
    lines.push('- [ ] Update any type imports or interfaces');
    lines.push('- [ ] Update API calls if contracts changed');
    if (task.commands.test) {
      lines.push(`- [ ] Run tests: \`${task.commands.test}\``);
    } else {
      lines.push('- [ ] Verify service works with changes');
    }
    lines.push('');
  }

  lines.push('## Suggested Coordination Order');
  lines.push('');
  lines.push(`1. Make changes to **${plan.target}** with backward compatibility`);
  lines.push('');

  let stepNumber = 2;
  const directTasks = plan.tasks.filter((t) => t.relationship === 'direct');
  const transitiveTasks = plan.tasks.filter((t) => t.relationship === 'transitive');

  for (const task of directTasks) {
    lines.push(`${stepNumber}. Update **${task.service}** to use new API`);
    if (task.commands.test) lines.push(`   - Run: \`${task.commands.test}\``);
    stepNumber++;
  }

  for (const task of transitiveTasks) {
    lines.push(`${stepNumber}. Verify **${task.service}** still works`);
    if (task.commands.test) lines.push(`   - Run: \`${task.commands.test}\``);
    stepNumber++;
  }

  lines.push(`${stepNumber}. Remove backward compatibility from **${plan.target}**`);
  lines.push('');

  lines.push('## Final Checklist');
  lines.push('');
  lines.push('- [ ] All direct consumers updated');
  lines.push('- [ ] All transitive consumers verified');
  lines.push('- [ ] Integration tests passing');
  lines.push('- [ ] Ready to deploy');

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation Module Export
// ─────────────────────────────────────────────────────────────────────────────

export * from './validate/index.js';
