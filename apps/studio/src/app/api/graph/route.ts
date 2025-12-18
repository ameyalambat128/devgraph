import { readFile } from 'node:fs/promises';
import { NextResponse } from 'next/server';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const dynamic = 'force-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function GET() {
  // During build time (static export), we might not have access to the real graph.
  // Return a placeholder so the build succeeds.
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ nodes: [], edges: [] });
  }

  // Try multiple paths to find graph.json
  const possiblePaths = [
    // From apps/studio (pnpm --filter)
    path.resolve(process.cwd(), '../../.devgraph/graph.json'),
    // From repo root
    path.resolve(process.cwd(), '.devgraph/graph.json'),
    // Relative to this file (apps/studio/src/app/api/graph/)
    path.resolve(__dirname, '../../../../../../.devgraph/graph.json'),
  ];

  for (const graphPath of possiblePaths) {
    try {
      const graphData = await readFile(graphPath, 'utf8');
      return NextResponse.json(JSON.parse(graphData));
    } catch {
      // Try next path
    }
  }

  // If running in dev mode and file not found
  return NextResponse.json(
    { error: 'graph.json not found. Run: pnpm devgraph build examples/*.md' },
    { status: 404 }
  );
}
