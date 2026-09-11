#!/usr/bin/env python3
"""Asserts that every verbatim copy block from the incumbent page is present in index.html."""
import html, re, sys, pathlib
SENTINELS = [
    # extended by Task 3 and Task 4 — each entry is the exact visible text of a block
]
src = pathlib.Path("index.html").read_text(encoding="utf-8")
text = re.sub(r"<[^>]+>", " ", src)
text = html.unescape(text)
text = re.sub(r"\s+", " ", text)
missing = [s for s in SENTINELS if re.sub(r"\s+", " ", html.unescape(s)) not in text]
for m in missing: print("MISSING:", m[:80])
print(f"check_copy: {len(SENTINELS)-len(missing)}/{len(SENTINELS)} present")
sys.exit(1 if missing else 0)
