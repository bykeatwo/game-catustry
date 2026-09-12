import Phaser from 'phaser';
import { GameScene } from './presentation/GameScene';
import { GAME_CONFIG } from './config/gameConfig';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  backgroundColor: '#1b2a1b',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [GameScene]
});