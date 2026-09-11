// Opens the install steps for whatever the visitor is on, and marks them as
// theirs. Progressive enhancement only -- all three <details> work closed,
// by hand, with no JS, which matters because platform sniffing is a guess:
// getting it wrong should cost a click, never hide the instructions.
export function initInstall() {
  const guide = document.getElementById('install-guide');
  if (!guide) return;

  const ua = navigator.userAgent || '';
  const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
  const probe = platform + ' ' + ua;

  let id = null;
  // Android before Linux: every Android UA also says Linux, and an Android
  // visitor wants the phone app, not AppImage instructions.
  if (/Android/i.test(ua)) id = null;
  else if (/Win/i.test(probe)) id = 'install-windows';
  else if (/Mac|iPhone|iPad|iPod/i.test(probe)) id = 'install-macos';
  else if (/Linux|X11|CrOS/i.test(probe)) id = 'install-linux';

  const target = id && document.getElementById(id);
  if (!target) return;

  target.open = true;
  const badge = target.querySelector('.yours');
  if (badge) badge.hidden = false;
}
