(() => {
  'use strict';
  const scene = document.createElement('canvas');
  const sparks = document.createElement('canvas');
  scene.id = 'scene'; sparks.id = 'sparkles';
  scene.setAttribute('aria-hidden', 'true'); sparks.setAttribute('aria-hidden', 'true');
  document.body.append(scene, sparks);
  const ctx = scene.getContext('2d'), fx = sparks.getContext('2d');
  if (!ctx || !fx) return;
  const button = document.createElement('button');
  button.id = 'motion-toggle'; button.type = 'button';
  button.title = '切换粒子、飘带和点击烟花';
  document.body.append(button);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(hover: hover) and (pointer: fine)');
  let enabled = true;
  try { enabled = localStorage.getItem('blog-motion') !== 'off'; } catch {}
  let width, height, frame = 0, last = 0;
  let pointer = { x: -1000, y: -1000 };
  const points = Array.from({ length: 48 }, (_, i) => ({ x: (i * .618) % 1, y: (i * .379 + .1) % 1, v: .000004 + i % 5 * .000002 }));
  const particles = [];
  const colors = ['#49b1f5', '#f3a6ca', '#97d9ce', '#b2b3e7'];
  function resize() {
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio, 1.5);
    for (const [canvas, context] of [[scene, ctx], [sparks, fx]]) {
      canvas.width = width * dpr; canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }
  function draw(time) {
    frame = 0;
    if (!enabled || reduce.matches || !desktop.matches || document.hidden) { sync(); return; }
    const dt = Math.min(time - last || 16, 40); last = time;
    ctx.clearRect(0, 0, width, height); fx.clearRect(0, 0, width, height);
    // Original ribbon geometry, inspired by the reference's pastel background.
    for (let i = 0; i < 3; i++) {
      const y = height * (.25 + i * .3) + Math.sin(time * .00016 + i) * 55;
      ctx.fillStyle = ['#b8ddf526', '#f5b7d52b', '#b6dcd92b'][i];
      ctx.beginPath(); ctx.moveTo(-50, y);
      ctx.bezierCurveTo(width * .25, y - 250, width * .65, y + 230, width + 50, y - 80);
      ctx.lineTo(width + 50, y - 20);
      ctx.bezierCurveTo(width * .6, y + 310, width * .3, y - 190, -50, y + 65);
      ctx.closePath(); ctx.fill();
    }
    const locations = points.map((p, i) => {
      p.y = (p.y + p.v * dt) % 1;
      return { x: p.x * width + Math.sin(time * .0002 + i) * 14, y: p.y * height };
    });
    ctx.strokeStyle = '#739bd133'; ctx.fillStyle = '#749ec780';
    locations.forEach((p, i) => {
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2); ctx.fill();
      for (let j = i + 1; j < locations.length; j++) {
        const q = locations[j];
        if (Math.hypot(p.x-q.x, p.y-q.y) < 115) { ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke(); }
      }
      if (Math.hypot(p.x-pointer.x,p.y-pointer.y) < 150) { ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(pointer.x,pointer.y); ctx.stroke(); }
    });
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]; p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += .00015 * dt;
      if (p.life <= 0) { particles.splice(i,1); continue; }
      fx.globalAlpha = p.life / p.total; fx.fillStyle = p.color;
      fx.beginPath(); fx.arc(p.x,p.y,p.radius,0,Math.PI * 2); fx.fill();
    }
    fx.globalAlpha = 1;
    frame = requestAnimationFrame(draw);
  }
  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; last = 0;
    const on = enabled && !reduce.matches && desktop.matches;
    button.disabled = reduce.matches || !desktop.matches;
    button.textContent = button.disabled ? '静态模式' : on ? '✧ 动效开' : '✧ 动效关';
    button.setAttribute('aria-pressed', String(on));
    scene.hidden = sparks.hidden = !on;
    if (on && !document.hidden) frame = requestAnimationFrame(draw);
    else { particles.length = 0; ctx.clearRect(0,0,width,height); fx.clearRect(0,0,width,height); }
  }
  button.addEventListener('click', () => { enabled = !enabled; try { localStorage.setItem('blog-motion', enabled ? 'on' : 'off'); } catch {} sync(); });
  document.addEventListener('pointermove', e => { pointer = { x: e.clientX, y: e.clientY }; }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { pointer = { x: -1000, y: -1000 }; });
  document.addEventListener('click', e => {
    if (!enabled || reduce.matches || !desktop.matches || !e.detail || e.target.closest('#motion-toggle')) return;
    for (let i = 0; i < 18 && particles.length < 180; i++) {
      const angle = Math.PI * 2 * i / 18, speed = .07 + Math.random() * .13;
      const life = 600 + Math.random() * 250;
      particles.push({ x: e.clientX, y: e.clientY, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, life, total: life, color: colors[i%4], radius: 1.5 + Math.random()*2 });
    }
  });
  window.addEventListener('resize', resize);
  window.addEventListener('pageshow', sync);
  document.addEventListener('visibilitychange', sync);
  reduce.addEventListener('change', sync); desktop.addEventListener('change', sync);
  resize(); sync();
})();
