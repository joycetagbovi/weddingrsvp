/**
 * Edit this file to update the wedding page. No coding required beyond filling
 * in the values below. See README.md for how to get the Google Form values.
 */
export default {
  // --- The basics ---
  coupleNames: 'Joshua & Seraphina',
  tagline: "You're invited",
  date: 'Friday, August 14, 2026',
  time: '10:00 AM',
  // Hero background photo. Put the file in the `public/` folder and reference it
  // from the site root (e.g. '/hero.jpg'). Set to '' to use a plain backdrop.
  heroImage: '/hero.jpg',

  // --- Announcement (optional) ---
  // A highlighted notice near the top of the page. Set `announcement` to null
  // to hide this section entirely.
  announcement: {
    label: 'Important Update 🤍',
    title: 'Our engagement ceremony venue has been changed.',
    paragraphs: [
      'We sincerely apologize for the short notice. Please RSVP below to confirm that you’ve received the updated venue details.',
      'Thank you for your understanding, and we can’t wait to celebrate with you!',
    ],
  },

  // --- Venue ---
  venueName: 'Rose Villa',
  venueAddress: 'Rose Villa',
  // Paste any Google Maps link to the venue. The "Get Directions" button opens it.
  googleMapsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=Rose+Villa&destination_place_id=/g/11fnsvkcfm',

  // --- WhatsApp (optional) ---
  // Full international number, digits only (e.g. '15551234567').
  // Leave as an empty string to hide the WhatsApp button entirely.
  whatsappNumber: '',

  // --- RSVP (Google Forms) ---
  // See README.md: "Setting up the RSVP Google Form" for how to fill these in.
  rsvp: {
    // Short line shown under the RSVP heading. Set to '' to hide it.
    intro: '',
    // Ends in /formResponse (NOT /viewform).
    formActionUrl:
      'https://docs.google.com/forms/d/e/1FAIpQLSdS5wpuOmCKsQznnTLcLWut9vC7QlEfeC8dMo0sovNhAOxcbA/formResponse',
    // The entry.XXXX field names from your Google Form.
    entries: {
      name: 'entry.2043235207', // "Name" question
      attendance: 'entry.845648391', // "Attendance" question
    },
    // `label` is what guests see on the page. `value` is what gets recorded in
    // your Google Form and MUST match the option text in the form's attendance
    // question (leave these as 'Yes' / 'No' unless you also change the form).
    attendanceValues: {
      yes: { label: 'Joyfully Accept', value: 'Yes' },
      no: { label: 'Regretfully Decline', value: 'No' },
    },
  },

  // --- Footer ---
  footerMessage: 'We can’t wait to celebrate with you.',
};
