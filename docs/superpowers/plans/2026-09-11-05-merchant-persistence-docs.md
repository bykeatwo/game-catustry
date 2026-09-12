# Sub-Plan 5: Merchant, Persistence & Docs — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the MVPs economy loop (merchant sells seeds and buys produce), persist the game to localStorage, and align all `docs/*.md` with the actual Phaser + TypeScript open-world game.

**Architecture:** Merchant buy/sell actions are pure `domain` functions (tested). Persistence wraps the existing `serialize`/`deserialize` in a `localStorage` adapter with autosave. A DOM-overlay merchant shop is toggled from `GameScene`. Docs are rewritten to remove guild/medals/gear, REST API, and React examples.

**Tech Stack:** TypeScript, Phaser 3, localStorage.
**Spec:** `docs/superpowers/specs/2026-09-11-open-world-settler-design.md`
**Depends on:** Sub-Plans 1–4.

## Global Constraints

- Node ≥ 20; TypeScript strict; `src/domain/` Phaser-free.
- No backend; save key is `catustry-save`.

---

### Task 5.1: Merchant actions (buy seed, sell item)

**Files:**
- Create: `src/domain/merchant.ts`
- Test: `test/merchant.test.ts`

**Interfaces:**
- Produces: `buySeed(s, crop) → ActionResult`, `sellItem(s, id, qty=1) → ActionResult`. `buySeed` requires the crop to be `discoveredCrops`, charges `seedCost(crop)` coins, adds to `seeds`. `sellItem` removes `qty` from inventory, adds `sell*qty` coins, awards `xpForSell`.

- [ ] **Step 1: Write the failing test**

Create `test/merchant.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buySeed, sellItem } from '@/domain/merchant';
import { createInitialState } from '@/domain/state';
import { GameState } from '@/domain/types';

function scene(): GameState {
  const s = createInitialState();
  s.production.coins = 100;
  return s;
}

describe('buySeed', () => {
  it('sells discovered seeds for coins', () => {
    const s = scene(); // wheat discovered, seed cost 5
    const r = buySeed(s, 'wheat');
    expect(r.ok).toBe(true);
    expect(s.production.seeds.wheat).toBe(1);
    expect(s.production.coins).toBe(95);
  });
  it('rejects undiscovered crops', () => {
    const s = scene();
    expect(buySeed(s, 'carrot').reason).toBe('NOT_DISCOVERED');
  });
  it('rejects when coins insufficient', () => {
    const s = scene(); s.production.coins = 1;
    expect(buySeed(s, 'wheat').reason).toBe('INSUFFICIENT_COINS');
  });
});

describe('sellItem', () => {
  it('sells produce for coins + XP', () => {
    const s = scene();
    s.production.inventory.wheat = 3; // sell 3 each
    const r = sellItem(s, 'wheat', 2);
    expect(r.ok).toBe(true);
    expect(s.production.coins).toBe(100 + 6);
    expect(s.production.inventory.wheat).toBe(1);
    expect(s.production.xp).toBeGreaterThan(0);
  });
  it('rejects when not enough items', () => {
    const s = scene(); s.production.inventory.wheat = 1;
    expect(sellItem(s, 'wheat', 5).reason).toBe('NOT_ENOUGH');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — module missing.

- [ ] **Step 3: Write `src/domain/merchant.ts`**

```ts
import { GameState, CropId, ItemId } from './types';
import { SEED_COSTS, ITEMS } from './items';
import { seedCost, xpForSell } from './economy';
import { addItem, itemCount, ActionResult } from './actions';
import { gainXp } from './level';

export function buySeed(s: GameState, crop: CropId): ActionResult {
  if (!s.production.discoveredCrops.includes(crop)) return { ok: false, reason: 'NOT_DISCOVERED' };
  const cost = seedCost(crop);
  if (s.production.coins < cost) return { ok: false, reason: 'INSUFFICIENT_COINS' };
  s.production.coins -= cost;
  s.production.seeds[crop] = (s.production.seeds[crop] ?? 0) + 1;
  return { ok: true };
}

export function sellItem(s: GameState, id: ItemId, qty = 1): ActionResult {
  if (itemCount(s.production.inventory, id) < qty) return { ok: false, reason: 'NOT_ENOUGH' };
  const value = ITEMS[id].sell * qty;
  addItem(s.production.inventory, id, -qty);
  s.production.coins += value;
  gainXp(s.production, xpForSell(value));
  return { ok: true };
}
```

(Note: unused import `SEED_COSTS` is removed by the linter; keep only `ITEMS`.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/merchant.ts test/merchant.test.ts
git commit -m "feat(domain): add merchant buy/sell actions"
```

---

### Task 5.2: Store actions + localStorage persistence

**Files:**
- Create: `src/data/store.ts`
- Modify: `src/state/store.ts`
- Modify: `src/main.ts`

**Interfaces:**
- Produces: `loadState() → GameState | null`, `saveState(s) → void`; `GameStore.buySeed/sellItem` methods; `main.ts` loads saved state on boot.

