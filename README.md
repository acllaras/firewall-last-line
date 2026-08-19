# 🛡️ Firewall: Last Line

![Gameplay](./gameplay.gif)

Jogo 2D de estratégia (tower defense) em que o jogador protege um sistema digital contra ondas de entidades maliciosas, posicionando programas defensivos em uma grade.

Inspirado na sensação estratégica de jogos como *Plants vs. Zombies*, mas com identidade própria: tema de segurança digital, unidades com nomes técnicos (Pulse, Firewall, Cryo, Tesla, Miner) e inimigos que remetem a malware real (Malware, Worm, Trojan).

## Stack

- [Phaser 4](https://phaser.io/) — motor de jogo
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — dev server e build

## Como rodar

```bash
npm install
npm run dev
```

O terminal vai mostrar um endereço local (algo como `http://localhost:5173`) — abre esse link no navegador.

Para gerar uma build de produção:

```bash
npm run build
```

Os arquivos finais vão para a pasta `dist/`.

## Como jogar

1. Selecione um defensor nos cards no topo da tela.
2. Clique em uma célula da grade para posicioná-lo.
3. O **Miner** gera energia passiva ao longo do tempo para comprar novas unidades.
4. Impeça que os inimigos (Malware, Worm, Trojan) alcancem o Core à esquerda da grade.
5. `P` ou `ESC` pausa a partida.

O jogo tem 7 ondas. Sobreviver a todas elas com o Core intacto (3 de vida) é a vitória.

## Defensores

| Unidade | Papel | Custo | HP | Dano | Cadência | Observações |
|---|---|---|---|---|---|---|
| **Pulse** | Ataque rápido | 75 | 100 | 25 | 1.2s | Referência de custo-benefício em dano puro |
| **Firewall** | Tanque | 90 | 360 | — | — | Bloqueia inimigos na pista, não ataca |
| **Miner** | Suporte | 100 | 80 | — | — | Gera +10 de energia a cada 8s |
| **Cryo** | Controle | 100 | 100 | 16 | 1.5s | Aplica slow de 50% por 3s no alvo |
| **Tesla** | Dano em área | 150 | 120 | 40 (+24 em área, raio 90) | 2.2s | Melhor contra grupos de inimigos |

## Inimigos

| Inimigo | HP | Velocidade | Dano | Recompensa ao morrer |
|---|---|---|---|---|
| **Malware** | 140 | 32 | 13 | +10 energia |
| **Worm** | 85 | 52 | 9 | +15 energia |
| **Trojan** | 380 | 18 | 25 | +20 energia |
| **Boss** (onda final) | 850 | 13 | 36 | +20 energia |

## Economia

- Energia inicial: **280**
- Bônus fixo ao concluir cada onda: **+40 energia**
- Recompensa por abate: varia por tipo de inimigo (ver tabela acima)
- Renda passiva: apenas via **Miner** (a fonte de energia mais forte do jogo — construir economia demais no início compensa mais que gastar tudo em ataque)

## Estrutura do projeto

```
src/
├── entities/       # Defensores, inimigos e projéteis
├── scenes/         # MenuScene e GameScene (toda a lógica de jogo)
├── systems/        # WaveManager (definição das 7 ondas)
├── theme.ts        # Fontes e paleta de cores centralizadas
└── style.css
public/
└── assets/         # Sprites de defensores e inimigos
```

## Status

Protótipo jogável e balanceado através de várias rodadas de playtesting. Áudio (efeitos sonoros e trilha) ainda não implementado — próximo passo natural para reforçar a sensação de jogo "pronto".
