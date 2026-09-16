-- Enrich live-demo role helpers
-- Use these ONLY for tomorrow's demo setup after the real accounts have been created through the app.
-- Replace the email addresses before running.

-- 1) Make one verified account an administrator.
-- Recommended: create/sign up a separate staff/admin email first, then run this.
update public.profiles
set role = 'admin',
    verification_status = 'verified',
    updated_at = now()
where lower(email) = lower('PUT_ADMIN_EMAIL_HERE');

-- 2) Approve a real business/recruiter account after they verified email.
update public.profiles
set verification_status = 'verified',
    business_details = jsonb_set(
      coalesce(business_details, '{}'::jsonb),
      '{approvalStatus}',
      '"approved"'::jsonb,
      true
    ),
    updated_at = now()
where lower(email) = lower('PUT_BUSINESS_EMAIL_HERE')
  and role = 'business';

-- 3) Convert a real student account to alumni without losing their history.
update public.profiles
set role = 'alumni',
    verification_status = 'verified',
    graduation_year = 2026,
    current_company = 'Graduate Alumni Demo',
    headline = coalesce(nullif(headline, ''), 'Richfield Alumni Mentor'),
    updated_at = now()
where lower(email) = lower('PUT_ALUMNI_EMAIL_HERE')
  and role in ('student', 'alumni');
