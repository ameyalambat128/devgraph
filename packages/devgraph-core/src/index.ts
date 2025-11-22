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

export interface ParseResult {
  blocks: DevgraphBlock[];
}

export function parseMarkdownFiles(_paths: string[]): ParseResult {
  // Stub: real parser will scan markdown, extract devgraph-* fenced blocks, and return structured data.
  return { blocks: [] };
}

export function buildGraph(blocks: DevgraphBlock[]): Devgraph {
  const services: Devgraph['services'] = {};
  const apis: Devgraph['apis'] = {};

  for (const block of blocks) {
    if (block.type === 'service') {
      const data = block.data as ServiceBlock;
      services[data.name] = { ...data };
    }
    if (block.type === 'api') {
      const data = block.data as ApiBlock;
      apis[data.service] = data;
      if (services[data.service]) {
        const svc = services[data.service];
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

export function generateSummary(_graph: Devgraph): string {
  // Stub: produce human-readable summary.md
  return '# Summary\n';
}
