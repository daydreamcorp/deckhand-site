import { createChapter, gsap } from '../engine/scroll.js';
import { handles } from '../deck/render.js';
const section = document.getElementById('beyond');
const scope = section && section.querySelector('.pin');
if (scope) createChapter({
  scope, lengthVh: 240, scrub: 0.7,
  build(tl, ctx) {
    if (ctx.reduced) return;
    const obs = handles.get('beyond-obs'), home = handles.get('beyond-home');
    const phone = ctx.q('#beyond-phone'), dot = ctx.q('.geo__dot'), ring = ctx.q('.geo__ring'), beats = ctx.qa('.beats li');
    ctx.promote([phone, ctx.q('.geo')]);
    // captions in thirds
    const tin = [0, 3.4, 6.7], tout = [3.2, 6.5, null];
    beats.forEach((b, i) => { tl.fromTo(b, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3 }, tin[i]); if (tout[i]) tl.to(b, { opacity: 0, y: -12, duration: 0.3 }, tout[i]); });
    // beat 1 — geofence: the dot follows the path, the ring fills, Home Hub gives way to the OBS deck
    tl.set(dot, { attr: { cx: 20, cy: 300 } }, 0);                 // the markup rests at the ring; the film starts the dot at the path's beginning
    tl.to(dot, { keyframes: { '0%': { attr: { cx: 20, cy: 300 } }, '40%': { attr: { cx: 75, cy: 236 } }, '75%': { attr: { cx: 130, cy: 168 } }, '100%': { attr: { cx: 200, cy: 160 } } }, duration: 2.3, ease: 'power1.inOut' }, 0.3);
    tl.fromTo(ring, { scale: 0.9, opacity: 0.3 }, { scale: 1, opacity: 1, duration: 0.4 }, 2.2);
    tl.fromTo(home.root, { opacity: 1 }, { opacity: 0, duration: 0.4 }, 2.2);
    tl.fromTo(obs.root, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 2.2);
    // beat 2 — shake, then the Clip tile fires
    tl.to(phone, { keyframes: { rotation: [0, 2.5, -2.5, 1.5, 0] }, duration: 0.8, ease: 'none' }, 4.0);
    tl.call(() => obs.press('slot-clip'), null, 5.0);
    // beat 3 — macro: four tiles light in sequence. The resting markup is already lit (is-lit, data-on, data-empty="false");
    // the film writes the same numeric properties inline from 0, which overrides the classes and is removed on context revert (B §4).
    const ids = ['slot-scenes', 'slot-mute', 'slot-live', 'slot-chat'];
    const tiles = ids.map((id) => obs.tiles.get(id).el);
    const live = obs.tiles.get('slot-live').face, chat = obs.tiles.get('slot-chat').face;
    tiles.forEach((t, i) => tl.fromTo(t, { '--lit': 0 }, { '--lit': 1, duration: 0.2 }, 7.0 + 0.6 * i));
    tl.fromTo(live, { '--on': 0 }, { '--on': 1, duration: 0.1 }, 8.2);
    tl.fromTo(chat, { '--typed': 0 }, { '--typed': 1, duration: 0.1 }, 8.8);
    tl.to({}, { duration: 0.01 }, 10);
  },
});
