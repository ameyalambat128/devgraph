import { useMemo } from 'react';
import type { Devgraph, GraphEdge, GraphNode, ReactFlowGraph } from '@/types/graph';

export function transformToReactFlow(graph: Devgraph): ReactFlowGraph {
  if (!graph.knowledgeGraph) {
    const serviceNodes: GraphNode[] = Object.values(graph.services).map((service) => ({
      id: service.name,
      type: 'service',
      position: { x: 0, y: 0 },
      data: {
        id: service.name,
        label: service.name,
        nodeKind: 'service',
        serviceType: service.type,
        relationCount: service.depends?.length ?? 0,
        routeCount:
          service.apis?.reduce((sum, api) => sum + Object.keys(api.routes || {}).length, 0) ?? 0,
        envVarCount:
          service.env?.reduce((sum, env) => sum + Object.keys(env.vars || {}).length, 0) ?? 0,
        commandCount: Object.keys(service.commands ?? {}).length,
      },
    }));

    const serviceEdges: GraphEdge[] = Object.values(graph.services).flatMap((service) =>
      (service.depends ?? []).map((dependency) => ({
        id: `${service.name}-${dependency}`,
        source: service.name,
        target: dependency,
        type: 'dependency',
        data: {
          source: service.name,
          target: dependency,
          relation: 'depends_on',
          confidence: 'EXTRACTED',
        },
      }))
    );

    return { nodes: serviceNodes, edges: serviceEdges };
  }

  const communityMap = new Map(
    graph.knowledgeGraph.communities.map((community) => [community.id, community.label])
  );

  const nodes: GraphNode[] = graph.knowledgeGraph.nodes.map((node) => {
    const service = node.kind === 'service' ? graph.services[node.label] : null;
    const owned = graph.knowledgeGraph?.edges.some(
      (edge) => edge.relation === 'owns' && edge.target === node.id
    );

    return {
      id: node.id,
      type: node.kind,
      position: { x: 0, y: 0 },
      data: {
        id: node.id,
        label: node.label,
        nodeKind: node.kind,
        path: node.path,
        serviceType: service?.type,
        communityId: node.community,
        communityLabel: node.community ? communityMap.get(node.community) : undefined,
        relationCount:
          graph.knowledgeGraph?.edges.filter(
            (edge) => edge.source === node.id || edge.target === node.id
          ).length ?? 0,
        routeCount:
          service?.apis?.reduce((sum, api) => sum + Object.keys(api.routes || {}).length, 0) ?? 0,
        envVarCount:
          service?.env?.reduce((sum, env) => sum + Object.keys(env.vars || {}).length, 0) ?? 0,
        commandCount: Object.keys(service?.commands ?? {}).length,
        ownership: node.kind === 'file' ? (owned ? 'owned' : 'unowned') : undefined,
        metadata: node.metadata,
      },
    };
  });

  const edges: GraphEdge[] = graph.knowledgeGraph.edges.map((edge) => ({
    id: `${edge.source}-${edge.target}-${edge.relation}`,
    source: edge.source,
    target: edge.target,
    type: 'dependency',
    data: edge,
  }));

  return { nodes, edges };
}

export function useGraphData(graph: Devgraph | null) {
  return useMemo(() => {
    if (!graph) return null;
    return transformToReactFlow(graph);
  }, [graph]);
}

export function getNodeKinds(graph: Devgraph) {
  const nodeKinds = new Set<string>();
  if (!graph.knowledgeGraph) {
    nodeKinds.add('service');
    return Array.from(nodeKinds);
  }

  for (const node of graph.knowledgeGraph.nodes) {
    nodeKinds.add(node.kind);
  }

  return Array.from(nodeKinds).sort();
}
