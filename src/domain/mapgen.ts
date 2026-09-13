import { Tile, CropId, FacilityType, FACILITY_SIZE } from './types';

export const MERCHANT_POS = { x: 4, y: 4 };

function hash2(x: number, y: number): number {
  let h = (x * 0x9E3779B1) ^ (y * 0x85EBCA6B);
  h ^= h >>> 13;
  return h >>> 0;
}

const CROPS: CropId[] = ['wheat', 'carrot', 'potato', 'egg'];
const RUINS: FacilityType[] = ['mill', 'bakery', 'gourmet'];

// A 2x2 facility anchored at a ruin must not overlap the merchant post.
function overlapsMerchant(gx: number, gy: number): boolean {
  const mx = MERCHANT_POS.x, my = MERCHANT_POS.y;
  return gx <= mx && mx < gx + FACILITY_SIZE && gy <= my && my < gy + FACILITY_SIZE;
}

export function generateTile(gx: number, gy: number): Tile {
  if (gx === MERCHANT_POS.x && gy === MERCHANT_POS.y) {
    return { gx, gy, kind: 'merchant', owned: false };
  }
  const h = hash2(gx, gy);
  const r = h % 100;
  if (r < 20) return { gx, gy, kind: 'wild', owned: false, resource: CROPS[h % CROPS.length] };
  if (r < 26) {
    // Ruins that would block the merchant (or be unbuildable next to it) become grass.
    if (overlapsMerchant(gx, gy)) return { gx, gy, kind: 'grass', owned: false };
    return { gx, gy, kind: 'ruin', owned: false, ruinType: RUINS[h % RUINS.length] };
  }
  return { gx, gy, kind: 'grass', owned: false };
}