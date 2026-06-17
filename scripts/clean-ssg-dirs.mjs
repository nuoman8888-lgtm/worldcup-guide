// Clean up Next.js SSG metadata directories that cause Cloudflare Pages 404s.
//
// PROBLEM: Next.js output export creates BOTH:
//   out/match/m1.html         (the actual HTML page)
//   out/match/m1/             (next metadata dir, NO index.html)
//
// Cloudflare Pages prioritizes the directory, causing 404.
//
// FIX: For any directory, if a sibling .html file exists,
// the directory is just metadata and can be removed.

import { readdirSync, rmSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const OUT_DIR = 'out';
let removed = 0;

function cleanRecursive(dirPath, depth) {
  if (!existsSync(dirPath)) return;
  const entries = readdirSync(dirPath);

  for (const name of entries) {
    if (name.startsWith('_next') || name.startsWith('__next')) continue;

    const fullPath = join(dirPath, name);
    let st;
    try { st = statSync(fullPath); } catch { continue; }
    if (!st.isDirectory()) continue;

    // Check if this directory has an index.html
    const hasIndexHtml = existsSync(join(fullPath, 'index.html'));
    if (hasIndexHtml) {
      // Proper directory with index.html, keep it
      cleanRecursive(fullPath, depth + 1);
      continue;
    }

    // Check if there's a sibling .html file
    const parentDir = dirname(fullPath);
    const siblingHtml = join(parentDir, name + '.html');
    if (existsSync(siblingHtml)) {
      // Metadata dir, sibling .html exists
      console.log('  Removing:', fullPath);
      rmSync(fullPath, { recursive: true, force: true });
      removed++;
    } else {
      // Parent route dir (like out/match), recurse
      cleanRecursive(fullPath, depth + 1);
    }
  }
}

console.log('\nCleaning Next.js SSG metadata directories...\n');
cleanRecursive(OUT_DIR, 0);
console.log('\nRemoved ' + removed + ' metadata directories\n');
