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
