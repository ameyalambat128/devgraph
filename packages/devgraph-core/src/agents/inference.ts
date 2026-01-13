import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface InferredCommands {
  dev?: string;
  build?: string;
  test?: string;
  start?: string;
  lint?: string;
}

export interface InferredData {
  commands: InferredCommands;
  landmarks: string[];
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun';
}

const COMMON_LANDMARKS = [
  'src',
  'app',
  'lib',
  'pages',
  'components',
  'routers',
  'routes',
  'models',
  'services',
  'utils',
  'helpers',
  'hooks',
  'api',
  'server',
  'client',
  'public',
  'assets',
  'styles',
  'tests',
  '__tests__',
  'spec',
];

const LANDMARK_DESCRIPTIONS: Record<string, string> = {
  src: 'main source code',
  app: 'application entry / routes',
  lib: 'shared utilities and libraries',
  pages: 'page components (Next.js / file-based routing)',
  components: 'reusable UI components',
  routers: 'API route handlers',
  routes: 'route definitions',
  models: 'data models / schemas',
  services: 'business logic services',
  utils: 'utility functions',
  helpers: 'helper functions',
  hooks: 'React hooks',
  api: 'API endpoints',
  server: 'server-side code',
  client: 'client-side code',
  public: 'static assets served publicly',
  assets: 'static assets',
  styles: 'stylesheets (CSS/SCSS)',
  tests: 'test files',
  __tests__: 'test files (Jest convention)',
  spec: 'test specifications',
};

function detectPackageManager(servicePath: string): 'npm' | 'yarn' | 'pnpm' | 'bun' | undefined {
  if (existsSync(join(servicePath, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(servicePath, 'yarn.lock'))) return 'yarn';
  if (existsSync(join(servicePath, 'bun.lockb'))) return 'bun';
  if (existsSync(join(servicePath, 'package-lock.json'))) return 'npm';
  return undefined;
}

export function inferCommands(servicePath: string): InferredCommands {
  const packageJsonPath = join(servicePath, 'package.json');

  if (!existsSync(packageJsonPath)) {
    return {};
  }

  try {
    const content = readFileSync(packageJsonPath, 'utf8');
    const pkg = JSON.parse(content);
    const scripts = pkg.scripts ?? {};

    return {
      dev: scripts.dev ?? scripts.start,
      build: scripts.build,
      test: scripts.test,
      start: scripts.start,
      lint: scripts.lint,
    };
  } catch {
    return {};
  }
}

export function inferLandmarks(servicePath: string): string[] {
  const landmarks: string[] = [];

  for (const dir of COMMON_LANDMARKS) {
    const fullPath = join(servicePath, dir);
    if (existsSync(fullPath)) {
      landmarks.push(dir);
    }
  }

  return landmarks;
}

export function getLandmarkDescription(landmark: string): string {
  return LANDMARK_DESCRIPTIONS[landmark] ?? 'project directory';
}

export function inferServiceData(servicePath: string): InferredData {
  const commands = inferCommands(servicePath);
  const landmarks = inferLandmarks(servicePath);
  const packageManager = detectPackageManager(servicePath);

  return {
    commands,
    landmarks,
    packageManager,
  };
}

export function mergeCommands(
  declared: Record<string, string> | undefined,
  inferred: InferredCommands
): Record<string, string> {
  const merged: Record<string, string> = {};

  // Inferred commands as base
  if (inferred.dev) merged.dev = inferred.dev;
  if (inferred.build) merged.build = inferred.build;
  if (inferred.test) merged.test = inferred.test;
  if (inferred.start) merged.start = inferred.start;
  if (inferred.lint) merged.lint = inferred.lint;

  // Declared commands override inferred
  if (declared) {
    for (const [key, value] of Object.entries(declared)) {
      merged[key] = value;
    }
  }

  return merged;
}
