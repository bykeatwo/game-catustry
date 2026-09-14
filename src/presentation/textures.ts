import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { CropId, FacilityType } from '../domain/types';

const { tileWidth: TW, tileHeight: TH } = GAME_CONFIG;

// --- Palette ---
const GRASS = 0x6fae54;
const GRASS_DARK = 0x57933d;
const GRASS_LIGHT = 0x8cc96a;
const UNOWNED = 0x3a3a3a;
const WATER = 0x4a86b8;
const WATER_LIGHT = 0x6aa8d4;
const RUIN = 0x8a6a3a;
const RUIN_DARK = 0x6e5230;
const MERCHANT = 0xc9a227;
const MERCHANT_DARK = 0xa9821c;

// deterministic pseudo-random from a seed (so tile variation is stable per index)
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function diamond(g: Phaser.GameObjects.Graphics, cx: number, cy: number, w: number, h: number): void {
  g.beginPath();
  g.moveTo(cx, cy - h / 2);
  g.lineTo(cx + w / 2, cy);
  g.lineTo(cx, cy + h / 2);
  g.lineTo(cx - w / 2, cy);
  g.closePath();
  g.fillPath();
}

// ---------------- Tiles ----------------

function grassTile(scene: Phaser.Scene, key: string, seed: number): void {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  const cx = TW / 2, cy = TH / 2;

  g.fillStyle(GRASS, 1);
  diamond(g, cx, cy, TW - 2, TH - 2);

  // blades + speckles (kept inside the diamond)
  g.fillStyle(GRASS_DARK, 1);
  for (let i = 0; i < 6; i++) {
    const bx = cx - TW / 4 + (rand(seed + i * 7) * TW / 2);
    const by = cy + (rand(seed + i * 13) * TH / 4) - TH / 8;
    g.fillEllipse(bx, by, 3, 5);
  }
  g.fillStyle(GRASS_LIGHT, 1);
  for (let i = 0; i < 5; i++) {
    const bx = cx - TW / 4 + (rand(seed + i * 17) * TW / 2);
    const by = cy - TH / 4 + (rand(seed + i * 23) * TH / 2);
    g.fillCircle(bx, by, 1.4);
  }

  g.generateTexture(key, TW, TH);
  g.destroy();
}

function solidTile(scene: Phaser.Scene, key: string, color: number, dark: number, seed = 0): void {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  const cx = TW / 2, cy = TH / 2;
  g.fillStyle(color, 1);
  diamond(g, cx, cy, TW - 2, TH - 2);
  // subtle mottling
  g.fillStyle(dark, 1);
  for (let i = 0; i < 5; i++) {
    const bx = cx - TW / 4 + (rand(seed + i * 31) * TW / 2);
    const by = cy - TH / 4 + (rand(seed + i * 41) * TH / 2);
    g.fillCircle(bx, by, 1.6);
  }
  g.generateTexture(key, TW, TH);
  g.destroy();
}

function waterTile(scene: Phaser.Scene, key: string, frame: number): void {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  const cx = TW / 2, cy = TH / 2;
  g.fillStyle(WATER, 1);
  diamond(g, cx, cy, TW - 2, TH - 2);
  g.fillStyle(WATER_LIGHT, 1);
  const off = frame % 2 === 0 ? 0 : 3;
  for (let i = 0; i < 3; i++) {
    const yy = cy - TH / 4 + i * (TH / 4) + off;
    if (yy > cy - TH / 2 + 2 && yy < cy + TH / 2 - 2) {
      g.fillRoundedRect(cx - TW / 4, yy, TW / 2, 2, 1);
    }
  }
  g.generateTexture(key, TW, TH);
  g.destroy();
}

// ---------------- Crops (3 growth stages) ----------------

const CROP_W = 32;
const CROP_H = 30;

