import path from 'node:path';
import type { CachedArtifact, DevgraphGraph, GraphEdge, GraphNode } from './types.js';
import { GRAPH_VERSION } from './types.js';
import {
  createFileNodeId,
  createSymbolNodeId,
  escapeRegex,
  normalizePath,
  uniqueBy,
} from './utils.js';

function resolveTargetPath(
  sourcePath: string,
  rawTarget: string,
  knownPaths: Set<string>,
  extensionByPath: Map<string, string>
) {
  if (!rawTarget) return null;
  if (rawTarget.startsWith('http://') || rawTarget.startsWith('https://')) return null;
  if (!rawTarget.includes('/') && !rawTarget.startsWith('.')) return null;

  const candidate = rawTarget.split('#')[0].split('?')[0].trim();
  if (!candidate) return null;

  const base = candidate.startsWith('/')
    ? normalizePath(candidate.replace(/^\//, ''))
    : normalizePath(path.join(path.dirname(sourcePath), candidate));

  if (knownPaths.has(base)) return base;

  const extension = extensionByPath.get(sourcePath);
  const candidates = [
    extension ? `${base}${extension}` : '',
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.json`,
    `${base}/index.ts`,
    `${base}/index.tsx`,
    `${base}/index.js`,
    `${base}/index.jsx`,
  ].filter(Boolean);

  return candidates.find((nextPath) => knownPaths.has(nextPath)) ?? null;
}

function addMentionEdges(artifacts: CachedArtifact[], nodes: GraphNode[]) {
  const symbolNodes = nodes.filter((node) => node.kind === 'symbol');
  const fileNodes = nodes.filter((node) => node.kind === 'file');
  const mentionEdges: GraphEdge[] = [];

  for (const artifact of artifacts.filter((entry) => entry.document.kind === 'context')) {
    const fileId = createFileNodeId(artifact.document.path);
    const text = artifact.chunks.map((chunk) => chunk.text).join('\n');

    for (const node of symbolNodes) {
      if (node.path === artifact.document.path) continue;
      const matcher = new RegExp(`\\b${escapeRegex(node.label)}\\b`, 'i');
      if (!matcher.test(text)) continue;
      mentionEdges.push({
        source: fileId,
        target: node.id,
        relation: 'mentions',
        path: artifact.document.path,
        evidence: node.label,
      });
    }

    for (const node of fileNodes) {
      if (node.path === artifact.document.path) continue;
      const basename = path.basename(node.path);
      if (!text.includes(node.path) && !text.includes(basename)) continue;
      mentionEdges.push({
        source: fileId,
        target: node.id,
        relation: 'mentions',
        path: artifact.document.path,
        evidence: basename,
      });
    }
  }

  return mentionEdges;
}

export function mergeArtifacts(artifacts: CachedArtifact[], root: string) {
  const nodes = uniqueBy(
    artifacts.flatMap((artifact) => artifact.nodes),
    (node) => node.id
  ).sort((left, right) => left.id.localeCompare(right.id));
  const knownPaths = new Set(artifacts.map((artifact) => artifact.document.path));
  const extensionByPath = new Map(
    artifacts.map((artifact) => [artifact.document.path, path.extname(artifact.document.path)])
  );

  const baseEdges = artifacts.flatMap((artifact) => artifact.edges);
  const linkEdges = artifacts.flatMap((artifact) =>
    artifact.links.flatMap((link) => {
      const targetPath = resolveTargetPath(
        artifact.document.path,
        link.target,
        knownPaths,
        extensionByPath
      );

      if (!targetPath) return [];
      return [
        {
          source: createFileNodeId(artifact.document.path),
          target: createFileNodeId(targetPath),
          relation: link.relation,
          path: artifact.document.path,
          line: link.line,
          evidence: link.evidence,
        } satisfies GraphEdge,
      ];
    })
  );
  const mentionEdges = addMentionEdges(artifacts, nodes);

  const edges = uniqueBy([...baseEdges, ...linkEdges, ...mentionEdges], (edge) =>
    [edge.source, edge.target, edge.relation, edge.path, edge.line ?? 0].join(':')
  ).sort((left, right) =>
    `${left.source}:${left.relation}:${left.target}`.localeCompare(
      `${right.source}:${right.relation}:${right.target}`
    )
  );

  const chunks = uniqueBy(
    artifacts.flatMap((artifact) => artifact.chunks),
    (chunk) => chunk.id
  ).sort((left, right) => left.id.localeCompare(right.id));

  return {
    version: GRAPH_VERSION,
    root,
    generatedAt: new Date().toISOString(),
    documents: artifacts
      .map((artifact) => artifact.document)
      .sort((left, right) => left.path.localeCompare(right.path)),
    nodes,
    edges,
    chunks,
  } satisfies DevgraphGraph;
}
