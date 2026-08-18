import Phaser from 'phaser';
import { Defender } from './Defender';

export class Cryo extends Defender {
  public damage: number;

  public attackCooldown: number;
  public lastAttackTime: number;

  public slowMultiplier: number;
  public slowDuration: number;

  public cost: number;

  private sprite!: Phaser.GameObjects.Image;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    row: number,
    column: number
  ) {
    super(
      scene,
      x,
      y,
      25,
      0x06b6d4,
      100,
      row,
      column
    );

    // Esconde o círculo original.
    this.setAlpha(0);

    // Sprite visual da Cryo.
    this.sprite = scene.add.image(
      x,
      y,
      'cryo'
    );

    this.sprite.setDisplaySize(
      54,
      54
    );

    this.sprite.setDepth(5);

    this.damage = 16;

    this.attackCooldown = 1500;
    this.lastAttackTime = 0;

    this.slowMultiplier = 0.5;
    this.slowDuration = 3000;

    this.cost = 100;
  }

  canAttack(currentTime: number) {
    return (
      currentTime -
        this.lastAttackTime >=
      this.attackCooldown
    );
  }

  registerAttack(
    currentTime: number
  ) {
    this.lastAttackTime =
      currentTime;
  }

  destroy(fromScene?: boolean) {
    if (
      this.sprite &&
      this.sprite.active
    ) {
      this.sprite.destroy();
    }

    super.destroy(fromScene);
  }
}