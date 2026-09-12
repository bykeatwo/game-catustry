import { ProductionState } from './types';
import { maxEnergy } from './level';

export const ENERGY_REGEN_PER_SEC = 2;

export function regenEnergy(s: ProductionState, deltaMs: number): void {
  s.energy = Math.min(maxEnergy(s.level), s.energy + (ENERGY_REGEN_PER_SEC * deltaMs) / 1000);
}