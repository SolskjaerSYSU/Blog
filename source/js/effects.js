(() => {
  'use strict';

  const hero = document.querySelector('#page-header.full_page');
  const scene = document.createElement('canvas');
  const ambient = document.createElement('canvas');
  const sparks = document.createElement('canvas');
  const cursor = document.createElement('div');
  scene.id = 'scene';
  ambient.id = 'ambient-scene';
  sparks.id = 'sparkles';
  cursor.id = 'cursor-orbit';
  scene.setAttribute('aria-hidden', 'true');
  ambient.setAttribute('aria-hidden', 'true');
  sparks.setAttribute('aria-hidden', 'true');
  cursor.setAttribute('aria-hidden', 'true');
  if (hero) hero.prepend(scene);
  document.body.append(ambient, sparks, cursor);

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
  const background = ambient.getContext('2d');
  const fx = sparks.getContext('2d');
  if (!ctx || !background || !fx) return;

  const button = document.createElement('button');
  button.id = 'motion-toggle';
  button.type = 'button';
  button.title = '切换几何背景与光标动效';
  document.body.append(button);

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const colors = ['#76a8c7', '#cf9eb8', '#84bcb1', '#9ca8d2'];
  const particles = [];
  const trail = [];
  let points = [];
  let columns = 0;
  let rows = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let frame = 0;
  let last = 0;
  let preference = null;
  let motionAllowed = false;
  let pointerInside = false;
  let hasPointer = false;
  let pointer = { x: -1000, y: -1000 };
  let ambientPointer = { x: -1000, y: -1000 };
  let cursorTarget = { x: -100, y: -100 };
  let cursorPosition = { x: -100, y: -100 };

  try {
    preference = localStorage.getItem('blog-motion');
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
    ambient.width = Math.round(innerWidth * dpr);
    ambient.height = Math.round(innerHeight * dpr);
    background.setTransform(dpr, 0, 0, dpr, 0, 0);
    sparks.width = Math.round(innerWidth * dpr);
    sparks.height = Math.round(innerHeight * dpr);
    fx.setTransform(dpr, 0, 0, dpr, 0, 0);

    columns = Math.max(8, Math.ceil(width / 210) + 1);
    rows = Math.max(6, Math.ceil(height / 180) + 1);
    points = Array.from({ length: columns * rows }, (_, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      return {
        x: column * width / (columns - 1),
        y: row * height / (rows - 1),
        phase: index * 2.39996,
      };
    });
    sync();
  }

  function drawGeometry(time, target, isAmbient = false) {
    const dark = document.documentElement.dataset.theme === 'dark';
    const activePointer = isAmbient ? ambientPointer : pointer;
    const pointerActive = isAmbient ? hasPointer : pointerInside;
    const positions = points.map(point => {
      const driftX = Math.sin(time * 0.0004 + point.phase) * 29 + Math.cos(time * 0.00023 + point.phase * 0.8) * 15;
      const driftY = Math.cos(time * 0.00034 + point.phase) * 26 + Math.sin(time * 0.00021 + point.phase * 1.2) * 12;
      let x = point.x + driftX;
      let y = point.y + driftY;
      if (pointerActive) {
        const dx = x - activePointer.x;
        const dy = y - activePointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 245 && distance > 0) {
          const force = Math.pow(1 - distance / 245, 2) * 70;
          x += dx / distance * force;
          y += dy / distance * force;
        }
      }
      return { x, y };
    });

    for (let row = 0; row < rows - 1; row++) {
      for (let column = 0; column < columns - 1; column++) {
        const index = row * columns + column;
        const corners = [positions[index], positions[index + 1], positions[index + columns], positions[index + columns + 1]];
        const triangles = (row + column) % 2
          ? [[corners[0], corners[1], corners[2]], [corners[1], corners[3], corners[2]]]
          : [[corners[0], corners[1], corners[3]], [corners[0], corners[3], corners[2]]];
        triangles.forEach((triangle, part) => {
          const accent = (row * 7 + column * 3 + part) % 9 === 0;
          target.beginPath();
          target.moveTo(triangle[0].x, triangle[0].y);
          target.lineTo(triangle[1].x, triangle[1].y);
          target.lineTo(triangle[2].x, triangle[2].y);
          target.closePath();
          target.fillStyle = dark
            ? accent ? 'rgba(149, 132, 184, .19)' : 'rgba(112, 157, 190, .075)'
            : accent ? 'rgba(220, 156, 190, .19)' : 'rgba(104, 167, 200, .095)';
          target.fill();
          target.strokeStyle = dark ? 'rgba(167, 197, 217, .24)' : 'rgba(82, 140, 173, .28)';
          target.lineWidth = 0.7;
          target.stroke();
        });
      }
    }

    target.fillStyle = dark ? 'rgba(196, 223, 235, .75)' : 'rgba(64, 128, 164, .68)';
    positions.forEach((point, index) => {
      if (index % 3 !== 0) return;
      target.beginPath();
      target.arc(point.x, point.y, index % 12 === 0 ? 2.1 : 1.35, 0, Math.PI * 2);
      target.fill();
    });

    if (pointerActive && !isAmbient) {
      const glow = target.createRadialGradient(activePointer.x, activePointer.y, 4, activePointer.x, activePointer.y, 235);
      glow.addColorStop(0, dark ? 'rgba(147, 198, 225, .2)' : 'rgba(82, 165, 206, .2)');
      glow.addColorStop(1, 'rgba(82, 165, 206, 0)');
      target.fillStyle = glow;
      target.fillRect(activePointer.x - 235, activePointer.y - 235, 470, 470);
    }
  }

  function draw(time) {
    frame = 0;
    if (!motionAllowed || document.hidden) return;
    const bounds = hero?.getBoundingClientRect();
    const dt = Math.min(time - last || 16, 40);
    last = time;
    fx.clearRect(0, 0, innerWidth, innerHeight);
    if (hero && bounds.bottom > 0 && bounds.top < innerHeight) {
      ambient.hidden = true;
      ctx.clearRect(0, 0, width, height);
      drawGeometry(time, ctx);
    } else {
      ambient.hidden = false;
      background.clearRect(0, 0, innerWidth, innerHeight);
      drawGeometry(time, background, true);
    }

    for (let index = trail.length - 1; index >= 0; index--) {
      trail[index].life -= dt / 340;
      if (trail[index].life <= 0) trail.splice(index, 1);
    }
    fx.lineCap = 'round';
    for (let index = 1; index < trail.length; index++) {
      const previous = trail[index - 1];
      const current = trail[index];
      fx.strokeStyle = `rgba(72, 157, 190, ${current.life * .55})`;
      fx.lineWidth = 1 + current.life * 2.2;
      fx.beginPath();
      fx.moveTo(previous.x, previous.y);
      fx.lineTo(current.x, current.y);
      fx.stroke();
    }

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
    motionAllowed = preference === 'on' || (preference !== 'off' && !reduce.matches);
    document.documentElement.dataset.motion = motionAllowed ? 'on' : 'off';
    button.textContent = motionAllowed ? '✧ 关闭动效' : '✧ 开启动效';
    button.setAttribute('aria-pressed', String(motionAllowed));
    scene.hidden = !hero || !motionAllowed;
    ambient.hidden = !motionAllowed;
    sparks.hidden = !motionAllowed;
    cursor.hidden = !motionAllowed || !finePointer.matches;
    if (motionAllowed && !document.hidden) frame = requestAnimationFrame(draw);
    else {
      particles.length = 0;
      trail.length = 0;
      ctx.clearRect(0, 0, width, height);
      background.clearRect(0, 0, innerWidth, innerHeight);
      fx.clearRect(0, 0, innerWidth, innerHeight);
    }
  }

  button.addEventListener('click', () => {
    preference = motionAllowed ? 'off' : 'on';
    try {
      localStorage.setItem('blog-motion', preference);
    } catch {}
    sync();
  });

  document.addEventListener('pointermove', event => {
    cursorTarget = { x: event.clientX - 16, y: event.clientY - 16 };
    ambientPointer = { x: event.clientX, y: event.clientY };
    if (!hasPointer) {
      cursorPosition = { ...cursorTarget };
      hasPointer = true;
    }
    cursor.hidden = !motionAllowed || !finePointer.matches;
    cursor.classList.toggle('is-interactive', Boolean(event.target.closest('a, button, input, [role="button"]')));
    if (motionAllowed && finePointer.matches && event.pointerType !== 'touch') {
      const previous = trail.at(-1);
      if (!previous || Math.hypot(previous.x - event.clientX, previous.y - event.clientY) > 7) {
        trail.push({ x: event.clientX, y: event.clientY, life: 1 });
        if (trail.length > 22) trail.shift();
      }
    }
    if (!hero) return;
    const bounds = hero.getBoundingClientRect();
    pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    pointerInside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= width && pointer.y <= height;
  }, { passive: true });

  document.addEventListener('pointerleave', () => {
    pointerInside = false;
    hasPointer = false;
    cursor.hidden = true;
    trail.length = 0;
  });

  document.addEventListener('click', event => {
    if (!motionAllowed || !event.detail || event.target.closest('#motion-toggle')) return;
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
    if (!frame && motionAllowed && !document.hidden) frame = requestAnimationFrame(draw);
  }, { passive: true });
  window.addEventListener('pageshow', sync);
  document.addEventListener('visibilitychange', sync);
  reduce.addEventListener('change', sync);
  finePointer.addEventListener('change', sync);
  resize();
})();
