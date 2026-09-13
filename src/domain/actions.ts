import { GameState, CropId, Inventory, ItemId, Facility, FACILITY_SIZE } from './types';
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

export function facilityAt(facilities: Facility[], gx: number, gy: number): Facility | undefined {
  return facilities.find(f =>
    gx >= f.gx && gx < f.gx + FACILITY_SIZE && gy >= f.gy && gy < f.gy + FACILITY_SIZE
  );
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
    plot.crop = null; // harvested — must re-plant to grow again
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
  // 2x2 footprint costs 4x single-tile cost
  const cost = buildCost(type) * FACILITY_SIZE * FACILITY_SIZE;
  if (s.production.coins < cost) return { ok: false, reason: 'INSUFFICIENT_COINS' };

  // validate the 2x2 footprint is within bounds, not blocked, not already occupied
  for (let oy = 0; oy < FACILITY_SIZE; oy++) {
    for (let ox = 0; ox < FACILITY_SIZE; ox++) {
      const ct = tileAt(s.world, gx + ox, gy + oy);
      if (!ct) return { ok: false, reason: 'OUT_OF_BOUNDS' };
      if (ct.kind === 'merchant') return { ok: false, reason: 'BLOCKED' };
      if (facilityAt(s.production.facilities, gx + ox, gy + oy)) return { ok: false, reason: 'OCCUPIED' };
    }
  }

  s.production.coins -= cost;
  s.production.facilities.push({
    id: `fac-${s.production.facilities.length}`,
    gx, gy, type, recipe: null, progress: 0
  });

  // clear the 2x2 footprint
  for (let oy = 0; oy < FACILITY_SIZE; oy++) {
    for (let ox = 0; ox < FACILITY_SIZE; ox++) {
      const ct = tileAt(s.world, gx + ox, gy + oy)!;
      ct.kind = 'grass';
      delete ct.ruinType;
      delete ct.resource;
    }
  }
  return { ok: true };
}