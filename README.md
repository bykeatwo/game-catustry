# 🐱 Cat's Food Chain Farm — Open-World Settler

> **For AI Agents**: This is your entry point. Read this file first, then load the specific documentation for your current task. The authoritative design spec is `docs/superpowers/specs/2026-09-11-open-world-settler-design.md`.

---

## 🎮 Game Overview

**Cat's Food Chain Farm** is an **open-world, isometric 2D settler game**. You control a cat that
**explores** a procedurally generated map, **buys land** to expand territory, **builds facilities**
at fixed ruins, **grows and processes a full food chain**, and **sells produce to a merchant** for
coins.

### Core Loop

```
Explore (move the cat) → buy land plots (coins) → build facilities at ruins (coins)
→ buy seeds (merchant) → grow/farm crops → work facilities (proximity + tap, energy)
→ climb the food chain → sell produce to the merchant (coins) → level up → unlock more
```

The loop is **open-ended** — there is no final goal. Progression runs through **level/XP**, which
gates facility unlocks and land expansion.

### Feel
- **Movement-first, active** — the cat is a character you move (WASD/arrows or a touch joystick), not an idle button.
- **Proximity interaction** — you work things by *standing near* them and tapping.
- **Settle-and-grow** — you choose where to expand and what to build; resources and ruins are discovered by exploring.

---

## 📚 Documentation Map

| Task | Document to Load |
|---|---|
| 🏗️ **Architecture**, state model, progression constants | `docs/ARCHITECTURE.md` |
| 💻 **Coding**, layering, isometric rendering, game mechanics | `docs/DEVELOPMENT.md` |
| 🔧 **Setup**, dependencies, environment | `docs/SETUP.md` |
| 📦 **Deployment**, production build | `docs/DEPLOYMENT.md` |
| 🔧 **Problem solving**, debugging | `docs/TROUBLESHOOTING.md` |
| 📐 **Design spec** (source of truth for gameplay) | `docs/superpowers/specs/2026-09-11-open-world-settler-design.md` |

---

## 🚦 Development Workflow

```
1. SETUP        → docs/SETUP.md (run once per environment)
2. DEVELOP      → docs/DEVELOPMENT.md (daily coding)
3. BUILD        → docs/DEPLOYMENT.md (production build)
4. TROUBLESHOOT → docs/TROUBLESHOOTING.md (when debugging)
```

---

## 🧱 Technology Stack

- **TypeScript** — typed game code
- **Phaser 3** — sprites, input (WASD/touch), camera, isometric rendering, depth sort
- **Vite** — dev server + production build
- **Vitest** — unit tests for the domain layer
- **localStorage** — save/load (no backend)

---

## 🏗️ Key Systems

### Movement & World
- Isometric diamond-tile world rendered from a `WorldMap` (tile grid + ownership + player position).
- Move with **WASD / arrow keys** (desktop) or a **virtual joystick** (touch); the camera follows the cat.
- Tiles have a deterministic kind: grass, wild crop (🌾), buildable ruin (🧱), or the merchant post (🏪).

### Land & Building
- Buy adjacent land plots for coins (cost scales with territory size); endless expansion.
- Build facilities at ruins: **Mill (Lv 3)**, **Bakery (Lv 5)**, **Gourmet Studio (Lv 9)**.

### Food Chain
Raw crops (`wheat`, `carrot`, `potato`, `egg`) → Processed (`flour`, `carrot juice`, `mashed potato`, `omelette`) → Crafted (`bread`, `carrot cake`, `crisps`, `pie`) → Gourmet (`gourmet feast`, `royal platter`).

### Merchant & Economy
- The merchant **sells seeds** (for planting crops at plots) and **buys produce** for coins.
- Coins are the only currency; sources = selling produce, sinks = seeds, building, land.

### XP / Level / Energy
- XP from work-taps (+1), production completion (tier bonus), and selling.
- Level gates facility unlocks. Energy drains per tap (tier-based) and regenerates over time.

### Persistence
- Progress is saved to `localStorage` (debounced on change + periodic), and loaded on boot.

---

## 📁 Project Structure

```
game-catustry/
├── README.md                    ← YOU ARE HERE (entry point)
├── IDEA.md                      ← Original game spec (guild/medals/gear marked deferred)
├── docs/                        ← Architecture, development, setup, deployment, troubleshooting
├── docs/superpowers/            ← Design spec + implementation plans
├── index.html                   ← DOM shell (game canvas + merchant shop overlay)
├── src/
│   ├── domain/                  ← Pure game logic (Phaser-free, Vitest-tested)
│   ├── state/store.ts           ← In-memory GameStore (single source of truth)
│   ├── data/store.ts            ← localStorage persistence adapter
│   ├── presentation/            ← Phaser scene, sprites, input, merchant UI
│   ├── config/gameConfig.ts     ← Dimensions, speeds, tile sizes
│   └── main.ts                  ← Phaser boot entry point
└── test/                        ← Vitest unit tests for domain logic
```

---

## ⚡ Quick Start for Development

```bash
# 1. Install dependencies (see docs/SETUP.md)
npm install

# 2. Run the dev server
npm run dev

# 3. Run the unit tests (Vitest)
npm test

# 4. Production build (outputs to dist/)
npm run build
```

> **For full details on any step, load the corresponding document from `docs/`.**