function cropSprite(scene: Phaser.Scene, key: string, crop: CropId, stage: number): void {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  const cx = CROP_W / 2;
  const soil = (cy: number) => {
    g.fillStyle(0x6e5230, 1);
    g.fillRoundedRect(cx - 8, cy - 3, 16, 5, 2);
  };

  // growth factor 0..1 maps stage 0/1/2 to small/medium/full
  const t = stage / 2;

  switch (crop) {
    case 'wheat': {
      const base = CROP_H - 6;
      const h = 4 + t * 16;
      soil(base);
      g.fillStyle(0xd9b84a, 1);
      for (let i = 0; i < 5; i++) {
        const x = cx - 6 + i * 3;
        g.fillRect(x, base - h, 1.5, h);
      }
      g.fillStyle(0xf0d878, 1);
      g.fillCircle(cx, base - h - 1, 3);
      break;
    }
    case 'carrot': {
      const base = CROP_H - 5;
      const topLen = 3 + t * 8;
      soil(base);
      // orange tip emerging from soil
      if (t > 0.3) {
        g.fillStyle(0xe8742c, 1);
        g.fillTriangle(cx - 3, base - 1, cx + 3, base - 1, cx, base - (3 + t * 4));
      }
      // leafy top
      g.fillStyle(0x3f9b3f, 1);
      for (let i = 0; i < 4; i++) {
        const x = cx - 6 + i * 4;
        g.fillEllipse(x, base - topLen, 3, topLen + 2);
      }
      break;
    }
    case 'potato': {
      const base = CROP_H - 5;
      const bush = 4 + t * 10;
      soil(base);
      g.fillStyle(0x3f8f3a, 1);
      g.fillEllipse(cx, base - bush / 2, 16 + t * 4, bush);
      g.fillStyle(0x5cb24f, 1);
      g.fillCircle(cx - 4, base - bush - 1, 3);
      g.fillCircle(cx + 4, base - bush - 2, 3);
      // brown potato peeking
      g.fillStyle(0xb0824a, 1);
      g.fillEllipse(cx, base - 1, 10, 4);
      break;
    }
    case 'egg': {
      const base = CROP_H - 4;
      // nest
      g.fillStyle(0x9a7440, 1);
      g.fillEllipse(cx, base - 2, 18, 7);
      g.fillStyle(0x7a5a30, 1);
      g.fillEllipse(cx, base - 2, 14, 4);
      // eggs appear with growth
      g.fillStyle(0xf5f0e6, 1);
      if (t > 0.15) g.fillEllipse(cx - 4, base - 7, 6, 7);
      if (t > 0.55) g.fillEllipse(cx + 3, base - 7, 6, 7);
      if (t > 0.85) { g.fillEllipse(cx, base - 9, 6, 7); g.fillStyle(0xffd54f, 1); g.fillCircle(cx + 10, base - 10, 1.5); }
      break;
    }
  }

  g.generateTexture(key, CROP_W, CROP_H);
  g.destroy();
}

// ---------------- Facilities ----------------

const FAC_W = 64;
const FAC_H = 54;

function facilitySprite(scene: Phaser.Scene, key: string, type: FacilityType, working: boolean): void {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  const cx = FAC_W / 2;
  const base = FAC_H - 4;
  const roofY = base - 22;

  // foundation
  g.fillStyle(0x6e5230, 1);
  g.fillRoundedRect(cx - 24, base - 4, 48, 6, 3);
  // walls
  g.fillStyle(type === 'gourmet' ? 0xd8b8d8 : type === 'bakery' ? 0xd9c08a : 0xb89a6a, 1);
  g.fillRoundedRect(cx - 20, roofY, 40, base - 4 - roofY, 4);
  // roof
  g.fillStyle(type === 'gourmet' ? 0x9a5a9a : type === 'bakery' ? 0xa04a3a : 0x7a5a3a, 1);
  g.fillTriangle(cx - 26, roofY + 2, cx, roofY - 14, cx + 26, roofY + 2);

  if (type === 'mill') {
    // windmill blades
    g.lineStyle(2, 0x4a3a28, 1);
    g.lineBetween(cx + 10, roofY - 12, cx + 10, roofY - 30);
    const spin = working ? 2 : 0;
    g.lineStyle(3, 0xd9c08a, 1);
    g.lineBetween(cx + 6, roofY - 28, cx + 14, roofY - 20 + spin);
    g.lineBetween(cx + 14, roofY - 28, cx + 6, roofY - 20 - spin);
  } else if (type === 'bakery') {
    // loaf on roof
    g.fillStyle(0xc98a3a, 1);
    g.fillEllipse(cx, roofY - 14, 14, 8);
    g.fillStyle(0xe8b860, 1);
    g.fillRect(cx - 6, roofY - 17, 12, 1.5);
    // steam when working
    if (working) {
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(cx - 8, roofY - 26, 2);
      g.fillCircle(cx, roofY - 30, 2.5);
      g.fillCircle(cx + 8, roofY - 26, 2);
    }
  } else {
    // gourmet: chef hat + star
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(cx, roofY - 14, 14, 7);
    g.fillRect(cx - 5, roofY - 20, 10, 7);
    g.fillStyle(0xffd54f, 1);
    g.fillCircle(cx, roofY - 26, 4);
  }

  g.generateTexture(key, FAC_W, FAC_H);
  g.destroy();
}

