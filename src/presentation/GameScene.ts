import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { isoToScreen, screenToIso } from './iso';
import { makeIsoTileTexture, makeCatTexture } from './textures';
import { JoystickInput } from './JoystickInput';
import { InteractPrompt } from './InteractPrompt';
import { drawProductionObjects } from './EntitySprites';
import { regenEnergy, maxEnergy } from '../domain/energy';
import { ITEMS } from '../domain/items';
import { GameStore } from '../state/store';
import { createInitialState } from '../domain/state';
import { tileAt, isAdjacentToOwned, countOwned } from '../domain/world';
import { landCost, buildCost } from '../domain/economy';
import { loadState, saveState } from '../data/store';
import { MerchantUI } from './MerchantUI';
import { PlantUI } from './PlantUI';
import { playSfx, initAudio } from '../audio/audioManager';
import { facilityAt } from '../domain/actions';
import { FACILITY_SIZE } from '../domain/types';
import { errorMessage } from './messages';

const TILE_COLORS: Record<string, number> = {
  grass: 0x6a9a54, unowned: 0x3a3a3a, wild: 0x7ab84a,
  ruin: 0x8a6a3a, merchant: 0xc9a227, water: 0x4a7aa0
};

const ITEM_EMOJI: Record<string, string> = {
  wheat: '🌾', carrot: '🥕', potato: '🥔', egg: '🥚',
  flour: '🥣', carrot_juice: '🧃', mashed: '🥔', omelette: '🍳',
  bread: '🍞', carrot_cake: '🍰', crisps: '🍟', pie: '🥧',
  feast: '🍽️', royal: '👑'
};

