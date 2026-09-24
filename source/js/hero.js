(() => {
  'use strict';

  const header = document.querySelector('#page-header');
  const hero = header?.classList.contains('full_page') ? header : null;
  const root = document.querySelector('.nav-site-title')?.getAttribute('href') || '/Blog/';

  if (!hero) return;

  const info = hero.querySelector('#site-info');
  if (info) {
    const kicker = document.createElement('p');
    kicker.className = 'hero-kicker';
    kicker.textContent = 'FIELD NOTES  /  SOLSKJAERSYSU';
    info.prepend(kicker);

    const introduction = document.createElement('p');
    introduction.className = 'hero-introduction';
    introduction.textContent = '在代码与日常之间，记录持续生长的想法。';
    info.append(introduction);

    const links = document.createElement('div');
    links.className = 'hero-links';
    links.setAttribute('aria-label', '快速浏览');
    for (const item of [
      { label: '编程笔记', path: 'categories/cpp/', number: '01' },
      { label: '视觉作品', path: 'artworks/', number: '02' },
      { label: '随笔片段', path: 'essays/', number: '03' },
    ]) {
      const link = document.createElement('a');
      link.href = `${root}${item.path}`;
      link.innerHTML = `<span>${item.number}</span>${item.label}<i aria-hidden="true">↗</i>`;
      links.append(link);
    }
    info.append(links);
  }

  const scrollCue = hero.querySelector('#scroll-down');
  if (scrollCue) {
    const label = document.createElement('span');
    label.className = 'scroll-label';
    label.textContent = 'SCROLL TO EXPLORE';
    scrollCue.prepend(label);
  }

  const recent = document.querySelector('#recent-posts');
  if (recent) {
    const heading = document.createElement('header');
    heading.className = 'feed-heading';
    const overline = document.createElement('p');
    const count = recent.querySelectorAll('.recent-post-item').length;
    overline.innerHTML = `THE NOTEBOOK <span>— 01 / ${String(count).padStart(2, '0')}</span>`;
    const title = document.createElement('h2');
    title.textContent = '最近在整理的事';
    const archive = document.createElement('a');
    archive.href = `${root}archives/`;
    archive.textContent = '全部文章 ↗';
    heading.append(overline, title, archive);
    recent.prepend(heading);
  }
})();
