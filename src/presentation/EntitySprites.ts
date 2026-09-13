import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { isoToScreen } from './iso';
import { GameStore } from '../state/store';
import { ITEMS } from '../domain/items';

const EMBLEM: Record<string, string> = {
  mill: '🏭', bakery: '🥖', gourmet: '👨‍🍳', plot: '🌱', ruin: '🧱', wild: '🌾', merchant: '🏪'
};

export function drawProductionObjects(scene: Phaser.Scene, store: GameStore, group: Phaser.GameObjects.Group): void {
  group.clear(true, true);
  const { world, production } = store.getState();

  for (const t of world.tiles) {
    if (t.kind === 'wild' || t.kind === 'ruin' || t.kind === 'merchant') {
      const { x, y } = isoToScreen(t.gx, t.gy, GAME_CONFIG.tileWidth, GAME_CONFIG.tileHeight);
      const label = scene.add.text(x, y, EMBLEM[t.kind], { fontSize: '22px' }).setOrigin(0.5).setDepth(y);
      group.add(label);
    }
  }
  for (const p of production.plots) {
    const { x, y } = isoToScreen(p.gx, p.gy, GAME_CONFIG.tileWidth, GAME_CONFIG.tileHeight);
    const label = scene.add.text(x, y, EMBLEM.plot, { fontSize: '22px' }).setOrigin(0.5).setDepth(y);
    group.add(label);
    if (p.crop) {
      const taps = ITEMS[p.crop].taps;
      const txt = scene.add.text(x, y + 16, `${p.progress}/${taps}`, { fontSize: '11px', color: '#fff', backgroundColor: '#000000aa' })
        .setOrigin(0.5).setDepth(y + 1);
      group.add(txt);
    }
  }
  for (const f of production.facilities) {
    const { x, y } = isoToScreen(f.gx, f.gy, GAME_CONFIG.tileWidth, GAME_CONFIG.tileHeight);
    const label = scene.add.text(x, y, EMBLEM[f.type], { fontSize: '22px' }).setOrigin(0.5).setDepth(y);
    group.add(label);
    if (f.recipe) {
      const taps = ITEMS[f.recipe].taps;
      const txt = scene.add.text(x, y + 16, `${f.progress}/${taps}`, { fontSize: '11px', color: '#fff', backgroundColor: '#000000aa' })
        .setOrigin(0.5).setDepth(y + 1);
      group.add(txt);
    }
  }
}