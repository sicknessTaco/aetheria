import { build } from 'vite';
import { resolve } from 'node:path';
import { optimizeAssets } from './optimize-assets.mjs';

const root = resolve(import.meta.dirname, '..');
await optimizeAssets();
await build({ root, configFile: resolve(root, 'vite.config.mjs') });
