// Remove RSC payload .txt files to force full page navigation.
// Next.js `<Link>` fetches these for client-side routing, but with
// static export they can cause blank pages during soft navigation.
import { readdirSync, rmSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'out';
let n = 0;

function walk(dir) {
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (f.endsWith('.txt') && existsSync(p.replace(/\.txt$/, '.html'))) {
      rmSync(p);
      n++;
    }
  }
}

walk(OUT);
console.log(`Removed ${n} RSC payload files`);
