// Site-only demo values per deck (keyed by the real slot ids in presets.js); they match the store screenshots.
export const DEMO_VALUES = {
  obs:       { 'slot-live': false, 'slot-scenes': 0, 'slot-mic': -60, 'slot-music': -60, 'slot-volume': 8, 'slot-cpu': 4, 'slot-lights': 'on' },
  dj:        { 'slot-recording': false, 'slot-loop': 0, 'slot-decka': 0, 'slot-deckb': 0, 'slot-fxpad': { x: 0.08, y: 0.92 }, 'slot-bpm': 60, 'slot-boothlights': 'on' },
  home:      { 'slot-porch': false, 'slot-frontdoor': false, 'slot-scenes': 0, 'slot-thermostat': 60, 'slot-fan': 0, 'slot-blinds': 40, 'slot-humidity': 0, 'slot-accent': 'on' },
  kitchen:   { 'k-oven': false, 'k-timers': 0, 'k-temp': 200, 'k-timer': 12, 'k-speaker': 0, 'k-fridge': 0, 'k-mood': 'on' },
  classroom: { 'c-lights': false, 'c-music': false, 'c-timers': 0, 'c-points': 0, 'c-projector': 12, 'c-mic': 0, 'c-time': 0, 'c-mood': 'on' },
  photo:     { 'ph-strobe': false, 'ph-backdrops': 0, 'ph-soft1': 20, 'ph-soft2': 20, 'ph-height': 0, 'ph-count': 0, 'ph-gel': 'on' },
};
export const SKIN_TIERS = { midnight: 'Free', terminal: 'Free', aurora_borealis_pack: 'First Mate', neon_city_pack: 'First Mate', sakura_storm: 'Captain', citrus_burst_pack: 'Deckhand', mint_fresh: 'Deckhand', rose_gold_pack: 'Bosun' };
