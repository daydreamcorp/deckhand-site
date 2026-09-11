#!/usr/bin/env python3
"""Asserts that every verbatim copy block from the incumbent page is present in index.html."""
import html, re, sys, pathlib
SENTINELS = [
    # extended by Task 3 and Task 4 — each entry is the exact visible text of a block
    'Help launch Deckhand. Keep three months of Elite.',
    "Deckhand turns your phone into a Stream-Deck-style control surface for Windows, macOS and Linux — no extra hardware, no account, no cloud. It's finished. What it needs now is twelve people willing to use it daily for fourteen days, so Google Play will let it out.",
    'Deckhand is in closed testing',
    "Three steps and you're live.",
    'No setup wizard, no cloud account, no hardware to buy.',
    'Install the free desktop app, then scan the QR code it shows (or type the on-screen PIN) from your phone. Both devices just need to share a network.',
    'Drag tiles onto a grid across as many pages as your plan allows. Resize them, skin them, wire each one to whatever it should do.',
    'Fire hotkeys, macros, OBS scenes, media controls, or a webhook to anything with a URL — straight from your pocket.',
    'Way more than buttons.',
    'Fourteen control types in total — buttons, dials, faders, toggles, radial menus, text fields, gauges, color pickers, steppers, multi-state switches, XY pads, joysticks, D-pads, and sparklines.',
    "Things a hardware Stream Deck can't do.",
    'OBS Studio scene, stream, and recording control. HTTP webhooks that trigger smart-home devices, APIs, or anything with a URL. Shake-to-trigger, voice-activated tiles, and geofenced pages that switch automatically when you sit down at your desk.',
    'A macro recorder captures a sequence of your own tiles and replays it as one',
    'Shell commands and system power actions — opt-in only, never on by default',
    'Skin every tile, every page.',
    'End-to-end encrypted local pairing',
    'Made for your setup.',
    "The same deck engine, skinned differently for whatever you're actually doing.",
]
src = pathlib.Path("index.html").read_text(encoding="utf-8")
text = re.sub(r"<[^>]+>", " ", src)
text = html.unescape(text)
text = re.sub(r"\s+", " ", text)
missing = [s for s in SENTINELS if re.sub(r"\s+", " ", html.unescape(s)) not in text]
for m in missing: print("MISSING:", m[:80])
print(f"check_copy: {len(SENTINELS)-len(missing)}/{len(SENTINELS)} present")
sys.exit(1 if missing else 0)
