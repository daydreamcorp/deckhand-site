import { setFaceValue } from '../deck/faces.js';
const key = (el, fn) => el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(e); } });
export function attachButton(tile, face, opts = {}) {
  let n = 0; face.tabIndex = 0; face.setAttribute('role', 'button');
  const press = () => { n += 1; tile.classList.add('is-pressed'); tile.style.setProperty('--ring', 0.85);
    setTimeout(() => { tile.classList.remove('is-pressed'); tile.style.setProperty('--ring', 0.14); }, 120); opts.onValue?.(n); };
  face.addEventListener('pointerdown', (e) => { if (e.button === 0 || e.pointerType !== 'mouse') press(); }); key(face, press);
  return { press };
}
export function attachToggle(face, opts = {}) {
  face.tabIndex = 0; face.setAttribute('role', 'switch');
  const set = (on) => { face.dataset.on = String(on); face.setAttribute('aria-checked', String(on)); opts.onValue?.(on); };
  const flip = () => set(face.dataset.on !== 'true');
  face.addEventListener('click', flip); key(face, flip); set(face.dataset.on === 'true'); return { set };
}
export function attachMultiState(face, slot, opts = {}) {
  const n = slot.control.states.length; let i = +face.dataset.active || 0;
  face.tabIndex = 0; face.setAttribute('role', 'button');
  const set = (k) => { i = ((k % n) + n) % n; setFaceValue(face, i); face.setAttribute('aria-label', `${slot.label}: ${slot.control.states[i].label}`); opts.onValue?.(slot.control.states[i].label); };
  const next = () => set(i + 1); face.addEventListener('click', next); key(face, next); set(i); return { set };
}
export function attachDpad(face, opts = {}) {
  face.tabIndex = 0; face.setAttribute('role', 'group');
  const set = (arm) => { face.dataset.active = arm; opts.onValue?.(arm ? arm[0].toUpperCase() + arm.slice(1) : ''); if (arm) setTimeout(() => { if (face.dataset.active === arm) face.dataset.active = ''; }, 250); };
  face.querySelectorAll('.face__arm').forEach((a) => a.addEventListener('pointerdown', (e) => { e.preventDefault(); set(a.dataset.arm); }));
  face.addEventListener('keydown', (e) => { const arm = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[e.key]; if (arm) { e.preventDefault(); set(arm); } });
  return { set };
}
export function attachStepper(face, slot, opts = {}) {
  const { min = 0, max = 100, step = 1 } = slot.control; let v = +face.querySelector('.face__value').textContent || min;
  const set = (nv) => { v = Math.min(max, Math.max(min, nv)); setFaceValue(face, v); face.setAttribute('aria-valuenow', v); opts.onValue?.(v); };
  face.tabIndex = 0; face.setAttribute('role', 'spinbutton'); face.setAttribute('aria-valuemin', min); face.setAttribute('aria-valuemax', max);
  face.querySelector('.face__step--dec').addEventListener('click', () => set(v - step)); face.querySelector('.face__step--inc').addEventListener('click', () => set(v + step));
  face.addEventListener('keydown', (e) => { const d = { ArrowUp: step, ArrowRight: step, ArrowDown: -step, ArrowLeft: -step, '+': step, '-': -step, PageUp: step * 10, PageDown: -step * 10 }[e.key]; if (d !== undefined) { e.preventDefault(); set(v + d); } else if (e.key === 'Home') set(min); else if (e.key === 'End') set(max); });
  set(v); return { set };
}
export function attachRadial(face, slot, opts = {}) {
  const wedges = [...face.querySelectorAll('.radial__wedge')], n = wedges.length; let active = +face.dataset.active || 0, hover = -1, open = false;
  face.tabIndex = 0; face.setAttribute('role', 'menu');
  const label = () => face.setAttribute('aria-label', `${slot.label}: ${slot.control.options[active].label}`);
  const paint = () => { wedges.forEach((w, i) => w.classList.toggle('is-hover', open && i === hover)); face.classList.toggle('is-open', open); };
  const commit = () => { if (hover >= 0) { active = hover; setFaceValue(face, active); label(); opts.onValue?.(slot.control.options[active].label); } open = false; hover = -1; paint(); };
  const wedgeAt = (e) => { const r = face.getBoundingClientRect(); const a = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI; return Math.floor((((a % 360) + 360) % 360) / (360 / n)); };
  let pointer = null;   // the drag is our own state; setPointerCapture is best-effort (it throws for a pointer the browser does not consider active)
  face.addEventListener('pointerdown', (e) => { if (e.button !== 0 && e.pointerType === 'mouse') return; pointer = e.pointerId; try { face.setPointerCapture(e.pointerId); } catch (err) { /* keep the drag alive without capture */ } open = true; hover = wedgeAt(e); paint(); e.preventDefault(); });
  face.addEventListener('pointermove', (e) => { if (open && pointer === e.pointerId) { hover = wedgeAt(e); paint(); } });
  const up = (e) => { if (pointer !== e.pointerId) return; pointer = null; try { face.releasePointerCapture(e.pointerId); } catch (err) { /* never captured */ } commit(); };
  face.addEventListener('pointerup', up); face.addEventListener('pointercancel', up);
  face.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!open) { open = true; hover = active; paint(); } else commit(); }
    else if (e.key === 'Escape' && open) { open = false; hover = -1; paint(); }
    else if (open && (e.key === 'ArrowRight' || e.key === 'ArrowDown')) { e.preventDefault(); hover = (hover + 1) % n; paint(); }
    else if (open && (e.key === 'ArrowLeft' || e.key === 'ArrowUp')) { e.preventDefault(); hover = (hover - 1 + n) % n; paint(); }
  });
  label(); return { set: (i) => { active = i; setFaceValue(face, i); label(); } };
}
export function attachTextField(face, slot, opts = {}) {
  const span = face.querySelector('.face__text'); const input = document.createElement('input');
  input.type = 'text'; input.placeholder = slot.control.placeholder || ''; input.setAttribute('aria-label', `${slot.label}: text field`); input.maxLength = 40;
  span.replaceWith(input); face.dataset.empty = 'true';
  input.addEventListener('input', () => { face.dataset.empty = String(!input.value); opts.onValue?.(input.value); });
  return { set: (v) => { input.value = v; face.dataset.empty = String(!v); } };
}
