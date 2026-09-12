# Sub-Plan 4: Production, Farming & Interaction — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the food chain playable: farm plots, gatherable wild crops, buildable facilities (Mill/Bakery/Gourmet), proximity-based working with energy drain and XP, all wired into the Phaser scene.

**Architecture:** Production/economy actions (work, plant, gather, build) live in `src/domain/actions.ts` and are unit-tested. `GameStore` gains those actions. `GameScene` renders plots/facilities/ruins/wild tiles as sprites with progress, detects proximity to offer an interact prompt, and runs an energy-regen + HUD loop.

**Tech Stack:** TypeScript, Phaser 3.
**Spec:** `docs/superpowers/specs/2026-09-11-open-world-settler-design.md`
**Depends on:** Sub-Plans 1–3 (`GameState`, `GameStore`, `GameScene`, `InteractPrompt`, domain helpers).

## Global Constraints

- Node ≥ 20; TypeScript strict; `src/domain/` stays Phaser-free.
- Deferred: guild/medals/gear/backend/win-state.

---

### Task 4.1: Extend state model for seeds and locations

**Files:**
- Modify: `src/domain/types.ts`
- Modify: `src/domain/state.ts`

**Interfaces:**
- Produces: `ProductionState.seeds: Partial<Record<CropId, number>>`; `Plot.gx/gy`; `Facility.gx/gy`.

- [ ] **Step 1: Extend `ProductionState`, `Plot`, `Facility` in `src/domain/types.ts`**

Add the `seeds` field to `ProductionState` and location fields to `Plot`/`Facility`:

```ts
export interface Plot {
  id: string;
  gx: number;
  gy: number;
  crop: CropId | null;
  progress: number;
}

export interface Facility {
  id: string;
  gx: number;
  gy: number;
  type: FacilityType;
  recipe: ItemId | null;
  progress: number;
}

export interface ProductionState {
  coins: number;
  level: number;
  xp: number;
  energy: number;
  inventory: Inventory;
  seeds: Partial<Record<CropId, number>>;
  plots: Plot[];
  facilities: Facility[];
  discoveredCrops: CropId[];
}
```

- [ ] **Step 2: Update `createInitialState` in `src/domain/state.ts`**

```ts
// production object gains `seeds: {}` and the starter plot gains gx/gy:
plots: [{ id: 'plot-0', gx: 1, gy: 0, crop: 'wheat', progress: 0 }],
seeds: {},
```

- [ ] **Step 3: Fix any snapshot tests**

Run: `npm test`
Expected: existing tests pass after updating the two tests that build `ProductionState` literals in `test/level.test.ts`, `test/energy.test.ts`, `test/production.test.ts` (add `seeds: {}` and give any plots/facilities `gx/gy`).

- [ ] **Step 4: Commit**

```bash
git add src/domain/types.ts src/domain/state.ts test/
git commit -m "feat(domain): add seeds and facility/plot locations to state"
```

---

### Task 4.2: Production & economy actions

**Files:**
- Create: `src/domain/actions.ts`
- Test: `test/actions.test.ts`

**Interfaces:**
- Produces: `ActionResult`, `addItem(inv, id, qty)`, `itemCount(inv, id)`, `workPlot(s, i)`, `workFacility(s, i)`, `plantCrop(s, i, crop)`, `gatherWild(s, gx, gy)`, `buildFacility(s, gx, gy)`. `ActionResult = { ok: boolean; reason?: string; produced?: ItemId }`.

- [ ] **Step 1: Write the failing test**

