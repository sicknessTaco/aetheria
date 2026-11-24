import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const port = Number(process.env.PORT || 8080);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const path = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    const relative = path.slice(root.length + 1).split(sep).join('/');
    if (!path.startsWith(root + sep) || !(relative === 'index.html' || relative === 'styles.css' || relative === 'script.js' || relative.startsWith('assets/'))) {
      response.writeHead(404); response.end('No encontrado'); return;
    }
    const data = await readFile(path);
    const type = types[extname(path)];
    response.writeHead(200, { 'Content-Type': type || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    response.end(data);
  } catch {
    if (!response.headersSent) response.writeHead(404);
    response.end('No encontrado');
  }
}).listen(port, '127.0.0.1', () => console.log(`Local: http://localhost:${port}`));
