import Phaser from 'phaser';

interface ParticleEffect {
  init(): void;
  emit(x: number, y: number): void;
  destroy(): void;
}

/** Simple sparkle burst for harvest */
export class HarvestBurst implements ParticleEffect {
  private emitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private inited = false;

  constructor(private scene: Phaser.Scene) {}

  init(): void {
    if (this.inited) return;

    // Create texture
    const g = this.scene.add.graphics();
    g.fillStyle(0xffd54f, 1);
    g.fillCircle(4, 4, 6);
    g.generateTexture('sparkle', 8, 8);
    g.destroy();

    // Create emitter with config in constructor
    this.emitter = this.scene.add.particles(0, 0, 'sparkle', {
      speed: { min: 60, max: 140 },
      angle: { min: 0, max: 360 },
      lifespan: 250,
      quantity: 5,
      scale: { start: 0.5, end: 0 },
      tint: [0xffd54f, 0xffaa33, 0xffffff],
      alpha: { start: 0.7, end: 0 }
    });
    this.emitter.stop(); // Will emit on demand
    this.inited = true;
  }

  emit(x: number, y: number): void {
    if (!this.inited) this.init();
    this.emitter.setPosition(x, y);
    this.emitter.emitParticle(1);
    // Emit multiple particles
    for (let i = 0; i < 5; i++) {
      this.emitter.emitParticleAt(x, y);
    }
  }

  destroy(): void {
    this.emitter?.destroy();
  }
}

/** Dust puff for building */
export class DustPuff implements ParticleEffect {
  private emitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private inited = false;

  constructor(private scene: Phaser.Scene) {}

  init(): void {
    if (this.inited) return;

    const g = this.scene.add.graphics();
    g.fillStyle(0x8a6a3a, 1);
    g.fillCircle(6, 6, 8);
    g.generateTexture('dust', 12, 12);
    g.destroy();

    this.emitter = this.scene.add.particles(0, 0, 'dust', {
      speed: { min: 40, max: 80 },
      angle: { min: 180, max: 360 },
      lifespan: 300,
      quantity: 6,
      scale: { start: 0.5, end: 0 },
      tint: [0xd8b88a, 0xb89866],
      alpha: { start: 0.5, end: 0 },
      gravityY: 100
    });
    this.emitter.stop();
    this.inited = true;
  }

  emit(x: number, y: number): void {
    if (!this.inited) this.init();
    this.emitter.setPosition(x, y);
    for (let i = 0; i < 6; i++) {
      this.emitter.emitParticleAt(x, y);
    }
  }

  destroy(): void {
    this.emitter?.destroy();
  }
}

/** Level-up star burst */
export class LevelStar implements ParticleEffect {
  private emitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private inited = false;

  constructor(private scene: Phaser.Scene) {}

  init(): void {
    if (this.inited) return;

    const g = this.scene.add.graphics();
    g.fillStyle(0xffd54f, 1);
    g.beginPath();
    const r = 6;
    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5 + Math.PI / 2;
      g.lineTo(r * Math.cos(a) - r * Math.sin(a) + 0.5, r * Math.sin(a) + r * Math.cos(a) + 0.5);
    }
    g.closePath();
    g.fillPath();
    g.generateTexture('star', 12, 12);
    g.destroy();

    this.emitter = this.scene.add.particles(0, 0, 'star', {
      speed: { min: 80, max: 180 },
      angle: { min: 0, max: 360 },
      lifespan: 400,
      quantity: 8,
      scale: { start: 0.6, end: 0 },
      tint: [0xffd54f, 0xffaa33, 0xffffff],
      alpha: { start: 0.9, end: 0 },
      gravityY: -80
    });
    this.emitter.stop();
    this.inited = true;
  }

  emit(x: number, y: number): void {
    if (!this.inited) this.init();
    this.emitter.setPosition(x, y);
    for (let i = 0; i < 8; i++) {
      this.emitter.emitParticleAt(x, y);
    }
  }

  destroy(): void {
    this.emitter?.destroy();
  }
}

export function initEffects(scene: Phaser.Scene): { harvest: HarvestBurst; build: DustPuff; levelup: LevelStar } {
  return {
    harvest: new HarvestBurst(scene),
    build: new DustPuff(scene),
    levelup: new LevelStar(scene)
  };
}