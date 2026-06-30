export {
  EXTRACTION_VERSION,
  GRAPH_VERSION,
  type CachedArtifact,
  type DevgraphGraph,
  type GraphEdge,
  type GraphNode,
  type Manifest,
  type QueryOptions,
  type QueryResult,
  type StatusResult,
  type SyncOptions,
  type SyncResult,
} from './types.js';
export { discoverSources, loadIgnorePatterns, type DiscoveredSource } from './discovery.js';
export { extractArtifact } from './extraction.js';
export { mergeArtifacts } from './merge.js';
export { queryGraph } from './retrieval.js';
export { getStatus, readGraph, syncProject } from './sync.js';
export { watchProject, type WatchOptions } from './watch.js';
