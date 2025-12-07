'use client';

import { useState } from 'react';
import { Download, Copy, Check, FileJson, FileText, GitBranch } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  generateSummary,
  generateMermaid,
  downloadFile,
  copyToClipboard,
} from '@/lib/export';
import type { Devgraph } from '@/types/graph';

interface ExportDialogProps {
  graph: Devgraph;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ExportTab = 'json' | 'summary' | 'mermaid';

export function ExportDialog({ graph, open, onOpenChange }: ExportDialogProps) {
  const [activeTab, setActiveTab] = useState<ExportTab>('json');
  const [copied, setCopied] = useState(false);

  const getContent = (): string => {
    switch (activeTab) {
      case 'json':
        return JSON.stringify(graph, null, 2);
      case 'summary':
        return generateSummary(graph);
      case 'mermaid':
        return generateMermaid(graph);
      default:
        return '';
    }
  };

  const getFilename = (): string => {
    switch (activeTab) {
      case 'json':
        return 'graph.json';
      case 'summary':
        return 'summary.md';
      case 'mermaid':
        return 'system.mmd';
      default:
        return 'export.txt';
    }
  };

  const getMimeType = (): string => {
    switch (activeTab) {
      case 'json':
        return 'application/json';
      case 'summary':
      case 'mermaid':
        return 'text/markdown';
      default:
        return 'text/plain';
    }
  };

  const handleDownload = () => {
    downloadFile(getContent(), getFilename(), getMimeType());
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(getContent());
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const content = getContent();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Export Graph</DialogTitle>
          <DialogDescription>
            Export your graph in different formats
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ExportTab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="json" className="text-xs">
              <FileJson className="w-4 h-4 mr-1.5" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="summary" className="text-xs">
              <FileText className="w-4 h-4 mr-1.5" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="mermaid" className="text-xs">
              <GitBranch className="w-4 h-4 mr-1.5" />
              Mermaid
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <ScrollArea className="h-[300px] rounded-lg border bg-muted/30">
              <pre className="p-4 text-xs font-mono whitespace-pre-wrap">
                {content}
              </pre>
            </ScrollArea>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </>
            )}
          </Button>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
