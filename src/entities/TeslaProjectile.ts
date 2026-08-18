import Phaser from 'phaser';

export class TeslaProjectile extends Phaser.GameObjects.Arc {
  public speed: number;

  public damage: number;
  public areaDamage: number;
  public explosionRadius: number;

  public row: number;

  private glow!: Phaser.GameObjects.Arc;
  private outerGlow!: Phaser.GameObjects.Arc;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    row: number,
    damage: number,
    areaDamage: number,
    explosionRadius: number
  ) {
    super(
      scene,
      x,
      y,
      8,
      0,
      360,
      false,
      0xffffff,
      1
    );

    this.speed = 230;

    this.damage = damage;
    this.areaDamage = areaDamage;

    this.explosionRadius =
      explosionRadius;

    this.row = row;

    scene.add.existing(this);

    this.setDepth(10);

    // Núcleo roxo
    this.glow =
      scene.add.circle(
        x,
        y,
        13,
        0xc084fc,
        0.5
      );

    this.glow.setDepth(9);

    // Aura elétrica maior
    this.outerGlow =
      scene.add.circle(
        x,
        y,
        22,
        0x9333ea,
        0.18
      );

    this.outerGlow.setDepth(8);

    scene.tweens.add({
      targets:
        this.outerGlow,

      scale: {
        from: 0.6,
        to: 1.35
      },

      alpha: {
        from: 0.1,
        to: 0.4
      },

      duration: 180,

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

    this.outerGlow.setPosition(
      this.x,
      this.y
    );
  }

  destroy(fromScene?: boolean) {
    if (
      this.glow &&
      this.glow.active
    ) {
      this.glow.destroy();
    }

    if (
      this.outerGlow &&
      this.outerGlow.active
    ) {
      this.outerGlow.destroy();
    }

    super.destroy(fromScene);
  }
}