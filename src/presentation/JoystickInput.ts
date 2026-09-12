import Phaser from 'phaser';

export class JoystickInput {
  private pointer: Phaser.Input.Pointer | null = null;
  private base = { x: 0, y: 0 };
  private vec = { dx: 0, dy: 0 };
  private readonly radius = 48;

  constructor(scene: Phaser.Scene) {
    scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.pointer) return;
      this.pointer = p;
      this.base = { x: p.x, y: p.y };
    });
    scene.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p !== this.pointer) return;
      this.vec = { dx: (p.x - this.base.x) / this.radius, dy: (p.y - this.base.y) / this.radius };
      const m = Math.hypot(this.vec.dx, this.vec.dy);
      if (m > 1) { this.vec.dx /= m; this.vec.dy /= m; }
    });
    scene.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (p === this.pointer) { this.pointer = null; this.vec = { dx: 0, dy: 0 }; }
    });
  }

  getVector(): { dx: number; dy: number } { return this.vec; }
}