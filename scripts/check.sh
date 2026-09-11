#!/usr/bin/env bash
set -uo pipefail
cd "$(dirname "$0")/.."
fail=0
# 1. contract files never change
git diff --quiet HEAD -- latest.json notices.json privacy-policy.html || { echo "FAIL: contract file modified"; fail=1; }
for f in latest.json notices.json privacy-policy.html; do test -f "$f" || { echo "FAIL: $f missing"; fail=1; }; done
# 2. anchors
for id in top main testers refer join how features beyond screenshots pricing download install-guide install-windows install-macos install-linux; do
  grep -q "id=\"$id\"" index.html || { echo "FAIL: missing id=$id"; fail=1; }
done
# 3. external hosts (presets.js is excluded: it carries the app's example action URLs as data that is never fetched)
hosts="$(cat index.html assets/css/*.css $(find assets/js -name '*.js' ! -name 'presets.js') 2>/dev/null | grep -oE 'https?://[a-zA-Z0-9.-]+' | sort -u | grep -vE '^(https://github\.com|https://daydreamcorp\.github\.io|http://www\.w3\.org)$' || true)"
[ -z "$hosts" ] || { echo "FAIL: unexpected external host(s): $hosts"; fail=1; }
# 4. presets
node --no-warnings --input-type=module -e "import('file://' + process.cwd() + '/assets/js/deck/presets.js').then(m => { const bad = Object.entries(m.PRESETS).filter(([k, d]) => d.pages[0].slots.length !== 10); if (Object.keys(m.PRESETS).length !== 6 || bad.length) { console.log('bad presets', bad.map(b => b[0])); process.exit(1); } })" || { echo "FAIL: presets.js"; fail=1; }
# 5. vendor + icons
for f in gsap ScrollTrigger SplitText Flip DrawSVGPlugin; do test -s "assets/vendor/gsap/$f.min.js" || { echo "FAIL: vendor $f"; fail=1; }; done
test "$(grep -c '<symbol' assets/icons/sprite.svg)" = "25" || { echo "FAIL: sprite symbol count"; fail=1; }
# 6. copy sentinels
python3 scripts/check_copy.py || fail=1
# 7. forbidden markup
grep -qE 'on(click|load|scroll)=' index.html && { echo "FAIL: inline handler"; fail=1; }
grep -q 'tabindex="-1"' index.html && { echo "FAIL: tabindex=-1 present"; fail=1; }
grep -q 'scroll-behavior: *smooth' assets/css/*.css 2>/dev/null && { echo "FAIL: CSS smooth scrolling (D2)"; fail=1; }
test $fail = 0 && echo "check.sh: OK"
exit $fail