Create `test/actions.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { workPlot, workFacility, plantCrop, gatherWild, buildFacility, itemCount } from '@/domain/actions';
import { createInitialState } from '@/domain/state';
import { GameState } from '@/domain/types';

function scene(): GameState {
  const s = createInitialState();
  s.production.energy = 1000;
  s.production.coins = 1000;
  return s;
}

describe('workPlot', () => {
  it('progresses and harvests after enough taps', () => {
    const s = scene();
    const plot = s.production.plots[0]; // wheat, taps 5
    let produced: string | undefined;
    for (let i = 0; i < 5; i++) produced = workPlot(s, 0).produced;
    expect(produced).toBe('wheat');
    expect(itemCount(s.production.inventory, 'wheat')).toBe(1);
  });
  it('consumes energy per tap', () => {
    const s = scene(); s.production.energy = 3;
    workPlot(s, 0);
    expect(s.production.energy).toBe(1); // raw energy/tap = 2
  });
  it('rejects empty plots', () => {
    const s = scene(); s.production.plots[0].crop = null;
    expect(workPlot(s, 0).reason).toBe('EMPTY_PLOT');
  });
});

describe('plantCrop', () => {
  it('consumes a seed to set the crop', () => {
    const s = scene(); s.production.seeds.carrot = 1;
    const r = plantCrop(s, 0, 'carrot');
    expect(r.ok).toBe(true);
    expect(s.production.plots[0].crop).toBe('carrot');
    expect(s.production.seeds.carrot).toBeFalsy();
  });
  it('rejects without a seed', () => {
    const s = scene();
    expect(plantCrop(s, 0, 'carrot').reason).toBe('NO_SEED');
  });
});

describe('gatherWild', () => {
  it('yields the crop and discovers it', () => {
    const s = scene();
    // make a wild carrot tile at (2,2)
    const t = s.world.tiles.find(t => t.gx === 2 && t.gy === 2)!;
    t.kind = 'wild'; t.resource = 'carrot';
    const r = gatherWild(s, 2, 2);
    expect(r.produced).toBe('carrot');
    expect(s.production.discoveredCrops).toContain('carrot');
    expect(t.kind).toBe('grass'); // depleted
  });
});

describe('buildFacility', () => {
  it('builds a mill at a ruin and deducts coins', () => {
    const s = scene();
    const t = s.world.tiles.find(t => t.gx === 3 && t.gy === 3)!;
    t.kind = 'ruin'; t.ruinType = 'mill';
    s.production.level = 3;
    const r = buildFacility(s, 3, 3);
    expect(r.ok).toBe(true);
    expect(s.production.facilities).toHaveLength(1);
    expect(s.production.facilities[0].type).toBe('mill');
    expect(s.production.coins).toBe(1000 - 100);
  });
  it('rejects when level locked', () => {
    const s = scene();
    const t = s.world.tiles.find(t => t.gx === 3 && t.gy === 3)!;
    t.kind = 'ruin'; t.ruinType = 'bakery';
    expect(buildFacility(s, 3, 3).reason).toBe('LEVEL_LOCKED');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `src/domain/actions.ts` missing.

- [ ] **Step 3: Write `src/domain/actions.ts`**

```ts
import { GameState, CropId, Inventory, ItemId } from './types';
import { ITEMS, RECIPES, TIER_XP, FACILITY_UNLOCK } from './items';
import { energyPerTap, hasInputs } from './production';
import { gainXp } from './level';
import { buildCost } from './economy';
import { tileAt } from './world';

export type ActionResult = { ok: boolean; reason?: string; produced?: ItemId };

export function addItem(inv: Inventory, id: ItemId, qty = 1): void {
  inv[id] = (inv[id] ?? 0) + qty;
  if ((inv[id] ?? 0) <= 0) delete inv[id];
}

export function itemCount(inv: Inventory, id: ItemId): number {
  return inv[id] ?? 0;
}

export function workPlot(s: GameState, plotIndex: number): ActionResult {
  const plot = s.production.plots[plotIndex];
  if (!plot || !plot.crop) return { ok: false, reason: 'EMPTY_PLOT' };
  const item = ITEMS[plot.crop];
  if (s.production.energy < energyPerTap('raw')) return { ok: false, reason: 'NO_ENERGY' };
  s.production.energy -= energyPerTap('raw');
  gainXp(s.production, 1);
  plot.progress += 1;
  if (plot.progress >= item.taps) {
    addItem(s.production.inventory, item.id, 1);
    gainXp(s.production, TIER_XP.raw);
    plot.progress = 0;
    return { ok: true, produced: item.id };
  }
  return { ok: true };
}

