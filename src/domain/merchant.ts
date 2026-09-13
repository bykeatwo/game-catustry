import { GameState, CropId, ItemId } from './types';
import { ITEMS } from './items';
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