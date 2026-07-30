# myFamily — Codex handoff

Mobile-first React app (TanStack Start v1 + Vite 7 + Tailwind v4 + shadcn/ui).
Two roles: **Parent** (senior-optimized) and **Family Member** (coordinator).
Fully client-side mocks with `localStorage` stores — no backend required to run.

## Run

```bash
bun install        # or: pnpm i / npm i
bun run dev        # http://localhost:8080
```

Node 20+. If you use npm/pnpm, delete `bun.lockb` first.

## Architecture

- Routes: `src/routes/**` (file-based). Never edit `src/routeTree.gen.ts`.
- Root layout: `src/routes/__root.tsx` applies `data-font-scale`,
  `data-contrast`, `data-reduced-motion`, `data-theme`, `dir` to `<html>`.
- Global state: `src/lib/app-state.ts` (role, auth, prefs, persisted).
- i18n: `src/lib/i18n.tsx` (11 Indian languages incl. RTL for Urdu).
- Mock data: `src/lib/mock-data.ts`.
- Persistent stores (all `localStorage`, `useSyncExternalStore`):
  - `activity-log.ts` — saves/replies/shares/love
  - `call-log.ts` — call history + durations
  - `notifications-store.ts` — read/unread state
- Design tokens: `src/styles.css` (soft tints, 24px radii, motion resets).

## Key components (`src/components/mobile`)

`PhoneFrame`, `Screen`, `BottomNav`, `Card`, `RoleLayout`, `AccessibilitySettings`,
`ActionDialog`, `CallDialog`, `MediaViewerDialog`, `FamilyFeed`,
`ActivityStrip`, `NotificationBell`.

All dialogs use Radix focus trap + `onCloseAutoFocus` return-focus and stay
mounted while toggling `open` to preserve exit transitions.

## Feature workflows

- **Auth / onboarding**: `/auth`, `/onboarding` → role picker.
- **Parent**: `/parent/home` (dashboard + FamilyFeed), `/parent/ai`,
  `/parent/health`, `/parent/family`, `/parent/medicine/scan` (OCR sim),
  `/parent/profile` (Accessibility + language).
- **Family**: `/family/dashboard` (multi-parent, alerts, quick calls),
  `/family/parents/$id`, `/family/medicines`, `/family/appointments/new`,
  `/family/insights`, `/family/profile`.
- **Global**: `/sos` (countdown + auto-trigger), `/notifications`
  (filter tabs All/Calls/SOS/Meds/Photos + mark-read), `/calls`
  (persisted history), `/pricing`.

## Accessibility

- `useAppState().prefs`: `fontScale` (std/lg/xl), `theme`, `highContrast`,
  `reducedMotion`, `language`. Persisted in `myfamily.prefs.v1` and survive
  sign-out; OS `prefers-reduced-motion` used as default.
- Focus trap + return-focus in every dialog.
- Visually-hidden `DialogTitle`/`Description` on modals.
- ARIA labels on all bell/call/media buttons; unread counts announced.

## Rebuild in Codex — recommended prompt sequence

1. Scaffold TanStack Start v1 + Tailwind v4 + shadcn/ui + Vite 7.
2. Import `src/styles.css` and design tokens.
3. Drop in `src/components/mobile/*` and `src/lib/*` verbatim.
4. Create routes under `src/routes/**` matching the filenames in this zip.
   The `createFileRoute("/...")` string mirrors the filename with dots → slashes.
5. Wire `__root.tsx` to apply `<html>` data-attributes from `useAppState`.
6. Add Supabase later: `profiles`, `parents`, `family_links`, `medicines`,
   `appointments`, `sos_events`, `notifications`, `activity`, `calls` with
   RLS + `has_role()` and `user_roles(app_role)` in a separate table.
7. Add Stripe for `/pricing` (Free / Premium / Family Plus).

## Do NOT

- Do not use `react-router-dom` — router is TanStack.
- Do not hand-edit `src/routeTree.gen.ts`.
- Do not store roles on the profiles table.
- Do not hardcode colors — use semantic tokens in `styles.css`.