export function workFacility(s: GameState, facilityIndex: number): ActionResult {
  const f = s.production.facilities[facilityIndex];
  if (!f || !f.recipe) return { ok: false, reason: 'NO_RECIPE' };
  const recipe = RECIPES[f.recipe];
  const item = ITEMS[f.recipe];
  if (s.production.level < recipe.level) return { ok: false, reason: 'LEVEL_LOCKED' };
  if (!hasInputs(s.production, recipe)) return { ok: false, reason: 'MISSING_INPUTS' };
  if (s.production.energy < energyPerTap(item.tier)) return { ok: false, reason: 'NO_ENERGY' };
  s.production.energy -= energyPerTap(item.tier);
  gainXp(s.production, 1);
  f.progress += 1;
  if (f.progress >= item.taps) {
    for (const [id, qty] of Object.entries(recipe.inputs) as [ItemId, number][]) {
      addItem(s.production.inventory, id, -qty);
    }
    addItem(s.production.inventory, item.id, 1);
    gainXp(s.production, TIER_XP[item.tier]);
    f.progress = 0;
    return { ok: true, produced: item.id };
  }
  return { ok: true };
}

export function plantCrop(s: GameState, plotIndex: number, crop: CropId): ActionResult {
  const plot = s.production.plots[plotIndex];
  if (!plot) return { ok: false, reason: 'NO_PLOT' };
  if ((s.production.seeds[crop] ?? 0) < 1) return { ok: false, reason: 'NO_SEED' };
  s.production.seeds[crop] = (s.production.seeds[crop] ?? 0) - 1;
  plot.crop = crop;
  plot.progress = 0;
  return { ok: true };
}

export function gatherWild(s: GameState, gx: number, gy: number): ActionResult {
  const t = tileAt(s.world, gx, gy);
  if (!t || t.kind !== 'wild' || !t.resource) return { ok: false, reason: 'NO_RESOURCE' };
  const crop = t.resource;
  if (!s.production.discoveredCrops.includes(crop)) s.production.discoveredCrops.push(crop);
  addItem(s.production.inventory, crop, 1);
  gainXp(s.production, TIER_XP.raw);
  t.kind = 'grass'; // depleted
  delete t.resource;
  return { ok: true, produced: crop };
}

