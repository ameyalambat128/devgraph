import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import yaml from 'yaml';
import { z } from 'zod';
import type {
  ApiBlock,
  Devgraph,
  DevgraphBlock,
  DevgraphBlockType,
  EnvBlock,
  KnowledgeCommunity,
  KnowledgeGraph,
  KnowledgeGraphAnalysis,
  KnowledgeGraphEdge,
  KnowledgeGraphNode,
  ParseError,
  ServiceBlock,
  SurprisingConnection,
} from './index.js';

const EXTRACTOR_VERSION = 'hybrid-build-v1';
const TEXT_EXTENSIONS = new Set([
  '.md',
  '.mdx',
  '.txt',
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.json',
  '.yaml',
  '.yml',
  '.toml',
  '.mjs',
  '.cjs',
  '.css',
  '.scss',
  '.html',
  '.xml',
]);
const CODE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);
const CONFIG_EXTENSIONS = new Set(['.json', '.yaml', '.yml', '.toml']);
const MARKDOWN_EXTENSIONS = new Set(['.md', '.mdx']);
const DEFAULT_IGNORE_PATTERNS = [
  '.git/**',
  '**/.git/**',
  '.devgraph/**',
  '**/.devgraph/**',
  'node_modules/**',
  '**/node_modules/**',
  'dist/**',
  '**/dist/**',
  'build/**',
  '**/build/**',
  '.next/**',
  '**/.next/**',
  'coverage/**',
  '**/coverage/**',
  '.turbo/**',
  '**/.turbo/**',
  '*.min.js',
  '*.map',
];

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
  paths: z.array(z.string()).optional(),
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

interface RawReference {
  targetPath: string;
  sourceLocation?: string;
  evidence?: string;
}

interface FileExtraction {
  filePath: string;
  node: KnowledgeGraphNode;
  references: RawReference[];
  blockRecords: DevgraphBlock[];
  searchText?: string;
  unsupported: boolean;
}

interface CacheEntry {
  hash: string;
  extractorVersion: string;
  extraction: FileExtraction;
}

interface CacheManifest {
  version: string;
  files: Record<string, CacheEntry>;
}

export interface BuildProjectGraphOptions {
  cwd?: string;
  outDir?: string;
}

export interface BuildProjectGraphResult {
  graph: Devgraph;
  files: string[];
  blocks: DevgraphBlock[];
  errors: ParseError[];
  cache: {
    processed: number;
    reused: number;
  };
}

export interface QueryGraphOptions {
  budget?: number;
  dfs?: boolean;
}

const confidenceRank = {
  AMBIGUOUS: 0,
  INFERRED: 1,
  EXTRACTED: 2,
} as const;

