'use client';

import { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ServiceNode } from './service-node';
import { DependencyEdge as DependencyEdgeComponent } from './dependency-edge';
import { GraphControls } from './graph-controls';
import { useGraphData, getServiceTypes, filterByServiceType } from '@/hooks/use-graph-data';
import { applyDagreLayout } from '@/hooks/use-graph-layout';
import type { Devgraph } from '@/types/graph';
import type { LayoutDirection } from '@/types/studio';

const nodeTypes = {
  service: ServiceNode,
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
  selectedService: string | null;
  onServiceSelect: (serviceName: string | null) => void;
  layoutDirection: LayoutDirection;
  onLayoutDirectionChange: (direction: LayoutDirection) => void;
  serviceTypeFilter: string | null;
  onServiceTypeFilterChange: (type: string | null) => void;
}

export function GraphContainer({
  graph,
  selectedService,
  onServiceSelect,
  layoutDirection,
  onLayoutDirectionChange,
  serviceTypeFilter,
  onServiceTypeFilterChange,
}: GraphContainerProps) {
  const graphData = useGraphData(graph);
  const serviceTypes = useMemo(() => getServiceTypes(graph), [graph]);

  const filteredGraph = useMemo(() => {
    if (!graphData) return null;
    return filterByServiceType(graphData, serviceTypeFilter);
  }, [graphData, serviceTypeFilter]);

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
      onServiceSelect(node.id);
    },
    [onServiceSelect]
  );

  const handlePaneClick = useCallback(() => {
    onServiceSelect(null);
  }, [onServiceSelect]);

  if (!layoutedGraph) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No graph data to display
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <GraphControls
        direction={layoutDirection}
        onDirectionChange={onLayoutDirectionChange}
        serviceTypes={serviceTypes}
        selectedType={serviceTypeFilter}
        onTypeChange={onServiceTypeFilterChange}
      />

      <ReactFlow
        nodes={nodes.map((node) => ({
          ...node,
          selected: node.id === selectedService,
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
          nodeColor="hsl(var(--muted))"
          maskColor="hsl(var(--background) / 0.8)"
        />
      </ReactFlow>
    </div>
  );
}
