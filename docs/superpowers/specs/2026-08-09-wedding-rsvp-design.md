# Wedding Invitation, RSVP & Venue Page — Design Spec

**Date:** 2026-08-09  
**Status:** Approved for implementation planning  
**Constraint:** No database, no custom backend, no API server

## Goal

A mobile-first static wedding guest page where invited guests can view the invitation, RSVP without an account, see venue details, and open Google Maps directions.

## Decisions (locked)

| Topic | Choice |
|---|---|
| Stack | Vite + vanilla HTML/CSS/JS |
| RSVP primary | Custom on-page form → Google Forms → Google Sheets |
| RSVP secondary | Optional WhatsApp prefilled message |
| Email (`mailto:`) | Not used as primary (poor mobile reliability) |
| Admin | Google Forms + Sheets only (no custom admin/auth) |
| Content | Placeholder couple/venue values in config |
| Hero | Typography + botanical SVG line art (no photo) |
| Palette | Blush, burgundy, emerald green |
| Deploy | Static (Vercel / Netlify / GitHub Pages) |

## RSVP architecture recommendation

**Primary: Google Forms + Google Sheets**

- Guest submits through a custom-styled form on the wedding page.
- The page POSTs field values to the Google Form response endpoint using entry IDs from config.
- Responses appear automatically in a linked Google Sheet (name, attendance, guest count, timestamp).
- Admin views/filters/shares the Sheet with other organizers — no custom dashboard.

**Why not email as primary**

- `mailto:` depends on a configured mail client; many mobile browsers fail silently or confuse guests.
- Responses are unstructured and hard to tally.

**Why WhatsApp is secondary only**

- Convenient for some guests, but unstructured for headcount tracking.
- Requires WhatsApp and a phone number in config.
- Shown only when `whatsappNumber` is set.

### Submit mechanics

Google Forms does not expose a CORS JSON API. The page will:

1. Validate required fields client-side (attendance required; guest count optional and only relevant when attending — hide or disable when “No”).
2. POST to the Form’s `formResponse` URL via a hidden iframe form target (reliable static pattern; avoids opaque `no-cors` fetch).
3. Show an on-page confirmation message after submit (client cannot read Google’s response body; confirmation is UX-level after a successful POST handoff).
4. Never store guest PII in `localStorage`.

A README will document creating the Form, linking Sheets, and copying entry IDs into config.

## Guest experience

Single scrolling page, no login:

1. **Hero** — “You’re invited”, couple names (brand-level), botanical motif, date teaser, primary RSVP jump CTA  
2. **Details** — full date, time, venue name, address  
3. **Location** — address + large Get Directions button (config Google Maps URL)  
4. **RSVP** — Yes / No attendance, optional name, optional guest count (emphasized when Yes), submit, confirmation  
5. **WhatsApp** (optional) — secondary control with prefilled message  
6. **Footer** — short thank-you  

UX requirements: mobile-first, responsive, large touch targets, accessible labels/focus, clear RSVP CTA, fast load, light motion only (`prefers-reduced-motion` respected).

## Visual system

- **Colors:** blush surfaces, burgundy accents/primary buttons, emerald botanical strokes  
- **Type:** expressive serif for couple names; distinctive sans for body/UI (avoid Inter/Roboto/Arial/system defaults)  
- **Hero:** soft blush gradient + SVG botanical line art; no photo; no cards or overlay badges in hero  
- **Motion:** subtle hero fade / botanical opacity only  

## Configuration

Single editable file: `wedding.config.js` (or equivalent), including:

- Couple names  
- Wedding date & time  
- Venue name & address  
- Google Maps URL  
- Google Form action URL  
- Google Form entry IDs (name, attendance, guest count)  
- WhatsApp number (optional; omit UI if empty)  

Placeholder defaults (e.g. Alex & Jordan) ship so the page renders before real data is filled in.

## Admin workflow

1. Create a Google Form with fields: Guest name, Attendance (Yes/No), Number of guests.  
2. Link responses to a Google Sheet.  
3. Copy form action URL and entry IDs into `wedding.config.js`.  
4. Share the Sheet with co-organizers as needed.  
5. Track confirmed vs declined via Sheet filters/pivot — no app admin UI.

## Project structure

```
/
├── wedding.config.js      # Non-technical edits land here
├── index.html
├── src/
│   ├── main.js            # Render from config, RSVP submit, Maps/WhatsApp
│   └── styles.css
├── public/                # Favicon / static assets
├── package.json
├── vite.config.js
└── README.md              # Config, Google Form setup, deploy
```

## Out of scope

- Database, backend, auth, or guest accounts  
- Custom admin dashboard  
- Per-guest unique invite links / seat assignment  
- Photo gallery, registry, livestream  
- Email as primary RSVP channel  

## Success criteria

- Guest can RSVP on mobile without an account and see confirmation.  
- Responses appear in Google Sheets for the admin.  
- Venue directions open in Google Maps from one tap.  
- Non-technical person can update wedding details via config + README.  
- Site deploys as static assets with no server runtime.
