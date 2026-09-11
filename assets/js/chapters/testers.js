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
// Task 18 appends the streak and quest scrubs below this line.
