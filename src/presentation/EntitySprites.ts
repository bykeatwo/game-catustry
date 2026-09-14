import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { isoToScreen } from './iso';
import { GameStore } from '../state/store';
import { ITEMS } from '../domain/items';
import { FACILITY_SIZE } from '../domain/types';

export function drawProductionObjects(scene: Phaser.Scene, store: GameStore, group: Phaser.GameObjects.Group): void {
  group.clear(true, true);
  const { world, production } = store.getState();
  const { tileWidth: tw, tileHeight: th } = GAME_CONFIG;

  // wild crops, ruins, merchant post
  for (const t of world.tiles) {
    if (t.kind === 'wild' && t.resource) {
      const { x, y } = isoToScreen(t.gx, t.gy, tw, th);
      group.add(scene.add.image(x, y, `crop-${t.resource}-2`).setOrigin(0.5, 1).setDepth(y + 1));
    } else if (t.kind === 'ruin') {
      const { x, y } = isoToScreen(t.gx, t.gy, tw, th);
      group.add(scene.add.image(x, y, 'entity-ruin').setOrigin(0.5, 1).setDepth(y + 1));
    } else if (t.kind === 'merchant') {
      const { x, y } = isoToScreen(t.gx, t.gy, tw, th);
      group.add(scene.add.image(x, y, 'entity-merchant').setOrigin(0.5, 1).setDepth(y + 1));
    }
  }

  // farm plots (crops with growth stages, or empty tilled ground)
  for (const p of production.plots) {
    const { x, y } = isoToScreen(p.gx, p.gy, tw, th);
    if (p.crop) {
      const taps = ITEMS[p.crop].taps;
      const stage = Math.min(2, Math.floor((p.progress / taps) * 3));
      group.add(scene.add.image(x, y, `crop-${p.crop}-${stage}`).setOrigin(0.5, 1).setDepth(y + 1));
      group.add(scene.add.text(x, y - 20, `${p.progress}/${taps}`, { fontSize: '11px', color: '#fff', backgroundColor: '#000000aa' })
        .setOrigin(0.5).setDepth(y + 2));
    } else {
      group.add(scene.add.image(x, y, 'plot-empty').setOrigin(0.5, 1).setDepth(y + 1));
    }
  }

  // facilities (2x2 footprint → centered sprite, with a "working" variant)
  for (const f of production.facilities) {
    const cx = f.gx + (FACILITY_SIZE - 1) / 2;
    const cy = f.gy + (FACILITY_SIZE - 1) / 2;
    const { x, y } = isoToScreen(cx, cy, tw, th);
    const working = !!f.recipe && f.progress > 0;
    const key = working ? `fac-${f.type}-work` : `fac-${f.type}`;
    group.add(scene.add.image(x, y, key).setOrigin(0.5, 1).setDepth(y + 1));
    if (f.recipe) {
      const taps = ITEMS[f.recipe].taps;
      group.add(scene.add.text(x, y - 44, `${f.progress}/${taps}`, { fontSize: '11px', color: '#fff', backgroundColor: '#000000aa' })
        .setOrigin(0.5).setDepth(y + 2));
    }
  }
}