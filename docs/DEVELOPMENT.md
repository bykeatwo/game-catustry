# 💻 DEVELOPMENT Guide — Game Development Workflow

> **For AI Agents**: Load this document for coding tasks, layering patterns, and isometric-rendering guidance.

---

## 🧱 Layering & Data Flow

```
input (WASD / joystick / tap) → domain use-case → GameStore state mutation
      → render from state (Phaser) → autosave (localStorage)
```

| Layer | Location | Rule |
|---|---|---|
| **Domain** | `src/domain/` | Pure, Phaser-free, Vitest-tested game rules |
| **Store** | `src/state/store.ts` | Single `GameState`; only mutable handle the scene reads/writes |
| **Presentation** | `src/presentation/` | Phaser scenes/sprites/input + DOM merchant UI |
| **Data** | `src/data/store.ts` | `localStorage` save/load adapter |
| **Config** | `src/config/gameConfig.ts` | Screen/tile/speed constants |

**Critical constraint:** never import Phaser inside `src/domain/`. Add all rule logic to `domain/` so it stays unit-testable.

---

## 📁 Project Structure

```
src/
├── config/gameConfig.ts        # width, height, tileWidth, tileHeight, isoRatio, playerSpeed
├── domain/
│   ├── types.ts                # GameState, WorldMap, ProductionState, Tile, Item, Recipe, ...
│   ├── items.ts                # ITEMS, RECIPES, TIER_XP, TIER_ENERGY, XP_THRESHOLDS, FACILITY_UNLOCK, BUILD_COSTS, SEED_COSTS
│   ├── production.ts           # energyPerTap, hasInputs
│   ├── energy.ts               # regenEnergy, maxEnergy
│   ├── level.ts                # xpToNext, maxEnergy, gainXp
│   ├── economy.ts              # xpForSell, landCost, buildCost, seedCost
│   ├── actions.ts              # workPlot, workFacility, plantCrop, gatherWild, buildFacility, addItem, itemCount
│   ├── merchant.ts             # buySeed, sellItem
│   ├── mapgen.ts               # generateTile, MERCHANT_POS
│   ├── world.ts                # tileAt, countOwned, isAdjacentToOwned, movePlayer, growWorld, buyLand
│   ├── state.ts                # createInitialState
│   └── save.ts                 # serialize, deserialize, migrate, SCHEMA_VERSION
├── state/store.ts              # GameStore (getState, subscribe, move, buyLand, work*/gather/build/buySeed/sellItem)
├── data/store.ts               # loadState, saveState
├── presentation/
│   ├── GameScene.ts            # main Phaser scene (update loop, interaction detection, autosave)
│   ├── iso.ts                  # isoToScreen, screenToIso
│   ├── textures.ts             # makeIsoTileTexture, makeCatTexture
│   ├── EntitySprites.ts        # drawProductionObjects (emoji sprites for plots/facilities/wild/ruin/merchant)
│   ├── JoystickInput.ts        # touch joystick
│   ├── InteractPrompt.ts       # proximity prompt + action button
│   └── MerchantUI.ts           # DOM merchant shop overlay
└── main.ts                     # Phaser boot
```

---

## 🎮 Core Game Systems

### World & Movement
- `tileAt(world, gx, gy)` indexes tiles by `gy * width + gx`.
- `movePlayer` clamps to bounds; `buyLand` checks adjacency and charges `landCost(countOwned(world))`, growing the world by a ring when buying a border tile.
- `growWorld` shifts existing tile coordinates and appends `generateTile`-generated ring tiles.

### Production
- `workPlot` / `workFacility` consume energy per tap, advance `progress`, and on completion consume inputs, produce the output item, and award tier XP.
- `plantCrop` consumes a seed to set a plot's crop. `gatherWild` yields a crop, discovers it, and depletes the tile. `buildFacility` charges coins and turns a ruin into a facility.

### Merchant
- `buySeed(crop)` requires the crop to be `discoveredCrops`, charges `seedCost`, adds to `seeds`.
- `sellItem(id, qty)` removes inventory, adds `sell * qty` coins, and awards `xpForSell`.

### Store
- `GameStore` wraps all domain use-cases, calls `notify()` on successful (`ok`) actions, and exposes `subscribe(fn)`.
- All `ActionResult`s are `{ ok: boolean; reason?: string; produced?: ItemId }`. Failures use reasons like `NO_ENERGY`, `NO_SEED`, `LEVEL_LOCKED`, `INSUFFICIENT_COINS`, `NOT_ENOUGH`, `NOT_DISCOVERED`.

---

## 🏔️ Isometric Rendering Guidance

- Tiles are **flat diamond tiles** (~2:1 ratio; `tileWidth=64`, `tileHeight=32`).
- `isoToScreen(gx, gy)` maps grid coords to screen pixels; depth = screen `y` so lower tiles render in front.
- The camera follows the cat (`cameras.main.centerOn(cat.x, cat.y)`).
- Tile tints: owned tiles use their `TILE_COLORS[tile.kind]`; unowned tiles render dark gray.
- Proximity interaction: convert the cat's screen position back to a grid tile with `screenToIso` + rounding, then route to the nearest facility/plot/wild/ruin/merchant.

---

## 🧪 Testing

- Run `npm test` (Vitest). Domain functions are pure and unit-tested under `test/`.
- Follow **TDD**: write the failing test first, then implement, then run `npm test`.
- Add a test file alongside each new domain module (e.g. `test/merchant.test.ts` for `src/domain/merchant.ts`).

---

## 📝 Development Workflow

```
1. Read the design spec + ARCHITECTURE for the system you're building
2. Identify domain entities & use-cases
3. Write domain tests first (TDD)
4. Implement domain use-cases
5. Wire into GameStore
6. Render/interact in the Phaser scene
7. Run npm test + npx tsc --noEmit, then verify in npm run dev
```

---

## ⚡ Quick Commands

| Task | Command |
|---|---|
| Install deps | `npm install` |
| Run dev server | `npm run dev` |
| Run tests | `npm test` |
| Watch tests | `npm run test:watch` |
| Type-check only | `npx tsc --noEmit` |
| Production build | `npm run build` |
| Preview build | `npm run preview` |

---

## 📚 Key Resources

- Design spec (source of truth): `docs/superpowers/specs/2026-09-11-open-world-settler-design.md`
- Architecture & data models: `docs/ARCHITECTURE.md`
- Setup: `docs/SETUP.md`
- Deployment: `docs/DEPLOYMENT.md`