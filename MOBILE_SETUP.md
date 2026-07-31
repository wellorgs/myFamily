# myFamily Mobile App - Android Setup

This project is now configured as a mobile app using Capacitor for Android.

## Prerequisites

- **Node.js** 18+ and npm
- **Android SDK** (API 30 or higher)
- **Android Studio** (recommended for building/running)
- **Java Development Kit (JDK)** 11 or higher

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Web Assets
```bash
npm run build
```

### 3. Sync to Android
```bash
npm run mobile:sync
```

### 4. Open in Android Studio
```bash
npm run mobile:dev
```
or manually:
```bash
npx cap open android
```

### 5. Build APK/AAB
In Android Studio:
1. Select **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Find output in: `android/app/build/outputs/apk/`

## Development Workflow

### Quick Rebuild After Changes
```bash
npm run build && npm run mobile:sync
```

### Full Mobile Build
```bash
npm run mobile:build
```

### Sync Only (no rebuild)
```bash
npm run mobile:sync
```

## Environment Variables

Create a `.env.local` file with:
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
VITE_GEMINI_API_KEY=your_gemini_key
```

## Building for Release

1. Update version in `android/app/build.gradle`
2. Create signed keystore (if not exists)
3. In Android Studio:
   - **Build** → **Generate Signed Bundle/APK...**
   - Select keystore and sign

## Troubleshooting

### Assets not updating
```bash
npm run build
rm -rf android/app/src/main/assets/public
npm run mobile:sync
```

### Gradle sync errors
```bash
cd android
./gradlew clean
cd ..
npm run mobile:sync
```

### Port conflicts
App runs on device/emulator, not localhost.

## Plugins

Installed Capacitor plugins:
- `@capacitor/app` - App lifecycle
- `@capacitor/keyboard` - Keyboard handling
- `@capacitor/status-bar` - Status bar styling
- `@capacitor/splash-screen` - Splash screen
- `@capacitor/haptics` - Vibration feedback
- `@capacitor/push-notifications` - Push notifications

## Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Setup](https://capacitorjs.com/docs/android)
- [Firebase in Native Apps](https://firebase.google.com/docs/android/setup)
