# 🚀 DEPLOYMENT Guide — Build & Release

> **For AI Agents**: Load this document when building, testing, or releasing the game.

---

## 🔄 Build Pipeline

```
Code → Build → Test → Package → Release
```

---

## 🔧 Development Build

```bash
# Build for local testing
npm run build

# Run tests
npm test
```

---

## 📦 Production Deployment

### Local Build
```bash
npm run build
```

### APK Generation (if using Capacitor)
```bash
# Build web assets
npm run build

# Sync to native platform
npx cap sync android

# Build APK
cd android && ./gradlew assembleRelease
```

> **Note**: IDEA.md specifies game mechanics, not build infrastructure. For APK building, follow standard Capacitor/Next.js documentation.

---

## 🚀 Automated Deployment (Agentic Workflow)

For agentic development workflows:
1. Code changes push to trigger cloud builds
2. Tests run automatically
3. Artifacts generated and available for download

---

## 🔧 Build Troubleshooting

If builds fail:
- See `docs/TROUBLESHOOTING.md` for debugging patterns
- Check build logs for specific errors
- Verify environment variables and secrets

---

## 📌 Key Considerations for Game Deployment

Based on IDEA.md, consider:

### 1. Save System
- Player progress must persist between sessions
- Consider cloud sync for cross-device play

### 2. Data Model Versioning
- As new features are added (medals, gear), update database schemas
- Implement migration paths for existing players

### 3. Guild System Integration
- Guild data must be shared across members
- Consider real-time updates for guild contributions

### 4. Monetization Readiness
- Shop system supports coins and contribution points
- Consider how to handle in-app purchases (future)

---

## 📚 References

- Game specification: `IDEA.md`
- Development workflow: `docs/DEVELOPMENT.md`
- Architecture: `docs/ARCHITECTURE.md`
- Troubleshooting: `docs/TROUBLESHOOTING.md`