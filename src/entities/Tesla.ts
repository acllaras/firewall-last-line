import Phaser from 'phaser';
import { Defender } from './Defender';

export class Tesla extends Defender {
  public damage: number;
  public areaDamage: number;
  public explosionRadius: number;

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
      0xa855f7,
      120,
      row,
      column
    );

    // Esconde o círculo original.
    this.setAlpha(0);

    // Sprite visual da Tesla.
    this.sprite = scene.add.image(
      x,
      y,
      'tesla'
    );

    this.sprite.setDisplaySize(
      54,
      54
    );

    this.sprite.setDepth(5);

    this.damage = 40;
    this.areaDamage = 24;
    this.explosionRadius = 90;

    this.attackCooldown = 2200;
    this.lastAttackTime = 0;

    this.cost = 150;
  }

  canAttack(currentTime: number) {
    return (
      currentTime -
        this.lastAttackTime >=
      this.attackCooldown
    );
  }

  registerAttack(currentTime: number) {
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