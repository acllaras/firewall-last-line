import Phaser from 'phaser';

export class Projectile extends Phaser.GameObjects.Arc {
  public speed: number;
  public damage: number;

  public row: number;

  private glow!: Phaser.GameObjects.Arc;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    row: number,
    damage: number
  ) {
    super(
      scene,
      x,
      y,
      7,
      0,
      360,
      false,
      0xffffff,
      1
    );

    this.speed = 300;
    this.damage = damage;
    this.row = row;

    scene.add.existing(this);

    this.setDepth(8);

    // Halo azul ao redor do projétil
    this.glow = scene.add.circle(
      x,
      y,
      15,
      0x38bdf8,
      0.25
    );

    this.glow.setDepth(7);

    // Pequena pulsação no brilho
    scene.tweens.add({
      targets: this.glow,

      scale: {
        from: 0.7,
        to: 1.2
      },

      alpha: {
        from: 0.15,
        to: 0.4
      },

      duration: 250,

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
  }

  destroy(fromScene?: boolean) {
    if (
      this.glow &&
      this.glow.active
    ) {
      this.glow.destroy();
    }

    super.destroy(fromScene);
  }
}