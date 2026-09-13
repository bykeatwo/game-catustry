import { GameState, Tile, WorldMap } from './types';
import { landCost } from './economy';
import { generateTile } from './mapgen';

export function tileAt(w: WorldMap, gx: number, gy: number): Tile | undefined {
  if (gx < 0 || gy < 0 || gx >= w.width || gy >= w.height) return undefined;
  return w.tiles[gy * w.width + gx];
}

export function countOwned(w: WorldMap): number {
  return w.tiles.filter(t => t.owned).length;
}

export function isAdjacentToOwned(w: WorldMap, gx: number, gy: number): boolean {
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (dx === 0 && dy === 0) continue;
    const t = tileAt(w, gx + dx, gy + dy);
    if (t?.owned) return true;
  }
  return false;
}

export function movePlayer(w: WorldMap, gx: number, gy: number): void {
  w.player.gx = Math.max(0, Math.min(w.width - 1, gx));
  w.player.gy = Math.max(0, Math.min(w.height - 1, gy));
}

export function growWorld(w: WorldMap, ring = 1): void {
  const newW = w.width + ring * 2;
  const newH = w.height + ring * 2;
  const next: Tile[] = [];
  for (let gy = 0; gy < newH; gy++) {
    for (let gx = 0; gx < newW; gx++) {
      const ogx = gx - ring, ogy = gy - ring;
      let t: Tile;
      if (ogx >= 0 && ogy >= 0 && ogx < w.width && ogy < w.height) {
        t = { ...(tileAt(w, ogx, ogy)!), gx, gy };
      } else {
        t = generateTile(gx, gy);
      }
      next.push(t);
    }
  }
  w.width = newW; w.height = newH; w.tiles = next;
  w.player.gx += ring; w.player.gy += ring;
}

export type BuyResult = {
  ok: boolean;
  reason?: 'OUT_OF_BOUNDS' | 'ALREADY_OWNED' | 'NOT_ADJACENT' | 'INSUFFICIENT_COINS';
  cost?: number;
};

export function buyLand(s: GameState, gx: number, gy: number): BuyResult {
  const w = s.world;
  let t = tileAt(w, gx, gy);
  if (!t) return { ok: false, reason: 'OUT_OF_BOUNDS' };
  if (t.owned) return { ok: false, reason: 'ALREADY_OWNED' };
  if (!isAdjacentToOwned(w, gx, gy)) return { ok: false, reason: 'NOT_ADJACENT' };

  const cost = landCost(countOwned(w));
  if (s.production.coins < cost) return { ok: false, reason: 'INSUFFICIENT_COINS' };

  // grow before marking if buying on the border, shifting our target by the ring
  if (gx === 0 || gy === 0 || gx === w.width - 1 || gy === w.height - 1) {
    growWorld(w, 1);
    gx += 1; gy += 1;
    t = tileAt(w, gx, gy)!;
  }

  s.production.coins -= cost;
  t.owned = true;
  t.kind = 'grass';
  return { ok: true, cost };
}