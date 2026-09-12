import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const TAU = Math.PI * 2;
const mat = (color, roughness = 0.35, metalness = 0.8, emissive = 0x000000, intensity = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity: intensity });
const cylinder = (r, h, material, segments = 32) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, segments), material); m.rotation.x = Math.PI / 2; return m; };
const torus = (r, tube, material) => new THREE.Mesh(new THREE.TorusGeometry(r, tube, 8, 48), material);

export function mountFlowXReactor(canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(27, 1, 0.1, 100); camera.position.z = 10.2;
  const isMobile = window.innerWidth < 700;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile, powerPreference: 'high-performance' });
  const pixelRatio = Math.min(window.devicePixelRatio || 1, isMobile ? 0.9 : 1.15);
  renderer.setPixelRatio(pixelRatio); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
  scene.add(new THREE.AmbientLight(0x6b7783, 1.15));
  const key = new THREE.DirectionalLight(0xffdfaa, 4.5); key.position.set(-4, 5, 7); scene.add(key);
  const cyan = new THREE.PointLight(0x159dcc, 8, 12); cyan.position.set(0, 0, 3); scene.add(cyan);
  const rim = new THREE.PointLight(0x9e1e2d, 5, 10); rim.position.set(3, -2, -2); scene.add(rim);

  const reactor = new THREE.Group(); reactor.rotation.x = -0.06; scene.add(reactor);
  const black = mat(0x050709, .24, .6), dark = mat(0x15191d, .3, .88), steel = mat(0x5b6267, .24, .96), gold = mat(0xc7a953, .23, .9), copper = mat(0xb66b35, .3, .85), red = mat(0x681b25, .28, .75);
  const blue = mat(0x1684ab, .2, .35, 0x1684ab, 2.3); const white = mat(0xe9fbff, .15, .2, 0x9eeeff, 3.5);
  const glass = new THREE.MeshStandardMaterial({ color: 0x7edcff, roughness: .08, metalness: .15, transparent: true, opacity: .32, emissive: 0x16485b, emissiveIntensity: .35 });
  const plate = cylinder(3.05, .48, black); plate.position.z = -.34; reactor.add(plate);
  const outer = torus(2.88, .17, steel); outer.position.z = -.02; reactor.add(outer);
  reactor.add(torus(2.65, .06, dark)); const trace = torus(2.54, .025, red); trace.position.z = .03; reactor.add(trace);
  const calibration = new THREE.Group(); calibration.position.z = .2; calibration.add(torus(2.42, .025, gold), torus(2.34, .012, steel)); reactor.add(calibration);
  for (let i = 0; i < 10; i++) { const g = new THREE.Group(); g.rotation.z = i / 10 * TAU; const bed = new THREE.Mesh(new THREE.BoxGeometry(.62, 1.08, .24), dark); bed.position.set(0, 2.57, .08); g.add(bed); for (let j = 0; j < 8; j++) { const w = cylinder(.035, .55, copper, 20); w.position.set(0, 2.12 + j * .125, .25); w.rotation.z = Math.PI / 2; g.add(w); } for (const y of [2.04, 3.08]) { const clamp = new THREE.Mesh(new THREE.BoxGeometry(.75, .09, .3), steel); clamp.position.set(0, y, .3); g.add(clamp); } reactor.add(g); }
  for (let i = 0; i < 10; i++) { const g = new THREE.Group(); g.rotation.z = i / 10 * TAU; const arm = new THREE.Mesh(new THREE.BoxGeometry(.22, .92, .3), dark); arm.position.set(0, 1.62, .24); g.add(arm); const bolt = new THREE.Mesh(new THREE.SphereGeometry(.1, 20, 12), gold); bolt.position.set(0, 1.5, .43); g.add(bolt); reactor.add(g); }
  const housing = cylinder(2.03, .38, dark); housing.position.z = .28; reactor.add(housing); const shadow = cylinder(1.82, .4, black); shadow.position.z = .5; reactor.add(shadow);
  const inner = torus(1.62, .075, gold); inner.position.z = .72; reactor.add(inner); const energy = torus(1.42, .105, blue); energy.position.z = .75; reactor.add(energy);
  const coreHousing = cylinder(1.19, .3, black); coreHousing.position.z = .78; reactor.add(coreHousing);
  const iris = new THREE.Group(); iris.position.z = .98; for (let i = 0; i < 8; i++) { const v = new THREE.Mesh(new THREE.BoxGeometry(.12, .72, .09), steel); v.rotation.z = i / 8 * TAU; v.position.set(Math.sin(i / 8 * TAU) * .34, Math.cos(i / 8 * TAU) * .34, 0); iris.add(v); } reactor.add(iris);
  const core = new THREE.Group(); core.position.z = 1.12; const sphere = new THREE.Mesh(new THREE.SphereGeometry(.42, 24, 16), blue); sphere.scale.z = .45; core.add(sphere); const emitter = new THREE.Mesh(new THREE.SphereGeometry(.13, 16, 10), white); emitter.position.z = .18; core.add(emitter); reactor.add(core);
  const lens = new THREE.Mesh(new THREE.SphereGeometry(.82, 32, 16, 0, TAU, 0, Math.PI / 2), glass); lens.position.z = 1.01; lens.rotation.x = Math.PI; reactor.add(lens);
  for (let i = 0; i < 8; i++) { const b = cylinder(.095, .095, gold, 6); const a = i / 8 * TAU; b.position.set(Math.cos(a) * 1.95, Math.sin(a) * 1.95, .72); reactor.add(b); }
  let hovered = false, activating = false, tiltX = 0, tiltY = 0, last = performance.now(), raf, elapsed = 0;
  const resize = () => { const r = canvas.getBoundingClientRect(); const size = Math.max(1, Math.min(r.width, r.height)); renderer.setSize(size, size, false); camera.aspect = 1; camera.updateProjectionMatrix(); }; const ro = new ResizeObserver(resize); ro.observe(canvas); resize();
  const tick = now => { const dt = Math.min(.05, (now - last) / 1000); last = now; if (document.hidden) { raf = requestAnimationFrame(tick); return; } elapsed += dt; const speed = activating ? 13 : hovered ? 1.2 : .15; calibration.rotation.z += dt * speed; reactor.rotation.x += (tiltX - reactor.rotation.x) * .08; reactor.rotation.y += (tiltY - reactor.rotation.y) * .08; const interval = activating ? .016 : .05; if (elapsed >= interval) { const pulse = 1 + Math.sin(now * .004) * .06 * (activating ? 2.8 : 1); core.scale.setScalar(pulse); renderer.render(scene, camera); elapsed = 0; } raf = requestAnimationFrame(tick); }; raf = requestAnimationFrame(tick);
  return { setHover: value => { hovered = value; }, setTilt: (x, y) => { tiltX = x; tiltY = y; }, activate: () => { activating = true; }, dispose: () => { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); } };
}
