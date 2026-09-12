import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { isoToScreen } from './iso';
import { makeIsoTileTexture, makeCatTexture } from './textures';
import { GameStore } from '../state/store';
import { createInitialState } from '../domain/state';

const TILE_COLORS: Record<string, number> = {
  grass: 0x6a9a54, unowned: 0x3a3a3a, wild: 0x7ab84a,
  ruin: 0x8a6a3a, merchant: 0xc9a227, water: 0x4a7aa0
};

export class GameScene extends Phaser.Scene {
  private store!: GameStore;
  private cat!: Phaser.GameObjects.Sprite;
  private tileSprites = new Map<string, Phaser.GameObjects.Image>();
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

  constructor() { super('GameScene'); }

  init(): void { this.store = new GameStore(createInitialState()); }

  create(): void {
    makeIsoTileTexture(this);
    makeCatTexture(this);
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

    this.store.subscribe(() => this.renderWorld());
    this.renderWorld();
    this.createCat();
    this.cameras.main.setBounds(-2000, -2000, 4000, 4000);
  }

  private tileKey(gx: number, gy: number): string { return `${gx},${gy}`; }

  private renderWorld(): void {
    const { world } = this.store.getState();
    const seen = new Set<string>();
    for (const tile of world.tiles) {
      const key = this.tileKey(tile.gx, tile.gy);
      seen.add(key);
      const { x, y } = isoToScreen(tile.gx, tile.gy, GAME_CONFIG.tileWidth, GAME_CONFIG.tileHeight);
      let img = this.tileSprites.get(key);
      if (!img) {
        img = this.add.image(0, 0, 'isoTile');
        img.setDepth(y); // sort by iso depth
        this.tileSprites.set(key, img);
      }
      img.setPosition(x, y);
      img.setTint(TILE_COLORS[tile.kind] ?? 0x999999);
      img.setData('owned', tile.owned);
    }
    for (const [key, img] of this.tileSprites) {
      if (!seen.has(key)) { img.destroy(); this.tileSprites.delete(key); }
    }
  }

  private createCat(): void {
    const p = this.store.getState().world.player;
    const { x, y } = isoToScreen(p.gx, p.gy, GAME_CONFIG.tileWidth, GAME_CONFIG.tileHeight);
    this.cat = this.add.sprite(x, y, 'cat');
  }

  update(_time: number, delta: number): void {
    let dx = 0, dy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) dx--;
    if (this.cursors.right.isDown || this.wasd.D.isDown) dx++;
    if (this.cursors.up.isDown || this.wasd.W.isDown) dy--;
    if (this.cursors.down.isDown || this.wasd.S.isDown) dy++;

    const len = Math.hypot(dx, dy);
    if (len > 0) {
      const step = (GAME_CONFIG.playerSpeed * delta) / 1000 / len;
      this.cat.x += dx * step;
      this.cat.y += dy * step;
    }
    this.cat.setDepth(this.cat.y);
    this.cameras.main.centerOn(this.cat.x, this.cat.y);
  }
}