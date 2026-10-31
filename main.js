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
function wireContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const email = ((window.PROFILE && window.PROFILE.email) || 'mabbas55225@gmail.com').trim();
  const submitButton = form.querySelector('button[type="submit"]');

  const setBusy = (busy) => {
    if (!submitButton) return;
    submitButton.disabled = busy;
    submitButton.textContent = busy ? 'Opening mail app…' : 'Send message';
  };

  form.addEventListener('submit', event => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = (formData.get('name') || '').toString().trim();
    const senderEmail = (formData.get('email') || '').toString().trim();
    const subject = (formData.get('subject') || '').toString().trim() || 'Website inquiry';
    const message = (formData.get('message') || '').toString().trim();

    if (!name || !senderEmail || !message) {
      alert('Please complete your name, email, and message before sending.');
      return;
    }

    setBusy(true);
    const fullBody = `Name: ${name}\nEmail: ${senderEmail}\n\n${message}`;
    const mailtoUrl = 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(fullBody);
    window.location.href = mailtoUrl;
    setTimeout(() => {
      form.reset();
      setBusy(false);
    }, 250);
  });
}

window.PORTFOLIO_UI = { hydrateProfile, refreshNavigation, closeMenu, wireContactForm };
hydrateProfile();
refreshNavigation();
wireContactForm();
