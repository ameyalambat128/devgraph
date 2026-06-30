import { existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import type { SourceKind } from './types.js';
import { normalizePath, toPosixRelative } from './utils.js';

export interface DiscoveredSource {
  absPath: string;
  relPath: string;
  kind: SourceKind;
  language: string;
  size: number;
}

const CODE_EXTENSIONS = new Set([
  '.c',
  '.cc',
  '.cpp',
  '.cs',
  '.css',
  '.go',
  '.java',
  '.js',
  '.jsx',
  '.kt',
  '.kts',
  '.mjs',
  '.mts',
  '.php',
  '.py',
  '.rb',
  '.rs',
  '.scss',
  '.sh',
  '.sql',
  '.swift',
  '.ts',
  '.tsx',
  '.vue',
]);

const CONFIG_EXTENSIONS = new Set([
  '.cjs',
  '.conf',
  '.config',
  '.cts',
  '.env',
  '.ini',
  '.json',
  '.mjs',
  '.toml',
  '.yaml',
  '.yml',
]);

const ROOT_CONTEXT_FILES = new Set(['README.md', 'AGENTS.md', 'CLAUDE.md']);

const DEFAULT_IGNORE_PATTERNS = [
  '.devgraph/**',
  '.git/**',
  '.next/**',
  '.turbo/**',
  '**/.next/**',
  '**/.turbo/**',
  '**/node_modules/**',
  '**/.vite/**',
  'apps/docs/**',
  'coverage/**',
  'dist/**',
  'build/**',
  '**/coverage/**',
  '**/dist/**',
  '**/build/**',
  'examples/**',
  'internal-docs/**',
  'node_modules/**',
  'out/**',
  '**/out/**',
  'packages/**/dist/**',
  '**/*.tsbuildinfo',
  '**/*.min.js',
  '**/*.map',
  '**/public/**',
  'bun.lock',
  'bun.lockb',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
];

function languageFromPath(filePath: string) {
  const basename = path.basename(filePath);
  if (ROOT_CONTEXT_FILES.has(basename)) return 'markdown';

  const extension = path.extname(filePath).toLowerCase();
  if (extension === '.tsx' || extension === '.ts') return 'typescript';
  if (extension === '.jsx' || extension === '.js' || extension === '.mjs' || extension === '.cjs')
    return 'javascript';
  if (extension === '.json') return 'json';
  if (extension === '.yaml' || extension === '.yml') return 'yaml';
  if (extension === '.toml') return 'toml';
  if (extension === '.md') return 'markdown';
  if (extension === '.css' || extension === '.scss') return 'css';
  return extension.replace(/^\./, '') || 'text';
}

function classifySource(relPath: string): SourceKind | null {
  const normalized = normalizePath(relPath);
  const basename = path.basename(normalized);
  const extension = path.extname(normalized).toLowerCase();

  if (ROOT_CONTEXT_FILES.has(basename) && !normalized.includes('/')) return 'context';
  if (CODE_EXTENSIONS.has(extension)) return 'code';
  if (CONFIG_EXTENSIONS.has(extension)) return 'config';

  if (
    basename === 'package.json' ||
    basename.startsWith('tsconfig') ||
    basename === '.gitignore' ||
    basename === '.prettierignore' ||
    basename === '.prettierrc' ||
    basename === '.eslintrc.json'
  ) {
    return 'config';
  }

  return null;
}

async function resolveInputPatterns(inputs: string[], cwd: string) {
  const patterns: string[] = [];

  for (const input of inputs.length ? inputs : ['.']) {
    const resolved = path.resolve(cwd, input);
    if (!existsSync(resolved)) {
      patterns.push(normalizePath(input));
      continue;
    }

    const stats = await stat(resolved);
    const relative = toPosixRelative(cwd, resolved);

    if (stats.isDirectory()) {
      patterns.push(relative === '.' ? '**/*' : `${relative.replace(/\/$/, '')}/**/*`);
      continue;
    }

    patterns.push(relative);
  }

  return patterns;
}

export async function loadIgnorePatterns(cwd: string) {
  const ignorePath = path.join(cwd, '.devgraphignore');
  const userPatterns = existsSync(ignorePath)
    ? await (await import('node:fs/promises')).readFile(ignorePath, 'utf8').then((content) =>
        content
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith('#'))
      )
    : [];

  return [...new Set([...DEFAULT_IGNORE_PATTERNS, ...userPatterns])];
}

export async function discoverSources(inputs: string[], cwd: string) {
  const ignore = await loadIgnorePatterns(cwd);
  const patterns = await resolveInputPatterns(inputs, cwd);
  const matches = await fg(patterns, {
    cwd,
    absolute: true,
    onlyFiles: true,
    unique: true,
    dot: true,
    followSymbolicLinks: false,
    ignore,
  });

  const sources: DiscoveredSource[] = [];

  for (const absPath of matches) {
    const relPath = toPosixRelative(cwd, absPath);
    const kind = classifySource(relPath);
    if (!kind) continue;

    const info = await stat(absPath);
    sources.push({
      absPath,
      relPath,
      kind,
      language: languageFromPath(relPath),
      size: info.size,
    });
  }

  sources.sort((left, right) => left.relPath.localeCompare(right.relPath));

  return {
    ignore,
    sources,
  };
}
