import Phaser from 'phaser';
import { Defender } from './Defender';

export class Unit extends Defender {
  public damage: number;

  public attackCooldown: number;
  public lastAttackTime: number;

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
      0x3b82f6,
      100,
      row,
      column
    );

    // O círculo continua existindo para a lógica,
    // mas fica invisível.
    this.setAlpha(0);

    // Sprite visual do Pulse
    this.sprite = scene.add.image(
      x,
      y,
      'pulse'
    );

    this.sprite.setDisplaySize(
      54,
      54
    );

    this.sprite.setDepth(5);

    this.damage = 25;

    this.attackCooldown = 1200;
    this.lastAttackTime = 0;

    this.cost = 75;
  }

  canAttack(
    currentTime: number
  ) {
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

  destroy(
    fromScene?: boolean
  ) {
    if (
      this.sprite &&
      this.sprite.active
    ) {
      this.sprite.destroy();
    }

    super.destroy(fromScene);
  }
}