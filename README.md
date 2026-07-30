# myFamily

## Run

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env`.

Seed test users:

```bash
npm run seed:test-users
```

Test users:

- `parent@test.myfamily.app` / `Test1234!`
- `family@test.myfamily.app` / `Test1234!`

## Backend

Firebase:

- Auth
- Firestore
- Storage
- FCM

Files:

- `src/integrations/firebase/client.ts`
- `src/integrations/firebase/admin.ts`
- `firestore.rules`
- `firestore.indexes.json`
- `storage.rules`
- `firebase.json`

## Billing

Stripe env vars are in `.env.example`.

## Auth routes

- `/auth`
- `/forgot-password`
- `/reset-password`
- `/onboarding`

## Test

```bash
npm run test:e2e
```

## Native app

```bash
npm install
npm run build:app
npm run cap:sync
npm run cap:android
```

Build APK from Android Studio after sync.
