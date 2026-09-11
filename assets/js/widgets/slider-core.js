// assets/js/widgets/slider-core.js — shared by every slider-role widget
export function sliderCore(el, { min = 0, max = 100, step = 1, onValue }) {
  const clamp = (v) => Math.min(max, Math.max(min, Math.round(v / step) * step));
  let value = +el.getAttribute('aria-valuenow') || min;
  const set = (v) => { value = clamp(v); el.style.setProperty('--v', (value - min) / (max - min)); el.setAttribute('aria-valuenow', value); onValue?.(value); };
  el.addEventListener('keydown', (e) => {
    const big = (max - min) / 10;
    const d = { ArrowUp: step, ArrowRight: step, ArrowDown: -step, ArrowLeft: -step, PageUp: big, PageDown: -big }[e.key];
    if (d !== undefined) { e.preventDefault(); set(value + d); }
    else if (e.key === 'Home') { e.preventDefault(); set(min); }
    else if (e.key === 'End') { e.preventDefault(); set(max); }
  });
  set(value);
  return { get value() { return value; }, set, min, max };
}
