import Phaser from 'phaser';
import { FONT_DISPLAY, FONT_UI } from '../theme';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.createBackground();
    this.createTitle();
    this.createPlayButton();
  }

  private createBackground() {
    this.add.rectangle(
      550,
      360,
      1100,
      720,
      0x07111f
    );

    for (let i = 0; i < 25; i++) {
      const x =
        Phaser.Math.Between(
          0,
          1100
        );

      const y =
        Phaser.Math.Between(
          0,
          720
        );

      const dot =
        this.add.circle(
          x,
          y,
          Phaser.Math.Between(
            1,
            3
          ),
          0x38bdf8,
          Phaser.Math.FloatBetween(
            0.1,
            0.4
          )
        );

      this.tweens.add({
        targets: dot,

        alpha: {
          from: 0.1,
          to: 0.7
        },

        duration:
          Phaser.Math.Between(
            1000,
            3000
          ),

        yoyo: true,
        repeat: -1
      });
    }
  }

  private createTitle() {
    this.add.text(
      550,
      190,
      'FIREWALL',
      {
        fontFamily: FONT_DISPLAY,
        fontSize: '72px',
        color: '#38bdf8',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    this.add.text(
      550,
      260,
      'LAST LINE',
      {
        fontFamily: FONT_DISPLAY,
        fontSize: '38px',
        color: '#ffffff',
        fontStyle: '600'
      }
    ).setOrigin(0.5);

    this.add.text(
      550,
      320,
      'DEFEND THE CORE',
      {
        fontFamily: FONT_UI,
        fontSize: '18px',
        color: '#64748b',
        fontStyle: 'bold',
        letterSpacing: 5
      }
    ).setOrigin(0.5);

    this.add.text(
      550,
      580,
      'Tower Defense • Digital Warfare',
      {
        fontFamily: FONT_UI,
        fontSize: '16px',
        color: '#475569'
      }
    ).setOrigin(0.5);
  }

  private createPlayButton() {
    const glow =
      this.add.rectangle(
        550,
        440,
        250,
        86,
        0x38bdf8,
        0.15
      );

    const button =
      this.add.rectangle(
        550,
        440,
        220,
        70,
        0x0f3b5c
      );

    button.setStrokeStyle(
      3,
      0x38bdf8
    );

    button.setInteractive({
      useHandCursor: true
    });

    const text =
      this.add.text(
        550,
        440,
        'INITIALIZE',
        {
          fontFamily: FONT_DISPLAY,
          fontSize: '24px',
          color: '#ffffff',
          fontStyle: 'bold'
        }
      );

    text.setOrigin(0.5);

    button.on(
      'pointerover',
      () => {
        button.setFillStyle(
          0x075985
        );

        glow.setAlpha(0.35);

        button.setScale(1.04);
        text.setScale(1.04);
      }
    );

    button.on(
      'pointerout',
      () => {
        button.setFillStyle(
          0x0f3b5c
        );

        glow.setAlpha(0.15);

        button.setScale(1);
        text.setScale(1);
      }
    );

    button.on(
      'pointerdown',
      () => {
        this.cameras.main.fadeOut(
          400,
          0,
          0,
          0
        );

        this.time.delayedCall(
          400,
          () => {
            this.scene.start(
              'GameScene'
            );
          }
        );
      }
    );
  }
}