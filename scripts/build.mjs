import { cp, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
await mkdir(dist, { recursive: true });
for (const path of ['index.html', 'styles.css', 'script.js', 'assets']) {
  await cp(resolve(root, path), resolve(dist, path), { recursive: true });
}
console.log('Sitio listo en dist/');
