# Enrich Admin Web - Richfield College (Prototype)

Simple, uncluttered React web portal for the `admin` role. Shares the **same Supabase project** as the mobile app (`mobile/`).

- **Mobile:** `mobile/` (Expo, student/alumni/business)
- **Admin Web:** `admin_web/` (Vite React, admin only) -> Supabase `uzwovrzquofdsqrzphlq.supabase.co`

No hosting - run locally as prototype.

## Stack
- Vite 8 + React 19 + TypeScript + Tailwind 3 + React Router 6
- Supabase JS 2.116 (same DB as mobile)
- Lucide React (icons)

## Run

```bash
cd admin_web
npm install
# .env already has VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY (same as mobile)
npm run dev   # http://localhost:5173
npm run build # dist/
```

Concurrently run mobile:
```bash
cd mobile
npm install --legacy-peer-deps
npx expo start --host lan --clear   # or --tunnel
```

## Supabase Connection
`src/lib/supabase.ts` uses `VITE_SUPABASE_URL=https://uzwovrzquofdsqrzphlq.supabase.co` + `sb_publishable_5sfQ4SzcyvW2rS-SN_Gydw_Dh4Yy9pg` (same as `mobile/src/lib/supabase.ts`). All admin writes (`profiles`, `opportunities`, `posts`, `events`, `notifications`) are instantly visible in mobile after refresh.

## Admin Login
- `/login` uses `supabase.auth.signInWithPassword` then `getProfile` check `role==='admin' && verification_status==='verified'`.
- Admins must be created via Supabase Dashboard (Auth -> Create User, then `profiles` row `role='admin'`), see `mobile/supabase/ADMIN_SETUP.md`.
- Non-admin logins are rejected and signed out.

## Pages (Simple, Not Cluttered)

| Route | Purpose | Supabase Tables |
|---|---|---|
| `/` | Dashboard KPIs (pending businesses/opps, users, posts, events) | `profiles`, `opportunities`, `posts`, `events` |
| `/businesses` | Vetting queue: pending/approved/rejected businesses, Approve/Reject, AI Review drawer (local heuristic + optional `VITE_API_URL/api/gemini/admin-verification`) | `profiles` where `role='business'`, `adminSetBusinessStatus` |
| `/opportunities` | Pending opportunities approve/reject | `opportunities` `status` |
| `/users` | Grouped registry (Students/Alumni/Businesses/Admins), search | `profiles` |
| `/moderation` | Feed posts, Remove | `posts`, `post_likes`, `comments` |
| `/events` | Publish event + list active events | `events` |
| `/broadcast` | Announcement to `all`/`students`/`alumni`/`business` | `notifications` per filtered `profiles` |

All pages use `src/lib/dataService.ts` (ported from `mobile/src/lib/dataService.ts`) for Supabase queries, so logic stays in sync with mobile.

## Project Structure
```
admin_web/
  src/
    lib/supabase.ts   # web client (VITE_ env)
    lib/dataService.ts # Supabase queries
    lib/authService.ts # profileFromRow, getProfile
    types.ts          # copy of mobile/src/types.ts
    context/AuthContext.tsx
    components/Layout.tsx, ProtectedRoute.tsx
    pages/LoginPage.tsx, DashboardPage.tsx, BusinessesPage.tsx, OpportunitiesPage.tsx, UsersPage.tsx, ModerationPage.tsx, EventsPage.tsx, BroadcastPage.tsx
  vite.config.ts
  tailwind.config.js
```

## Prototype Notes
- No hosting, no EAS - run `npm run dev` locally.
- Not cluttered: single sidebar, clean tables, no extra charts.
- Mobile `AdminScreen.tsx` can be deleted after web is verified (currently kept for fallback).
