import Phaser from 'phaser';

export class Enemy extends Phaser.GameObjects.Arc {
  public health: number;
  public maxHealth: number;

  public speed: number;
  public baseSpeed: number;

  public damage: number;

  public row: number;

  public isBlocked: boolean = false;

  public attackCooldown: number = 1000;
  public lastAttackTime: number = 0;

  public slowUntil: number = 0;
  public slowMultiplier: number = 1;

  private healthBarBackground: Phaser.GameObjects.Rectangle;
  private healthBar: Phaser.GameObjects.Rectangle;

  private sprite!: Phaser.GameObjects.Image;

  private readonly healthBarWidth = 50;
  private readonly healthBarHeight = 6;

  private readonly originalColor: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    row: number,
    health: number = 140,
    speed: number = 32,
    damage: number = 13,
    color: number = 0xef4444,
    radius: number = 25,
    texture: string = 'malware'
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

    this.baseSpeed = speed;
    this.speed = speed;

    this.damage = damage;

    this.row = row;

    this.originalColor = color;

    scene.add.existing(this);

    // O círculo continua existindo para a lógica,
    // mas fica invisível.
    this.setAlpha(0);

    // Sprite visual do Malware.
    this.sprite = scene.add.image(
      x,
      y,
      texture
    );

    this.sprite.setDisplaySize(
      50,
      50
    );

    this.sprite.setDepth(5);

    this.healthBarBackground =
      scene.add.rectangle(
        x,
        y - radius - 12,
        this.healthBarWidth + 2,
        this.healthBarHeight + 2,
        0x040a12,
        0.9
      ).setStrokeStyle(1, 0x3a1a1a, 0.9);

    this.healthBar =
      scene.add.rectangle(
        x - this.healthBarWidth / 2,
        y - radius - 12,
        this.healthBarWidth,
        this.healthBarHeight,
        0x22c55e
      );

    this.healthBar.setOrigin(
      0,
      0.5
    );

    this.healthBarBackground.setDepth(6);
    this.healthBar.setDepth(7);
  }

  update(
    delta: number,
    currentTime: number
  ) {
    this.updateStatusEffects(
      currentTime
    );

    if (!this.isBlocked) {
      this.x -=
        this.speed *
        (delta / 1000);
    }

    this.updateVisualPosition();
  }

  takeDamage(amount: number) {
    this.health -= amount;

    if (this.health < 0) {
      this.health = 0;
    }

    this.updateHealthBar();

    console.log(
      `${this.constructor.name} recebeu ${amount} de dano. HP: ${this.health}`
    );
  }

  applySlow(
    multiplier: number,
    duration: number,
    currentTime: number
  ) {
    this.slowMultiplier =
      multiplier;

    this.slowUntil =
      currentTime + duration;

    this.speed =
      this.baseSpeed *
      multiplier;

    // Efeito visual simples enquanto estiver lento.
    this.sprite.setTint(
      0x67e8f9
    );
  }

  private updateStatusEffects(
    currentTime: number
  ) {
    if (
      this.slowUntil === 0
    ) {
      return;
    }

    if (
      currentTime <
      this.slowUntil
    ) {
      return;
    }

    this.slowUntil = 0;
    this.slowMultiplier = 1;

    this.speed =
      this.baseSpeed;

    this.sprite.clearTint();

    // Mantemos isso por compatibilidade
    // com a entidade lógica invisível.
    this.setFillStyle(
      this.originalColor
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
    } else if (
      percentage > 0.3
    ) {
      this.healthBar.setFillStyle(
        0xfacc15
      );
    } else {
      this.healthBar.setFillStyle(
        0xef4444
      );
    }
  }

  private updateVisualPosition() {
    const radius =
      this.radius;

    this.sprite.setPosition(
      this.x,
      this.y
    );

    this.healthBarBackground.setPosition(
      this.x,
      this.y - radius - 12
    );

    this.healthBar.setPosition(
      this.x - this.healthBarWidth / 2,
      this.y - radius - 12
    );
  }

  isDead() {
    return this.health <= 0;
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

  destroy(
    fromScene?: boolean
  ) {
    if (
      this.sprite &&
      this.sprite.active
    ) {
      this.sprite.destroy();
    }

    this.healthBar.destroy();
    this.healthBarBackground.destroy();

    super.destroy(fromScene);
  }
}