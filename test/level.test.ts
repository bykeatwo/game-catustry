import { describe, it, expect } from 'vitest';
import { xpToNext, maxEnergy, gainXp } from '@/domain/level';
import { ProductionState } from '@/domain/types';

function state(): ProductionState {
  return { coins: 0, level: 1, xp: 0, energy: 100, inventory: {}, plots: [], facilities: [], discoveredCrops: [] };
}

describe('xpToNext', () => {
  it('Lv1 -> 50', () => expect(xpToNext(1)).toBe(50));
  it('Lv9 -> 3000', () => expect(xpToNext(9)).toBe(3000));
  it('Lv10 -> Infinity', () => expect(xpToNext(10)).toBe(Infinity));
});

describe('maxEnergy', () => {
  it('Lv1 = 100', () => expect(maxEnergy(1)).toBe(100));
  it('Lv3 = 120', () => expect(maxEnergy(3)).toBe(120));
  it('Lv10 = 190', () => expect(maxEnergy(10)).toBe(190));
});

describe('gainXp', () => {
  it('levels up once and keeps remainder', () => {
    const s = state();
    gainXp(s, 70);
    expect(s.level).toBe(2);
    expect(s.xp).toBe(20);
  });
  it('can level up multiple times in one call', () => {
    const s = state();
    gainXp(s, 150);
    expect(s.level).toBe(3);
    expect(s.xp).toBe(0);
  });
  it('never goes past MAX_LEVEL and zeroes xp', () => {
    const s = state(); s.level = 9; s.xp = 0;
    gainXp(s, 1_000_000);
    expect(s.level).toBe(10);
    expect(s.xp).toBe(0);
  });
});