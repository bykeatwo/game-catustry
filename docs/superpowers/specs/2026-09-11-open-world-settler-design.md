# Cat's Food Chain Farm — Open-World Settler (MVP) — Design Spec

**Date:** 2026-09-11
**Status:** Approved
**Source of truth for gameplay:** `IDEA.md` (existing food chain, XP/level, facility unlocks)

---

## 1. Purpose

Rebuild **Cat's Food Chain Farm** from the current vanilla-JS idle/tap prototype into an
**open-world, isometric 2D settler game**. The player controls a cat character that
**explores** an open map, **buys land** to expand it, **builds facilities** at fixed ruins,
**grows and processes a food chain**, and **sells produce to a merchant** for coins.

This document captures the design decisions agreed during brainstorming. It supersedes the
idle/tap framing in `IDEA.md`'s intro and the React-flavored examples in `DEVELOPMENT.md`.

### Non-goals (deferred out of MVP scope)

- Guild system, contribution points, medals (stat boosts)
- Tools & gear (equipment slots and bonuses)
- A backend/API and multiplayer/co-op
- A terminal win-state (open-ended sandbox)
- Voxel/3D terrain and true 3D rendering

---

## 2. Game Concept

### Core loop

```
Explore (move cat) → buy land plots (coins) → build facilities at ruins (coins)
→ buy seeds (merchant) → grow/farm crops → work facilities (proximity tap, energy)
→ climb food chain → sell produce to merchant (coins) → level up → unlock more
```

The loop is **open-ended**: there is no final goal. Progression runs through *level/XP*, which
gates facility unlocks and land expansion; the player's long-term drive is expanding territory
and mastering the full food chain.

### Feel

- **Movement-first, active** — the cat is a character the player moves (not an idle button).
- **Proximity interaction** — actions happen by *standing near* a facility/resource/merchant and
  tapping to work them. This is the single mechanic inherited from Overcooked-style games.
- **Settle-and-grow** — the player chooses *where* to expand and *what* to build; natural
  resources and buildable ruins are discovered by exploring.

---

## 3. Technology Stack

| Concern | Choice | Rationale |
|---|---|---|
| Language | **TypeScript** | Typed, maintainable, matches docs' intent |
| Build/bundler | **Vite** | Fast dev server + production build |
| Game engine | **Phaser 3** | Handles sprites, input (WASD/touch), cameras, isometric rendering |
| Rendering | **Isometric 2D, flat terrain** | Diamond tiles, 2D sprites, depth sorting; no voxel height |
| Tests | **Vitest** | Unit-test domain logic |
| Persistence | **localStorage** | No backend; save production + world state |
| Backend | **None** | Client-only single-player game |

NPM package versions to be pinned at implementation time (Phaser 3.x, Vite 5+, Vitest 1+).

---

## 4. Architecture

### 4.1 State split (hard rule)

The game uses a **single visible world but two strictly separated state domains**:

1. **`WorldMap` (overview map)** — holds *only*:
   - the tile grid (terrain / resource / ruin / facility / merchant types),
   - tile **ownership** (which land plots are bought),
   - the player's **position/velocity** (movement state).

   **No production data lives here.**

2. **`ProductionState` (production map)** — holds nearly all meaningful state:
   - facilities (built/not, active recipe, craft progress: taps done / taps needed),
   - plots/crops (crop type, growth progress),
   - inventory (item counts),
   - coins, XP, level, energy (current + max).

Communication direction: the world records *where* things are; `ProductionState` owns *what is
happening inside them*. This keeps movement lightweight and production isolated and testable.

> If a future phase introduces separate overview/base screens, only the *presentation* layer
> changes; these two state domains remain the backbone.

### 4.2 Layering

- **`domain/`** — pure game logic and entities (no Phaser imports): production math, energy,
  XP/level, unlock gates, recipes, economy, save/load serialization. Unit-tested.
- **`features/`** — per-system modules (world, player, farming, production, economy, merchant)
  exposing use-cases that mutate `WorldMap` / `ProductionState`.
- **`presentation/` (Phaser scenes)** — rendering, input, camera, depth sorting, UI overlays.
  Scenes read the two state domains and call domain use-cases; they never own game rules.
- **`data/`** — persistence (localStorage serialize/deserialize, migration, versioning).

Data flow is unidirectional: input → use-case → state mutation → render from state → save.

---

## 5. The World (Phaser scene)

- **Isometric tilemap**, flat, ~2:1 ratio diamond tiles, top-level scene with a **camera that
  follows the cat**.
- **Input:** WASD / arrow keys on desktop, a **virtual joystick** on touch. Phaser input
  handles both (responsive).
