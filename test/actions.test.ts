import { describe, it, expect } from 'vitest';
import { workPlot, workFacility, plantCrop, gatherWild, buildFacility, itemCount } from '@/domain/actions';
import { createInitialState } from '@/domain/state';
import { GameState } from '@/domain/types';

function scene(): GameState {
  const s = createInitialState();
  s.production.energy = 1000;
  s.production.coins = 1000;
  return s;
}

describe('workPlot', () => {
  it('progresses and harvests after enough taps', () => {
    const s = scene();
    let produced: string | undefined;
    for (let i = 0; i < 5; i++) produced = workPlot(s, 0).produced; // wheat taps 5
    expect(produced).toBe('wheat');
    expect(itemCount(s.production.inventory, 'wheat')).toBe(1);
  });
  it('consumes energy per tap', () => {
    const s = scene(); s.production.energy = 3;
    workPlot(s, 0);
    expect(s.production.energy).toBe(1); // raw energy/tap = 2
  });
  it('rejects empty plots', () => {
    const s = scene(); s.production.plots[0].crop = null;
    expect(workPlot(s, 0).reason).toBe('EMPTY_PLOT');
  });
});

describe('workFacility', () => {
  it('crafts after enough taps, consuming inputs', () => {
    const s = scene();
    s.production.level = 3;
    s.production.inventory.wheat = 2;
    s.production.facilities.push({ id: 'fac-0', gx: 3, gy: 3, type: 'mill', recipe: 'flour', progress: 0 });
    let produced: string | undefined;
    for (let i = 0; i < 12; i++) produced = workFacility(s, 0).produced; // flour taps 12
    expect(produced).toBe('flour');
    expect(itemCount(s.production.inventory, 'flour')).toBe(1);
    expect(s.production.inventory.wheat).toBeFalsy(); // 2 wheat consumed
  });
  it('rejects when missing inputs', () => {
    const s = scene();
    s.production.level = 3;
    s.production.facilities.push({ id: 'fac-0', gx: 3, gy: 3, type: 'mill', recipe: 'flour', progress: 0 });
    expect(workFacility(s, 0).reason).toBe('MISSING_INPUTS');
  });
});

describe('plantCrop', () => {
  it('consumes a seed to set the crop', () => {
    const s = scene(); s.production.seeds.carrot = 1;
    const r = plantCrop(s, 0, 'carrot');
    expect(r.ok).toBe(true);
    expect(s.production.plots[0].crop).toBe('carrot');
    expect(s.production.seeds.carrot).toBeFalsy();
  });
  it('rejects without a seed', () => {
    const s = scene();
    expect(plantCrop(s, 0, 'carrot').reason).toBe('NO_SEED');
  });
});

describe('gatherWild', () => {
  it('yields the crop and discovers it', () => {
    const s = scene();
    const t = s.world.tiles.find(t => t.gx === 2 && t.gy === 2)!;
    t.kind = 'wild'; t.resource = 'carrot';
    const r = gatherWild(s, 2, 2);
    expect(r.produced).toBe('carrot');
    expect(s.production.discoveredCrops).toContain('carrot');
    expect(t.kind).toBe('grass'); // depleted
  });
});

describe('buildFacility', () => {
  it('builds a mill at a ruin and deducts coins', () => {
    const s = scene();
    const t = s.world.tiles.find(t => t.gx === 3 && t.gy === 3)!;
    t.kind = 'ruin'; t.ruinType = 'mill';
    s.production.level = 3;
    const r = buildFacility(s, 3, 3);
    expect(r.ok).toBe(true);
    expect(s.production.facilities).toHaveLength(1);
    expect(s.production.facilities[0].type).toBe('mill');
    expect(s.production.coins).toBe(1000 - 100);
  });
  it('rejects when level locked', () => {
    const s = scene();
    const t = s.world.tiles.find(t => t.gx === 3 && t.gy === 3)!;
    t.kind = 'ruin'; t.ruinType = 'bakery';
    expect(buildFacility(s, 3, 3).reason).toBe('LEVEL_LOCKED');
  });
});