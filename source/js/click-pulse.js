(() => {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const MAX_PULSES = 10;
  const pulses = [];

  function spawn(x, y) {
    const pulse = document.createElement('span');
    pulse.className = 'click-pulse';
    pulse.setAttribute('aria-hidden', 'true');
    pulse.style.left = `${x}px`;
    pulse.style.top = `${y}px`;
    for (let index = 0; index < 4; index++) pulse.append(document.createElement('i'));
    document.body.append(pulse);
    pulses.push(pulse);
    if (pulses.length > MAX_PULSES) pulses.shift()?.remove();
    setTimeout(() => {
      pulse.remove();
      const index = pulses.indexOf(pulse);
      if (index !== -1) pulses.splice(index, 1);
    }, 700);
  }

  document.addEventListener('pointerdown', event => {
    if (reduce.matches) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    spawn(event.clientX, event.clientY);
  }, { passive: true });
})();
