import { gsap, ScrollTrigger, isReduced } from '../engine/scroll.js';
const loops = new Set();
/** make(tl) may only add transform/opacity/--ring tweens. Returns null under reduced motion. */
export function idle(el, make) {
  if (isReduced()) return null;
  const tl = gsap.timeline({ repeat: -1, yoyo: true, paused: true, defaults: { ease: 'sine.inOut' } });
  make(tl);
  const st = ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: (self) => tl.paused(!self.isActive || document.hidden) });
  tl.__st = st; loops.add(tl);
  return tl;
}
document.addEventListener('visibilitychange', () => loops.forEach((tl) => tl.paused(document.hidden || !tl.__st.isActive)));
export function stopIdle(tl) { if (!tl) return; tl.__st.kill(); tl.kill(); loops.delete(tl); }
