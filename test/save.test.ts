import { describe, it, expect } from 'vitest';
import { createInitialState } from '@/domain/state';
import { serialize, deserialize, SCHEMA_VERSION } from '@/domain/save';

describe('createInitialState', () => {
  it('starts at Lv1 with 25 coins and full energy', () => {
    const s = createInitialState();
    expect(s.production.level).toBe(1);
    expect(s.production.coins).toBe(25);
    expect(s.production.energy).toBe(100);
    expect(s.production.discoveredCrops).toContain('wheat');
  });
  it('has a single wheat farm plot', () => {
    const s = createInitialState();
    expect(s.production.plots).toHaveLength(1);
    expect(s.production.plots[0].crop).toBe('wheat');
  });
});

describe('serialize/deserialize round-trip', () => {
  it('preserves state', () => {
    const s = createInitialState();
    s.production.coins = 1234;
    s.world.player.gx = 7;
    const restored = deserialize(serialize(s))!;
    expect(restored.version).toBe(SCHEMA_VERSION);
    expect(restored.production.coins).toBe(1234);
    expect(restored.world.player.gx).toBe(7);
  });
  it('returns null for garbage', () => {
    expect(deserialize('not json')).toBeNull();
    expect(deserialize('{"version":999}')).toBeNull();
  });
});