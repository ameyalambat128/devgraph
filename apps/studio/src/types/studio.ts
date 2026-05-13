import type { Devgraph, ServiceWithDetails } from './graph';

/**
 * Studio UI state types
 */

export type LayoutDirection = 'horizontal' | 'vertical';

export interface StudioState {
  /** Original graph loaded from JSON */
  originalGraph: Devgraph | null;
  /** Working copy with edits */
  editedGraph: Devgraph | null;
  /** Currently selected node id */
  selectedNodeId: string | null;
  /** Graph layout direction */
  layoutDirection: LayoutDirection;
  /** Filter by node kind */
  nodeKindFilter: 'service' | 'file' | null;
  /** Filter by community */
  communityFilter: string | null;
  /** Filter by provenance */
  confidenceFilter: 'EXTRACTED' | 'INFERRED' | 'AMBIGUOUS' | null;
  /** Filter by ownership */
  ownershipFilter: 'owned' | 'unowned' | null;
  /** Search query for filtering nodes */
  searchQuery: string;
  /** ID of the currently hovered node */
  hoveredNodeId: string | null;
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;
}

export interface StudioActions {
  /** Load a graph from JSON */
  loadGraph: (graph: Devgraph) => void;
  /** Reset to original graph */
  resetGraph: () => void;
  /** Select a node by id */
  selectNode: (id: string | null) => void;
  /** Set the hovered node ID */
  setHoveredNodeId: (id: string | null) => void;
  /** Update a service */
  updateService: (name: string, updates: Partial<ServiceWithDetails>) => void;
  /** Add a command to a service */
  addCommand: (serviceName: string, key: string, value: string) => void;
  /** Remove a command from a service */
  removeCommand: (serviceName: string, key: string) => void;
  /** Add an env var to a service */
  addEnvVar: (serviceName: string, key: string, value: string) => void;
  /** Remove an env var from a service */
  removeEnvVar: (serviceName: string, key: string) => void;
  /** Add a dependency to a service */
  addDependency: (serviceName: string, dependency: string) => void;
  /** Remove a dependency from a service */
  removeDependency: (serviceName: string, dependency: string) => void;
  /** Set layout direction */
  setLayoutDirection: (direction: LayoutDirection) => void;
  /** Set node kind filter */
  setNodeKindFilter: (kind: 'service' | 'file' | null) => void;
  /** Set community filter */
  setCommunityFilter: (communityId: string | null) => void;
  /** Set provenance filter */
  setConfidenceFilter: (confidence: 'EXTRACTED' | 'INFERRED' | 'AMBIGUOUS' | null) => void;
  /** Set ownership filter */
  setOwnershipFilter: (ownership: 'owned' | 'unowned' | null) => void;
  /** Set search query */
  setSearchQuery: (query: string) => void;
}

export type StudioStore = StudioState & StudioActions;

/**
 * Export types
 */

export type ExportFormat = 'json' | 'summary' | 'agents' | 'mermaid';

export interface ExportOptions {
  format: ExportFormat;
  serviceName?: string; // For per-service exports
}
