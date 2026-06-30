import { watch } from 'node:fs';
import type { SyncOptions, SyncResult } from './types.js';
import { syncProject } from './sync.js';

export interface WatchOptions extends SyncOptions {
  debounceMs?: number;
  onSync?: (result: SyncResult) => void | Promise<void>;
}

export async function watchProject(inputs: string[], options: WatchOptions = {}) {
  const cwd = options.cwd ?? process.cwd();
  const debounceMs = options.debounceMs ?? 300;
  let timer: NodeJS.Timeout | undefined;
  let running = false;
  let queued = false;

  const runSync = async () => {
    if (running) {
      queued = true;
      return;
    }

    running = true;
    try {
      const result = await syncProject(inputs, options);
      await options.onSync?.(result);
    } finally {
      running = false;
      if (queued) {
        queued = false;
        await runSync();
      }
    }
  };

  await runSync();

  const watcher = watch(
    cwd,
    {
      recursive: true,
    },
    () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        void runSync();
      }, debounceMs);
    }
  );

  return {
    close() {
      clearTimeout(timer);
      watcher.close();
    },
  };
}
