import Phaser from 'phaser';

export class CryoProjectile extends Phaser.GameObjects.Arc {
  public speed: number;
  public damage: number;

  public row: number;

  public slowMultiplier: number;
  public slowDuration: number;

  private glow!: Phaser.GameObjects.Arc;
  private shard!: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    row: number,
    damage: number,
    slowMultiplier: number,
    slowDuration: number
  ) {
    super(
      scene,
      x,
      y,
      5,
      0,
      360,
      false,
      0xe0f2fe,
      1
    );

    this.speed = 260;

    this.damage = damage;
    this.row = row;

    this.slowMultiplier =
      slowMultiplier;

    this.slowDuration =
      slowDuration;

    scene.add.existing(this);

    this.setDepth(9);

    // Cristal central
    this.shard =
      scene.add.rectangle(
        x,
        y,
        22,
        8,
        0x67e8f9
      );

    this.shard.setRotation(
      Phaser.Math.DegToRad(45)
    );

    this.shard.setDepth(8);

    // Brilho congelante
    this.glow =
      scene.add.circle(
        x,
        y,
        18,
        0x22d3ee,
        0.22
      );

    this.glow.setDepth(7);

    scene.tweens.add({
      targets: this.glow,

      alpha: {
        from: 0.1,
        to: 0.45
      },

      scale: {
        from: 0.7,
        to: 1.2
      },

      duration: 300,

      yoyo: true,
      repeat: -1
    });
  }

  update(delta: number) {
    this.x +=
      this.speed *
      (delta / 1000);

    this.glow.setPosition(
      this.x,
      this.y
    );

    this.shard.setPosition(
      this.x,
      this.y
    );

    this.shard.rotation +=
      0.03;
  }

  destroy(fromScene?: boolean) {
    if (
      this.glow &&
      this.glow.active
    ) {
      this.glow.destroy();
    }

    if (
      this.shard &&
      this.shard.active
    ) {
      this.shard.destroy();
    }

    super.destroy(fromScene);
  }
}