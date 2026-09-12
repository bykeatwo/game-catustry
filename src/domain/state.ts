import { GameState } from './types';

export const START_MAP = 12; // 12x12 starting world (expands via land buying)

export function createInitialState(): GameState {
  const tiles = [];
  for (let gy = 0; gy < START_MAP; gy++) {
    for (let gx = 0; gx < START_MAP; gx++) {
      tiles.push({ gx, gy, kind: 'unowned' as const, owned: false });
    }
  }
  return {
    version: 1,
    world: { width: START_MAP, height: START_MAP, tiles, player: { gx: 1, gy: 1 } },
    production: {
      coins: 25,
      level: 1,
      xp: 0,
      energy: 100,
      inventory: {},
      plots: [{ id: 'plot-0', crop: 'wheat', progress: 0 }],
      facilities: [],
      discoveredCrops: ['wheat']
    }
  };
}