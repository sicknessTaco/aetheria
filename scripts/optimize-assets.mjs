import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'assets/phantom-violet.jpeg');
const output = resolve(root, 'assets/optimized');

export async function optimizeAssets() {
  await mkdir(output, { recursive: true });
  const original = await stat(input);
  const results = await Promise.all([480, 800, 1120].map(async width => {
    const path = resolve(output, `phantom-${width}.webp`);
    const existing = await stat(path).catch(() => null);
    if (existing && existing.mtimeMs >= original.mtimeMs) return { width, bytes: existing.size };
    const image = await sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 84, effort: 6, smartSubsample: true })
      .toFile(path);
    return { width, bytes: image.size };
  }));
  console.log('Imágenes WebP:', results.map(({width,bytes}) => `${width}px ${(bytes / 1024).toFixed(1)} kB`).join(' · '));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await optimizeAssets();
}
