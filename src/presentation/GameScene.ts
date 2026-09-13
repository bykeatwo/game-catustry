import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { isoToScreen, screenToIso } from './iso';
import { makeIsoTileTexture, makeCatTexture } from './textures';
import { JoystickInput } from './JoystickInput';
import { InteractPrompt } from './InteractPrompt';
import { drawProductionObjects } from './EntitySprites';
import { regenEnergy, maxEnergy } from '../domain/energy';
import { GameStore } from '../state/store';
import { createInitialState } from '../domain/state';
import { tileAt, isAdjacentToOwned, countOwned } from '../domain/world';
import { landCost } from '../domain/economy';
import { loadState, saveState } from '../data/store';
import { MerchantUI } from './MerchantUI';

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
  private joystick!: JoystickInput;
  private prompt!: InteractPrompt;
  private prodGroup!: Phaser.GameObjects.Group;
  private hud!: Phaser.GameObjects.Text;
  private shop!: MerchantUI;

  constructor() { super('GameScene'); }

  init(): void { this.store = new GameStore(loadState() ?? createInitialState()); }

  create(): void {
    makeIsoTileTexture(this);
    makeCatTexture(this);
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
    this.joystick = new JoystickInput(this);
    this.prompt = new InteractPrompt(this);
    this.shop = new MerchantUI(this.store);
    this.prodGroup = this.add.group();
    this.hud = this.add.text(16, 16, '', { fontSize: '16px', color: '#fff', backgroundColor: '#00000088' })
      .setScrollFactor(0).setDepth(1000);

    this.store.subscribe(() => this.renderWorld());
    this.renderWorld();
    this.createCat();
    this.cameras.main.setBounds(-2000, -2000, 4000, 4000);

    // autosave: debounced on change + periodic fallback
    let saveTimer: number | undefined;
    this.store.subscribe(() => {
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => saveState(this.store.getState()), 500);
    });
    this.time.addEvent({ delay: 5000, loop: true, callback: () => saveState(this.store.getState()) });
  }

  private tileKey(gx: number, gy: number): string { return `${gx},${gy}`; }

  private renderWorld(): void {
    const state = this.store.getState();
    const seen = new Set<string>();

    // tiles
    for (const tile of state.world.tiles) {
      const key = this.tileKey(tile.gx, tile.gy);
      seen.add(key);
      const { x, y } = isoToScreen(tile.gx, tile.gy, GAME_CONFIG.tileWidth, GAME_CONFIG.tileHeight);
      let img = this.tileSprites.get(key);
      if (!img) {
        img = this.add.image(0, 0, 'isoTile');
        img.setDepth(y);
        this.tileSprites.set(key, img);
      }
      img.setPosition(x, y);
      img.setTint(tile.owned ? TILE_COLORS[tile.kind] ?? 0x6a9a54 : 0x3a3a3a);
    }
    for (const [key, img] of this.tileSprites) if (!seen.has(key)) { img.destroy(); this.tileSprites.delete(key); }

    // production objects (plots, facilities, wild/ruin)
    drawProductionObjects(this, this.store, this.prodGroup);
  }

  private createCat(): void {
    const p = this.store.getState().world.player;
    const { x, y } = isoToScreen(p.gx, p.gy, GAME_CONFIG.tileWidth, GAME_CONFIG.tileHeight);
    this.cat = this.add.sprite(x, y, 'cat');
  }

  private refreshHUD(): void {
    const s = this.store.getState().production;
    this.hud.setText(`🪙 ${s.coins}   ⚡ ${Math.floor(s.energy)}/${maxEnergy(s.level)}   Lv ${s.level}`);
  }

  update(_time: number, delta: number): void {
    let dx = 0, dy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) dx--;
    if (this.cursors.right.isDown || this.wasd.D.isDown) dx++;
    if (this.cursors.up.isDown || this.wasd.W.isDown) dy--;
    if (this.cursors.down.isDown || this.wasd.S.isDown) dy++;

    const jv = this.joystick.getVector();
    dx += jv.dx; dy += jv.dy;

    const len = Math.hypot(dx, dy);
    if (len > 0) {
      const step = (GAME_CONFIG.playerSpeed * delta) / 1000 / len;
      this.cat.x += dx * step;
      this.cat.y += dy * step;
    }
    this.cat.setDepth(this.cat.y);
    this.cameras.main.centerOn(this.cat.x, this.cat.y);

    // energy regen
    const state = this.store.getState();
    regenEnergy(state.production, delta);
    this.refreshHUD();

    // interaction detection
    const { gx: cx, gy: cy } = screenToIso(this.cat.x, this.cat.y, GAME_CONFIG.tileWidth, GAME_CONFIG.tileHeight);
    const tx = Math.round(cx), ty = Math.round(cy);
    const target = tileAt(state.world, tx, ty);

    // prioritize facility > plot > merchant > wild/ruin over land-buying
    const fac = state.production.facilities.find(f => f.gx === tx && f.gy === ty);
    const plot = state.production.plots.find(p => p.gx === tx && p.gy === ty);

    if (target?.kind !== 'merchant') this.shop.close();

    if (fac) {
      this.prompt.show(`Work ${fac.type}`, 'Tap to work', () => { this.store.workFacility(state.production.facilities.indexOf(fac)); });
    } else if (plot && plot.crop) {
      this.prompt.show(`Work ${plot.crop || 'plot'}`, 'Tap to work', () => { this.store.workPlot(state.production.plots.indexOf(plot)); });
    } else if (target?.kind === 'merchant') {
      this.prompt.show('Open merchant', 'Trade', () => { this.shop.open(); });
    } else if (target?.kind === 'wild' && target.resource) {
      this.prompt.show(`Gather ${target.resource}`, 'Gather', () => { this.store.gatherWild(tx, ty); });
    } else if (target?.kind === 'ruin' && target.ruinType) {
      const cost = landCost(countOwned(state.world));
      this.prompt.show(`Build ${target.ruinType} — ${cost} 🪙`, 'Build', () => { this.store.buildFacility(tx, ty); });
    } else if (target && !target.owned && isAdjacentToOwned(state.world, tx, ty)) {
      const cost = landCost(countOwned(state.world));
      this.prompt.show(`Buy land — ${cost} 🪙`, 'Buy', () => { this.store.buyLand(tx, ty); });
    } else {
      this.prompt.hide();
    }
  }
}