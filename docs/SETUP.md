# 📘 SETUP Guide — Project Initialization

> **For AI Agents**: Load this document ONLY when setting up a new project or new development environment.

---

## Prerequisites Checklist

### Local Environment (Termux or any machine)
| Tool | Version | Purpose |
|---|---|---|
| Node.js | ≥ 20.x | Runtime & package manager |
| npm | ≥ 10.x | Dependency management |
| Git | Any | Version control |
| GitHub Account | — | For cloud builds via Actions |

### Cloud (GitHub Actions — automatic)
Handled automatically by workflow file: JDK 17, Android SDK, Gradle

---

## Phase 1: Next.js Project Setup

### 1.1 Create Next.js Project
```bash
npx create-next-app@latest your-app-name
cd your-app-name
```

**Options to select:**
- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **No** (use root structure)
- App Router: **Yes**
- Import alias: **No** (or `@/*` if preferred)

### 1.2 Configure Static Export
Edit `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
}
module.exports = nextConfig
```

### 1.3 Verify Build Works
```bash
npm run build
# Check: `out/` folder created with static files
```

---

## Phase 2: Capacitor Integration

### 2.1 Install Capacitor
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### 2.2 Initialize Capacitor
```bash
npx cap init "YourAppName" "com.yourdomain.yourapp" --web-dir=out
```

### 2.3 Add Android Platform
```bash
npx cap add android
```

### 2.4 First Sync & Verify
```bash
npm run build
npx cap sync android
# Success message: "Sync finished in Xms"
```

### 2.5 Capacitor Config (`capacitor.config.ts`)
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourdomain.yourapp',
  appName: 'YourAppName',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
```

---

## Phase 3: GitHub Actions Cloud Build

### 3.1 Create Workflow File
Create `.github/workflows/build-apk.yml`:

```yaml
name: Build Android APK
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Setup JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: 17
          distribution: temurin

      - name: Install dependencies
        run: npm ci

      - name: Build Next.js
        run: npm run build

      - name: Sync Capacitor
        run: npx cap sync android

      - name: Build Debug APK
        run: cd android && ./gradlew assembleDebug

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: app-debug
          path: android/app/build/outputs/apk/debug/app-debug.apk
```

### 3.2 Push to GitHub
```bash
git init
git add .
git commit -m "Initial setup: Next.js + Capacitor"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 3.3 Verify Cloud Build
1. Go to GitHub → your repo → **Actions** tab
2. Wait for workflow to complete (~5–10 minutes)
3. Download APK from **Artifacts** section

---

## Phase 4: Termux-Specific Setup

### 4.1 Install Termux Packages
```bash
pkg update -y && pkg upgrade -y
pkg install -y nodejs git
```

### 4.2 Clone & Develop
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
npm install
npm run dev    # Test in phone browser at localhost:3000
```

### 4.3 Deploy Workflow
```bash
git add .
git commit -m "Your changes"
git push
# → GitHub Actions builds APK automatically
```

---

## ✅ Setup Complete Verification

| Check | Command/Action | Expected Result |
|---|---|---|
| Next.js builds | `npm run build` | `out/` folder created |
| Capacitor syncs | `npx cap sync android` | Success message |
| GitHub Actions | Push to main | Workflow runs, APK artifact produced |
| APK installs | Download & tap | App opens, loads your web UI |

---

## 📌 Next Step

Once setup is verified, load **`docs/DEVELOPMENT.md`** for coding rules, architecture patterns, and daily workflow.
