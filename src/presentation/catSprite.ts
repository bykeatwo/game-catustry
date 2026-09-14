import Phaser from 'phaser';

// --- Cat palette ---
const FUR = 0xffb347;
const FUR_DARK = 0xd9822b;
const CREAM = 0xffedd0;
const EAR_IN = 0xff9db0;
const EYE = 0x26262b;
const NOSE = 0xff6b8a;
const OUTLINE = 0x7a3d18;

const W = 48;
const H = 52;

type View = 'side' | 'down' | 'up';

/**
 * Procedurally draw a chibi orange cat into a graphics object.
 * phase: 0..1 walk cycle (0 = neutral), work: paw-tap pose, flip handled by caller (flipX).
 */
function drawCat(g: Phaser.GameObjects.Graphics, view: View, phase: number, work: boolean): void {
  const steps = (n: number, ph: number): number => {
    // smooth bounce from a 0..1 phase, repeated n times
    const t = (ph * n) % 1;
    return Math.sin(t * Math.PI);
  };

  g.clear();
  g.lineStyle(2, OUTLINE, 1);

  if (view === 'side') {
    const bounce = steps(2, phase) * 1.5;

    // tail
    const sway = Math.sin(phase * Math.PI * 2) * 4;
    g.fillStyle(FUR, 1);
    g.lineStyle(0, 0x000000, 0);
    g.fillRoundedRect(4, 26 + bounce - sway * 0.3, 12, 4, 2);
    g.fillCircle(4, 28 + bounce - sway * 0.3, 4);

    // body
    g.lineStyle(2, OUTLINE, 1);
    g.fillStyle(FUR, 1);
    g.fillEllipse(24, 30 + bounce, 30, 18);
    // cream belly
    g.fillStyle(CREAM, 1);
    g.fillEllipse(22, 34 + bounce, 18, 8);

    // legs
    g.fillStyle(FUR_DARK, 1);
    const legLift = steps(2, phase) * 3;
    g.fillRoundedRect(14, 36 + bounce, 7, 12 + (legLift * 0.5), 3);   // back leg
    g.fillRoundedRect(30, 36 + bounce, 7, 12 - (legLift * 0.5), 3);   // front leg

    // head
    g.fillStyle(FUR, 1);
    g.fillCircle(40, 24 + bounce, 10);
    // ears
    g.fillTriangle(35, 17 + bounce, 32, 10 + bounce, 39, 15 + bounce);
    g.fillTriangle(45, 15 + bounce, 48, 10 + bounce, 43, 17 + bounce);
    g.fillStyle(EAR_IN, 1);
    g.fillTriangle(36, 16 + bounce, 34, 12 + bounce, 38, 15 + bounce);
    // muzzle / cream
    g.fillStyle(CREAM, 1);
    g.fillCircle(41, 27 + bounce, 5);
    // eye
    g.fillStyle(EYE, 1);
    if (work) g.fillRect(37, 22 + bounce, 2, 5);  // closed (working)
    else g.fillCircle(40, 23 + bounce, 2.2);
    // nose
    g.fillStyle(NOSE, 1);
    g.fillTriangle(43, 26 + bounce, 44.6, 25.2 + bounce, 45.2, 26.6 + bounce);
  } else if (view === 'down') {
    // back view (moving toward viewer); tail up, ears big
    const bob = steps(2, phase) * 1.5;

    // tail
    g.fillStyle(FUR, 1);
    g.lineStyle(0, 0x000000, 0);
    g.fillRoundedRect(22, 8 + bob, 6, 12, 3);

    // body (seen from behind)
    g.lineStyle(2, OUTLINE, 1);
    g.fillStyle(FUR, 1);
    g.fillEllipse(24, 32 + bob, 26, 24);

    // head
    g.fillCircle(24, 24 + bob, 10);
    // ears
    g.fillTriangle(13, 19 + bob, 9, 11 + bob, 18, 15 + bob);
    g.fillTriangle(35, 19 + bob, 39, 11 + bob, 30, 15 + bob);
    g.fillStyle(EAR_IN, 1);
    g.fillTriangle(14, 18 + bob, 11, 13 + bob, 17, 15 + bob);
    g.fillTriangle(34, 18 + bob, 37, 13 + bob, 31, 15 + bob);

    // hint of paws poking out at sides (walking)
    g.fillStyle(FUR_DARK, 1);
    const s = steps(2, phase) * 4;
    g.fillRoundedRect(10, 40 + bob, 6, 8 - s, 3);
    g.fillRoundedRect(32, 40 + bob, 6, 8 + s, 3);
  } else {
    // front view (moving away)
    const bob = steps(2, phase) * 1.5;

    // body
    g.lineStyle(2, OUTLINE, 1);
    g.fillStyle(FUR, 1);
    g.fillEllipse(24, 34 + bob, 30, 24);
    g.fillStyle(CREAM, 1);
    g.fillEllipse(24, 38 + bob, 16, 10);

    // head
    g.fillStyle(FUR, 1);
    g.fillCircle(24, 24 + bob, 11);
    // ears
    g.fillTriangle(12, 19 + bob, 8, 10 + bob, 18, 14 + bob);
    g.fillTriangle(36, 19 + bob, 40, 10 + bob, 30, 14 + bob);
    g.fillStyle(EAR_IN, 1);
    g.fillTriangle(13, 17 + bob, 10, 12 + bob, 17, 15 + bob);
    g.fillTriangle(35, 17 + bob, 38, 12 + bob, 31, 15 + bob);

    // eyes (two, front facing)
    g.fillStyle(EYE, 1);
    if (work) {
      g.fillRect(17, 23 + bob, 3, 5);
      g.fillRect(28, 23 + bob, 3, 5);
    } else {
      g.fillCircle(19, 23 + bob, 2.2);
      g.fillCircle(29, 23 + bob, 2.2);
    }
    // muzzle + nose
    g.fillStyle(CREAM, 1);
    g.fillCircle(24, 29 + bob, 5);
    g.fillStyle(NOSE, 1);
    g.fillTriangle(23, 28 + bob, 24.4, 27 + bob, 25.6, 28 + bob);

    // paws
    g.fillStyle(FUR_DARK, 1);
    const s = steps(2, phase) * 4;
    g.fillRoundedRect(12, 44 + bob, 7, 7 - s, 3);
    g.fillRoundedRect(29, 44 + bob, 7, 7 + s, 3);
  }
}

