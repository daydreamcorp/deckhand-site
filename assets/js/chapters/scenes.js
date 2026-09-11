import { createChapter, gsap } from '../engine/scroll.js';
const section = document.getElementById('screenshots');
const scope = section && section.querySelector('.pin');
if (scope) createChapter({
  scope, lengthVh: 260, scrub: 0.8,
  build(tl, ctx) {
    if (ctx.reduced) return;
    const cards = ctx.qa('.scene'); ctx.promote(cards);
    cards.forEach((card, n) => {
      const t = 2.5 * n - 0.6;
      if (n > 0) {
        tl.fromTo(card, { yPercent: 100 }, { yPercent: 0, duration: 1.2, ease: 'power2.out' }, t);
        tl.to(section, { '--scene-hue': +card.style.getPropertyValue('--scene-hue'), duration: 0.8, ease: 'none' }, t);
      }
      if (n < cards.length - 1) tl.fromTo(card, { scale: 1, opacity: 1, yPercent: 0 }, { scale: 0.92, opacity: 0.55, yPercent: -4, duration: 1.2, ease: 'power2.out' }, 2.5 * (n + 1) - 0.6);
    });
    tl.to({}, { duration: 0.01 }, 10);
  },
});
