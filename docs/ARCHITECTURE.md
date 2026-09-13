# 🏗️ ARCHITECTURE Guide — Systems & Data Models

> **For AI Agents**: Load this document to understand the game's architecture, data model, progression systems, and layering. Reference when building features.

---

## 🎯 Game Overview

**Cat's Food Chain Farm** is an **open-world isometric 2D settler** built with **Phaser 3 + TypeScript + Vite**. There is no backend — the game is client-only, single-player, with `localStorage` persistence.

The player controls a cat that explores a generated tile map, buys land, builds facilities at ruins, grows/processes a food chain, and sells produce to a merchant.

---

## 🧱 Layering

Data flows **unidirectionally**: `input → use-case → state mutation → render from state → save`.

| Layer | Location | Responsibility | Phaser-free? |
|---|---|---|---|
| **domain/** | `src/domain/*.ts` | Pure game rules: types, items/recipes, production, energy, XP/level, economy, actions, merchant, map generation, save/load. | ✅ Yes (Vitest-tested) |
| **state/** | `src/state/store.ts` | In-memory `GameStore` — the single mutable handle read/written by the scene. | ✅ Yes |
| **config/** | `src/config/gameConfig.ts` | Screen dimensions, tile sizes, movement speed. | ✅ Yes |
| **presentation/** | `src/presentation/*.ts` | Phaser scene, textures, sprites, input, camera, depth sort, DOM merchant UI. | ❌ No (imports Phaser) |
| **data/** | `src/data/store.ts` | `localStorage` save/load adapter (debounced autosave + periodic). | ✅ Yes |

**Key rule:** `src/domain/` never imports Phaser. All game rules live there so they are unit-testable in Node. The Phaser scene only reads the store and calls domain use-cases; it never owns game rules.

---

## 📊 State Split (hard rule)

There are **two strictly separated state domains** inside a single `GameState`:

### 1. `WorldMap` — where things are
```typescript
interface WorldMap {
  width: number;
  height: number;
  tiles: Tile[];                  // length = width * height, index = gy * width + gx
  player: { gx: number; gy: number };
}

interface Tile {
  gx: number;
  gy: number;
  kind: TileKind;                 // 'grass' | 'wild' | 'ruin' | 'merchant' | 'unowned'
  owned: boolean;                 // has the player bought this land
  resource?: CropId;              // present when kind === 'wild'
  ruinType?: FacilityType;        // present when kind === 'ruin'
}
```

### 2. `ProductionState` — what is happening inside
```typescript
interface ProductionState {
  coins: number;
  level: number;
  xp: number;
  energy: number;
  inventory: Inventory;                       // Partial<Record<ItemId, number>>
  seeds: Partial<Record<CropId, number>>;
  plots: Plot[];                              // id, gx, gy, crop, progress
  facilities: Facility[];                     // id, gx, gy, type, recipe, progress
  discoveredCrops: CropId[];
}
```

Communication direction: the world records *where* things are; `ProductionState` owns *what is happening inside them*. Movement stays lightweight; production stays isolated and testable.

---

## 🗺️ Map Generation (deterministic)

`src/domain/mapgen.ts` generates tiles from coordinates via a stable hash:

- **Merchant post** at fixed `MERCHANT_POS = { x: 4, y: 4 }`.
- A minority of tiles are **wild** (carry a `resource` crop: wheat/carrot/potato/egg).
- A smaller minority are **ruins** (carry a `ruinType`: mill/bakery/gourmet).
- The rest are plain grass.
- All generated tiles are `owned: false`. The starting 3×3 area around spawn is owned grass.

`createInitialState` uses `generateTile` for non-start tiles; `growWorld` uses it for newly added expansion rings.

---

## 🌾 Food Chain

| Tier | Items |
|---|---|
| Raw (farm) | wheat, carrot, potato, egg |
| Processed (Mill) | flour, carrot juice, mashed potato, omelette |
| Crafted (Bakery) | bread, carrot cake, crisps, pie |
| Gourmet (Gourmet Studio) | gourmet feast, royal platter |

Each item has `taps` (work-taps to complete) and `sell` (coin value). Recipes declare inputs and the facility/level required.

---

## ⚙️ Progression Constants (frozen in implementation)

These live in `src/domain/items.ts`, `economy.ts`, `level.ts`, and `energy.ts`.

### XP
- Work-tap: **+1** XP.
- Production completion tier bonus: **raw +3, processed +8, crafted +20, gourmet +60**.
- Selling: `max(1, floor(sellValue / 5))`.

### Level thresholds (cumulative XP required)
| Level | XP to next (delta) | Cumulative | Unlocks |
|---|---|---|---|
| 1 → 2 | 50 | 50 | — |
| 2 → 3 | 100 | 150 | Mill (Lv 3) |
| 3 → 4 | 200 | 350 | — |
| 4 → 5 | 350 | 700 | Bakery (Lv 5) |
| 5 → 6 | 500 | 1,200 | — |
| 6 → 7 | 800 | 2,000 | — |
| 7 → 8 | 1,200 | 3,200 | — |
| 8 → 9 | 1,800 | 5,000 | Gourmet Studio (Lv 9) |
| 9 → 10 | 3,000 | 8,000 | — |

`MAX_LEVEL = 10`. After max level, XP resets to 0.

### Energy
- Energy-per-tap by tier: **raw 2, processed 3, crafted 4, gourmet 5**.
- **Max energy** grows with level: `100 + (level - 1) * 10`.
- Energy **regenerates over time** (frame-based in the scene).

### Economy (coins are the only currency)
- **Land cost**: `50 + ownedCount * 10`.
- **Build costs**: farm 50, mill 100, bakery 250, gourmet 800.
- **Seed costs**: wheat 5, carrot 10, potato 15, egg 12.

---

## 💾 Persistence

- Save key: `catustry-save` (in `localStorage`).
- Serialization: JSON of the whole `GameState` (`src/domain/save.ts`).
- `SCHEMA_VERSION = 1`; `deserialize` rejects mismatched versions; `migrate` is the hook for future versions.
- Autosave is **debounced (500 ms)** on state change + a **periodic fallback (5 s)**.

---

## 🎬 Presentation (Phaser)

- `GameScene` renders tiles from `WorldMap`, tints owned tiles by kind, draws production objects (plots/facilities/wild/ruin/merchant) as emoji sprites, and depth-sorts by iso screen `y`.
- Input: WASD/arrows + touch joystick → screen-space movement → converted back to an iso grid target for proximity interaction.
- The merchant shop is a **DOM overlay** (`MerchantUI`) toggled when standing on the merchant tile; it calls `store.buySeed` / `store.sellItem`.

---

## 🧪 Testing Strategy

- **Vitest** unit-tests everything in `src/domain/` (types, items, economy, level, energy, production, actions, merchant, save/load, world, map generation).
- Phaser scenes are **not** unit-tested; coverage is from manual play. All rule logic is kept in `domain/` to remain testable.

---

## 📚 References

- Design spec: `docs/superpowers/specs/2026-09-11-open-world-settler-design.md`
- Original game spec: `IDEA.md` (guild/medals/gear deferred)
- Development workflow: `docs/DEVELOPMENT.md`
- Deployment: `docs/DEPLOYMENT.md`
- Troubleshooting: `docs/TROUBLESHOOTING.md`