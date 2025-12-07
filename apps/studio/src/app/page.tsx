'use client';

import { useState } from 'react';
import { useStudioStore } from '@/store/studio-store';
import { useSelectedService } from '@/store/studio-selectors';
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
  const selectedServiceName = useStudioStore((state) => state.selectedServiceName);
  const selectService = useStudioStore((state) => state.selectService);
  const layoutDirection = useStudioStore((state) => state.layoutDirection);
  const setLayoutDirection = useStudioStore((state) => state.setLayoutDirection);
  const serviceTypeFilter = useStudioStore((state) => state.serviceTypeFilter);
  const setServiceTypeFilter = useStudioStore((state) => state.setServiceTypeFilter);

  const selectedService = useSelectedService();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Show loader if no graph is loaded
  if (!editedGraph) {
    return <GraphLoader onGraphLoad={loadGraph} />;
  }

  return (
    <main className="h-screen w-screen overflow-hidden">
      <GraphContainer
        graph={editedGraph}
        selectedService={selectedServiceName}
        onServiceSelect={selectService}
        layoutDirection={layoutDirection}
        onLayoutDirectionChange={setLayoutDirection}
        serviceTypeFilter={serviceTypeFilter}
        onServiceTypeFilterChange={setServiceTypeFilter}
      />

      <ServiceDetailPanel
        service={selectedService}
        open={!!selectedService}
        onClose={() => selectService(null)}
      />

      {hasUnsavedChanges && (
        <UnsavedBanner
          onReset={resetGraph}
          onExport={() => setExportDialogOpen(true)}
        />
      )}

      <ExportDialog
        graph={editedGraph}
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
      />
    </main>
  );
}
