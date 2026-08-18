import Phaser from 'phaser';
import { Enemy } from './Enemy';

export class Trojan extends Enemy {
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

      380,        // HP
      18,         // velocidade
      25,         // dano

      0x991b1b,   // cor lógica

      32,         // raio

      'trojan'    // sprite
    );

    this.attackCooldown = 1000;
  }
}