export function buildFacility(s: GameState, gx: number, gy: number): ActionResult {
  const t = tileAt(s.world, gx, gy);
  if (!t || t.kind !== 'ruin' || !t.ruinType) return { ok: false, reason: 'NO_RUIN' };
  const type = t.ruinType;
  if (s.production.level < FACILITY_UNLOCK[type]) return { ok: false, reason: 'LEVEL_LOCKED' };
  const cost = buildCost(type);
  if (s.production.coins < cost) return { ok: false, reason: 'INSUFFICIENT_COINS' };
  s.production.coins -= cost;
  s.production.facilities.push({
    id: `fac-${s.production.facilities.length}`,
    gx, gy, type, recipe: null, progress: 0
  });
  t.kind = 'grass';
  delete t.ruinType;
  return { ok: true };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/actions.ts test/actions.test.ts
git commit -m "feat(domain): add production and economy actions"
```

---

### Task 4.3: Expose actions on the store

**Files:**
- Modify: `src/state/store.ts`

**Interfaces:**
- Produces: `GameStore.workPlot(i)`, `workFacility(i)`, `plantCrop(i, crop)`, `gatherWild(gx, gy)`, `buildFacility(gx, gy)` — each returning `ActionResult` and notifying on `ok`.

- [ ] **Step 1: Add action methods to `GameStore`**

```ts
import { workPlot as wp, workFacility as wf, plantCrop as pc, gatherWild as gw, buildFacility as bf, ActionResult } from '../domain/actions';

// inside GameStore, after buyLand():
private run<R extends ActionResult>(action: () => R): R {
  const r = action();
  if (r.ok) this.notify();
  return r;
}
workPlot(i: number): ActionResult { return this.run(() => wp(this.state, i)); }
workFacility(i: number): ActionResult { return this.run(() => wf(this.state, i)); }
plantCrop(i: number, crop: CropId): ActionResult { return this.run(() => pc(this.state, i, crop)); }
gatherWild(gx: number, gy: number): ActionResult { return this.run(() => gw(this.state, gx, gy)); }
buildFacility(gx: number, gy: number): ActionResult { return this.run(() => bf(this.state, gx, gy)); }
```

Add `CropId` to the existing `../domain/types` import.

- [ ] **Step 2: Re-run tests**

Run: `npm test`
Expected: all pass (store tests still green; no new store tests required here).

- [ ] **Step 3: Commit**

```bash
git add src/state/store.ts
git commit -m "feat(state): expose production actions on store"
```

---

### Task 4.4: Render plots, facilities, ruins, and wild tiles; interact

**Files:**
- Create: `src/presentation/EntitySprites.ts`
- Modify: `src/presentation/GameScene.ts`

**Interfaces:**
- Produces: `drawProductionObjects(scene, store)` that (re)creates sprites for wild/ruin/plot/facility at their tile positions with progress indicators; `GameScene` detects the nearest interactable within range and routes taps to the right store action.

- [ ] **Step 1: Write `src/presentation/EntitySprites.ts`**

```ts
import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { isoToScreen } from './iso';
import { GameStore } from '../state/store';

const EMBLEM: Record<string, string> = {
  mill: '🏭', bakery: '🥖', gourmet: '👨‍🍳', plot: '🌱', ruin: '🧱', wild: '🌾'
};

export function drawProductionObjects(scene: Phaser.Scene, store: GameStore): void {
  const { world, production } = store.getState();
  const group = (scene as any).prodGroup as Phaser.GameObjects.Group;
  group.clear(true, true);

  // wild + ruin tiles
  for (const t of world.tiles) {
    if (t.kind === 'wild' || t.kind === 'ruin') {
      const { x, y } = isoToScreen(t.gx, t.gy, GAME_CONFIG.tileWidth, GAME_CONFIG.tileHeight);
      const label = scene.add.text(x, y, EMBLEM[t.kind], { fontSize: '22px' }).setOrigin(0.5).setDepth(y);
      group.add(label);
    }
  }
  // plots
  for (const p of production.plots) {
    const { x, y } = isoToScreen(p.gx, p.gy, GAME_CONFIG.tileWidth, GAME_CONFIG.tileHeight);
    const label = scene.add.text(x, y, EMBLEM.plot, { fontSize: '22px' }).setOrigin(0.5).setDepth(y);
    group.add(label);
  }
  // facilities
  for (const f of production.facilities) {
    const { x, y } = isoToScreen(f.gx, f.gy, GAME_CONFIG.tileWidth, GAME_CONFIG.tileHeight);
    const label = scene.add.text(x, y, EMBLEM[f.type], { fontSize: '22px' }).setOrigin(0.5).setDepth(y);
    group.add(label);
  }
}
```

- [ ] **Step 2: Wire into `GameScene`**

In `create()`, add `(this as any).prodGroup = this.add.group();` and call `drawProductionObjects` inside the existing `renderWorld()` subscriber; in `update()`, detect the hovered tile already computed (`tx`,`ty`) and route a tap:

```ts
import { drawProductionObjects } from './EntitySprites';
import { buildFacility, gatherWild, workPlot, workFacility } from '../domain/actions';

// in the subscriber:
drawProductionObjects(this, this.store);

// in update(), after land-buy prompt logic, detect an interact target:
const p = this.store.getState().production;
const nearPlot = p.plots.findIndex(q => q.gx === tx && q.gy === ty);
const nearFac = p.facilities.findIndex(f => f.gx === tx && f.gy === ty);
const tile = tileAt(this.store.getState().world, tx, ty);

if (nearPlot >= 0) {
  this.prompt.show('Work / plant plot', 'Tap to work', () => { this.store.workPlot(nearPlot); });
} else if (nearFac >= 0) {
  this.prompt.show('Work facility', 'Tap to work', () => { this.store.workFacility(nearFac); });
} else if (tile?.kind === 'wild') {
  this.prompt.show(`Gather ${tile.resource}`, 'Gather', () => { this.store.gatherWild(tx, ty); });
} else if (tile?.kind === 'ruin') {
  this.prompt.show(`Build ${tile.ruinType}`, 'Build', () => { this.store.buildFacility(tx, ty); });
}
```

- [ ] **Step 3: Add a starter plot/ruin/wild tiles for manual testing**

Temporarily, in `create()` (for this task only), mark a few tiles so the loop is visible: set `tileAt(world, 3, 3).kind = 'ruin'; ruinType='mill'` and `tileAt(world, 2, 2)` wild wheat, then set coins/level high. Note: remove this scaffolding in Task 4.6 (map generation).

- [ ] **Step 4: Verify manually**

Run: `npm run dev`
Expected: emoji sprites for plot/ruin/wild/facility render at their iso positions; standing on them shows the right prompt; tapping works the plot (progress → wheat in inventory), gathers wild, and builds the mill when level ≥ 3.

- [ ] **Step 5: Commit**

```bash
git add src/presentation/EntitySprites.ts src/presentation/GameScene.ts
git commit -m "feat(scene): render and interact with production objects"
```

---

### Task 4.5: Energy regen loop + HUD

**Files:**
- Create: `src/presentation/HUD.ts`
- Modify: `src/presentation/GameScene.ts`

**Interfaces:**
- Produces: `HUD` that renders coins, energy (current/max), level, XP; `GameScene.update` calls `regenEnergy` each frame with `delta`.

- [ ] **Step 1: Write `src/presentation/HUD.ts`**

```ts
import Phaser from 'phaser';
import { GameStore } from '../state/store';
import { maxEnergy } from '../domain/level';

export class HUD {
  private text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, private store: GameStore) {
    this.text = scene.add.text(16, 16, '', { fontSize: '16px', color: '#fff', backgroundColor: '#00000088' })
      .setScrollFactor(0).setDepth(1000);
    this.refresh();
  }

  refresh(): void {
    const p = this.store.getState().production;
    this.text.setText(
      `🪙 ${p.coins}   ⚡ ${Math.floor(p.energy)}/${maxEnergy(p.level)}   Lv ${p.level}   ${p.xp} XP`
    );
  }
}
```

- [ ] **Step 2: Wire regen + HUD into `GameScene`**

Construct `this.hud = new HUD(this, this.store)` in `create()`; subscribe the HUD refresh to the store; and in `update(_time, delta)` call:

```ts
import { regenEnergy } from '../domain/energy';
regenEnergy(this.store.getState().production, delta);
this.hud.refresh();
```

- [ ] **Step 3: Verify**

Run: `npm run dev`
Expected: HUD shows coins/energy/level/XP; energy drains on work and visibly regenerates over time; XP/level advance.

- [ ] **Step 4: Commit**

```bash
git add src/presentation/HUD.ts src/presentation/GameScene.ts
git commit -m "feat(scene): add energy regen and HUD"
```

---

### Task 4.6: Deterministic map generation (wild crops + ruins)

**Files:**
- Create: `src/domain/mapgen.ts`
- Test: `test/mapgen.test.ts`
- Modify: `src/domain/state.ts`, `src/domain/world.ts`

**Interfaces:**
- Produces: `generateTile(gx, gy) → Tile` (deterministic from coordinates). Wild tiles carry a `resource` crop chosen by a stable hash; a minority are `ruin` with a `ruinType`. The merchant tile is placed at a fixed `MERCHANT_POS`. `createInitialState` and `growWorld` use it instead of hardcoding `unowned`.

- [ ] **Step 1: Write the failing test**

Create `test/mapgen.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { generateTile, MERCHANT_POS } from '@/domain/mapgen';

