import { createChapter, gsap } from '../engine/scroll.js';
const section = document.getElementById('pricing');
const table = section && section.querySelector('.price-table');
if (table) {
  let current = -1;
  const paint = (i) => { if (i === current) return; current = i; table.querySelectorAll('tr').forEach((tr) => [...tr.children].forEach((cell, k) => cell.classList.toggle('is-col', k === i && i > 0))); };
  table.addEventListener('mouseover', (e) => { const cell = e.target.closest('td, th'); if (cell) paint(cell.cellIndex); });
  table.addEventListener('mouseleave', () => paint(-1));
}
if (section) createChapter({
  scope: section, pin: false,
  build(tl, ctx) {
    if (ctx.reduced || !table) return;
    const cols = [...table.querySelector('thead tr').children].map((_, i) => [...table.querySelectorAll('tr')].map((tr) => tr.children[i]).filter(Boolean));
    const rise = gsap.timeline({ scrollTrigger: { trigger: table, start: 'top 80%', toggleActions: 'play none none none', once: true } });
    cols.forEach((cells, i) => rise.from(cells, { y: 20, opacity: 0, duration: 0.5, ease: 'power3.out' }, i * 0.06));
  },
});
