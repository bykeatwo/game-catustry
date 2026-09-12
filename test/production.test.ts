import { describe, it, expect } from 'vitest';
import { tapsFor, energyPerTap, hasInputs } from '@/domain/production';
import { ITEMS, RECIPES } from '@/domain/items';
import { ProductionState } from '@/domain/types';

function state(): ProductionState {
  return { coins: 0, level: 9, xp: 0, energy: 100, inventory: {}, seeds: {}, plots: [], facilities: [], discoveredCrops: [] };
}

describe('tapsFor', () => {
  it('returns the item tap count', () => {
    expect(tapsFor(ITEMS.wheat)).toBe(5);
    expect(tapsFor(ITEMS.royal)).toBe(45);
  });
});

describe('energyPerTap', () => {
  it('matches tier energy', () => {
    expect(energyPerTap('raw')).toBe(2);
    expect(energyPerTap('gourmet')).toBe(5);
  });
});

describe('hasInputs', () => {
  it('true when all inputs present', () => {
    const s = state(); s.inventory = { wheat: 2 };
    expect(hasInputs(s, RECIPES.flour)).toBe(true);
  });
  it('false when missing an input', () => {
    const s = state(); s.inventory = { wheat: 1 };
    expect(hasInputs(s, RECIPES.flour)).toBe(false);
  });
});