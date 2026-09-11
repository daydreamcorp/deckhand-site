import { createChapter, gsap } from '../engine/scroll.js';
import { buildFace, setFaceValue, formatReadout } from '../deck/faces.js';
import { attachDial, attachFader, attachXY, attachJoystick, attachHue } from '../widgets/continuous.js';
import { attachButton, attachToggle, attachMultiState, attachDpad, attachStepper, attachRadial, attachTextField } from '../widgets/discrete.js';
export const WIDGETS = [
  { type: 'button',      caption: 'Button',             slot: { id: 'w-button', label: 'Clip', icon: 'star', control: { control: 'button' } } },
  { type: 'toggle',      caption: 'Toggle',             slot: { id: 'w-toggle', label: 'Live', icon: 'none', control: { control: 'toggle' } }, value: false },
  { type: 'dial',        caption: 'Dial',               slot: { id: 'w-dial', label: 'PC Volume', icon: 'none', control: { control: 'dial', value: { min: 0, max: 100 } } }, value: 62 },
  { type: 'fader',       caption: 'Fader',              slot: { id: 'w-fader', label: 'Mic', icon: 'none', control: { control: 'fader', orientation: 'vertical', value: { kind: 'obsAudioLevel', min: -60, max: 0 } } }, value: -23.5 },
  { type: 'xyPad',       caption: 'XY pad',             slot: { id: 'w-xy', label: 'FX Pad', icon: 'none', control: { control: 'xyPad' } }, value: { x: 0.42, y: 0.71 } },
  { type: 'joystick',    caption: 'Joystick',           slot: { id: 'w-joy', label: 'Cam Pan/Tilt', icon: 'none', control: { control: 'joystick', springReturn: true } }, value: { x: 0.5, y: 0.5 } },
  { type: 'colorPicker', caption: 'Color picker',       slot: { id: 'w-color', label: 'Lights', icon: 'none', control: { control: 'colorPicker' } }, value: 187 },
  { type: 'multiState',  caption: 'Multi-state switch', slot: { id: 'w-multi', label: 'Fan Speed', icon: 'none', control: { control: 'multiState', states: [{ label: 'Off' }, { label: 'Low' }, { label: 'Mid' }, { label: 'High' }] } }, value: 1 },
  { type: 'dpad',        caption: 'D-pad',              slot: { id: 'w-dpad', label: 'Window Snap', icon: 'none', control: { control: 'dpad' } }, value: '' },
  { type: 'stepper',     caption: 'Stepper',            slot: { id: 'w-step', label: 'BPM', icon: 'none', control: { control: 'stepper', min: 60, max: 200, step: 1 } }, value: 120 },
  { type: 'radialMenu',  caption: 'Radial menu',        slot: { id: 'w-radial', label: 'Scenes', icon: 'none', control: { control: 'radialMenu', options: [{ label: 'Starting' }, { label: 'In Game' }, { label: 'Pause' }, { label: 'Ending' }] } }, value: 0 },
  { type: 'gauge',       caption: 'Gauge',              slot: { id: 'w-gauge', label: 'CPU Load', icon: 'none', control: { control: 'gauge', style: 'arc', min: 0, max: 100 } }, value: 62 },
  { type: 'sparkline',   caption: 'Sparkline',          slot: { id: 'w-spark', label: 'CPU History', icon: 'none', control: { control: 'sparkline' } }, value: null },
  { type: 'textField',   caption: 'Text field',         slot: { id: 'w-text', label: 'Chat', icon: 'none', control: { control: 'textField', placeholder: 'Message to chat…' } }, value: '' },
];
export const widgetEls = new Map();
const section = document.getElementById('features');
const grid = document.getElementById('widgets');
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

function buildWidgets() {
  grid.dataset.skin = 'midnight';
  for (const w of WIDGETS) {
    const fig = el('figure', `widget widget--${w.type}`); fig.dataset.type = w.type;
    const tile = el('div', `tile tile--${w.type}`);
    if (w.type !== 'button') tile.appendChild(el('span', 'tile__caption', w.slot.label));
    const face = buildFace(w.slot, w.value); tile.appendChild(face);
    const out = el('output', 'widget__out'); out.setAttribute('aria-hidden', 'true');
    fig.appendChild(tile); fig.appendChild(el('figcaption', null, w.caption)); fig.appendChild(out); grid.appendChild(fig);
    widgetEls.set(w.type, { figure: fig, tile, face, out, slot: w.slot });
  }
}
const slider = (face, label, min, max, now, text) => { face.tabIndex = 0; face.setAttribute('role', 'slider'); face.setAttribute('aria-label', label);
  face.setAttribute('aria-valuemin', min); face.setAttribute('aria-valuemax', max); face.setAttribute('aria-valuenow', now); if (text) face.setAttribute('aria-valuetext', text); };

