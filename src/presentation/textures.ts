import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

export function makeIsoTileTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists('isoTile')) return;
  const { tileWidth: tw, tileHeight: th } = GAME_CONFIG;
  const g = scene.add.graphics();
  g.fillStyle(0xffffff, 1);
  g.beginPath();
  g.moveTo(tw / 2, 0);
  g.lineTo(tw, th / 2);
  g.lineTo(tw / 2, th);
  g.lineTo(0, th / 2);
  g.closePath();
  g.fillPath();
  g.generateTexture('isoTile', tw, th);
  g.destroy();
}

export function makeCatTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists('cat')) return;
  const g = scene.add.graphics();
  g.fillStyle(0xffaa33, 1);
  g.fillCircle(16, 16, 12);
  g.generateTexture('cat', 32, 32);
  g.destroy();
}