function gen(scene: Phaser.Scene, key: string, view: View, phase: number, work: boolean): void {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  drawCat(g, view, phase, work);
  g.generateTexture(key, W, H);
  g.destroy();
}

const N = 4; // walk frames per direction

/** Generate every cat texture frame. */
export function makeCatTextures(scene: Phaser.Scene): void {
  // idle frames per facing (tail sway / subtle breathing)
  gen(scene, 'cat-idle-side-0', 'side', 0, false);
  gen(scene, 'cat-idle-side-1', 'side', 0.25, false);
  gen(scene, 'cat-idle-down-0', 'down', 0, false);
  gen(scene, 'cat-idle-down-1', 'down', 0.25, false);
  gen(scene, 'cat-idle-up-0', 'up', 0, false);
  gen(scene, 'cat-idle-up-1', 'up', 0.25, false);

  // walk frames per direction
  for (let i = 0; i < N; i++) {
    const p = i / N;
    gen(scene, `cat-side-${i}`, 'side', p, false);
    gen(scene, `cat-down-${i}`, 'down', p, false);
    gen(scene, `cat-up-${i}`, 'up', p, false);
  }

  // work / paw-tap — 2 frames
  gen(scene, 'cat-work-0', 'side', 0, false);
  gen(scene, 'cat-work-1', 'side', 0, true);

  // default single frame (used before anims are registered in createCat)
  gen(scene, 'cat', 'side', 0, false);
}

/** Register all cat animations on the scene's anims manager. */
export function createCatAnimations(scene: Phaser.Scene): void {
  const anims = scene.anims;
  const frames = (keys: string[]) => keys.map((key) => ({ key }));
  const add = (key: string, ks: string[], rate: number) => {
    if (!anims.exists(key)) anims.create({ key, frames: frames(ks), frameRate: rate, repeat: -1 });
  };

  add('cat-idle-side', ['cat-idle-side-0', 'cat-idle-side-1'], 3);
  add('cat-idle-down', ['cat-idle-down-0', 'cat-idle-down-1'], 3);
  add('cat-idle-up', ['cat-idle-up-0', 'cat-idle-up-1'], 3);
  add('cat-walk-side', [0, 1, 2, 3].map(i => `cat-side-${i}`), 8);
  add('cat-walk-down', [0, 1, 2, 3].map(i => `cat-down-${i}`), 8);
  add('cat-walk-up', [0, 1, 2, 3].map(i => `cat-up-${i}`), 8);
  add('cat-work', ['cat-work-0', 'cat-work-1'], 6);
}