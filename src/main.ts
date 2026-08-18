import Phaser from 'phaser';

import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,

  width: 1100,
  height: 720,

  backgroundColor: '#050a12',

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1100,
    height: 720
  },

  scene: [
    MenuScene,
    GameScene
  ]
};

new Phaser.Game(config);