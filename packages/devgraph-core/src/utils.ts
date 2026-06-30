import { createHash } from 'node:crypto';
import path from 'node:path';

export function normalizePath(value: string) {
  return value.split(path.sep).join('/');
}

export function toPosixRelative(cwd: string, targetPath: string) {
  return normalizePath(path.relative(cwd, targetPath)) || '.';
}

export function sha1(value: string | Buffer) {
  return createHash('sha1').update(value).digest('hex');
}

export function createCacheKey(filePath: string) {
  return sha1(normalizePath(filePath));
}

export function createFileNodeId(filePath: string) {
  return `file:${normalizePath(filePath)}`;
}

export function createSymbolNodeId(filePath: string, name: string, line: number) {
  return `symbol:${normalizePath(filePath)}:${name}:${line}`;
}

export function uniqueBy<T>(values: T[], getKey: (value: T) => string) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = getKey(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function clampText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

export function lineNumberAt(content: string, fragment: string) {
  const lines = content.split('\n');
  const index = lines.findIndex((line) => line.includes(fragment));
  return index >= 0 ? index + 1 : 1;
}

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
