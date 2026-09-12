(() => {
  'use strict';

  const root = document.documentElement;
  if (!root.classList.contains('flowx-intro-pending')) return;

  const intro = document.createElement('div');
  intro.id = 'flowx-intro';
  intro.className = 'flowx-intro';
  intro.setAttribute('role', 'dialog');
  intro.setAttribute('aria-modal', 'true');
  intro.setAttribute('aria-label', 'Enter FlowX');

  const coils = Array.from({ length: 10 }, (_, index) => `
    <g transform="rotate(${index * 36} 160 160)">
      <rect class="reactor-coil-bed" x="141" y="17" width="38" height="48" rx="5" />
      <path class="reactor-coil-wire" stroke="url(#reactor-copper)" d="M146 22H174 M146 27H174 M146 32H174 M146 37H174 M146 42H174 M146 47H174 M146 52H174 M146 57H174" />
      <path class="reactor-coil-clamp" d="M149 14V66 M171 14V66" />
    </g>`).join('');

  const braces = Array.from({ length: 10 }, (_, index) => `
    <g transform="rotate(${index * 36} 160 160)">
      <path class="reactor-brace" fill="url(#reactor-metal)" d="M153 66L150 91L160 101L170 91L167 66Z" />
      <circle class="reactor-fastener" cx="160" cy="79" r="2.4" />
    </g>`).join('');

  const bolts = Array.from({ length: 8 }, (_, index) => `
    <g transform="rotate(${index * 45} 160 160)">
      <circle class="reactor-bolt" fill="url(#reactor-bolt)" cx="160" cy="119" r="3.2" />
      <path class="reactor-bolt-slot" d="M158 119H162" />
    </g>`).join('');

  const vanes = Array.from({ length: 8 }, (_, index) => `
    <path class="reactor-vane" fill="url(#reactor-metal)" transform="rotate(${index * 45} 160 160)" d="M160 132L173 141L169 157L153 151Z" />`).join('');

  intro.innerHTML = `
    <div class="flowx-intro__panel">
      <div class="flowx-reactor" aria-hidden="true">
        <canvas class="flowx-reactor__canvas" aria-hidden="true"></canvas>
        <span class="flowx-reactor__energy-overlay" aria-hidden="true"></span>
        <svg class="flowx-reactor__svg" viewBox="0 0 320 320" role="img" aria-label="FlowX energy reactor">
          <defs>
            <radialGradient id="reactor-backplate" cx="50%" cy="42%" r="62%">
              <stop offset="0" stop-color="#343b43" />
              <stop offset="0.52" stop-color="#171c22" />
              <stop offset="1" stop-color="#07090c" />
            </radialGradient>
            <linearGradient id="reactor-metal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#f0e5c2" />
              <stop offset="0.18" stop-color="#6e7479" />
              <stop offset="0.48" stop-color="#20252a" />
              <stop offset="0.72" stop-color="#a9945d" />
              <stop offset="1" stop-color="#34383c" />
            </linearGradient>
            <radialGradient id="reactor-steel" cx="34%" cy="28%" r="76%">
              <stop offset="0" stop-color="#e7e0cc" />
              <stop offset="0.16" stop-color="#9ba1a3" />
              <stop offset="0.48" stop-color="#41484d" />
              <stop offset="0.78" stop-color="#171b1f" />
              <stop offset="1" stop-color="#050608" />
            </radialGradient>
            <linearGradient id="reactor-copper" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#4e2414" />
              <stop offset="0.35" stop-color="#d28a48" />
              <stop offset="0.62" stop-color="#f1bc72" />
              <stop offset="1" stop-color="#65301c" />
            </linearGradient>
            <radialGradient id="reactor-core" cx="50%" cy="50%" r="54%">
              <stop offset="0" stop-color="#ffffff" />
              <stop offset="0.16" stop-color="#dffaff" />
              <stop offset="0.48" stop-color="#72dcff" />
              <stop offset="0.76" stop-color="#178bb6" />
              <stop offset="1" stop-color="#07131b" />
            </radialGradient>
            <radialGradient id="reactor-bolt" cx="34%" cy="27%" r="72%">
              <stop offset="0" stop-color="#f2eee0" />
              <stop offset="0.3" stop-color="#a7adaf" />
              <stop offset="0.72" stop-color="#343a3e" />
              <stop offset="1" stop-color="#101316" />
            </radialGradient>
            <linearGradient id="reactor-glass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#ffffff" stop-opacity="0.34" />
              <stop offset="0.34" stop-color="#bcefff" stop-opacity="0.05" />
              <stop offset="0.58" stop-color="#ffffff" stop-opacity="0" />
              <stop offset="1" stop-color="#71d7ff" stop-opacity="0.12" />
            </linearGradient>
            <pattern id="reactor-mesh" width="12" height="10.4" patternUnits="userSpaceOnUse">
              <path d="M3 0H9L12 5.2L9 10.4H3L0 5.2Z" fill="none" stroke="#d9f8ff" stroke-width="0.7" opacity="0.42" />
            </pattern>
            <filter id="reactor-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="reactor-shadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#000000" flood-opacity="0.8" />
            </filter>
            <filter id="reactor-grain" x="-15%" y="-15%" width="130%" height="130%">
              <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="3" seed="19" result="noise" />
              <feColorMatrix in="noise" type="saturate" values="0" result="mono" />
              <feComponentTransfer in="mono" result="faded">
                <feFuncA type="table" tableValues="0 0.09" />
              </feComponentTransfer>
              <feComposite in="faded" in2="SourceAlpha" operator="in" result="texture" />
              <feBlend in="SourceGraphic" in2="texture" mode="overlay" />
            </filter>
          </defs>

          <g filter="url(#reactor-shadow)">
            <circle cx="160" cy="160" r="153" fill="#030405" opacity="0.9" />
            <circle cx="160" cy="160" r="150" fill="url(#reactor-backplate)" stroke="#050608" stroke-width="5" filter="url(#reactor-grain)" />
            <path class="reactor-cable reactor-cable--red" d="M47 105C30 130 32 184 54 214" />
            <path class="reactor-cable reactor-cable--dark" d="M266 92C288 122 288 176 270 207" />
            <circle cx="160" cy="160" r="145" fill="none" stroke="#090a0c" stroke-width="11" />
            <circle cx="160" cy="160" r="142" fill="none" stroke="url(#reactor-metal)" stroke-width="7" />
            <path class="reactor-rim-highlight" d="M64 94A119 119 0 0 1 248 82" />
            <circle cx="160" cy="160" r="134" fill="none" stroke="#b52a38" stroke-width="2" opacity="0.5" />
            <g class="reactor-calibration">
              <circle cx="160" cy="160" r="128" fill="none" stroke="#e7c66b" stroke-width="1.5" stroke-dasharray="2 8" opacity="0.64" />
              <circle cx="160" cy="160" r="124" fill="none" stroke="#788087" stroke-width="1" stroke-dasharray="18 5 2 5" opacity="0.5" />
            </g>
            <g class="reactor-coils">${coils}</g>
            <g class="reactor-braces">${braces}</g>
            <circle cx="160" cy="160" r="100" fill="#050709" stroke="#080a0c" stroke-width="5" />
            <circle cx="160" cy="160" r="96" fill="url(#reactor-steel)" stroke="#a38d56" stroke-width="2" filter="url(#reactor-grain)" />
            <circle cx="160" cy="160" r="87" fill="#070a0d" stroke="#20262b" stroke-width="5" />
            <circle class="reactor-energy-ring" cx="160" cy="160" r="78" fill="none" stroke="#a9edff" stroke-width="7" stroke-dasharray="44 14" filter="url(#reactor-glow)" />
            <circle cx="160" cy="160" r="69" fill="#071016" stroke="#ccb77b" stroke-width="2.5" opacity="0.98" />
            <g class="reactor-bolts">${bolts}</g>
            <circle cx="160" cy="160" r="58" fill="#040709" stroke="#171e23" stroke-width="5" />
            <circle cx="160" cy="160" r="52" fill="url(#reactor-mesh)" stroke="#90d9e9" stroke-width="1.2" opacity="0.64" />
            <g class="reactor-iris">${vanes}</g>
            <circle cx="160" cy="160" r="24" fill="#060a0d" stroke="url(#reactor-metal)" stroke-width="4" />
            <circle class="reactor-core-light" cx="160" cy="160" r="14" fill="url(#reactor-core)" filter="url(#reactor-glow)" />
            <circle cx="160" cy="160" r="5" fill="#ffffff" opacity="0.94" />
            <path class="reactor-glass-reflection" d="M124 135A48 48 0 0 1 183 117" />
            <circle cx="160" cy="160" r="56" fill="url(#reactor-glass)" opacity="0.42" />
          </g>
        </svg>
      </div>
      <p class="flowx-intro__eyebrow">Computational Intelligence</p>
      <div class="flowx-intro__title">FlowX</div>
      <p class="flowx-intro__subtitle">Intelligent Flow · CFD × AI</p>
      <button class="flowx-intro__enter" type="button">Ignite Arc</button>
      <p class="flowx-intro__hint">Hover the reactor · click to initialize</p>
    </div>`;

  document.body.prepend(intro);
  const enterButton = intro.querySelector('.flowx-intro__enter');
  let reactor3d = null;
  const reactorCanvas = intro.querySelector('.flowx-reactor__canvas');
  if (reactorCanvas) {
    import('/js/flowx-reactor-3d.js').then(({ mountFlowXReactor }) => {
      if (!document.body.contains(intro)) return;
      reactor3d = mountFlowXReactor(reactorCanvas);
      intro.classList.add('flowx-intro-has-3d');
    }).catch(() => {});
  }

  const enter = () => {
    if (intro.classList.contains('is-leaving')) return;
    try {
      sessionStorage.setItem('flowx-intro-seen', '1');
    } catch (_) {}
    intro.classList.add('is-leaving');
    root.classList.remove('flowx-intro-pending');
    document.removeEventListener('keydown', handleKeydown);
    window.setTimeout(() => intro.remove(), 430);
  };

  const activate = () => {
    if (intro.classList.contains('is-activating') || intro.classList.contains('is-leaving')) return;
    intro.classList.add('is-activating');
    reactor3d?.activate();
    intro.setAttribute('aria-busy', 'true');
    if (enterButton) enterButton.disabled = true;
    window.setTimeout(enter, 950);
  };

  const reactor = intro.querySelector('.flowx-reactor');
  let reactorBounds = null;
  let tiltFrame = 0;
  let pendingTilt = [0, 0];
  reactor?.addEventListener('pointerenter', () => { reactorBounds = reactor.getBoundingClientRect(); intro.classList.add('reactor-hover'); reactor3d?.setHover(true); });
  reactor?.addEventListener('pointerleave', () => { reactorBounds = null; intro.classList.remove('reactor-hover'); reactor3d?.setHover(false); });

  intro.addEventListener('click', () => activate());
  const handleKeydown = event => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
      event.preventDefault();
      activate();
    }
  };
  document.addEventListener('keydown', handleKeydown);

  intro.addEventListener('pointermove', event => {
    const x = `${(event.clientX / window.innerWidth) * 100}%`;
    const y = `${(event.clientY / window.innerHeight) * 100}%`;
    intro.style.setProperty('--pointer-x', x);
    intro.style.setProperty('--pointer-y', y);

    if (reactor && reactorBounds) {
      const relativeX = Math.max(-0.5, Math.min(0.5, (event.clientX - reactorBounds.left) / reactorBounds.width - 0.5));
      const relativeY = Math.max(-0.5, Math.min(0.5, (event.clientY - reactorBounds.top) / reactorBounds.height - 0.5));
      pendingTilt = [relativeX, relativeY];
      if (!tiltFrame) tiltFrame = window.requestAnimationFrame(() => {
        const [x, y] = pendingTilt;
        reactor.style.setProperty('--reactor-tilt-x', `${y * -5}deg`);
        reactor.style.setProperty('--reactor-tilt-y', `${x * 5}deg`);
        reactor3d?.setTilt(y * -0.08, x * 0.08);
        tiltFrame = 0;
      });
    }
  }, { passive: true });

  window.requestAnimationFrame(() => enterButton?.focus({ preventScroll: true }));
})();
