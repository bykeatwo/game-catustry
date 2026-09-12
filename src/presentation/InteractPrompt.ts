import Phaser from 'phaser';

export class InteractPrompt {
  private text: Phaser.GameObjects.Text;
  private btn: Phaser.GameObjects.Text;
  private onBuy: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.text = scene.add.text(16, 16, '', { fontSize: '16px', color: '#fff', backgroundColor: '#00000088' }).setScrollFactor(0).setDepth(1000);
    this.btn = scene.add.text(16, 48, '', { fontSize: '16px', color: '#ffd', backgroundColor: '#00000088' }).setScrollFactor(0).setDepth(1000).setInteractive({ useHandCursor: true });
    this.btn.on('pointerdown', () => this.onBuy?.());
    this.hide();
  }

  show(label: string, buyLabel: string, onBuy: () => void): void {
    this.text.setText(label).setVisible(true);
    this.btn.setText(buyLabel).setVisible(true);
    this.onBuy = onBuy;
  }

  hide(): void {
    this.text.setVisible(false);
    this.btn.setVisible(false);
    this.onBuy = null;
  }
}