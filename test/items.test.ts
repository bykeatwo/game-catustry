import { describe, it, expect } from 'vitest';
import { ITEMS, RECIPES, TIER_XP, TIER_ENERGY, XP_THRESHOLDS, FACILITY_UNLOCK, SEED_COSTS } from '@/domain/items';

describe('ITEMS', () => {
  it('has all 14 items in the food chain', () => {
    expect(Object.keys(ITEMS)).toHaveLength(14);
  });
  it('marks wheat as raw with sell 3', () => {
    expect(ITEMS.wheat.tier).toBe('raw');
    expect(ITEMS.wheat.sell).toBe(3);
  });
});

describe('RECIPES', () => {
  it('flour needs 2 wheat from the mill at Lv3', () => {
    expect(RECIPES.flour).toEqual({
      output: 'flour', facility: 'mill', level: 3, inputs: { wheat: 2 }
    });
  });
  it('royal needs 2 crisps and 1 pie from gourmet', () => {
    expect(RECIPES.royal.inputs).toEqual({ crisps: 2, pie: 1 });
    expect(RECIPES.royal.facility).toBe('gourmet');
  });
});

describe('constants', () => {
  it('tier XP follows the spec', () => {
    expect(TIER_XP).toEqual({ raw: 3, processed: 8, crafted: 20, gourmet: 60 });
  });
  it('tier energy follows the spec', () => {
    expect(TIER_ENERGY).toEqual({ raw: 2, processed: 3, crafted: 4, gourmet: 5 });
  });
  it('XP deltas are the differences of the cumulative table', () => {
    expect(XP_THRESHOLDS).toEqual([50, 100, 200, 350, 500, 800, 1200, 1800, 3000]);
  });
  it('facility unlocks: mill 3, bakery 5, gourmet 9', () => {
    expect(FACILITY_UNLOCK).toEqual({ mill: 3, bakery: 5, gourmet: 9 });
  });
  it('seed costs cover the four raw crops', () => {
    expect(SEED_COSTS.wheat).toBe(5);
    expect(SEED_COSTS.carrot).toBe(10);
    expect(SEED_COSTS.potato).toBe(15);
    expect(SEED_COSTS.egg).toBe(12);
  });
});