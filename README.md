# Enrich - Richfield College Mobile (Expo + Supabase)

Android-first institutional professional ecosystem for Richfield College. This branch is the React Native / Expo app and now uses **Supabase Auth + PostgreSQL + Storage** instead of in-memory demo accounts and mock application state.

## Current architecture

- **Mobile:** Expo SDK 57, React Native, React Navigation
- **Authentication:** Supabase Auth passwordless email OTP
- **Database:** Supabase PostgreSQL with Row Level Security
- **Storage:** Supabase Storage (`enrich-media` bucket)
- **Server API:** Express/Node only for Gemini AI/server-secret functionality
- **AI:** `@google/genai`; fallback responses remain available if Gemini is not configured

## What is persistent now

The database schema covers:

- Profiles and role/verification status
- Posts, comments, likes
- Opportunities and applications
- Events and RSVPs
- Connections and direct messages
- Endorsements
- Q&A questions and answers
- Notifications and admin broadcasts
- Business approval and opportunity moderation
- Media storage policy

The old hard-coded test users, demo persona login, simulated OTP and mock feed/job/event data have been removed from runtime state.

## Roles

- `student` - requires `@my.richfield.ac.za`
- `alumni` - uses the same original `@my.richfield.ac.za` account
- `business` - corporate email OTP + Richfield admin approval
- `admin` - not publicly registerable; provisioned securely in Supabase

## Required Supabase setup

1. Open your existing Supabase project.
2. SQL Editor -> New query.
3. Run the full `supabase/schema.sql` file.
4. Configure **custom SMTP** and the OTP email template by following `supabase/EMAIL_AUTH_SETUP.md`.
5. Create the first admin using `supabase/ADMIN_SETUP.md`.

Do not skip custom SMTP if you need OTPs delivered to real Richfield student addresses. Supabase's built-in mail sender is not suitable for that.

## Environment

Create `.env.local` in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY="YOUR-PUBLISHABLE-KEY"

# Express/Gemini API
EXPO_PUBLIC_API_URL="http://10.0.2.2:3000"
PORT=3000
GEMINI_API_KEY=""
```

For a physical Android phone, replace `EXPO_PUBLIC_API_URL` with your PC's LAN IP, for example:

```env
EXPO_PUBLIC_API_URL="http://192.168.1.25:3000"
```

The phone and PC must be on the same Wi-Fi when the Gemini server runs locally.

## Install

Because dependencies changed, use:

```bash
npm install --legacy-peer-deps
```

This updates `package-lock.json` with:

- `@supabase/supabase-js`
- `@react-native-async-storage/async-storage`
- `react-native-url-polyfill`

## Run on a physical Android phone first

### Terminal 1 - optional Gemini API

```bash
npm run server
```

The database and authentication do **not** need this Express server. Supabase is cloud-hosted. The server is needed only for the Gemini endpoints.

### Terminal 2 - Expo

```bash
npx expo start --tunnel
```

or, if phone and PC are on the same Wi-Fi:

```bash
npm start
```

Install Expo Go on the Android phone and scan the QR code.

## Verification flow

### Student / alumni registration

1. Select Student or Alumni.
2. Enter full details and the `@my.richfield.ac.za` email.
3. Mobile app asks Supabase Auth to send a passwordless email OTP.
4. Supabase sends the real code using the configured SMTP server.
5. User enters the code in the app.
6. `verifyOtp` proves mailbox ownership and creates/opens the Supabase session.
7. The profile is written to `profiles`.
8. Student/alumni status becomes `verified`.
9. App loads all persistent Supabase data.

A student who later becomes alumni uses the **same Richfield email and same Auth UUID**. Their profile is updated to `alumni`; posts, connections and history stay attached to the same account.

### Recruiter registration

1. Recruiter enters corporate details and email.
2. OTP verifies that email.
3. Profile is stored with `verification_status = pending`.
4. Recruiter is signed out and cannot access student data yet.
5. Admin reviews the business in Admin -> Vetting.
6. Approval changes the profile to `verified`.
7. Recruiter can sign in and use recruiter features.

### Login

1. User enters registered email.
2. Supabase sends an OTP.
3. User enters OTP.
4. App loads the database profile.
5. Only verified profiles enter the main workspace.


## Updated local / EAS run commands

This updated branch keeps the newer Expo/EAS workflow:

```bash
npm start                 # LAN + clear cache
npm run start:lan
npm run start:localhost
npm run start:tunnel
npm run android
npm run android:dev
npm run android:apk       # local EAS preview APK
npm run android:apk:cloud # cloud EAS preview APK
npm run prebuild:android
```

`eas.json` is retained from the updated mobile branch, including development, preview APK, and production profiles.


## Test checklist for tomorrow

Use real accounts, not demo personas.

1. Register a real Richfield student and receive OTP by email.
2. Close/reopen the app and sign in again; session/profile should persist.
3. Create a post; restart the app; confirm the post remains.
4. Comment and like; confirm persistence.
5. Register a business and verify its email; confirm it remains pending.
6. Sign in as admin and approve the business.
7. Business signs in and posts an opportunity.
8. Admin approves the opportunity.
9. Student applies with phone/availability/motivation.
10. Admin creates an event; student RSVPs.
11. Two verified accounts connect and exchange messages.
12. Ask and answer a Q&A question.
13. Edit profile skills/headline and restart app to verify persistence.
14. Run Gemini endpoint if the presentation requires live AI.

## Tablet and desktop optimization

The backend does not need to change. Supabase is shared by phone, tablet and desktop clients.

Order of work:

1. Verify Android phone functionality first.
2. Test on a wider Android tablet/emulator and adjust React Native `StyleSheet` layout where needed.
3. Use Expo web / responsive screen-width logic for desktop later.

All clients use the same Auth users, PostgreSQL rows and storage bucket.

## Important security notes

- Never put a Supabase secret/service-role key in Expo code.
- The Expo app uses only the publishable key.
- Row Level Security is enabled in `schema.sql`.
- Admin self-registration is removed.
- Business accounts cannot self-approve.
- Gemini and other server-only secrets stay in the Express server environment.