function isTextFile(filePath: string) {
  return TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function normalizePath(filePath: string) {
  return filePath.split(path.sep).join('/');
}

function createFileNodeId(filePath: string) {
  return `file:${normalizePath(filePath)}`;
}

function createServiceNodeId(serviceName: string) {
  return `service:${serviceName}`;
}

function sha256(content: Buffer | string) {
  return createHash('sha256').update(content).digest('hex');
}

function dedupe<T>(values: T[]) {
  return Array.from(new Set(values));
}

async function loadIgnorePatterns(cwd: string) {
  const ignoreFile = path.join(cwd, '.devgraphignore');
  const userPatterns = existsSync(ignoreFile)
    ? (await readFile(ignoreFile, 'utf8'))
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'))
    : [];

  return dedupe([...DEFAULT_IGNORE_PATTERNS, ...userPatterns]);
}

async function resolveInputFiles(inputs: string[], cwd: string, ignore: string[]) {
  const normalizedInputs = inputs.length ? inputs : ['.'];
  const patterns: string[] = [];

  for (const input of normalizedInputs) {
    const resolved = path.resolve(cwd, input);
    if (existsSync(resolved)) {
      const relative = normalizePath(path.relative(cwd, resolved)) || '.';
      const stats = await import('node:fs/promises').then(({ stat }) => stat(resolved));
      if (stats.isDirectory()) {
        patterns.push(relative === '.' ? '**/*' : `${relative.replace(/\/$/, '')}/**/*`);
      } else if (stats.isFile()) {
        patterns.push(relative);
      }
      continue;
    }

    patterns.push(normalizePath(input));
  }

  return fg(patterns, {
    cwd,
    absolute: true,
    onlyFiles: true,
    unique: true,
    dot: true,
    ignore,
    followSymbolicLinks: false,
  });
}

function findLineForFragment(content: string, fragment: string) {
  const lines = content.split('\n');
  const index = lines.findIndex((line) => line.includes(fragment));
  return index >= 0 ? `L${index + 1}` : undefined;
}

function parseBlock(lang: string | null | undefined, value: string, file: string, line?: number) {
  if (!lang || !lang.startsWith('devgraph-')) return null;

  const type = lang.replace('devgraph-', '') as DevgraphBlockType;
  let data: unknown;

  try {
    data = yaml.parse(value);
  } catch (error) {
    return {
      error: {
        file,
        line,
        message: `YAML parse error: ${(error as Error).message}`,
      } satisfies ParseError,
    };
  }

  if (type === 'service') {
    const parsed = serviceSchema.safeParse(data);
    if (!parsed.success) {
      return {
        error: {
          file,
          line,
          message: `Invalid service block: ${parsed.error.message}`,
        } satisfies ParseError,
      };
    }
    return {
      block: {
        type,
        file,
        line,
        data: parsed.data,
      } satisfies DevgraphBlock,
    };
  }

  if (type === 'api') {
    const parsed = apiSchema.safeParse(data);
    if (!parsed.success) {
      return {
        error: {
          file,
          line,
          message: `Invalid api block: ${parsed.error.message}`,
        } satisfies ParseError,
      };
    }
    return {
      block: {
        type,
        file,
        line,
        data: parsed.data,
      } satisfies DevgraphBlock,
    };
  }

  if (type === 'env') {
    const parsed = envSchema.safeParse(data);
    if (!parsed.success) {
      return {
        error: {
          file,
          line,
          message: `Invalid env block: ${parsed.error.message}`,
        } satisfies ParseError,
      };
    }
    return {
      block: {
        type,
        file,
        line,
        data: parsed.data,
      } satisfies DevgraphBlock,
    };
  }

  return {
    error: {
      file,
      line,
      message: `Unknown devgraph block type "${type}"`,
    } satisfies ParseError,
  };
}

function extractMarkdownBlocks(content: string, filePath: string) {
  const tree = unified().use(remarkParse).parse(content);
  const blocks: DevgraphBlock[] = [];
  const errors: ParseError[] = [];

  visit(tree, 'code', (node: any) => {
    const result = parseBlock(node.lang, node.value, filePath, node.position?.start?.line);
    if (!result) return;
    if ('error' in result && result.error) {
      errors.push(result.error);
      return;
    }
    blocks.push(result.block);
  });

  return { blocks, errors };
}

function resolveReferenceTarget(
  cwd: string,
  filePath: string,
  rawTarget: string,
  knownFiles: Set<string>
) {
  const cleanTarget = rawTarget.split('#')[0].split('?')[0].trim();
  if (!cleanTarget || cleanTarget.startsWith('http://') || cleanTarget.startsWith('https://')) {
    return null;
  }

  if (cleanTarget.startsWith('/')) {
    const absolute = normalizePath(cleanTarget.slice(1));
    return knownFiles.has(absolute) ? absolute : null;
  }

  const baseDir = path.dirname(filePath);
  const resolved = normalizePath(path.relative(cwd, path.resolve(cwd, baseDir, cleanTarget)));
  return knownFiles.has(resolved) ? resolved : null;
}

function extractPathReferences(content: string) {
  const matches = new Set<string>();
  const pathRegex =
    /(?:\.{1,2}\/|\/)?[A-Za-z0-9_.@-]+(?:\/[A-Za-z0-9_.@-]+)+(?:\.[A-Za-z0-9_-]+)?/g;

  for (const match of content.matchAll(pathRegex)) {
    matches.add(match[0]);
  }

  return Array.from(matches);
}

function extractImportReferences(content: string) {
  const matches = new Set<string>();
  const importRegex =
    /(?:import\s+(?:.+?\s+from\s+)?|export\s+.+?\s+from\s+|require\()\s*['"]([^'"]+)['"]/g;

  for (const match of content.matchAll(importRegex)) {
    matches.add(match[1]);
  }

  return Array.from(matches);
}

function extractMarkdownLinks(content: string) {
  const matches = new Set<string>();
  const markdownLinkRegex = /\[[^\]]+\]\(([^)]+)\)/g;

  for (const match of content.matchAll(markdownLinkRegex)) {
    matches.add(match[1]);
  }

  return Array.from(matches);
}