// ---------------- Entities (ruin, merchant, empty plot) ----------------

function ruinEntity(scene: Phaser.Scene): void {
  const key = 'entity-ruin';
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  const cx = 22, base = 30;
  // crumbled stone blocks
  g.fillStyle(0x8a8a8a, 1);
  g.fillRoundedRect(cx - 16, base - 12, 14, 10, 2);
  g.fillRoundedRect(cx + 2, base - 10, 14, 8, 2);
  g.fillStyle(0x9a9a9a, 1);
  g.fillRoundedRect(cx - 8, base - 16, 12, 8, 2);
  g.fillStyle(0x5f6b52, 1);
  g.fillRect(cx - 10, base - 8, 6, 4);  // moss
  g.generateTexture(key, 44, 32);
  g.destroy();
}

function merchantEntity(scene: Phaser.Scene): void {
  const key = 'entity-merchant';
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  const cx = 24, base = 46;
  // counter
  g.fillStyle(0x8a5a2a, 1);
  g.fillRoundedRect(cx - 18, base - 16, 36, 16, 3);
  g.fillStyle(0x6e4520, 1);
  g.fillRect(cx - 16, base - 12, 32, 2);
  // awning (striped)
  g.fillStyle(0xc94040, 1);
  g.fillRoundedRect(cx - 20, base - 30, 40, 14, 3);
  g.fillStyle(0xffffff, 1);
  for (let i = 0; i < 3; i++) g.fillRect(cx - 16 + i * 12, base - 30, 6, 14);
  // support poles
  g.fillStyle(0x8a5a2a, 1);
  g.fillRect(cx - 19, base - 20, 3, 6);
  g.fillRect(cx + 16, base - 20, 3, 6);
  // goods
  g.fillStyle(0xffd54f, 1);
  g.fillCircle(cx - 8, base - 18, 4);
  g.fillCircle(cx, base - 19, 4);
  g.fillCircle(cx + 8, base - 18, 4);
  g.generateTexture(key, 48, 48);
  g.destroy();
}

function emptyPlot(scene: Phaser.Scene): void {
  const key = 'plot-empty';
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  const cx = 16;
  g.fillStyle(0x6e5230, 1);
  g.fillEllipse(cx, 18, 26, 12);
  g.fillStyle(0x5a4228, 1);
  g.fillRect(cx - 10, 12, 4, 6);
  g.fillRect(cx - 2, 12, 4, 6);
  g.fillRect(cx + 6, 12, 4, 6);
  g.generateTexture(key, 32, 22);
  g.destroy();
}

// ---------------- Public API ----------------

export function makeTileTextures(scene: Phaser.Scene): void {
  for (let i = 0; i < 3; i++) grassTile(scene, `iso-grass-${i}`, i);
  solidTile(scene, 'iso-unowned', UNOWNED, 0x2a2a2a);
  waterTile(scene, 'iso-water-0', 0);
  waterTile(scene, 'iso-water-1', 1);
  solidTile(scene, 'iso-ruin', RUIN, RUIN_DARK, 3);
  solidTile(scene, 'iso-merchant', MERCHANT, MERCHANT_DARK, 5);
}

export function makeCropTextures(scene: Phaser.Scene): void {
  const crops: CropId[] = ['wheat', 'carrot', 'potato', 'egg'];
  for (const c of crops) {
    for (let s = 0; s < 3; s++) cropSprite(scene, `crop-${c}-${s}`, c, s);
  }
}

export function makeFacilityTextures(scene: Phaser.Scene): void {
  const types: FacilityType[] = ['mill', 'bakery', 'gourmet'];
  for (const t of types) {
    facilitySprite(scene, `fac-${t}`, t, false);
    facilitySprite(scene, `fac-${t}-work`, t, true);
  }
}

/** Grass texture for an owned tile (deterministic per grid position). */
export function grassTextureKey(gx: number, gy: number): string {
  return `iso-grass-${Math.floor(rand(gx * 31 + gy) * 3)}`;
}

export function makeEntityTextures(scene: Phaser.Scene): void {
  ruinEntity(scene);
  merchantEntity(scene);
  emptyPlot(scene);
}