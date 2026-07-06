-- CART supporter list — Cloudflare D1 schema
-- Run once against the database (dashboard console or Wrangler, see SETUP.md).

CREATE TABLE IF NOT EXISTS supporters (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  email        TEXT NOT NULL COLLATE NOCASE UNIQUE,
  zip          TEXT,                                     -- optional
  area         TEXT,                                     -- township dropdown, optional
  willing_to   TEXT,                                     -- comma-separated checkbox values
  comment      TEXT,                                     -- "How does corridor traffic affect you?"
  consent      TEXT NOT NULL DEFAULT 'Yes',
  source       TEXT NOT NULL DEFAULT 'website',          -- 'website' | 'manual' | 'event' ...
  signed_up_at TEXT NOT NULL DEFAULT (datetime('now'))   -- UTC timestamp
);

-- Useful for pulling supporters/comments by township before a trustee meeting.
CREATE INDEX IF NOT EXISTS idx_supporters_area ON supporters(area);

------------------------------------------------------------------------------
-- Handy queries (don't run as part of setup — copy/paste when needed)
------------------------------------------------------------------------------

-- All supporters, newest first:
--   SELECT * FROM supporters ORDER BY signed_up_at DESC;

-- Count by township:
--   SELECT area, COUNT(*) AS n FROM supporters GROUP BY area ORDER BY n DESC;

-- Every comment from Miami Township residents:
--   SELECT first_name, last_name, comment FROM supporters
--   WHERE area = 'Miami Township' AND comment IS NOT NULL AND comment != '';

-- Everyone who volunteered to attend a meeting:
--   SELECT first_name, last_name, email FROM supporters
--   WHERE willing_to LIKE '%Attend a meeting%';
