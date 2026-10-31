document.documentElement.classList.add('js');
function hydrateProfile() {
  const profile = window.PROFILE || {};
  document.querySelectorAll('[data-profile]').forEach(el => {
    const value = profile[el.dataset.profile];
    if (value) el.textContent = value;
  });
  document.querySelectorAll('[data-profile-link]').forEach(el => {
    const field = el.dataset.profileLink;
    const value = (profile[field] || '').trim();
    if (value) {
      el.href = field === 'email' ? 'mailto:' + value : value;
      el.hidden = false;
    }
  });
  document.querySelectorAll('[data-empty]').forEach(el => {
    el.hidden = !!profile[el.dataset.empty];
  });
  document.querySelectorAll('[data-optional]').forEach(el => {
    el.hidden = !profile[el.dataset.optional];
  });
  document.querySelectorAll('[data-initials]').forEach(el => {
    el.textContent = (profile.name || 'Your Name').trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  });
  document.querySelectorAll('[data-portrait]').forEach(img => {
    if (!profile.portrait) return;
    img.src = profile.portrait;
    img.alt = 'Portrait of ' + profile.name;
    img.hidden = false;
    img.addEventListener('error', () => { img.hidden = true; }, { once: true });
  });
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
}
function refreshNavigation() {
  const page = document.body.dataset.page || 'index';
  document.querySelectorAll('.nav [aria-current]').forEach(el => el.removeAttribute('aria-current'));
  document.querySelectorAll('.nav [data-page-link]').forEach(el => {
    if (el.dataset.pageLink === page) el.setAttribute('aria-current', 'page');
  });
  document.querySelectorAll('.dropdown').forEach(el => el.classList.toggle('active', page === 'research'));
}
const nav = document.querySelector('#site-nav');
const menu = document.querySelector('.menu-toggle');
const closeMenu = () => {
  if (!nav || !menu) return;
  nav.classList.remove('is-open');
  menu.setAttribute('aria-expanded', 'false');
};
if (nav && menu) {
  menu.hidden = false;
  menu.addEventListener('click', () => {
    menu.setAttribute('aria-expanded', String(nav.classList.toggle('is-open')));
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) {
      closeMenu();
      document.querySelectorAll('.dropdown').forEach(el => el.open = false);
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
    document.querySelectorAll('.dropdown').forEach(el => { if (!el.contains(event.target)) el.open = false; });
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const open = document.querySelector('.dropdown[open]');
    if (open) { open.open = false; open.querySelector('summary').focus(); }
    else if (nav.classList.contains('is-open')) { closeMenu(); menu.focus(); }
  });
  window.matchMedia('(min-width: 931px)').addEventListener('change', closeMenu);
}
window.PORTFOLIO_UI = { hydrateProfile, refreshNavigation, closeMenu };
hydrateProfile();
refreshNavigation();
