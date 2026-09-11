import { PRESETS } from './presets.js';
import { DEMO_VALUES } from './demo.js';
import { buildFace, setFaceValue, iconUse } from './faces.js';
const TOOLS = ['mic', 'devices', 'wifi', 'palette', 'workspace_premium', 'edit', 'settings'];
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const pairs = (s) => { const o = {}; (s || '').split(';').filter(Boolean).forEach((p) => { const i = p.indexOf(':'); o[p.slice(0, i)] = p.slice(i + 1); }); return o; };
export const handles = new Map();

export function renderDeck(doc, { skin, values = {}, mount, swap = null, relabel = {}, lit = [], on = [], text = {} } = {}) {
  const page = doc.pages[0];
  const root = el('div', 'deck'); root.dataset.skin = skin || doc.skinId || 'midnight';
  root.style.setProperty('--dk-cols', page.cols); root.style.setProperty('--dk-rows', page.rows);
  const bar = el('div', 'deck__toolbar');
  const chev = iconUse('expand_less'); chev.classList.add('deck__chevron'); bar.appendChild(chev);
  bar.appendChild(el('span', 'deck__name', page.name));
  const tools = el('span', 'deck__tools'); tools.setAttribute('aria-hidden', 'true');
  TOOLS.forEach((t, i) => { const w = el('span', 'deck__tool' + (i === 1 ? ' has-badge' : '') + (t === 'wifi' ? ' deck__wifi' : '')); w.appendChild(iconUse(t)); tools.appendChild(w); });
  bar.appendChild(tools); root.appendChild(bar);
  const grid = el('div', 'deck__grid'); root.appendChild(grid);
  const pos = new Map(page.slots.map((s) => [s.id, { row: s.row, col: s.col }]));
  if (swap && swap.length === 2 && pos.has(swap[0]) && pos.has(swap[1])) { const a = pos.get(swap[0]), b = pos.get(swap[1]); pos.set(swap[0], b); pos.set(swap[1], a); }
  const tiles = new Map();
  for (const slot of page.slots) {
    const type = slot.control.control, p = pos.get(slot.id);
    const s = relabel[slot.id] ? { ...slot, label: relabel[slot.id] } : slot;
    const tile = el('div', `tile tile--${type}`); tile.dataset.slot = slot.id;
    tile.style.cssText = `--c:${p.col + 1};--r:${p.row + 1};--w:${slot.colSpan};--h:${slot.rowSpan}`;
    if (type !== 'button') tile.appendChild(el('span', 'tile__caption', s.label));
    let v = values[slot.id];
    if (on.includes(slot.id)) v = true;
    if (text[slot.id] != null) v = text[slot.id];
    const face = buildFace(s, v);
    if (lit.includes(slot.id)) tile.classList.add('is-lit');
    tile.appendChild(face); grid.appendChild(tile); tiles.set(slot.id, { el: tile, face, slot: s });
  }
  if (mount) mount.prepend(root);                                  // prepend: overlays that follow in the DOM stay on top
  return {
    root, doc, tiles,
    setSkin(id) { root.dataset.skin = id; },
    setValue(id, v) { const t = tiles.get(id); if (t) setFaceValue(t.face, v); },
    press(id) { const t = tiles.get(id); if (!t) return; t.el.classList.add('is-pressed'); setTimeout(() => t.el.classList.remove('is-pressed'), 120); },   // CSS: is-pressed sets --lit, which lights the ring and the glow; both cool over their 240 ms transitions
    light(id, onOff) { const t = tiles.get(id); if (t) t.el.classList.toggle('is-lit', onOff !== false); },
    setName(name) { bar.querySelector('.deck__name').textContent = name; },
  };
}

export function renderDecks(root = document) {
  for (const m of root.querySelectorAll('[data-deck]')) {
    const key = m.dataset.deck, doc = PRESETS[key];
    if (!doc) { console.error('unknown deck', key); continue; }
    const h = renderDeck(doc, { skin: m.dataset.skin, values: DEMO_VALUES[key] || {}, mount: m,
      swap: m.dataset.swap ? m.dataset.swap.split(',') : null, relabel: pairs(m.dataset.relabel),
      lit: m.dataset.lit ? m.dataset.lit.split(',') : [], on: m.dataset.on ? m.dataset.on.split(',') : [], text: pairs(m.dataset.text) });
    const phone = m.closest('.phone');
    handles.set(m.dataset.layer || (phone && phone.id) || key, h);
  }
  return handles;
}
