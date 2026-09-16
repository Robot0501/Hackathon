-- OPTIONAL CLEANUP: run only if these exact original demo accounts were accidentally
-- created in your Supabase Auth project. Deleting auth.users cascades to profiles and
-- related Enrich data through the foreign keys in schema.sql.

-- Review first:
select id, email, created_at
from auth.users
where lower(email) in (
  'thabo.molefe@my.richfield.ac.za',
  'lerato.khumalo@alumni.richfield.ac.za',
  'sarah.jenkins@standardbank.co.za',
  'admin@richfield.ac.za'
);

-- Uncomment ONLY after confirming the rows above are test accounts.
-- delete from auth.users
-- where lower(email) in (
--   'thabo.molefe@my.richfield.ac.za',
--   'lerato.khumalo@alumni.richfield.ac.za',
--   'sarah.jenkins@standardbank.co.za',
--   'admin@richfield.ac.za'
-- );