- [ ] **Step 1: Write `src/data/store.ts`**

```ts
import { GameState } from '../domain/types';
import { serialize, deserialize } from '../domain/save';

const KEY = 'catustry-save';

export function loadState(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? deserialize(raw) : null;
  } catch {
    return null;
  }
}

export function saveState(s: GameState): void {
  try {
    localStorage.setItem(KEY, serialize(s));
  } catch {
    // ignore quota/serialization errors for MVP
  }
}
```

- [ ] **Step 2: Add merchant + save methods to `GameStore`**

```ts
import { buySeed as bs, sellItem as si } from '../domain/merchant';
import { CropId, ItemId } from '../domain/types';

buySeed(crop: CropId): ActionResult { return this.run(() => bs(this.state, crop)); }
sellItem(id: ItemId, qty = 1): ActionResult { return this.run(() => si(this.state, id, qty)); }
```

- [ ] **Step 3: Boot from saved state in `src/main.ts` / `GameScene.init`**

In `GameScene.init()`, prefer saved state:

```ts
import { loadState } from '../data/store';
init(): void {
  this.store = new GameStore(loadState() ?? createInitialState());
}
```

- [ ] **Step 4: Re-run tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/store.ts src/state/store.ts src/main.ts src/presentation/GameScene.ts
git commit -m "feat(data): persist game state to localStorage"
```

---

### Task 5.3: Autosave wiring

**Files:**
- Modify: `src/presentation/GameScene.ts`

**Interfaces:**
- Produces: debounced autosave on every store change + periodic save every 5s.

- [ ] **Step 1: Add autosave in `GameScene.create`**

```ts
import { saveState } from '../data/store';

let saveTimer: number | undefined;
this.store.subscribe(() => {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => saveState(this.store.getState()), 500);
});
this.time.addEvent({ delay: 5000, loop: true, callback: () => saveState(this.store.getState()) });
```

- [ ] **Step 2: Verify persistence**

Run: `npm run dev`
Expected: play a bit, refresh the page → coins/level/energy/inventory/position persist.

- [ ] **Step 3: Commit**

```bash
git add src/presentation/GameScene.ts
git commit -m "feat(scene): autosave state on change and periodically"
```

---

### Task 5.4: Merchant shop UI (DOM overlay)

**Files:**
- Modify: `index.html`
- Create: `src/presentation/MerchantUI.ts`
- Modify: `src/presentation/GameScene.ts`

**Interfaces:**
- Produces: `MerchantUI` that opens a DOM overlay listing buyable seeds (discovered crops + price) and sellable inventory (item + price), calling `store.buySeed`/`store.sellItem`. Opened when near the merchant tile.

- [ ] **Step 1: Add the overlay container to `index.html`**

```html
<div id="shop" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.55); z-index:50;">
  <div style="margin:10% auto; width:min(90%,420px); background:#fff; color:#222; border-radius:12px; padding:16px;">
    <h2 style="margin:0 0 8px;">🏪 Merchant</h2>
    <div id="shop-seeds"></div>
    <h3>Your goods</h3>
    <div id="shop-sell"></div>
    <button id="shop-close">Close</button>
  </div>
</div>
```

- [ ] **Step 2: Write `src/presentation/MerchantUI.ts`**

```ts
import { GameStore } from '../state/store';
import { ITEMS } from '../domain/items';
import { seedCost } from '../domain/economy';
import { CropId } from '../domain/types';

export class MerchantUI {
  private root = document.getElementById('shop')!;
  private seedsEl = document.getElementById('shop-seeds')!;
  private sellEl = document.getElementById('shop-sell')!;

  constructor(private store: GameStore) {
    document.getElementById('shop-close')!.addEventListener('click', () => this.close());
    this.store.subscribe(() => this.refresh());
  }

  open(): void { this.refresh(); this.root.style.display = 'block'; }
  close(): void { this.root.style.display = 'none'; }

