// assets/js/engine/split.js
import { gsap } from './scroll.js';
const SplitText = window.SplitText;

/** Masked line reveal for `el`, added to `tl` at `label` (the label must already exist). Only call in the motion branch. */
export function headlineReveal(tl, el, label, { stagger = 0.08, duration = 0.7 } = {}) {
  return SplitText.create(el, {
    type: 'lines', mask: 'lines', linesClass: 'line', aria: 'auto', autoSplit: true,
    onSplit(self) { return tl.from(self.lines, { yPercent: 110, duration, stagger, ease: 'power4.out' }, label); },
  });
}
