import { Item, Recipe, ProductionState, Tier } from './types';
import { TIER_ENERGY } from './items';

export function tapsFor(item: Item): number {
  return item.taps;
}

export function energyPerTap(tier: Tier): number {
  return TIER_ENERGY[tier];
}

export function hasInputs(s: ProductionState, recipe: Recipe): boolean {
  for (const [id, qty] of Object.entries(recipe.inputs) as [string, number][]) {
    if ((s.inventory[id as keyof typeof s.inventory] ?? 0) < qty) return false;
  }
  return true;
}