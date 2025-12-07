'use client';

import { ArrowRightLeft, ArrowUpDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { LayoutDirection } from '@/types/studio';

interface GraphControlsProps {
  direction: LayoutDirection;
  onDirectionChange: (direction: LayoutDirection) => void;
  serviceTypes: string[];
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
}

export function GraphControls({
  direction,
  onDirectionChange,
  serviceTypes,
  selectedType,
  onTypeChange,
}: GraphControlsProps) {
  return (
    <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          onDirectionChange(
            direction === 'horizontal' ? 'vertical' : 'horizontal'
          )
        }
        className="bg-background/80 backdrop-blur-sm"
      >
        {direction === 'horizontal' ? (
          <>
            <ArrowRightLeft className="w-4 h-4 mr-1.5" />
            Horizontal
          </>
        ) : (
          <>
            <ArrowUpDown className="w-4 h-4 mr-1.5" />
            Vertical
          </>
        )}
      </Button>

      {serviceTypes.length > 1 && (
        <Select
          value={selectedType || 'all'}
          onValueChange={(value) =>
            onTypeChange(value === 'all' ? null : value)
          }
        >
          <SelectTrigger className="w-[140px] bg-background/80 backdrop-blur-sm">
            <Filter className="w-4 h-4 mr-1.5" />
            <SelectValue placeholder="Filter type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {serviceTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
