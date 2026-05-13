'use client';

import { useState, useEffect } from 'react';
import { useStudioStore } from '@/store/studio-store';
import { useSelectedNode } from '@/store/studio-selectors';
import { GraphLoader } from '@/components/graph-loader';
import { GraphContainer } from '@/components/graph/graph-container';
import { ServiceDetailPanel } from '@/components/service-detail-panel';
import { UnsavedBanner } from '@/components/unsaved-banner';
import { ExportDialog } from '@/components/export-dialog';

export default function StudioPage() {
  const editedGraph = useStudioStore((state) => state.editedGraph);
  const loadGraph = useStudioStore((state) => state.loadGraph);
  const resetGraph = useStudioStore((state) => state.resetGraph);
  const hasUnsavedChanges = useStudioStore((state) => state.hasUnsavedChanges);
  const selectedNodeId = useStudioStore((state) => state.selectedNodeId);
  const selectNode = useStudioStore((state) => state.selectNode);
  const layoutDirection = useStudioStore((state) => state.layoutDirection);
  const setLayoutDirection = useStudioStore((state) => state.setLayoutDirection);
  const nodeKindFilter = useStudioStore((state) => state.nodeKindFilter);
  const setNodeKindFilter = useStudioStore((state) => state.setNodeKindFilter);
  const communityFilter = useStudioStore((state) => state.communityFilter);
  const setCommunityFilter = useStudioStore((state) => state.setCommunityFilter);
  const confidenceFilter = useStudioStore((state) => state.confidenceFilter);
  const setConfidenceFilter = useStudioStore((state) => state.setConfidenceFilter);
  const ownershipFilter = useStudioStore((state) => state.ownershipFilter);
  const setOwnershipFilter = useStudioStore((state) => state.setOwnershipFilter);
  const searchQuery = useStudioStore((state) => state.searchQuery);
  const setSearchQuery = useStudioStore((state) => state.setSearchQuery);

  const selectedNode = useSelectedNode();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Auto-load graph from API
  useEffect(() => {
    async function tryAutoLoad() {
      if (editedGraph) return;

      try {
        const response = await fetch('/api/graph');
        if (response.ok) {
          const graph = await response.json();
          loadGraph(graph);
        }
      } catch (error) {
        console.log('Could not auto-load graph', error);
      }
    }

    tryAutoLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show loader if no graph is loaded
  if (!editedGraph) {
    return <GraphLoader onGraphLoad={loadGraph} />;
  }

  return (
    <main className="h-screen w-screen overflow-hidden">
      <GraphContainer
        graph={editedGraph}
        selectedNodeId={selectedNodeId}
        onNodeSelect={selectNode}
        layoutDirection={layoutDirection}
        onLayoutDirectionChange={setLayoutDirection}
        nodeKindFilter={nodeKindFilter}
        onNodeKindFilterChange={setNodeKindFilter}
        communityFilter={communityFilter}
        onCommunityFilterChange={setCommunityFilter}
        confidenceFilter={confidenceFilter}
        onConfidenceFilterChange={setConfidenceFilter}
        ownershipFilter={ownershipFilter}
        onOwnershipFilterChange={setOwnershipFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      <ServiceDetailPanel
        selectedNode={selectedNode}
        open={!!selectedNode}
        onClose={() => selectNode(null)}
      />

      {hasUnsavedChanges && (
        <UnsavedBanner onReset={resetGraph} onExport={() => setExportDialogOpen(true)} />
      )}

      <ExportDialog
        graph={editedGraph}
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
      />
    </main>
  );
}
