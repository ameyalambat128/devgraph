export const GRAPH_VERSION = '1';
export const EXTRACTION_VERSION = 'code-memory-v1';

export type SourceKind = 'code' | 'config' | 'context';
export type GraphNodeKind = 'file' | 'symbol';
export type GraphEdgeRelation = 'contains' | 'defines' | 'imports' | 'references' | 'mentions';
export type ChunkKind = 'file' | 'symbol';

export interface SourceDocument {
  path: string;
  kind: SourceKind;
  language: string;
  hash: string;
  size: number;
  indexedAt: string;
}

export interface SourceChunk {
  id: string;
  path: string;
  text: string;
  kind: ChunkKind;
  startLine: number;
  endLine: number;
}

export interface GraphNode {
  id: string;
  kind: GraphNodeKind;
  label: string;
  path: string;
  language?: string;
  startLine?: number;
  endLine?: number;
  summary?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: GraphEdgeRelation;
  path: string;
  line?: number;
  evidence?: string;
}

export interface ArtifactLink {
  relation: 'imports' | 'references';
  target: string;
  line: number;
  evidence: string;
}

export interface CachedArtifact {
  version: string;
  document: SourceDocument;
  nodes: GraphNode[];
  edges: GraphEdge[];
  chunks: SourceChunk[];
  links: ArtifactLink[];
}

export interface ManifestFile {
  path: string;
  hash: string;
  kind: SourceKind;
  language: string;
  size: number;
  cacheKey: string;
  indexedAt: string;
  extractionVersion: string;
}

export interface Manifest {
  version: string;
  root: string;
  extractionVersion: string;
  generatedAt: string;
  files: Record<string, ManifestFile>;
}

export interface DevgraphGraph {
  version: string;
  root: string;
  generatedAt: string;
  documents: SourceDocument[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  chunks: SourceChunk[];
}

export interface SyncStats {
  discovered: number;
  indexed: number;
  changed: number;
  reused: number;
  removed: number;
}

export interface SyncPaths {
  outDir: string;
  manifestPath: string;
  graphPath: string;
  cacheDir: string;
}

export interface SyncOptions {
  cwd?: string;
  outDir?: string;
  force?: boolean;
}

export interface SyncResult {
  manifest: Manifest;
  graph: DevgraphGraph;
  stats: SyncStats;
  paths: SyncPaths;
  changedPaths: string[];
  removedPaths: string[];
  guarded?: boolean;
}

export interface QueryMatch {
  path: string;
  score: number;
  summary?: string;
}

export interface QuerySnippet {
  path: string;
  startLine: number;
  endLine: number;
  text: string;
  score: number;
}

export interface QueryEdge {
  source: string;
  target: string;
  relation: GraphEdgeRelation;
  path: string;
}

export interface QueryResult {
  question: string;
  summary: string;
  files: QueryMatch[];
  snippets: QuerySnippet[];
  edges: QueryEdge[];
}

export interface QueryOptions {
  budget?: number;
}

export interface StatusResult {
  version: string;
  extractionVersion: string;
  indexedFiles: number;
  changedFiles: number;
  staleFiles: string[];
  lastSyncAt?: string;
  outDir: string;
  manifestPath: string;
  graphPath: string;
}
