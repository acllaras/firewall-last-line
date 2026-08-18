/**
 * Tema visual central do jogo.
 *
 * FONT_DISPLAY  -> títulos, números grandes de HUD (Energy, Core, Wave, Threats),
 *                  custo das unidades. Fonte tech/geométrica, dá o "peso" sci-fi.
 * FONT_UI       -> labels, descrições, tooltips, botões. Mais legível em tamanho pequeno.
 */
export const FONT_DISPLAY = "'Orbitron', 'Arial', sans-serif";
export const FONT_UI = "'Chakra Petch', 'Arial', sans-serif";

export const COLORS = {
  background: 0x050a12,
  panel: 0x08131f,
  panelBorder: 0x17324a,

  gridCellFill: 0x0e2233,
  gridCellFillHover: 0x123049,
  gridCellStroke: 0x3a7196,
  gridCellStrokeHover: 0x6fd6f5,
  gridNode: 0x5bc7e8,

  accentCyan: 0x38bdf8,
  accentCyanBright: 0x67e8f9,

  energy: 0xf8d84a,
  core: 0x63dff1,
  threat: 0xfb7185,

  textPrimary: '#f3f6f9',
  textMuted: '#7f93a8'
};
