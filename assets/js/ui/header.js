export function initHeader() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('siteNav');
  if (!toggle || !nav) return;
  const rest = [document.querySelector('main'), document.querySelector('footer'), document.querySelector('.recruit-banner')].filter(Boolean);
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    rest.forEach((el) => { el.inert = open; });
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
}

export function initProgress() {
  const line = document.querySelector('.header-progress'); if (!line) return;
  const update = () => { const max = document.documentElement.scrollHeight - innerHeight; line.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`; };
  addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update();
}
export function initCurrentNav() {
  const links = [...document.querySelectorAll('.site-nav a[href^="#"]')]; if (!links.length) return;
  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const targets = [...byId.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (!e.isIntersecting) return; links.forEach((a) => a.removeAttribute('aria-current')); byId.get(e.target.id)?.setAttribute('aria-current', 'true'); });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
  targets.forEach((t) => io.observe(t));
}
