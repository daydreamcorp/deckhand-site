import { createChapter, gsap } from '../engine/scroll.js';
import { headlineReveal } from '../engine/split.js';
import { handles } from '../deck/render.js';
const section = document.getElementById('top');
if (section) createChapter({
  scope: section, pin: false,
  build(tl, ctx) {
    if (ctx.reduced) return;                                     // resting frame is the assembled deck + visible headline
    const deck = handles.get('hero-phone');
    const tiles = deck ? [...deck.root.querySelectorAll('.tile')] : [];
    // Ignition: reading order, 90 ms apart; the ring flashes then cools (the app's keyLightCool).
    const ign = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 });
    ign.from(tiles, { opacity: 0, scale: 0.92, duration: 0.26, stagger: 0.09, overwrite: 'auto' }, 0)
       .fromTo(tiles, { '--lit': 1 }, { '--lit': 0, duration: 0.24, stagger: 0.09, ease: 'power2.out', onComplete: () => gsap.set(tiles, { clearProps: '--lit' }) }, 0.08);   // ring .85→.14 and glow fade, then the inline value is removed so classes own --lit again
    // Headline: masked line reveal (B §5).
    const head = gsap.timeline({ delay: 0.1 }); head.addLabel('go', 0);
    headlineReveal(head, section.querySelector('h1'), 'go');
    // Parallax on scroll, not pinned (the context records these triggers).
    const st = { trigger: section, start: 'top top', end: 'bottom top', scrub: 0.6 };
    gsap.to(section.querySelector('.art-field__layer'), { yPercent: -10, ease: 'none', scrollTrigger: st });
    gsap.to(section.querySelector('#hero-phone'), { yPercent: -6, ease: 'none', scrollTrigger: { ...st } });
  },
});
