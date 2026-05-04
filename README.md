# Luna — Period & Cycle Tracker

A privacy-first period tracker built with React Native + Expo, targeting Android first.

## Quick start

```bash
cd luna-tracker
npm install --legacy-peer-deps
npx expo start
```

> **Note:** `--legacy-peer-deps` avoids rare peer-resolution conflicts between charting and navigation packages. If you prefer strict peers, install without it and resolve any peer warnings manually.

Open the dev menu and choose Android. For a full feature build (notifications, biometrics, SQLite native modules) use a development build:

```bash
npx expo prebuild --clean   # only if you need a custom dev client
eas build -p android --profile development
```

## Build APKs

See section 18 of the master spec. **Before your first cloud build:**

1. Replace `com.yourname.lunatracker` in `app.json` (`ios.bundleIdentifier`, `android.package`) with your own reverse-DNS id.
2. Run `eas init` from this folder — it writes your real `extra.eas.projectId` into `app.json` (replacing `YOUR_EAS_PROJECT_ID`).
3. Replace the tiny placeholder PNGs under `assets/` with proper **1024×1024** icons and a real splash (`splash.png` is referenced as 1284×2778 in the product spec).

Quick reference:

```bash
npm install -g eas-cli
eas login
eas init
eas build -p android --profile preview
eas build -p android --profile production
```

## Project layout

All source lives under `src/`. See `src/app/index.tsx` for the root entry.

| Area | Path |
| --- | --- |
| Screens | `src/screens/` |
| Components | `src/components/{calendar,logging,insights,shared}/` |
| Navigation | `src/navigation/` |
| State (Zustand) | `src/store/` |
| Services | `src/services/{database,notifications,prediction}/` |
| Hooks | `src/hooks/` |
| Types | `src/types/` |
| Constants | `src/constants/` |
| Utilities | `src/utils/` |

## Privacy

- All cycle, log, and symptom data lives in a local SQLite database (`expo-sqlite`).
- No data leaves the device. There is no remote backend.
- `android:allowBackup="false"` prevents unencrypted system backups.
- Optional biometric lock (Section 16 of the spec) gates the app after 5+ minutes idle.

## Bundle identity

Replace the placeholders in `app.json` before your first EAS build:

- `ios.bundleIdentifier` and `android.package` — currently `com.yourname.lunatracker`
- `extra.eas.projectId` — currently `YOUR_EAS_PROJECT_ID`, populated automatically by `eas init`
