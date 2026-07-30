# Security Guide - Secret Management

## Overview

This document outlines how to safely handle sensitive information (API keys, credentials) in the myFamily project.

## ⚠️ CRITICAL: Never Commit Secrets

**NEVER commit the following to Git:**
- `.env` file (contains all local secrets)
- `.env.local`
- `.env.*.local`
- Any file with API keys, private keys, or credentials

These are already in `.gitignore` for protection.

## Environment Variables

### Local Development

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your values in `.env`:**
   ```env
   VITE_FIREBASE_API_KEY=your_actual_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   # ... other secrets
   VITE_GEMINI_API_KEY=your_gemini_key_here
   ```

3. **Important:** 
   - `.env` is **never** committed to Git
   - Each developer has their own `.env` file
   - The file is loaded automatically by Vite

### Getting API Keys

#### Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Copy the configuration values

#### Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key to your `.env` file
4. Keep it private - treat like a password

#### Stripe
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Developers → API Keys
3. Copy the Publishable and Secret keys

## GitHub Secrets (For CI/CD)

Secrets used in GitHub Actions workflows are automatically masked in logs and cannot be retrieved once set.

### Setting Up GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the exact name:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_STRIPE_PUBLISHABLE_KEY
VITE_GEMINI_API_KEY
FIREBASE_SERVICE_ACCOUNT
STRIPE_SECRET_KEY
```

### Security Features

- **Masked in logs**: GitHub automatically masks secret values in workflow logs
- **Not retrievable**: Once set, you cannot view the value again
- **Scoped access**: Secrets are only available to workflows in that repository
- **Encrypted storage**: Secrets are encrypted at rest

### Workflow Usage

In `.github/workflows/*.yml`, secrets are accessed as:
```yaml
env:
  VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
```

The value is automatically masked in logs.

## Gemini API Key - Special Handling

The Gemini API key is used for:
- AI-powered recommendations
- Health insights generation
- Smart family suggestions

### Protection Levels

1. **Development**: Stored in local `.env` only (not in Git)
2. **Production**: Stored in GitHub Secrets (encrypted, masked)
3. **Logs**: Automatically masked in GitHub Actions logs
4. **Code**: Never hardcoded in source files

### Usage in Code

```typescript
// ✅ CORRECT - From environment variable
const geminiKey = process.env.VITE_GEMINI_API_KEY;

// ❌ WRONG - Hardcoded key
const geminiKey = "sk-..."; 
```

## Secret Rotation

If a secret is compromised:

1. **Immediately revoke** the compromised key
2. **Generate a new one** from the service provider
3. **Update GitHub Secrets** with the new value
4. **Update local `.env`** files
5. **Notify team members** to update their copies

### Firebase
- Go to Firebase Console → Project Settings
- Regenerate API keys

### Gemini API
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Delete the old key, create a new one

### Stripe
- Go to Stripe Dashboard → Developers → API Keys
- Rotate the keys

## Audit Trail

GitHub Actions automatically logs:
- When secrets are accessed
- Which workflow used the secret
- When and by whom (via commit history)

Check "Security" tab in GitHub repository settings for audit logs.

## Best Practices

✅ **DO:**
- Keep `.env` file locally only
- Review `.gitignore` before committing
- Rotate secrets periodically
- Use different keys for dev/staging/production
- Document which services need which keys
- Check GitHub's audit log regularly

❌ **DON'T:**
- Commit `.env` to Git (it's in `.gitignore` for safety)
- Share secrets via Slack, email, or chat
- Hardcode secrets in source code
- Use the same key across environments
- Leave secrets in browser console logs
- Add secrets to documentation

## Checking If a Secret Was Committed

If you accidentally committed a secret:

```bash
# Search git history for API key patterns
git log -p -S "VITE_GEMINI_API_KEY"

# If found:
# 1. Immediately revoke the key
# 2. Create a new one
# 3. Force push (only if not merged to main)
# 4. Or use git-filter-branch to rewrite history
```

## Emergency: Compromised Secret

If a secret appears to be compromised:

1. **Immediately** revoke it in the source service
2. Generate a replacement key
3. Update GitHub Secrets
4. Update local `.env` files
5. Create a new GitHub Actions run to test
6. Monitor for unauthorized usage

## Questions?

Never commit a secret to ask about it. Instead:
- Create an issue describing the setup needed
- Ask on Slack/Email without the actual secret
- Use dummy values in `.env.example` only

---

**Last Updated**: 2026-07-31
**Next Review**: 2026-10-31
