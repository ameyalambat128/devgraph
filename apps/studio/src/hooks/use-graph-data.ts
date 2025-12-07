import { useMemo } from 'react';
import type {
  Devgraph,
  ReactFlowGraph,
  ServiceNode,
  DependencyEdge,
} from '@/types/graph';

/**
 * Transform a Devgraph to React Flow nodes and edges
 */
export function transformToReactFlow(graph: Devgraph): ReactFlowGraph {
  const nodes: ServiceNode[] = [];
  const edges: DependencyEdge[] = [];
  const serviceNames = Object.keys(graph.services);

  for (const name of serviceNames) {
    const service = graph.services[name];

    const commandCount = service.commands
      ? Object.keys(service.commands).length
      : 0;

    const routeCount = service.apis
      ? service.apis.reduce(
          (sum, api) => sum + Object.keys(api.routes || {}).length,
          0
        )
      : 0;

    const envVarCount = service.env
      ? service.env.reduce(
          (sum, env) => sum + Object.keys(env.vars || {}).length,
          0
        )
      : 0;

    const dependencyCount = service.depends?.length || 0;

    nodes.push({
      id: name,
      type: 'service',
      position: { x: 0, y: 0 }, // Will be set by layout
      data: {
        name,
        type: service.type,
        commandCount,
        routeCount,
        envVarCount,
        dependencyCount,
      },
    });

    // Create edges for dependencies
    if (service.depends) {
      for (const dependency of service.depends) {
        edges.push({
          id: `${name}-${dependency}`,
          source: name,
          target: dependency,
          type: 'dependency',
        });
      }
    }
  }

  return { nodes, edges };
}

/**
 * Hook to transform graph data to React Flow format
 */
export function useGraphData(graph: Devgraph | null): ReactFlowGraph | null {
  return useMemo(() => {
    if (!graph) return null;
    return transformToReactFlow(graph);
  }, [graph]);
}

/**
 * Get unique service types from a graph
 */
export function getServiceTypes(graph: Devgraph): string[] {
  const types = new Set<string>();
  for (const service of Object.values(graph.services)) {
    types.add(service.type);
  }
  return Array.from(types).sort();
}

/**
 * Filter graph by service type
 */
export function filterByServiceType(
  graph: ReactFlowGraph,
  serviceType: string | null
): ReactFlowGraph {
  if (!serviceType) return graph;

  const filteredNodes = graph.nodes.filter(
    (node) => node.data.type === serviceType
  );
  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

  const filteredEdges = graph.edges.filter(
    (edge) =>
      filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)
  );

  return { nodes: filteredNodes, edges: filteredEdges };
}
