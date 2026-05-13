'use client';

import { useState } from 'react';
import { Check, Copy, FileText, FolderTree, Link2, Pencil } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EditPanel } from './edit-panel';
import { generateAgentContext } from '@/lib/export';
import { useStudioStore } from '@/store/studio-store';
import type { SelectedNodeDetails } from '@/types/graph';

interface ServiceDetailPanelProps {
  selectedNode: SelectedNodeDetails | null;
  open: boolean;
  onClose: () => void;
}

export function ServiceDetailPanel({ selectedNode, open, onClose }: ServiceDetailPanelProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const editedGraph = useStudioStore((state) => state.editedGraph);

  if (!selectedNode) return null;

  const copyToClipboard = async (text: string, itemId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedItem(itemId);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const copyAgentContext = async () => {
    if (!selectedNode.service || !editedGraph) return;
    const context = generateAgentContext(selectedNode.service, editedGraph);
    await copyToClipboard(context, 'agent-context');
  };

  const routes =
    selectedNode.service?.apis?.flatMap((api) =>
      Object.entries(api.routes || {}).map(([route, description]) => ({
        route,
        description: typeof description === 'string' ? description : '',
      }))
    ) ?? [];
  const envVars =
    selectedNode.service?.env?.flatMap((env) =>
      Object.entries(env.vars || {}).map(([key, value]) => ({ key, value }))
    ) ?? [];
  const commands = selectedNode.service ? Object.entries(selectedNode.service.commands ?? {}) : [];

  return (
    <>
      <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <SheetContent className="w-[420px] sm:w-[560px] p-0">
          <SheetHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-heading flex items-center gap-3">
                {selectedNode.node.label}
                <Badge variant="secondary">{selectedNode.node.kind}</Badge>
              </SheetTitle>
              <div className="flex items-center gap-1 mr-8">
                {selectedNode.service && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={copyAgentContext}>
                          {copiedItem === 'agent-context' ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy agent context</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {selectedNode.service && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setEditPanelOpen(true)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit service</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </SheetHeader>

          <Separator className="my-4" />

          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="p-6 pt-0">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="connections">Connections</TabsTrigger>
                  <TabsTrigger value="service">Service</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedNode.community?.label ?? 'No community'}</span>
                    </div>
                    {selectedNode.node.path && (
                      <div className="rounded-lg border p-3 text-xs font-mono break-all">
                        {selectedNode.node.path}
                      </div>
                    )}
                    {selectedNode.node.summary && (
                      <p className="text-muted-foreground">{selectedNode.node.summary}</p>
                    )}
                    {selectedNode.service?.paths && selectedNode.service.paths.length > 0 && (
                      <div>
                        <div className="font-medium mb-2">Declared service paths</div>
                        <div className="space-y-2">
                          {selectedNode.service.paths.map((servicePath) => (
                            <div
                              key={servicePath}
                              className="rounded-lg border p-3 text-xs font-mono"
                            >
                              {servicePath}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="connections" className="mt-6 space-y-4">
                  <div>
                    <div className="font-medium mb-3">Outgoing</div>
                    <div className="space-y-2">
                      {selectedNode.outgoing.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No outgoing edges</p>
                      ) : (
                        selectedNode.outgoing.map((edge) => (
                          <div
                            key={`${edge.source}-${edge.target}-${edge.relation}`}
                            className="rounded-lg border p-3 text-sm"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-medium">{edge.relation}</span>
                              <Badge variant="outline">{edge.confidence}</Badge>
                            </div>
                            <div className="mt-1 text-muted-foreground break-all">
                              {edge.evidence ?? edge.sourcePath ?? edge.target}
                              {edge.sourceLocation ? ` ${edge.sourceLocation}` : ''}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="font-medium mb-3">Incoming</div>
                    <div className="space-y-2">
                      {selectedNode.incoming.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No incoming edges</p>
                      ) : (
                        selectedNode.incoming.map((edge) => (
                          <div
                            key={`${edge.source}-${edge.target}-${edge.relation}`}
                            className="rounded-lg border p-3 text-sm"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-medium">{edge.relation}</span>
                              <Badge variant="outline">{edge.confidence}</Badge>
                            </div>
                            <div className="mt-1 text-muted-foreground break-all">
                              {edge.evidence ?? edge.sourcePath ?? edge.source}
                              {edge.sourceLocation ? ` ${edge.sourceLocation}` : ''}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="service" className="mt-6 space-y-4">
                  {!selectedNode.service ? (
                    <p className="text-sm text-muted-foreground">
                      This node is not a service, so there are no service commands, routes, or env
                      vars to edit.
                    </p>
                  ) : (
                    <>
                      <div>
                        <div className="font-medium mb-3">Commands</div>
                        <div className="space-y-2">
                          {commands.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No commands defined</p>
                          ) : (
                            commands.map(([key, value]) => (
                              <div
                                key={key}
                                className="grid grid-cols-[1fr_auto] gap-3 items-start rounded-lg border p-3"
                              >
                                <div>
                                  <div className="font-medium text-sm">{key}</div>
                                  <code className="text-xs text-muted-foreground break-all">
                                    {value}
                                  </code>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => copyToClipboard(value, `cmd-${key}`)}
                                >
                                  {copiedItem === `cmd-${key}` ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="font-medium mb-3">Routes</div>
                        <div className="space-y-2">
                          {routes.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No routes defined</p>
                          ) : (
                            routes.map(({ route, description }) => (
                              <div key={route} className="rounded-lg border p-3 text-sm">
                                <code className="font-mono">{route}</code>
                                {description && (
                                  <div className="mt-1 text-muted-foreground">{description}</div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="font-medium mb-3">Env Vars</div>
                        <div className="space-y-2">
                          {envVars.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No env vars defined</p>
                          ) : (
                            envVars.map(({ key, value }) => (
                              <div key={key} className="rounded-lg border p-3 text-sm">
                                <code className="font-mono">{key}</code>
                                <div className="mt-1 text-muted-foreground break-all">{value}</div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {selectedNode.service && (
        <EditPanel
          service={selectedNode.service}
          open={editPanelOpen}
          onOpenChange={setEditPanelOpen}
        />
      )}
    </>
  );
}
