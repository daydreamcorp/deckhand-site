/* ---- referral counter: 3 base months + 1 per tester you bring ---- */
export function initRefer() {
  const range = document.getElementById('referCount');
  if (!range) return;
  const out   = document.getElementById('referCount-out');
  const total = document.getElementById('referTotal');
  const note  = document.getElementById('referNote');
  const seats = document.getElementById('referSeats').children;
  const word  = ['none','one','two','three','four','five','six','seven','eight','nine','ten','eleven'];

  function render() {
    const n = parseInt(range.value, 10) || 0;
    const months = 3 + n;
    out.textContent = n;
    total.innerHTML = '<b>' + months + '</b> <span>month' + (months === 1 ? '' : 's') + ' of Elite, free, at launch</span>';
    for (let i = 0; i < seats.length; i++) seats[i].classList.toggle('on', i < n);
    if (n === 0)       note.textContent = 'Three months for testing, on its own. Every name you add from here is another month.';
    else if (n === 1)  note.textContent = 'Three months for testing, plus one for the tester you brought.';
    else if (n === 11) note.textContent = "That's the whole room filled single-handed — fourteen months is more than a year of Elite.";
    else               note.textContent = 'Three months for testing, plus one for each of the ' + word[n] + ' you brought.';
  }
  range.addEventListener('input', render);
  render();
}

/* ---- copy the invite link (JS-only, so it reveals itself) ---- */
export function initReferCopy() {
  const btn = document.getElementById('referCopy');
  if (!btn) return;
  const link = location.origin + location.pathname + '#testers';
  const idle = btn.textContent;
  let timer;
  btn.hidden = false;

  function say(text, ok) {
    clearTimeout(timer);
    btn.textContent = text;
    btn.classList.toggle('is-copied', !!ok);
    timer = setTimeout(function () { btn.textContent = idle; btn.classList.remove('is-copied'); }, 2600);
  }
  function fallback() {
    const ta = document.createElement('textarea');
    ta.value = link; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    if (ok) { document.body.removeChild(ta); say('Link copied', true); return; }
    /* both paths refused: leave it selected so Ctrl+C still works */
    say('Press Ctrl+C to copy', false);
    ta.addEventListener('blur', function () { if (ta.parentNode) ta.parentNode.removeChild(ta); });
  }
  btn.addEventListener('click', function () {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(function () { say('Link copied', true); }, fallback);
    } else { fallback(); }
  });
}
