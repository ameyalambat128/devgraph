import type { DevgraphGraph, QueryEdge, QueryMatch, QueryOptions, QueryResult } from './types.js';
import { clampText } from './utils.js';

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9_./-]+/g)
    .filter((token) => token.length > 1);
}

function scoreText(haystack: string, tokens: string[]) {
  const normalized = haystack.toLowerCase();
  return tokens.reduce((score, token) => {
    if (normalized === token) return score + 8;
    if (normalized.includes(token)) return score + 3;
    return score;
  }, 0);
}

function scorePathBias(filePath: string) {
  let score = 0;
  if (filePath.includes('/src/')) score += 8;
  if (filePath.endsWith('/src/index.ts') || filePath.endsWith('/src/index.tsx')) score += 4;
  if (filePath.includes('/tests/') || filePath.includes('.spec.')) score -= 30;
  if (filePath.endsWith('.md') || filePath.endsWith('.mdx')) score -= 20;
  if (filePath === 'README.md' || filePath === 'AGENTS.md' || filePath === 'CLAUDE.md') score -= 24;
  return score;
}

function formatResult(result: QueryResult, budget: number) {
  const snippetLines = result.snippets.map(
    (snippet) =>
      `- ${snippet.path}:${snippet.startLine}-${snippet.endLine}\n\n\`\`\`\n${snippet.text}\n\`\`\``
  );
  const edgeLines = result.edges.map(
    (edge) => `- ${edge.source} ${edge.relation} ${edge.target} (${edge.path})`
  );
  const fileLines = result.files.map((file) => `- ${file.path} (${file.score})`);

  const text = [
    '# Query Result',
    '',
    `Question: ${result.question}`,
    '',
    result.summary,
    '',
    '## Files',
    ...fileLines,
    '',
    '## Snippets',
    ...snippetLines,
    '',
    '## Related Edges',
    ...edgeLines,
  ].join('\n');

  const words = text.split(/\s+/);
  if (words.length <= budget) return text;
  return `${words.slice(0, budget).join(' ')}\n\n[truncated to budget]`;
}

export function queryGraph(graph: DevgraphGraph, question: string, options: QueryOptions = {}) {
  const budget = options.budget ?? 500;
  const tokens = tokenize(question);

  const fileScores = new Map<string, QueryMatch>();
  for (const node of graph.nodes.filter((entry) => entry.kind === 'file')) {
    const score =
      scoreText(`${node.path} ${node.summary ?? ''}`, tokens) + scorePathBias(node.path);
    if (!score) continue;
    fileScores.set(node.path, {
      path: node.path,
      score,
      summary: node.summary,
    });
  }

  for (const node of graph.nodes.filter((entry) => entry.kind === 'symbol')) {
    const score =
      scoreText(`${node.label} ${node.path} ${node.summary ?? ''}`, tokens) +
      scorePathBias(node.path);
    if (!score) continue;
    const current = fileScores.get(node.path);
    const nextScore = (current?.score ?? 0) + score + 2;
    fileScores.set(node.path, {
      path: node.path,
      score: nextScore,
      summary: current?.summary ?? node.summary,
    });
  }

  const scoredChunks = graph.chunks
    .map((chunk) => ({
      ...chunk,
      score: scoreText(`${chunk.path}\n${chunk.text}`, tokens) + scorePathBias(chunk.path),
    }))
    .filter((chunk) => chunk.score > 0);

  for (const chunk of scoredChunks) {
    const current = fileScores.get(chunk.path);
    fileScores.set(chunk.path, {
      path: chunk.path,
      score: (current?.score ?? 0) + chunk.score,
      summary: current?.summary,
    });
  }

  const snippets = scoredChunks
    .sort((left, right) => right.score - left.score || left.path.localeCompare(right.path))
    .slice(0, 5)
    .map((chunk) => ({
      path: chunk.path,
      startLine: chunk.startLine,
      endLine: chunk.endLine,
      text: clampText(chunk.text, 1200),
      score: chunk.score,
    }));

  const rankedFiles = Array.from(fileScores.values())
    .sort((left, right) => right.score - left.score || left.path.localeCompare(right.path))
    .slice(0, 6);

  const pathSet = new Set(rankedFiles.map((file) => file.path));
  const edges = graph.edges
    .filter((edge) => {
      const sourceFile = edge.source.replace(/^file:/, '');
      const targetFile = edge.target.replace(/^file:/, '');
      return pathSet.has(sourceFile) || pathSet.has(targetFile) || pathSet.has(edge.path);
    })
    .slice(0, 10)
    .map((edge) => ({
      source: edge.source,
      target: edge.target,
      relation: edge.relation,
      path: edge.path,
    })) satisfies QueryEdge[];

  const result = {
    question,
    summary:
      rankedFiles.length > 0
        ? `Matched ${rankedFiles.length} file(s), ${snippets.length} snippet(s), and ${edges.length} related edge(s).`
        : 'No strong matches found in the local graph.',
    files: rankedFiles,
    snippets,
    edges,
  } satisfies QueryResult;

  return {
    result,
    text: formatResult(result, budget),
  };
}
