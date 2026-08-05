# Family Onboarding Implementation Guide

## Overview
This document describes the complete family onboarding lifecycle implementation for the myFamily application. The system ensures that first-time users of any authentication type (Email, Google, Phone OTP) follow a consistent flow: **Complete Profile → Create/Join Family → Access Dashboard**.

## Implemented Features

### 1. Profile Completion Flow
**File**: `src/routes/onboarding.profile.tsx`

Users must complete their profile with:
- Full name (required)
- Phone number (optional, for emergency notifications)

After completion, users are redirected to the family setup page.

**Route**: `/onboarding/profile`

### 2. Family Setup Flow
**File**: `src/routes/onboarding.family.tsx`

Users can either:
- **Create a new family**: Enter family name, auto-generates unique 6-character invite code
- **Join existing family**: Enter invite code from another family member

**Route**: `/onboarding/family`

### 3. Family Operations
**File**: `src/lib/family-operations.ts`

Key functions:
- `completeProfile()` - Save profile with name, phone, role
- `createFamily()` - Create new family and auto-generate invite code
- `joinFamilyWithInviteCode()` - Join existing family with code validation
- `generateUniqueInviteCode()` - Generate unique 6-char alphanumeric codes
- `getFamilyByInviteCode()` - Validate invite codes
- `loadFamilyIntoState()` - Load family info into app state
- `hasCompleteProfile()` - Check profile completion status
- `hasJoinedFamily()` - Check family membership status
- `getFamilyMembers()` - Get all family members

### 4. Route Guards
**File**: `src/lib/route-guards.ts`

- `useDashboardGuard()` - Prevents dashboard access without proper setup
- `useAuthGuard()` - Prevents access without authentication

**Applied to**:
- `/parent/home` - Parent dashboard
- `/family/dashboard` - Family member dashboard

### 5. Redirect Utilities
**File**: `src/lib/redirect-utils.ts`

Determines the correct redirect route based on auth state:
- `getNextAuthRoute()` - Returns appropriate route based on onboarding status
- `isFullyOnboarded()` - Checks if user has completed all steps
- `needsProfileCompletion()` - Checks if profile needs completion
- `needsFamilySetup()` - Checks if family setup is needed

Routes:
1. `/auth` - Not authenticated
2. `/onboarding` - Authenticated but no role
3. `/onboarding/profile` - Role selected but profile incomplete
4. `/onboarding/family` - Profile complete but no family
5. `/parent/home` or `/family/dashboard` - Fully onboarded

### 6. Updated Authentication Flow
**File**: `src/lib/firebase-auth.ts`

Enhanced to:
- Load family info after profile load
- Call `loadFamilyIntoState()` to sync family data

### 7. App State Updates
**File**: `src/lib/app-state.ts`

- Changed default name from "John" to "" (empty string)
- Better detection of profile completion status

## Firestore Document Structure

### profiles collection
```
{
  id: string (user UID),
  full_name: string,
  email: string,
  phone?: string,
  role: "parent" | "family",
  family_id: string,
  language?: string,
  created_at: timestamp,
  updated_at: timestamp
}
```

### families collection
```
{
  id: string,
  name: string,
  invite_code: string (6-char unique code),
  created_by: string (user UID),
  created_at: timestamp,
  updated_at: timestamp,
  member_count: number
}
```

### families/{familyId}/family_members subcollection
```
{
  id: string (user UID),
  family_id: string,
  user_id: string,
  name: string,
  role: "parent" | "family",
  joined_at: timestamp
}
```

### families/{familyId}/user_roles subcollection
```
{
  id: string (user UID),
  user_id: string,
  family_id: string,
  role: "parent" | "family",
  assigned_at: timestamp
}
```

## Authentication Methods Supported

1. **Email/Password**: Standard email signup with custom profiles
2. **Google OAuth**: Google sign-in with profile creation
3. **Phone OTP**: Phone number-based authentication with OTP

All three methods follow the same onboarding flow after authentication.

## Complete Flow Example

### Parent Creates Account and Family
1. User navigates to `/`
2. Redirected to `/auth` (not authenticated)
3. Signs up with email and password
4. Redirected to `/onboarding` (authenticated, no role)
5. Selects "I'm a Parent" role
6. Redirected to `/onboarding/profile` (role selected, profile incomplete)
7. Enters name and phone
8. Redirected to `/onboarding/family` (profile complete, no family)
9. Selects "Create family" and enters family name "The Smiths"
10. Family created with auto-generated invite code (e.g., "ABC123")
11. Redirected to `/parent/home` (fully onboarded)

