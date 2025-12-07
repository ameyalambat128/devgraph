import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

interface StudioServerOptions {
  port: number;
  graphPath: string;
}

export async function startStudioServer(options: StudioServerOptions): Promise<void> {
  const { port, graphPath } = options;

  let graphData: string | null = null;

  try {
    graphData = await readFile(graphPath, 'utf8');
    // Validate JSON
    JSON.parse(graphData);
  } catch (error) {
    throw new Error(`Failed to read graph.json at ${graphPath}: ${(error as Error).message}`);
  }

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url || '/';

    // CORS headers for local development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // API endpoint: serve graph.json
    if (url === '/api/graph') {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(graphData);
      return;
    }

    // Redirect to external studio app
    if (url === '/' || url === '/studio') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(getRedirectPage(port));
      return;
    }

    // 404 for other routes
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });

  return new Promise((resolve, reject) => {
    server.on('error', (err) => {
      if ((err as NodeJS.ErrnoException).code === 'EADDRINUSE') {
        reject(new Error(`Port ${port} is already in use`));
      } else {
        reject(err);
      }
    });

    server.listen(port, () => {
      resolve();
    });
  });
}

function getRedirectPage(port: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevGraph Studio</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #050505;
      color: #ededed;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    p {
      color: #888;
      margin-bottom: 1.5rem;
    }
    .api-url {
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      background: #111;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      display: inline-block;
      margin-bottom: 1.5rem;
      border: 1px solid #333;
    }
    .instructions {
      text-align: left;
      max-width: 600px;
      margin: 0 auto;
      background: #0a0a0a;
      padding: 1.5rem;
      border-radius: 0.5rem;
      border: 1px solid #222;
    }
    .instructions h2 {
      font-size: 1rem;
      margin-bottom: 1rem;
      color: #fff;
    }
    .instructions ol {
      padding-left: 1.5rem;
      color: #888;
    }
    .instructions li {
      margin-bottom: 0.5rem;
    }
    .instructions code {
      background: #111;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-size: 0.9em;
    }
    a {
      color: #fff;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>DevGraph Studio</h1>
    <p>Your graph.json is being served at:</p>
    <div class="api-url">http://localhost:${port}/api/graph</div>

    <div class="instructions">
      <h2>How to use:</h2>
      <ol>
        <li>Open <a href="https://devgraph.ameyalambat.com/studio" target="_blank">DevGraph Studio</a></li>
        <li>Paste your graph.json or fetch from the API above</li>
        <li>Explore, edit, and export your codebase graph</li>
      </ol>
    </div>
  </div>
</body>
</html>`;
}
