import { describe, it, expect } from 'vitest';
import { generateTile, MERCHANT_POS } from '@/domain/mapgen';

describe('generateTile', () => {
  it('is deterministic', () => {
    expect(generateTile(5, 7)).toEqual(generateTile(5, 7));
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