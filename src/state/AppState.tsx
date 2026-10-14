import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { HabitoId, JogoId } from '@/data/catalogo';

/**
 * Estado do app guardado só na memória do celular (some ao fechar o app).
 * Na fase 2 isso passa a ser salvo no servidor (Supabase).
 */

export type Sentimento = 'bem' | 'mais' | 'chateado';

/** Medidas de uma atividade (docs/DECISOES.md → "O que medir"). */
export type Registro = {
  atividade: string;
  acertouDePrimeira: boolean;
  tentativas: number;
  ajudas: number;
  segundos: number;
};

type Estado = {
  logado: boolean;
  perfil: 'responsavel' | 'profissional';
  nomeCrianca: string;
  habitos: HabitoId[];
  trilha: JogoId[];
  jogosPorDia: number;
  /** Índice da próxima tarefa de casa da lição de hoje. */
  tarefaAtual: number;
  /** Quantos jogos da trilha já foram feitos hoje. */
  jogoAtual: number;
  licaoConcluidaHoje: boolean;
  ofensiva: number;
  sentimento: Sentimento | null;
  profissionalAprovado: boolean | null;
  registros: Registro[];
};

type Acoes = {
  entrar: (perfil: Estado['perfil']) => void;
  sair: () => void;
  definirHabitos: (h: HabitoId[]) => void;
  definirTrilha: (t: JogoId[], porDia: number) => void;
  concluirTarefa: (r: Registro) => void;
  concluirJogo: (r: Registro) => void;
  concluirLicao: (s: Sentimento | null) => void;
  reiniciarLicao: () => void;
  decidirProfissional: (aprovado: boolean | null) => void;
};

const inicial: Estado = {
  logado: false,
  perfil: 'responsavel',
  nomeCrianca: 'Theo',
  habitos: ['arrumar', 'dentes', 'banho', 'quarto', 'maos', 'comer', 'comunicar'],
  trilha: ['emocoes', 'memoria', 'figuras'],
  jogosPorDia: 3,
  tarefaAtual: 0,
  jogoAtual: 0,
  licaoConcluidaHoje: false,
  ofensiva: 4,
  sentimento: null,
  profissionalAprovado: null,
  registros: [],
};

const Contexto = createContext<(Estado & Acoes) | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [e, setE] = useState<Estado>(inicial);

  const acoes = useMemo<Acoes>(
    () => ({
      entrar: (perfil) => setE((s) => ({ ...s, logado: true, perfil })),
      sair: () => setE((s) => ({ ...s, logado: false })),
      definirHabitos: (habitos) => setE((s) => ({ ...s, habitos, tarefaAtual: 0 })),
      definirTrilha: (trilha, jogosPorDia) => setE((s) => ({ ...s, trilha, jogosPorDia })),
      concluirTarefa: (r) =>
        setE((s) => ({ ...s, tarefaAtual: Math.min(s.habitos.length, s.tarefaAtual + 1), registros: [...s.registros, r] })),
      concluirJogo: (r) =>
        setE((s) => ({ ...s, jogoAtual: s.jogoAtual + 1, registros: [...s.registros, r] })),
      concluirLicao: (sentimento) =>
        setE((s) => ({
          ...s,
          sentimento,
          ofensiva: s.licaoConcluidaHoje ? s.ofensiva : s.ofensiva + 1,
          licaoConcluidaHoje: true,
        })),
      reiniciarLicao: () => setE((s) => ({ ...s, tarefaAtual: 0, jogoAtual: 0 })),
      decidirProfissional: (profissionalAprovado) => setE((s) => ({ ...s, profissionalAprovado })),
    }),
    [],
  );

  return <Contexto.Provider value={{ ...e, ...acoes }}>{children}</Contexto.Provider>;
}

export function useApp() {
  const c = useContext(Contexto);
  if (!c) throw new Error('useApp precisa estar dentro de AppStateProvider');
  return c;
}

/** A trilha de hoje: os jogos escolhidos, cortados na quantidade por dia. */
export function useTrilhaDeHoje() {
  const { trilha, jogosPorDia } = useApp();
  return trilha.slice(0, jogosPorDia);
}
