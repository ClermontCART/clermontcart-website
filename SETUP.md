# CART Sign-Up Form — D1 + Turnstile (Workers version)

The clermontcart.org site runs as a Cloudflare **Worker with static assets**
(not classic Pages), so the sign-up endpoint lives in `src/worker.js` and the
configuration lives in `wrangler.jsonc`. This replaces Formspree entirely.

## Already done (July 6, 2026, via dashboard)

- [x] D1 database `cart-supporters` created
      (id `61b046cc-318d-45d4-ad5e-0d5417749e62`) and schema applied —
      `supporters` table verified empty
- [x] Turnstile widget "CART supporter form" created, Managed mode,
      hostnames: `clermontcart.org` + `clermontcart-website.pages.dev`
- [x] Site key baked into `get-involved.html`:
      `0x4AAAAAADwk8fx4JPDBBuZP`

## Files in this change

| File | What it does |
|---|---|
| `src/worker.js` | Serves the static site; handles `POST /api/signup` (honeypot → Turnstile verify → validate → D1 insert). |
| `wrangler.jsonc` | Updated: worker entry point, `ASSETS` binding, `/api/*` routed to the worker, D1 binding `DB`. |
| `get-involved.html` | Form now posts to `/api/signup`; Turnstile widget with real site key. |
| `.assetsignore` | Keeps `src/`, SQL files, and config from being served as public static files. |
| `schema.sql` / `manual-inserts.sql` | Reference + template for the two manual supporter records. |

## Remaining steps

1. **Commit these files to the repo** (branch → merge to `main`; pushes to
   `main` deploy production).
2. **Add the Turnstile secret** — after the first deploy with a worker script,
   the project's Settings → Variables and secrets section unlocks. Add:
   - Type: **Secret**
   - Name: `TURNSTILE_SECRET_KEY` (exactly)
   - Value: the secret key from Turnstile → "CART supporter form" → Settings
   Then redeploy (Deployments → retry latest, or push any commit) so the
   worker picks it up.
3. **Test on clermontcart.org**: submit a sign-up, confirm you land on the
   thank-you page, then in the D1 console run
   `SELECT * FROM supporters ORDER BY signed_up_at DESC;`
   and delete the test row:
   `DELETE FROM supporters WHERE email = 'your-test@email.com';`
4. **Add the two existing supporters**: fill in `manual-inserts.sql` and run
   it in the D1 console.

## Notes

- The D1 binding is declared in `wrangler.jsonc` — do NOT also add it in the
  dashboard; the config file is the source of truth on every deploy.
- Order of operations matters for step 2: the secret can only be added after
  a deploy that includes `src/worker.js`. Until the secret exists, form
  submissions will fail Turnstile verification with a friendly error — so do
  steps 1→2 back to back.
- Duplicate sign-ups: email is unique (case-insensitive); a repeat signup
  shows the thank-you page without creating a second row.
- Useful queries (count by township, comments from Miami Twp residents, etc.)
  are in the comments at the bottom of `schema.sql`.
