'use client';

import { ArrowRightLeft, ArrowUpDown, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export function GraphControls({
  direction,
  onDirectionChange,
  serviceTypes,
  selectedType,
  onTypeChange,
  searchQuery,
  onSearchQueryChange,
}: GraphControlsProps) {
  return (
    <div className="flex flex-col gap-6 h-full p-4">
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Search
        </span>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-8 w-full bg-background/50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Layout
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onDirectionChange(
              direction === 'horizontal' ? 'vertical' : 'horizontal'
            )
          }
          className="w-full justify-between bg-background/50"
        >
          <span className="flex items-center">
            {direction === 'horizontal' ? (
              <ArrowRightLeft className="w-4 h-4 mr-2" />
            ) : (
              <ArrowUpDown className="w-4 h-4 mr-2" />
            )}
            Direction
          </span>
          <span className="text-xs text-muted-foreground capitalize">{direction}</span>
        </Button>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Filter
        </span>
        <Select
          value={selectedType || 'all'}
          onValueChange={(value) =>
            onTypeChange(value === 'all' ? null : value)
          }
        >
          <SelectTrigger className="w-full bg-background/50">
            <div className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter type" />
            </div>
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
      </div>
    </div>
  );
}
