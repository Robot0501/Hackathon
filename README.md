# Enrich - Richfield College Mobile (Expo, Android)

Institutional professional ecosystem for Richfield College connecting verified students (`@my.richfield.ac.za`), alumni, employers (business), and administrators. **Migrated from Vite web to React Native (Expo) for Android-only hackathon.**

## Tech Stack
- **Mobile:** Expo SDK 57, React 19.2, React Native 0.86, React Navigation (Stack + Bottom Tabs), `lucide-react-native` + `react-native-svg`, `react-native-safe-area-context`, `react-native-screens`, `react-native-gesture-handler`, `react-native-reanimated`
- **Backend API:** Express 4, Node.js, `dotenv`, `cors`, `nodemailer` (OTP), `@google/genai` (Gemini - optional, falls back to mocks)
- **State:** In-memory mock data (`src/data/mockData.ts`) + React Context (`src/context/AppContext.tsx`). No DB yet (separate branch). 4 roles: `student | alumni | business | admin` (`src/types.ts:1`)

## Prerequisites
- Node.js 20+ (tested Node v24.11.1)
- Android: Expo Go app on physical device **or** Android Studio Emulator, or `EAS Build` for APK
- (Optional) `GEMINI_API_KEY` for live AI; app works in demo mode without it

## Install
```bash
npm install --legacy-peer-deps
```

## Run Backend API (Required for OTP + Gemini live)
In one terminal:
```bash
npm run server
# or: npx tsx server.ts
# Health: http://localhost:3000/api/health  -> { status: "ok", mode: "mobile-api" }
```
Env: copy `.env.example` -> `.env.local` and set `GEMINI_API_KEY`, `SMTP_*` if you want real email. Without SMTP, OTP runs in **demo mode** (code returned in API response and logged to server console, auto-fill button available in app).

For Android device/emulator accessing host `localhost`:
- Emulator: `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000` (default fallback in code)
- Physical device on same Wi-Fi: `EXPO_PUBLIC_API_URL=http://<YOUR_PC_IP>:3000` -> set in `.env.local` as `EXPO_PUBLIC_API_URL=http://192.168.x.x:3000` then restart expo

## Run Mobile App (Android)

### Option A: Expo Go (Fastest for Hackathon Demo)
```bash
npm start
# or: npx expo start
# Scan QR with Expo Go (Android) -> app loads via Metro bundler
# Ensure device and PC on same Wi-Fi, or use tunnel: npx expo start --tunnel
```

### Option B: Emulator
```bash
npm run android
# or: npx expo start --android
# Requires Android Studio + emulator running
```

### Option C: Production APK (EAS)
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
# APK installs directly on Android without Expo Go
```

## App Structure
```
App.tsx                          # GestureHandlerRootView + SafeAreaProvider + AppProvider + AppNavigator
src/
  types.ts                       # Shared types (UserProfile, Post, Opportunity...)
  data/mockData.ts               # Mock users, opportunities, posts, events (4 roles)
  theme.ts                       # Colors (Richfield palette #2B193D etc)
  context/AppContext.tsx         # Global state (users, posts, connections, etc) + actions
  navigation/
    AppNavigator.tsx             # RootStack (Home -> Login -> Register -> VerifyOTP -> MainTabs) + BottomTabs (Feed, Opportunities, Network, AI, Profile, Admin*)
    types.ts
  screens/
    HomeScreen.tsx               # Landing (hero, metrics, demo persona quick-login)
    LoginScreen.tsx              # Email + OTP 2FA, demo persona list
    RegisterScreen.tsx           # 4 roles (student/alumni/business/admin) + validation
    VerifyOTPScreen.tsx          # 6-digit OTP (demo auto-fill)
    FeedScreen.tsx               # Campus feed, create post, video pitch, likes, comments
    OpportunitiesScreen.tsx      # Jobs + Events tabs, search/filter, matchScore, apply flow, post opportunity
    NetworkScreen.tsx            # Discover, Messages (1-1), Q&A forum, Leaderboard
    AIAssistantScreen.tsx        # Profile Coach, Career Chatbot, NLP CV Extractor (calls /api/gemini/*)
    ProfileScreen.tsx            # Dossier, edit headline/summary, skills, badges, CV export via expo-file-system + sharing
    AdminScreen.tsx              # Vetting queue, Users, Moderation, Events, Broadcast (admin only)
assets/                          # Expo icons (icon.png, adaptive icons)
server.ts                        # Standalone Express API (CORS enabled, no Vite)
app.json                         # Expo config (slug: enrich-richfield, package: com.richfield.enrich)
babel.config.js                  # babel-preset-expo + reanimated plugin
```

## Key Changes from Web
- Removed: `vite.config.ts`, `index.html`, `src/main.tsx`, `src/index.css`, `react-dom`, `vite`, `@tailwindcss/vite`, `motion`, `lucide-react` -> replaced with `react-native` primitives, `lucide-react-native`, `StyleSheet`, `SafeAreaView`, `FlatList`/`ScrollView`, `Modal`, `expo-file-system` for CV export, `expo-av` placeholder for video.
- Navigation: `useState('feed')` web tabs -> `React Navigation` Bottom Tabs + Native Stack. Admin tab conditional on `role === 'admin'`. Mobile frame toggle removed (native is mobile).
- Styling: Tailwind `className` -> `StyleSheet` + `theme.ts` palette. Responsive `sm:` prefixes removed.
- Backend: Removed `createViteServer` middleware. Now pure API with `cors` (`server.ts:4-15`). Frontend calls `10.0.2.2:3000` for emulator, fallback mocks if offline.
- Types: `src/types.ts` unchanged (pure TS, reusable). Mock data kept (`MOCK_USERS` etc).
- Build: `npm start` now `expo start`, `npm run server` for API. `npm run dev` (web) removed.

## Environment
```dotenv
# .env.local
GEMINI_API_KEY="your_gemini_key" # optional, falls back to mock profile/chat/NLP if empty
APP_URL="http://localhost:3000"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="your-email@gmail.com"
EXPO_PUBLIC_API_URL="http://10.0.2.2:3000" # or http://192.168.0.100:3000 for physical device
PORT=3000
```

## Verification
- `npm run lint` -> `tsc --noEmit` passes (excludes backup)
- `npx expo config --type public` -> validates `app.json`
- `curl http://localhost:3000/api/health` -> `{"status":"ok","mode":"mobile-api"}`
- Demo login: Home -> Tap any persona (Thabo/Lerato/Sarah/Dr. Dlamini) -> directly enters app with role-specific tabs. Or Register/Login with OTP demo code auto-fill.

## Android Notes
- `app.json` `android.package: com.richfield.enrich`, `adaptiveIcon` configured for Play Store.
- No web build required. `dist/` ignored. Use `eas build` for APK.
- Physical device: ensure `EXPO_PUBLIC_API_URL` uses PC LAN IP, not localhost, and firewall allows port 3000.

## Next Branch (Not in this migration)
- Real DB (Supabase/Firestore) to replace in-memory `AppContext`
- Push notifications (`expo-notifications`)
- Camera/video capture for pitch (`expo-image-picker`, `expo-av` full playback)
- `expo-secure-store` for persisted auth
- EAS Update/OTA

Original AI Studio: https://ai.studio/apps/c72dad33-119a-44e4-9552-df8eaff43045
