(() => {
  'use strict';

  const root = document.documentElement;
  if (!root.classList.contains('flowx-intro-pending')) return;

  // The raster asset is baked from our original deployed model, not a new design.
  // Every device uses this one local image; no WebGL or CDN is needed at runtime.
  const REACTOR_IMAGE = '/images/intro/reactor-1c9e4377be19.png';
  const IGNITE_MS = 950;
  const FADE_MS = 420;
  const SLOW_ROTATION_MS = 7000;
  const FAST_ROTATION_MS = 720;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();

  // Match the bake's orthographic geometry exactly: 1.42 / (2 × 3.35) × 1024.
  // Fixed SVG segments create one cached sweep; only its parent rotates.
  const energyRadius = 1.42 / (2 * 3.35) * 1024;
  const energyCircle = (attributes) => '<circle cx="512" cy="512" r="' + energyRadius + '" pathLength="360" ' + attributes + '/>';
  const sweepTail = Array.from({ length: 24 }, (_, index) => {
    const opacity = (0.05 + 0.85 * Math.pow((index + 1) / 24, 1.65)).toFixed(3);
    return energyCircle('stroke="#75ddff" stroke-width="18" opacity="' + opacity + '" stroke-dasharray="4.12 355.88" stroke-dashoffset="' + (-index * 4) + '"');
  }).join('');
  const energySVG = [
    '<svg viewBox="0 0 1024 1024" preserveAspectRatio="xMidYMid meet" aria-hidden="true">',
    '  <g transform="rotate(-105 512 512)" fill="none">',
    energyCircle('stroke="#41cfff" stroke-width="32" opacity=".18" stroke-dasharray="108 252"'),
    sweepTail,
    energyCircle('stroke="#e9fbff" stroke-width="21" stroke-linecap="round" stroke-dasharray="12 348" stroke-dashoffset="-96"'),
    energyCircle('stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-dasharray="10 350" stroke-dashoffset="-98"'),
    energyCircle('stroke="#75ddff" stroke-width="12" opacity=".38" stroke-linecap="round" stroke-dasharray="18 342" stroke-dashoffset="-255"'),
    '  </g>',
    '</svg>'
  ].join('\n');

  const intro = document.createElement('div');
  intro.id = 'flowx-intro';
  intro.className = 'flowx-intro';
  intro.setAttribute('role', 'dialog');
  intro.setAttribute('aria-modal', 'true');
  intro.setAttribute('aria-label', 'Enter FlowX');
  intro.style.setProperty('--flowx-ignite-duration', IGNITE_MS + 'ms');
  intro.style.setProperty('--flowx-fade-duration', FADE_MS + 'ms');
  intro.innerHTML = [
    '<div class="flowx-intro__pointer-glow" aria-hidden="true"></div>',
    '<div class="flowx-intro__panel">',
    '  <div class="flowx-reactor" aria-hidden="true">',
    '    <div class="flowx-reactor__visual">',
    '      <img class="flowx-reactor__image" src="' + REACTOR_IMAGE + '" width="1024" height="1024" alt="" loading="eager" decoding="async" fetchpriority="high" draggable="false">',
    '      <span class="flowx-reactor__energy-overlay">',
    energySVG,
    '      </span>',
    '      <span class="flowx-reactor__core-light"></span>',
    '    </div>',
    '  </div>',
    '  <p class="flowx-intro__eyebrow">Computational Intelligence</p>',
    '  <div class="flowx-intro__title">FlowX</div>',
    '  <p class="flowx-intro__subtitle">Intelligent Flow · CFD × AI</p>',
    '  <button class="flowx-intro__enter" type="button">Ignite Arc</button>',
    '  <p class="flowx-intro__hint">Hover the reactor · click anywhere to initialize</p>',
    '</div>'
  ].join('\n');

  const reactor = intro.querySelector('.flowx-reactor');
  const visual = intro.querySelector('.flowx-reactor__visual');
  const rotor = intro.querySelector('.flowx-reactor__energy-overlay');
  const glow = intro.querySelector('.flowx-intro__pointer-glow');
  const enterButton = intro.querySelector('.flowx-intro__enter');
  const reactorImage = intro.querySelector('.flowx-reactor__image');
  let rotation = null;
  let pointerFrame = 0;
  let focusFrame = 0;
  let reactorBounds = null;
  let pointer = null;
  let activating = false;
  let leaving = false;
  let removed = false;
  let igniteTimer = 0;
  let fadeTimer = 0;

  const clearIntro = () => {
    if (removed) return;
    removed = true;
    events.abort();
    reducedMotion.removeEventListener('change', syncMotion);
    cancelAnimationFrame(pointerFrame);
    cancelAnimationFrame(focusFrame);
    clearTimeout(igniteTimer);
    clearTimeout(fadeTimer);
    rotation?.cancel();
    intro.remove();
  };

  const enter = () => {
    if (leaving) return;
    leaving = true;
    try { sessionStorage.setItem('flowx-intro-seen', '1'); } catch {}
    intro.classList.add('is-leaving');
    root.classList.remove('flowx-intro-pending');
    events.abort();
    cancelAnimationFrame(pointerFrame);
    fadeTimer = window.setTimeout(clearIntro, FADE_MS + 10);
  };

  const activate = () => {
    if (activating || leaving) return;
    activating = true;
    intro.classList.add('is-activating');
    intro.setAttribute('aria-busy', 'true');
    enterButton.disabled = true;
    if (rotation && !reducedMotion.matches) {
      // A paused ring already holds its angle: set its rate before resuming.
      // For a playing ring, synchronize the speed change without a phase jump.
      const speed = SLOW_ROTATION_MS / FAST_ROTATION_MS;
      if (rotation.playState === 'paused' || typeof rotation.updatePlaybackRate !== 'function') {
        const angleTime = rotation.currentTime;
        rotation.playbackRate = speed;
        if (angleTime !== null) rotation.currentTime = angleTime;
      } else {
        rotation.updatePlaybackRate(speed);
      }
      rotation.play();
    }
    igniteTimer = window.setTimeout(enter, IGNITE_MS);
  };

  function syncMotion() {
    if (removed) return;
    if (reducedMotion.matches) {
      rotation?.pause();
      rotation && (rotation.currentTime = 0);
      visual.style.transform = '';
      intro.classList.remove('reactor-hover');
    } else if (activating || intro.classList.contains('reactor-hover')) {
      rotation?.play();
    }
  }

  // A single compositor animation rotates the same visible ring on every device.
  // CSS provides the equivalent fallback when Web Animations is unavailable.
  if (typeof rotor.animate === 'function') {
    rotation = rotor.animate(
      [{ transform: 'rotate(12deg)' }, { transform: 'rotate(372deg)' }],
      { duration: SLOW_ROTATION_MS, iterations: Infinity, easing: 'linear' }
    );
    rotation.pause();
    rotation.currentTime = 0;
    intro.classList.add('has-ring-animation');
  }

  reactor.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch' || reducedMotion.matches || activating || leaving) return;
    reactorBounds = reactor.getBoundingClientRect();
    intro.classList.add('reactor-hover');
    rotation?.play();
  }, { signal: events.signal });
  reactor.addEventListener('pointerleave', () => {
    reactorBounds = null;
    intro.classList.remove('reactor-hover');
    if (!activating) rotation?.pause();
  }, { signal: events.signal });

  const updatePointer = () => {
    pointerFrame = 0;
    if (!pointer || activating || leaving || reducedMotion.matches) return;
    glow.style.transform = 'translate3d(' + pointer.x + 'px,' + pointer.y + 'px,0)';
    if (intro.classList.contains('reactor-hover')) {
      if (!reactorBounds) reactorBounds = reactor.getBoundingClientRect();
      const x = Math.max(-0.5, Math.min(0.5, (pointer.x - reactorBounds.left) / reactorBounds.width - 0.5));
      const y = Math.max(-0.5, Math.min(0.5, (pointer.y - reactorBounds.top) / reactorBounds.height - 0.5));
      // A small planar parallax preserves the circular silhouette during hover.
      visual.style.transform = 'translate3d(' + x * 3 + 'px,' + y * 3 + 'px,0)';
    }
  };
  intro.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || reducedMotion.matches || activating || leaving) return;
    pointer = { x: event.clientX, y: event.clientY };
    if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer);
  }, { passive: true, signal: events.signal });
  window.addEventListener('resize', () => {
    reactorBounds = null;
    if (pointer && !pointerFrame) pointerFrame = requestAnimationFrame(updatePointer);
  }, { passive: true, signal: events.signal });

  intro.addEventListener('click', activate, { signal: events.signal });
  document.addEventListener('keydown', event => {
    if (['Enter', ' ', 'Escape'].includes(event.key)) {
      event.preventDefault();
      activate();
    }
  }, { signal: events.signal });
  reducedMotion.addEventListener('change', syncMotion);

  // If an asset ever fails, keep the homepage reachable instead of trapping users.
  reactorImage.addEventListener('error', enter, { once: true, signal: events.signal });
  document.body.prepend(intro);
  focusFrame = requestAnimationFrame(() => enterButton.focus({ preventScroll: true }));
})();
