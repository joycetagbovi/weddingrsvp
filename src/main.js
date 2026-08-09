import './styles.css';
import config from '../wedding.config.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setText(selector, value) {
  $$(selector).forEach((el) => {
    el.textContent = value;
  });
}

function hydrateContent() {
  document.title = `${config.coupleNames} — ${config.tagline}`;

  setText('[data-tagline]', config.tagline);
  setText('[data-couple]', config.coupleNames);
  setText('[data-hero-date]', config.date);
  setText('[data-date]', config.date);
  setText('[data-time]', config.time);
  setText('[data-venue-name]', config.venueName);
  setText('[data-venue-address]', config.venueAddress);
  setText('[data-footer-message]', config.footerMessage || '');

  setText('[data-attendance-yes]', config.rsvp.attendanceValues.yes.label);
  setText('[data-attendance-no]', config.rsvp.attendanceValues.no.label);

  const directions = $('[data-directions]');
  if (directions) directions.href = config.googleMapsUrl;

  const hero = $('#hero');
  if (hero && config.heroImage) {
    hero.style.setProperty('--hero-image', `url("${config.heroImage}")`);
    hero.classList.add('hero--photo');
  }

  renderAnnouncement();
  renderRsvpIntro();
  renderMonogram();
}

function renderMonogram() {
  const el = $('[data-monogram]');
  if (!el) return;
  const initials = (config.coupleNames || '')
    .split(/&|\band\b|\+/i)
    .map((part) => part.trim().charAt(0).toUpperCase())
    .filter(Boolean);
  if (initials.length) el.textContent = initials.join(' \u00b7 ');
}

function renderAnnouncement() {
  const section = $('[data-announcement]');
  const announcement = config.announcement;
  if (!section || !announcement) return;

  setText('[data-announcement-label]', announcement.label || '');
  setText('[data-announcement-title]', announcement.title || '');

  const body = $('[data-announcement-body]');
  if (body) {
    body.textContent = '';
    (announcement.paragraphs || []).forEach((text) => {
      const p = document.createElement('p');
      p.textContent = text;
      body.appendChild(p);
    });
  }
  section.hidden = false;
}

function renderRsvpIntro() {
  const intro = $('[data-rsvp-intro]');
  const text = config.rsvp?.intro;
  if (!intro || !text) return;
  intro.textContent = text;
  intro.hidden = false;
}

function setupWhatsApp() {
  const wrap = $('[data-whatsapp-wrap]');
  const link = $('[data-whatsapp]');
  const number = (config.whatsappNumber || '').replace(/\D/g, '');
  if (!wrap || !link || !number) return;

  const message = `Hello, I'm confirming my RSVP for ${config.coupleNames} on ${config.date}.`;
  link.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  wrap.hidden = false;
}

function setupRsvp() {
  const form = $('#rsvp-form');
  if (!form) return;

  const errorEl = $('[data-error]');
  const confirmation = $('[data-confirmation]');
  const confirmationText = $('[data-confirmation-text]');
  const guestCountInput = $('.js-guest-count', form);
  const nameInput = $('.js-name', form);
  const attendanceRadios = $$('.js-attendance', form);
  const submitBtn = $('.rsvp__submit', form);

  // Map our friendly fields onto the Google Form's entry.XXXX names so the POST
  // is recorded in the linked Sheet.
  form.action = config.rsvp.formActionUrl;
  if (nameInput) nameInput.name = config.rsvp.entries.name;
  if (guestCountInput) guestCountInput.name = config.rsvp.entries.guestCount;
  attendanceRadios.forEach((radio) => {
    radio.name = config.rsvp.entries.attendance;
    radio.dataset.formValue =
      radio.value === 'yes'
        ? config.rsvp.attendanceValues.yes.value
        : config.rsvp.attendanceValues.no.value;
  });

  const yesRadio = attendanceRadios.find((r) => r.value === 'yes');
  const noRadio = attendanceRadios.find((r) => r.value === 'no');

  const showError = (message) => {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.hidden = false;
  };
  const clearError = () => {
    if (errorEl) errorEl.hidden = true;
  };

  // The Guest field stays visible at all times. When attending we clear a
  // placeholder 0 so guests enter a real number; when they decline we default it
  // to 0 so the required Google Form field is still satisfied.
  const syncGuestCount = () => {
    if (!guestCountInput) return;
    if (yesRadio?.checked) {
      if (guestCountInput.value === '0') guestCountInput.value = '';
    } else if (noRadio?.checked) {
      guestCountInput.value = '0';
    }
  };

  // Guest count only relevant when attending.
  syncGuestCount();
  attendanceRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      clearError();
      syncGuestCount();
    });
  });

  form.addEventListener('submit', (event) => {
    const selected = attendanceRadios.find((r) => r.checked);
    if (!selected) {
      event.preventDefault();
      showError('Please let us know whether you can attend.');
      return;
    }

    if (nameInput && !nameInput.value.trim()) {
      event.preventDefault();
      showError('Please enter your name.');
      nameInput.focus();
      return;
    }

    if (selected.value === 'yes') {
      const count = Number(guestCountInput?.value);
      if (!guestCountInput?.value || !Number.isInteger(count) || count < 1) {
        event.preventDefault();
        showError('Please enter the number of guests (a whole number of at least 1).');
        guestCountInput?.focus();
        return;
      }
    } else if (guestCountInput) {
      // Declining: send 0 for the required Guest field.
      guestCountInput.value = '0';
    }

    // Rewrite radio values to the labels Google Forms expects, right before POST.
    attendanceRadios.forEach((radio) => {
      radio.value = radio.dataset.formValue;
    });

    clearError();

    const attending = selected.value === 'yes';
    if (confirmationText) {
      confirmationText.textContent = attending
        ? 'Your RSVP has been sent. We’re so happy you’ll be joining us!'
        : 'Your RSVP has been sent. We’ll miss you, but thank you for letting us know.';
    }
    if (confirmation) confirmation.hidden = false;
    form.hidden = true;
    if (submitBtn) submitBtn.disabled = true;
    // Native POST proceeds into the hidden iframe (no navigation).
  });
}

function setupReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    // Without motion (or observer support) just show everything immediately.
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  // Arm the hidden state only when JS + motion are available, so no-JS users
  // always see content.
  document.documentElement.classList.add('has-reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  els.forEach((el) => observer.observe(el));
}

hydrateContent();
setupWhatsApp();
setupRsvp();
setupReveal();
