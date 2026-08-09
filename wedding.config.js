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
    // Ends in /formResponse (NOT /viewform).
    formActionUrl:
      'https://docs.google.com/forms/d/e/1FAIpQLSdS5wpuOmCKsQznnTLcLWut9vC7QlEfeC8dMo0sovNhAOxcbA/formResponse',
    // The entry.XXXX field names from your Google Form.
    entries: {
      name: 'entry.2043235207', // "Name" question
      attendance: 'entry.845648391', // "Attendance" question
      guestCount: 'entry.720196882', // "Guest" question
    },
    // Must match the option labels in your Google Form's attendance question.
    attendanceValues: {
      yes: 'Yes',
      no: 'No',
    },
  },

  // --- Footer ---
  footerMessage: 'We can’t wait to celebrate with you.',
};
