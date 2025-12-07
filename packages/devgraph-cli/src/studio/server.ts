import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static files are bundled at dist/studio-web/ relative to CLI package
const STUDIO_DIR = path.resolve(__dirname, '../studio-web');

interface StudioServerOptions {
  port: number;
  graphPath: string;
}

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
};

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

async function serveStaticFile(
  res: ServerResponse,
  filePath: string
): Promise<boolean> {
  try {
    const stats = await stat(filePath);
    if (stats.isFile()) {
      const content = await readFile(filePath);
      res.setHeader('Content-Type', getMimeType(filePath));
      res.writeHead(200);
      res.end(content);
      return true;
    }
  } catch {
    // File doesn't exist
  }
  return false;
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

  // Check if studio assets exist
  let hasStudioAssets = false;
  try {
    await stat(path.join(STUDIO_DIR, 'index.html'));
    hasStudioAssets = true;
  } catch {
    // Studio assets not bundled
  }

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url || '/';
    const urlPath = url.split('?')[0]; // Remove query string

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
    if (urlPath === '/api/graph') {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(graphData);
      return;
    }

    // If studio assets are bundled, serve them
    if (hasStudioAssets) {
      // Try exact path
      let filePath = path.join(STUDIO_DIR, urlPath);

      // Handle trailing slash - look for index.html
      if (urlPath.endsWith('/')) {
        filePath = path.join(STUDIO_DIR, urlPath, 'index.html');
      }

      if (await serveStaticFile(res, filePath)) {
        return;
      }

      // Try with .html extension
      if (await serveStaticFile(res, `${filePath}.html`)) {
        return;
      }

      // Try index.html in directory
      if (await serveStaticFile(res, path.join(filePath, 'index.html'))) {
        return;
      }

      // Fallback to index.html for client-side routing
      if (!urlPath.startsWith('/_next') && !urlPath.startsWith('/api')) {
        const indexPath = path.join(STUDIO_DIR, 'index.html');
        if (await serveStaticFile(res, indexPath)) {
          return;
        }
      }
    }

    // Fallback: show instructions if no studio assets
    if (urlPath === '/' && !hasStudioAssets) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(getFallbackPage(port));
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

function getFallbackPage(port: number): string {
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
    h1 { font-size: 2rem; margin-bottom: 1rem; }
    p { color: #888; margin-bottom: 1.5rem; }
    .api-url {
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      background: #111;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      display: inline-block;
      margin-bottom: 1.5rem;
      border: 1px solid #333;
    }
    .warning {
      background: #1a1a00;
      border: 1px solid #444400;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-top: 1rem;
      color: #ffcc00;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>DevGraph Studio</h1>
    <p>Your graph.json is being served at:</p>
    <div class="api-url">http://localhost:${port}/api/graph</div>
    <div class="warning">
      Studio assets not found. This is a development build.<br>
      Run the full build to embed the Studio UI.
    </div>
  </div>
</body>
</html>`;
}