function extractHeadings(content: string) {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('#'))
    .map((line) => line.replace(/^#+\s*/, '').trim())
    .slice(0, 5);
}

function classifyFile(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  if (MARKDOWN_EXTENSIONS.has(extension)) return 'markdown';
  if (CODE_EXTENSIONS.has(extension)) return 'code';
  if (CONFIG_EXTENSIONS.has(extension)) return 'config';
  if (TEXT_EXTENSIONS.has(extension)) return 'text';
  return 'binary';
}

function createFileNode(filePath: string, content?: string) {
  const headings = content ? extractHeadings(content) : [];
  const label = path.basename(filePath);
  const kind = classifyFile(filePath);
  const summary =
    headings[0] ??
    (content
      ? content
          .split('\n')
          .map((line) => line.trim())
          .find(Boolean)
      : undefined) ??
    label;

  return {
    id: createFileNodeId(filePath),
    kind: 'file',
    label,
    path: normalizePath(filePath),
    summary,
    metadata: {
      fileKind: kind,
      extension: path.extname(filePath).toLowerCase() || 'none',
      headings,
    },
  } satisfies KnowledgeGraphNode;
}

async function extractFile(absPath: string, relPath: string, cwd: string, manifest: CacheManifest) {
  let buffer: Buffer;

  try {
    buffer = await readFile(absPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {
        extraction: {
          filePath: relPath,
          node: createFileNode(relPath),
          references: [],
          blockRecords: [],
          unsupported: true,
        } satisfies FileExtraction,
        hash: '',
        reused: false,
        errors: [] as ParseError[],
      };
    }

    throw error;
  }
  const hash = sha256(buffer);
  const cached = manifest.files[relPath];

  if (cached && cached.hash === hash && cached.extractorVersion === EXTRACTOR_VERSION) {
    return {
      extraction: cached.extraction,
      hash,
      reused: true,
      errors: [] as ParseError[],
    };
  }

  const unsupported = !isTextFile(relPath);
  if (unsupported) {
    const extraction: FileExtraction = {
      filePath: relPath,
      node: createFileNode(relPath),
      references: [],
      blockRecords: [],
      unsupported: true,
    };

    return {
      extraction,
      hash,
      reused: false,
      errors: [] as ParseError[],
    };
  }

  const content = buffer.toString('utf8');
  const references = new Set<string>();
  const extension = path.extname(relPath).toLowerCase();
  const errors: ParseError[] = [];
  const blockRecords: DevgraphBlock[] = [];

  if (MARKDOWN_EXTENSIONS.has(extension)) {
    for (const value of extractMarkdownLinks(content)) references.add(value);
    const blockResult = extractMarkdownBlocks(content, relPath);
    blockRecords.push(...blockResult.blocks);
    errors.push(...blockResult.errors);
  }

  if (CODE_EXTENSIONS.has(extension)) {
    for (const value of extractImportReferences(content)) references.add(value);
  }

  if (
    MARKDOWN_EXTENSIONS.has(extension) ||
    CODE_EXTENSIONS.has(extension) ||
    CONFIG_EXTENSIONS.has(extension) ||
    extension === '.txt'
  ) {
    for (const value of extractPathReferences(content)) references.add(value);
  }

  const extraction: FileExtraction = {
    filePath: relPath,
    node: createFileNode(relPath, content),
    references: Array.from(references).map((value) => ({
      targetPath: value,
      sourceLocation: findLineForFragment(content, value),
      evidence: value,
    })),
    blockRecords,
    searchText: content.toLowerCase().slice(0, 50_000),
    unsupported: false,
  };

  return {
    extraction,
    hash,
    reused: false,
    errors,
  };
}

function buildServiceGraph(blocks: DevgraphBlock[]) {
  const services: Devgraph['services'] = {};
  const apis: Devgraph['apis'] = {};

  for (const block of blocks) {
    if (block.type !== 'service') continue;
    const data = block.data as ServiceBlock;
    services[data.name] ??= { ...data };
  }

  for (const block of blocks) {
    if (block.type === 'api') {
      const data = block.data as ApiBlock;
      apis[data.service] = data;
      const service = services[data.service];
      if (service) {
        service.apis = [...(service.apis ?? []), data];
      }
    }

    if (block.type === 'env') {
      const data = block.data as EnvBlock;
      const service = services[data.service];
      if (service) {
        service.env = [...(service.env ?? []), data];
      }
    }
  }

  return { services, apis };
}

function chooseCommunityLabel(nodes: KnowledgeGraphNode[]) {
  const serviceNode = nodes.find((node) => node.kind === 'service');
  if (serviceNode) return `${serviceNode.label} cluster`;

  const folder =
    nodes.map((node) => node.path?.split('/')[0]).find((value) => value && value !== '.') ??
    'workspace';

  return `${folder} cluster`;
}

function buildUndirectedAdjacency(nodes: KnowledgeGraphNode[], edges: KnowledgeGraphEdge[]) {
  const adjacency = new Map<string, Set<string>>();

  for (const node of nodes) {
    adjacency.set(node.id, new Set());
  }

  for (const edge of edges) {
    adjacency.get(edge.source)?.add(edge.target);
    adjacency.get(edge.target)?.add(edge.source);
  }

  return adjacency;
}

function computeCommunities(nodes: KnowledgeGraphNode[], edges: KnowledgeGraphEdge[]) {
  const adjacency = buildUndirectedAdjacency(nodes, edges);
  const visited = new Set<string>();
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const communities: KnowledgeCommunity[] = [];

  for (const node of nodes) {
    if (visited.has(node.id)) continue;

    const queue = [node.id];
    const nodeIds: string[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      nodeIds.push(current);

      for (const next of adjacency.get(current) ?? []) {
        if (!visited.has(next)) queue.push(next);
      }
    }

    const communityNodes = nodeIds
      .map((nodeId) => nodeMap.get(nodeId))
      .filter((value): value is KnowledgeGraphNode => Boolean(value));

    communities.push({
      id: `community:${communities.length + 1}`,
      label: chooseCommunityLabel(communityNodes),
      nodeIds,
    });
  }

  return communities;
}

function computeBetweenness(nodes: KnowledgeGraphNode[], edges: KnowledgeGraphEdge[]) {
  const adjacency = buildUndirectedAdjacency(nodes, edges);
  const scores = new Map<string, number>(nodes.map((node) => [node.id, 0]));
  const nodeIds = nodes.map((node) => node.id);

  for (const source of nodeIds) {
    const stack: string[] = [];
    const predecessors = new Map<string, string[]>(nodeIds.map((nodeId) => [nodeId, []]));
    const sigma = new Map<string, number>(nodeIds.map((nodeId) => [nodeId, 0]));
    const distance = new Map<string, number>(nodeIds.map((nodeId) => [nodeId, -1]));
    const queue = [source];

    sigma.set(source, 1);
    distance.set(source, 0);

    while (queue.length > 0) {
      const vertex = queue.shift()!;
      stack.push(vertex);

      for (const neighbor of adjacency.get(vertex) ?? []) {
        if (distance.get(neighbor) === -1) {
          queue.push(neighbor);
          distance.set(neighbor, (distance.get(vertex) ?? 0) + 1);
        }

        if (distance.get(neighbor) === (distance.get(vertex) ?? 0) + 1) {
          sigma.set(neighbor, (sigma.get(neighbor) ?? 0) + (sigma.get(vertex) ?? 0));
          predecessors.get(neighbor)?.push(vertex);
        }
      }
    }

    const dependency = new Map<string, number>(nodeIds.map((nodeId) => [nodeId, 0]));

    while (stack.length > 0) {
      const vertex = stack.pop()!;
      for (const predecessor of predecessors.get(vertex) ?? []) {
        const factor =
          ((sigma.get(predecessor) ?? 0) / Math.max(sigma.get(vertex) ?? 1, 1)) *
          (1 + (dependency.get(vertex) ?? 0));
        dependency.set(predecessor, (dependency.get(predecessor) ?? 0) + factor);
      }
      if (vertex !== source) {
        scores.set(vertex, (scores.get(vertex) ?? 0) + (dependency.get(vertex) ?? 0));
      }
    }
  }

  for (const [nodeId, score] of scores) {
    scores.set(nodeId, score / 2);
  }

  return scores;
}

function isNoiseNode(node: KnowledgeGraphNode) {
  if (node.kind !== 'file') return false;
  const basename = path.basename(node.path ?? '').toLowerCase();
  return [
    'pnpm-lock.yaml',
    'package-lock.json',
    'bun.lock',
    'bun.lockb',
    'yarn.lock',
    'tsconfig.json',
    'next-env.d.ts',
  ].includes(basename);
}

function createNodeDescription(node: KnowledgeGraphNode, degree: number, betweenness: number) {
  return {
    id: node.id,
    label: node.label,
    kind: node.kind,
    path: node.path,
    degree,
    betweenness: Number(betweenness.toFixed(3)),
  };
}

function analyzeKnowledgeGraph(
  nodes: KnowledgeGraphNode[],
  edges: KnowledgeGraphEdge[],
  communities: KnowledgeCommunity[],
  services: Devgraph['services']
) {
  const adjacency = buildUndirectedAdjacency(nodes, edges);
  const degrees = new Map(nodes.map((node) => [node.id, adjacency.get(node.id)?.size ?? 0]));
  const betweenness = computeBetweenness(nodes, edges);
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const nodeCommunity = new Map<string, string>();

  for (const community of communities) {
    for (const nodeId of community.nodeIds) {
      nodeCommunity.set(nodeId, community.id);
    }
  }

  const godNodes = nodes
    .filter((node) => !isNoiseNode(node))
    .sort(
      (left, right) =>
        (degrees.get(right.id) ?? 0) - (degrees.get(left.id) ?? 0) ||
        right.label.localeCompare(left.label)
    )
    .slice(0, 10)
    .map((node) =>
      createNodeDescription(node, degrees.get(node.id) ?? 0, betweenness.get(node.id) ?? 0)
    );

  const bridgeNodes = nodes
    .filter((node) => !isNoiseNode(node))
    .sort(
      (left, right) =>
        (betweenness.get(right.id) ?? 0) - (betweenness.get(left.id) ?? 0) ||
        (degrees.get(right.id) ?? 0) - (degrees.get(left.id) ?? 0)
    )
    .slice(0, 10)
    .map((node) =>
      createNodeDescription(node, degrees.get(node.id) ?? 0, betweenness.get(node.id) ?? 0)
    );

  const surprisingConnections = edges
    .filter((edge) => {
      const sourceCommunity = nodeCommunity.get(edge.source);
      const targetCommunity = nodeCommunity.get(edge.target);
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);

      return (
        edge.confidence !== 'EXTRACTED' ||
        sourceCommunity !== targetCommunity ||
        sourceNode?.kind !== targetNode?.kind
      );
    })
    .sort((left, right) => {
      const leftScore =
        confidenceRank[left.confidence] +
        (nodeCommunity.get(left.source) !== nodeCommunity.get(left.target) ? 3 : 0);
      const rightScore =
        confidenceRank[right.confidence] +
        (nodeCommunity.get(right.source) !== nodeCommunity.get(right.target) ? 3 : 0);
      return leftScore - rightScore;
    })
    .slice(0, 8)
    .map((edge) => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      return {
        source: sourceNode?.label ?? edge.source,
        target: targetNode?.label ?? edge.target,
        relation: edge.relation,
        confidence: edge.confidence,
        sourcePath: edge.sourcePath,
        sourceLocation: edge.sourceLocation,
        evidence: edge.evidence,
        note:
          edge.confidence !== 'EXTRACTED'
            ? 'relationship inferred from deterministic signals'
            : sourceNode?.kind !== targetNode?.kind
              ? 'cross-kind connection'
              : 'cross-community connection',
      } satisfies SurprisingConnection;
    });

  const isolatedFiles = nodes
    .filter(
      (node) => node.kind === 'file' && (degrees.get(node.id) ?? 0) <= 1 && !isNoiseNode(node)
    )
    .slice(0, 3);

  const orphanFiles = nodes.filter(
    (node) =>
      node.kind === 'file' &&
      !edges.some((edge) => edge.relation === 'owns' && edge.target === node.id)
  );

  const servicesWithoutFiles = Object.values(services).filter(
    (service) =>
      !edges.some(
        (edge) => edge.relation === 'owns' && edge.source === createServiceNodeId(service.name)
      )
  );

  const unsupportedFiles = nodes.filter(
    (node) => node.kind === 'file' && node.metadata?.fileKind === 'binary'
  );

  const suggestedQuestions = dedupe(
    [
      surprisingConnections[0]
        ? `Why does ${surprisingConnections[0].source} ${surprisingConnections[0].relation} ${surprisingConnections[0].target}?`
        : null,
      bridgeNodes[0] ? `Why is ${bridgeNodes[0].label} a bridge between graph regions?` : null,
      isolatedFiles[0]
        ? `What should connect ${isolatedFiles[0].label} to the rest of the project graph?`
        : null,
      orphanFiles[0] ? `Should ${orphanFiles[0].label} be attached to a service path?` : null,
    ].filter((value): value is string => Boolean(value))
  );

  const coverageGaps = dedupe(
    [
      orphanFiles.length ? `${orphanFiles.length} file(s) are not owned by any service` : null,
      servicesWithoutFiles.length
        ? `${servicesWithoutFiles.length} service(s) have no owned files in the graph`
        : null,
      unsupportedFiles.length
        ? `${unsupportedFiles.length} unsupported binary file(s) were indexed without deep extraction`
        : null,
    ].filter((value): value is string => Boolean(value))
  );

  return {
    godNodes,
    bridgeNodes,
    surprisingConnections,
    suggestedQuestions,
    coverageGaps,
  } satisfies KnowledgeGraphAnalysis;
}

