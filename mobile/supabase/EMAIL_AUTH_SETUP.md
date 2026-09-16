# Supabase email verification setup (REQUIRED)

The mobile app now uses **Supabase Auth email OTP**. The old Express/Nodemailer demo OTP is not used.

## 1. Enable Email authentication

Supabase Dashboard -> Authentication -> Sign In / Providers -> Email.

- Enable the Email provider.
- Keep anonymous sign-in OFF.
- The app uses passwordless OTP, so users do not need a password.

## 2. Configure custom SMTP before testing Richfield student addresses

This is required for real student emails. Supabase's default SMTP only sends to pre-authorized project-team addresses and is heavily rate-limited.

Dashboard path: Authentication -> Emails -> SMTP Settings.

You can use any SMTP provider (for example Resend, SendGrid, Postmark, Amazon SES, or a Gmail/Google Workspace account with an app password).

Example Gmail SMTP values:

- Host: `smtp.gmail.com`
- Port: `587`
- Username: your sending Gmail/Workspace address
- Password: a Google **App Password**, not the normal account password
- Sender email: the same verified sending address
- Sender name: `Richfield Enrich`

Do not put SMTP passwords in the Expo app or GitHub.

## 3. Make the email contain a code

Dashboard -> Authentication -> Email Templates -> Magic Link / OTP.

Use the contents of `email_otp_template.html` or, at minimum, ensure the template contains:

`{{ .Token }}`

The mobile app asks the user to type this code and verifies it with `supabase.auth.verifyOtp(...)`.

## 4. Student and alumni rule

- Student registration: must end in `@my.richfield.ac.za`.
- Alumni registration: also uses the same original `@my.richfield.ac.za` address.
- When a student graduates and registers/updates as alumni using the same email, the same Supabase Auth identity is reused; a second account is not required.

The database trigger also enforces the Richfield email domain for student/alumni account creation.

## 5. Business rule

Recruiters may use their corporate email address. The email OTP proves ownership of that mailbox, but the profile remains `pending` until a Richfield admin approves it in the app.

## 6. Admin rule

Admin is not a public registration option. Create the account in Supabase Authentication first, then promote the profile using the instructions in `ADMIN_SETUP.md`.
