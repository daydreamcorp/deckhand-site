import { createChapter, gsap, ScrollTrigger } from '../engine/scroll.js';
import { handles } from '../deck/render.js';
const section = document.getElementById('how');
const scope = section && section.querySelector('.pin');
export const T = { pairEnd: 3, designEnd: 6.6, end: 10 };

const offsetIn = (el, root) => { let x = 0, y = 0; for (let n = el; n && n !== root; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; } return { x, y }; };

function acts(tl, ctx) {
  const [a0, a1, a2] = ctx.qa('.act');
  tl.fromTo(a1, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3 }, T.pairEnd).to(a0, { opacity: 0, y: -12, duration: 0.3 }, T.pairEnd);
  tl.fromTo(a2, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3 }, T.designEnd).to(a1, { opacity: 0, y: -12, duration: 0.3 }, T.designEnd);
  tl.fromTo(a1, { opacity: 0 }, { opacity: 0, duration: 0.01 }, 0);   // hold act 2 hidden at the start (immediateRender)
  tl.fromTo(a2, { opacity: 0 }, { opacity: 0, duration: 0.01 }, 0);
}

function buildPair(tl, ctx) {
  const win = ctx.q('.desk'), pair = ctx.q('.win__pair'), paired = ctx.q('.win__paired');
  const pairing = ctx.q('.pairing'), verify = ctx.q('.pairing__status--verify'), ok = ctx.q('.pairing__status--ok');
  const wifi = ctx.deck.root.querySelector('.deck__wifi');
  ctx.promote([win, pairing]);
  tl.fromTo(win, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }, 0);
  tl.fromTo(paired, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 2.4);
  // beam (B §7)
  const reveal = ctx.q('.beam__reveal'), dash = ctx.q('.beam__dash'), phone = ctx.q('#how-phone');
  const recompute = () => {
    const a = offsetIn(win, ctx.stage), b = offsetIn(phone, ctx.stage);
    const d = ctx.narrow
      ? `M${a.x + win.offsetWidth / 2} ${a.y} C ${a.x + win.offsetWidth / 2} ${a.y - 80}, ${b.x + phone.offsetWidth / 2} ${b.y + phone.offsetHeight + 80}, ${b.x + phone.offsetWidth / 2} ${b.y + phone.offsetHeight}`
      : (() => { const x1 = a.x + win.offsetWidth, y1 = a.y + win.offsetHeight * 0.5, x2 = b.x, y2 = b.y + phone.offsetHeight * 0.32;
          return `M${x1} ${y1} C ${x1 + (x2 - x1) * 0.45} ${y1}, ${x2 - (x2 - x1) * 0.45} ${y2}, ${x2} ${y2}`; })();
    reveal.setAttribute('d', d); dash.setAttribute('d', d);
  };
  recompute();
  tl.fromTo(reveal, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.2, ease: 'none' }, 0.6);
  ScrollTrigger.addEventListener('refreshInit', recompute);
  ctx.cleanups.push(() => ScrollTrigger.removeEventListener('refreshInit', recompute));
  // phone: pairing screen → statuses → deck
  tl.fromTo(pairing, { opacity: 1 }, { opacity: 0, duration: 0.3 }, 2.0);
  tl.fromTo(verify, { opacity: 0 }, { opacity: 1, duration: 0.15 }, 1.4).to(verify, { opacity: 0, duration: 0.1 }, 2.0);
  tl.fromTo(ok, { opacity: 0 }, { opacity: 1, duration: 0.1 }, 2.0);
  tl.fromTo(wifi, { opacity: 0.45 }, { opacity: 1, duration: 0.2 }, 2.4);
  tl.fromTo(wifi, { opacity: 0.45 }, { opacity: 0.45, duration: 0.01 }, 0);   // wifi dim while unpaired
}

