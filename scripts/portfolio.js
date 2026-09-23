const fs = require('node:fs');
const path = require('node:path');

hexo.extend.tag.register('portfolio', args => {
  const images = JSON.parse(fs.readFileSync(path.join(hexo.source_dir, '_data/media.json'), 'utf8'));
  const painting = args[0] === 'painting';
  const selected = images.filter(image => painting ? /^draw\d+$/.test(image.id) : /^(\d+|DSC_1724)$/.test(image.id));
  selected.sort((a,b) => a.id === 'DSC_1724' ? -1 : b.id === 'DSC_1724' ? 1 : a.id.localeCompare(b.id, 'en', { numeric: true }));
  const root = hexo.config.root;
  return `<div class="portfolio-wall" data-gallery="${painting ? 'painting' : 'photography'}">${selected.map(image =>
    `<figure><button type="button" class="gallery-open" aria-label="放大${painting ? '绘画作品' : '摄影作品'} ${image.id}"><img src="${root}media/${image.id}-preview.webp" data-zoom-src="${root}media/${image.id}.webp" alt="${painting ? '绘画作品' : '摄影作品'} ${image.id}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async"></button></figure>`
  ).join('')}</div>`;
});

// Retain the previous archive URL without an extra deployment redirect service.
hexo.extend.generator.register('legacy-archive', () => ({
  path: 'archive/index.html',
  data: `<html lang="zh-CN"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${hexo.config.root}archives/"><link rel="canonical" href="${hexo.config.url}/archives/"></head><body><a href="${hexo.config.root}archives/">归档</a></body></html>`
}));
