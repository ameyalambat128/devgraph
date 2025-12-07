'use client';

import { useState, useCallback } from 'react';
import { Upload, FileJson, Clipboard, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Devgraph } from '@/types/graph';

interface GraphLoaderProps {
  onGraphLoad: (graph: Devgraph) => void;
}

export function GraphLoader({ onGraphLoad }: GraphLoaderProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const parseAndLoadGraph = useCallback(
    (content: string) => {
      try {
        const parsed = JSON.parse(content) as Devgraph;
        if (!parsed.services || typeof parsed.services !== 'object') {
          throw new Error('Invalid graph.json: missing "services" object');
        }
        setError(null);
        onGraphLoad(parsed);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid JSON');
      }
    },
    [onGraphLoad]
  );

  const handleFileUpload = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        parseAndLoadGraph(content);
      };
      reader.onerror = () => setError('Failed to read file');
      reader.readAsText(file);
    },
    [parseAndLoadGraph]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const handlePaste = useCallback(() => {
    parseAndLoadGraph(jsonInput);
  }, [jsonInput, parseAndLoadGraph]);

  const handleClipboardPaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonInput(text);
      parseAndLoadGraph(text);
    } catch {
      setError('Failed to read from clipboard');
    }
  }, [parseAndLoadGraph]);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-heading">DevGraph Studio</CardTitle>
          <CardDescription>
            Load your graph.json to visualize and edit your codebase architecture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="paste">Paste JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <FileJson className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Drag and drop your graph.json here, or
                </p>
                <label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <Button variant="outline" asChild>
                    <span className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Browse Files
                    </span>
                  </Button>
                </label>
              </div>
            </TabsContent>

            <TabsContent value="paste" className="mt-4 space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClipboardPaste}
                >
                  <Clipboard className="w-4 h-4 mr-2" />
                  Paste from Clipboard
                </Button>
              </div>
              <Textarea
                placeholder='{"services": {...}, "apis": {...}}'
                className="font-mono text-sm min-h-[200px]"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
              />
              <Button onClick={handlePaste} className="w-full">
                Load Graph
              </Button>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Generate graph.json with:{' '}
              <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">
                devgraph build
              </code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
