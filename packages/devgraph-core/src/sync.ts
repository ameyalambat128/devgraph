import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { discoverSources } from './discovery.js';
import { extractArtifact } from './extraction.js';
import { mergeArtifacts } from './merge.js';
import {
  EXTRACTION_VERSION,
  GRAPH_VERSION,
  type CachedArtifact,
  type DevgraphGraph,
  type Manifest,
  type ManifestFile,
  type StatusResult,
  type SyncOptions,
  type SyncResult,
} from './types.js';
import { createCacheKey, normalizePath } from './utils.js';

function hashBuffer(buffer: Buffer) {
  return createHash('sha1').update(buffer).digest('hex');
}

async function hashFile(filePath: string) {
  return readFile(filePath).then((buffer) => hashBuffer(buffer));
}

async function readJsonFile<T>(filePath: string) {
  if (!existsSync(filePath)) return null;
  return JSON.parse(await readFile(filePath, 'utf8')) as T;
}

function resolvePaths(cwd: string, outDir: string) {
  const resolvedOutDir = path.resolve(cwd, outDir);
  return {
    outDir: resolvedOutDir,
    manifestPath: path.join(resolvedOutDir, 'manifest.json'),
    graphPath: path.join(resolvedOutDir, 'graph.json'),
    cacheDir: path.join(resolvedOutDir, 'cache'),
  };
}

async function loadManifest(manifestPath: string, cwd: string) {
  const manifest = await readJsonFile<Manifest>(manifestPath);
  if (manifest && manifest.files && typeof manifest.files === 'object') return manifest;

  return {
    version: GRAPH_VERSION,
    root: cwd,
    extractionVersion: EXTRACTION_VERSION,
    generatedAt: '',
    files: {},
  };
}

async function loadGraph(graphPath: string) {
  const graph = await readJsonFile<DevgraphGraph>(graphPath);
  if (!graph) return null;
  if (Array.isArray(graph.nodes) && Array.isArray(graph.edges) && Array.isArray(graph.chunks)) {
    return graph;
  }
  return null;
}

function cachePathFor(cacheDir: string, cacheKey: string) {
  return path.join(cacheDir, `${cacheKey}.json`);
}

async function writeArtifact(
  cacheDir: string,
  artifact: CachedArtifact,
  hash: string,
  indexedAt: string
) {
  const cacheKey = createCacheKey(artifact.document.path);
  const nextArtifact = {
    ...artifact,
    document: {
      ...artifact.document,
      hash,
      indexedAt,
    },
  } satisfies CachedArtifact;

  await writeFile(cachePathFor(cacheDir, cacheKey), JSON.stringify(nextArtifact, null, 2));

  return {
    artifact: nextArtifact,
    cacheKey,
  };
}

async function readArtifact(cacheDir: string, file: ManifestFile) {
  return readJsonFile<CachedArtifact>(cachePathFor(cacheDir, file.cacheKey));
}

function shouldGuard(
  previousGraph: DevgraphGraph | null,
  nextGraph: DevgraphGraph,
  force?: boolean
) {
  if (force) return false;
  if (!previousGraph || previousGraph.nodes.length === 0) return false;
  return nextGraph.nodes.length < Math.floor(previousGraph.nodes.length * 0.5);
}