describe('generateTile', () => {
  it('is deterministic', () => {
    const a = generateTile(5, 7);
    const b = generateTile(5, 7);
    expect(a).toEqual(b);
  });
  it('places the merchant at its fixed position', () => {
    expect(generateTile(MERCHANT_POS.x, MERCHANT_POS.y).kind).toBe('merchant');
  });
  it('never marks generated tiles owned', () => {
    for (let i = 0; i < 200; i++) {
      const t = generateTile(i % 20, Math.floor(i / 20));
      expect(t.owned).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — module missing.

- [ ] **Step 3: Write `src/domain/mapgen.ts`**

```ts
import { Tile, CropId, FacilityType } from './types';

export const MERCHANT_POS = { x: 4, y: 4 };

function hash2(x: number, y: number): number {
  let h = (x * 0x9E3779B1) ^ (y * 0x85EBCA6B);
  h ^= h >>> 13;
  return h >>> 0;
}

const CROPS: CropId[] = ['wheat', 'carrot', 'potato', 'egg'];
const RUINS: FacilityType[] = ['mill', 'bakery', 'gourmet'];

export function generateTile(gx: number, gy: number): Tile {
  if (gx === MERCHANT_POS.x && gy === MERCHANT_POS.y) {
    return { gx, gy, kind: 'merchant', owned: true };
  }
  const h = hash2(gx, gy);
  const r = h % 100;
  if (r < 20) return { gx, gy, kind: 'wild', owned: false, resource: CROPS[h % CROPS.length] };
  if (r < 26) return { gx, gy, kind: 'ruin', owned: false, ruinType: RUINS[h % RUINS.length] };
  return { gx, gy, kind: 'grass', owned: false };
}
```

- [ ] **Step 4: Use it in `createInitialState` and `growWorld`**

In `src/domain/state.ts`, replace the per-tile `{ gx, gy, kind: 'unowned', owned: false }` with `generateTile(gx, gy)`. In `src/domain/world.ts` `growWorld`, replace the `unowned` fallback tile with `generateTile(gx, gy)` (but force `owned: false` on the merchant tile override kept by `generateTile`).

- [ ] **Step 5: Run tests**

Run: `npm test`
Expected: full suite passes.

- [ ] **Step 6: Remove Task 4.4 scaffolding and verify**

Run: `npm run dev`
Expected: the generated map shows scattered wild crops (🌾) and ruins (🧱), with the merchant at (4,4); walked-to wild tiles gather and deplete; ruins build into facilities.

- [ ] **Step 7: Commit**

```bash
git add src/domain/mapgen.ts test/mapgen.test.ts src/domain/state.ts src/domain/world.ts src/presentation/GameScene.ts
git commit -m "feat(world): generate deterministic wild crops and ruins"
```

---

### Self-Review (Sub-Plan 4)

- **Spec coverage:** farming/production with progress + energy + tier XP (§6.2), gathering wild resources + discovery (§2, §6.1), building facilities at ruins (§6.4), energy regen (§6.3), HUD. Merchant (seeds/selling) is Sub-Plan 5. ✓
- **Placeholders:** none. ✓
- **Type consistency:** `ActionResult` reasons match between tests and impl; `workFacility` uses `hasInputs`/`energyPerTap`/`gainXp`/`buildCost` from earlier plans with matching signatures; `generateTile` returns `Tile` matching `types.ts`. ✓