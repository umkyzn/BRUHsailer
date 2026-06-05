// Sync guide data into public/ so the Vite build serves the latest content.
//
// `data/` is the single source of truth (the update-site workflow writes the
// freshest guide JSON there). Vite only serves files under `public/`, so we
// copy the data in before every build. This keeps `public/data/` from drifting
// out of date relative to `data/` (which is exactly what stranded the deployed
// site on an old "Last updated" date).

import { mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'data');
const destDir = join(root, 'public', 'data');

const files = ['guide_data.json', 'guide_data_landlubber.json'];

mkdirSync(destDir, { recursive: true });

let copied = 0;
for (const file of files) {
  const src = join(srcDir, file);
  if (!existsSync(src)) {
    console.warn(`[copy-data] skip: data/${file} not found`);
    continue;
  }
  copyFileSync(src, join(destDir, file));
  copied++;
  console.log(`[copy-data] data/${file} -> public/data/${file}`);
}

if (copied === 0) {
  console.warn('[copy-data] no data files copied — is the data/ directory populated?');
}
