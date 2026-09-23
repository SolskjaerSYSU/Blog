import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';

const migrated = JSON.parse(await readFile('tools/migrated-posts.json', 'utf8'));
const noteCovers = {
  'cpp/cpp-advanced': 'cpp-advanced.svg',
  'cpp/cpp-basics': 'cpp-basics.svg',
  'cpp/cpp-learning-journey': 'cpp-journey.svg',
  'cpp/stl': 'stl.svg',
  'data-structure/linear-list': 'linear-list.svg',
  'data-structure/queue': 'queue.svg',
  'data-structure/stack': 'stack.svg',
  'data-structure/tree': 'tree.svg'
};
for (const post of migrated.filter(p => !p.draft)) {
  const html = await readFile(`dist/posts/${post.slug}/index.html`, 'utf8');
  assert(html.includes('id="article-container"'), `Missing article: ${post.slug}`);
  assert(!html.includes('/_astro/'), 'Stale Astro output');
  const cover = noteCovers[post.slug];
  assert(cover && html.includes(`/Blog/images/notes/${cover}`), `Wrong note cover: ${post.slug}`);
  await access(`dist/images/notes/${cover}`);
}
for (const route of ['index.html','archives/index.html','archive/index.html','tags/index.html','categories/index.html','about/index.html','essays/index.html','artworks/index.html','404.html','rss.xml','search.xml','sitemap.xml']) await access(`dist/${route}`);
const media = JSON.parse(await readFile('source/_data/media.json', 'utf8'));
for (const kind of ['painting','photography']) {
  const expected = media.filter(p => kind === 'painting' ? /^draw\d+$/.test(p.id) : /^(\d+|DSC_1724)$/.test(p.id));
  const html = await readFile(`dist/artworks/${kind}/index.html`, 'utf8');
  for (const photo of expected) assert(html.includes(`/Blog/media/${photo.id}-preview.webp`), `Missing ${photo.id}`);
  console.log(`${kind}: ${expected.length} works`);
}
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { await walk(file); continue; }
    if (!file.endsWith('.html')) continue;
    const html = await readFile(file, 'utf8');
    for (const match of html.matchAll(/(?:src|href)="(\/[^"#?]*)/g)) {
      const href = match[1];
      if (href.startsWith('//')) continue;
      assert(href.startsWith('/Blog/'), `${file}: path missing /Blog/: ${href}`);
      let target = decodeURIComponent(href.slice('/Blog/'.length));
      if (!target || target.endsWith('/')) target += 'index.html';
      await access(path.join('dist', target)).catch(() => { throw new Error(`${file}: broken local link ${href}`); });
    }
  }
}
await walk('dist');
console.log(`PASS: ${migrated.length} migrated notes, galleries, search, RSS, and local asset links.`);
