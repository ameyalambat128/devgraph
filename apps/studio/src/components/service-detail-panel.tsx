'use client';

import { Terminal, Globe, Settings, GitBranch, Copy, Check, Pencil, FileText } from 'lucide-react';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EditPanel } from './edit-panel';
import { generateAgentContext } from '@/lib/export';
import { useStudioStore } from '@/store/studio-store';
import type { ServiceWithDetails } from '@/types/graph';

interface ServiceDetailPanelProps {
  service: ServiceWithDetails | null;
  open: boolean;
  onClose: () => void;
}

export function ServiceDetailPanel({
  service,
  open,
  onClose,
}: ServiceDetailPanelProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const editedGraph = useStudioStore((state) => state.editedGraph);

  const copyToClipboard = async (text: string, itemId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedItem(itemId);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const copyAgentContext = async () => {
    if (!service || !editedGraph) return;
    const context = generateAgentContext(service, editedGraph);
    await copyToClipboard(context, 'agent-context');
  };

  if (!service) return null;

  const commands = service.commands ? Object.entries(service.commands) : [];
  const routes = service.apis?.flatMap((api) =>
    Object.entries(api.routes || {}).map(([route, desc]) => ({
      route,
      description: typeof desc === 'string' ? desc : '',
    }))
  ) || [];
  const envVars = service.env?.flatMap((env) =>
    Object.entries(env.vars || {}).map(([key, value]) => ({ key, value }))
  ) || [];
  const dependencies = service.depends || [];

  return (
    <>
      <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <SheetContent className="w-[400px] sm:w-[540px] p-0">
          <SheetHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-heading flex items-center gap-3">
                {service.name}
                <Badge variant="secondary">{service.type}</Badge>
              </SheetTitle>
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyAgentContext}
                      >
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditPanelOpen(true)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit service</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </SheetHeader>

          <Separator className="my-4" />

          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="p-6 pt-0">
              <Tabs defaultValue="commands" className="w-full">
                <TabsList className="w-full flex justify-start border-b border-border bg-transparent p-0 h-auto rounded-none">
                  <TabsTrigger 
                    value="commands" 
                    className="flex-1 rounded-none border-b-2 border-transparent bg-transparent px-2 py-2 text-xs text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    <Terminal className="w-3.5 h-3.5 mr-2" />
                    Commands
                  </TabsTrigger>
                  <TabsTrigger 
                    value="routes" 
                    className="flex-1 rounded-none border-b-2 border-transparent bg-transparent px-2 py-2 text-xs text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    <Globe className="w-3.5 h-3.5 mr-2" />
                    Routes
                  </TabsTrigger>
                  <TabsTrigger 
                    value="env" 
                    className="flex-1 rounded-none border-b-2 border-transparent bg-transparent px-2 py-2 text-xs text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    <Settings className="w-3.5 h-3.5 mr-2" />
                    Env
                  </TabsTrigger>
                  <TabsTrigger 
                    value="deps" 
                    className="flex-1 rounded-none border-b-2 border-transparent bg-transparent px-2 py-2 text-xs text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    <GitBranch className="w-3.5 h-3.5 mr-2" />
                    Deps
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="commands" className="mt-6">
                  {commands.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No commands defined</p>
                  ) : (
                    <div className="space-y-3">
                      {commands.map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-start justify-between p-3 rounded-lg border border-border bg-transparent hover:bg-muted/10 transition-colors overflow-hidden"
                        >
                          <div className="flex-1 min-w-0 mr-3">
                            <p className="font-medium text-sm mb-1.5 truncate">{key}</p>
                            <code className="text-xs text-muted-foreground font-mono break-all line-clamp-2 block">
                              {value}
                            </code>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                            onClick={() => copyToClipboard(value, `cmd-${key}`)}
                          >
                            {copiedItem === `cmd-${key}` ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="routes" className="mt-6">
                  {routes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No routes defined</p>
                  ) : (
                    <div className="space-y-2">
                      {routes.map(({ route, description }, index) => (
                        <div
                          key={index}
                          className="flex items-start justify-between p-3 rounded-lg border border-border bg-transparent hover:bg-muted/10 transition-colors overflow-hidden"
                        >
                          <div className="flex-1 min-w-0 mr-3">
                            <code className="text-sm font-mono block truncate">{route}</code>
                            {description && (
                              <p className="text-xs text-muted-foreground mt-1.5 truncate">
                                {description}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                            onClick={() => copyToClipboard(route, `route-${index}`)}
                          >
                            {copiedItem === `route-${index}` ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="env" className="mt-6">
                  {envVars.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No env vars defined</p>
                  ) : (
                    <div className="space-y-2">
                      {envVars.map(({ key, value }) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-3 rounded-lg border border-border bg-transparent hover:bg-muted/10 transition-colors overflow-hidden"
                        >
                          <div className="flex items-center gap-2 min-w-0 mr-3 overflow-hidden flex-1">
                            <code className="text-sm font-mono font-medium shrink-0 truncate max-w-[45%]" title={key}>{key}</code>
                            <span className="text-muted-foreground shrink-0">=</span>
                            <code className="text-sm font-mono text-muted-foreground truncate flex-1" title={value}>
                              {value || '(empty)'}
                            </code>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                            onClick={() => copyToClipboard(`${key}=${value}`, `env-${key}`)}
                          >
                            {copiedItem === `env-${key}` ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="deps" className="mt-4">
                  {dependencies.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No dependencies</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {dependencies.map((dep) => (
                        <Badge key={dep} variant="outline" className="text-sm">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <EditPanel
        service={service}
        open={editPanelOpen}
        onOpenChange={setEditPanelOpen}
      />
    </>
  );
}
