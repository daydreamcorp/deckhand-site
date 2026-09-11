// assets/js/engine/anchors.js
import { headerH, isReduced } from './scroll.js';

export function targetY(el) {
  return Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - headerH()));
}

export function goTo(id, { instant = false, push = false } = {}) {
  const el = document.getElementById(id);
  if (!el) return false;
  window.scrollTo({ top: targetY(el), behavior: instant || isReduced() ? 'auto' : 'smooth' });   // 'auto' is instant: CSS is scroll-behavior:auto
  if (push && location.hash !== '#' + id) history.pushState(null, '', '#' + id);
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });                               // sequential-focus start point, like a native anchor jump
  return true;
}

export function landOnHash({ instant = true } = {}) {
  let id = '';
  try { id = decodeURIComponent(location.hash.slice(1)); } catch (e) { return; }   // a malformed hash is not ours to fix
  if (id) goTo(id, { instant });
}

export function installAnchors() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const id = a.getAttribute('href').slice(1);
    if (!id || !document.getElementById(id)) return;                // unknown targets stay native
    e.preventDefault();
    goTo(id, { push: true });
  });
  window.addEventListener('hashchange', () => landOnHash({ instant: false }));   // URL edited, Back/Forward, or the app re-opens a tab
}
