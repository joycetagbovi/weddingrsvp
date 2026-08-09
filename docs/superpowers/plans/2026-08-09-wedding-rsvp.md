# Wedding Invitation RSVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a static, mobile-first wedding invitation page with custom RSVP posting to Google Forms, venue directions, and optional WhatsApp — configured via one file.

**Architecture:** Vite vanilla static site. `wedding.config.js` holds all content and Form entry IDs. Page sections render from config. RSVP POSTs to Google Forms via hidden iframe. Admin uses Google Sheets. No database or backend.

**Tech Stack:** Vite, vanilla HTML/CSS/JS, Google Fonts (Cormorant Garamond + DM Sans), SVG botanical art, static deploy.

## Global Constraints

- No database, custom backend, API server, or auth
- No guest PII in `localStorage`
- RSVP primary: custom form → Google Forms → Sheets (hidden iframe POST)
- WhatsApp secondary only; hide if number empty
- Palette: blush, burgundy, emerald
- Hero: botanical SVG + typography (no photo, no cards)
- Placeholder wedding content in config
- Easy non-technical updates via `wedding.config.js` + README

---

### Task 1: Scaffold Vite project

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.js`, `src/styles.css`, `.gitignore`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "naarsvp",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 2: Create `vite.config.js`**

```js
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
```

- [ ] **Step 3: Create `.gitignore`**

```
node_modules
dist
.DS_Store
.superpowers
```

- [ ] **Step 4: Create minimal `index.html` and `src/main.js`**

`index.html` loads fonts and `#app`. `src/main.js` mounts a temporary “Wedding invite loading…” string so `npm run dev` proves the scaffold.

- [ ] **Step 5: Install and verify**

Run: `npm install && npm run build`  
Expected: `dist/` generated with no errors.

---

### Task 2: Wedding config module

**Files:**
- Create: `wedding.config.js`

**Produces:** Default-exported config object used by `main.js`.

- [ ] **Step 1: Create `wedding.config.js` with placeholder content**

```js
/** Edit this file to update the wedding page. No coding required beyond filling values. */
export default {
  coupleNames: 'Alex & Jordan',
  tagline: "You're invited",
  date: 'Saturday, June 14, 2026',
  time: '4:00 PM',
  venueName: 'The Garden Conservatory',
  venueAddress: '123 Blossom Lane, Portland, OR 97201',
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=123+Blossom+Lane+Portland+OR',
  whatsappNumber: '', // e.g. '15551234567' — leave empty to hide WhatsApp button
  rsvp: {
    formActionUrl:
      'https://docs.google.com/forms/d/e/FORM_ID/formResponse',
    entries: {
      name: 'entry.1111111111',
      attendance: 'entry.2222222222',
      guestCount: 'entry.3333333333',
    },
    attendanceValues: {
      yes: 'Yes',
      no: 'No',
    },
  },
};
```

- [ ] **Step 2: Import config in `src/main.js` and `console.log` couple names**  
Verify Vite resolves the root-level config import.

---

### Task 3: Page markup and section structure

**Files:**
- Modify: `index.html`, `src/main.js`

- [ ] **Step 1: Build semantic HTML structure in `index.html`**

Sections with IDs: `hero`, `details`, `location`, `rsvp`, `footer`.  
RSVP form fields: attendance radios (`yes`/`no`), `name` text, `guestCount` number, submit button.  
Hidden iframe `name="hidden_iframe"` for form target.  
Empty nodes / `data-config` hooks filled by JS from config.

- [ ] **Step 2: In `main.js`, hydrate all config-driven text and hrefs**

Set couple names, date, time, venue, Maps link (`target="_blank" rel="noopener"`), WhatsApp link visibility + href with prefilled message:

```
Hello, I'm confirming my RSVP for [coupleNames] on [date].
```

Use `https://wa.me/${number}?text=${encodeURIComponent(msg)}`.

- [ ] **Step 3: Manual check in browser**  
Hero shows placeholder names; Maps opens; WhatsApp hidden when number empty.

---

### Task 4: Visual design (blush / burgundy / emerald)

**Files:**
- Modify: `src/styles.css`, `index.html` (font links)
- Create: inline or `public/botanical.svg` used in hero

- [ ] **Step 1: Add Google Fonts** — Cormorant Garamond (display) + DM Sans (body)

- [ ] **Step 2: Define CSS variables**

```css
:root {
  --blush: #f6ebe6;
  --blush-deep: #e8d2cb;
  --burgundy: #6b1d2a;
  --burgundy-hover: #541622;
  --emerald: #1f5c4a;
  --ink: #2a1f1c;
  --muted: #5c4a45;
  --surface: #fffaf7;
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body: 'DM Sans', sans-serif;
}
```

- [ ] **Step 3: Mobile-first layout**  
Full-bleed hero with botanical SVG (emerald strokes, ~20% opacity), couple names as largest type, RSVP jump button (burgundy). Details/location/rsvp as stacked sections with generous padding and 48px+ tap targets. No hero cards.

- [ ] **Step 4: Motion**  
Short opacity fade on hero content; `@media (prefers-reduced-motion: reduce)` disables animation.

- [ ] **Step 5: Visual pass** at 375px and 1280px widths.

---

### Task 5: RSVP form behavior

**Files:**
- Modify: `src/main.js`, `index.html`

**Interfaces:**
- Consumes: `config.rsvp.formActionUrl`, `config.rsvp.entries.*`, `config.rsvp.attendanceValues`
- Produces: working POST to Google Forms + on-page confirmation

- [ ] **Step 1: Wire form `action` and entry `name` attributes from config**

- [ ] **Step 2: Toggle guest-count field** — show/enable when attendance is Yes; hide/disable when No; clear value on No.

- [ ] **Step 3: Validate** — attendance required before submit; if Yes and guest count provided, must be integer ≥ 1.

- [ ] **Step 4: Submit via `target="hidden_iframe"`**  
On submit (after validation): allow native form POST to iframe; show confirmation region (“Thank you — your RSVP was sent.”); optionally disable submit to prevent double-send.

- [ ] **Step 5: Manual test** with a real Google Form (or verify network POST URL shape with placeholders). Document that placeholder entry IDs must be replaced.

---

### Task 6: README and polish

**Files:**
- Create: `README.md`
- Create: `public/favicon.svg` (simple monogram or botanical mark)
- Modify: meta tags in `index.html` (title, description, theme-color)

- [ ] **Step 1: Write README** covering:
  - `npm install` / `npm run dev` / `npm run build`
  - Editing `wedding.config.js`
  - Creating Google Form fields (Name, Attendance Yes/No, Guest count)
  - Linking Form → Sheets
  - Finding `formResponse` URL and `entry.xxxxx` IDs (View page source / pre-fill link)
  - Deploying `dist/` to Netlify/Vercel/GitHub Pages
  - Admin workflow (Sheet filters for Yes/No)

- [ ] **Step 2: Accessibility pass** — labels tied to inputs, focus styles, heading order, button contrast.

- [ ] **Step 3: Final `npm run build` + `npm run preview` smoke test.

---

## Spec coverage check

| Spec item | Task |
|---|---|
| Static Vite frontend | 1 |
| Config file for non-technical edits | 2 |
| Hero / details / location / RSVP / WhatsApp / footer | 3 |
| Blush/burgundy/emerald + botanical | 4 |
| Custom form → Google Forms iframe POST | 5 |
| Maps directions | 3 |
| Admin via Sheets + README | 6 |
| No DB/backend/localStorage PII | 1–5 |
