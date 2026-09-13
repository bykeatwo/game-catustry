import { GameState, Tile } from './types';
import { generateTile } from './mapgen';

export const START_MAP = 12; // 12x12 starting world (expands via land buying)

export function createInitialState(): GameState {
  const tiles: Tile[] = [];
  for (let gy = 0; gy < START_MAP; gy++) {
    for (let gx = 0; gx < START_MAP; gx++) {
      // a 3x3 starting area around spawn is owned grass; the rest is procedurally generated
      tiles.push(gx < 3 && gy < 3 ? { gx, gy, kind: 'grass', owned: true } : generateTile(gx, gy));
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
      seeds: {},
      plots: [{ id: 'plot-0', gx: 1, gy: 0, crop: 'wheat', progress: 0 }],
      facilities: [],
      discoveredCrops: ['wheat']
    }
  };
}