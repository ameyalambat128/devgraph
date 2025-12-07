'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface KeyValuePair {
  key: string;
  value: string;
}

interface KeyValueEditorProps {
  items: KeyValuePair[];
  keyLabel?: string;
  valueLabel?: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  onAdd: (key: string, value: string) => void;
  onRemove: (key: string) => void;
}

export function KeyValueEditor({
  items,
  keyLabel = 'Key',
  valueLabel = 'Value',
  keyPlaceholder = 'Enter key',
  valuePlaceholder = 'Enter value',
  onAdd,
  onRemove,
}: KeyValueEditorProps) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (newKey.trim()) {
      onAdd(newKey.trim(), newValue.trim());
      setNewKey('');
      setNewValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newKey.trim()) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map(({ key, value }) => (
            <div
              key={key}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
            >
              <div className="flex-1 min-w-0">
                <code className="text-sm font-mono font-medium">{key}</code>
                {value && (
                  <>
                    <span className="text-muted-foreground mx-1">=</span>
                    <code className="text-sm font-mono text-muted-foreground truncate">
                      {value}
                    </code>
                  </>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                onClick={() => onRemove(key)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1">
          <Label className="sr-only">{keyLabel}</Label>
          <Input
            placeholder={keyPlaceholder}
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="flex-1">
          <Label className="sr-only">{valueLabel}</Label>
          <Input
            placeholder={valuePlaceholder}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleAdd}
          disabled={!newKey.trim()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
