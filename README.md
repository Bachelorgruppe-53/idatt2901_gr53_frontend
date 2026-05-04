# SJUK Frontend

Frontend for SJUK (St. Olavs Jakt etter Utdanning- og Karrieremuligheter), built with Expo, React Native, and Expo Router.

The app helps users discover careers through:

- QR code scanning
- map-based exploration
- quizzes and points
- class competitions and scoreboards
- unlocked careers and achievements

## Tech stack

- Expo SDK 55
- React Native 0.83
- React 19
- Expo Router (file-based routing)
- i18next + react-i18next (multilingual UI)
- Axios (API client)
- Jest + @testing-library/react-native (testing)

## Main features

- Home flow with user summary, competition info, and class join modal
- QR scanner flow for career discovery
- Interactive map experience
- Stats with class, school, and city leaderboards
- Achievements and unlocked careers
- Settings for language, theme, notifications, privacy, feedback, and class leave

## Project structure

Key folders:

- app/: Expo Router routes
  - app/(tabs)/index.tsx: home screen
  - app/(tabs)/map.tsx: map screen
  - app/(tabs)/stats/: scoreboards
  - app/(tabs)/achievements.tsx: careers and badges
  - app/(tabs)/settings/: settings subpages
- src/components/: reusable UI and feature components
- src/hooks/: custom hooks (home, QR scanner, theming, quiz, etc.)
- src/context/: global context providers (theme)
- src/i18n/: localization config and translation files
- services/: API and storage layer
- [__tests__](__tests__/): unit- og integrasjontests

## Prerequisites

- Node.js 20.19.4 or newer (includes npm)
- Xcode (for iOS simulator/builds on macOS)
- Android Studio (for Android emulator/builds)

Then follow these steps:

1. Install dependencies:

```bash
npm install
```

2. Configure the API base URL if needed:

Create a .env file in the root directory to persist your local configuration:

```bash
EXPO_PUBLIC_API_URL=http://YOUR_BACKEND_HOST:8080
```

If this is not set, the app falls back to environment-aware defaults in `services/apiConfig.ts`.

Development build (dev-client)
--------------------------------
Some native libraries used by this project (camera, maps, secure storage, dev-menu etc.) are not available in the stock Expo Go app. Build and install a development client (dev-build) on the simulator/device when you need full native functionality:

```bash
# iOS simulator: build & install dev client, then start Metro for dev-client
npx expo run:ios
npx expo start --dev-client

# Android emulator
npx expo run:android
```

The project includes `expo-dev-client` in `package.json`; use the commands above when you see errors like "No development build for this project is installed." Restart the Metro server after installing the dev-client.

3. Start the development server (local):

```bash
npx expo start
```

Useful start options:

- `npx expo start --clear` to clear the Metro cache
- Press `i` in the Expo CLI to open the iOS simulator (Xcode is needed)
- Press `a` in the Expo CLI to open the Android emulator

## Available scripts

- npm run lint: run Expo ESLint checks
- npm test: run Jest tests
- npm run test:watch: run Jest in watch mode

Run coverage:

```bash
npm test -- --coverage --watch=false
```

## Routing and app bootstrap

- app/\_layout.tsx sets up root providers and stack navigation
- app/(tabs)/\_layout.tsx defines native tab navigation
- Theme provider is mounted globally via src/context/ThemeContext.tsx
- Localization is initialized in src/i18n/config.ts

## Localization

Supported language tags:

- en-US
- no-NB
- no-NN

Translation namespaces include common, auth, navbar, settings, home, aboutCareer, stats, class, quiz, map, and qrScanner.

## Theming

Theme mode options:

- system
- light
- dark

Theme preferences are persisted via secure storage.

## Backend integration

API base URL is resolved by:

1. EXPO_PUBLIC_API_URL (if provided)
2. Expo dev host IP in development
3. Android emulator fallback 10.0.2.2 (development)
4. default host fallback

See services/apiConfig.ts and services/authService.ts for details.

## EAS build and release

Build profiles are defined in eas.json:

- development
- development-simulator
- preview
- production

Typical commands:

- npx eas-cli@latest build --platform ios -s
- npx eas-cli@latest build --platform android -s

## Testing strategy

The test suite in [__tests__](__tests__/)
covers:

- hooks
- service modules
- context logic
- component behavior

Notes:

- The project uses manual Jest mocks for native Expo packages (see the `__mocks__` folder). This keeps tests fast and prevents native module errors in Node/Jest.
- If you encounter peer-dependency or install errors, try:

```bash
npm install --legacy-peer-deps
```

Use these tests as the first safety net before merging frontend changes.

## Troubleshooting

- App cannot reach backend:
  - Verify `EXPO_PUBLIC_API_URL` and backend port
  - Confirm device/emulator can access your backend host
-- Native module issues when running in Expo Go (Expo Go may not be compatible with Expo SDK 55):
  - Use a development build when required by native dependencies (see "Development build (dev-client)" above)
  - If you get a "No development build installed" error, uninstall the previous build and reinstall the dev client on the simulator:

```bash
# Uninstall app from the currently booted simulator
xcrun simctl uninstall booted com.brahimage.appBacheloroppgave

# Then build+install a dev client
npx expo run:ios
```

- Stale metro cache:
  - Run `npx expo start --clear`

## Documentation references

- Expo docs: https://docs.expo.dev
- Expo Router docs: https://docs.expo.dev/router/introduction/
- React Native docs: https://reactnative.dev/docs/getting-started
- EAS docs: https://docs.expo.dev/eas/

## Authors / Team
Developed as part of a Bachelor's thesis in Computer Science at NTNU:
- **Anne Cecilie Nilsen** - Frontend (Mobileapplication Lead)
- **Brahim Helland** - Frontend (Admin Webpages Lead)
- **Ingrid Midtmoen Døvre** - Backend & Database Lead