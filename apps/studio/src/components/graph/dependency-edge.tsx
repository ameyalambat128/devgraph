'use client';

import { memo } from 'react';
import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import { useStudioStore } from '@/store/studio-store';

function DependencyEdgeComponent({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  markerEnd,
}: EdgeProps) {
  const hoveredNodeId = useStudioStore((state) => state.hoveredNodeId);
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
  });

  const isConnectedToHovered = hoveredNodeId && (source === hoveredNodeId || target === hoveredNodeId);
  const isDimmed = hoveredNodeId && !isConnectedToHovered;

  const strokeColor = selected || isConnectedToHovered 
    ? 'hsl(var(--primary))' 
    : 'hsl(var(--muted-foreground))';
    
  const strokeWidth = selected || isConnectedToHovered ? 3 : 1.5;
  const opacity = isDimmed ? 0.1 : (selected || isConnectedToHovered ? 1 : 0.6);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        interactionWidth={20}
        style={{
          stroke: strokeColor,
          strokeWidth,
          opacity,
          transition: 'all 0.3s ease',
        }}
      />
    </>
  );
}

export const DependencyEdge = memo(DependencyEdgeComponent);
