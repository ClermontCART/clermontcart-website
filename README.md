# Clermont Area Roads &amp; Traffic (CART) — Website

The public website for CART, a citizen advocacy group working to keep Clermont
County's road infrastructure in step with approved development. The site makes
the case for a new SR&nbsp;28 corridor study, hosts the supporting documents, and
collects resident support.

**Live site:** clermontcart.org (once deployed)
**Host:** Cloudflare Pages
**Stack:** Static HTML, Google Drive (documents), Formspree (supporter form)

---

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home — the case for a new corridor study |
| `documents.html` | Document library (loads PDFs from Google Drive) |
| `get-involved.html` | Supporter sign-up form (Formspree) |
| `get-involved-success.html` | Thank-you page shown after the form is submitted |
| `updates.html` | News / progress (stub — to be built out) |
| `cart-logo.svg` | Full logo (used in header and footer) |
| `cart-icon.svg` / `cart-icon.png` | Favicon / browser-tab icon |

---

## Setup still required (placeholders in the code)

Three connections need real values plugged in before the site is fully live.
Each spot is marked with a `SETUP` note in the code.

1. **Formspree (supporter form)** — in `get-involved.html`, replace `YOUR_FORM_ID`
   in the `<form action="...">` tag with the form ID from the CART Formspree
   account. Also point the `_next` redirect at the live success URL once the
   domain is live.

2. **Google Drive (document library)** — in `documents.html`, replace
   `YOUR_DRIVE_API_KEY` and each `YOUR_FOLDER_ID_*` with the real Drive API key
   (from the CART Google Cloud Console, restricted to the Drive API and the
   clermontcart.org domains) and the three folder IDs.
   Every PDF must be set to **"Anyone with the link → Viewer"** or it won't appear.

3. **Email forwarding** — set up in Cloudflare (Email Routing), not in code:
   forward `contact@clermontcart.org` → `clermontcart@gmail.com`.

---

## Deploying a change

1. Edit the file(s).
2. Commit and push to this repo.
3. In Cloudflare → Workers &amp; Pages → the CART project, upload the site
   (or let it deploy automatically if connected to this repo).
4. Changes are live within about a minute.

> When uploading a zip to Cloudflare, make sure the HTML files sit at the **root**
> of the zip, not inside a subfolder. Don't open the HTML files in Word — it
> corrupts them.

---

## Accounts

Everything runs through **clermontcart@gmail.com**. Keep recovery info current and
the password shared with at least one other board member, so the project never
depends on a single person.
