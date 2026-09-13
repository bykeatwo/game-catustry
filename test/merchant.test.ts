import { describe, it, expect } from 'vitest';
import { buySeed, sellItem } from '@/domain/merchant';
import { createInitialState } from '@/domain/state';

function scene() {
  const s = createInitialState();
  s.production.coins = 100;
  return s;
}

describe('buySeed', () => {
  it('sells discovered seeds for coins', () => {
    const s = scene();
    const r = buySeed(s, 'wheat');
    expect(r.ok).toBe(true);
    expect(s.production.seeds.wheat).toBe(1);
    expect(s.production.coins).toBe(95);
  });
  it('rejects undiscovered crops', () => {
    const s = scene();
    expect(buySeed(s, 'carrot').reason).toBe('NOT_DISCOVERED');
  });
  it('rejects when coins insufficient', () => {
    const s = scene();
    s.production.coins = 1;
    expect(buySeed(s, 'wheat').reason).toBe('INSUFFICIENT_COINS');
  });
});

describe('sellItem', () => {
  it('sells produce for coins + XP', () => {
    const s = scene();
    s.production.inventory.wheat = 3;
    const r = sellItem(s, 'wheat', 2);
    expect(r.ok).toBe(true);
    expect(s.production.coins).toBe(100 + 6);
    expect(s.production.inventory.wheat).toBe(1);
    expect(s.production.xp).toBeGreaterThan(0);
  });
  it('rejects when not enough items', () => {
    const s = scene();
    expect(sellItem(s, 'wheat', 5).reason).toBe('NOT_ENOUGH');
  });
});