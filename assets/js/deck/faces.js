// Faces for the 14 control types. Measurements follow the app's ControlTileContent.kt (plan A.6).
const SVG = 'http://www.w3.org/2000/svg';
const ICON_FILE = { textFields: 'text_fields', playArrow: 'play_arrow', power: 'power_settings_new', volumeUp: 'volume_up' };
export function iconUse(name) {
  if (!name || name === 'none') return null;
  const svg = document.createElementNS(SVG, 'svg'); svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(SVG, 'use'); use.setAttribute('href', `assets/icons/sprite.svg#${ICON_FILE[name] || name}`);
  svg.appendChild(use); return svg;
}
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const svgEl = (tag, attrs) => { const e = document.createElementNS(SVG, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const clamp01 = (n) => Math.min(1, Math.max(0, n));
export const range = (slot) => {
  const c = slot.control;
  if (c.control === 'stepper' || c.control === 'gauge') return { min: c.min ?? 0, max: c.max ?? 100 };
  const v = c.value || {}; return { min: v.min ?? 0, max: v.max ?? 100 };
};
const frac = (slot, value) => { const { min, max } = range(slot); return clamp01((value - min) / (max - min || 1)); };
export function formatReadout(slot, value) {
  const c = slot.control, unit = (c.value && c.value.unit) || '';
  if (c.control === 'fader' && c.value && c.value.kind === 'obsAudioLevel') return `${Number(value).toFixed(1)}dB`;
  if (c.control === 'fader' || c.control === 'gauge') return `${Math.round(value)}${unit}`;
  return String(value);
}
function wedgePath(i, n, r = 46, cx = 50, cy = 50) {   // wedge i of n, clockwise from 12 o'clock, in a 100×100 box
  const a0 = (-90 + (360 / n) * i) * Math.PI / 180, a1 = (-90 + (360 / n) * (i + 1)) * Math.PI / 180;
  const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
  return `M${cx} ${cy} L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${360 / n > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
}
const dialSvg = () => {
  const svg = svgEl('svg', { viewBox: '0 0 100 100', class: 'dial' });
  svg.appendChild(svgEl('circle', { class: 'dial__track', cx: 50, cy: 50, r: 40, pathLength: 100 }));
  svg.appendChild(svgEl('circle', { class: 'dial__fill', cx: 50, cy: 50, r: 40, pathLength: 100 }));
  return svg;
};
const builders = {
  button(slot) {
    const cap = el('div', 'keycap');
    const icon = iconUse(slot.icon); if (icon) { icon.classList.add('keycap__icon'); cap.appendChild(icon); }
    cap.appendChild(el('span', 'keycap__label', slot.label));
    const face = el('div', 'face face--button'); face.appendChild(cap); return face;
  },
  toggle(slot, value) {
    const face = el('div', 'face face--toggle'); face.dataset.on = String(!!value);
    const track = el('span', 'face__track'); track.appendChild(el('span', 'face__knob')); face.appendChild(track); return face;
  },
  dial(slot, value) {
    const face = el('div', 'face face--dial'); face.style.setProperty('--v', frac(slot, value ?? 0));
    const svg = dialSvg();
    const g = svgEl('g', { class: 'dial__pointer' });
    g.appendChild(svgEl('line', { x1: 50, y1: 50, x2: 76.5, y2: 50 })); g.appendChild(svgEl('circle', { cx: 50, cy: 50, r: 2.75 }));
    svg.appendChild(g); face.appendChild(svg); return face;
  },
  fader(slot, value) {
    const face = el('div', `face face--fader face--${slot.control.orientation === 'horizontal' ? 'h' : 'v'}`);
    face.style.setProperty('--v', frac(slot, value ?? 0));
    const track = el('span', 'face__track'); track.appendChild(el('span', 'face__fill')); track.appendChild(el('span', 'face__thumb'));
    face.appendChild(track); face.appendChild(el('output', 'face__readout', formatReadout(slot, value ?? 0))); return face;
  },
  xyPad(slot, value) {
    const face = el('div', 'face face--xy'); const v = value || { x: 0.5, y: 0.5 };
    face.style.setProperty('--x', v.x); face.style.setProperty('--y', v.y);
    face.appendChild(el('span', 'face__cross-h')); face.appendChild(el('span', 'face__cross-v')); face.appendChild(el('span', 'face__puck')); return face;
  },
  joystick(slot, value) {
    const face = el('div', 'face face--joy'); const v = value || { x: 0.5, y: 0.5 };
    face.style.setProperty('--x', v.x); face.style.setProperty('--y', v.y);
    const svg = svgEl('svg', { viewBox: '0 0 100 100', class: 'joy' });
    svg.appendChild(svgEl('circle', { class: 'joy__ring', cx: 50, cy: 50, r: 44 }));
    svg.appendChild(svgEl('circle', { class: 'joy__dead', cx: 50, cy: 50, r: 16.6 }));
    svg.appendChild(svgEl('line', { class: 'joy__leash', x1: 50, y1: 50, x2: 50 + (v.x - 0.5) * 78, y2: 50 + (v.y - 0.5) * 78 }));
    face.appendChild(svg); face.appendChild(el('span', 'face__puck')); return face;
  },
  colorPicker(slot, value) {
    const face = el('div', 'face face--swatch'); face.dataset.on = String(value !== 'off');
    if (typeof value === 'number') face.style.setProperty('--hue', value);
    face.appendChild(el('span', 'face__disc')); return face;
  },
  multiState(slot, value) {
    const states = slot.control.states || []; const i = Math.min(value ?? 0, Math.max(0, states.length - 1));
    const face = el('div', 'face face--multi'); face.dataset.active = String(i);
    face.appendChild(el('span', 'face__state', states[i] ? states[i].label : ''));
    const dots = el('span', 'face__dots'); states.forEach((_, k) => { const d = el('i'); if (k === i) d.className = 'is-on'; dots.appendChild(d); });
    face.appendChild(dots); return face;
  },
  dpad(slot, value) {
    const face = el('div', 'face face--dpad'); face.dataset.active = value || '';
    for (const arm of ['up', 'right', 'down', 'left']) { const a = el('span', `face__arm face__arm--${arm}`); a.dataset.arm = arm; face.appendChild(a); }
    face.appendChild(el('span', 'face__hub')); return face;
  },
  stepper(slot, value) {
    const face = el('div', 'face face--stepper');
    const dec = el('span', 'face__step face__step--dec'); dec.appendChild(iconUse('remove'));
    const inc = el('span', 'face__step face__step--inc'); inc.appendChild(iconUse('add'));
    face.appendChild(dec); face.appendChild(el('output', 'face__value', String(value ?? slot.control.min ?? 0))); face.appendChild(inc); return face;
  },
  radialMenu(slot, value) {
    const n = Math.min(8, Math.max(2, (slot.control.options || []).length || 4));
    const face = el('div', 'face face--radial'); face.dataset.active = String(value ?? 0);
    const svg = svgEl('svg', { viewBox: '0 0 100 100', class: 'radial' });
    for (let i = 0; i < n; i++) svg.appendChild(svgEl('path', { class: 'radial__wedge', d: wedgePath(i, n), 'data-i': i }));
    svg.appendChild(svgEl('circle', { class: 'radial__hub', cx: 50, cy: 50, r: 7 })); face.appendChild(svg); return face;
  },
  gauge(slot, value) {
    const style = slot.control.style || 'bar';
    const face = el('div', `face face--gauge face--gauge-${style}`); face.style.setProperty('--v', frac(slot, value ?? 0));
    if (style === 'bar') { const t = el('span', 'face__track'); t.appendChild(el('span', 'face__fill')); face.appendChild(t); }
    else face.appendChild(dialSvg());
    face.appendChild(el('output', 'face__readout', formatReadout(slot, value ?? 0))); return face;
  },
  sparkline(slot, value) {
    const face = el('div', 'face face--spark');
    const svg = svgEl('svg', { viewBox: '0 0 100 40', preserveAspectRatio: 'none', class: 'spark' });
    svg.appendChild(svgEl('polyline', { class: 'spark__line', points: '' })); face.appendChild(svg);
    face.dataset.type = 'sparkline'; face._slot = slot; setFaceValue(face, value || [0.35, 0.55, 0.30, 0.68, 0.48, 0.80]); return face;
  },
  textField(slot, value) {
    const face = el('div', 'face face--text'); const line = el('span', 'face__line');
    line.appendChild(el('span', 'face__ph', slot.control.placeholder || '')); line.appendChild(el('span', 'face__text', value || ''));
    face.appendChild(line); face.dataset.empty = String(!value); return face;
  },
};
export function buildFace(slot, value) {
  const type = slot.control && slot.control.control;
  const b = builders[type]; if (!b) throw new Error(`unknown control ${type}`);
  const face = b(slot, value); face.dataset.type = type; face._slot = slot; return face;
}
export function setFaceValue(face, value) {
  const slot = face._slot, type = face.dataset.type;
  switch (type) {
    case 'toggle': face.dataset.on = String(!!value); break;
    case 'dial': case 'gauge': face.style.setProperty('--v', frac(slot, value)); { const o = face.querySelector('.face__readout'); if (o) o.textContent = formatReadout(slot, value); } break;
    case 'fader': face.style.setProperty('--v', frac(slot, value)); face.querySelector('.face__readout').textContent = formatReadout(slot, value); break;
    case 'xyPad': face.style.setProperty('--x', value.x); face.style.setProperty('--y', value.y); break;
    case 'joystick': face.style.setProperty('--x', value.x); face.style.setProperty('--y', value.y);
      { const l = face.querySelector('.joy__leash'); l.setAttribute('x2', 50 + (value.x - 0.5) * 78); l.setAttribute('y2', 50 + (value.y - 0.5) * 78); } break;
    case 'colorPicker': if (typeof value === 'number') { face.style.setProperty('--hue', value); face.dataset.on = 'true'; } else face.dataset.on = String(value !== 'off'); break;
    case 'multiState': { const s = slot.control.states || []; face.dataset.active = String(value); face.querySelector('.face__state').textContent = s[value] ? s[value].label : '';
      face.querySelectorAll('.face__dots i').forEach((d, k) => d.classList.toggle('is-on', k === value)); } break;
    case 'dpad': face.dataset.active = value || ''; break;
    case 'stepper': face.querySelector('.face__value').textContent = String(value); break;
    case 'radialMenu': face.dataset.active = String(value); break;
    case 'sparkline': { const pts = value.map((v, i, a) => `${(i / Math.max(1, a.length - 1)) * 100},${(1 - clamp01(v)) * 36 + 2}`).join(' '); face.querySelector('.spark__line').setAttribute('points', pts); } break;
    case 'textField': face.querySelector('.face__text').textContent = value || ''; face.dataset.empty = String(!value); break;
    default: break;
  }
}
