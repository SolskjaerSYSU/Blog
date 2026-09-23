(() => {
  'use strict';

  const hero = document.querySelector('#page-header.full_page');
  const scene = document.createElement('canvas');
  const sparks = document.createElement('canvas');
  const cursor = document.createElement('div');
  scene.id = 'scene';
  sparks.id = 'sparkles';
  cursor.id = 'cursor-orbit';
  scene.setAttribute('aria-hidden', 'true');
  sparks.setAttribute('aria-hidden', 'true');
  cursor.setAttribute('aria-hidden', 'true');
  if (hero) hero.prepend(scene);
  document.body.append(sparks, cursor);

  if (hero) {
    const info = hero.querySelector('#site-info');
    const root = document.querySelector('.nav-site-title')?.getAttribute('href') || '/';
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
  }

  const ctx = scene.getContext('2d');
  const fx = sparks.getContext('2d');
  if (!ctx || !fx) return;

  const button = document.createElement('button');
  button.id = 'motion-toggle';
  button.type = 'button';
  button.title = '切换背景连线与点击微粒效果';
  document.body.append(button);

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const colors = ['#76a8c7', '#cf9eb8', '#84bcb1', '#9ca8d2'];
  const particles = [];
  let points = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let frame = 0;
  let last = 0;
  let enabled = true;
  let pointerInside = false;
  let pointer = { x: -1000, y: -1000 };
  let cursorTarget = { x: -100, y: -100 };
  let cursorPosition = { x: -100, y: -100 };

  try {
    enabled = localStorage.getItem('blog-motion') !== 'off';
  } catch {}

  function resize() {
    const bounds = hero?.getBoundingClientRect();
    width = bounds?.width || innerWidth;
    height = bounds?.height || innerHeight;
    dpr = Math.min(devicePixelRatio || 1, 1.35);
    scene.width = Math.round(width * dpr);
    scene.height = Math.round(height * dpr);
    scene.style.width = `${width}px`;
    scene.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sparks.width = Math.round(innerWidth * dpr);
    sparks.height = Math.round(innerHeight * dpr);
    fx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = innerWidth < 700 ? 22 : 42;
    points = Array.from({ length: count }, (_, index) => ({
      x: ((index * 0.61803398875) % 1) * width,
      y: ((index * 0.38196601125 + 0.12) % 1) * height,
      phase: index * 1.71,
      speed: 0.0008 + (index % 5) * 0.00023,
    }));
    sync();
  }

  function draw(time) {
    frame = 0;
    if (!enabled || reduce.matches || document.hidden) return;
    const bounds = hero?.getBoundingClientRect();
    if (hero && (bounds.bottom < -20 || bounds.top > innerHeight + 20)) return;

    const dt = Math.min(time - last || 16, 40);
    last = time;
    ctx.clearRect(0, 0, width, height);
    fx.clearRect(0, 0, innerWidth, innerHeight);

    const positions = points.map(point => {
      point.y += point.speed * dt;
      if (point.y > height + 12) point.y = -12;
      const wave = Math.sin(time * 0.00015 + point.phase) * 13;
      let x = point.x + Math.cos(time * 0.00012 + point.phase) * 20;
      let y = point.y + wave;
      if (pointerInside && hero) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 145 && distance > 0) {
          const force = (145 - distance) / 145 * 11;
          x += dx / distance * force;
          y += dy / distance * force;
        }
      }
      return { x, y };
    });

    ctx.lineWidth = 0.8;
    positions.forEach((point, index) => {
      for (let next = index + 1; next < positions.length; next++) {
        const other = positions[next];
        const distance = Math.hypot(point.x - other.x, point.y - other.y);
        if (distance < 150) {
          ctx.strokeStyle = `rgba(105, 142, 171, ${(1 - distance / 150) * 0.19})`;
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
      ctx.fillStyle = 'rgba(91, 132, 163, .44)';
      ctx.beginPath();
      ctx.arc(point.x, point.y, index % 6 === 0 ? 2 : 1.25, 0, Math.PI * 2);
      ctx.fill();
      if (pointerInside && hero && Math.hypot(point.x - pointer.x, point.y - pointer.y) < 175) {
        ctx.strokeStyle = 'rgba(104, 154, 184, .24)';
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.stroke();
      }
    });

    for (let index = particles.length - 1; index >= 0; index--) {
      const particle = particles[index];
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 0.00012 * dt;
      if (particle.life <= 0) {
        particles.splice(index, 1);
        continue;
      }
      fx.globalAlpha = particle.life / particle.total;
      fx.fillStyle = particle.color;
      fx.beginPath();
      fx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      fx.fill();
    }
    fx.globalAlpha = 1;

    cursorPosition.x += (cursorTarget.x - cursorPosition.x) * 0.16;
    cursorPosition.y += (cursorTarget.y - cursorPosition.y) * 0.16;
    cursor.style.transform = `translate3d(${cursorPosition.x}px, ${cursorPosition.y}px, 0)`;
    frame = requestAnimationFrame(draw);
  }

  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    const motionAllowed = enabled && !reduce.matches;
    button.disabled = reduce.matches;
    button.textContent = reduce.matches ? '静态模式' : motionAllowed ? '✧ 动效开' : '✧ 动效关';
    button.setAttribute('aria-pressed', String(motionAllowed));
    scene.hidden = !hero || !motionAllowed;
    sparks.hidden = !motionAllowed;
    cursor.hidden = !motionAllowed || !finePointer.matches;
    if (motionAllowed && !document.hidden) frame = requestAnimationFrame(draw);
    else {
      particles.length = 0;
      ctx.clearRect(0, 0, width, height);
      fx.clearRect(0, 0, innerWidth, innerHeight);
    }
  }

  button.addEventListener('click', () => {
    enabled = !enabled;
    try {
      localStorage.setItem('blog-motion', enabled ? 'on' : 'off');
    } catch {}
    sync();
  });

  document.addEventListener('pointermove', event => {
    cursorTarget = { x: event.clientX - 16, y: event.clientY - 16 };
    cursor.hidden = !enabled || reduce.matches || !finePointer.matches;
    cursor.classList.toggle('is-interactive', Boolean(event.target.closest('a, button, input, [role="button"]')));
    if (!hero) return;
    const bounds = hero.getBoundingClientRect();
    pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    pointerInside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= width && pointer.y <= height;
  }, { passive: true });

  document.addEventListener('pointerleave', () => {
    pointerInside = false;
    cursor.hidden = true;
  });

  document.addEventListener('click', event => {
    if (!enabled || reduce.matches || !event.detail || event.target.closest('#motion-toggle')) return;
    const count = innerWidth < 700 ? 10 : 16;
    for (let index = 0; index < count && particles.length < 120; index++) {
      const angle = Math.PI * 2 * index / count;
      const speed = 0.045 + Math.random() * 0.075;
      const life = 450 + Math.random() * 300;
      particles.push({
        x: event.clientX,
        y: event.clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        total: life,
        color: colors[index % colors.length],
        radius: 1 + Math.random() * 1.6,
      });
    }
  });

  window.addEventListener('resize', resize);
  window.addEventListener('scroll', () => {
    if (!frame && enabled && !reduce.matches && !document.hidden) frame = requestAnimationFrame(draw);
  }, { passive: true });
  window.addEventListener('pageshow', sync);
  document.addEventListener('visibilitychange', sync);
  reduce.addEventListener('change', sync);
  finePointer.addEventListener('change', sync);
  resize();
})();
