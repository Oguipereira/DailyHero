/**
 * Tokens de design do Daily Hero.
 * Tudo aqui vem do canvas de telas (cores do logo, fontes e medidas).
 * Use sempre estes valores em vez de escrever cores soltas nas telas.
 */

export const cores = {
  // Área dos adultos (fundo claro)
  fundo: '#F5F5FC',
  superficie: '#FFFFFF',
  borda: '#E3E3F2',
  texto: '#1C1B3A',
  textoSuave: '#56567A',

  // Cor principal: o roxo-azulado do arco do logo
  primaria: '#4B4FE0',
  primariaEscura: '#3337B8',
  primariaClara: '#ECECFD',

  // Estrela do logo: recompensas, ofensiva e o botão PLAY
  ouro: '#FFB21E',
  ouroClaro: '#FFD83D',
  ouroEscuro: '#E08A00',

  // Lição (modo criança, pixel art)
  licaoFundo: '#1E1B4B',
  licaoSuperficie: '#2E2A66',
  licaoBorda: '#0F0D33',
  licaoTextoSuave: '#C9C6F2',
} as const;

/** Uma cor por módulo de estímulo: fundo claro + cor de texto que passa no contraste. */
export const modulos = {
  hab: { nome: 'Hábitos e rotina', fundo: '#DFF7EF', tinta: '#0D6650' },
  cog: { nome: 'Cognitivo e memória', fundo: '#E1F4FC', tinta: '#0B5878' },
  socio: { nome: 'Socioemocional', fundo: '#F1EAFE', tinta: '#5B2DB8' },
  motor: { nome: 'Motor fino e coordenação', fundo: '#EEF8DC', tinta: '#46650F' },
  ling: { nome: 'Linguagem e comunicação', fundo: '#FFF2D4', tinta: '#8A5000' },
} as const;

export type ModuloId = keyof typeof modulos;

/** Status de um módulo nos relatórios. */
export const status = {
  bem: { rotulo: 'Bem', fundo: '#DFF7EF', tinta: '#0D6650', barra: '#2DBE93' },
  evolucao: { rotulo: 'Em evolução', fundo: '#FFF2D4', tinta: '#8A5000', barra: '#FFB21E' },
  reforco: { rotulo: 'Precisa reforço', fundo: '#FCE6F1', tinta: '#9C1F63', barra: '#D9468F' },
} as const;

/** Nomes das fontes, como foram carregadas no _layout. */
export const fontes = {
  titulo: 'Fredoka_600SemiBold',
  texto: 'Nunito_600SemiBold',
  textoForte: 'Nunito_800ExtraBold',
  pixel: 'PixelifySans_700Bold',
} as const;

export const raio = { pequeno: 12, medio: 18, grande: 24, pilula: 999 } as const;

export const espaco = { xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 28 } as const;

/** Área mínima de toque (acessibilidade): 44 pontos. */
export const TOQUE_MINIMO = 44;
