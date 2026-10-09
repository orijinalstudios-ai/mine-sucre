# Mine & Sucre — Couple Anniversary Memory Journal

A luxury heirloom web application built with **React**, **Vite**, and **Tailwind CSS**, configured as a mobile-installable Progressive Web App (PWA) ready for instant deployment on **Vercel**.

---

## 🚀 How to Host on Vercel

### Option 1: Deploy with GitHub (Recommended & Easiest)
1. Push this project folder to a GitHub repository (e.g. `me-and-mine-journal`).
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** → **"Project"** and import your GitHub repository.
4. Vercel will automatically detect the settings from `vercel.json`:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **"Deploy"**. Your app will be live on a custom URL (e.g. `https://mine-and-sucre.vercel.app`) in under 60 seconds with HTTPS!

### Option 2: Deploy directly via Vercel CLI
If you have the Vercel CLI installed:
```bash
npx vercel
```
Follow the prompts in your terminal to deploy directly. For production deployment:
```bash
npx vercel --prod
```

---

## 📱 How to Download / Install on Mobile (PWA)

Once hosted on Vercel (or when opened on mobile):

### On iPhone (Safari)
1. Open the hosted URL in **Safari**.
2. Tap the **Share** button at the bottom of the screen (the square with arrow pointing up `⎋`).
3. Scroll down and tap **“Add to Home Screen”** (`⊞`).
4. Tap **“Add”** in the top right.
5. The **Mine & Sucre** app icon will appear directly on your home screen, opening without any browser address bar just like a native iOS app!

### On Android (Chrome)
1. Open the hosted URL in **Chrome**.
2. Tap the **Smartphone icon** in the app's top bar or the Chrome 3-dots menu (`⋮`).
3. Tap **“Install app”** or **“Add to Home screen”**.
4. The app installs to your app drawer and home screen.

---

## 🌟 App Features

- **No Artificial Frames:** Natural, edge-to-edge layout on mobile, and cleanly centered canvas on desktop.
- **Clean State:** Zero placeholder mock data. Ready to chronicle real photos, memories, and personal love letters.
- **Audiomack Music Stream:** Embedded player for Fave's *"Baby Riddim"* ([`https://audiomack.com/favourish/song/baby-riddim`](https://audiomack.com/favourish/song/baby-riddim)) with custom song URL support.
- **Live Anniversary Countdown Ticker:** Counts days, hours, minutes, and seconds down to your anniversary.
- **Voice Memo Recorder:** Record and wax-seal audio memos directly from your phone's microphone.
- **Vows Vault & Printable Album:** Compose mutual vows and generate a book-formatted printable album or PDF (`window.print()`).
- **Offline & Standalone:** Full PWA manifest (`manifest.json`) and service worker (`sw.js`).

---

## 🛠️ Local Development

```bash
# Run local dev server
npm run dev

# Build for production
npm run build

# Preview build locally
npm run preview
```
