'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileCode2, FolderTree, Link2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { GraphNodeData } from '@/types/graph';
import { useStudioStore } from '@/store/studio-store';
import { useIsNodeDimmed } from '@/store/studio-selectors';

interface FileNodeProps {
  data: GraphNodeData;
  selected?: boolean;
}

function FileNodeComponent({ data, selected }: FileNodeProps) {
  const setHoveredNodeId = useStudioStore((state) => state.setHoveredNodeId);
  const isDimmed = useIsNodeDimmed(data.id);

  return (
    <div
      onMouseEnter={() => setHoveredNodeId(data.id)}
      onMouseLeave={() => setHoveredNodeId(null)}
      className={cn(
        'rounded-lg border border-sky-300/40 bg-sky-50/70 p-4 shadow-md transition-all duration-200 min-w-[260px]',
        'hover:shadow-lg hover:border-sky-400/60 hover:-translate-y-1',
        selected &&
          'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 z-10',
        isDimmed &&
          'opacity-20 grayscale blur-[1px] hover:opacity-20 hover:grayscale hover:blur-[1px] hover:translate-y-0 hover:shadow-md hover:border-sky-300/40'
      )}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-sky-500" />

      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="font-semibold text-foreground truncate">{data.label}</h3>
        <Badge variant="secondary" className="text-xs">
          {data.ownership ?? 'file'}
        </Badge>
      </div>

      {data.path && (
        <div className="mb-3 text-xs text-muted-foreground truncate" title={data.path}>
          {data.path}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <FileCode2 className="w-3.5 h-3.5" />
          <span>{String(data.metadata?.fileKind ?? 'file')}</span>
        </div>
        {data.communityLabel && (
          <div className="flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5" />
            <span className="truncate">{data.communityLabel}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5" />
          <span>{data.relationCount} links</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-sky-500" />
    </div>
  );
}

export const FileNode = memo(FileNodeComponent);
