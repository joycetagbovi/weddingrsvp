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

  setText('[data-attendance-yes]', config.rsvp.attendanceValues.yes);
  setText('[data-attendance-no]', config.rsvp.attendanceValues.no);

  const directions = $('[data-directions]');
  if (directions) directions.href = config.googleMapsUrl;
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
  const guestCountField = $('[data-guest-count-field]');
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
        ? config.rsvp.attendanceValues.yes
        : config.rsvp.attendanceValues.no;
  });

  const yesRadio = attendanceRadios.find((r) => r.value === 'yes');

  const showError = (message) => {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.hidden = false;
  };
  const clearError = () => {
    if (errorEl) errorEl.hidden = true;
  };

  // The Google Form's "Guest" question is required, so the field must always be
  // submitted. When attending we show it and ask for a real number; when
  // declining we hide it and send 0 so the required field is still satisfied.
  const syncGuestCount = () => {
    const attending = Boolean(yesRadio?.checked);
    if (guestCountField) guestCountField.hidden = !attending;
    if (!guestCountInput) return;
    if (attending) {
      if (guestCountInput.value === '0') guestCountInput.value = '';
    } else {
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

hydrateContent();
setupWhatsApp();
setupRsvp();
