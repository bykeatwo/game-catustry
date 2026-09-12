import { describe, it, expect } from 'vitest';
import { xpForSell, landCost, buildCost, seedCost } from '@/domain/economy';

describe('xpForSell', () => {
  it('is floor(sell/5), min 1', () => {
    expect(xpForSell(3)).toBe(1);
    expect(xpForSell(40)).toBe(8);
    expect(xpForSell(260)).toBe(52);
  });
});

describe('landCost', () => {
  it('scales with owned plots', () => {
    expect(landCost(0)).toBe(50);
    expect(landCost(1)).toBe(60);
    expect(landCost(5)).toBe(100);
  });
});

describe('buildCost', () => {
  it('returns per-facility cost', () => {
    expect(buildCost('mill')).toBe(100);
    expect(buildCost('bakery')).toBe(250);
    expect(buildCost('gourmet')).toBe(800);
  });
});

describe('seedCost', () => {
  it('returns per-crop seed cost', () => {
    expect(seedCost('wheat')).toBe(5);
    expect(seedCost('egg')).toBe(12);
  });
});