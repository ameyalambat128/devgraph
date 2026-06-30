import type { Edge, Node } from '@xyflow/react';

export interface ServiceBlock {
  name: string;
  type: string;
  commands?: Record<string, string>;
  depends?: string[];
  paths?: string[];
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

export type KnowledgeNodeKind = 'service' | 'file';
export type KnowledgeEdgeRelation =
  | 'owns'
  | 'depends_on'
  | 'references'
  | 'documents'
  | 'defined_in';
export type KnowledgeConfidence = 'EXTRACTED' | 'INFERRED' | 'AMBIGUOUS';

export interface AnalysisNode {
  id: string;
  label: string;
  kind: KnowledgeNodeKind;
  path?: string;
  degree: number;
  betweenness: number;
}

export interface SurprisingConnection {
  source: string;
  target: string;
  relation: string;
  confidence: KnowledgeConfidence;
  sourcePath?: string;
  sourceLocation?: string;
  evidence?: string;
  note?: string;
}

export interface KnowledgeGraphNode {
  id: string;
  kind: KnowledgeNodeKind;
  label: string;
  path?: string;
  service?: string;
  summary?: string;
  community?: string;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeGraphEdge extends Record<string, unknown> {
  source: string;
  target: string;
  relation: KnowledgeEdgeRelation;
  confidence: KnowledgeConfidence;
  sourcePath?: string;
  sourceLocation?: string;
  evidence?: string;
}

export interface KnowledgeCommunity {
  id: string;
  label: string;
  nodeIds: string[];
}

export interface KnowledgeGraphAnalysis {
  godNodes: AnalysisNode[];
  bridgeNodes: AnalysisNode[];
  surprisingConnections: SurprisingConnection[];
  suggestedQuestions: string[];
  coverageGaps: string[];
}

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  communities: KnowledgeCommunity[];
  analysis: KnowledgeGraphAnalysis;
}

export interface Devgraph {
  services: Record<string, ServiceWithDetails>;
  apis: Record<string, ApiBlock>;
  knowledgeGraph?: KnowledgeGraph;
}

export interface GraphNodeData extends Record<string, unknown> {
  id: string;
  label: string;
  nodeKind: KnowledgeNodeKind;
  serviceType?: string;
  path?: string;
  communityId?: string;
  communityLabel?: string;
  relationCount: number;
  routeCount: number;
  envVarCount: number;
  commandCount: number;
  ownership?: 'owned' | 'unowned';
  confidence?: KnowledgeConfidence;
  metadata?: Record<string, unknown>;
}

export type GraphNode = Node<GraphNodeData, KnowledgeNodeKind>;
export type GraphEdge = Edge<KnowledgeGraphEdge, 'dependency'>;

export interface ReactFlowGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface SelectedNodeDetails {
  node: KnowledgeGraphNode;
  service: ServiceWithDetails | null;
  incoming: KnowledgeGraphEdge[];
  outgoing: KnowledgeGraphEdge[];
  community: KnowledgeCommunity | null;
}
