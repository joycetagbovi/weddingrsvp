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
  setText('[data-invitation]', config.invitation || '');
  setText('[data-dress-code]', config.dressCode || '');
  const dressCode = $('.dress-code');
  if (dressCode) dressCode.hidden = !config.dressCode;
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
  const nameInput = $('.js-name', form);
  const attendanceRadios = $$('.js-attendance', form);
  const submitBtn = $('.rsvp__submit', form);

  // Map our friendly fields onto the Google Form's entry.XXXX names so the POST
  // is recorded in the linked Sheet.
  form.action = config.rsvp.formActionUrl;
  if (nameInput) nameInput.name = config.rsvp.entries.name;
  attendanceRadios.forEach((radio) => {
    radio.name = config.rsvp.entries.attendance;
    radio.dataset.formValue =
      radio.value === 'yes'
        ? config.rsvp.attendanceValues.yes.value
        : config.rsvp.attendanceValues.no.value;
  });

  const showError = (message) => {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.hidden = false;
  };
  const clearError = () => {
    if (errorEl) errorEl.hidden = true;
  };

  attendanceRadios.forEach((radio) => {
    radio.addEventListener('change', clearError);
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

function setupCountdown() {
  const root = $('[data-countdown]');
  if (!root) return;

  const deadlineRaw = config.rsvp?.deadline;
  if (!deadlineRaw) return;

  const deadline = new Date(deadlineRaw);
  if (Number.isNaN(deadline.getTime())) return;

  const label = $('[data-countdown-label]', root);
  const closed = $('[data-countdown-closed]', root);
  const grid = $('.countdown__grid', root);
  const form = $('#rsvp-form');
  const daysEl = $('[data-days]', root);
  const hoursEl = $('[data-hours]', root);
  const minutesEl = $('[data-minutes]', root);
  const secondsEl = $('[data-seconds]', root);

  if (label && config.rsvp.deadlineLabel) {
    label.textContent = config.rsvp.deadlineLabel;
  }

  root.hidden = false;

  const pad = (n) => String(Math.max(0, n)).padStart(2, '0');

  const markClosed = () => {
    root.classList.add('countdown--closed');
    if (grid) grid.hidden = true;
    if (closed) closed.hidden = false;
    if (form) {
      form.querySelectorAll('input, button').forEach((el) => {
        el.disabled = true;
      });
    }
  };

  const tick = () => {
    const diff = deadline.getTime() - Date.now();
    if (diff <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minutesEl) minutesEl.textContent = '00';
      if (secondsEl) secondsEl.textContent = '00';
      markClosed();
      return false;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (daysEl) daysEl.textContent = pad(days);
    if (hoursEl) hoursEl.textContent = pad(hours);
    if (minutesEl) minutesEl.textContent = pad(minutes);
    if (secondsEl) secondsEl.textContent = pad(seconds);
    return true;
  };

  if (!tick()) return;

  const timer = window.setInterval(() => {
    if (!tick()) window.clearInterval(timer);
  }, 1000);
}

hydrateContent();
setupWhatsApp();
setupRsvp();
setupCountdown();
setupReveal();
