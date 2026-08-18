import Phaser from 'phaser';
import { Enemy } from './Enemy';

export class Worm extends Enemy {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    row: number
  ) {
    super(
      scene,
      x,
      y,
      row,

      85,         // HP
      52,         // velocidade
      9,          // dano

      0xf97316,   // cor lógica

      20,         // raio

      'worm'      // sprite
    );
  }
}