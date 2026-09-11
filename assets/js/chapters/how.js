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

function buildDesign(tl, ctx) { /* Task 10 */ }
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
