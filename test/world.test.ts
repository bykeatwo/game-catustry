import { describe, it, expect } from 'vitest';
import { tileAt, countOwned, isAdjacentToOwned, movePlayer, growWorld, buyLand } from '@/domain/world';
import { createInitialState } from '@/domain/state';

describe('tileAt / countOwned', () => {
  it('indexes tiles by (gx,gy)', () => {
    const s = createInitialState();
    expect(tileAt(s.world, 1, 1)).toMatchObject({ gx: 1, gy: 1 });
    expect(tileAt(s.world, -1, 0)).toBeUndefined();
  });
  it('counts owned tiles (starting 3x3)', () => {
    const s = createInitialState();
    expect(countOwned(s.world)).toBe(9);
  });
});

describe('isAdjacentToOwned', () => {
  it('true for a neighbor of owned 3x3', () => {
    const s = createInitialState();
    expect(isAdjacentToOwned(s.world, 3, 1)).toBe(true);
    expect(isAdjacentToOwned(s.world, 5, 5)).toBe(false);
  });
});

describe('movePlayer', () => {
  it('updates position within bounds', () => {
    const s = createInitialState();
    movePlayer(s.world, 3, 4);
    expect(s.world.player).toEqual({ gx: 3, gy: 4 });
  });
  it('clamps to bounds', () => {
    const s = createInitialState();
    movePlayer(s.world, 999, 999);
    expect(s.world.player.gx).toBe(s.world.width - 1);
    expect(s.world.player.gy).toBe(s.world.height - 1);
  });
});

describe('growWorld', () => {
  it('adds an unowned ring and shifts player', () => {
    const s = createInitialState();
    const before = s.world.width;
    growWorld(s.world, 1);
    expect(s.world.width).toBe(before + 2);
    expect(tileAt(s.world, 0, 0)!.owned).toBe(false);
  });
});

describe('buyLand', () => {
  it('buys an adjacent plot, deducting coins', () => {
    const s = createInitialState(); // ownedCount = 9 → cost 50 + 9*10 = 140
    s.production.coins = 1000;
    const r = buyLand(s, 3, 1);
    expect(r.ok).toBe(true);
    expect(s.production.coins).toBe(1000 - 140);
    expect(tileAt(s.world, 3, 1)!.owned).toBe(true);
  });
  it('rejects non-adjacent tiles', () => {
    const s = createInitialState();
    s.production.coins = 1000;
    expect(buyLand(s, 6, 6)).toEqual({ ok: false, reason: 'NOT_ADJACENT' });
  });
  it('rejects when coins insufficient', () => {
    const s = createInitialState(); s.production.coins = 1;
    expect(buyLand(s, 3, 1).reason).toBe('INSUFFICIENT_COINS');
  });
});