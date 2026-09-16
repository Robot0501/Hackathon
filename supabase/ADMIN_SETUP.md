# Create the first Enrich administrator

Admin accounts must not be created from the public mobile registration screen.

## Step 1 - Create the Auth user

In Supabase Dashboard:

Authentication -> Users -> Add user / Create user

Use the real Richfield staff email address that will be used to sign in.

## Step 2 - Ensure the profile row exists

If the Auth user was created after `schema.sql` was run, the trigger should create a profile automatically. Check Table Editor -> `profiles`.

If the profile is missing, insert it using the Auth user's UUID.

## Step 3 - Promote the account

Run this in SQL Editor, replacing the email:

```sql
update public.profiles
set role = 'admin',
    verification_status = 'verified',
    headline = 'Richfield Enrich Administrator',
    updated_at = now()
where lower(email) = lower('YOUR-STAFF-EMAIL@richfield.ac.za');
```

The staff member can then use the normal mobile **Sign In** screen. Supabase sends the OTP to their email. The Admin tab appears only when the database profile role is `admin`.
