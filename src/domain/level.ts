import { ProductionState } from './types';
import { XP_THRESHOLDS, MAX_LEVEL } from './items';

export function xpToNext(level: number): number {
  if (level >= MAX_LEVEL) return Infinity;
  return XP_THRESHOLDS[level - 1] ?? 0;
}

export function maxEnergy(level: number): number {
  return 100 + (level - 1) * 10;
}

export function gainXp(s: ProductionState, amount: number): void {
  s.xp += amount;
  while (s.level < MAX_LEVEL && s.xp >= xpToNext(s.level)) {
    s.xp -= xpToNext(s.level);
    s.level++;
  }
  if (s.level >= MAX_LEVEL) s.xp = 0;
}