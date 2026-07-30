# myFamily

A comprehensive family management application built with modern web technologies and Firebase backend. Stay connected with your loved ones through health tracking, messaging, and family coordination.

## Features

- 👨‍👩‍👧‍👦 **Family Management** - Create and manage family groups with invite codes
- 🏥 **Health Tracking** - Monitor health metrics and appointments
- 💊 **Medicine Management** - Track medications and schedules
- 📱 **Multi-Platform** - Web and native Android support via Capacitor
- 🔐 **Secure Authentication** - Firebase Auth with role-based access
- 💬 **Real-time Updates** - Firestore for instant data synchronization
- 🎯 **AI Insights** - Gemini-powered recommendations and suggestions
- 💳 **Payment Processing** - Stripe integration for premium features

## Tech Stack

- **Frontend**: React 19, TanStack Start/Router, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage, FCM)
- **Mobile**: Capacitor 7 (iOS & Android support)
- **Testing**: Playwright E2E tests
- **Build**: Vite with TypeScript
- **Payments**: Stripe
- **AI**: Google Gemini

## Quick Start

### Prerequisites
- Node.js 18+ or Bun
- npm or yarn

### Installation & Development

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env
# Edit .env with your Firebase and Stripe credentials

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Test Users

```bash
npm run seed:test-users
```

Test accounts:
- **Parent**: `parent@test.myfamily.app` / `Test1234!`
- **Family Member**: `family@test.myfamily.app` / `Test1234!`

## Project Structure

```
myfamily/
├── src/
│   ├── components/        # React components
│   │   ├── mobile/       # Mobile-specific UI
│   │   └── ui/           # Reusable UI components
│   ├── routes/           # TanStack Router pages
│   ├── lib/              # Utilities & business logic
│   │   ├── queries/      # React Query hooks
│   │   └── firebase/     # Firebase integration
│   ├── integrations/     # External service integrations
│   └── styles.css        # Tailwind styles
├── tests/                # E2E and unit tests
├── public/               # Static assets
├── firebase.json         # Firebase config
├── firestore.rules       # Firestore security rules
└── package.json          # Dependencies
```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Then fill in your actual API keys. **Never commit the `.env` file** - it's in `.gitignore` for security.

```env
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key

# Firebase Admin (for backend)
FIREBASE_ADMIN_SDK_KEY=your_admin_key

# Google Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key
```

⚠️ **Security Note**: See [SECURITY.md](./SECURITY.md) for detailed information on handling sensitive keys safely.

## Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Building
npm run build        # Build for production
npm run build:web    # Build web version
npm run build:app    # Build mobile app

# Testing
npm run test:e2e     # Run Playwright E2E tests
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Mobile
npm run cap:sync     # Sync Capacitor plugins
npm run cap:android  # Open Android Studio

# Utilities
npm run seed:test-users  # Seed test data
npm run preview          # Preview production build
```

## Authentication Routes

- `/auth` - Login/Registration
- `/forgot-password` - Password recovery
- `/reset-password` - Password reset
- `/onboarding` - Role selection & profile setup
- `/onboarding/profile` - Complete user profile
- `/onboarding/family` - Create or join family

## Firebase Setup

### Collections

- `profiles/{userId}` - User profile data
- `families/{familyId}` - Family information
- `families/{familyId}/family_members/{userId}` - Family membership
- `families/{familyId}/user_roles/{userId}` - Role assignments
- Various data collections (health, appointments, medicines, etc.)

### Security Rules

Rules are defined in `firestore.rules` and `storage.rules`. Deploy with:

```bash
firebase deploy --only firestore:rules,storage
```

### Indexes

Custom indexes are in `firestore.indexes.json`.

## Mobile App Development

### Build for Android

```bash
npm install
npm run build:app
npm run cap:sync
npm run cap:android
```

Then build APK from Android Studio.

### Build for iOS

```bash
npm run cap:sync
npm run cap:open ios
```

## Testing

### E2E Tests with Playwright

```bash
npm run test:e2e
```

Tests are located in `tests/` directory.

## Deployment

### Web
Deploy to Firebase Hosting, Vercel, Netlify, or any static host.

### Mobile
Build release APK in Android Studio and publish to Google Play Store.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run format` to format code
4. Run `npm run lint` to check for errors
5. Commit and push
6. Create a Pull Request

## License

Private repository - All rights reserved

## Support

For issues and questions, please check existing GitHub issues or create a new one.

## Related Documentation

- [Security Guide](./SECURITY.md) - 🔐 How to handle API keys and secrets safely
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Onboarding Implementation](./ONBOARDING_IMPLEMENTATION.md)
- [Deployment Guide](./DEPLOYMENT.md)
