# Wedding Invitation & RSVP Page

A mobile-first, static wedding invitation with RSVP, venue details, and Google Maps directions. No database, no backend, no login. RSVPs go straight into a Google Sheet through a Google Form.

## Quick start

```bash
npm install
npm run dev      # local preview at http://localhost:5173
npm run build    # outputs static site to dist/
npm run preview  # preview the production build
```

## Editing the wedding details

Open [`wedding.config.js`](wedding.config.js) and change the values. This is the only file you need to edit for names, date, venue, links, etc.

| Field | What it is |
| --- | --- |
| `coupleNames` | Shown large in the hero and footer |
| `tagline` | Small line above the names (e.g. "You're invited") |
| `date` / `time` | Displayed in the hero and details |
| `venueName` / `venueAddress` | Displayed in details and location |
| `googleMapsUrl` | The "Get Directions" button opens this |
| `whatsappNumber` | Digits only (e.g. `15551234567`). Leave `''` to hide the WhatsApp button |
| `rsvp.formActionUrl` | Your Google Form response URL (see below) |
| `rsvp.entries.*` | The `entry.XXXX` field IDs from your Form |
| `rsvp.attendanceValues` | Must match your Form's Yes/No option text exactly |
| `footerMessage` | Closing line in the footer |

### Getting the Google Maps URL

Search the venue in Google Maps, click **Share → Copy link**, and paste it into `googleMapsUrl`. Any valid Maps link works.

## Setting up the RSVP Google Form

1. Create a Google Form with three questions:
   - **Guest name** — Short answer
   - **Will you attend?** — Multiple choice with two options (e.g. `Yes, I will attend` and `No, I can't attend`)
   - **Number of guests** — Short answer / number
2. In the Form, click the three-dot menu → **Get pre-filled link**. Fill in sample answers and click **Get link**. The generated URL contains `entry.XXXXXXXX=...` for each question — copy each `entry.XXXXXXXX` number into `rsvp.entries` (`name`, `attendance`, `guestCount`).
3. Get the response URL: open the Form's live URL (ends in `/viewform`) and change `/viewform` to `/formResponse`. Put that in `rsvp.formActionUrl`.
4. Make sure the `attendanceValues.yes` and `attendanceValues.no` strings in the config **exactly match** the option labels in your Form.
5. In the Form's **Responses** tab, click the Sheets icon to link a Google Sheet.

### How submitting works

The page posts the RSVP into your Google Form using a hidden iframe, so the guest never leaves the page. Because Google doesn't return a readable response to the browser, the page shows a thank-you message once the submission is sent. Guest data is never stored in the browser.

## Admin: viewing responses

Open the linked Google Sheet to see every response with guest name, attendance, guest count, and submission timestamp. Filter or sort the attendance column to track confirmed vs. declined guests, and share the Sheet with other organizers via the **Share** button.

## Deploying

The site is fully static. Build with `npm run build` and deploy the `dist/` folder to any static host:

- **Netlify / Vercel:** connect the repo; build command `npm run build`, publish directory `dist`.
- **GitHub Pages:** push `dist/` to a `gh-pages` branch (or use an action).

## WhatsApp option

If `whatsappNumber` is set, a secondary "Confirm on WhatsApp" button appears with a pre-filled message. It's an optional alternative to the form and is not tracked in the Sheet.