function createGraphReport(graph: Devgraph) {
  const analysis = graph.knowledgeGraph?.analysis;
  const communities = graph.knowledgeGraph?.communities ?? [];
  const fileCount = graph.knowledgeGraph?.nodes.filter((node) => node.kind === 'file').length ?? 0;
  const lines = ['# GRAPH_REPORT', ''];

  lines.push(`- Services: ${Object.keys(graph.services).length}`);
  lines.push(`- Files: ${fileCount}`);
  lines.push(`- Communities: ${communities.length}`);
  lines.push('');

  if (!analysis) {
    lines.push('No knowledge graph analysis available.');
    return `${lines.join('\n')}\n`;
  }

  lines.push('## God Nodes');
  lines.push('');
  for (const node of analysis.godNodes) {
    lines.push(
      `- ${node.label} (${node.kind}) - degree ${node.degree}, betweenness ${node.betweenness}`
    );
  }
  lines.push('');

  lines.push('## Surprising Connections');
  lines.push('');
  for (const connection of analysis.surprisingConnections) {
    const evidence = connection.sourcePath
      ? ` from ${connection.sourcePath}${connection.sourceLocation ? ` ${connection.sourceLocation}` : ''}`
      : '';
    lines.push(
      `- ${connection.source} -> ${connection.target} (${connection.relation}, ${connection.confidence})${evidence}`
    );
  }
  lines.push('');

  lines.push('## Bridge Nodes');
  lines.push('');
  for (const node of analysis.bridgeNodes) {
    lines.push(
      `- ${node.label} (${node.kind}) - degree ${node.degree}, betweenness ${node.betweenness}`
    );
  }
  lines.push('');

  lines.push('## Suggested Questions');
  lines.push('');
  for (const question of analysis.suggestedQuestions) {
    lines.push(`- ${question}`);
  }
  lines.push('');

  lines.push('## Coverage Gaps');
  lines.push('');
  if (analysis.coverageGaps.length === 0) {
    lines.push('- No major coverage gaps detected.');
  } else {
    for (const gap of analysis.coverageGaps) {
      lines.push(`- ${gap}`);
    }
  }
  lines.push('');

  lines.push('## Communities');
  lines.push('');
  for (const community of communities) {
    lines.push(`- ${community.label}: ${community.nodeIds.length} node(s)`);
  }

  return `${lines.join('\n')}\n`;
}