export const idles = {};                                            // filled by Task 14
function wire() {
  const g = (t) => widgetEls.get(t);
  { const { face, out, slot } = g('dial'); slider(face, 'Dial: PC Volume', 0, 100, 62); out.textContent = '62';
    attachDial(face, { min: 0, max: 100, onValue: (v) => { out.textContent = String(v); }, onGrab: () => idles.dial?.pause(), onRelease: () => idles.dial?.play() }); }
  { const { face, out, slot } = g('fader'); slider(face, 'Fader: Mic', -60, 0, -23.5, '-23.5 dB'); out.textContent = '-23.5 dB';
    attachFader(face, { min: -60, max: 0, step: 0.5, onValue: (v) => { face.querySelector('.face__readout').textContent = formatReadout(slot, v); face.setAttribute('aria-valuetext', `${v.toFixed(1)} dB`); out.textContent = `${v.toFixed(1)} dB`; } }); }
  { const { face, out } = g('xyPad'); face.tabIndex = 0; face.setAttribute('role', 'group'); face.setAttribute('aria-label', 'XY pad: FX Pad, arrow keys move the puck'); out.setAttribute('aria-live', 'polite'); out.removeAttribute('aria-hidden');
    attachXY(face, { onValue: ({ x, y }) => { out.textContent = `x ${x.toFixed(2)} · y ${y.toFixed(2)}`; } }); }
  { const { face, out } = g('joystick'); face.tabIndex = 0; face.setAttribute('role', 'group'); face.setAttribute('aria-label', 'Joystick: Cam Pan/Tilt, arrow keys nudge, release returns'); out.setAttribute('aria-live', 'polite'); out.removeAttribute('aria-hidden');
    attachJoystick(face, { reduced: () => !document.documentElement.classList.contains('js-motion'), onValue: ({ x, y }) => { out.textContent = `dx ${(x - 0.5).toFixed(2)} · dy ${(y - 0.5).toFixed(2)}`; } }); }
  { const { face, out } = g('colorPicker'); slider(face, 'Color picker: Lights', 0, 360, 187, 'hue 187°'); out.textContent = 'hue 187°';
    attachHue(face, { onValue: (h) => { out.textContent = `hue ${Math.round(h)}°`; } }); }
{ const { tile, face, out } = g('button'); out.textContent = 'Pressed ×0'; face.setAttribute('aria-label', 'Button: Clip'); attachButton(tile, face, { onValue: (n) => { out.textContent = `Pressed ×${n}`; } }); }
{ const { face, out } = g('toggle'); out.textContent = 'Off'; face.setAttribute('aria-label', 'Toggle: Live'); attachToggle(face, { onValue: (on) => { out.textContent = on ? 'On' : 'Off'; } }); }
{ const { face, out, slot } = g('multiState'); out.textContent = 'Low'; attachMultiState(face, slot, { onValue: (s) => { out.textContent = s; } }); }
{ const { face, out } = g('dpad'); face.setAttribute('aria-label', 'D-pad: Window Snap, arrow keys'); out.textContent = '—'; attachDpad(face, { onValue: (d) => { out.textContent = d || '—'; } }); }
{ const { face, out, slot } = g('stepper'); face.setAttribute('aria-label', 'Stepper: BPM'); out.textContent = '120'; attachStepper(face, slot, { onValue: (v) => { out.textContent = String(v); } }); }
{ const { face, out, slot } = g('radialMenu'); out.textContent = 'Starting'; attachRadial(face, slot, { onValue: (s) => { out.textContent = s; } }); }
{ const { face, out, slot } = g('textField'); out.textContent = ''; attachTextField(face, slot, { onValue: (v) => { out.textContent = v; } }); }
}
if (grid) { buildWidgets(); wire(); }

if (section) createChapter({
  scope: section, pin: false,
  build(tl, ctx) {
    if (ctx.reduced) return;
    gsap.from(ctx.qa('.widget'), { y: 24, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05,
      scrollTrigger: { trigger: grid, start: 'top 80%', toggleActions: 'play none none none', once: true } });
  },
});
