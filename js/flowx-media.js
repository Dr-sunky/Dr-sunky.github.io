// Progressive enhancement for scientific clips only; never touches the intro.
(() => {
  'use strict';
  const videos = [...document.querySelectorAll('video[data-flowx-loop]')];
  if (!videos.length) return;
  const canObserve = typeof IntersectionObserver === 'function';
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const states = new Map(videos.map(video => [video, { visible: !canObserve, manual: false, loaded: false }]));

  const load = video => {
    const state = states.get(video);
    if (state.loaded) return;
    state.loaded = true;
    video.querySelectorAll('source[data-src]').forEach(source => { source.src = source.dataset.src; });
    video.load();
  };
  const play = video => {
    load(video);
    // Browser/user autoplay restrictions leave an explicit keyboard-safe button.
    video.play()?.catch(() => { states.get(video).button.hidden = false; });
  };

  const sync = video => {
    const state = states.get(video);
    if (document.hidden || !state.visible || (motion.matches && !state.manual)) {
      video.pause();
    } else if (!state.manual) {
      play(video);
    }
  };
  for (const video of videos) {
    video.muted = true;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'flowx-media-play';
    button.textContent = 'Play clip';
    button.setAttribute('aria-label', 'Play: ' + video.getAttribute('aria-label'));
    states.get(video).button = button;
    video.parentElement.append(button);
    const manual = () => {
      states.get(video).manual = true;
      load(video);
    };
    video.addEventListener('pointerdown', manual, { passive: true });
    video.addEventListener('keydown', manual);
    video.addEventListener('playing', () => { button.hidden = true; });
    button.addEventListener('click', () => { manual(); play(video); });
  }
  const observer = canObserve ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      states.get(entry.target).visible = entry.isIntersecting;
      sync(entry.target);
    }
  }, { threshold: 0.01 }) : null;
  videos.forEach(video => observer?.observe(video));
  document.addEventListener('visibilitychange', () => videos.forEach(sync));
  motion.addEventListener('change', () => videos.forEach(sync));
  window.addEventListener('pagehide', () => {
    observer?.disconnect();
    videos.forEach(video => video.pause());
  });
  window.addEventListener('pageshow', () => videos.forEach(video => observer?.observe(video)));
})();
