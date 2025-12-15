import { readFile } from 'node:fs/promises';
import { NextResponse } from 'next/server';
import path from 'node:path';

export async function GET() {
  try {
    // In dev mode, read from repo root .devgraph/graph.json
    const graphPath = path.resolve(process.cwd(), '../../.devgraph/graph.json');
    const graphData = await readFile(graphPath, 'utf8');

    return NextResponse.json(JSON.parse(graphData));
  } catch (error) {
    return NextResponse.json(
      { error: 'graph.json not found. Run: pnpm devgraph build examples/*.md' },
      { status: 404 }
    );
  }
}
