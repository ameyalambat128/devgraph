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
  /** Currently selected service name */
  selectedServiceName: string | null;
  /** Graph layout direction */
  layoutDirection: LayoutDirection;
  /** Filter by service type */
  serviceTypeFilter: string | null;
  /** Search query for filtering services */
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
  /** Select a service by name */
  selectService: (name: string | null) => void;
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
  /** Set service type filter */
  setServiceTypeFilter: (type: string | null) => void;
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
