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
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="commands" className="text-xs">
                    <Terminal className="w-3.5 h-3.5 mr-1" />
                    Commands
                  </TabsTrigger>
                  <TabsTrigger value="routes" className="text-xs">
                    <Globe className="w-3.5 h-3.5 mr-1" />
                    Routes
                  </TabsTrigger>
                  <TabsTrigger value="env" className="text-xs">
                    <Settings className="w-3.5 h-3.5 mr-1" />
                    Env
                  </TabsTrigger>
                  <TabsTrigger value="deps" className="text-xs">
                    <GitBranch className="w-3.5 h-3.5 mr-1" />
                    Deps
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="commands" className="mt-4">
                  {commands.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No commands defined</p>
                  ) : (
                    <div className="space-y-3">
                      {commands.map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-start justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{key}</p>
                            <code className="text-xs text-muted-foreground font-mono break-all">
                              {value}
                            </code>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-2 shrink-0"
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

                <TabsContent value="routes" className="mt-4">
                  {routes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No routes defined</p>
                  ) : (
                    <div className="space-y-2">
                      {routes.map(({ route, description }, index) => (
                        <div
                          key={index}
                          className="flex items-start justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex-1 min-w-0">
                            <code className="text-sm font-mono">{route}</code>
                            {description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {description}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-2 shrink-0"
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

                <TabsContent value="env" className="mt-4">
                  {envVars.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No env vars defined</p>
                  ) : (
                    <div className="space-y-2">
                      {envVars.map(({ key, value }) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <code className="text-sm font-mono font-medium">{key}</code>
                            <span className="text-muted-foreground">=</span>
                            <code className="text-sm font-mono text-muted-foreground truncate">
                              {value || '(empty)'}
                            </code>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-2 shrink-0"
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