### Family Member Joins
1. User creates account and selects "I'm a Family Member" role
2. Completes profile
3. At `/onboarding/family`, selects "Join"
4. Enters invite code "ABC123"
5. System validates code and adds user to family
6. Both users now share the same `familyId`
7. Redirected to `/family/dashboard` (fully onboarded)

## Invite Code System

### Code Generation
- 6-character alphanumeric codes (e.g., "ABC123")
- Automatically generated during family creation
- Uniqueness guaranteed by checking existing codes before generation
- Max 10 attempts to generate unique code (safeguard against collision)

### Code Validation
- Case-insensitive (input is converted to uppercase)
- Checked against families collection
- Invalid codes trigger "Invalid invite code" error
- No rate limiting (can be added in future)

## Route Guards in Action

### Without Proper Setup
- Attempting to access `/parent/home` → redirects to `/onboarding/profile` or `/auth` as needed
- Attempting to access `/family/dashboard` → redirects to `/onboarding/family` or `/auth` as needed

### After Setup
- All routes are accessible with the appropriate role and family membership

## Testing

Comprehensive test files created:

### `tests/family-onboarding.spec.ts`
- Parent account creation flow
- Second user joining via invite code
- Route guard validation
- Incomplete profile prevention
- Family setup requirement enforcement
- Invite code validation

### `tests/family-operations.spec.ts`
- Profile document creation
- Role persistence
- Family operations
- State management

## Configuration Files

### `src/routes/onboarding.tsx`
Updated to redirect to `/onboarding/profile` instead of dashboard

## Key Implementation Details

1. **Atomic Operations**: Family creation and member addition happen together
2. **State Synchronization**: App state synced with Firestore on auth changes
3. **Error Handling**: Clear error messages for invalid operations
4. **TypeScript**: Full type safety with interfaces for all data structures
5. **Validation**: Invite codes are validated before processing
6. **Counter Updates**: Family member count automatically incremented

## Future Enhancements

1. Rate limiting on invite code validation
2. Invite code expiration
3. Invite code revocation
4. Family member roles (admin, viewer, editor)
5. Multi-language profile fields
6. Profile picture/avatar support
7. Family member removal/leaving
8. Family admin management

## Testing the Flow

To test the complete onboarding flow:

1. Start the dev server: `npm run dev`
2. Open `http://localhost:8080`
3. Create a new account with email
4. Select parent role
5. Complete profile with name and phone
6. Create family with name
7. Note the invite code displayed
8. Open new browser/incognito window
9. Create second account with different email
10. Select family member role
11. Complete profile
12. Join family with invite code from step 7
13. Verify both users share the same familyId in Firestore

## Code Quality

- No unnecessary comments (code is self-documenting)
- Clear function names describing purpose
- Type-safe with TypeScript
- Follows React best practices
- Uses existing UI components (Button, Input, Tabs, etc.)
- Responsive design with PhoneFrame component

## Security Considerations

1. Firestore rules should be updated to restrict access:
   - Users can only read their own profile
   - Users can only see family members of families they're in
   - Only family admins can modify family settings

2. Invite codes are not secrets but can be made more secure by:
   - Adding expiration times
   - Limiting to specific email domains
   - Requiring manual approval by family admin

## Known Limitations

1. Invite codes don't expire
2. No maximum number of members per family
3. All roles treated equally (no admin/viewer distinction)
4. No audit logging for family operations

## Files Modified/Created

### Created:
- `src/lib/family-operations.ts`
- `src/lib/redirect-utils.ts`
- `src/lib/route-guards.ts`
- `src/routes/onboarding.profile.tsx`
- `src/routes/onboarding.family.tsx`
- `tests/family-onboarding.spec.ts`
- `tests/family-operations.spec.ts`

### Modified:
- `src/routes/onboarding.tsx`
- `src/routes/auth.tsx`
- `src/routes/index.tsx`
- `src/routes/parent.home.tsx`
- `src/routes/family.dashboard.tsx`
- `src/lib/app-state.ts`
- `src/lib/firebase-auth.ts`

## Verification Checklist

- ✅ Profile completion page created
- ✅ Family setup page created (create/join tabs)
- ✅ Unique invite code generation
- ✅ Invite code validation
- ✅ Firestore documents auto-created
- ✅ Route guards implemented
- ✅ State syncing to Firestore
- ✅ All auth methods flow through same onboarding
- ✅ End-to-end tests created
- ✅ Redirect utilities implemented
- ✅ Error handling for invalid codes

