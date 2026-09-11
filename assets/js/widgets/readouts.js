import { idle } from './idle.js';
import { setFaceValue } from '../deck/faces.js';
export function startGauge(face, out) {
  face.setAttribute('role', 'img'); face.setAttribute('aria-label', 'Gauge: CPU Load, 62%'); out.textContent = '62%';
  return idle(face, (tl) => tl.fromTo(face, { '--v': 0.58 }, { '--v': 0.66, duration: 4 }));
}
export function startSparkline(face, out) {
  face.setAttribute('role', 'img'); face.setAttribute('aria-label', 'Sparkline: CPU History');
  const samples = [0.35, 0.55, 0.30, 0.68, 0.48, 0.80]; let last = 0.8;
  const push = () => { last = Math.min(1, Math.max(0, last + (Math.random() - 0.5) * 0.3)); samples.push(last); if (samples.length > 40) samples.shift(); setFaceValue(face, samples); out.textContent = `${Math.round(last * 100)}%`; };
  out.textContent = '80%';
  const tl = idle(face, (t) => t.to({}, { duration: 0.7 }));
  if (tl) tl.eventCallback('onRepeat', push);
  return tl;
}
