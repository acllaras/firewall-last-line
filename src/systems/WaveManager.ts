export type EnemyType =
  | 'malware'
  | 'worm'
  | 'trojan';

export interface WaveEnemy {
  type: EnemyType;
  delay: number;
}

export class WaveManager {
  public currentWave: number = 0;

  private readonly waves: WaveEnemy[][] = [
    // WAVE 1
    // Introdução bem tranquila.
    [
      {
        type: 'malware',
        delay: 0
      },
      {
        type: 'malware',
        delay: 1800
      },
      {
        type: 'malware',
        delay: 3600
      }
    ],

    // WAVE 2
    // Mais Malware, mas ainda sem inimigos especiais.
    [
      {
        type: 'malware',
        delay: 0
      },
      {
        type: 'malware',
        delay: 1500
      },
      {
        type: 'malware',
        delay: 2950
      },
      {
        type: 'malware',
        delay: 4450
      }
    ],

    // WAVE 3
    // Primeiro contato com Worm.
    [
      {
        type: 'malware',
        delay: 0
      },
      {
        type: 'worm',
        delay: 1800
      },
      {
        type: 'malware',
        delay: 3450
      },
      {
        type: 'worm',
        delay: 5250
      },
      {
        type: 'malware',
        delay: 6900
      }
    ],

    // WAVE 4
    // Começa a exigir mais defesa de velocidade.
    [
      {
        type: 'worm',
        delay: 0
      },
      {
        type: 'malware',
        delay: 1500
      },
      {
        type: 'malware',
        delay: 2950
      },
      {
        type: 'worm',
        delay: 4600
      },
      {
        type: 'malware',
        delay: 6250
      },
      {
        type: 'worm',
        delay: 7850
      }
    ],

    // WAVE 5
    // Primeiro Trojan.
    [
      {
        type: 'trojan',
        delay: 0
      },
      {
        type: 'malware',
        delay: 2150
      },
      {
        type: 'worm',
        delay: 4100
      },
      {
        type: 'malware',
        delay: 5900
      },
      {
        type: 'worm',
        delay: 7700
      }
    ],

    // WAVE 6
    // Mistura dos três tipos.
    [
      {
        type: 'malware',
        delay: 0
      },
      {
        type: 'worm',
        delay: 1500
      },
      {
        type: 'trojan',
        delay: 3450
      },
      {
        type: 'malware',
        delay: 5750
      },
      {
        type: 'worm',
        delay: 7400
      },
      {
        type: 'malware',
        delay: 9000
      },
      {
        type: 'trojan',
        delay: 11050
      }
    ],

    // WAVE 7 — FINAL
    // Trojan como principal ameaça, com escolta.
    [
      {
        type: 'trojan',
        delay: 0
      },
      {
        type: 'malware',
        delay: 2450
      },
      {
        type: 'worm',
        delay: 4250
      },
      {
        type: 'malware',
        delay: 6250
      },
      {
        type: 'worm',
        delay: 8200
      },
      {
        type: 'trojan',
        delay: 10650
      },
      {
        type: 'malware',
        delay: 13100
      },
      {
        type: 'worm',
        delay: 15150
      },
      {
        type: 'trojan',
        delay: 18050
      }
    ]
  ];

  public getTotalWaves() {
    return this.waves.length;
  }

  public hasNextWave() {
    return (
      this.currentWave <
      this.waves.length
    );
  }

  public startNextWave() {
    if (!this.hasNextWave()) {
      return [];
    }

    const wave =
      this.waves[
        this.currentWave
      ];

    this.currentWave++;

    return wave;
  }
}