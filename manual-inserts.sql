-- Manual insert for CART's two existing supporters.
-- Fill in the real values, then run in the D1 console (dashboard) or via Wrangler.
-- Leave any optional field as NULL if you don't have it.
-- signed_up_at format: 'YYYY-MM-DD HH:MM:SS' (or just 'YYYY-MM-DD').

INSERT INTO supporters
  (first_name, last_name, email, zip, area, willing_to, comment, consent, source, signed_up_at)
VALUES
  ('FIRST1', 'LAST1', 'email1@example.com', '45150', 'Miami Township',
   'Get updates', NULL, 'Yes', 'manual', '2026-06-15'),
  ('FIRST2', 'LAST2', 'email2@example.com', NULL, 'Goshen Township',
   'Get updates', NULL, 'Yes', 'manual', '2026-06-20');

-- Verify:
--   SELECT * FROM supporters;