function addOrMergeEdge(edges: Map<string, KnowledgeGraphEdge>, edge: KnowledgeGraphEdge) {
  const key = `${edge.source}|${edge.target}|${edge.relation}`;
  const existing = edges.get(key);

  if (!existing) {
    edges.set(key, edge);
    return;
  }

  if (confidenceRank[edge.confidence] > confidenceRank[existing.confidence]) {
    existing.confidence = edge.confidence;
  }

  if (!existing.sourcePath && edge.sourcePath) {
    existing.sourcePath = edge.sourcePath;
  }

  if (!existing.sourceLocation && edge.sourceLocation) {
    existing.sourceLocation = edge.sourceLocation;
  }

  if (!existing.evidence && edge.evidence) {
    existing.evidence = edge.evidence;
  }
}

function findExplicitOwnership(service: ServiceBlock, filePath: string) {
  return (service.paths ?? []).some((servicePath) => {
    const normalizedServicePath = normalizePath(servicePath).replace(/\/$/, '');
    return filePath === normalizedServicePath || filePath.startsWith(`${normalizedServicePath}/`);
  });
}

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function inferOwners(services: Devgraph['services'], filePath: string) {
  const segments = filePath.split('/').map(normalizeName);
  const owners = Object.values(services)
    .filter((service) => segments.includes(normalizeName(service.name)))
    .map((service) => service.name);

  return owners.length === 1 ? owners : [];
}