const Z_FLOOR = -1000;

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
  private inv!: Phaser.GameObjects.Text;
  private shop!: MerchantUI;
  private plant!: PlantUI;

  constructor() { super('GameScene'); }

  init(): void { this.store = new GameStore(loadState() ?? createInitialState()); }

  create(): void {
    initAudio();
    makeIsoTileTexture(this);
    makeCatTexture(this);
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
    this.joystick = new JoystickInput(this);
    this.prompt = new InteractPrompt(this);
    this.shop = new MerchantUI(this.store);
    this.plant = new PlantUI(this.store);
    this.prodGroup = this.add.group();

    // HUD — top-left
    this.hud = this.add.text(16, 16, '', { fontSize: '16px', color: '#fff', backgroundColor: '#00000088', padding: { x: 8, y: 4 } })
      .setScrollFactor(0).setDepth(1000);

    // Inventory — top-right
    this.inv = this.add.text(GAME_CONFIG.width - 16, 16, '', { fontSize: '13px', color: '#fff', backgroundColor: '#00000088', padding: { x: 8, y: 4 }, align: 'right' })
      .setOrigin(1, 0).setScrollFactor(0).setDepth(1000);

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

    // floor tiles — always behind the cat and entities
    for (const tile of state.world.tiles) {
      const key = this.tileKey(tile.gx, tile.gy);
      seen.add(key);
      const { x, y } = isoToScreen(tile.gx, tile.gy, GAME_CONFIG.tileWidth, GAME_CONFIG.tileHeight);
      let img = this.tileSprites.get(key);
      if (!img) {
        img = this.add.image(0, 0, 'isoTile');
        this.tileSprites.set(key, img);
      }
      img.setPosition(x, y);
      img.setDepth(Z_FLOOR);
      img.setTint(tile.owned ? TILE_COLORS[tile.kind] ?? 0x6a9a54 : 0x3a3a3a);
    }
    for (const [key, img] of this.tileSprites) if (!seen.has(key)) { img.destroy(); this.tileSprites.delete(key); }

    // production objects (plots, facilities, wild/ruin/merchant) — y-based occlusion
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

    // inventory (harvested goods) + seeds
    const inv = Object.entries(s.inventory).filter(([, q]) => (q ?? 0) > 0) as [string, number][];
    const seeds = Object.entries(s.seeds).filter(([, q]) => (q ?? 0) > 0) as [string, number][];
    const invStr = inv.length ? inv.map(([id, q]) => `${ITEM_EMOJI[id] ?? id}${q}`).join(' ') : '—';
    const seedStr = seeds.length ? `🌰 ${seeds.map(([id, q]) => `${ITEM_EMOJI[id] ?? id}${q}`).join(' ')}` : '';
    this.inv.setText(`🎒 ${invStr}${seedStr ? '\n' + seedStr : ''}`);
  }

  private floatText(x: number, y: number, msg: string, color = '#ffd54f'): void {
    const t = this.add.text(x, y - 20, msg, { fontSize: '15px', color, backgroundColor: '#000000aa', padding: { x: 4, y: 2 } })
      .setOrigin(0.5).setDepth(10000);
    this.tweens.add({ targets: t, y: y - 46, alpha: 0, duration: 900, onComplete: () => t.destroy() });
  }

  private showError(reason?: string): void {
    this.floatText(this.cat.x, this.cat.y, errorMessage(reason), '#ff6b6b');
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
    this.cat.setDepth(this.cat.y + 0.5);
    this.cameras.main.centerOn(this.cat.x, this.cat.y);

    // energy regen
    const state = this.store.getState();
    regenEnergy(state.production, delta);
    this.refreshHUD();

    // interaction detection
    const { gx: cx, gy: cy } = screenToIso(this.cat.x, this.cat.y, GAME_CONFIG.tileWidth, GAME_CONFIG.tileHeight);
    const tx = Math.round(cx), ty = Math.round(cy);
    const target = tileAt(state.world, tx, ty);

    const fac = facilityAt(state.production.facilities, tx, ty);
    const plot = state.production.plots.find(p => p.gx === tx && p.gy === ty);

    if (target?.kind !== 'merchant') this.shop.close();
    if (!(plot && !plot.crop)) this.plant.close();

    if (fac) {
      const idx = state.production.facilities.indexOf(fac);
      const prog = fac.recipe ? ` — ${fac.progress}/${ITEMS[fac.recipe].taps}` : '';
      this.prompt.show(`Work ${fac.type}${prog}`, 'Tap to work', () => {
        const r = this.store.workFacility(idx);
        if (r.ok) {
          if (r.produced) { playSfx('harvest'); this.floatText(this.cat.x, this.cat.y, `${ITEM_EMOJI[r.produced] ?? ''} +1`); }
          else { playSfx('tap'); this.floatText(this.cat.x, this.cat.y, '+1'); }
        } else { this.showError(r.reason); }
      });
    } else if (plot && plot.crop) {
      const idx = state.production.plots.indexOf(plot);
      this.prompt.show(`Work ${plot.crop} — ${plot.progress}/${ITEMS[plot.crop].taps}`, 'Tap to work', () => {
        const r = this.store.workPlot(idx);
        if (r.ok) {
          if (r.produced) { playSfx('harvest'); this.floatText(this.cat.x, this.cat.y, `${ITEM_EMOJI[r.produced] ?? ''} +1`); }
          else { playSfx('tap'); this.floatText(this.cat.x, this.cat.y, '+1'); }
        } else { this.showError(r.reason); }
      });
    } else if (plot && !plot.crop) {
      this.prompt.show('Empty plot', 'Plant', () => { this.plant.open(state.production.plots.indexOf(plot)); });
    } else if (target?.kind === 'merchant') {
      this.prompt.show('Open merchant', 'Trade', () => { this.shop.open(); });
    } else if (target?.kind === 'wild' && target.resource) {
      this.prompt.show(`Gather ${target.resource}`, 'Gather', () => {
        const r = this.store.gatherWild(tx, ty);
        if (r.ok) { playSfx('gather'); this.floatText(this.cat.x, this.cat.y, `${ITEM_EMOJI[r.produced ?? ''] ?? ''} +1`); }
        else { this.showError(r.reason); }
      });
    } else if (target?.kind === 'ruin' && target.ruinType) {
      const cost = buildCost(target.ruinType) * FACILITY_SIZE * FACILITY_SIZE;
      this.prompt.show(`Build ${target.ruinType} (2×2) — ${cost} 🪙`, 'Build', () => {
        const r = this.store.buildFacility(tx, ty);
        if (r.ok) { playSfx('build'); this.floatText(this.cat.x, this.cat.y, `Built ${target.ruinType}!`); }
        else { this.showError(r.reason); }
      });
    } else if (target && !target.owned && isAdjacentToOwned(state.world, tx, ty)) {
      const cost = landCost(countOwned(state.world));
      this.prompt.show(`Buy land — ${cost} 🪙`, 'Buy', () => {
        const r = this.store.buyLand(tx, ty);
        if (r.ok) playSfx('tap');
        else this.showError(r.reason);
      });
    } else {
      this.prompt.hide();
    }
  }
}