  private refresh(): void {
    const p = this.store.getState().production;
    this.seedsEl.innerHTML = p.discoveredCrops
      .map(c => `<button data-seed="${c}">${c} seed — ${seedCost(c)}🪙</button>`).join('');
    const inv = Object.entries(p.inventory).filter(([, q]) => (q ?? 0) > 0) as [string, number][];
    this.sellEl.innerHTML = inv
      .map(([id, q]) => `<button data-sell="${id}">${ITEMS[id as keyof typeof ITEMS].name} ×${q} — ${ITEMS[id as keyof typeof ITEMS].sell}🪙</button>`).join('');

    this.seedsEl.querySelectorAll('button[data-seed]').forEach(b => b.addEventListener('click', () => {
      this.store.buySeed(b.getAttribute('data-seed')! as CropId);
    }));
    this.sellEl.querySelectorAll('button[data-sell]').forEach(b => b.addEventListener('click', () => {
      this.store.sellItem(b.getAttribute('data-sell')! as never);
    }));
  }
}
```

- [ ] **Step 3: Open the shop when near the merchant**

In `GameScene`, import `MerchantUI`, construct `this.shop = new MerchantUI(this.store)`, and in `update()` (using the already-computed `tile`):

```ts
if (tile?.kind === 'merchant') {
  this.prompt.show('Open merchant', 'Trade', () => this.shop.open());
} else if (this.shop) {
  this.shop.close();
}
```

- [ ] **Step 4: Verify**

Run: `npm run dev`
Expected: standing on the merchant (🌾→🏪 at `MERCHANT_POS`) opens a shop listing wheat seeds and your inventory; buying seeds and selling produce updates coins and persists.

- [ ] **Step 5: Commit**

```bash
git add index.html src/presentation/MerchantUI.ts src/presentation/GameScene.ts
git commit -m "feat(ui): add merchant shop overlay"
```

---

### Task 5.5: Align docs with the real game

**Files:**
- Modify: `README.md`, `IDEA.md`, `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT.md`, `docs/SETUP.md`, `docs/DEPLOYMENT.md`, `docs/TROUBLESHOOTING.md`

**Interfaces:**
- Produces: docs that reflect the open-world Phaser + TypeScript game; guild/medals/gear, REST API, and React examples removed.

- [ ] **Step 1: Rewrite `README.md` intro and "Key Features"**

Replace the game-overview/idle framing with: open-world isometric settler; movement (WASD/touch); land-purchase expansion; build facilities at ruins (coins-only); merchant for seeds + selling; full food chain; XP/level gates; localStorage save. Update the Quick-Start block to the Vite commands:

```bash
npm install
npm run dev      # dev server
npm test         # Vitest
npm run build    # production build (dist/)
```

- [ ] **Step 2: Update `IDEA.md`**

Add a top note: *"v0.4 — re-scoped to an open-world isometric settler (Phaser 3 + TypeScript). The guild/medal/gear systems and the REST API are deferred out of MVP; see `docs/superpowers/specs/2026-09-11-open-world-settler-design.md`."* Keep the food-chain, XP/level, and energy sections (still authoritative), and mark §04b (medals) and §04c (gear) as **deferred**.

- [ ] **Step 3: Rewrite `docs/ARCHITECTURE.md`**

Replace the "API endpoints" and guild/medal data models with: the two-domain state split (`WorldMap` = position + tile ownership; `ProductionState` = facilities/plots/progress/inventory/coins/XP/energy), the `domain/` (pure, Vitest) → `state/store` → `presentation/` (Phaser) → `data/` (localStorage) layering, and the concrete constants (XP thresholds, energy, costs) frozen in Sub-Plan 2.

- [ ] **Step 4: Rewrite `docs/DEVELOPMENT.md`**

Replace the React `.tsx` examples and "features/presentation/domain/data" tree with the actual `src/domain`, `src/state`, `src/presentation`, `src/data`, `src/config` structure and the Phaser isometric-rendering guidance (diamond tiles, depth sort, proximity interaction). Update "Quick Commands" to the Vite/Vitest scripts.

- [ ] **Step 5: Update `docs/SETUP.md` and `docs/DEPLOYMENT.md`**

`SETUP.md`: document `npm install`, `npm run dev`, `npm test` (drop any lingering "React/Next.js" references). `DEPLOYMENT.md`: describe `npm run build` → static `dist/` deploy (drop Capacitor/APK and cloud-sync guild sections, or mark them deferred).

- [ ] **Step 6: Prune `docs/TROUBLESHOOTING.md`**

Remove the medal/gear/stat-cap troubleshooting stanzas; add entries for the actual systems (energy regen, isometric depth sort, localStorage schema version/migration) matching Sub-Plans 2–5.

- [ ] **Step 7: Commit**

```bash
git add README.md IDEA.md docs/
git commit -m "docs: align documentation with open-world Phaser rebuild"
```

---

### Task 5.6: Final build & verification

**Files:**
- (none new)

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: all Vitest suites pass.

- [ ] **Step 2: Type-check + production build**

Run: `npm run build`
Expected: `tsc --noEmit` clean; `dist/` produced.

- [ ] **Step 3: Manual smoke test checklist**

Run: `npm run dev` and confirm the full loop end-to-end: move → find wild wheat → gather → sell at merchant → buy seed → plant → work plot → build mill → craft flour → (optional higher tiers) → buy land → expand → refresh persists everything.

- [ ] **Step 4: Commit any final fixes**

```bash
git add -A && git commit -m "chore: final build and verification"
```

---

### Self-Review (Sub-Plan 5)

- **Spec coverage:** merchant sells seeds + buys produce (§6.7, §6.5), persistence (§7), docs alignment (§9), build/deploy (§3 + §10). ✓
- **Placeholders:** none. ✓
- **Type consistency:** `buySeed`/`sellItem` reuse `ActionResult` from `actions.ts`; `seedCost`/`xpForSell` from `economy.ts`; store methods match domain signatures; docs commands match `package.json` scripts from Sub-Plan 1. ✓