function attachCompareSummary(graphReport: string, diff: string | null) {
  if (!diff) return graphReport;
  return `${graphReport}\n## Change Summary\n\n${diff.trim()}\n`;
}

export async function buildProjectGraph(inputs: string[], options: BuildProjectGraphOptions = {}) {
  const cwd = options.cwd ?? process.cwd();
  const outDir = path.resolve(cwd, options.outDir ?? '.devgraph');
  const cacheDir = path.join(outDir, 'cache');
  const cachePath = path.join(cacheDir, 'manifest.json');
  const ignore = await loadIgnorePatterns(cwd);
  const files = (await resolveInputFiles(inputs, cwd, ignore))
    .map((filePath) => normalizePath(path.relative(cwd, filePath)))
    .sort();

  await mkdir(cacheDir, { recursive: true });

  const manifest: CacheManifest = existsSync(cachePath)
    ? JSON.parse(await readFile(cachePath, 'utf8'))
    : { version: '1', files: {} };

  const extractions: FileExtraction[] = [];
  const blocks: DevgraphBlock[] = [];
  const errors: ParseError[] = [];
  const nextManifest: CacheManifest = { version: '1', files: {} };
  let processed = 0;
  let reused = 0;

  for (const relPath of files) {
    const absPath = path.resolve(cwd, relPath);
    const result = await extractFile(absPath, relPath, cwd, manifest);
    extractions.push(result.extraction);
    blocks.push(...result.extraction.blockRecords);
    errors.push(...result.errors);
    if (result.reused) reused += 1;
    else processed += 1;
    nextManifest.files[relPath] = {
      hash: result.hash,
      extractorVersion: EXTRACTOR_VERSION,
      extraction: result.extraction,
    };
  }

  await writeFile(cachePath, JSON.stringify(nextManifest, null, 2));

  const serviceGraph = buildServiceGraph(blocks);
  const nodes: KnowledgeGraphNode[] = [];
  const nodeMap = new Map<string, KnowledgeGraphNode>();
  const edges = new Map<string, KnowledgeGraphEdge>();
  const knownFiles = new Set(files);

  for (const extraction of extractions) {
    nodes.push(extraction.node);
    nodeMap.set(extraction.node.id, extraction.node);
  }

  for (const service of Object.values(serviceGraph.services)) {
    const node: KnowledgeGraphNode = {
      id: createServiceNodeId(service.name),
      kind: 'service',
      label: service.name,
      service: service.name,
      summary: `${service.name} (${service.type})`,
      metadata: {
        serviceType: service.type,
        paths: service.paths ?? [],
      },
    };
    nodes.push(node);
    nodeMap.set(node.id, node);
  }

  for (const block of blocks) {
    if (block.type !== 'service') continue;
    const service = block.data as ServiceBlock;
    addOrMergeEdge(edges, {
      source: createServiceNodeId(service.name),
      target: createFileNodeId(block.file),
      relation: 'defined_in',
      confidence: 'EXTRACTED',
      sourcePath: block.file,
      sourceLocation: block.line ? `L${block.line}` : undefined,
      evidence: 'devgraph-service block',
    });
  }

  for (const service of Object.values(serviceGraph.services)) {
    for (const dependency of service.depends ?? []) {
      addOrMergeEdge(edges, {
        source: createServiceNodeId(service.name),
        target: createServiceNodeId(dependency),
        relation: 'depends_on',
        confidence: 'EXTRACTED',
        sourcePath: service.name,
        evidence: 'service dependency',
      });
    }
  }

  for (const extraction of extractions) {
    const filePath = extraction.filePath;
    const explicitOwners = Object.values(serviceGraph.services)
      .filter((service) => findExplicitOwnership(service, filePath))
      .map((service) => service.name);
    const inferredOwners =
      explicitOwners.length === 0 ? inferOwners(serviceGraph.services, filePath) : [];
    const owners = explicitOwners.length > 0 ? explicitOwners : inferredOwners;
    const confidence = explicitOwners.length > 0 ? 'EXTRACTED' : 'INFERRED';

    for (const owner of owners) {
      addOrMergeEdge(edges, {
        source: createServiceNodeId(owner),
        target: createFileNodeId(filePath),
        relation: 'owns',
        confidence,
        sourcePath: filePath,
        evidence:
          explicitOwners.length > 0 ? 'service path ownership' : 'path-based ownership inference',
      });
    }

    for (const reference of extraction.references) {
      const resolvedTarget = resolveReferenceTarget(
        cwd,
        filePath,
        reference.targetPath,
        knownFiles
      );
      if (!resolvedTarget) continue;
      addOrMergeEdge(edges, {
        source: createFileNodeId(filePath),
        target: createFileNodeId(resolvedTarget),
        relation: 'references',
        confidence: 'EXTRACTED',
        sourcePath: filePath,
        sourceLocation: reference.sourceLocation,
        evidence: reference.evidence,
      });
    }
  }

  for (const extraction of extractions) {
    if (!extraction.searchText) continue;

    for (const service of Object.values(serviceGraph.services)) {
      const serviceName = service.name.toLowerCase();
      if (!extraction.searchText.includes(serviceName)) continue;

      addOrMergeEdge(edges, {
        source: createFileNodeId(extraction.filePath),
        target: createServiceNodeId(service.name),
        relation: 'documents',
        confidence: MARKDOWN_EXTENSIONS.has(path.extname(extraction.filePath).toLowerCase())
          ? 'EXTRACTED'
          : 'AMBIGUOUS',
        sourcePath: extraction.filePath,
        evidence: `mentions ${service.name}`,
      });
    }
  }

  const communities = computeCommunities(nodes, Array.from(edges.values()));
  const communityByNode = new Map<string, string>();

  for (const community of communities) {
    for (const nodeId of community.nodeIds) {
      communityByNode.set(nodeId, community.id);
    }
  }

  for (const node of nodes) {
    node.community = communityByNode.get(node.id);
  }

  const analysis = analyzeKnowledgeGraph(
    nodes,
    Array.from(edges.values()),
    communities,
    serviceGraph.services
  );

  const knowledgeGraph: KnowledgeGraph = {
    nodes,
    edges: Array.from(edges.values()),
    communities,
    analysis,
  };

  return {
    graph: {
      services: serviceGraph.services,
      apis: serviceGraph.apis,
      knowledgeGraph,
    },
    files,
    blocks,
    errors,
    cache: {
      processed,
      reused,
    },
  } satisfies BuildProjectGraphResult;
}

