import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { isoToScreen } from './iso';

export class GameScene extends Phaser.Scene {
  private cat!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

  constructor() { super('GameScene'); }

  create(): void {
    this.drawIsoGround();
    this.cat = this.createCat();
    const kb = this.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.wasd = kb.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  }

  private drawIsoGround(): void {
    const { tileWidth: tw, tileHeight: th } = GAME_CONFIG;
    const g = this.add.graphics();
    for (let gx = 0; gx < 12; gx++) {
      for (let gy = 0; gy < 12; gy++) {
        const { x, y } = isoToScreen(gx, gy, tw, th);
        g.fillStyle((gx + gy) % 2 === 0 ? 0x6a9a54 : 0x5c8a48, 1);
        g.beginPath();
        g.moveTo(x, y - th / 2);
        g.lineTo(x + tw / 2, y);
        g.lineTo(x, y + th / 2);
        g.lineTo(x - tw / 2, y);
        g.closePath();
        g.fillPath();
      }
    }
  }

  private createCat(): Phaser.GameObjects.Sprite {
    if (!this.textures.exists('cat')) {
      const tmp = this.add.graphics();
      tmp.fillStyle(0xffaa33, 1);
      tmp.fillCircle(16, 16, 12);
      tmp.generateTexture('cat', 32, 32);
      tmp.destroy();
    }
    const start = isoToScreen(1, 1, GAME_CONFIG.tileWidth, GAME_CONFIG.tileHeight);
    const cat = this.add.sprite(start.x, start.y, 'cat');
    cat.setDepth(10);
    return cat;
  }

  update(_time: number, delta: number): void {
    let dx = 0, dy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) dx -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) dx += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) dy -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) dy += 1;
    const len = Math.hypot(dx, dy);
    if (len > 0) {
      const step = (GAME_CONFIG.playerSpeed * delta) / 1000 / len;
      this.cat.x += dx * step;
      this.cat.y += dy * step;
    }
    this.cat.setDepth(this.cat.y);
  }
}