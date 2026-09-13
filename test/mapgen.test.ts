import { describe, it, expect } from 'vitest';
import { generateTile, MERCHANT_POS } from '@/domain/mapgen';
import { FACILITY_SIZE } from '@/domain/types';

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
  it('never places a ruin whose footprint overlaps the merchant', () => {
    for (let gy = 0; gy < 20; gy++) {
      for (let gx = 0; gx < 20; gx++) {
        const t = generateTile(gx, gy);
        if (t.kind !== 'ruin') continue;
        const overlaps = gx <= MERCHANT_POS.x && MERCHANT_POS.x < gx + FACILITY_SIZE
          && gy <= MERCHANT_POS.y && MERCHANT_POS.y < gy + FACILITY_SIZE;
        expect(overlaps).toBe(false);
      }
    }
  });
  it('never places a ruin whose footprint exceeds the map bounds', () => {
    const W = 12, H = 12;
    for (let gy = 0; gy < H; gy++) {
      for (let gx = 0; gx < W; gx++) {
        const t = generateTile(gx, gy, W, H);
        if (t.kind !== 'ruin') continue;
        expect(gx + FACILITY_SIZE <= W).toBe(true);
        expect(gy + FACILITY_SIZE <= H).toBe(true);
      }
    }
  });
});