export function generateGraphReport(graph: Devgraph, diff: string | null = null) {
  return attachCompareSummary(createGraphReport(graph), diff);
}

function tokenizeQuestion(question: string) {
  return question
    .toLowerCase()
    .split(/[^a-z0-9_.-]+/g)
    .filter((token) => token.length > 1);
}

function scoreNode(node: KnowledgeGraphNode, tokens: string[]) {
  const haystack = [
    node.label,
    node.path,
    node.service,
    node.summary,
    ...(Array.isArray(node.metadata?.headings) ? node.metadata.headings : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return tokens.reduce((score, token) => {
    if (node.label.toLowerCase().includes(token)) return score + 5;
    if (node.path?.toLowerCase().includes(token)) return score + 4;
    if (haystack.includes(token)) return score + 2;
    return score;
  }, 0);
}

function traverseGraph(graph: KnowledgeGraph, seedIds: string[], useDfs: boolean) {
  const seen = new Set<string>();
  const pending = [...seedIds];
  const selectedNodes = new Set<string>();
  const adjacency = buildUndirectedAdjacency(graph.nodes, graph.edges);

  while (pending.length > 0 && selectedNodes.size < 20) {
    const current = useDfs ? pending.pop()! : pending.shift()!;
    if (seen.has(current)) continue;
    seen.add(current);
    selectedNodes.add(current);

    for (const neighbor of adjacency.get(current) ?? []) {
      if (!seen.has(neighbor)) pending.push(neighbor);
    }
  }

  const selectedEdges = graph.edges.filter(
    (edge) => selectedNodes.has(edge.source) && selectedNodes.has(edge.target)
  );

  return {
    nodes: graph.nodes.filter((node) => selectedNodes.has(node.id)),
    edges: selectedEdges,
  };
}

function enforceBudget(text: string, budget: number) {
  const words = text.split(/\s+/);
  if (words.length <= budget) return text;
  return `${words.slice(0, budget).join(' ')}\n\n[truncated to budget]`;
}

export function queryGraph(graph: Devgraph, question: string, options: QueryGraphOptions = {}) {
  const knowledgeGraph = graph.knowledgeGraph;
  if (!knowledgeGraph) {
    return 'No knowledge graph available. Run `devgraph build` first.\n';
  }

  const budget = options.budget ?? 400;
  const tokens = tokenizeQuestion(question);
  const rankedNodes = knowledgeGraph.nodes
    .map((node) => ({
      node,
      score: scoreNode(node, tokens),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);

  if (rankedNodes.length === 0) {
    return 'No matching nodes found in the knowledge graph.\n';
  }

  const traversed = traverseGraph(
    knowledgeGraph,
    rankedNodes.map((entry) => entry.node.id),
    options.dfs ?? false
  );

  const lines = ['# Query Result', '', `Question: ${question}`, ''];
  lines.push('## Seed Nodes');
  lines.push('');
  for (const entry of rankedNodes) {
    lines.push(`- ${entry.node.label} (${entry.node.kind})`);
  }
  lines.push('');

  lines.push('## Nodes');
  lines.push('');
  for (const node of traversed.nodes) {
    lines.push(
      `- ${node.label} (${node.kind})${node.path ? ` - ${node.path}` : ''}${node.community ? ` - ${node.community}` : ''}`
    );
  }
  lines.push('');

  lines.push('## Edges');
  lines.push('');
  for (const edge of traversed.edges) {
    const source =
      knowledgeGraph.nodes.find((node) => node.id === edge.source)?.label ?? edge.source;
    const target =
      knowledgeGraph.nodes.find((node) => node.id === edge.target)?.label ?? edge.target;
    lines.push(
      `- ${source} -> ${target} (${edge.relation}, ${edge.confidence})${edge.sourcePath ? ` - ${edge.sourcePath}` : ''}${edge.sourceLocation ? ` ${edge.sourceLocation}` : ''}`
    );
  }

  return `${enforceBudget(lines.join('\n'), budget)}\n`;
}
