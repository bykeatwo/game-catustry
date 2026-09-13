import { Tile, CropId, FacilityType } from './types';

export const MERCHANT_POS = { x: 4, y: 4 };

function hash2(x: number, y: number): number {
  let h = (x * 0x9E3779B1) ^ (y * 0x85EBCA6B);
  h ^= h >>> 13;
  return h >>> 0;
}

const CROPS: CropId[] = ['wheat', 'carrot', 'potato', 'egg'];
const RUINS: FacilityType[] = ['mill', 'bakery', 'gourmet'];

export function generateTile(gx: number, gy: number): Tile {
  if (gx === MERCHANT_POS.x && gy === MERCHANT_POS.y) {
    return { gx, gy, kind: 'merchant', owned: false };
  }
  const h = hash2(gx, gy);
  const r = h % 100;
  if (r < 20) return { gx, gy, kind: 'wild', owned: false, resource: CROPS[h % CROPS.length] };
  if (r < 26) return { gx, gy, kind: 'ruin', owned: false, ruinType: RUINS[h % RUINS.length] };
  return { gx, gy, kind: 'grass', owned: false };
}