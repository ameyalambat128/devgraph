import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { ArtifactLink, CachedArtifact, GraphEdge, GraphNode, SourceChunk } from './types.js';
import { EXTRACTION_VERSION } from './types.js';
import type { DiscoveredSource } from './discovery.js';
import {
  clampText,
  createFileNodeId,
  createSymbolNodeId,
  escapeRegex,
  lineNumberAt,
  normalizePath,
  uniqueBy,
} from './utils.js';

const TS_LIKE_SYMBOL_PATTERNS = [
  /^(?:export\s+)?class\s+([A-Za-z_$][\w$]*)/,
  /^(?:export\s+)?interface\s+([A-Za-z_$][\w$]*)/,
  /^(?:export\s+)?type\s+([A-Za-z_$][\w$]*)/,
  /^(?:export\s+)?enum\s+([A-Za-z_$][\w$]*)/,
  /^(?:export\s+)?function\s+([A-Za-z_$][\w$]*)/,
  /^(?:export\s+)?async\s+function\s+([A-Za-z_$][\w$]*)/,
  /^(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=/,
  /^(?:export\s+)?let\s+([A-Za-z_$][\w$]*)\s*=/,
  /^(?:export\s+)?var\s+([A-Za-z_$][\w$]*)\s*=/,
];

const PYTHON_SYMBOL_PATTERNS = [/^class\s+([A-Za-z_][\w]*)/, /^def\s+([A-Za-z_][\w]*)/];

function summarizeFile(content: string, filePath: string) {
  const firstLine = content
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);

  return clampText(firstLine ?? path.basename(filePath), 160);
}

function createFileChunk(filePath: string, content: string) {
  const lines = content.split('\n');
  const excerpt = lines.slice(0, 40).join('\n').trim();

  return {
    id: `chunk:file:${normalizePath(filePath)}`,
    path: filePath,
    text: excerpt,
    kind: 'file',
    startLine: 1,
    endLine: Math.max(1, Math.min(lines.length, 40)),
  } satisfies SourceChunk;
}

function extractSymbolDefinitions(source: DiscoveredSource, content: string) {
  const lines = content.split('\n');
  const patterns = source.language === 'python' ? PYTHON_SYMBOL_PATTERNS : TS_LIKE_SYMBOL_PATTERNS;
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const chunks: SourceChunk[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const match = patterns
      .map((pattern) => trimmed.match(pattern))
      .find((result): result is RegExpMatchArray => Boolean(result));

    if (!match) return;

    const name = match[1];
    const startLine = index + 1;
    const endLine = Math.min(lines.length, startLine + 20);
    const symbolId = createSymbolNodeId(source.relPath, name, startLine);
    const snippet = lines.slice(index, endLine).join('\n').trim();

    nodes.push({
      id: symbolId,
      kind: 'symbol',
      label: name,
      path: source.relPath,
      language: source.language,
      startLine,
      endLine,
      summary: clampText(snippet.split('\n')[0] ?? name, 120),
    });

    edges.push({
      source: createFileNodeId(source.relPath),
      target: symbolId,
      relation: 'contains',
      path: source.relPath,
      line: startLine,
      evidence: name,
    });

    edges.push({
      source: createFileNodeId(source.relPath),
      target: symbolId,
      relation: 'defines',
      path: source.relPath,
      line: startLine,
      evidence: name,
    });

    chunks.push({
      id: `chunk:symbol:${normalizePath(source.relPath)}:${name}:${startLine}`,
      path: source.relPath,
      text: snippet,
      kind: 'symbol',
      startLine,
      endLine,
    });
  });

  return {
    nodes: uniqueBy(nodes, (node) => node.id),
    edges,
    chunks,
  };
}

function extractImports(content: string) {
  const regex =
    /(?:import\s+(?:.+?\s+from\s+)?|export\s+.+?\s+from\s+|require\()\s*['"]([^'"]+)['"]/g;
  return Array.from(content.matchAll(regex)).map((match) => ({
    relation: 'imports' as const,
    target: match[1],
    line: lineNumberAt(content, match[0]),
    evidence: match[0],
  }));
}

function extractReferences(content: string) {
  const regex = /(?:\.{1,2}\/|\/)?[A-Za-z0-9_.@-]+(?:\/[A-Za-z0-9_.@-]+)+(?:\.[A-Za-z0-9_-]+)?/g;

  return Array.from(content.matchAll(regex)).map((match) => ({
    relation: 'references' as const,
    target: match[0],
    line: lineNumberAt(content, match[0]),
    evidence: match[0],
  }));
}

function uniqueLinks(links: ArtifactLink[]) {
  return uniqueBy(links, (link) => `${link.relation}:${link.target}:${link.line}`);
}

export async function extractArtifact(source: DiscoveredSource) {
  const content = await readFile(source.absPath, 'utf8');
  const fileNodeId = createFileNodeId(source.relPath);
  const fileNode: GraphNode = {
    id: fileNodeId,
    kind: 'file',
    label: path.basename(source.relPath),
    path: source.relPath,
    language: source.language,
    summary: summarizeFile(content, source.relPath),
  };

  const symbolData = extractSymbolDefinitions(source, content);
  const links =
    source.kind === 'context'
      ? uniqueLinks(extractReferences(content))
      : uniqueLinks([...extractImports(content), ...extractReferences(content)]);

  return {
    version: EXTRACTION_VERSION,
    document: {
      path: source.relPath,
      kind: source.kind,
      language: source.language,
      hash: '',
      size: source.size,
      indexedAt: '',
    },
    nodes: [fileNode, ...symbolData.nodes],
    edges: symbolData.edges,
    chunks: [createFileChunk(source.relPath, content), ...symbolData.chunks],
    links,
  } satisfies CachedArtifact;
}

export function scoreMention(haystack: string, needle: string) {
  if (needle.length < 3) return false;
  return new RegExp(`\\b${escapeRegex(needle)}\\b`, 'i').test(haystack);
}
