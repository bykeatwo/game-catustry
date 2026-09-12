import { describe, it, expect } from 'vitest';
import { regenEnergy, ENERGY_REGEN_PER_SEC } from '@/domain/energy';
import { ProductionState } from '@/domain/types';

function state(): ProductionState {
  return { coins: 0, level: 1, xp: 0, energy: 50, inventory: {}, plots: [], facilities: [], discoveredCrops: [] };
}

describe('regenEnergy', () => {
  it('regenerates 2/sec', () => {
    const s = state();
    regenEnergy(s, 1000);
    expect(s.energy).toBeCloseTo(52);
  });
  it('does not exceed maxEnergy', () => {
    const s = state(); s.energy = 95;
    regenEnergy(s, 60_000);
    expect(s.energy).toBe(100);
  });
  it('exposes the regen rate', () => {
    expect(ENERGY_REGEN_PER_SEC).toBe(2);
  });
});