export async function syncProject(inputs: string[], options: SyncOptions = {}) {
  const cwd = options.cwd ?? process.cwd();
  const paths = resolvePaths(cwd, options.outDir ?? '.devgraph');
  await mkdir(paths.cacheDir, { recursive: true });

  const previousManifest = await loadManifest(paths.manifestPath, cwd);
  const previousGraph = await loadGraph(paths.graphPath);
  const { sources } = await discoverSources(inputs, cwd);
  const nextFiles: Manifest['files'] = {};
  const artifacts: CachedArtifact[] = [];
  const changedPaths: string[] = [];
  const removedPaths = Object.keys(previousManifest.files).filter(
    (filePath) => !sources.some((source) => source.relPath === filePath)
  );

  let changed = 0;
  let reused = 0;

  for (const source of sources) {
    const hash = await hashFile(source.absPath);
    const previous = previousManifest.files[source.relPath];

    if (previous && previous.hash === hash && previous.extractionVersion !== EXTRACTION_VERSION) {
      // fall through and rebuild
    } else if (previous && previous.hash === hash) {
      const artifact = await readArtifact(paths.cacheDir, previous);
      if (artifact) {
        artifacts.push(artifact);
        nextFiles[source.relPath] = previous;
        reused += 1;
        continue;
      }
    }

    const indexedAt = new Date().toISOString();
    const artifact = await extractArtifact(source);
    const written = await writeArtifact(paths.cacheDir, artifact, hash, indexedAt);
    artifacts.push(written.artifact);
    nextFiles[source.relPath] = {
      path: source.relPath,
      hash,
      kind: source.kind,
      language: source.language,
      size: source.size,
      cacheKey: written.cacheKey,
      indexedAt,
      extractionVersion: EXTRACTION_VERSION,
    };
    changed += 1;
    changedPaths.push(source.relPath);
  }

  for (const removedPath of removedPaths) {
    const previous = previousManifest.files[removedPath];
    await rm(cachePathFor(paths.cacheDir, previous.cacheKey), { force: true });
  }

  const manifest = {
    version: GRAPH_VERSION,
    root: cwd,
    extractionVersion: EXTRACTION_VERSION,
    generatedAt: new Date().toISOString(),
    files: nextFiles,
  } satisfies Manifest;

  const graph = mergeArtifacts(artifacts, cwd);
  const guarded = shouldGuard(previousGraph, graph, options.force);
  if (!guarded) {
    await writeFile(paths.manifestPath, JSON.stringify(manifest, null, 2));
    await writeFile(paths.graphPath, JSON.stringify(graph, null, 2));
  }

  return {
    manifest,
    graph,
    stats: {
      discovered: sources.length,
      indexed: artifacts.length,
      changed,
      reused,
      removed: removedPaths.length,
    },
    paths,
    changedPaths,
    removedPaths,
    guarded,
  } satisfies SyncResult;
}

export async function readGraph(graphPath: string) {
  const graph = await loadGraph(path.resolve(graphPath));
  if (!graph) {
    throw new Error(
      `Graph file not found or is incompatible at ${graphPath}. Run "devgraph build" first.`
    );
  }

  return graph;
}

export async function getStatus(inputs: string[], options: SyncOptions = {}) {
  const cwd = options.cwd ?? process.cwd();
  const paths = resolvePaths(cwd, options.outDir ?? '.devgraph');
  const manifest = await loadManifest(paths.manifestPath, cwd);

  if (!existsSync(paths.manifestPath)) {
    return {
      version: GRAPH_VERSION,
      extractionVersion: EXTRACTION_VERSION,
      indexedFiles: 0,
      changedFiles: 0,
      staleFiles: [],
      outDir: paths.outDir,
      manifestPath: paths.manifestPath,
      graphPath: paths.graphPath,
    } satisfies StatusResult;
  }

  const { sources } = await discoverSources(inputs, cwd);
  const staleFiles: string[] = [];

  for (const source of sources) {
    const previous = manifest.files[source.relPath];
    if (!previous) {
      staleFiles.push(source.relPath);
      continue;
    }

    const hash = await hashFile(source.absPath);
    if (previous.hash !== hash) staleFiles.push(source.relPath);
  }

  for (const existingPath of Object.keys(manifest.files)) {
    if (!sources.some((source) => source.relPath === existingPath)) staleFiles.push(existingPath);
  }

  return {
    version: manifest.version,
    extractionVersion: manifest.extractionVersion,
    indexedFiles: Object.keys(manifest.files).length,
    changedFiles: staleFiles.length,
    staleFiles: staleFiles.sort((left, right) => left.localeCompare(right)),
    lastSyncAt: manifest.generatedAt,
    outDir: paths.outDir,
    manifestPath: paths.manifestPath,
    graphPath: paths.graphPath,
  } satisfies StatusResult;
}
