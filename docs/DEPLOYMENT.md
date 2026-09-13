# 🚀 DEPLOYMENT Guide — Build & Release

> **For AI Agents**: Load this document when building or releasing the game.

---

## 🔄 Build Pipeline

```
Code → type-check (tsc --noEmit) → production build (vite build) → static dist/
```

---

## 🔧 Production Build

```bash
# Type-checks (tsc --noEmit) then bundles with Vite
npm run build
```

The output is a **static site** in `dist/`. Deploy `dist/` to any static host (Netlify, Vercel, GitHub Pages, S3, etc.).

---

## 🚀 Deployment

The game is **client-only** — no backend, no server, no database. Player progress is stored in the browser's `localStorage` (key `catustry-save`).

1. Run `npm run build` to produce `dist/`.
2. Upload `dist/` to your static hosting provider.
3. (Optional) preview locally first with `npm run preview`.

---

## 💾 Save Data Notes

- Saves are local to each browser/device (`localStorage`). There is **no cloud sync** in MVP.
- The save schema is versioned (`SCHEMA_VERSION = 1` in `src/domain/save.ts`); future breaking changes should add a `migrate` path.

---

## ⛔ Deferred Out of MVP

- **APK / Capacitor / native mobile packaging** — the current build is a web app only.
- **Cloud sync / cross-device saves** — requires a backend, deferred.

---

## 🔧 Build Troubleshooting

If builds fail:
- See `docs/TROUBLESHOOTING.md` for debugging patterns.
- Run `npx tsc --noEmit` to isolate type errors vs. bundling errors.
- Check the build log for specific errors.

---

## 📚 References

- Game specification: `docs/superpowers/specs/2026-09-11-open-world-settler-design.md`
- Architecture: `docs/ARCHITECTURE.md`
- Development workflow: `docs/DEVELOPMENT.md`
- Troubleshooting: `docs/TROUBLESHOOTING.md`