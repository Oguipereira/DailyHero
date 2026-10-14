/**
 * Regras dos jogos num lugar só (docs/DECISOES.md).
 * Nível 1 = o mais fácil. Por enquanto toda criança começa no nível 1;
 * na fase 4 o nível passa a subir ou descer conforme o desempenho.
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
