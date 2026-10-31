(() => {
  'use strict';
  const profile = window.PROFILE || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  $$('[data-profile]').forEach(node => {
    const value = profile[node.dataset.profile];
    if (typeof value === 'string') node.textContent = value;
  });
  $$('[data-portrait]').forEach(node => {
    if (profile.portrait) node.src = profile.portrait;
    if (profile.portraitAlt) node.alt = profile.portraitAlt;
  });
  $$('[data-cv]').forEach(node => { if (profile.cvFile) node.href = profile.cvFile; });
  $$('[data-email-link]').forEach(node => {
    if (!profile.emailIsExample && profile.email) {
      node.href = 'mailto:' + profile.email;
      node.removeAttribute('data-example-email');
    }
  });
  $$('[data-email-status]').forEach(node => { node.hidden = !profile.emailIsExample; });
  $$('[data-draft-banner]').forEach(node => { node.hidden = profile.draftMode === false; });
  $$('[data-year]').forEach(node => { node.textContent = String(new Date().getFullYear()); });
  $$('[data-social]').forEach(node => {
    const url = profile.links && profile.links[node.dataset.social];
    if (url && /^https:\/\//i.test(url)) {
      node.href = url;
      node.classList.remove('sample-profile');
      const badge = $('.social-state', node);
      if (badge) badge.textContent = 'View profile ↗';
      node.setAttribute('aria-label', node.dataset.label + ': view Muhammad Abbas’s profile');
    }
  });

  const menuButton = $('[data-menu-toggle]');
  const navigation = $('#main-navigation');
  if (menuButton && navigation) {
    menuButton.hidden = false;
    menuButton.addEventListener('click', () => {
      const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(expanded));
      navigation.classList.toggle('is-open', expanded);
      menuButton.querySelector('span').textContent = expanded ? 'Close' : 'Menu';
    });
  }
  const dropdowns = $$('.nav-dropdown');
  dropdowns.forEach(node => node.addEventListener('toggle', () => {
    if (node.open) dropdowns.forEach(other => { if (other !== node) other.open = false; });
  }));
  document.addEventListener('click', event => {
    if (!event.target.closest('.nav-dropdown')) dropdowns.forEach(node => { node.open = false; });
    if (event.target.closest('.nav a') && menuButton) {
      navigation.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.querySelector('span').textContent = 'Menu';
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      dropdowns.forEach(node => { node.open = false; });
      if (menuButton) {
        navigation.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.querySelector('span').textContent = 'Menu';
      }
    }
  });
  $$('[data-print]').forEach(node => node.addEventListener('click', () => {
    const details = $$('main details');
    const state = details.map(node => node.open);
    details.forEach(node => { node.open = true; });
    window.print();
    details.forEach((node, i) => { node.open = state[i]; });
  }));
  $$('[data-expand]').forEach(button => button.addEventListener('click', () => {
    const target = button.dataset.expand;
    const items = $$('details' + (target ? '.' + target : ''), $('main'));
    const open = items.some(node => !node.open);
    items.forEach(node => { node.open = open; });
    button.textContent = open ? 'Collapse details −' : 'Expand details +';
  }));
  const copyNotice = $('[data-copy-notice]');
  $$('[data-copy-email]').forEach(button => button.addEventListener('click', async () => {
    let copied = false;
    try {
      await navigator.clipboard.writeText(profile.email || 'mabbas55225@gmail.com');
      copied = true;
    } catch (_) {
      const field = document.createElement('textarea');
      field.value = profile.email || 'mabbas55225@gmail.com';
      field.style.position = 'fixed'; field.style.opacity = '0';
      document.body.append(field); field.select();
      try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
      field.remove();
    }
    if (copyNotice) copyNotice.textContent = copied ? (profile.emailIsExample ? 'Example address copied. Replace it with your real email before sharing.' : 'Email address copied.') : 'Select the displayed email address and copy it manually.';
  }));

  const search = $('[data-course-search]');
  const courseCards = $$('.course-item');
  if (search && courseCards.length) {
    let selected = 'all';
    const chips = $$('[data-course-filter]');
    const filter = () => {
      const query = search.value.trim().toLocaleLowerCase();
      let shown = 0;
      courseCards.forEach(node => {
        const matches = (selected === 'all' || node.dataset.category === selected) && node.textContent.toLocaleLowerCase().includes(query);
        node.hidden = !matches;
        if (matches) shown++;
      });
      $$('.course-group').forEach(group => { group.hidden = !$$('.course-item', group).some(node => !node.hidden); });
      $('[data-course-count]').textContent = `${shown} of ${courseCards.length} draft course entries`;
      $('[data-course-empty]').hidden = shown !== 0;
    };
    search.addEventListener('input', filter);
    chips.forEach(chip => chip.addEventListener('click', () => {
      selected = chip.dataset.courseFilter;
      chips.forEach(other => other.setAttribute('aria-pressed', String(other === chip)));
      filter();
    }));
    $('[data-course-clear]').addEventListener('click', () => {
      search.value = ''; selected = 'all';
      chips.forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.courseFilter === 'all')));
      filter(); search.focus();
    });
    filter();
  }

  const contactForm = $('[data-contact-form]');
  if (contactForm) {
    const status = $('[data-message-status]');
    contactForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;
      const form = new FormData(contactForm);
      const text = `Hello Abbas,\n\n${form.get('message')}\n\nBest wishes,\n${form.get('name')}\n${form.get('email')}`;
      const preview = $('[data-message-preview]');
      preview.value = `To: ${profile.email}\nSubject: ${form.get('subject')}\n\n${text}`;
      $('[data-message-result]').hidden = false;
      if (profile.emailIsExample) {
        status.textContent = 'Draft prepared. The contact address is an example, so nothing has been sent.';
        $('[data-open-email]').hidden = true;
      } else {
        const link = $('[data-open-email]');
        link.href = `mailto:${profile.email}?subject=${encodeURIComponent(form.get('subject'))}&body=${encodeURIComponent(text)}`;
        link.hidden = false;
        status.textContent = 'Draft prepared. Open your email app to review and send it.';
      }
      $('[data-message-result]').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    $('[data-copy-message]').addEventListener('click', async () => {
      const preview = $('[data-message-preview]');
      try { await navigator.clipboard.writeText(preview.value); status.textContent = 'Message draft copied. Nothing has been sent.'; }
      catch (_) { preview.focus(); preview.select(); status.textContent = 'Your draft is selected. Use your device’s Copy command.'; }
    });
  }

  const activeLinks = $$('.cv-index a');
  if (activeLinks.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) activeLinks.forEach(link => {
          if (link.getAttribute('href') === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    $$('.cv-section').forEach(node => observer.observe(node));
  }
})();
