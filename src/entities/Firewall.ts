import Phaser from 'phaser';
import { Defender } from './Defender';

export class Firewall extends Defender {
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
      28,
      0x22c55e,
      360,
      row,
      column
    );

    // Esconde o círculo original.
    this.setAlpha(0);

    // Sprite visual do Firewall.
    this.sprite = scene.add.image(
      x,
      y,
      'firewall'
    );

    this.sprite.setDisplaySize(
      58,
      58
    );

    this.sprite.setDepth(5);

    this.cost = 90;
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