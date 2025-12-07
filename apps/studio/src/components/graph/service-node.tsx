'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Terminal, Globe, Settings, GitBranch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ServiceNodeData } from '@/types/graph';

interface ServiceNodeProps {
  data: ServiceNodeData;
  selected?: boolean;
}

function ServiceNodeComponent({ data, selected }: ServiceNodeProps) {
  const { name, type, commandCount, routeCount, envVarCount, dependencyCount } =
    data;

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 shadow-md transition-all min-w-[250px]',
        'hover:shadow-lg hover:border-primary/50',
        selected && 'border-primary ring-2 ring-primary/20'
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-muted-foreground"
      />

      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground truncate">{name}</h3>
        <Badge variant="secondary" className="text-xs">
          {type}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5" />
          <span>{commandCount} commands</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" />
          <span>{routeCount} routes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5" />
          <span>{envVarCount} env vars</span>
        </div>
        <div className="flex items-center gap-1.5">
          <GitBranch className="w-3.5 h-3.5" />
          <span>{dependencyCount} deps</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-muted-foreground"
      />
    </div>
  );
}

export const ServiceNode = memo(ServiceNodeComponent);
