import { readdir, mkdir, stat, writeFile, cp, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

await mkdir('source/media', { recursive: true });
await mkdir('source/_data', { recursive: true });
const manifest = [];
const ids = new Set();
// Serial optimization bounds memory use for large original photographs.
for (const name of (await readdir('assets/images')).sort((a,b) => a.localeCompare(b, 'en', { numeric: true }))) {
  if (!/\.(png|jpe?g|avif)$/i.test(name) || /^demo-/.test(name)) continue;
  const id = name.replace(/\.[^.]+$/, '');
  if (ids.has(id)) throw new Error(`Duplicate image basename: ${id}; rename one original to avoid overwriting it.`);
  ids.add(id);
  const input = `assets/images/${name}`;
  const output = `source/media/${id}.webp`;
  const preview = `source/media/${id}-preview.webp`;
  const sourceStat = await stat(input);
  const cached = await stat(output).catch(() => null);
  const previewStat = await stat(preview).catch(() => null);
  if (!cached || !previewStat || cached.mtimeMs < sourceStat.mtimeMs || previewStat.mtimeMs < sourceStat.mtimeMs) {
    await sharp(input).rotate().resize({ width: 2200, withoutEnlargement: true }).webp({ quality: 85 }).toFile(output);
    await sharp(input).rotate().resize({ width: 850, withoutEnlargement: true }).webp({ quality: 80 }).toFile(preview);
  }
  const meta = await sharp(preview).metadata();
  manifest.push({ id, original: name, width: meta.width, height: meta.height });
}
// Remove only generated WebP files whose original was removed, never original artwork.
const mediaRoot = path.resolve('source/media');
const outputs = new Set(manifest.flatMap(image => [`${image.id}.webp`, `${image.id}-preview.webp`]));
for (const name of await readdir(mediaRoot)) {
  if (!name.endsWith('.webp') || outputs.has(name)) continue;
  const target = path.resolve(mediaRoot, name);
  if (path.dirname(target) !== mediaRoot) throw new Error('Unsafe generated media path');
  await unlink(target);
}
await writeFile('source/_data/media.json', JSON.stringify(manifest, null, 2));
for (const [pkg, files] of Object.entries({
  '@fortawesome/fontawesome-free': ['css', 'webfonts', 'LICENSE.txt'],
  'medium-zoom': ['dist/medium-zoom.min.js', 'LICENSE'],
  'typed.js': ['dist/typed.umd.js', 'LICENSE.txt'],
})) {
  for (const file of files) {
    const target = `source/vendor/${pkg}/${file}`;
    await mkdir(path.dirname(target), { recursive: true });
    await cp(`node_modules/${pkg}/${file}`, target, { recursive: true });
  }
}
console.log(`Prepared ${manifest.length} images and local vendor assets.`);
