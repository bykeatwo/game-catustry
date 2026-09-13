import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

export class InteractPrompt {
  private text: Phaser.GameObjects.Text;
  private btn: Phaser.GameObjects.Text;
  private onBuy: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    const cx = GAME_CONFIG.width / 2;
    const bottom = GAME_CONFIG.height;

    this.text = scene.add.text(cx, bottom - 96, '', { fontSize: '17px', color: '#fff', backgroundColor: '#00000088', padding: { x: 10, y: 6 } })
      .setOrigin(0.5).setScrollFactor(0).setDepth(1000);
    this.btn = scene.add.text(cx, bottom - 48, '', { fontSize: '18px', color: '#ffd54f', backgroundColor: '#000000cc', padding: { x: 14, y: 8 } })
      .setOrigin(0.5).setScrollFactor(0).setDepth(1000).setInteractive({ useHandCursor: true });
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