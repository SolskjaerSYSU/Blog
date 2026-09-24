(() => {
  'use strict';

  const header = document.querySelector('#page-header');
  const hero = header?.classList.contains('full_page') ? header : null;
  const root = document.querySelector('.nav-site-title')?.getAttribute('href') || '/Blog/';

  if (hero) {
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
  }

  const ambient = document.createElement('canvas');
  const headerScene = document.createElement('canvas');
  const sparkCanvas = document.createElement('canvas');
  const cursor = document.createElement('div');
  const button = document.createElement('button');
  ambient.id = 'ambient-scene';
  headerScene.id = 'scene';
  sparkCanvas.id = 'sparkles';
  cursor.id = 'cursor-orbit';
  button.id = 'motion-toggle';
  button.type = 'button';
  button.title = '切换全站背景与光标动效';
  for (const element of [ambient, headerScene, sparkCanvas, cursor]) element.setAttribute('aria-hidden', 'true');
  if (header) header.prepend(headerScene);
  document.body.append(ambient, sparkCanvas, cursor, button);

  const ambientContext = ambient.getContext('2d');
  const headerContext = headerScene.getContext('2d');
  const sparkContext = sparkCanvas.getContext('2d');
  if (!ambientContext || !headerContext || !sparkContext) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const accents = ['111, 165, 194', '220, 143, 171', '125, 186, 171'];
  const sparks = [];
  let nodes = [];
  let viewportWidth = 0;
  let viewportHeight = 0;
  let headerWidth = 0;
  let headerHeight = 0;
  let pixelRatio = 1;
  let frame = 0;
  let lastFrame = 0;
  let preference = null;
  let motionAllowed = false;
  let pointer = { x: -1000, y: -1000, inside: false };
  let cursorPosition = { x: -1000, y: -1000 };
  let lastSpark = { x: -1000, y: -1000 };

  try {
    preference = localStorage.getItem('blog-motion');
  } catch {}

  function sizeCanvas(canvas, context, width, height) {
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function resize() {
    viewportWidth = innerWidth;
    viewportHeight = innerHeight;
    pixelRatio = Math.min(devicePixelRatio || 1, 1.5);
    const bounds = header?.getBoundingClientRect();
    headerWidth = bounds?.width || viewportWidth;
    headerHeight = bounds?.height || viewportHeight;
    sizeCanvas(ambient, ambientContext, viewportWidth, viewportHeight);
    sizeCanvas(headerScene, headerContext, headerWidth, headerHeight);
    sizeCanvas(sparkCanvas, sparkContext, viewportWidth, viewportHeight);

    const count = viewportWidth < 700 ? 14 : 27;
    nodes = Array.from({ length: count }, (_, index) => ({
      x: (index * 0.61803398875 + 0.12) % 1,
      y: (index * 0.41421356237 + 0.08) % 1,
      phase: index * 2.17,
    }));
    sync();
  }

  function paintPolygon(context, coordinates, fill) {
    context.beginPath();
    context.moveTo(coordinates[0][0], coordinates[0][1]);
    for (let index = 1; index < coordinates.length; index++) context.lineTo(coordinates[index][0], coordinates[index][1]);
    context.closePath();
    context.fillStyle = fill;
    context.fill();
  }

  function paintBackground(context, width, height, time, localPointer, isHeader) {
    const dark = document.documentElement.dataset.theme === 'dark';
    const drift = Math.sin(time * 0.00016) * 0.025;
    const counter = Math.cos(time * 0.00012) * 0.025;
    const xy = coordinates => coordinates.map(([x, y]) => [x * width, y * height]);

    // Three broad, unoutlined ribbons leave the center clear for reading.
    paintPolygon(context, xy([
      [-0.1, 0.71 + drift], [0.11, 0.62 + counter], [0.39, 0.77 - drift],
      [0.58, 1.06], [0.37, 0.94], [0.07, 0.82 + drift],
    ]), dark ? 'rgba(93, 112, 160, .13)' : 'rgba(175, 194, 231, .16)');
    paintPolygon(context, xy([
      [1.08, 0.28 - counter], [0.87, 0.42 + drift], [0.63, 0.58],
      [0.86, 0.54 - counter], [1.08, 0.58],
    ]), dark ? 'rgba(155, 100, 138, .1)' : 'rgba(235, 169, 190, .17)');
    paintPolygon(context, xy([
      [0.29, -0.08], [0.49, 0.08 + counter], [0.74, -0.07],
    ]), dark ? 'rgba(87, 149, 143, .08)' : 'rgba(161, 211, 199, .11)');

    const positions = nodes.map(node => {
      let x = node.x * width + Math.sin(time * 0.00024 + node.phase) * 18;
      let y = node.y * height + Math.cos(time * 0.0002 + node.phase) * 18;
      if (localPointer.inside) {
        const dx = x - localPointer.x;
        const dy = y - localPointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0 && distance < 170) {
          const push = (1 - distance / 170) ** 2 * 35;
          x += dx / distance * push;
          y += dy / distance * push;
        }
      }
      return { x, y };
    });

    context.lineWidth = 0.9;
    for (let index = 0; index < positions.length; index++) {
      const point = positions[index];
      const closest = positions.slice(index + 1)
        .map(other => ({ other, distance: Math.hypot(other.x - point.x, other.y - point.y) }))
        .filter(candidate => candidate.distance < 280)
        .sort((left, right) => left.distance - right.distance)
        .slice(0, 2);
      for (const { other, distance } of closest) {
        const opacity = (1 - distance / 280) * (isHeader ? 0.19 : 0.15);
        context.strokeStyle = dark ? `rgba(173, 199, 216, ${opacity})` : `rgba(103, 151, 180, ${opacity})`;
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(other.x, other.y);
        context.stroke();
      }
      context.fillStyle = dark ? 'rgba(176, 206, 224, .38)' : 'rgba(102, 153, 181, .36)';
      context.beginPath();
      context.arc(point.x, point.y, index % 7 === 0 ? 1.8 : 1.1, 0, Math.PI * 2);
      context.fill();
    }

    if (localPointer.inside) {
      const glow = context.createRadialGradient(localPointer.x, localPointer.y, 0, localPointer.x, localPointer.y, 190);
      glow.addColorStop(0, dark ? 'rgba(125, 174, 204, .12)' : 'rgba(116, 177, 207, .12)');
      glow.addColorStop(1, 'rgba(116, 177, 207, 0)');
      context.fillStyle = glow;
      context.fillRect(localPointer.x - 190, localPointer.y - 190, 380, 380);
    }
  }

  function paintSparks(delta) {
    sparkContext.clearRect(0, 0, viewportWidth, viewportHeight);
    for (let index = sparks.length - 1; index >= 0; index--) {
      const spark = sparks[index];
      spark.life -= delta;
      if (spark.life <= 0) {
        sparks.splice(index, 1);
        continue;
      }
      spark.x += spark.vx * delta;
      spark.y += spark.vy * delta;
      const opacity = (spark.life / spark.total) * 0.78;
      sparkContext.fillStyle = `rgba(${spark.color}, ${opacity})`;
      sparkContext.beginPath();
      sparkContext.arc(spark.x, spark.y, spark.radius, 0, Math.PI * 2);
      sparkContext.fill();
    }
  }

  function animate(time) {
    frame = 0;
    if (!motionAllowed || document.hidden) return;
    const delta = Math.min(time - lastFrame || 16, 40);
    lastFrame = time;
    ambientContext.clearRect(0, 0, viewportWidth, viewportHeight);
    paintBackground(ambientContext, viewportWidth, viewportHeight, time, pointer, false);

    if (header) {
      const bounds = header.getBoundingClientRect();
      if (bounds.bottom > 0 && bounds.top < viewportHeight) {
        headerContext.clearRect(0, 0, headerWidth, headerHeight);
        const localPointer = {
          x: pointer.x - bounds.left,
          y: pointer.y - bounds.top,
          inside: pointer.inside && pointer.x >= bounds.left && pointer.x <= bounds.right
            && pointer.y >= bounds.top && pointer.y <= bounds.bottom,
        };
        paintBackground(headerContext, headerWidth, headerHeight, time, localPointer, true);
      }
    }

    paintSparks(delta);
    cursorPosition.x += (pointer.x - cursorPosition.x) * 0.24;
    cursorPosition.y += (pointer.y - cursorPosition.y) * 0.24;
    cursor.style.transform = `translate3d(${cursorPosition.x}px, ${cursorPosition.y}px, 0)`;
    frame = requestAnimationFrame(animate);
  }

  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
    motionAllowed = preference === 'on' || (preference !== 'off' && !reduce.matches);
    document.documentElement.dataset.motion = motionAllowed ? 'on' : 'off';
    button.textContent = motionAllowed ? '✧ 关闭动效' : '✧ 开启动效';
    button.setAttribute('aria-pressed', String(motionAllowed));
    ambient.hidden = !motionAllowed;
    headerScene.hidden = !motionAllowed || !header;
    sparkCanvas.hidden = !motionAllowed;
    cursor.hidden = !motionAllowed || !finePointer.matches || !pointer.inside;
    if (motionAllowed && !document.hidden) frame = requestAnimationFrame(animate);
    else {
      sparks.length = 0;
      ambientContext.clearRect(0, 0, viewportWidth, viewportHeight);
      headerContext.clearRect(0, 0, headerWidth, headerHeight);
      sparkContext.clearRect(0, 0, viewportWidth, viewportHeight);
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
    if (!pointer.inside) cursorPosition = { x: event.clientX, y: event.clientY };
    pointer = { x: event.clientX, y: event.clientY, inside: true };
    cursor.hidden = !motionAllowed || !finePointer.matches || event.pointerType === 'touch';
    cursor.classList.toggle('is-interactive', Boolean(event.target.closest('a, button, input, [role="button"]')));
    if (!motionAllowed || !finePointer.matches || event.pointerType === 'touch') return;
    if (Math.hypot(event.clientX - lastSpark.x, event.clientY - lastSpark.y) < 13) return;
    lastSpark = { x: event.clientX, y: event.clientY };
    sparks.push({
      x: event.clientX,
      y: event.clientY,
      vx: (Math.random() - 0.5) * 0.055,
      vy: -0.025 - Math.random() * 0.045,
      life: 390,
      total: 390,
      radius: 1.3 + Math.random() * 1.2,
      color: accents[sparks.length % accents.length],
    });
    if (sparks.length > 70) sparks.shift();
  }, { passive: true });

  document.addEventListener('pointerleave', () => {
    pointer.inside = false;
    cursor.hidden = true;
  });

  document.addEventListener('click', event => {
    if (!motionAllowed || !event.detail || event.target.closest('#motion-toggle')) return;
    for (let index = 0; index < 11; index++) {
      const angle = index / 11 * Math.PI * 2;
      const speed = 0.07 + Math.random() * 0.045;
      sparks.push({
        x: event.clientX,
        y: event.clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 480,
        total: 480,
        radius: 1.2 + Math.random() * 1.3,
        color: accents[index % accents.length],
      });
    }
  });

  window.addEventListener('resize', resize);
  window.addEventListener('pageshow', sync);
  document.addEventListener('visibilitychange', sync);
  reduce.addEventListener('change', sync);
  finePointer.addEventListener('change', sync);
  resize();
})();
