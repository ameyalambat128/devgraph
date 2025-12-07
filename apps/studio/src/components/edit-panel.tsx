'use client';

import { Pencil } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KeyValueEditor } from './key-value-editor';
import { useStudioStore } from '@/store/studio-store';
import type { ServiceWithDetails } from '@/types/graph';

interface EditPanelProps {
  service: ServiceWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPanel({ service, open, onOpenChange }: EditPanelProps) {
  const addCommand = useStudioStore((state) => state.addCommand);
  const removeCommand = useStudioStore((state) => state.removeCommand);
  const addEnvVar = useStudioStore((state) => state.addEnvVar);
  const removeEnvVar = useStudioStore((state) => state.removeEnvVar);
  const addDependency = useStudioStore((state) => state.addDependency);
  const removeDependency = useStudioStore((state) => state.removeDependency);

  const commands = service.commands
    ? Object.entries(service.commands).map(([key, value]) => ({ key, value }))
    : [];

  const envVars = service.env?.flatMap((env) =>
    Object.entries(env.vars || {}).map(([key, value]) => ({ key, value }))
  ) || [];

  const dependencies = (service.depends || []).map((dep) => ({
    key: dep,
    value: '',
  }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="text-xl font-heading flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            Edit {service.name}
          </SheetTitle>
        </SheetHeader>

        <Separator className="my-4" />

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-6 pt-0 space-y-6">
            <section>
              <h3 className="font-medium mb-3">Commands</h3>
              <KeyValueEditor
                items={commands}
                keyLabel="Command name"
                valueLabel="Command script"
                keyPlaceholder="e.g., dev"
                valuePlaceholder="e.g., npm run dev"
                onAdd={(key, value) => addCommand(service.name, key, value)}
                onRemove={(key) => removeCommand(service.name, key)}
              />
            </section>

            <Separator />

            <section>
              <h3 className="font-medium mb-3">Environment Variables</h3>
              <KeyValueEditor
                items={envVars}
                keyLabel="Variable name"
                valueLabel="Default value"
                keyPlaceholder="e.g., DATABASE_URL"
                valuePlaceholder="e.g., postgres://..."
                onAdd={(key, value) => addEnvVar(service.name, key, value)}
                onRemove={(key) => removeEnvVar(service.name, key)}
              />
            </section>

            <Separator />

            <section>
              <h3 className="font-medium mb-3">Dependencies</h3>
              <KeyValueEditor
                items={dependencies}
                keyLabel="Service name"
                valueLabel=""
                keyPlaceholder="e.g., auth-service"
                valuePlaceholder=""
                onAdd={(key) => addDependency(service.name, key)}
                onRemove={(key) => removeDependency(service.name, key)}
              />
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
