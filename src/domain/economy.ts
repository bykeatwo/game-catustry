import { FacilityType, CropId } from './types';
import { BUILD_COSTS, SEED_COSTS } from './items';

export function xpForSell(sellValue: number): number {
  return Math.max(1, Math.floor(sellValue / 5));
}

export function landCost(ownedCount: number): number {
  return 50 + ownedCount * 10;
}

export function buildCost(type: 'farm' | FacilityType): number {
  return BUILD_COSTS[type];
}

export function seedCost(crop: CropId): number {
  return SEED_COSTS[crop];
}