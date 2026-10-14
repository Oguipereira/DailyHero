/**
 * Regras dos jogos num lugar só (docs/DECISOES.md).
 * Nível 1 = o mais fácil. Por enquanto toda criança começa no nível 1;
 * depois o nível sobe ou desce sozinho conforme o desempenho (proximoNivel).
 */
export const REGRAS = {
  emocoes: { rodadas: 5, opcoesPorNivel: { 1: 2, 2: 3, 3: 3 } },
  memoria: { cartasPorNivel: { 1: 4, 2: 6, 3: 8 } },
  figuras: { rodadas: 3, pecasPorNivel: { 1: 2, 2: 4, 3: 6 } },
  /** Segundos parado até a dica aparecer sozinha (conta como "ajuda"). */
  dicaAutomaticaSeg: 12,
} as const;

export type Nivel = 1 | 2 | 3;

export type ResultadoJogo = {
  acertosDePrimeira: number;
  rodadas: number;
  tentativas: number;
  ajudas: number;
  segundos: number;
};

/** Embaralha uma lista (Fisher–Yates). */
export function embaralhar<T>(lista: T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Nível adaptativo: sobe quando a criança acerta quase tudo de primeira sem ajuda,
 * desce quando erra muito. Assim o jogo não fica fácil demais nem frustrante.
 */
export function proximoNivel(atual: number, r: ResultadoJogo): Nivel {
  const taxa = r.acertosDePrimeira / Math.max(1, r.rodadas);
  let n = atual;
  if (taxa >= 0.8 && r.ajudas === 0) n = atual + 1;
  else if (taxa < 0.4) n = atual - 1;
  return Math.min(3, Math.max(1, n)) as Nivel;
}
