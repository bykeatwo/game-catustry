# 📘 SETUP Guide — Environment Configuration

> **For AI Agents**: Load this document for initial environment setup.

---

## 🛠️ Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | ≥ 20.x | Runtime & package manager |
| npm | ≥ 10.x | Dependency management |
| Git | Any | Version control |

---

## 🚀 Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Verify setup
node --version   # Should be ≥ 20.x
npm --version    # Should be ≥ 10.x
```

---

## ▶️ Running the Game

```bash
# Dev server (Vite, hot reload)
npm run dev

# Unit tests (Vitest)
npm test

# Watch tests during development
npm run test:watch

# Type-check only
npx tsc --noEmit

# Production build (outputs to dist/)
npm run build
```

---

## 📦 Dependencies

- **Runtime**: `phaser` (^3.80)
- **Dev**: `typescript`, `vite` (^5), `vitest` (^1), `@types/node`

---

## 🤖 Agentic Workflow

### Starting Point
1. Read `README.md` for the game overview and documentation map.
2. Read `docs/superpowers/specs/2026-09-11-open-world-settler-design.md` for the design spec.
3. Read `docs/ARCHITECTURE.md` for the state model and constants.
4. Implement features following `docs/DEVELOPMENT.md`.

---

## 🔧 Troubleshooting Setup

If you encounter issues:
- See `docs/TROUBLESHOOTING.md` for debugging patterns.
- Check Node.js version compatibility (`node --version`).
- Clear cache and reinstall: `npm cache clean --force && npm install`.