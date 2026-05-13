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
  nodeKinds: string[];
  selectedKind: 'service' | 'file' | null;
  onKindChange: (kind: 'service' | 'file' | null) => void;
  communities: { id: string; label: string }[];
  selectedCommunity: string | null;
  onCommunityChange: (communityId: string | null) => void;
  confidenceFilter: 'EXTRACTED' | 'INFERRED' | 'AMBIGUOUS' | null;
  onConfidenceChange: (confidence: 'EXTRACTED' | 'INFERRED' | 'AMBIGUOUS' | null) => void;
  ownershipFilter: 'owned' | 'unowned' | null;
  onOwnershipChange: (ownership: 'owned' | 'unowned' | null) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export function GraphControls({
  direction,
  onDirectionChange,
  nodeKinds,
  selectedKind,
  onKindChange,
  communities,
  selectedCommunity,
  onCommunityChange,
  confidenceFilter,
  onConfidenceChange,
  ownershipFilter,
  onOwnershipChange,
  searchQuery,
  onSearchQueryChange,
}: GraphControlsProps) {
  return (
    <div className="flex flex-col gap-6 h-full p-4">
      <div className="py-2">
        <img src="/devgraph-wordmark-dark.svg" alt="DevGraph" className="h-6" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Search
        </span>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
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
          onClick={() => onDirectionChange(direction === 'horizontal' ? 'vertical' : 'horizontal')}
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
          Node Kind
        </span>
        <Select
          value={selectedKind || 'all'}
          onValueChange={(value) =>
            onKindChange(value === 'all' ? null : (value as 'service' | 'file'))
          }
        >
          <SelectTrigger className="w-full bg-background/50">
            <div className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter node kind" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All node kinds</SelectItem>
            {nodeKinds.map((kind) => (
              <SelectItem key={kind} value={kind}>
                {kind}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Community
        </span>
        <Select
          value={selectedCommunity || 'all'}
          onValueChange={(value) => onCommunityChange(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-full bg-background/50">
            <div className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter community" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All communities</SelectItem>
            {communities.map((community) => (
              <SelectItem key={community.id} value={community.id}>
                {community.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Provenance
        </span>
        <Select
          value={confidenceFilter || 'all'}
          onValueChange={(value) =>
            onConfidenceChange(
              value === 'all' ? null : (value as 'EXTRACTED' | 'INFERRED' | 'AMBIGUOUS')
            )
          }
        >
          <SelectTrigger className="w-full bg-background/50">
            <div className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter provenance" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All provenance</SelectItem>
            <SelectItem value="EXTRACTED">Extracted</SelectItem>
            <SelectItem value="INFERRED">Inferred</SelectItem>
            <SelectItem value="AMBIGUOUS">Ambiguous</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Ownership
        </span>
        <Select
          value={ownershipFilter || 'all'}
          onValueChange={(value) =>
            onOwnershipChange(value === 'all' ? null : (value as 'owned' | 'unowned'))
          }
        >
          <SelectTrigger className="w-full bg-background/50">
            <div className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter ownership" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All files</SelectItem>
            <SelectItem value="owned">Owned files</SelectItem>
            <SelectItem value="unowned">Unowned files</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-auto text-xs text-muted-foreground">
        Hybrid graph filters apply directly to services and files from `.devgraph/graph.json`.
      </div>
    </div>
  );
}