- **Map** starts small; edges expose **purchasable land plots**. Buying a plot (coins) flips its
  `owned` flag and reveals/generates adjacent tiles — **endless expansion**.
- **Tile contents** (discovered while exploring):
  - **Natural resources** — wild wheat patches first; carrot / potato / egg sources appear as
    land expands (always traceable to a natural resource).
  - **Buildable ruins/foundations** — fixed spots for Farm Plot, Mill, Bakery, Gourmet Studio.
  - **Merchant trading post** — a fixed central structure that **sells seeds** and **buys
    produce**.
- **Proximity interaction:** within range of a target, an interact prompt appears; tapping
  "works" that target (farm, craft, buy, sell, build).

---

## 6. Game Systems

### 6.1 Food chain (kept from IDEA.md)

| Tier | Items |
|---|---|
| Raw (farm) | wheat, carrot, potato, egg |
| Processed (Mill) | flour, carrot juice, mashed potato, omelette |
| Crafted (Bakery) | bread, carrot cake, crisps, pie |
| Gourmet (Gourmet Studio) | gourmet feast, royal platter |

Recipes and tier XP/energy values follow `IDEA.md`.

### 6.2 Production & farming

- A facility/plot has a **crop or recipe** and a **progress counter**. Each work-tap increments
  progress (+1 XP) and consumes **energy**.
- On reaching the tap threshold: consume inputs, produce output, award the **tier XP bonus**.
- Wild crops can be gathered; merchant-bought **seeds** allow planting/regrowing a crop at a plot.

### 6.3 Energy

- Work-taps drain energy (tier-based cost, per `IDEA.md`).
- Energy **regenerates over time** (Phaser timed event).
- **Max energy grows with level** (replaces the removed stamina *stat*).

### 6.4 Building & land

- **Building:** pay coins at a ruin/foundation → facility becomes usable. Unlock gates follow
  `IDEA.md` (Mill Lv3, Bakery Lv5, Gourmet Studio Lv9; basic farm from Lv1).
- **Land:** pay coins to buy adjacent plots → territory expands; more resources/ruins discovered.

### 6.5 Economy

- **Coins** are the only currency.
- **Sources:** selling produce to the merchant.
- **Sinks:** seeds, building facilities, buying land.

### 6.6 XP / Level

- Sources: work-tap +1, production completion +tier bonus, selling +small.
- Level gates facility unlocks and land-expansion availability. XP table unchanged from `IDEA.md`.

### 6.7 Merchant

- Fixed central trading post. **Sells seeds** (coins) and **buys produce** (coins).
- Kept minimal for MVP (a single shop surface; no wandering/stock timers).

---

## 7. Persistence & Save

- A serializable slice = `WorldMap` (tiles, ownership) + `ProductionState` (facilities, plots,
  inventory, coins, XP, level, energy).
- Save to `localStorage` on change (debounced) + periodic; load on boot with a schema version and
  migration hook.
- `data/` layer owns serialization; `domain/` types are the source of truth.

---

## 8. Testing Strategy

- **Vitest** unit tests for `domain/`: production math (taps/energy/tier XP), energy regen,
  XP/level thresholds + unlock gates, economy (buy/sell/build/land), and save/load round-trip.
- Phaser scenes are **not** unit-tested; coverage comes from play testing. Keep all rule logic in
  `domain/` so it is testable without Phaser.

---

## 9. Documentation Alignment

Update the docs so they describe the actual game and stack:

- **IDEA.md** — add a "v0.4 Open-World Settler" note re-framing the loop; mark guild/medals/gear
  as deferred.
- **ARCHITECTURE.md** — replace the REST API + guild/medal/gear data models with the two-domain
  state split and Phaser scene architecture.
- **DEVELOPMENT.md** — replace the React `.tsx` examples with the Phaser + TypeScript layering and
  isometric rendering guidance.
- **SETUP.md** — document `package.json`, `npm install`, `npm run dev`, Vitest.
- **DEPLOYMENT.md** — Vite production build output (static site) instructions.

---

## 10. Milestones (for planning)

1. **Project scaffold** — Vite + TS + Phaser + Vitest, `package.json`, folder structure, a blank
   isometric scene with a movable cat sprite (WASD + joystick).
2. **`domain/` core** — types, recipes, energy, XP/level, economy, save/load — fully unit-tested.
3. **World map** — tilemap, flat isometric rendering, camera follow, depth sorting, land-buying.
4. **Production** — facilities, plots, farming/crafting with proximity interaction + energy.
5. **Merchant & economy** — seeds + buying, selling produce, building facilities.
6. **Persistence & polish** — auto-save, load, UI overlays, docs alignment, build/deploy.