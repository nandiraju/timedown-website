// Compiles each page's Tailwind source and stamps a content hash onto that page's
// <link rel="stylesheet"> (…/assets/css/<page>.css?v=<hash>) so browsers and the
// GitHub Pages CDN never serve a stale stylesheet after a change.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const PAGES = ['index', 'contact', 'privacy_policy', 'terms_of_service', '404'];

for (const page of PAGES) {
  const out = `assets/css/${page}.css`;
  execFileSync('npx', ['tailwindcss', '-i', `src/css/${page}.css`, '-o', out, '--minify'], { stdio: 'inherit' });
  const hash = createHash('sha256').update(readFileSync(out)).digest('hex').slice(0, 10);
  const htmlFile = `${page}.html`;
  const html = readFileSync(htmlFile, 'utf8');
  const re = new RegExp(`(href="/?assets/css/${page}\\.css)(\\?v=[0-9a-f]+)?"`);
  if (!re.test(html)) throw new Error(`${htmlFile}: stylesheet link for ${out} not found`);
  const next = html.replace(re, `$1?v=${hash}"`);
  if (next !== html) writeFileSync(htmlFile, next);
  console.log(`${out}  v=${hash}`);
}
