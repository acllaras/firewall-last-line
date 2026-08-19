import Phaser from 'phaser';

import { Defender } from '../entities/Defender';

import { Unit } from '../entities/Unit';
import { Miner } from '../entities/Miner';
import { Firewall } from '../entities/Firewall';
import { Cryo } from '../entities/Cryo';
import { Tesla } from '../entities/Tesla';

import { Enemy } from '../entities/Enemy';
import { Worm } from '../entities/Worm';
import { Trojan } from '../entities/Trojan';

import { Projectile } from '../entities/Projectile';
import { CryoProjectile } from '../entities/CryoProjectile';
import { TeslaProjectile } from '../entities/TeslaProjectile';

import { WaveManager } from '../systems/WaveManager';

import type {
  EnemyType,
  WaveEnemy
} from '../systems/WaveManager';

import { FONT_DISPLAY, FONT_UI } from '../theme';

export class GameScene extends Phaser.Scene {
  private readonly rows = 5;
  private readonly columns = 9;

  private readonly cellSize = 70;

  private readonly gridX = 270;
  private readonly gridY = 275;

  private units: Unit[] = [];
  private miners: Miner[] = [];
  private firewalls: Firewall[] = [];
  private cryos: Cryo[] = [];
  private teslas: Tesla[] = [];

  private defenders: Defender[] = [];

  private enemies: Enemy[] = [];

  private projectiles: Projectile[] = [];
  private cryoProjectiles: CryoProjectile[] = [];
  private teslaProjectiles: TeslaProjectile[] = [];

  private occupiedCells: boolean[][] = [];

  private waveManager = new WaveManager();

  private currentWaveEnemies: WaveEnemy[] = [];

  private enemiesToSpawn = 0;
  private enemiesSpawned = 0;

  private waveActive = false;

  private waveText!: Phaser.GameObjects.Text;
  private threatsText!: Phaser.GameObjects.Text;
  private pauseButton!: Phaser.GameObjects.Rectangle;
  private pauseOverlay?: Phaser.GameObjects.Container;
  private unitInfoPanel?: Phaser.GameObjects.Container;
  private placedDefenderPanel?: Phaser.GameObjects.Container;
  private tutorialOverlay?: Phaser.GameObjects.Container;
  private placementPreview?: Phaser.GameObjects.Image;
  private hoveredCell?: {
    row: number;
    column: number;
    x: number;
    y: number;
  };
  private tutorialActive = false;
  private paused = false;

  private audioContext?: AudioContext;
  private sfxEnabled = true;

  private unitCards = new Map<string, {
    button: Phaser.GameObjects.Rectangle;
    icon: Phaser.GameObjects.Image;
    text: Phaser.GameObjects.Text;
    title: Phaser.GameObjects.Text;
    role: Phaser.GameObjects.Text;
    accent: Phaser.GameObjects.Rectangle;
    iconPlate: Phaser.GameObjects.Rectangle;
    cost: number;
    borderColor: number;
  }>();

  private energy = 350;
  private energyText!: Phaser.GameObjects.Text;

  private coreHealth = 3;
  private coreText!: Phaser.GameObjects.Text;

  private gameOver = false;

  private enemiesDefeated = 0;
  private energyGenerated = 0;
  private energyFromCombat = 0;

  private pulseCost = 75;
  private minerCost = 100;
  private firewallCost = 90;
  private cryoCost = 100;
  private teslaCost = 150;

  private selectedUnit: string | null = null;

  constructor() {
    super('GameScene');
  }

  init() {
    this.units = [];
    this.miners = [];
    this.firewalls = [];
    this.cryos = [];
    this.teslas = [];

    this.defenders = [];
    this.enemies = [];

    this.projectiles = [];
    this.cryoProjectiles = [];
    this.teslaProjectiles = [];

    this.occupiedCells = [];

    this.waveManager = new WaveManager();
    this.currentWaveEnemies = [];

    this.enemiesToSpawn = 0;
    this.enemiesSpawned = 0;
    this.waveActive = false;

    this.energy = 280;
    this.coreHealth = 3;

    this.gameOver = false;

    this.enemiesDefeated = 0;
    this.energyGenerated = 0;
    this.energyFromCombat = 0;

    this.paused = false;
    this.selectedUnit = null;

    this.pauseOverlay = undefined;
    this.unitInfoPanel = undefined;
    this.placedDefenderPanel = undefined;
    this.tutorialOverlay = undefined;
    this.placementPreview = undefined;
    this.hoveredCell = undefined;
    this.tutorialActive = false;
    this.unitCards = new Map();
  }

  preload() {
    this.load.image(
      'pulse',
      '/assets/defenders/pulse.png'
    );

    this.load.image(
      'miner',
      '/assets/defenders/miner.png'
    );

    this.load.image(
      'firewall',
      '/assets/defenders/firewall.png'
    );

    this.load.image(
      'cryo',
      '/assets/defenders/cryo.png'
    );

    this.load.image(
      'tesla',
      '/assets/defenders/tesla.png'
    );

    this.load.image(
      'malware',
      '/assets/enemies/malware.png'
    );

    this.load.image(
      'worm',
      '/assets/enemies/worm.png'
    );

    this.load.image(
      'trojan',
      '/assets/enemies/trojan.png'
    );
  }

  create() {
    this.createGameBackground();

    this.createOccupiedCells();
    this.createGrid();
    this.createInterface();

    this.createCoreVisual();
    this.createInvasionZone();
    this.setupPauseControls();

    const tutorialSeen =
      this.registry.get('tutorialSeen') === true;

    if (tutorialSeen) {
      this.startNextWave();
    } else {
      this.showTutorial();
    }
  }

  update(
    time: number,
    delta: number
  ) {
    if (this.gameOver || this.paused || this.tutorialActive) {
      return;
    }

    for (const enemy of [...this.enemies]) {
      this.handleEnemyInteraction(
        enemy,
        time
      );

      enemy.update(
        delta,
        time
      );

      this.checkEnemyReachedCore(
        enemy
      );
    }

    for (const unit of this.units) {
      this.handleUnitAttack(
        unit,
        time
      );
    }

    for (const cryo of this.cryos) {
      this.handleCryoAttack(
        cryo,
        time
      );
    }

    for (const tesla of this.teslas) {
      this.handleTeslaAttack(
        tesla,
        time
      );
    }

    for (const miner of this.miners) {
      this.handleMinerProduction(
        miner,
        time
      );
    }

    for (const projectile of this.projectiles) {
      projectile.update(delta);
    }

    for (const projectile of this.cryoProjectiles) {
      projectile.update(delta);
    }

    for (const projectile of this.teslaProjectiles) {
      projectile.update(delta);
    }

    this.checkProjectileCollisions();
    this.checkCryoProjectileCollisions();
    this.checkTeslaProjectileCollisions();

    this.removeProjectilesOutsideScreen();
    this.removeCryoProjectilesOutsideScreen();
    this.removeTeslaProjectilesOutsideScreen();

    this.checkWaveCompletion();
  }


  private createGameBackground() {
    this.add.rectangle(550, 360, 1100, 720, 0x050a12).setDepth(-20);

    this.add.ellipse(
      550, 420, 940, 430,
      0x0b2235, 0.18
    ).setDepth(-19);

    this.add.rectangle(
      550, 420, 1020, 410,
      0x07101a, 0.96
    )
      .setStrokeStyle(1, 0x23384c, 0.9)
      .setDepth(-10);

    this.add.rectangle(
      550, 420, 996, 392,
      0x08131f, 0.92
    )
      .setStrokeStyle(1, 0x102d44, 0.85)
      .setDepth(-9);

    this.add.rectangle(
      550, 214, 950, 1,
      0x38bdf8, 0.16
    ).setDepth(-8);

    this.add.rectangle(
      550, 626, 950, 1,
      0x38bdf8, 0.10
    ).setDepth(-8);

    this.createCircuitTexture();
  }

  /**
   * Padrão de "trilhas de circuito" bem sutil no fundo do tabuleiro —
   * reforça o tema digital sem competir com o grid de jogo, que fica
   * numa camada acima (depth 0+) com muito mais contraste.
   */
  private createCircuitTexture() {
    const graphics = this.add.graphics().setDepth(-7);
    graphics.lineStyle(1, 0x1c3a52, 0.35);

    const left = 52;
    const right = 1048;
    const top = 224;
    const bottom = 616;
    const step = 46;

    for (let gx = left; gx <= right; gx += step) {
      graphics.beginPath();
      graphics.moveTo(gx, top);
      graphics.lineTo(gx, bottom);
      graphics.strokePath();
    }

    for (let gy = top; gy <= bottom; gy += step) {
      graphics.beginPath();
      graphics.moveTo(left, gy);
      graphics.lineTo(right, gy);
      graphics.strokePath();
    }

    // Nós brilhantes em interseções aleatórias, tipo pontos de solda de PCB.
    const nodesGraphics = this.add.graphics().setDepth(-6);

    for (let i = 0; i < 26; i++) {
      const nx = left + Math.round(Phaser.Math.Between(0, (right - left) / step)) * step;
      const ny = top + Math.round(Phaser.Math.Between(0, (bottom - top) / step)) * step;

      nodesGraphics.fillStyle(0x38bdf8, Phaser.Math.FloatBetween(0.12, 0.3));
      nodesGraphics.fillCircle(nx, ny, 2);
    }
  }


