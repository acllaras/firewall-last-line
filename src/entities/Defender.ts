import Phaser from 'phaser';

export class Defender extends Phaser.GameObjects.Arc {
  public health: number;
  public maxHealth: number;

  public row: number;
  public column: number;

  private healthBarBackground: Phaser.GameObjects.Rectangle;
  private healthBar: Phaser.GameObjects.Rectangle;
  private criticalTween?: Phaser.Tweens.Tween;

  private readonly healthBarWidth = 45;
  private readonly healthBarHeight = 6;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    radius: number,
    color: number,
    health: number,
    row: number,
    column: number
  ) {
    super(
      scene,
      x,
      y,
      radius,
      0,
      360,
      false,
      color,
      1
    );

    this.health = health;
    this.maxHealth = health;

    this.row = row;
    this.column = column;

    scene.add.existing(this);

    this.healthBarBackground =
      scene.add.rectangle(
        x,
        y - radius - 12,
        this.healthBarWidth + 2,
        this.healthBarHeight + 2,
        0x040a12,
        0.9
      )
        .setStrokeStyle(1, 0x1f3a4d, 0.9)
        .setDepth(6);

    this.healthBar =
      scene.add.rectangle(
        x - this.healthBarWidth / 2,
        y - radius - 12,
        this.healthBarWidth,
        this.healthBarHeight,
        0x22c55e
      ).setDepth(7);

    this.healthBar.setOrigin(
      0,
      0.5
    );
  }

  takeDamage(amount: number) {
    this.health -= amount;

    if (this.health < 0) {
      this.health = 0;
    }

    this.updateHealthBar();

    console.log(
      `${this.constructor.name} recebeu ${amount} de dano. HP atual: ${this.health}`
    );
  }

  private updateHealthBar() {
    const percentage =
      this.health /
      this.maxHealth;

    this.healthBar.width =
      this.healthBarWidth *
      percentage;

    if (percentage > 0.6) {
      this.healthBar.setFillStyle(
        0x22c55e
      );

      this.stopCriticalPulse();
    } else if (
      percentage > 0.3
    ) {
      this.healthBar.setFillStyle(
        0xfacc15
      );

      this.stopCriticalPulse();
    } else {
      this.healthBar.setFillStyle(
        0xef4444
      );

      this.startCriticalPulse();
    }
  }

  // Piscar sutil quando a estrutura está em risco — dá um alerta
  // visual sem precisar de texto extra na tela.
  private startCriticalPulse() {
    if (this.criticalTween) {
      return;
    }

    this.criticalTween =
      this.scene.tweens.add({
        targets: [this.healthBar, this.healthBarBackground],
        alpha: { from: 1, to: 0.45 },
        duration: 380,
        yoyo: true,
        repeat: -1
      });
  }

  private stopCriticalPulse() {
    if (this.criticalTween) {
      this.criticalTween.stop();
      this.criticalTween = undefined;

      this.healthBar.setAlpha(1);
      this.healthBarBackground.setAlpha(0.9);
    }
  }

  isDead() {
    return this.health <= 0;
  }

  destroy(
    fromScene?: boolean
  ) {
    this.stopCriticalPulse();

    this.healthBar.destroy();
    this.healthBarBackground.destroy();

    super.destroy(fromScene);
  }
}