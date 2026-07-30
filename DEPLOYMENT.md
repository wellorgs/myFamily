# myFamily Deployment Guide

## Quick Start for Mobile Testing

### 1. Local Development Server
```bash
npm run dev
```
Visit `http://localhost:5173` in your browser
On mobile, find your machine's IP and visit `http://<YOUR_IP>:5173`

### 2. Deploy to Vercel (Recommended)

**Setup:**
1. Push code to GitHub (required for Vercel)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/myfamily.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "Import Project"
   - Select your repository
   - Deploy

3. Add environment variables in Vercel dashboard:
   - `VITE_GEMINI_API_KEY` (optional, for AI)
   - All Firebase variables from `.env`

**Result:** Your app gets a public URL like `https://myfamily-xyz.vercel.app`

### 3. Deploy to Firebase Hosting

**Setup:**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```

**Build & Deploy:**
```bash
npm run build
firebase deploy
```

**Result:** Your app is at `https://PROJECT_ID.web.app`

### 4. Setup Gemini AI (Optional)

**Get API Key:**
1. Visit [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key"
3. Create new key for "myFamily"
4. Copy the key

**Add to your deployment:**
- **Vercel:** Add to Environment Variables in dashboard
- **Firebase:** Add to `.env.production`
- **Local:** Paste into `.env` → `VITE_GEMINI_API_KEY`

**Test AI Screen:**
- Navigate to AI tab
- Click suggested prompts
- Or hold mic to "talk" (mocked, requires voice-to-text client-side)

---

## Features Implemented

### ✅ Complete
- **Parent role:** Home (empty state), Health, AI companion, Family, Profile
- **Child role:** Dashboard, Parents, Medicines, Insights, Profile
- **Onboarding:** 5-step parent flow, progress tracking, completion summary
- **Accessibility:** Text size, dark mode, high contrast, reduced motion
- **Design:** Floating bottom nav, safe-area aware, senior-optimized
- **Camera:** Medicine scan with `getUserMedia` (real camera on mobile)
- **Gemini AI:** Real AI responses for companion (with fallback mocks)

### 🚀 Ready for User Testing
- Share Vercel/Firebase URL on mobile Chrome
- Test all screens: home, health, AI, family, profile
- Test onboarding: invite family, complete steps, see summary
- Test accessibility: text size, dark mode, reduced motion
- Test AI: ask questions, get Gemini responses
- Test camera: scan medicine with phone camera (requires HTTPS on deployed version)

### 📝 Test Accounts
See `v2_test_accounts.txt` for 4 families with credentials and invite codes.

---

## Troubleshooting

**Camera not working?**
- Mobile: Requires HTTPS (Vercel/Firebase provide this)
- Desktop: Open Chrome DevTools → device toolbar → reload

**AI not responding?**
- Check `VITE_GEMINI_API_KEY` is set in `.env`
- Go to [ai.google.dev](https://ai.google.dev) to get a key
- If not set, AI falls back to mock responses (still works)

**Styles not loading?**
- Clear browser cache: Cmd+Shift+Delete
- Rebuild: `npm run build`

**Build fails?**
- Delete `node_modules`: `rm -rf node_modules`
- Reinstall: `npm install`
- Rebuild: `npm run build`

---

## Next Steps

1. **Deploy to Vercel** (easiest for sharing)
2. **Add Gemini API key** for real AI responses
3. **Test on mobile** with the URL
4. **Gather feedback** from testers
5. **Iterate** on design/features

---

## Support

For issues:
- Check `.env` has all required variables
- Verify Firebase project ID matches
- Test locally first: `npm run dev`
- Check browser console (F12) for errors
