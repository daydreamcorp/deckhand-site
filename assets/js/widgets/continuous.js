// assets/js/widgets/continuous.js — dial, fader, XY pad, joystick and hue ring: pointer capture + keyboard (plan B §10, Task 12)
import { sliderCore } from './slider-core.js';
const capture = (el, onPoint, opts) => {
  // One drag at a time, tracked by pointerId. setPointerCapture keeps the drag alive when the pointer leaves the
  // element; it is best-effort (it throws for a pointer the browser does not consider active), so the drag state
  // is our own flag rather than hasPointerCapture().
  let active = null;
  el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    active = e.pointerId;
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* synthetic or already-released pointer: drag still works while the pointer stays over the element */ }
    el.classList.add('is-dragging'); opts.onGrab?.(); onPoint(e); e.preventDefault();
  });
  el.addEventListener('pointermove', (e) => { if (active === e.pointerId) onPoint(e); });
  const release = (e) => {
    if (active !== e.pointerId) return;
    active = null;
    try { el.releasePointerCapture(e.pointerId); } catch (err) { /* never captured */ }
    el.classList.remove('is-dragging'); opts.onRelease?.();
  };
  el.addEventListener('pointerup', release); el.addEventListener('pointercancel', release);
};
export function attachDial(el, opts = {}) {
  const core = sliderCore(el, opts); const SWEEP = 270;
  const angleAt = (e) => { const r = el.getBoundingClientRect(); return (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI; };
  const fromAngle = (a) => core.min + ((Math.min(SWEEP / 2, Math.max(-SWEEP / 2, a)) + SWEEP / 2) / SWEEP) * (core.max - core.min);
  capture(el, (e) => core.set(fromAngle(angleAt(e))), opts);
  return core;
}
export function attachFader(el, opts = {}) {
  const core = sliderCore(el, opts); const lane = el.querySelector('.face__track');
  const valueAt = (e) => { const r = lane.getBoundingClientRect(); return core.min + ((r.bottom - e.clientY) / r.height) * (core.max - core.min); };
  capture(el, (e) => core.set(valueAt(e)), opts);
  return core;
}

export function attachXY(face, opts = {}) {
  let x = +face.style.getPropertyValue('--x') || 0.5, y = +face.style.getPropertyValue('--y') || 0.5;
  const set = (nx, ny) => { x = Math.min(1, Math.max(0, nx)); y = Math.min(1, Math.max(0, ny)); face.style.setProperty('--x', x); face.style.setProperty('--y', y); opts.onValue?.({ x, y }); };
  const at = (e) => { const r = face.getBoundingClientRect(), inset = 0.11; const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    set((px - inset) / (1 - 2 * inset), (py - inset) / (1 - 2 * inset)); };
  capture(face, at, opts);
  face.addEventListener('keydown', (e) => { const d = { ArrowLeft: [-0.02, 0], ArrowRight: [0.02, 0], ArrowUp: [0, -0.02], ArrowDown: [0, 0.02] }[e.key]; if (d) { e.preventDefault(); set(x + d[0], y + d[1]); } });
  set(x, y); return { set: (v) => set(v.x, v.y) };
}
export function attachJoystick(face, opts = {}) {
  const leash = face.querySelector('.joy__leash');
  let x = 0.5, y = 0.5;
  const paint = () => { face.style.setProperty('--x', x); face.style.setProperty('--y', y); leash.setAttribute('x2', 50 + (x - 0.5) * 78); leash.setAttribute('y2', 50 + (y - 0.5) * 78); opts.onValue?.({ x, y }); };
  const set = (nx, ny) => { x = Math.min(1, Math.max(0, nx)); y = Math.min(1, Math.max(0, ny)); paint(); };
  const at = (e) => { const r = face.getBoundingClientRect(); set((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height); };
  const home = () => { const g = window.gsap, o = { x, y };
    if ((typeof opts.reduced === 'function' ? opts.reduced() : opts.reduced) || !g) { set(0.5, 0.5); return; }
    g.to(o, { x: 0.5, y: 0.5, duration: 0.4, ease: 'elastic.out(1, 0.5)', onUpdate: () => set(o.x, o.y) }); };
  capture(face, at, { ...opts, onRelease: () => { opts.onRelease?.(); home(); } });
  face.addEventListener('keydown', (e) => { const d = { ArrowLeft: [-0.1, 0], ArrowRight: [0.1, 0], ArrowUp: [0, -0.1], ArrowDown: [0, 0.1] }[e.key]; if (d) { e.preventDefault(); set(x + d[0], y + d[1]); } });
  face.addEventListener('keyup', (e) => { if (e.key.startsWith('Arrow')) home(); });
  paint(); return { set: (v) => set(v.x, v.y) };
}
export function attachHue(face, opts = {}) {
  let hue = +face.style.getPropertyValue('--hue') || 187;
  const set = (h) => { hue = ((h % 360) + 360) % 360; face.style.setProperty('--hue', hue); face.dataset.on = 'true'; face.setAttribute('aria-valuenow', Math.round(hue)); face.setAttribute('aria-valuetext', `hue ${Math.round(hue)}°`); opts.onValue?.(hue); };
  const at = (e) => { const r = face.getBoundingClientRect(); const a = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI; set(a); };
  capture(face, at, opts);
  face.addEventListener('keydown', (e) => { const d = { ArrowLeft: -5, ArrowRight: 5, ArrowUp: 5, ArrowDown: -5 }[e.key]; if (d) { e.preventDefault(); set(hue + d); } else if (e.key === 'Home') set(0); else if (e.key === 'End') set(359); });
  set(hue); return { set };
}
