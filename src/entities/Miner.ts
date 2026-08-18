import Phaser from 'phaser';
import { Defender } from './Defender';

export class Miner extends Defender {
  public energyProduction: number;
  public productionCooldown: number;
  public lastProductionTime: number;

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
      0xfacc15,
      80,
      row,
      column
    );

    // Esconde o círculo original.
    // Ele continua existindo para a lógica do jogo.
    this.setAlpha(0);

    // Cria o sprite visual do Miner.
    this.sprite = scene.add.image(
      x,
      y,
      'miner'
    );

    // Ajusta para caber na célula 70x70.
    this.sprite.setDisplaySize(
      54,
      54
    );

    this.sprite.setDepth(5);

    // Configurações do Miner.
    this.energyProduction = 10;
    this.productionCooldown = 8000;
    this.lastProductionTime = 0;

    this.cost = 100;
  }

  canProduce(currentTime: number) {
    return (
      currentTime -
        this.lastProductionTime >=
      this.productionCooldown
    );
  }

  registerProduction(currentTime: number) {
    this.lastProductionTime =
      currentTime;
  }

  destroy(fromScene?: boolean) {
    // Remove também a imagem quando
    // o Miner for destruído.
    if (
      this.sprite &&
      this.sprite.active
    ) {
      this.sprite.destroy();
    }

    super.destroy(fromScene);
  }
}