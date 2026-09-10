# 🔧 TROUBLESHOOTING Guide — Problem Solving

> **For AI Agents**: Load this document when encountering errors, build failures, or runtime issues. Search by error message or category.

---

## 📋 Quick Diagnostic Flow

```
1. Identify the error message
2. Find matching category below
3. Apply Solution A first → if fails, Solution B
4. Still broken? Check "General Fixes" section
5. Document the fix in code comments
```

---

## Category 1: Next.js Build Errors

### ❌ Static export fails / `out/` not generated
**Symptom**: `npm run build` errors or no `out/` folder

**Solution A**: Verify `next.config.js`
```javascript
// MUST have these exact settings
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
}
```

**Solution B**: Remove server-side features that break static export
- No `generateStaticParams` with dynamic routes that can't be statically known
- No `headers()` or `cookies()` in server components
- Convert affected routes to client components with `"use client"`

### ❌ Asset paths broken in APK (404 errors)
**Symptom**: Images/CSS/JS not loading in Android app

**Solution A**: Ensure `trailingSlash: true` + `output: 'export'` in config

**Solution B**: Use relative paths or `basePath` if deploying to subdirectory

---

## Category 2: Capacitor Sync Errors

### ❌ `npx cap sync` fails — webDir not found
**Symptom**: Error: "The web assets directory (...) does not exist"

**Solution A**: Run `npm run build` FIRST to generate `out/` folder

**Solution B**: Verify `capacitor.config.ts` has correct `webDir: 'out'`

### ❌ Plugin not working / method not found
**Symptom**: `XXX is not a function` or plugin undefined

**Solution A**: Sync after every plugin install
```bash
npm install @capacitor/plugin-name
npx cap sync android
```

**Solution B**: Check plugin compatibility with your Capacitor major version

---

## Category 3: GitHub Actions Build Failures

### ❌ Node.js / npm install fails
**Symptom**: CI fails at `npm ci` step

**Solution A**: Delete `package-lock.json` + `node_modules`, reinstall locally, push updated lockfile
```bash
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "fix: refresh lockfile"
git push
```

**Solution B**: Ensure Node.js version in workflow matches local (≥ 20)

### ❌ Gradle build fails
**Symptom**: `./gradlew assembleDebug` exits with error

**Solution A**: Check Android SDK compatibility — ensure `compileSdk` matches available platforms

**Solution B**: Locally verify the sync works first
```bash
npm run build
npx cap sync android
# If this works locally but fails in CI → dependency version mismatch
```

**Solution C**: Check for recent Capacitor major version changes — may need `npx cap migrate`

### ❌ Workflow doesn't trigger
**Symptom**: Push code but no Action runs

**Solution A**: Verify workflow file is at `.github/workflows/build-apk.yml` (exact path)

**Solution B**: Check branch name matches (`main` vs `master`)

**Solution C**: Enable Actions in repo → Settings → Actions → Allow all actions

---

## Category 4: Runtime / Device Issues

### ❌ App shows blank white screen
**Symptom**: App opens but nothing renders

**Solution A**: Check for JavaScript errors — enable Chrome DevTools remote debugging
```
Chrome → chrome://inspect → Devices → Select your app → Inspect
```

**Solution B**: Verify `out/` contains valid `index.html` with correct asset paths

**Solution C**: Check if WebView is trying to load `file://` URLs with absolute paths — `trailingSlash: true` fixes this

### ❌ P2P / WebRTC not connecting
**Symptom**: Peers can't establish connection

**Solution A**: Verify STUN/TURN servers configured
```javascript
const config = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Add TURN fallback for symmetric NAT
  ]
};
```

**Solution B**: Check Android permissions — `INTERNET` and `ACCESS_NETWORK_STATE` in manifest

**Solution C**: Test with two devices on different networks (not same WiFi)

### ❌ App crashes on startup
**Symptom**: "Unfortunately, app has stopped"

**Solution A**: Check AndroidManifest.xml for missing permissions

**Solution B**: Verify `minSdkVersion` compatibility with test device

**Solution C**: View crash logs via ADB
```bash
adb logcat | grep -i "your.package.name"
```

---

## Category 5: Termux-Specific Issues

### ❌ `npm install` slow or fails
**Solution A**: Increase memory for Node.js
```bash
export NODE_OPTIONS="--max-old-space-size=2048"
```

**Solution B**: Use `--no-audit --no-fund` flags
```bash
npm install --no-audit --no-fund
```

### ❌ `next dev` very slow on phone
**Solution**: This is expected on ARM mobile devices. Use Termux for editing + git operations. Heavy builds happen in cloud via GitHub Actions.

---

## Category 6: Version Migration Issues

### ❌ After Capacitor update, build breaks
**Solution A**: Run automated migration
```bash
npx cap migrate
```

**Solution B**: Check Capacitor changelog for breaking changes between your old and new version

**Solution C**: If plugins break, update them to versions compatible with new Capacitor major version

### ❌ Google Play rejects APK (target SDK too low)
**Solution**: Update Capacitor to latest version — it tracks Google's target SDK requirements
```bash
npm update @capacitor/core @capacitor/cli @capacitor/android
npx cap migrate
git push
# → Cloud build produces APK with correct target SDK
```

---

## 🛠️ General Fixes (Try When Stuck)

### The "Clean Everything" Reset
```bash
# 1. Remove all generated files
rm -rf node_modules .next out android

# 2. Reinstall
npm install

# 3. Re-add Android platform
npx cap add android

# 4. Build & sync
npm run build
npx cap sync android

# 5. Push fresh
git add .
git commit -m "fix: clean reset"
git push
```

### Verify Your Environment
```bash
node --version    # ≥ 20
npm --version     # ≥ 10
java -version     # If building locally — JDK 17+
```

---

## 📞 When To Escalate

If you've tried all relevant solutions and the issue persists:

1. **Search** the error message on GitHub Issues for Capacitor
2. **Check** StackOverflow for `[capacitor]` + your error
3. **Document** exactly what you tried, then report with:
   - Exact error message
   - Node.js/npm versions
   - Capacitor version
   - Steps to reproduce
   - What solutions you already tried

---

## 📌 Cross-References

- Setup problems? Load **`docs/SETUP.md`**
- Architecture questions? Load **`docs/ARCHITECTURE.md`**
- Deployment questions? Load **`docs/DEPLOYMENT.md`**
