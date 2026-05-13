'use client';

import { useCallback, useEffect, useMemo } from 'react';
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { DependencyEdge as DependencyEdgeComponent } from './dependency-edge';
import { FileNode } from './file-node';
import { GraphControls } from './graph-controls';
import { ServiceNode } from './service-node';
import { useGraphData, getNodeKinds } from '@/hooks/use-graph-data';
import { applyDagreLayout } from '@/hooks/use-graph-layout';
import type { Devgraph, ReactFlowGraph } from '@/types/graph';
import type { LayoutDirection } from '@/types/studio';

const nodeTypes = {
  service: ServiceNode,
  file: FileNode,
};

const edgeTypes = {
  dependency: DependencyEdgeComponent,
};

const defaultEdgeOptions = {
  type: 'dependency',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
  },
};

interface GraphContainerProps {
  graph: Devgraph;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  layoutDirection: LayoutDirection;
  onLayoutDirectionChange: (direction: LayoutDirection) => void;
  nodeKindFilter: 'service' | 'file' | null;
  onNodeKindFilterChange: (kind: 'service' | 'file' | null) => void;
  communityFilter: string | null;
  onCommunityFilterChange: (communityId: string | null) => void;
  confidenceFilter: 'EXTRACTED' | 'INFERRED' | 'AMBIGUOUS' | null;
  onConfidenceFilterChange: (confidence: 'EXTRACTED' | 'INFERRED' | 'AMBIGUOUS' | null) => void;
  ownershipFilter: 'owned' | 'unowned' | null;
  onOwnershipFilterChange: (ownership: 'owned' | 'unowned' | null) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

function filterGraph(
  graph: ReactFlowGraph,
  searchQuery: string,
  nodeKindFilter: 'service' | 'file' | null,
  communityFilter: string | null,
  confidenceFilter: 'EXTRACTED' | 'INFERRED' | 'AMBIGUOUS' | null,
  ownershipFilter: 'owned' | 'unowned' | null
) {
  const edges = graph.edges.filter(
    (edge) => !confidenceFilter || edge.data?.confidence === confidenceFilter
  );
  const connectedNodeIds = new Set(edges.flatMap((edge) => [edge.source, edge.target]));
  const loweredQuery = searchQuery.toLowerCase();
  const nodes = graph.nodes.filter((node) => {
    const matchesSearch =
      !searchQuery ||
      node.data.label.toLowerCase().includes(loweredQuery) ||
      node.data.path?.toLowerCase().includes(loweredQuery);
    const matchesKind = !nodeKindFilter || node.data.nodeKind === nodeKindFilter;
    const matchesCommunity = !communityFilter || node.data.communityId === communityFilter;
    const matchesOwnership =
      !ownershipFilter ||
      node.data.ownership === ownershipFilter ||
      node.data.nodeKind === 'service';
    const matchesConfidence =
      !confidenceFilter || connectedNodeIds.has(node.id) || node.data.nodeKind === 'service';

    return (
      matchesSearch && matchesKind && matchesCommunity && matchesOwnership && matchesConfidence
    );
  });

  const nodeIds = new Set(nodes.map((node) => node.id));
  const filteredEdges = edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
  );

  return { nodes, edges: filteredEdges };
}

export function GraphContainer({
  graph,
  selectedNodeId,
  onNodeSelect,
  layoutDirection,
  onLayoutDirectionChange,
  nodeKindFilter,
  onNodeKindFilterChange,
  communityFilter,
  onCommunityFilterChange,
  confidenceFilter,
  onConfidenceFilterChange,
  ownershipFilter,
  onOwnershipFilterChange,
  searchQuery,
  onSearchQueryChange,
}: GraphContainerProps) {
  const graphData = useGraphData(graph);
  const nodeKinds = useMemo(() => getNodeKinds(graph), [graph]);
  const communities = useMemo(
    () =>
      graph.knowledgeGraph?.communities.map((community) => ({
        id: community.id,
        label: community.label,
      })) ?? [],
    [graph]
  );

  const filteredGraph = useMemo(() => {
    if (!graphData) return null;
    return filterGraph(
      graphData,
      searchQuery,
      nodeKindFilter,
      communityFilter,
      confidenceFilter,
      ownershipFilter
    );
  }, [graphData, searchQuery, nodeKindFilter, communityFilter, confidenceFilter, ownershipFilter]);

  const layoutedGraph = useMemo(() => {
    if (!filteredGraph) return null;
    return applyDagreLayout(filteredGraph, { direction: layoutDirection });
  }, [filteredGraph, layoutDirection]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedGraph?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedGraph?.edges || []);

  useEffect(() => {
    if (layoutedGraph) {
      setNodes(layoutedGraph.nodes);
      setEdges(layoutedGraph.edges);
    }
  }, [layoutedGraph, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      onNodeSelect(node.id);
    },
    [onNodeSelect]
  );

  const handlePaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  if (!layoutedGraph) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No graph data to display
      </div>
    );
  }

  return (
    <div className="w-full h-full flex">
      <aside className="w-72 border-r bg-background/50 backdrop-blur-sm z-10">
        <GraphControls
          direction={layoutDirection}
          onDirectionChange={onLayoutDirectionChange}
          nodeKinds={nodeKinds}
          selectedKind={nodeKindFilter}
          onKindChange={onNodeKindFilterChange}
          communities={communities}
          selectedCommunity={communityFilter}
          onCommunityChange={onCommunityFilterChange}
          confidenceFilter={confidenceFilter}
          onConfidenceChange={onConfidenceFilterChange}
          ownershipFilter={ownershipFilter}
          onOwnershipChange={onOwnershipFilterChange}
          searchQuery={searchQuery}
          onSearchQueryChange={onSearchQueryChange}
        />
      </aside>

      <div className="flex-1 h-full relative">
        <ReactFlow
          nodes={nodes.map((node) => ({
            ...node,
            selected: node.id === selectedNodeId,
          }))}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="hsl(var(--muted-foreground) / 0.2)" gap={20} />
          <Controls className="!bg-background/80 !backdrop-blur-sm !border-border" />
          <MiniMap
            className="!bg-background/80 !backdrop-blur-sm !border-border"
            nodeColor={(node) =>
              node.type === 'service' ? 'hsl(var(--muted))' : 'rgb(125 211 252)'
            }
            maskColor="hsl(var(--background) / 0.8)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
