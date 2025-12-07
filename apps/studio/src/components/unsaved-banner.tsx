'use client';

import { AlertCircle, RotateCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UnsavedBannerProps {
  onReset: () => void;
  onExport: () => void;
}

export function UnsavedBanner({ onReset, onExport }: UnsavedBannerProps) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30 shadow-lg backdrop-blur-sm">
        <AlertCircle className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-medium text-orange-500">
          Unsaved changes
        </span>
        <div className="flex items-center gap-2 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onExport}
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}
