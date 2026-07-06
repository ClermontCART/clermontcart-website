/**
 * CART website Worker — serves static assets and handles POST /api/signup.
 *
 * Sign-up flow:
 *   1. Honeypot check (silent discard — bot thinks it succeeded)
 *   2. Server-side Cloudflare Turnstile verification (cannot be bypassed
 *      by POSTing directly to this endpoint)
 *   3. Field validation
 *   4. Insert into D1 (duplicate emails are treated as success —
 *      the person is already on the list)
 *
 * Bindings (declared in wrangler.jsonc):
 *   env.DB     — D1 database (cart-supporters)
 *   env.ASSETS — static site files
 * Secret (set in dashboard → project → Settings → Variables and secrets):
 *   env.TURNSTILE_SECRET_KEY
 */

const MAX = {
  name: 100,
  email: 254,
  zip: 10,
  area: 60,
  willing: 200,
  comment: 2000,
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function clean(value, max) {
  return (value || "").toString().trim().slice(0, max);
}

async function handleSignup(request, env) {
  let formData;
  try {
    formData = await request.formData();
  } catch (_) {
    return json({ ok: false, error: "Invalid form submission." }, 400);
  }

  // Whether the visitor used the JS form (AJAX) or plain HTML fallback.
  const wantsJson = (request.headers.get("Accept") || "").includes("application/json");
  const successRedirect = new URL("/get-involved-success.html", request.url).toString();
  const succeed = () =>
    wantsJson ? json({ ok: true }) : Response.redirect(successRedirect, 303);

  // --- 1. Honeypot: pretend success so bots don't adapt -------------------
  if (clean(formData.get("_gotcha"), 200)) {
    return succeed();
  }

  // --- 2. Turnstile verification -------------------------------------------
  const token = formData.get("cf-turnstile-response");
  if (!token) {
    return json(
      { ok: false, error: "Human verification didn't load. Please refresh the page and try again." },
      400
    );
  }

  const verifyPayload = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token,
  });
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) verifyPayload.append("remoteip", ip);

  let outcome;
  try {
    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: verifyPayload }
    );
    outcome = await verifyRes.json();
  } catch (_) {
    return json(
      { ok: false, error: "Could not complete verification. Please try again in a moment." },
      502
    );
  }

  if (!outcome.success) {
    return json({ ok: false, error: "Human verification failed. Please try again." }, 403);
  }

  // --- 3. Validate fields ----------------------------------------------------
  const firstName = clean(formData.get("First name"), MAX.name);
  const lastName = clean(formData.get("Last name"), MAX.name);
  const email = clean(formData.get("Email"), MAX.email).toLowerCase();
  const zip = clean(formData.get("ZIP code"), MAX.zip);
  const area = clean(formData.get("Area"), MAX.area);
  const willingTo = formData
    .getAll("Willing to")
    .map((v) => clean(v, 40))
    .filter(Boolean)
    .join(", ")
    .slice(0, MAX.willing);
  const comment = clean(formData.get("Comment"), MAX.comment);
  const consent = clean(formData.get("Consent"), 10);

  if (!firstName || !lastName) {
    return json({ ok: false, error: "First and last name are required." }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json({ ok: false, error: "Please enter a valid email address." }, 400);
  }
  if (consent !== "Yes") {
    return json({ ok: false, error: "The consent checkbox is required." }, 400);
  }

  // --- 4. Insert into D1 ------------------------------------------------------
  try {
    await env.DB.prepare(
      `INSERT INTO supporters
         (first_name, last_name, email, zip, area, willing_to, comment, consent, source)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'Yes', 'website')
       ON CONFLICT(email) DO NOTHING`
    )
      .bind(
        firstName,
        lastName,
        email,
        zip || null,
        area || null,
        willingTo || null,
        comment || null
      )
      .run();
  } catch (err) {
    console.error("D1 insert failed:", err.message);
    return json(
      { ok: false, error: "We couldn't save your sign-up. Please try again in a moment." },
      500
    );
  }

  // Duplicate email = already on the list = success from the visitor's view.
  return succeed();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/signup") {
      if (request.method !== "POST") {
        return json({ ok: false, error: "Method not allowed." }, 405);
      }
      return handleSignup(request, env);
    }

    // Everything else: serve the static site.
    return env.ASSETS.fetch(request);
  },
};
