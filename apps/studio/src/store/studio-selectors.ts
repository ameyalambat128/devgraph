import { useStudioStore } from './studio-store';
import type { ServiceWithDetails } from '@/types/graph';

/**
 * Get the currently selected service
 */
export function useSelectedService(): ServiceWithDetails | null {
  const selectedServiceName = useStudioStore((state) => state.selectedServiceName);
  const editedGraph = useStudioStore((state) => state.editedGraph);

  if (!selectedServiceName || !editedGraph) return null;
  return editedGraph.services[selectedServiceName] || null;
}

/**
 * Get all service names
 */
export function useServiceNames(): string[] {
  const editedGraph = useStudioStore((state) => state.editedGraph);
  if (!editedGraph) return [];
  return Object.keys(editedGraph.services).sort();
}

/**
 * Get service types for filtering
 */
export function useServiceTypes(): string[] {
  const editedGraph = useStudioStore((state) => state.editedGraph);
  if (!editedGraph) return [];

  const types = new Set<string>();
  for (const service of Object.values(editedGraph.services)) {
    types.add(service.type);
  }
  return Array.from(types).sort();
}

/**
 * Check if a specific service has changes
 */
export function useServiceHasChanges(serviceName: string): boolean {
  const originalGraph = useStudioStore((state) => state.originalGraph);
  const editedGraph = useStudioStore((state) => state.editedGraph);

  if (!originalGraph || !editedGraph) return false;

  const original = originalGraph.services[serviceName];
  const edited = editedGraph.services[serviceName];

  if (!original || !edited) return false;

  return JSON.stringify(original) !== JSON.stringify(edited);
}

/**
 * Check if a node should be dimmed based on hover state or filtering
 */
export function useIsNodeDimmed(nodeId: string): boolean {
  const hoveredNodeId = useStudioStore((state) => state.hoveredNodeId);
  const editedGraph = useStudioStore((state) => state.editedGraph);
  const searchQuery = useStudioStore((state) => state.searchQuery);
  const serviceTypeFilter = useStudioStore((state) => state.serviceTypeFilter);

  if (!editedGraph) return false;

  // 1. Hover state takes precedence
  if (hoveredNodeId) {
    if (hoveredNodeId === nodeId) return false;

    // Check if connected
    const hoveredService = editedGraph.services[hoveredNodeId];
    if (hoveredService?.depends?.includes(nodeId)) return false;

    const nodeService = editedGraph.services[nodeId];
    if (nodeService?.depends?.includes(hoveredNodeId)) return false;

    return true;
  }

  // 2. Search and Filter state
  if (searchQuery || serviceTypeFilter) {
    const service = editedGraph.services[nodeId];
    if (!service) return true;

    const matchesSearch = !searchQuery || nodeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !serviceTypeFilter || service.type === serviceTypeFilter;

    return !(matchesSearch && matchesType);
  }

  return false;
}
