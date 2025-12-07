import type { Node, Edge } from '@xyflow/react';

/**
 * DevGraph types - mirrors devgraph-core types
 */

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

export interface ServiceWithDetails extends ServiceBlock {
  apis?: ApiBlock[];
  env?: EnvBlock[];
}

export interface Devgraph {
  services: Record<string, ServiceWithDetails>;
  apis: Record<string, ApiBlock>;
}

/**
 * React Flow node/edge types
 */

export interface ServiceNodeData {
  name: string;
  type: string;
  commandCount: number;
  routeCount: number;
  envVarCount: number;
  dependencyCount: number;
  [key: string]: unknown;
}

export type ServiceNode = Node<ServiceNodeData, 'service'>;

export type DependencyEdge = Edge;

/**
 * Graph transformation result
 */

export interface ReactFlowGraph {
  nodes: ServiceNode[];
  edges: DependencyEdge[];
}
