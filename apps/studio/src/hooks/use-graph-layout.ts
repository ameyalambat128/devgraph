import { useCallback, useMemo } from 'react';
import dagre from '@dagrejs/dagre';
import type { ReactFlowGraph, ServiceNode, DependencyEdge } from '@/types/graph';
import type { LayoutDirection } from '@/types/studio';

const NODE_WIDTH = 280;
const NODE_HEIGHT = 100;
const NODE_PADDING = 50;

interface LayoutOptions {
  direction: LayoutDirection;
}

/**
 * Apply Dagre layout to React Flow nodes
 */
export function applyDagreLayout(
  graph: ReactFlowGraph,
  options: LayoutOptions
): ReactFlowGraph {
  const { direction } = options;
  const dagreGraph = new dagre.graphlib.Graph();

  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction === 'horizontal' ? 'LR' : 'TB',
    nodesep: NODE_PADDING,
    ranksep: NODE_PADDING * 2,
    marginx: NODE_PADDING,
    marginy: NODE_PADDING,
  });

  // Add nodes to dagre graph
  for (const node of graph.nodes) {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  // Add edges to dagre graph
  for (const edge of graph.edges) {
    dagreGraph.setEdge(edge.source, edge.target);
  }

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply positions to nodes
  const layoutedNodes: ServiceNode[] = graph.nodes.map((node) => {
    const dagreNode = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: dagreNode.x - NODE_WIDTH / 2,
        y: dagreNode.y - NODE_HEIGHT / 2,
      },
    };
  });

  return {
    nodes: layoutedNodes,
    edges: graph.edges,
  };
}

/**
 * Hook to apply layout to graph
 */
export function useGraphLayout(
  graph: ReactFlowGraph | null,
  direction: LayoutDirection
): ReactFlowGraph | null {
  return useMemo(() => {
    if (!graph) return null;
    return applyDagreLayout(graph, { direction });
  }, [graph, direction]);
}

/**
 * Hook to get layout callback for React Flow
 */
export function useLayoutCallback(
  setNodes: (nodes: ServiceNode[]) => void,
  setEdges: (edges: DependencyEdge[]) => void
) {
  return useCallback(
    (nodes: ServiceNode[], edges: DependencyEdge[], direction: LayoutDirection) => {
      const layouted = applyDagreLayout({ nodes, edges }, { direction });
      setNodes(layouted.nodes);
      setEdges(layouted.edges);
    },
    [setNodes, setEdges]
  );
}
