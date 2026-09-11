import { createChapter, gsap } from '../engine/scroll.js';
const section = document.getElementById('testers');
const open = document.getElementById('testers-open');
if (open) createChapter({
  scope: open, lengthVh: 240, scrub: 0.7,
  build(tl, ctx) {
    if (ctx.reduced) return;
    const spans = ctx.qa('.beat'), nums = ctx.qa('.numeral__n');
    const tin = [0.5, 3.2, 6.2], tout = [3.0, 6.0, null];
    spans.forEach((s, i) => { tl.fromTo(s, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4 }, tin[i]); if (tout[i]) tl.to(s, { opacity: 0, y: -16, duration: 0.4 }, tout[i]); });
    nums.forEach((n, i) => { tl.fromTo(n, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.4 }, tin[i]); if (tout[i]) tl.to(n, { opacity: 0, scale: 1.04, duration: 0.4 }, tout[i]); });
    tl.to({}, { duration: 0.01 }, 10);
  },
});
if (section) createChapter({
  scope: section, pin: false,
  build(tl, ctx) {
    if (ctx.reduced) return;
    // M9 — scroll is the calendar (resting: all fourteen filled)
    const strip = section.querySelector('.streak-days'), cells = [...strip.querySelectorAll('li')];
    const s = gsap.timeline({ scrollTrigger: { trigger: strip, start: 'top 85%', end: 'bottom 45%', scrub: 0.5 } });
    cells.forEach((c, k) => {
      s.fromTo(c, { '--fill': 0 }, { '--fill': 1, duration: 1 / 15, ease: 'none' }, k / 15);
      if (c.classList.contains('is-mark')) s.fromTo(c, { scale: 0.6, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 1 / 15, ease: 'back.out(2)' }, k / 15);
    });
    // M10 — progress as scroll (resting: the honest mid-day card; motion ends at 100/100)
    const card = section.querySelector('.quest-card'), rows = [...card.querySelectorAll('.quest-list li')];
    const bar = card.querySelector('.quest-bar span'), score = card.querySelector('.quest-score').firstChild, counter = { n: 45 };
    const q = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 85%', end: 'bottom 45%', scrub: 0.5 } });
    q.to(counter, { n: 100, duration: 1, ease: 'none', onUpdate: () => { score.textContent = String(Math.round(counter.n)); } }, 0);
    q.to(bar, { scaleX: 100 / 45, duration: 1, ease: 'none' }, 0);
    q.fromTo(rows[3], { '--done': 0 }, { '--done': 1, duration: 0.05 }, 0.62);
    q.fromTo(rows[4], { '--done': 0 }, { '--done': 1, duration: 0.05 }, 0.80);
  },
});

