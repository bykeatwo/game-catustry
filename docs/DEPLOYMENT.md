# 🚀 DEPLOYMENT Guide — Build & Release

> **For AI Agents**: Load this document when building APKs, preparing releases, or updating versions.

---

## 📦 Deployment Pipeline Overview

```
Code Push → GitHub Actions → Build APK → Artifact → Download → Install/Release
```

---

## Phase 1: Automated Cloud Build (Standard)

### Trigger Build
```bash
git add .
git commit -m "feat: your changes"
git push origin main
```

### Monitor
1. GitHub → Repo → **Actions** tab
2. Click running workflow → watch logs
3. Expected duration: **5–10 minutes**

### Get APK
1. On completed workflow page → scroll to **Artifacts**
2. Click `app-debug` → download ZIP
3. Extract → `app-debug.apk`
4. Transfer to phone → tap to install

---

## Phase 2: Release Build (Play Store / Distribution)

### 2.1 Generate Signing Key (One-Time)
```bash
keytool -genkey -v -keystore release-key.keystore \
  -alias release -keyalg RSA -keysize 2048 -validity 10000
```
**Store safely**: Back up this keystore file + passwords. Losing it = lost app updates.

### 2.2 GitHub Secrets Setup
Add these to GitHub → Repo → **Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `KEYSTORE_FILE` | Base64 of keystore: `base64 -w 0 release-key.keystore` |
| `KEYSTORE_PASSWORD` | Your keystore password |
| `KEY_ALIAS` | `release` |
| `KEY_PASSWORD` | Your key password |

### 2.3 Release Workflow
Add `.github/workflows/release-apk.yml`:

```yaml
name: Release Signed APK
on:
  push:
    tags: ['v*']
  workflow_dispatch:

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - uses: actions/setup-java@v4
        with: { java-version: 17, distribution: temurin }

      - run: npm ci && npm run build
      - run: npx cap sync android

      - name: Prepare keystore
        run: |
          echo "$KEYSTORE_FILE" | base64 -d > android/release-key.keystore
        env:
          KEYSTORE_FILE: ${{ secrets.KEYSTORE_FILE }}

      - name: Build Signed Release APK
        run: |
          cd android && ./gradlew assembleRelease \
            -Pandroid.injected.signing.store.file=release-key.keystore \
            -Pandroid.injected.signing.store.password=${{ secrets.KEYSTORE_PASSWORD }} \
            -Pandroid.injected.signing.key.alias=${{ secrets.KEY_ALIAS }} \
            -Pandroid.injected.signing.key.password=${{ secrets.KEY_PASSWORD }}

      - name: Build AAB (Play Store)
        run: |
          cd android && ./gradlew bundleRelease \
            -Pandroid.injected.signing.store.file=release-key.keystore \
            -Pandroid.injected.signing.store.password=${{ secrets.KEYSTORE_PASSWORD }} \
            -Pandroid.injected.signing.key.alias=${{ secrets.KEY_ALIAS }} \
            -Pandroid.injected.signing.key.password=${{ secrets.KEY_PASSWORD }}

      - uses: actions/upload-artifact@v4
        with:
          name: release-builds
          path: |
            android/app/build/outputs/apk/release/app-release.apk
            android/app/build/outputs/bundle/release/app-release.aab
```

### 2.4 Trigger Release
```bash
git tag v1.0.0
git push origin v1.0.0
# → Workflow builds signed APK + AAB
```

---

## Phase 3: Version Management

### Version Bump Procedure
1. **`package.json`**: Bump version number
2. **`android/app/build.gradle`**: Bump `versionCode` (integer) and `versionName`
3. **Commit**: `chore(release): bump to v1.1.0`
4. **Tag & push**: `git tag v1.1.0 && git push origin v1.1.0`

### Google Play Target SDK Schedule
| Date | Required Target SDK | Action |
|---|---|---|
| Aug 31, 2025 | API 35 (Android 15) | Bump `compileSdk` + `targetSdk` |
| Aug 31, 2026 | API 36 (Android 16) | Update Capacitor + SDK versions |
| Annually ~Aug 31 | Latest API | Run `npx cap migrate` |

---

## Phase 4: Capacitor Version Updates

### Annual Maintenance (~1 hour/year)
```bash
# 1. Update Capacitor packages
npm update @capacitor/core @capacitor/cli @capacitor/android

# 2. Automated migration
npx cap migrate

# 3. Verify build
npm run build
npx cap sync android

# 4. Push → cloud build verifies everything
git add .
git commit -m "chore: migrate to Capacitor X.Y"
git push
```

### What `npx cap migrate` handles automatically
- Gradle version updates
- Android SDK version bumps
- Config file format changes
- Plugin compatibility updates
- Breaking change notifications

---

## Phase 5: Web Deployment (OTA Updates)

### Host Next.js on Vercel/Netlify
```bash
# Connect repo to Vercel → auto-deploys on push
# App users pointing to live URL get updates instantly
```

### Hybrid Strategy (Recommended)
- **Native APK**: Rebuild only when Capacitor/plugins change (~once/year)
- **Web content**: Update via hosted URL → instant OTA for all users
- **Result**: Minimize native rebuilds; maximize update speed

---

## Phase 6: Play Store Submission

### Checklist
- [ ] Signed **AAB** file (from release workflow)
- [ ] App title, description, screenshots
- [ ] Privacy policy URL
- [ ] Content rating questionnaire
- [ ] Target SDK meets current requirement
- [ ] `versionCode` incremented from previous

### Upload
1. Google Play Console → Create app
2. Production track → Upload AAB
3. Fill store listing details
4. Roll out to production

---

## 📊 Build Artifacts Reference

| Build Type | File Location | Use Case |
|---|---|---|
| Debug APK | `android/app/build/outputs/apk/debug/app-debug.apk` | Testing, development |
| Release APK | `android/app/build/outputs/apk/release/app-release.apk` | Sideload distribution |
| Release AAB | `android/app/build/outputs/bundle/release/app-release.aab` | Google Play submission |

---

## ⚡ Quick Reference Commands

| Task | Command |
|---|---|
| Trigger debug build | `git push origin main` |
| Trigger release build | `git tag vX.Y.Z && git push origin vX.Y.Z` |
| Local sync test | `npm run build && npx cap sync android` |
| Capacitor migration | `npx cap migrate` |
| Add plugin | `npm install @capacitor/plugin-name && npx cap sync` |

---

## 📌 Next Steps

- Build failing? Load **`docs/TROUBLESHOOTING.md`**
- Need to understand architecture decisions? Load **`docs/ARCHITECTURE.md`**
- Back to coding? Load **`docs/DEVELOPMENT.md`**
