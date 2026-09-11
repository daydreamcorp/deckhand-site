// assets/js/engine/scroll.js — native scroll only; GSAP is the single engine.
const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger, window.SplitText, window.Flip, window.DrawSVGPlugin);

const params = new URLSearchParams(location.search);
export const IS_DEV = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
export const FORCE_REDUCED = IS_DEV && params.get('rm') === '1';       // B §11 (f); never true in production

// Pins need at least 560 CSS px of viewport height: text zoom 200% and landscape phones fall to the resting layout.
export const Q = {
  motion:   FORCE_REDUCED ? 'not all' : '(prefers-reduced-motion: no-preference) and (min-height: 560px)',
  reduce:   FORCE_REDUCED ? 'all'     : '(prefers-reduced-motion: reduce), (max-height: 559.99px)',
  narrow:   '(max-width: 900px)',
  portrait: '(orientation: portrait)',
};
export const headerH = () => document.querySelector('.site-header').offsetHeight;   // live: rem-based, grows with text zoom
export const isReduced = () => FORCE_REDUCED || window.matchMedia(Q.reduce).matches;

ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });
ScrollTrigger.clearScrollMemory('manual');                       // history.scrollRestoration = 'manual'
ScrollTrigger.defaults({ markers: IS_DEV && params.get('markers') === '1' });

export const mm = gsap.matchMedia();
const chapters = [];

/**
 * createChapter({ scope, stage?, lengthVh?, build, scrub?, pin?, reset?, rebuildOnRefresh? })
 *  - scope: the element that reserves the scroll length (a `.pin` wrapper with an inline `--len`), or any element for pin:false
 *  - stage: defaults to scope.querySelector('.chapter__stage')
 *  - lengthVh: must equal the inline `--len` on scope (CSS reserves the length; pinSpacing is off so nothing shifts)
 *  - build(tl, ctx): adds tweens to tl. Rules: start with `if (ctx.reduced) return;` unless the chapter's motion end frame
 *      differs from rest (M10) — then create only `to` tweens after the guard; every tween is fromTo()/from() with explicit values;
 *      viewport-dependent numbers are functions (re-evaluated by invalidateOnRefresh); every .call() is idempotent.
 *  - pin: false for unpinned chapters (hero, controls, streak/quests, pricing) — build creates its own ScrollTriggers, which the
 *      matchMedia context records and reverts.
 *  - reset(ctx): required when rebuildOnRefresh is true; restores DOM classes and clears inline styles (B §6).
 */
export function createChapter(opts) {
  const { scope, build, scrub = 0.7, pin = true, reset = null, rebuildOnRefresh = false } = opts;
  const stage = opts.stage || scope.querySelector('.chapter__stage');
  const lengthVh = opts.lengthVh ?? 0;
  if (pin) {
    const cssLen = parseFloat(getComputedStyle(scope).getPropertyValue('--len'));
    if (cssLen !== lengthVh) console.warn(`[chapter ${scope.id || scope.className}] --len ${cssLen} != lengthVh ${lengthVh}`);
  }
  const rec = { scope, stage, lengthVh, build, scrub, pin, reset, rebuildOnRefresh, tl: null, st: null, ctx: null };
  chapters.push(rec);
  return rec;
}

function makeCtx(rec, flags) {
  const ctx = {
    ...flags, scope: rec.scope, stage: rec.stage, headerH, tl: null, promoted: [], cleanups: [],
    q:  (sel) => (rec.stage && rec.stage.querySelector(sel)) || rec.scope.querySelector(sel),
    qa: (sel) => gsap.utils.toArray(sel, rec.stage || rec.scope),
    promote(els) { ctx.promoted.push(...gsap.utils.toArray(els)); if (ctx.promoted.length > 40) console.warn(`[chapter ${rec.scope.id}] >40 promoted layers`); },
  };
  return ctx;
}

function buildMotion(rec, flags) {
  const ctx = makeCtx(rec, { reduced: false, ...flags });
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: rec.pin ? {
      trigger: rec.scope,
      pin: rec.stage,
      pinSpacing: false,                                           // CSS reserves the length: no spacer insertion, no CLS
      start: () => `top top+=${headerH()}`,                        // stage top meets the header's bottom edge
      end:   () => `+=${rec.scope.offsetHeight - rec.stage.offsetHeight}`,   // unpins when the scope bottom reaches the stage bottom
      scrub: rec.scrub, anticipatePin: 1, invalidateOnRefresh: true,
      onToggle: (self) => ctx.promoted.length && gsap.set(ctx.promoted, self.isActive ? { willChange: 'transform' } : { clearProps: 'willChange' }),
    } : undefined,
  });
  rec.tl = tl; rec.st = tl.scrollTrigger || null; rec.ctx = ctx; ctx.tl = tl;
  safeBuild(rec, tl, ctx);
}

function safeBuild(rec, tl, ctx) {                                 // one broken chapter must not stop the others from building
  try { rec.build(tl, ctx); } catch (e) { console.error(`[chapter ${rec.scope.id || rec.scope.className}]`, e); }
}

function buildStatic(rec) {
  const ctx = makeCtx(rec, { reduced: true, narrow: matchMedia(Q.narrow).matches, portrait: matchMedia(Q.portrait).matches });
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  rec.tl = tl; rec.st = null; rec.ctx = ctx; ctx.tl = tl;
  safeBuild(rec, tl, ctx);                                         // builds guard on ctx.reduced, so this is normally a no-op
  tl.progress(1);
}

function rebuild(rec) {
  if (!rec.tl || !rec.st) return;
  rec.reset(rec.ctx);
  rec.tl.clear();
  safeBuild(rec, rec.tl, rec.ctx);
  rec.tl.totalProgress(rec.st.progress);
}

function teardown() {
  chapters.forEach((rec) => { rec.ctx && rec.ctx.cleanups.forEach((fn) => fn()); rec.tl = rec.st = rec.ctx = null; });
}

export function mount() {
  mm.add({ motion: Q.motion, narrow: Q.narrow, portrait: Q.portrait }, (context) => {
    const { motion, narrow, portrait } = context.conditions;
    if (!motion) return;
    document.documentElement.classList.add('js-motion');           // enables the reserved chapter heights (B §3)
    chapters.forEach((rec) => buildMotion(rec, { narrow, portrait }));
    const onRefresh = () => chapters.forEach((rec) => rec.rebuildOnRefresh && context.add(() => rebuild(rec)));
    ScrollTrigger.addEventListener('refresh', onRefresh);
    return () => {                                                 // any condition change reverts the context first, then this runs
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      document.documentElement.classList.remove('js-motion');
      teardown();
    };
  });
  mm.add(Q.reduce, () => { chapters.forEach(buildStatic); return () => teardown(); });
}

export function installRefreshPolicy() {
  let lastH = 0;
  const ro = new ResizeObserver(() => {                            // deck render, image decode, <details>, banner re-wrap, late fonts
    const h = document.body.offsetHeight;
    if (ScrollTrigger.isRefreshing || h === lastH) return;
    lastH = h;
    ScrollTrigger.refresh(true);                                   // debounced 200 ms; waits for scrollEnd
  });
  ro.observe(document.body);
  document.querySelectorAll('details').forEach((d) => d.addEventListener('toggle', () => ScrollTrigger.refresh(true)));
  document.fonts.addEventListener('loadingdone', () => ScrollTrigger.refresh(true));
  window.addEventListener('pageshow', (e) => { if (e.persisted) ScrollTrigger.refresh(); });   // bfcache restore
}

export { gsap, ScrollTrigger };
