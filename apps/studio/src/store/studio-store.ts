import { create } from 'zustand';
import type { Devgraph, ServiceWithDetails } from '@/types/graph';
import type { StudioStore, LayoutDirection } from '@/types/studio';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export const useStudioStore = create<StudioStore>((set, get) => ({
  // State
  originalGraph: null,
  editedGraph: null,
  selectedNodeId: null,
  layoutDirection: 'horizontal',
  nodeKindFilter: null,
  communityFilter: null,
  confidenceFilter: null,
  ownershipFilter: null,
  searchQuery: '',
  hoveredNodeId: null,
  hasUnsavedChanges: false,

  // Actions
  loadGraph: (graph: Devgraph) => {
    set({
      originalGraph: deepClone(graph),
      editedGraph: deepClone(graph),
      selectedNodeId: null,
      searchQuery: '',
      hoveredNodeId: null,
      nodeKindFilter: null,
      communityFilter: null,
      confidenceFilter: null,
      ownershipFilter: null,
      hasUnsavedChanges: false,
    });
  },

  resetGraph: () => {
    const { originalGraph } = get();
    if (originalGraph) {
      set({
        editedGraph: deepClone(originalGraph),
        hasUnsavedChanges: false,
        hoveredNodeId: null,
        selectedNodeId: null,
        searchQuery: '',
      });
    }
  },

  selectNode: (id: string | null) => {
    set({ selectedNodeId: id });
  },

  setHoveredNodeId: (id: string | null) => {
    set({ hoveredNodeId: id });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  updateService: (name: string, updates: Partial<ServiceWithDetails>) => {
    const { editedGraph } = get();
    if (!editedGraph || !editedGraph.services[name]) return;

    const updatedGraph = deepClone(editedGraph);
    updatedGraph.services[name] = {
      ...updatedGraph.services[name],
      ...updates,
    };

    set({
      editedGraph: updatedGraph,
      hasUnsavedChanges: true,
    });
  },

  addCommand: (serviceName: string, key: string, value: string) => {
    const { editedGraph } = get();
    if (!editedGraph || !editedGraph.services[serviceName]) return;

    const updatedGraph = deepClone(editedGraph);
    const service = updatedGraph.services[serviceName];
    service.commands = { ...service.commands, [key]: value };

    set({
      editedGraph: updatedGraph,
      hasUnsavedChanges: true,
    });
  },

  removeCommand: (serviceName: string, key: string) => {
    const { editedGraph } = get();
    if (!editedGraph || !editedGraph.services[serviceName]) return;

    const updatedGraph = deepClone(editedGraph);
    const service = updatedGraph.services[serviceName];
    if (service.commands) {
      const { [key]: _, ...rest } = service.commands;
      service.commands = rest;
    }

    set({
      editedGraph: updatedGraph,
      hasUnsavedChanges: true,
    });
  },

  addEnvVar: (serviceName: string, key: string, value: string) => {
    const { editedGraph } = get();
    if (!editedGraph || !editedGraph.services[serviceName]) return;

    const updatedGraph = deepClone(editedGraph);
    const service = updatedGraph.services[serviceName];

    if (!service.env || service.env.length === 0) {
      service.env = [{ service: serviceName, vars: { [key]: value } }];
    } else {
      service.env[0].vars = { ...service.env[0].vars, [key]: value };
    }

    set({
      editedGraph: updatedGraph,
      hasUnsavedChanges: true,
    });
  },

  removeEnvVar: (serviceName: string, key: string) => {
    const { editedGraph } = get();
    if (!editedGraph || !editedGraph.services[serviceName]) return;

    const updatedGraph = deepClone(editedGraph);
    const service = updatedGraph.services[serviceName];

    if (service.env && service.env.length > 0) {
      const { [key]: _, ...rest } = service.env[0].vars;
      service.env[0].vars = rest;
    }

    set({
      editedGraph: updatedGraph,
      hasUnsavedChanges: true,
    });
  },

  addDependency: (serviceName: string, dependency: string) => {
    const { editedGraph } = get();
    if (!editedGraph || !editedGraph.services[serviceName]) return;

    const updatedGraph = deepClone(editedGraph);
    const service = updatedGraph.services[serviceName];
    service.depends = [...(service.depends || []), dependency];

    set({
      editedGraph: updatedGraph,
      hasUnsavedChanges: true,
    });
  },

  removeDependency: (serviceName: string, dependency: string) => {
    const { editedGraph } = get();
    if (!editedGraph || !editedGraph.services[serviceName]) return;

    const updatedGraph = deepClone(editedGraph);
    const service = updatedGraph.services[serviceName];
    service.depends = (service.depends || []).filter((d) => d !== dependency);

    set({
      editedGraph: updatedGraph,
      hasUnsavedChanges: true,
    });
  },

  setLayoutDirection: (direction: LayoutDirection) => {
    set({ layoutDirection: direction });
  },

  setNodeKindFilter: (kind: 'service' | 'file' | null) => {
    set({ nodeKindFilter: kind });
  },

  setCommunityFilter: (communityId: string | null) => {
    set({ communityFilter: communityId });
  },

  setConfidenceFilter: (confidence: 'EXTRACTED' | 'INFERRED' | 'AMBIGUOUS' | null) => {
    set({ confidenceFilter: confidence });
  },

  setOwnershipFilter: (ownership: 'owned' | 'unowned' | null) => {
    set({ ownershipFilter: ownership });
  },
}));
