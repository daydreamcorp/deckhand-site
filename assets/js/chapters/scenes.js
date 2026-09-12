import { createChapter, gsap } from '../engine/scroll.js';
const section = document.getElementById('screenshots');
const scope = section && section.querySelector('.pin');
if (scope) createChapter({
  scope, lengthVh: 260, scrub: 0.8,
  build(tl, ctx) {
    if (ctx.reduced) return;
    const cards = ctx.qa('.scene'), stack = ctx.q('.scenes-stack'); ctx.promote(cards);   // the hue wash is tweened on the stack, never on the section (B §4)
    cards.forEach((card, n) => {
      const t = 2.5 * n - 0.6;
      if (n > 0) {
        // start fully below the stage's clipped bottom edge, whatever the viewport height (re-evaluated on refresh)
        tl.fromTo(card, { yPercent: () => 50 * (ctx.stage.offsetHeight / card.offsetHeight + 1) + 4 }, { yPercent: 0, duration: 1.2, ease: 'power2.out' }, t);
        tl.to(stack, { '--scene-hue': +card.style.getPropertyValue('--scene-hue'), duration: 0.8, ease: 'none' }, t);
      }
      if (n < cards.length - 1) {
        // immediateRender: false — a fromTo renders its from-state at build, and this one's yPercent: 0 would overwrite the
        // entering tween's off-stage start above, leaving cards 1–2 stacked on top of card 0 until their entry time
        tl.fromTo(card, { scale: 1, opacity: 1, yPercent: 0 }, { scale: 0.92, opacity: 0.55, yPercent: -4, duration: 1.2, ease: 'power2.out', immediateRender: false }, 2.5 * (n + 1) - 0.6);
        tl.fromTo(card.querySelector('figcaption'), { opacity: 1 }, { opacity: 0, duration: 0.5, immediateRender: false }, 2.5 * (n + 1) - 0.6);   // only the phone recedes; its caption would poke out under the next card
      }
    });
    tl.to({}, { duration: 0.01 }, 10);
  },
});