  private createCoreVisual() {
    this.add.rectangle(
      100, 420, 100, 360,
      0x071522, 0.96
    )
      .setStrokeStyle(1, 0x1f5a78, 0.9)
      .setDepth(0);

    this.add.rectangle(
      150, 420, 1, 306,
      0x38bdf8, 0.24
    ).setDepth(1);

    const outer = this.add.circle(
      100, 420, 31,
      0x0b2235, 0.95
    )
      .setStrokeStyle(2, 0x38bdf8, 0.7)
      .setDepth(2);

    const inner = this.add.circle(
      100, 420, 18,
      0x123b52, 0.95
    )
      .setStrokeStyle(1, 0x67e8f9, 0.8)
      .setDepth(3);

    const core = this.add.circle(
      100, 420, 7,
      0x8ee8f8, 1
    ).setDepth(4);

    this.tweens.add({
      targets: [outer, inner],
      alpha: { from: 0.65, to: 1 },
      duration: 1200,
      yoyo: true,
      repeat: -1
    });

    this.tweens.add({
      targets: core,
      scale: { from: 0.85, to: 1.25 },
      alpha: { from: 0.65, to: 1 },
      duration: 850,
      yoyo: true,
      repeat: -1
    });

    this.add.text(
      100, 480, 'CORE',
      {
        fontFamily: FONT_UI,
        fontSize: '10px',
        color: '#72889a',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(3);

    this.add.text(
      100, 500, `${this.coreHealth}/3`,
      {
        fontFamily: FONT_UI,
        fontSize: '18px',
        color: '#67e8f9',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(3);
  }


  private createInvasionZone() {
    this.add.rectangle(
      1000, 420, 100, 360,
      0x18090d, 0.52
    )
      .setStrokeStyle(1, 0x7f1d1d, 0.7)
      .setDepth(-1);

    this.add.rectangle(
      950, 420, 1, 306,
      0xef4444, 0.22
    ).setDepth(0);

    const portalOuter = this.add.rectangle(
      1000, 420, 52, 138,
      0x23080c, 0.9
    )
      .setStrokeStyle(2, 0xef4444, 0.7)
      .setDepth(1);

    const portalInner = this.add.rectangle(
      1000, 420, 32, 104,
      0x4a0a12, 0.62
    )
      .setStrokeStyle(1, 0xfb7185, 0.5)
      .setDepth(2);

    this.tweens.add({
      targets: [portalOuter, portalInner],
      alpha: { from: 0.55, to: 1 },
      duration: 950,
      yoyo: true,
      repeat: -1
    });

    this.add.text(
      1000, 500, 'THREAT',
      {
        fontFamily: FONT_UI,
        fontSize: '10px',
        color: '#c97983',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(2);

    this.add.text(
      1000, 520, 'INCOMING',
      {
        fontFamily: FONT_UI,
        fontSize: '9px',
        color: '#ef4444',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(2);

    this.add.text(
      1000, 545, '‹ ‹ ‹',
      {
        fontFamily: FONT_UI,
        fontSize: '18px',
        color: '#fb7185'
      }
    ).setOrigin(0.5).setDepth(2);
  }

  private createOccupiedCells() {
    this.occupiedCells = Array.from(
      {
        length: this.rows
      },
      () =>
        Array(
          this.columns
        ).fill(false)
    );
  }


  private createGrid() {
    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        const x = this.gridX + column * this.cellSize;
        const y = this.gridY + row * this.cellSize;

        const cell = this.add.rectangle(
          x,
          y,
          this.cellSize - 6,
          this.cellSize - 6,
          0x0e2233,
          0.55
        );

        cell.setStrokeStyle(1, 0x3a7196, 0.85);
        cell.setInteractive({ useHandCursor: true });

        // Cantos em L, estética "tech target" — reforça a leitura de grid.
        const cornerLength = 7;
        const cornerColor = 0x3a7196;
        const cornerAlpha = 0.9;
        const half = (this.cellSize - 6) / 2;

        const corners = [
          [-half, -half, 1, 1],
          [half, -half, -1, 1],
          [-half, half, 1, -1],
          [half, half, -1, -1]
        ] as const;

        const cornerGraphics: Phaser.GameObjects.Graphics[] = [];

        for (const [cx, cy, dx, dy] of corners) {
          const g = this.add.graphics().setDepth(0);
          g.lineStyle(1.5, cornerColor, cornerAlpha);
          g.beginPath();
          g.moveTo(x + cx, y + cy + dy * cornerLength);
          g.lineTo(x + cx, y + cy);
          g.lineTo(x + cx + dx * cornerLength, y + cy);
          g.strokePath();
          cornerGraphics.push(g);
        }

        const node = this.add.circle(
          x,
          y,
          1.6,
          0x5bc7e8,
          0.4
        ).setDepth(-1);

        cell.on('pointerover', () => {
          cell.setFillStyle(0x123049, 0.75);
          cell.setStrokeStyle(1, 0x6fd6f5, 1);
          node.setAlpha(0.9);

          for (const g of cornerGraphics) {
            g.setAlpha(1);
          }

          this.hoveredCell = {
            row,
            column,
            x,
            y
          };

          this.updatePlacementPreview(
            row,
            column,
            x,
            y
          );
        });

        cell.on('pointerout', () => {
          cell.setFillStyle(0x0e2233, 0.55);
          cell.setStrokeStyle(1, 0x3a7196, 0.85);
          node.setAlpha(0.4);

          for (const g of cornerGraphics) {
            g.setAlpha(0.9);
          }

          this.hoveredCell = undefined;
          this.hidePlacementPreview();
        });

        cell.on('pointerdown', () => {
          if (this.gameOver) {
            return;
          }

          this.tryPlaceUnit(
            row,
            column,
            x,
            y
          );
        });
      }
    }
  }

  private createInterface() {
    // ===== HUD SUPERIOR — CLEAN SCI-FI =====
    const hudY = 42;

    // Faixa única, escura e discreta.
    this.add.rectangle(
      550,
      hudY,
      1030,
      62,
      0x050a12,
      0.96
    )
      .setStrokeStyle(1, 0x17324a, 0.7)
      .setDepth(2);

    // Separador inferior sutil.
    this.add.rectangle(
      550,
      73,
      1000,
      1,
      0x38bdf8,
      0.25
    ).setDepth(3);

    const labelStyle = {
      fontFamily: FONT_UI,
      fontSize: '9px',
      color: '#7f93a8',
      fontStyle: 'bold'
    };

    // ENERGY
    this.add.text(55, 25, 'ENERGY', labelStyle).setDepth(4);

    this.energyText = this.add.text(
      55,
      38,
      `⚡ ${this.energy}`,
      {
        fontFamily: FONT_DISPLAY,
        fontSize: '23px',
        color: '#f8d84a',
        fontStyle: 'bold'
      }
    ).setDepth(4);

    // indicador de energia mais minimalista
    this.add.rectangle(
      212,
      47,
      82,
      5,
      0x152231,
      1
    ).setDepth(4);

    this.add.rectangle(
      188,
      47,
      34,
      5,
      0xfacc15,
      0.9
    )
      .setOrigin(0, 0.5)
      .setDepth(5);

    // CORE
    this.add.text(342, 25, 'CORE', labelStyle).setDepth(4);

    this.coreText = this.add.text(
      342,
      38,
      `◈ ${this.coreHealth} / 3`,
      {
        fontFamily: FONT_DISPLAY,
        fontSize: '22px',
        color: '#63dff1',
        fontStyle: 'bold'
      }
    ).setDepth(4);

    // WAVE
    this.add.text(555, 25, 'WAVE', labelStyle).setDepth(4);

    this.waveText = this.add.text(
      555,
      39,
      `00 / ${String(this.waveManager.getTotalWaves()).padStart(2, '0')}`,
      {
        fontFamily: FONT_DISPLAY,
        fontSize: '20px',
        color: '#f3f6f9',
        fontStyle: 'bold'
      }
    ).setDepth(4);

    // Barra de progresso simples.
    this.add.rectangle(
      700,
      49,
      112,
      5,
      0x162333,
      1
    ).setDepth(4);

    this.add.rectangle(
      644,
      49,
      22,
      5,
      0x38bdf8,
      0.85
    )
      .setOrigin(0, 0.5)
      .setDepth(5);

    // THREATS
    this.add.text(
      815,
      25,
      'THREATS',
      {
        ...labelStyle,
        color: '#b9868d'
      }
    ).setDepth(4);

    this.threatsText = this.add.text(
      815,
      39,
      '● 0',
      {
        fontFamily: FONT_DISPLAY,
        fontSize: '19px',
        color: '#fb7185',
        fontStyle: 'bold'
      }
    ).setDepth(4);

    // PAUSE — pequeno e discreto.
    this.pauseButton = this.add.rectangle(
      1028,
      hudY,
      50,
      46,
      0x0a1622,
      0.98
    )
      .setStrokeStyle(1, 0x38bdf8, 0.65)
      .setInteractive({ useHandCursor: true })
      .setDepth(4);

    this.add.text(
      1028,
      hudY,
      'Ⅱ',
      {
        fontFamily: FONT_UI,
        fontSize: '21px',
        color: '#bfe7f7',
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5)
      .setDepth(5);

    this.pauseButton.on('pointerover', () => {
      this.pauseButton.setFillStyle(0x102334);
      this.pauseButton.setStrokeStyle(1, 0x67e8f9, 1);
    });

    this.pauseButton.on('pointerout', () => {
      this.pauseButton.setFillStyle(0x0a1622);
      this.pauseButton.setStrokeStyle(1, 0x38bdf8, 0.65);
    });

    this.pauseButton.on('pointerdown', () => this.togglePause());

    // ===== DEFENSORES — CARDS CLEAN =====
    this.add.rectangle(
      550,
      130,
      1030,
      84,
      0x060c14,
      0.95
    )
      .setStrokeStyle(1, 0x17293a, 0.75)
      .setDepth(1);

    this.createPulseButton();
    this.createMinerButton();
    this.createFirewallButton();
    this.createCryoButton();
    this.createTeslaButton();

    this.updateUnitCardAvailability();
  }

  private createPulseButton() {
      this.createUnitButton(
        147,
        'PULSE',
        this.pulseCost,
        0x1d4ed8,
        0x60a5fa,
        'pulse'
      );
  }

  private createMinerButton() {
      this.createUnitButton(
        348,
        'MINER',
        this.minerCost,
        0xa16207,
        0xfacc15,
        'miner'
      );
  }

  private createFirewallButton() {
      this.createUnitButton(
        550,
        'FIREWALL',
        this.firewallCost,
        0x166534,
        0x22c55e,
        'firewall'
      );
  }

  private createCryoButton() {
      this.createUnitButton(
        752,
        'CRYO',
        this.cryoCost,
        0x0e7490,
        0x22d3ee,
        'cryo'
      );
  }

  private createTeslaButton() {
      this.createUnitButton(
        953,
        'TESLA',
        this.teslaCost,
        0x6b21a8,
        0xc084fc,
        'tesla'
      );
  }


  private createUnitButton(
    x: number,
    name: string,
    cost: number,
    fillColor: number,
    borderColor: number,
    type: string
  ) {
    const cardY = 130;

    // Card neutro: a cor fica só como acento.
    const button = this.add.rectangle(
      x,
      cardY,
      180,
      68,
      0x0a111b,
      0.98
    );

    button.setStrokeStyle(1, 0x233446, 0.9);
    button.setInteractive({ useHandCursor: true });
    button.setDepth(2);

    // Acento inferior moderno.
    const accent = this.add.rectangle(
      x,
      cardY + 32,
      150,
      2,
      borderColor,
      0.8
    ).setDepth(3);

    // Área do ícone.
    const iconPlate = this.add.rectangle(
      x - 55,
      cardY,
      48,
      48,
      fillColor,
      0.11
    )
      .setStrokeStyle(1, borderColor, 0.22)
      .setDepth(3);

    // Cantos em L (mesma linguagem visual do grid) para dar
    // identidade "tech" consistente aos cards.
    const plateHalf = 24;
    const plateCornerLength = 6;
    const plateCorners = [
      [-plateHalf, -plateHalf, 1, 1],
      [plateHalf, -plateHalf, -1, 1],
      [-plateHalf, plateHalf, 1, -1],
      [plateHalf, plateHalf, -1, -1]
    ] as const;

    const plateCornerGraphics = this.add.graphics().setDepth(3);
    plateCornerGraphics.lineStyle(1.3, borderColor, 0.65);

    for (const [cx, cy, dx, dy] of plateCorners) {
      const px = x - 55 + cx;
      const py = cardY + cy;

      plateCornerGraphics.beginPath();
      plateCornerGraphics.moveTo(px, py + dy * plateCornerLength);
      plateCornerGraphics.lineTo(px, py);
      plateCornerGraphics.lineTo(px + dx * plateCornerLength, py);
      plateCornerGraphics.strokePath();
    }

    const icon = this.add.image(
      x - 55,
      cardY,
      type
    );

    icon.setDisplaySize(42, 42);
    icon.setDepth(4);

    const title = this.add.text(
      x - 18,
      cardY - 21,
      name,
      {
        fontFamily: FONT_UI,
        fontSize: '14px',
        color: '#f3f6f9',
        fontStyle: 'bold'
      }
    ).setDepth(4);

    const roles: Record<string, string> = {
      pulse: 'FAST ATTACK',
      miner: 'SUPPORT',
      firewall: 'TANK',
      cryo: 'CONTROL',
      tesla: 'AREA DAMAGE'
    };

    const role = this.add.text(
      x - 18,
      cardY - 1,
      roles[type] ?? '',
      {
        fontFamily: FONT_UI,
        fontSize: '8px',
        color: '#74869a',
        fontStyle: 'bold'
      }
    ).setDepth(4);

    const text = this.add.text(
      x - 18,
      cardY + 15,
      `⚡ ${cost}`,
      {
        fontFamily: FONT_DISPLAY,
        fontSize: '13px',
        color: '#f6d64a',
        fontStyle: 'bold'
      }
    ).setDepth(4);

    this.unitCards.set(type, {
      button,
      icon,
      text,
      title,
      role,
      accent,
      iconPlate,
      cost,
      borderColor
    });

    button.on('pointerover', () => {
      button.setFillStyle(0x101c2a);
      button.setStrokeStyle(1, borderColor, 0.8);
      button.setScale(1.015);

      accent.setAlpha(1);
      iconPlate.setFillStyle(fillColor, 0.18);
      icon.setDisplaySize(45, 45);
      title.setColor('#ffffff');

      this.showUnitInfo(type, x);
    });

    button.on('pointerout', () => {
      const selected = this.selectedUnit === type;

      button.setScale(selected ? 1.01 : 1);
      button.setFillStyle(selected ? 0x102131 : 0x0a111b);
      button.setStrokeStyle(
        1,
        selected ? borderColor : 0x233446,
        selected ? 0.95 : 0.9
      );

      accent.setAlpha(selected ? 1 : 0.8);
      iconPlate.setFillStyle(fillColor, selected ? 0.17 : 0.11);
      icon.setDisplaySize(selected ? 44 : 42, selected ? 44 : 42);
      title.setColor('#f3f6f9');

      this.hideUnitInfo();
    });

    button.on('pointerdown', () => {
      if (this.tutorialActive || this.paused || this.gameOver) {
        return;
      }

      if (this.energy < cost) {
        this.showWarning('INSUFFICIENT ENERGY');
        return;
      }

      this.hidePlacedDefenderPanel();
      this.selectUnit(type);
    });

    return button;
  }


  private updateUnitCardAvailability() {
    for (const [type, card] of this.unitCards.entries()) {
      const affordable =
        this.energy >= card.cost;

      const selected =
        this.selectedUnit === type;

      card.button.setAlpha(
        affordable ? 1 : 0.48
      );

      card.icon.setAlpha(
        affordable ? 1 : 0.3
      );

      card.text.setAlpha(
        affordable ? 1 : 0.5
      );

      card.title.setAlpha(
        affordable ? 1 : 0.5
      );

      card.role.setAlpha(
        affordable ? 1 : 0.38
      );

      card.accent.setAlpha(
        affordable ? 0.95 : 0.22
      );

      card.iconPlate.setAlpha(
        affordable ? 1 : 0.35
      );

      if (!affordable) {
        card.button.setFillStyle(0x060b12);
        card.button.setStrokeStyle(1, 0x334155, 0.45);
        card.icon.setTint(0x64748b);
      } else {
        card.icon.clearTint();
        card.button.setFillStyle(selected ? 0x10273a : 0x091421);
        card.button.setStrokeStyle(
          selected ? 3 : 2,
          card.borderColor,
          selected ? 1 : 0.65
        );
      }
    }
  }

  private getSelectedUnitCost() {
    if (this.selectedUnit === 'pulse') {
      return this.pulseCost;
    }

    if (this.selectedUnit === 'miner') {
      return this.minerCost;
    }

    if (this.selectedUnit === 'firewall') {
      return this.firewallCost;
    }

    if (this.selectedUnit === 'cryo') {
      return this.cryoCost;
    }

    if (this.selectedUnit === 'tesla') {
      return this.teslaCost;
    }

    return 0;
  }

  private updatePlacementPreview(
    row: number,
    column: number,
    x: number,
    y: number
  ) {
    this.hidePlacementPreview();

    if (
      !this.selectedUnit ||
      this.gameOver ||
      this.paused ||
      this.tutorialActive
    ) {
      return;
    }

    const occupied =
      this.occupiedCells[row][column];

    const affordable =
      this.energy >=
      this.getSelectedUnitCost();

    const preview =
      this.add.image(
        x,
        y,
        this.selectedUnit
      );

    preview.setDisplaySize(58, 58);
    preview.setDepth(12);
    preview.setAlpha(
      occupied || !affordable
        ? 0.25
        : 0.48
    );

    if (occupied || !affordable) {
      preview.setTint(0xef4444);
    } else {
      preview.setTint(0x7dd3fc);
    }

    this.placementPreview = preview;
  }

  private hidePlacementPreview() {
    if (this.placementPreview) {
      this.placementPreview.destroy();
      this.placementPreview = undefined;
    }
  }

  private showUnitInfo(
    type: string,
    x: number
  ) {
    this.hideUnitInfo();

    const descriptions: Record<string, string> = {
      pulse: 'PULSE  •  ATK / FAST\nHP 100  •  DMG 25  •  Tiro rápido',
      miner: 'MINER  •  SUPPORT\nHP 80  •  +10 ENERGY a cada 8s',
      firewall: 'FIREWALL  •  TANK\nHP 360  •  Bloqueio de alta resistência',
      cryo: 'CRYO  •  CONTROL\nHP 100  •  DMG 16  •  Slow 50% por 3s',
      tesla: 'TESLA  •  AOE / CHAIN\nHP 120  •  DMG 40  •  24 em área'
    };

    // Posicionado com folga abaixo da faixa de cards (que termina em y=164),
    // para nunca sobrepor os cards vizinhos.
    const panelY = 204;
    const panelHeight = 56;
    const panelTop = panelY - panelHeight / 2;

    // Setinha conectando o tooltip ao card que originou o hover.
    const pointer = this.add.triangle(
      x,
      panelTop - 5,
      0, 8,
      8, 8,
      4, 0,
      0x38bdf8,
      0.9
    ).setDepth(80);

    const background = this.add.rectangle(
      x,
      panelY,
      190,
      panelHeight,
      0x030812,
      0.98
    )
      .setStrokeStyle(1, 0x38bdf8, 0.5)
      .setDepth(80);

    const topLine = this.add.rectangle(
      x,
      panelTop + 2,
      160,
      2,
      0x38bdf8,
      0.5
    ).setDepth(81);

    const label = this.add.text(
      x,
      panelY,
      descriptions[type] ?? '',
      {
        fontFamily: FONT_UI,
        fontSize: '10px',
        color: '#cbd5e1',
        align: 'center',
        fontStyle: 'bold',
        lineSpacing: 5
      }
    )
      .setOrigin(0.5)
      .setDepth(81);

    this.unitInfoPanel = this.add.container(
      0,
      0,
      [pointer, background, topLine, label]
    ).setDepth(80);
  }

  private hideUnitInfo() {
    if (this.unitInfoPanel) {
      this.unitInfoPanel.destroy(true);
      this.unitInfoPanel = undefined;
    }
  }

  private selectUnit(
    type: string
  ) {
    if (this.gameOver) {
      return;
    }

    this.selectedUnit = type;

    for (const [cardType, card] of this.unitCards.entries()) {
      const selected = cardType === type;
      const affordable = this.energy >= card.cost;

      card.button.setScale(selected ? 1.02 : 1);
      card.icon.setDisplaySize(
        selected ? 47 : 44,
        selected ? 47 : 44
      );
      card.text.setScale(selected ? 1.03 : 1);

      if (affordable) {
        card.button.setFillStyle(selected ? 0x10273a : 0x091421);
        card.button.setStrokeStyle(
          selected ? 3 : 2,
          card.borderColor,
          selected ? 1 : 0.65
        );
      }
    }

    this.playSfx('select');

    if (this.hoveredCell) {
      this.updatePlacementPreview(
        this.hoveredCell.row,
        this.hoveredCell.column,
        this.hoveredCell.x,
        this.hoveredCell.y
      );
    }
  }

  private tryPlaceUnit(
    row: number,
    column: number,
    x: number,
    y: number
  ) {
    if (this.tutorialActive || this.paused || this.gameOver) {
      return;
    }

    if (!this.selectedUnit) {
      console.log(
        'Selecione uma unidade primeiro!'
      );

      return;
    }

    if (
      this
        .occupiedCells
        [row][column]
    ) {
      const defender = this.defenders.find(
        item => item.row === row && item.column === column
      );

      if (defender) {
        this.showPlacedDefenderPanel(defender);
      }

      return;
    }

    let defender:
      Defender | null =
      null;

    if (
      this.selectedUnit ===
      'pulse'
    ) {
      if (
        this.energy <
        this.pulseCost
      ) {
        this.showWarning('INSUFFICIENT ENERGY');

        return;
      }

      const unit =
        new Unit(
          this,
          x,
          y,
          row,
          column
        );

      this.units.push(
        unit
      );

      defender = unit;

      this.energy -=
        this.pulseCost;
    }

    if (
      this.selectedUnit ===
      'miner'
    ) {
      if (
        this.energy <
        this.minerCost
      ) {
        this.showWarning('INSUFFICIENT ENERGY');

        return;
      }

      const miner =
        new Miner(
          this,
          x,
          y,
          row,
          column
        );

      this.miners.push(
        miner
      );

      defender = miner;

      this.energy -=
        this.minerCost;
    }

    if (
      this.selectedUnit ===
      'firewall'
    ) {
      if (
        this.energy <
        this.firewallCost
      ) {
        this.showWarning('INSUFFICIENT ENERGY');

        return;
      }

      const firewall =
        new Firewall(
          this,
          x,
          y,
          row,
          column
        );

      this.firewalls.push(
        firewall
      );

      defender =
        firewall;

      this.energy -=
        this.firewallCost;
    }

    if (
      this.selectedUnit ===
      'cryo'
    ) {
      if (
        this.energy <
        this.cryoCost
      ) {
        this.showWarning('INSUFFICIENT ENERGY');

        return;
      }

      const cryo =
        new Cryo(
          this,
          x,
          y,
          row,
          column
        );

      this.cryos.push(
        cryo
      );

      defender = cryo;

      this.energy -=
        this.cryoCost;
    }

    if (
      this.selectedUnit ===
      'tesla'
    ) {
      if (
        this.energy <
        this.teslaCost
      ) {
        this.showWarning('INSUFFICIENT ENERGY');

        return;
      }

      const tesla =
        new Tesla(
          this,
          x,
          y,
          row,
          column
        );

      this.teslas.push(
        tesla
      );

      defender = tesla;

      this.energy -=
        this.teslaCost;
    }

    if (!defender) {
      return;
    }

    this.defenders.push(
      defender
    );

    this.occupiedCells
      [row][column] =
      true;

    this.updateEnergyText();
    this.hidePlacedDefenderPanel();
    this.createPlacementEffect(x, y);
    this.playSfx('place');
    this.updatePlacementPreview(row, column, x, y);
  }


  private showPlacedDefenderPanel(defender: Defender) {
    this.hidePlacedDefenderPanel();

    const info = this.getDefenderInfo(defender);
    const refund = Math.floor(info.cost * 0.5);

    // Painel mais largo e organizado para evitar sobreposição.
    const background = this.add.rectangle(
      550,
      640,
      760,
      108,
      0x050a12,
      0.98
    )
      .setStrokeStyle(1, 0x26384b, 0.9)
      .setDepth(90);

    // Pequeno acento da cor da unidade.
    const accent = this.add.rectangle(
      174,
      640,
      4,
      78,
      info.color,
      0.95
    ).setDepth(91);

    // Base sutil do ícone.
    const iconPlate = this.add.rectangle(
      225,
      640,
      72,
      72,
      0x0a1420,
      1
    )
      .setStrokeStyle(1, info.color, 0.35)
      .setDepth(91);

    const icon = this.add.image(
      225,
      640,
      info.texture
    )
      .setDisplaySize(60, 60)
      .setDepth(92);

    const title = this.add.text(
      285,
      607,
      info.name,
      {
        fontFamily: FONT_UI,
        fontSize: '18px',
        color: '#f8fafc',
        fontStyle: 'bold'
      }
    ).setDepth(92);

    // HP em linha própria.
    const hpText = this.add.text(
      285,
      634,
      `HP  ${defender.health} / ${defender.maxHealth}`,
      {
        fontFamily: FONT_UI,
        fontSize: '12px',
        color: '#cbd5e1',
        fontStyle: 'bold'
      }
    ).setDepth(92);

    // Descrição em linha separada e com largura limitada.
    const description = this.add.text(
      285,
      654,
      info.description,
      {
        fontFamily: FONT_UI,
        fontSize: '11px',
        color: '#8293a6',
        wordWrap: {
          width: 275,
          useAdvancedWrap: true
        }
      }
    ).setDepth(92);

    // Divisor antes da ação de venda.
    const divider = this.add.rectangle(
      615,
      640,
      1,
      70,
      0x26384b,
      0.75
    ).setDepth(91);

    const sellButton = this.add.rectangle(
      705,
      640,
      150,
      54,
      0x16120a,
      1
    )
      .setStrokeStyle(1, 0xfacc15, 0.7)
      .setInteractive({ useHandCursor: true })
      .setDepth(91);

    const sellLabel = this.add.text(
      705,
      626,
      'VENDER',
      {
        fontFamily: FONT_UI,
        fontSize: '10px',
        color: '#a7b2bf',
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5)
      .setDepth(92);

    const sellValue = this.add.text(
      705,
      647,
      `+${refund} ⚡`,
      {
        fontFamily: FONT_DISPLAY,
        fontSize: '15px',
        color: '#f8d84a',
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5)
      .setDepth(92);

    const closeButton = this.add.text(
      915,
      600,
      '×',
      {
        fontFamily: FONT_UI,
        fontSize: '22px',
        color: '#718096'
      }
    )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(92);

    this.placedDefenderPanel = this.add.container(
      0,
      0,
      [
        background,
        accent,
        iconPlate,
        icon,
        title,
        hpText,
        description,
        divider,
        sellButton,
        sellLabel,
        sellValue,
        closeButton
      ]
    ).setDepth(90);

    sellButton.on('pointerover', () => {
      sellButton.setFillStyle(0x241d0c);
      sellButton.setStrokeStyle(1, 0xfde047, 1);
      sellValue.setScale(1.04);
    });

    sellButton.on('pointerout', () => {
      sellButton.setFillStyle(0x16120a);
      sellButton.setStrokeStyle(1, 0xfacc15, 0.7);
      sellValue.setScale(1);
    });

    sellButton.on('pointerdown', () => {
      this.sellDefender(defender, refund);
    });

    closeButton.on('pointerover', () => {
      closeButton.setColor('#e2e8f0');
    });

    closeButton.on('pointerout', () => {
      closeButton.setColor('#718096');
    });

    closeButton.on('pointerdown', () => {
      this.hidePlacedDefenderPanel();
    });
  }


  private getDefenderInfo(defender: Defender) {
    if (defender instanceof Unit) {
      return {
        name: 'PULSE',
        texture: 'pulse',
        cost: this.pulseCost,
        color: 0x60a5fa,
        description: `DMG ${defender.damage} • ataque rápido`
      };
    }

    if (defender instanceof Miner) {
      return {
        name: 'MINER',
        texture: 'miner',
        cost: this.minerCost,
        color: 0xfacc15,
        description: `+${defender.energyProduction} energia / 5s`
      };
    }

    if (defender instanceof Firewall) {
      return {
        name: 'FIREWALL',
        texture: 'firewall',
        cost: this.firewallCost,
        color: 0x22c55e,
        description: 'barreira de alta resistência'
      };
    }

    if (defender instanceof Cryo) {
      return {
        name: 'CRYO',
        texture: 'cryo',
        cost: this.cryoCost,
        color: 0x22d3ee,
        description: `DMG ${defender.damage} • slow 50%`
      };
    }

    return {
      name: 'TESLA',
      texture: 'tesla',
      cost: this.teslaCost,
      color: 0xc084fc,
      description: `DMG ${(defender as Tesla).damage} • dano em área`
    };
  }

  private sellDefender(defender: Defender, refund: number) {
    if (!this.defenders.includes(defender)) {
      this.hidePlacedDefenderPanel();
      return;
    }

    const x = defender.x;
    const y = defender.y;

    this.energy += refund;
    this.updateEnergyText();

    this.destroyDefender(defender);
    this.hidePlacedDefenderPanel();
    this.createSellEffect(x, y, refund);
    this.playSfx('sell');
  }

  private createSellEffect(x: number, y: number, refund: number) {
    const ring = this.add.circle(
      x,
      y,
      18,
      0xfacc15,
      0.18
    ).setDepth(25);

    ring.setStrokeStyle(3, 0xfacc15, 0.9);

    const text = this.add.text(
      x,
      y - 28,
      `+${refund} ENERGY`,
      {
        fontSize: '14px',
        color: '#fde047',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      }
    )
      .setOrigin(0.5)
      .setDepth(26);

    this.tweens.add({
      targets: ring,
      scale: 2.1,
      alpha: 0,
      duration: 400,
      onComplete: () => ring.destroy()
    });

    this.tweens.add({
      targets: text,
      y: y - 65,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy()
    });
  }

  private hidePlacedDefenderPanel() {
    if (this.placedDefenderPanel) {
      this.placedDefenderPanel.destroy(true);
      this.placedDefenderPanel = undefined;
    }
  }

  private createPlacementEffect(x: number, y: number) {
    const ring = this.add.circle(x, y, 18, 0x38bdf8, 0.15).setDepth(18);
    ring.setStrokeStyle(3, 0x7dd3fc, 0.9);
    this.tweens.add({ targets: ring, scale: 2.2, alpha: 0, duration: 350, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
  }

  private showWarning(message: string) {
    const panelWidth = message.length * 8.5 + 48;

    const background = this.add.rectangle(
      550,
      646,
      panelWidth,
      36,
      0x1a0a0a,
      0.95
    )
      .setStrokeStyle(1, 0xef4444, 0.6)
      .setOrigin(0.5)
      .setDepth(79)
      .setAlpha(0);

    const text = this.add.text(
      550,
      646,
      `⚠ ${message}`,
      {
        fontFamily: FONT_UI,
        fontSize: '13px',
        color: '#fca5a5',
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5)
      .setDepth(80)
      .setAlpha(0);

    this.tweens.add({
      targets: [background, text],
      alpha: 1,
      y: '-=10',
      duration: 160,
      yoyo: true,
      hold: 700,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        background.destroy();
        text.destroy();
      }
    });
  }

  private handleMinerProduction(
    miner: Miner,
    time: number
  ) {
    if (
      !miner.canProduce(
        time
      )
    ) {
      return;
    }

    this.energy +=
      miner.energyProduction;

    this.energyGenerated +=
      miner.energyProduction;

    miner.registerProduction(
      time
    );

    this.updateEnergyText();

    this.createMinerEnergyEffect(
      miner
    );

    this.playSfx('miner');
  }

  private createMinerEnergyEffect(
    miner: Miner
  ) {
    const glow =
      this.add.circle(
        miner.x,
        miner.y,
        28,
        0xfacc15,
        0.3
      );

    glow.setDepth(15);

    this.tweens.add({
      targets: glow,

      scale: 1.8,
      alpha: 0,

      duration: 450,

      onComplete: () => {
        glow.destroy();
      }
    });

    const text =
      this.add.text(
        miner.x,
        miner.y - 35,
        `+${miner.energyProduction} ENERGY`,
        {
          fontSize: '16px',
          color: '#fde047',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 3
        }
      );

    text
      .setOrigin(0.5)
      .setDepth(20);

    this.tweens.add({
      targets: text,

      y:
        miner.y - 75,

      alpha: 0,

      duration: 900,

      ease: 'Cubic.easeOut',

      onComplete: () => {
        text.destroy();
      }
    });
  }

  private handleUnitAttack(
    unit: Unit,
    time: number
  ) {
    if (
      !this.hasEnemyAhead(
        unit.row,
        unit.x
      )
    ) {
      return;
    }

    if (
      !unit.canAttack(
        time
      )
    ) {
      return;
    }

    const projectile =
      new Projectile(
        this,
        unit.x + 30,
        unit.y,
        unit.row,
        unit.damage
      );

    this.projectiles.push(
      projectile
    );

    unit.registerAttack(
      time
    );
  }

  private handleCryoAttack(
    cryo: Cryo,
    time: number
  ) {
    if (
      !this.hasEnemyAhead(
        cryo.row,
        cryo.x
      )
    ) {
      return;
    }

    if (
      !cryo.canAttack(
        time
      )
    ) {
      return;
    }

    const projectile =
      new CryoProjectile(
        this,
        cryo.x + 30,
        cryo.y,
        cryo.row,
        cryo.damage,
        cryo.slowMultiplier,
        cryo.slowDuration
      );

    this.cryoProjectiles
      .push(
        projectile
      );

    cryo.registerAttack(
      time
    );
  }

  private handleTeslaAttack(
    tesla: Tesla,
    time: number
  ) {
    if (
      !this.hasEnemyAhead(
        tesla.row,
        tesla.x
      )
    ) {
      return;
    }

    if (
      !tesla.canAttack(
        time
      )
    ) {
      return;
    }

    const projectile =
      new TeslaProjectile(
        this,
        tesla.x + 30,
        tesla.y,
        tesla.row,
        tesla.damage,
        tesla.areaDamage,
        tesla.explosionRadius
      );

    this.teslaProjectiles
      .push(
        projectile
      );

    tesla.registerAttack(
      time
    );
  }

  private hasEnemyAhead(
    row: number,
    x: number
  ) {
    return this.enemies.some(
      enemy =>
        enemy.row ===
          row &&
        enemy.x > x
    );
  }

  private startNextWave() {
    if (
      !this.waveManager
        .hasNextWave()
    ) {
      if (
        !this.gameOver
      ) {
        this.triggerVictory();
      }

      return;
    }

    this.currentWaveEnemies =
      this.waveManager
        .startNextWave();

    this.enemiesToSpawn =
      this
        .currentWaveEnemies
        .length;

    this.enemiesSpawned =
      0;

    this.waveActive =
      true;

    this.updateThreatsText();

    this.waveText.setText(
      `${String(this.waveManager.currentWave).padStart(2, '0')} / ${String(this.waveManager.getTotalWaves()).padStart(2, '0')}`
    );

    this.playSfx('wave');
    this.showWaveAnnouncement();

    this.time.delayedCall(900, () => {
      if (!this.gameOver) this.spawnWaveEnemies();
    });
  }

  private showWaveAnnouncement() {
    const isFinalWave =
      this.waveManager.currentWave ===
      this.waveManager.getTotalWaves();

    if (isFinalWave) {
      this.showFinalWaveAnnouncement();
      return;
    }

    const text = this.add.text(
      550,
      360,
      `WAVE ${this.waveManager.currentWave}\nINCOMING`,
      {
        fontFamily: FONT_UI,
        fontSize: '34px',
        color: '#ffffff',
        align: 'center',
        fontStyle: 'bold',
        stroke: '#0f172a',
        strokeThickness: 7
      }
    )
      .setOrigin(0.5)
      .setDepth(90)
      .setAlpha(0)
      .setScale(0.88);

    this.tweens.add({
      targets: text,
      alpha: 1,
      scale: 1,
      duration: 220,
      yoyo: true,
      hold: 500,
      onComplete: () => text.destroy()
    });
  }

  private showFinalWaveAnnouncement() {
    const flash = this.add.rectangle(
      550,
      360,
      1100,
      720,
      0xef4444,
      0.08
    )
      .setDepth(88)
      .setAlpha(0);

    const lineTop = this.add.rectangle(
      550,
      300,
      520,
      2,
      0xef4444,
      0.9
    )
      .setDepth(91)
      .setAlpha(0);

    const lineBottom = this.add.rectangle(
      550,
      420,
      520,
      2,
      0xef4444,
      0.9
    )
      .setDepth(91)
      .setAlpha(0);

    const alert = this.add.text(
      550,
      325,
      'CRITICAL THREAT',
      {
        fontFamily: FONT_UI,
        fontSize: '15px',
        color: '#fb7185',
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5)
      .setDepth(92)
      .setAlpha(0);

    const title = this.add.text(
      550,
      365,
      'FINAL WAVE',
      {
        fontFamily: FONT_UI,
        fontSize: '42px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#23080c',
        strokeThickness: 7
      }
    )
      .setOrigin(0.5)
      .setDepth(92)
      .setAlpha(0)
      .setScale(0.86);

    const subtitle = this.add.text(
      550,
      402,
      'TROJAN PAYLOAD INBOUND',
      {
        fontFamily: FONT_UI,
        fontSize: '13px',
        color: '#fca5a5',
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5)
      .setDepth(92)
      .setAlpha(0);

    this.cameras.main.shake(260, 0.0035);

    this.tweens.add({
      targets: flash,
      alpha: 1,
      duration: 150,
      yoyo: true,
      hold: 600,
      onComplete: () => flash.destroy()
    });

    this.tweens.add({
      targets: [lineTop, lineBottom, alert, subtitle],
      alpha: 1,
      duration: 220,
      yoyo: true,
      hold: 850,
      onComplete: () => {
        lineTop.destroy();
        lineBottom.destroy();
        alert.destroy();
        subtitle.destroy();
      }
    });

    this.tweens.add({
      targets: title,
      alpha: 1,
      scale: 1,
      duration: 260,
      yoyo: true,
      hold: 850,
      onComplete: () => title.destroy()
    });
  }

  private spawnWaveEnemies() {
    const isFinalWave =
      this.waveManager.currentWave ===
      this.waveManager.getTotalWaves();

    for (
      const [
        index,
        waveEnemy
      ] of
      this.currentWaveEnemies.entries()
    ) {
      this.time.delayedCall(
        waveEnemy.delay,
        () => {
          if (
            this.gameOver
          ) {
            return;
          }

          const isBoss =
            isFinalWave &&
            index ===
              this.currentWaveEnemies.length - 1 &&
            waveEnemy.type === 'trojan';

          this.spawnEnemy(
            waveEnemy.type,
            isBoss
          );

          this.enemiesSpawned++;
          this.updateThreatsText();
        }
      );
    }
  }

  private spawnEnemy(
    type: EnemyType,
    isBoss: boolean = false
  ) {
    const row =
      Phaser.Math.Between(
        0,
        this.rows - 1
      );

    const x =
      this.gridX +
      (this.columns - 1) *
        this.cellSize +
      160;

    const y =
      this.gridY +
      row *
        this.cellSize;

    let enemy: Enemy;

    if (
      type === 'worm'
    ) {
      enemy =
        new Worm(
          this,
          x,
          y,
          row
        );
    } else if (
      type === 'trojan'
    ) {
      enemy =
        new Trojan(
          this,
          x,
          y,
          row
        );
    } else {
      enemy =
        new Enemy(
          this,
          x,
          y,
          row
        );
    }

    if (
      isBoss &&
      enemy instanceof Trojan
    ) {
      enemy.health = 850;
      enemy.maxHealth = 850;

      enemy.baseSpeed = 13;
      enemy.speed = 13;

      enemy.damage = 36;
      enemy.attackCooldown = 700;

      enemy.setScale(1.3);

      this.createBossSpawnEffect(
        enemy.x,
        enemy.y
      );
    }

    this.enemies.push(
      enemy
    );
  }

  private createBossSpawnEffect(
    x: number,
    y: number
  ) {
    const glow = this.add.circle(
      x,
      y,
      42,
      0xef4444,
      0.18
    )
      .setStrokeStyle(
        3,
        0xfb7185,
        0.9
      )
      .setDepth(28);

    const ring = this.add.circle(
      x,
      y,
      66,
      0x000000,
      0
    )
      .setStrokeStyle(
        2,
        0xef4444,
        0.8
      )
      .setDepth(28);

    const label = this.add.text(
      x,
      y - 58,
      'BOSS',
      {
        fontFamily: FONT_UI,
        fontSize: '15px',
        color: '#fb7185',
        fontStyle: 'bold',
        stroke: '#160509',
        strokeThickness: 4
      }
    )
      .setOrigin(0.5)
      .setDepth(30);

    this.cameras.main.shake(
      340,
      0.006
    );

    this.tweens.add({
      targets: glow,
      scale: 2.2,
      alpha: 0,
      duration: 700,
      onComplete: () => glow.destroy()
    });

    this.tweens.add({
      targets: ring,
      scale: 1.8,
      alpha: 0,
      duration: 850,
      onComplete: () => ring.destroy()
    });

    this.tweens.add({
      targets: label,
      y: y - 82,
      alpha: 0,
      duration: 1100,
      ease: 'Cubic.easeOut',
      onComplete: () => label.destroy()
    });
  }

  private checkWaveCompletion() {
    if (
      !this.waveActive
    ) {
      return;
    }

    const allSpawned =
      this.enemiesSpawned >=
      this.enemiesToSpawn;

    const allDestroyed =
      this.enemies.length ===
      0;

    if (
      allSpawned &&
      allDestroyed
    ) {
      this.waveActive =
        false;

      this.updateThreatsText();

      const isFinalWave =
        this.waveManager.currentWave ===
        this.waveManager.getTotalWaves();

      if (!isFinalWave) {
        const waveBonus = 40;

        this.energy += waveBonus;
        this.energyFromCombat += waveBonus;

        this.updateEnergyText();

        this.showWaveClearBonus(
          waveBonus
        );
      }

      this.time.delayedCall(
        isFinalWave ? 1700 : 2400,
        () => {
          if (
            !this.gameOver
          ) {
            this.startNextWave();
          }
        }
      );
    }
  }

  private handleEnemyInteraction(
    enemy: Enemy,
    time: number
  ) {
    enemy.isBlocked =
      false;

    for (
      const defender of
      this.defenders
    ) {
      if (
        defender.row !==
        enemy.row
      ) {
        continue;
      }

      const distance =
        enemy.x -
        defender.x;

      if (
        distance <= 50 &&
        distance >= 0
      ) {
        enemy.isBlocked =
          true;

        if (
          enemy.canAttack(
            time
          )
        ) {
          defender.takeDamage(
            enemy.damage
          );

          this.createDamageNumber(
            defender.x,
            defender.y,
            enemy.damage,
            '#fb7185'
          );

          this.createDefenderHitEffect(
            defender.x,
            defender.y
          );

          this.playSfx('defenderHit');

          enemy.registerAttack(
            time
          );

          if (
            defender.isDead()
          ) {
            this.destroyDefender(
              defender
            );

            enemy.isBlocked =
              false;
          }
        }

        return;
      }
    }
  }

  private checkProjectileCollisions() {
    for (
      const projectile of
      [...this.projectiles]
    ) {
      for (
        const enemy of
        [...this.enemies]
      ) {
        if (
          projectile.row !==
          enemy.row
        ) {
          continue;
        }

        const distance =
          Math.abs(
            projectile.x -
            enemy.x
          );

        if (
          distance <= 30
        ) {
          enemy.takeDamage(
            projectile.damage
          );

          this.createHitEffect(
            enemy.x,
            enemy.y,
            0x38bdf8
          );

          this.createDamageNumber(
            enemy.x,
            enemy.y,
            projectile.damage,
            '#7dd3fc'
          );

          this.playSfx('pulseHit');

          this.destroyProjectile(
            projectile
          );

          if (
            enemy.isDead()
          ) {
            this.destroyEnemy(
              enemy
            );
          }

          break;
        }
      }
    }
  }

  private checkCryoProjectileCollisions() {
    for (
      const projectile of
      [...this.cryoProjectiles]
    ) {
      for (
        const enemy of
        [...this.enemies]
      ) {
        if (
          projectile.row !==
          enemy.row
        ) {
          continue;
        }

        const distance =
          Math.abs(
            projectile.x -
            enemy.x
          );

        if (
          distance <= 30
        ) {
          enemy.takeDamage(
            projectile.damage
          );

          this.createHitEffect(
            enemy.x,
            enemy.y,
            0x67e8f9
          );

          this.createDamageNumber(
            enemy.x,
            enemy.y,
            projectile.damage,
            '#67e8f9'
          );

          this.playSfx('cryoHit');

          enemy.applySlow(
            projectile.slowMultiplier,
            projectile.slowDuration,
            this.time.now
          );

          this.destroyCryoProjectile(
            projectile
          );

          if (
            enemy.isDead()
          ) {
            this.destroyEnemy(
              enemy
            );
          }

          break;
        }
      }
    }
  }

  private checkTeslaProjectileCollisions() {
    for (
      const projectile of
      [...this.teslaProjectiles]
    ) {
      for (
        const targetEnemy of
        [...this.enemies]
      ) {
        if (
          projectile.row !==
          targetEnemy.row
        ) {
          continue;
        }

        const distance =
          Math.abs(
            projectile.x -
            targetEnemy.x
          );

        if (
          distance >
          30
        ) {
          continue;
        }

        targetEnemy.takeDamage(
          projectile.damage
        );

        this.createHitEffect(
          targetEnemy.x,
          targetEnemy.y,
          0xc084fc
        );

        this.createDamageNumber(
          targetEnemy.x,
          targetEnemy.y,
          projectile.damage,
          '#d8b4fe'
        );

        this.playSfx('teslaHit');

        const explosionX =
          targetEnemy.x;

        const explosionY =
          targetEnemy.y;

        this.createTeslaExplosion(
          explosionX,
          explosionY,
          projectile.explosionRadius
        );

        for (
          const nearbyEnemy of
          [...this.enemies]
        ) {
          if (
            nearbyEnemy ===
            targetEnemy
          ) {
            continue;
          }

          const nearbyDistance =
            Phaser.Math.Distance
              .Between(
                explosionX,
                explosionY,
                nearbyEnemy.x,
                nearbyEnemy.y
              );

          if (
            nearbyDistance <=
            projectile
              .explosionRadius
          ) {
            nearbyEnemy.takeDamage(
              projectile.areaDamage
            );

            this.createHitEffect(
              nearbyEnemy.x,
              nearbyEnemy.y,
              0xa855f7
            );

            this.createDamageNumber(
              nearbyEnemy.x,
              nearbyEnemy.y,
              projectile.areaDamage,
              '#c084fc'
            );

            if (
              nearbyEnemy.isDead()
            ) {
              this.destroyEnemy(
                nearbyEnemy
              );
            }
          }
        }

        this.destroyTeslaProjectile(
          projectile
        );

        if (
          targetEnemy.isDead()
        ) {
          this.destroyEnemy(
            targetEnemy
          );
        }

        break;
      }
    }
  }

  private createDamageNumber(
    x: number,
    y: number,
    amount: number,
    color: string
  ) {
    const text = this.add.text(
      x,
      y - 26,
      `-${amount}`,
      {
        fontSize: '16px',
        color,
        fontStyle: 'bold',
        stroke: '#020617',
        strokeThickness: 4
      }
    )
      .setOrigin(0.5)
      .setDepth(45);

    this.tweens.add({
      targets: text,
      y: y - 62,
      alpha: 0,
      scale: 1.15,
      duration: 650,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy()
    });
  }

  private createDefenderHitEffect(
    x: number,
    y: number
  ) {
    const ring = this.add.circle(
      x,
      y,
      26,
      0xfb7185,
      0.1
    )
      .setStrokeStyle(3, 0xfb7185, 0.85)
      .setDepth(35);

    this.tweens.add({
      targets: ring,
      scale: 1.55,
      alpha: 0,
      duration: 230,
      onComplete: () => ring.destroy()
    });
  }

  private playSfx(
    type:
      | 'select'
      | 'place'
      | 'sell'
      | 'miner'
      | 'pulseHit'
      | 'cryoHit'
      | 'teslaHit'
      | 'defenderHit'
      | 'malwareDeath'
      | 'wormDeath'
      | 'trojanDeath'
      | 'core'
      | 'wave'
      | 'victory'
      | 'gameOver'
  ) {
    if (!this.sfxEnabled) {
      return;
    }

    const AudioContextClass =
      window.AudioContext ||
      (window as any).webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    if (!this.audioContext) {
      this.audioContext =
        new AudioContextClass();
    }

    const context =
      this.audioContext;

    if (context.state === 'suspended') {
      void context.resume();
    }

    const sounds: Record<
      string,
      [number, number, number, number]
    > = {
      select: [520, 700, 0.07, 0.025],
      place: [340, 620, 0.11, 0.035],
      sell: [640, 420, 0.12, 0.03],
      miner: [700, 980, 0.13, 0.025],
      pulseHit: [760, 520, 0.06, 0.02],
      cryoHit: [920, 620, 0.09, 0.018],
      teslaHit: [300, 1050, 0.12, 0.025],
      defenderHit: [180, 110, 0.08, 0.022],
      malwareDeath: [260, 90, 0.13, 0.03],
      wormDeath: [220, 65, 0.18, 0.03],
      trojanDeath: [160, 45, 0.24, 0.035],
      core: [130, 50, 0.25, 0.045],
      wave: [420, 780, 0.18, 0.025],
      victory: [520, 1040, 0.32, 0.035],
      gameOver: [220, 55, 0.36, 0.04]
    };

    const [
      startFrequency,
      endFrequency,
      duration,
      volume
    ] = sounds[type];

    const oscillator =
      context.createOscillator();

    const gain =
      context.createGain();

    oscillator.type =
      type === 'teslaHit'
        ? 'sawtooth'
        : type === 'core' ||
          type === 'gameOver'
        ? 'square'
        : 'sine';

    const now =
      context.currentTime;

    oscillator.frequency.setValueAtTime(
      startFrequency,
      now
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(20, endFrequency),
      now + duration
    );

    gain.gain.setValueAtTime(
      volume,
      now
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + duration
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  private createHitEffect(
    x: number,
    y: number,
    color: number
  ) {
    const flash =
      this.add.circle(
        x,
        y,
        18,
        color,
        0.7
      );

    flash.setDepth(20);

    this.tweens.add({
      targets: flash,

      scale: 1.8,
      alpha: 0,

      duration: 180,

      onComplete: () => {
        flash.destroy();
      }
    });
  }

  private createEnemyDeathEffect(
    enemy: Enemy
  ) {
    const x = enemy.x;
    const y = enemy.y;

    let colors = [
      0xef4444,
      0xf97316,
      0xfacc15
    ];

    let particleCount = 10;
    let explosionColor = 0xef4444;
    let explosionScale = 2.5;
    let particleDistance = 80;
    let deathSound:
      | 'malwareDeath'
      | 'wormDeath'
      | 'trojanDeath' =
      'malwareDeath';

    if (enemy instanceof Worm) {
      colors = [
        0x22c55e,
        0x84cc16,
        0xa3e635
      ];

      particleCount = 14;
      explosionColor = 0x22c55e;
      explosionScale = 2.9;
      particleDistance = 95;
      deathSound = 'wormDeath';
    }

    if (enemy instanceof Trojan) {
      colors = [
        0xec4899,
        0xf43f5e,
        0xa855f7
      ];

      particleCount = 20;
      explosionColor = 0xec4899;
      explosionScale = 3.5;
      particleDistance = 120;
      deathSound = 'trojanDeath';

      this.cameras.main.shake(
        130,
        0.004
      );
    }

    this.playSfx(deathSound);

    for (
      let i = 0;
      i < particleCount;
      i++
    ) {
      const particle =
        this.add.rectangle(
          x,
          y,
          Phaser.Math.Between(
            4,
            enemy instanceof Trojan
              ? 11
              : 9
          ),
          Phaser.Math.Between(
            4,
            enemy instanceof Trojan
              ? 11
              : 9
          ),
          Phaser.Utils.Array.GetRandom(
            colors
          )
        );

      particle.setDepth(30);

      const angle =
        Phaser.Math.FloatBetween(
          0,
          Math.PI * 2
        );

      const distance =
        Phaser.Math.Between(
          30,
          particleDistance
        );

      const targetX =
        x +
        Math.cos(angle) *
          distance;

      const targetY =
        y +
        Math.sin(angle) *
          distance;

      this.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0.4,
        rotation:
          Phaser.Math.FloatBetween(
            -2.5,
            2.5
          ),
        duration:
          Phaser.Math.Between(
            320,
            enemy instanceof Trojan
              ? 700
              : 560
          ),
        onComplete: () => {
          particle.destroy();
        }
      });
    }

    const explosion =
      this.add.circle(
        x,
        y,
        enemy instanceof Trojan
          ? 28
          : 20,
        explosionColor,
        0.48
      );

    explosion.setDepth(29);

    this.tweens.add({
      targets: explosion,
      scale: explosionScale,
      alpha: 0,
      duration:
        enemy instanceof Trojan
          ? 430
          : 300,
      onComplete: () => {
        explosion.destroy();
      }
    });
  }

  private createTeslaExplosion(
    x: number,
    y: number,
    radius: number
  ) {
    const explosion =
      this.add.circle(
        x,
        y,
        radius,
        0xc084fc,
        0.25
      );

    this.tweens.add({
      targets:
        explosion,

      alpha: 0,
      scale: 1.3,

      duration: 250,

      onComplete:
        () => {
          explosion.destroy();
        }
    });
  }

  private checkEnemyReachedCore(
    enemy: Enemy
  ) {
    const coreLimit =
      150;

    if (
      enemy.x >
      coreLimit
    ) {
      return;
    }

    this.removeEnemy(enemy);

    this.coreHealth--;
    this.updateCoreText();
    this.createCoreHitEffect();
    this.playSfx('core');

    if (
      this.coreHealth <=
      0
    ) {
      this.triggerGameOver();
    }
  }

  private createCoreHitEffect() {
    this.cameras.main.shake(180, 0.008);
    const flash = this.add.rectangle(550, 360, 1100, 720, 0xef4444, 0.16).setDepth(70);
    const text = this.add.text(100, 330, 'CORE -1', { fontSize: '24px', color: '#f87171', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setDepth(75);
    this.tweens.add({ targets: flash, alpha: 0, duration: 260, onComplete: () => flash.destroy() });
    this.tweens.add({ targets: text, y: 295, alpha: 0, duration: 650, ease: 'Cubic.easeOut', onComplete: () => text.destroy() });
  }

  private updateThreatsText() {
    if (!this.threatsText) {
      return;
    }

    const waitingToSpawn = Math.max(
      0,
      this.enemiesToSpawn - this.enemiesSpawned
    );

    const remaining =
      waitingToSpawn +
      this.enemies.length;

    this.threatsText.setText(
      `☠ ${remaining}`
    );
  }

  private showTutorial() {
    this.hideTutorial();
    this.hidePlacementPreview();
    this.tutorialActive = true;

    const blocker =
      this.add.rectangle(
        550,
        360,
        1100,
        720,
        0x020617,
        0.94
      )
        .setInteractive()
        .setDepth(300);

    const panel =
      this.add.rectangle(
        550,
        355,
        760,
        520,
        0x07111f,
        0.98
      )
        .setStrokeStyle(3, 0x38bdf8)
        .setDepth(301);

    const title =
      this.add.text(
        550,
        145,
        'DEFENSE PROTOCOL',
        {
          fontFamily: FONT_DISPLAY,
          fontSize: '32px',
          color: '#38bdf8',
          fontStyle: 'bold'
        }
      )
        .setOrigin(0.5)
        .setDepth(302);

    const subtitle =
      this.add.text(
        550,
        190,
        'Proteja o Core contra as ameaças digitais.',
        {
          fontFamily: FONT_UI,
          fontSize: '18px',
          color: '#cbd5e1'
        }
      )
        .setOrigin(0.5)
        .setDepth(302);

    // O bloco de instruções é centralizado como um todo: o texto usa
    // origin (0.5, 0) em x=550 (centro do painel), e os ícones são
    // posicionados DEPOIS, com base na largura real do texto já
    // renderizado — nada de coordenadas chutadas.
    const instructions =
      this.add.text(
        550,
        235,
        [
          '1. Selecione um defensor nos cards superiores.',
          '2. Clique em uma célula para posicioná-lo.',
          '3. MINER gera ENERGY para comprar novas unidades.',
          '4. Impeça Malware, Worm e Trojan de chegar ao CORE.',
          '',
          'Dica: P ou ESC pausa a partida.'
        ].join('\n'),
        {
          fontFamily: FONT_UI,
          fontSize: '17px',
          color: '#e2e8f0',
          lineSpacing: 11,
          align: 'left'
        }
      )
        .setOrigin(0.5, 0)
        .setDepth(302);

    const instructionsLeftEdge =
      instructions.x -
      instructions.displayWidth / 2;

    const iconX =
      instructionsLeftEdge -
      44;

    const pulseIcon =
      this.add.image(iconX, 275, 'pulse')
        .setDisplaySize(52, 52)
        .setDepth(302);

    const minerIcon =
      this.add.image(iconX, 375, 'miner')
        .setDisplaySize(52, 52)
        .setDepth(302);

    const startButton =
      this.add.rectangle(
        550,
        535,
        300,
        68,
        0x0f3b5c
      )
        .setStrokeStyle(3, 0x38bdf8)
        .setInteractive({
          useHandCursor: true
        })
        .setDepth(302);

    const startText =
      this.add.text(
        550,
        535,
        'INICIAR DEFESA',
        {
          fontFamily: FONT_DISPLAY,
          fontSize: '18px',
          color: '#ffffff',
          fontStyle: 'bold'
        }
      )
        .setOrigin(0.5)
        .setDepth(303);

    this.tutorialOverlay =
      this.add.container(
        0,
        0,
        [
          blocker,
          panel,
          title,
          subtitle,
          pulseIcon,
          minerIcon,
          instructions,
          startButton,
          startText
        ]
      ).setDepth(300);

    startButton.on('pointerover', () => {
      startButton.setFillStyle(0x075985);
      startButton.setScale(1.03);
      startText.setScale(1.03);
    });

    startButton.on('pointerout', () => {
      startButton.setFillStyle(0x0f3b5c);
      startButton.setScale(1);
      startText.setScale(1);
    });

    startButton.on('pointerdown', () => {
      this.registry.set('tutorialSeen', true);
      this.tutorialActive = false;
      this.hideTutorial();
      this.startNextWave();
    });
  }

  private hideTutorial() {
    if (this.tutorialOverlay) {
      this.tutorialOverlay.destroy(true);
      this.tutorialOverlay = undefined;
    }
  }

  private setupPauseControls() {
    this.input.keyboard?.on(
      'keydown-P',
      () => this.togglePause()
    );

    this.input.keyboard?.on(
      'keydown-ESC',
      () => this.togglePause()
    );

    this.input.keyboard?.on(
      'keydown-M',
      () => {
        this.sfxEnabled =
          !this.sfxEnabled;

        this.showWarning(
          this.sfxEnabled
            ? 'SFX ON'
            : 'SFX OFF'
        );

        if (this.sfxEnabled) {
          this.playSfx('select');
        }
      }
    );
  }

  private togglePause() {
    if (this.gameOver || this.tutorialActive) {
      return;
    }

    this.paused =
      !this.paused;

    if (this.paused) {
      this.time.paused = true;
      this.tweens.pauseAll();
      this.showPauseOverlay();
    } else {
      this.time.paused = false;
      this.tweens.resumeAll();
      this.hidePauseOverlay();
    }
  }

  private showPauseOverlay() {
    this.hidePauseOverlay();
    this.hidePlacedDefenderPanel();

    const background =
      this.add.rectangle(
        550,
        360,
        1100,
        720,
        0x000000,
        0.78
      );

    const title =
      this.add.text(
        550,
        250,
        'SYSTEM PAUSED',
        {
          fontSize: '46px',
          color: '#38bdf8',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);

    const subtitle =
      this.add.text(
        550,
        305,
        'P ou ESC para continuar',
        {
          fontSize: '18px',
          color: '#cbd5e1'
        }
      ).setOrigin(0.5);

    const continueButton =
      this.add.rectangle(
        550,
        390,
        280,
        64,
        0x0f3b5c
      )
        .setStrokeStyle(3, 0x38bdf8)
        .setInteractive({ useHandCursor: true });

    const continueText =
      this.add.text(
        550,
        390,
        'CONTINUAR',
        {
          fontSize: '22px',
          color: '#ffffff',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);

    const menuButton =
      this.add.rectangle(
        550,
        475,
        280,
        58,
        0x3f1d2e
      )
        .setStrokeStyle(2, 0xfb7185)
        .setInteractive({ useHandCursor: true });

    const menuText =
      this.add.text(
        550,
        475,
        'VOLTAR AO MENU',
        {
          fontSize: '18px',
          color: '#ffffff',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);

    this.pauseOverlay =
      this.add.container(
        0,
        0,
        [
          background,
          title,
          subtitle,
          continueButton,
          continueText,
          menuButton,
          menuText
        ]
      ).setDepth(200);

    continueButton.on(
      'pointerdown',
      () => this.togglePause()
    );

    menuButton.on(
      'pointerdown',
      () => {
        this.time.paused = false;
        this.tweens.resumeAll();
        this.paused = false;
        this.scene.start('MenuScene');
      }
    );
  }

  private hidePauseOverlay() {
    if (this.pauseOverlay) {
      this.pauseOverlay.destroy(true);
      this.pauseOverlay = undefined;
    }
  }

  private triggerGameOver() {
    this.gameOver = true;
    this.waveActive = false;

    this.playSfx('gameOver');

    this.showEndScreen(
      'SYSTEM BREACHED',
      'O Core foi comprometido.',
      '#ef4444',
      'TENTAR NOVAMENTE'
    );
  }

  private triggerVictory() {
    this.gameOver = true;
    this.waveActive = false;

    this.playSfx('victory');

    this.showEndScreen(
      'NETWORK SECURED',
      'A última ameaça foi neutralizada.',
      '#22c55e',
      'JOGAR NOVAMENTE'
    );
  }

  private showEndScreen(
    title: string,
    subtitle: string,
    titleColor: string,
    buttonText: string
  ) {
    this.hidePlacedDefenderPanel();
    this.hideUnitInfo();

    // Overlay
    this.add.rectangle(
      550,
      360,
      1100,
      720,
      0x02050a,
      0.9
    ).setDepth(100);

    // Painel central
    this.add.rectangle(
      550,
      360,
      680,
      500,
      0x07101a,
      0.98
    )
      .setStrokeStyle(
        1,
        titleColor === '#22c55e'
          ? 0x22c55e
          : 0xef4444,
        0.7
      )
      .setDepth(101);

    // Acento superior
    this.add.rectangle(
      550,
      112,
      560,
      2,
      titleColor === '#22c55e'
        ? 0x22c55e
        : 0xef4444,
      0.85
    ).setDepth(102);

    this.add.text(
      550,
      155,
      title,
      {
        fontFamily: FONT_UI,
        fontSize: '38px',
        color: titleColor,
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5)
      .setDepth(102);

    this.add.text(
      550,
      198,
      subtitle,
      {
        fontFamily: FONT_UI,
        fontSize: '15px',
        color: '#aebdca'
      }
    )
      .setOrigin(0.5)
      .setDepth(102);

    // MATCH REPORT
    this.add.text(
      550,
      242,
      'MATCH REPORT',
      {
        fontFamily: FONT_UI,
        fontSize: '10px',
        color: '#64748b',
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5)
      .setDepth(102);

    const stats = [
      {
        x: 355,
        label: 'WAVE',
        value:
          `${String(this.waveManager.currentWave).padStart(2, '0')} / ${String(this.waveManager.getTotalWaves()).padStart(2, '0')}`,
        color: '#7dd3fc'
      },
      {
        x: 485,
        label: 'ELIMINADOS',
        value: `${this.enemiesDefeated}`,
        color: '#f8fafc'
      },
      {
        x: 615,
        label: 'ENERGY FINAL',
        value: `${this.energy}`,
        color: '#fde047'
      },
      {
        x: 745,
        label: 'CORE',
        value: `${Math.max(0, this.coreHealth)} / 3`,
        color:
          this.coreHealth > 0
            ? '#67e8f9'
            : '#fb7185'
      }
    ];

    for (const stat of stats) {
      this.add.rectangle(
        stat.x,
        300,
        112,
        82,
        0x0a1420,
        0.96
      )
        .setStrokeStyle(
          1,
          0x26384b,
          0.85
        )
        .setDepth(102);

      this.add.text(
        stat.x,
        281,
        stat.label,
        {
          fontFamily: FONT_UI,
          fontSize: '8px',
          color: '#718096',
          fontStyle: 'bold'
        }
      )
        .setOrigin(0.5)
        .setDepth(103);

      this.add.text(
        stat.x,
        309,
        stat.value,
        {
          fontFamily: FONT_UI,
          fontSize: '19px',
          color: stat.color,
          fontStyle: 'bold'
        }
      )
        .setOrigin(0.5)
        .setDepth(103);
    }

    // Informações secundárias
    this.add.text(
      550,
      365,
      `MINER GEROU  +${this.energyGenerated} ENERGY   •   COMBATE/WAVES  +${this.energyFromCombat} ENERGY`,
      {
        fontFamily: FONT_UI,
        fontSize: '11px',
        color: '#8293a6',
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5)
      .setDepth(102);

    this.createRestartButton(
      buttonText
    );

    this.createMenuButton();
  }

  private createRestartButton(
    text: string
  ) {
    const button =
      this.add.rectangle(
        550,
        440,
        290,
        62,
        0x0f3b5c
      )
        .setDepth(101)
        .setInteractive({
          useHandCursor:
            true
        });

    button.setStrokeStyle(
      3,
      0x38bdf8
    );

    const buttonText =
      this.add.text(
        550,
        440,
        text,
        {
          fontSize: '22px',
          color: '#ffffff',
          fontStyle: 'bold'
        }
      )
        .setOrigin(0.5)
        .setDepth(102);

    button.on(
      'pointerover',
      () => {
        button.setFillStyle(
          0x075985
        );

        button.setScale(
          1.03
        );

        buttonText.setScale(
          1.03
        );
      }
    );

    button.on(
      'pointerout',
      () => {
        button.setFillStyle(
          0x0f3b5c
        );

        button.setScale(
          1
        );

        buttonText.setScale(
          1
        );
      }
    );

    button.on(
      'pointerdown',
      () => {
        this.scene.restart();
      }
    );
  }

  private createMenuButton() {
    const button =
      this.add.rectangle(
        550,
        520,
        250,
        50,
        0x3f1d2e
      )
        .setDepth(101)
        .setStrokeStyle(2, 0xfb7185)
        .setInteractive({ useHandCursor: true });

    const label =
      this.add.text(
        550,
        520,
        'VOLTAR AO MENU',
        {
          fontSize: '17px',
          color: '#ffffff',
          fontStyle: 'bold'
        }
      )
        .setOrigin(0.5)
        .setDepth(102);

    button.on(
      'pointerover',
      () => {
        button.setScale(1.03);
        label.setScale(1.03);
      }
    );

    button.on(
      'pointerout',
      () => {
        button.setScale(1);
        label.setScale(1);
      }
    );

    button.on(
      'pointerdown',
      () => {
        this.time.paused = false;
        this.tweens.resumeAll();
        this.scene.start('MenuScene');
      }
    );
  }

  private destroyDefender(
    defender: Defender
  ) {
    this.occupiedCells
      [defender.row]
      [defender.column] =
      false;

    this.defenders =
      this.defenders.filter(
        item =>
          item !== defender
      );

    if (
      defender instanceof
      Unit
    ) {
      this.units =
        this.units.filter(
          item =>
            item !==
            defender
        );
    }

    if (
      defender instanceof
      Miner
    ) {
      this.miners =
        this.miners.filter(
          item =>
            item !==
            defender
        );
    }

    if (
      defender instanceof
      Firewall
    ) {
      this.firewalls =
        this.firewalls.filter(
          item =>
            item !==
            defender
        );
    }

    if (
      defender instanceof
      Cryo
    ) {
      this.cryos =
        this.cryos.filter(
          item =>
            item !==
            defender
        );
    }

    if (
      defender instanceof
      Tesla
    ) {
      this.teslas =
        this.teslas.filter(
          item =>
            item !==
            defender
        );
    }

    defender.destroy();
  }

  private updateEnergyText() {
    this.energyText.setText(
      `⚡ ${this.energy}`
    );

    this.updateUnitCardAvailability();

    if (this.hoveredCell) {
      this.updatePlacementPreview(
        this.hoveredCell.row,
        this.hoveredCell.column,
        this.hoveredCell.x,
        this.hoveredCell.y
      );
    }
  }

  private updateCoreText() {
    this.coreText.setText(
      `◈ ${this.coreHealth} / 3`
    );
  }

  private destroyProjectile(
    projectile: Projectile
  ) {
    this.projectiles =
      this.projectiles.filter(
        item =>
          item !==
          projectile
      );

    projectile.destroy();
  }

  private destroyCryoProjectile(
    projectile:
      CryoProjectile
  ) {
    this.cryoProjectiles =
      this.cryoProjectiles
        .filter(
          item =>
            item !==
            projectile
        );

    projectile.destroy();
  }

  private destroyTeslaProjectile(
    projectile:
      TeslaProjectile
  ) {
    this.teslaProjectiles =
      this.teslaProjectiles
        .filter(
          item =>
            item !==
            projectile
        );

    projectile.destroy();
  }

  private removeEnemy(enemy: Enemy) {
    this.enemies = this.enemies.filter(item => item !== enemy);
    enemy.destroy();
    this.updateThreatsText();
  }

  private destroyEnemy(
    enemy: Enemy
  ) {
    const reward =
      this.getEnemyEnergyReward(
        enemy
      );

    const rewardX = enemy.x;
    const rewardY = enemy.y;

    this.createEnemyDeathEffect(
      enemy
    );

    this.enemies =
      this.enemies.filter(
        item =>
          item !== enemy
      );

    enemy.destroy();

    this.energy += reward;

    this.enemiesDefeated++;
    this.energyFromCombat += reward;

    this.updateEnergyText();

    this.createEnemyRewardEffect(
      rewardX,
      rewardY,
      reward
    );

    this.updateThreatsText();
  }

  private getEnemyEnergyReward(
    enemy: Enemy
  ) {
    if (enemy instanceof Trojan) {
      return 20;
    }

    if (enemy instanceof Worm) {
      return 15;
    }

    // Malware (Enemy genérico).
    return 10;
  }

  private createEnemyRewardEffect(
    x: number,
    y: number,
    reward: number
  ) {
    const text = this.add.text(
      x,
      y - 42,
      `+${reward} ⚡`,
      {
        fontFamily: FONT_UI,
        fontSize: reward >= 100
          ? '18px'
          : '13px',
        color: reward >= 100
          ? '#fde047'
          : '#facc15',
        fontStyle: 'bold',
        stroke: '#050a12',
        strokeThickness: 4
      }
    )
      .setOrigin(0.5)
      .setDepth(55);

    this.tweens.add({
      targets: text,
      y: y - 78,
      alpha: 0,
      scale: reward >= 100
        ? 1.18
        : 1.04,
      duration: reward >= 100
        ? 1000
        : 720,
      ease: 'Cubic.easeOut',
      onComplete: () =>
        text.destroy()
    });
  }

  private showWaveClearBonus(
    bonus: number
  ) {
    const panel = this.add.rectangle(
      550,
      610,
      250,
      52,
      0x08131f,
      0.94
    )
      .setStrokeStyle(
        1,
        0xfacc15,
        0.55
      )
      .setDepth(85)
      .setAlpha(0);

    const label = this.add.text(
      550,
      600,
      'WAVE SECURED',
      {
        fontFamily: FONT_UI,
        fontSize: '10px',
        color: '#94a3b8',
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5)
      .setDepth(86)
      .setAlpha(0);

    const value = this.add.text(
      550,
      619,
      `+${bonus} ENERGY`,
      {
        fontFamily: FONT_UI,
        fontSize: '16px',
        color: '#fde047',
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5)
      .setDepth(86)
      .setAlpha(0);

    this.tweens.add({
      targets: [
        panel,
        label,
        value
      ],
      alpha: 1,
      duration: 180,
      yoyo: true,
      hold: 1000,
      onComplete: () => {
        panel.destroy();
        label.destroy();
        value.destroy();
      }
    });
  }

  private removeProjectilesOutsideScreen() {
    for (
      const projectile of
      [...this.projectiles]
    ) {
      if (
        projectile.x >
        1150
      ) {
        this.destroyProjectile(
          projectile
        );
      }
    }
  }

  private removeCryoProjectilesOutsideScreen() {
    for (
      const projectile of
      [...this.cryoProjectiles]
    ) {
      if (
        projectile.x >
        1150
      ) {
        this.destroyCryoProjectile(
          projectile
        );
      }
    }
  }

  private removeTeslaProjectilesOutsideScreen() {
    for (
      const projectile of
      [...this.teslaProjectiles]
    ) {
      if (
        projectile.x >
        1150
      ) {
        this.destroyTeslaProjectile(
          projectile
        );
      }
    }
  }
}