const SAKURA = { '--dk-accent': '#FF9FCB', '--dk-face': '#251C3E', '--dk-pressed': '#8A4A74', '--dk-text': '#FDEFF7', '--dk-bg': '#110F22' };
const MIDNIGHT = { '--dk-accent': '#00E5FF', '--dk-face': '#1B1E33', '--dk-pressed': '#2E3566', '--dk-text': '#ECECFF', '--dk-bg': '#0D0F1A' };
function buildDesign(tl, ctx) {
  const Flip = window.Flip, deck = ctx.deck, d0 = T.pairEnd;
  const a = deck.tiles.get('slot-clip').el, b = deck.tiles.get('slot-mute').el;
  const cursor = ctx.q('.cursor'), chip = ctx.q('.skinchip');
  ctx.promote([a, b, cursor]);
  // --- by hand: cursor travels to the Clip tile, then to Mute's cell, and the two swap (B §6)
  const rel = (el) => { const o = offsetIn(el, ctx.stage); return { x: o.x + el.offsetWidth / 2, y: o.y + el.offsetHeight / 2 }; };
  const pa = () => rel(b), pb = () => rel(a);                       // resting layout is swapped: b sits where Clip started
  tl.fromTo(cursor, { opacity: 0, x: () => pa().x - 60, y: () => pa().y + 40 }, { opacity: 1, x: () => pa().x, y: () => pa().y, duration: 0.4, ease: 'power2.out' }, d0 + 0.0);
  tl.to(cursor, { x: () => pb().x, y: () => pb().y, duration: 0.5, ease: 'power2.inOut' }, d0 + 0.6);
  tl.to(cursor, { opacity: 0, duration: 0.2 }, d0 + 1.3);
  const swap = () => { const ca = a.style.getPropertyValue('--c'), ra = a.style.getPropertyValue('--r');
    a.style.setProperty('--c', b.style.getPropertyValue('--c')); a.style.setProperty('--r', b.style.getPropertyValue('--r')); b.style.setProperty('--c', ca); b.style.setProperty('--r', ra); };
  swap(); const state = Flip.getState([a, b], { simple: true }); swap();
  tl.add(Flip.from(state, { duration: 0.5, ease: 'power2.inOut', scale: true, simple: true, absolute: false, nested: false }), d0 + 0.6);
  // label " it" reveals
  const label = a.querySelector('.keycap__label');
  if (!label.querySelector('.lbl-more')) label.innerHTML = 'Clip<span class="lbl-more"> it</span>';
  tl.fromTo(label.querySelector('.lbl-more'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, d0 + 1.2);
  // skin: Sakura Storm and back
  let overlay = deck.root.querySelector('.deck__skin');
  if (!overlay) { overlay = document.createElement('div'); overlay.className = 'deck__skin'; deck.root.prepend(overlay); }
  tl.to(deck.root, { ...SAKURA, duration: 0.3 }, d0 + 1.6).fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 }, d0 + 1.6);
  tl.fromTo(chip, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.2 }, d0 + 1.6).to(chip, { opacity: 0, duration: 0.2 }, d0 + 2.4);
  tl.to(deck.root, { ...MIDNIGHT, duration: 0.3 }, d0 + 2.3).to(overlay, { opacity: 0, duration: 0.3 }, d0 + 2.3);
  // --- describe (the AI Studio beat) — delete from here to the end of the function to omit it (D10)
  const sheet = ctx.q('.sheet'), prompt = ctx.q('.sheet__prompt'), go = ctx.q('.sheet__go');
  const stages = ctx.qa('.sheet__stages li'), working = ctx.q('.sheet__working'), result = ctx.q('.sheet__result'), rtiles = ctx.qa('.sheet__tiles span');
  ctx.promote([sheet]);
  if (!prompt.querySelector('span')) prompt.innerHTML = [...prompt.textContent].map((ch) => `<span>${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
  const chars = prompt.querySelectorAll('span');
  tl.fromTo(sheet, { y: '100%' }, { y: 0, duration: 0.2, ease: 'power3.out' }, d0 + 2.6);   // y, not yPercent: the CSS resting transform is translateY(100%), which GSAP reads as a pixel y that yPercent would stack on top of
  tl.fromTo(chars, { opacity: 0 }, { opacity: 1, duration: 0.02, stagger: 0.007 }, d0 + 2.8);
  tl.fromTo(go, { scale: 1 }, { scale: 0.94, duration: 0.03, yoyo: true, repeat: 1 }, d0 + 3.0);
  stages.forEach((li, i) => tl.fromTo(li, { '--done': 0 }, { '--done': 1, duration: 0.03 }, d0 + 3.02 + 0.04 * i));
  tl.fromTo(working, { opacity: 0 }, { opacity: 1, duration: 0.03 }, d0 + 3.14);
  tl.fromTo(result, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.05 }, d0 + 3.2);
  tl.fromTo(rtiles, { opacity: 0, scale: 0.92 }, { opacity: (i, el) => el.classList.contains('is-ghost') ? 0.45 : 1, scale: 1, duration: 0.04, stagger: 0.03, ease: 'power3.out' }, d0 + 3.22);
  tl.to(sheet, { y: '100%', duration: 0.1, ease: 'power3.in' }, d0 + 3.5);
  tl.fromTo(result, { opacity: 0 }, { opacity: 0, duration: 0.01 }, 0);     // hold hidden at the start
  tl.fromTo(working, { opacity: 0 }, { opacity: 0, duration: 0.01 }, 0);
}
function buildPress(tl, ctx) { /* Task 11 */ }

function reset(ctx) {
  const deck = ctx.deck; if (!deck) return;
  gsap.set(ctx.qa('.act, .desk, .win__pair, .win__paired, .win__log li, .pairing, .pairing__status, .beam__reveal, .cursor, .skinchip, .sheet, .sheet__stages li, .sheet__prompt span, .sheet__result, .sheet__tiles span, .strip__track, .card, .deck__wifi, .lbl-more, .deck__skin'), { clearProps: 'all' });
  ctx.qa('.sheet__stages li').forEach((li) => li.classList.remove('is-done'));
  deck.tiles.forEach((t) => { t.el.classList.remove('is-pressed', 'is-lit'); gsap.set(t.el, { clearProps: 'transform,opacity' }); });
  // restore the swapped resting layout from the document
  const pos = new Map(deck.doc.pages[0].slots.map((s) => [s.id, { r: s.row + 1, c: s.col + 1 }]));
  const a = pos.get('slot-clip'), b = pos.get('slot-mute'); pos.set('slot-clip', b); pos.set('slot-mute', a);
  deck.tiles.forEach((t, id) => { const p = pos.get(id); t.el.style.setProperty('--c', p.c); t.el.style.setProperty('--r', p.r); });
  gsap.set(ctx.qa('.face, .tile'), { clearProps: '--on,--lit,--typed' });      // never clear --v here: the demo values live in it; setValue restores the one tweened fader
  deck.setValue('slot-scenes', 0); deck.setValue('slot-music', -60); deck.setValue('slot-lights', 'on'); deck.setValue('slot-live', false);
}

if (scope) createChapter({
  scope, lengthVh: 720, scrub: 0.7, rebuildOnRefresh: true, reset,
  build(tl, ctx) {
    if (ctx.reduced) return;
    ctx.deck = handles.get('how-phone');
    tl.addLabel('pair', 0).addLabel('design', T.pairEnd).addLabel('press', T.designEnd);
    acts(tl, ctx); buildPair(tl, ctx); buildDesign(tl, ctx); buildPress(tl, ctx);
    tl.to({}, { duration: 0.01 }, T.end);                        // pins the timeline length at 10 units
  },
});
