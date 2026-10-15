import type { ModuloId } from '@/theme/tokens';

/** Os hábitos que os pais podem escolher (lista do documento de idealização). */
export type HabitoId =
  | 'banho'
  | 'dentes'
  | 'quarto'
  | 'comer'
  | 'brincar'
  | 'higiene'
  | 'maos'
  | 'arrumar'
  | 'comunicar';

export type Comodo = 'Quarto' | 'Banheiro' | 'Sala' | 'Cozinha';

export type Habito = {
  id: HabitoId;
  nome: string;
  comodo: Comodo;
  dica: string;
  /** Os 3 passos que a criança assiste e depois põe em ordem. */
  passos: [string, string, string];
};

export const HABITOS: Habito[] = [
  { id: 'banho', nome: 'Tomar banho', comodo: 'Banheiro', dica: 'Vá até o chuveiro', passos: ['Tirar a roupa', 'Lavar o corpo', 'Secar com a toalha'] },
  { id: 'dentes', nome: 'Escovar os dentes', comodo: 'Banheiro', dica: 'Ande até a pia', passos: ['Pôr a pasta', 'Escovar', 'Enxaguar'] },
  { id: 'quarto', nome: 'Arrumar o quarto', comodo: 'Quarto', dica: 'Arrume a cama e guarde as coisas', passos: ['Esticar o lençol', 'Pôr o travesseiro', 'Guardar as roupas'] },
  { id: 'comer', nome: 'Comer', comodo: 'Cozinha', dica: 'Sente à mesa para comer', passos: ['Sentar à mesa', 'Comer devagar', 'Levar o prato'] },
  { id: 'brincar', nome: 'Brincar', comodo: 'Sala', dica: 'Escolha um brinquedo', passos: ['Pegar o brinquedo', 'Brincar', 'Guardar na caixa'] },
  { id: 'higiene', nome: 'Se higienizar', comodo: 'Banheiro', dica: 'Use o vaso e dê descarga', passos: ['Usar o vaso', 'Dar descarga', 'Lavar as mãos'] },
  { id: 'maos', nome: 'Lavar as mãos', comodo: 'Cozinha', dica: 'Vá até a pia da cozinha', passos: ['Molhar as mãos', 'Passar sabão', 'Enxaguar e secar'] },
  { id: 'arrumar', nome: 'Se arrumar', comodo: 'Quarto', dica: 'Vá até o armário e troque de roupa', passos: ['Pegar a roupa', 'Vestir', 'Calçar o sapato'] },
  { id: 'comunicar', nome: 'Se comunicar com os pais', comodo: 'Sala', dica: 'Vá até o sofá e conte como está', passos: ['Chegar perto', 'Olhar para eles', 'Contar como está'] },
];

export const habitoPorId = (id: HabitoId) => HABITOS.find((h) => h.id === id)!;

/** Jogos da trilha de estímulos. Os 3 primeiros são os da versão 1. */
export type JogoId = 'emocoes' | 'memoria' | 'figuras' | 'associacao' | 'erros' | 'quebra' | 'nomear' | 'organizar';

export type Jogo = { id: JogoId; nome: string; modulo: ModuloId; pronto: boolean };

export const JOGOS: Jogo[] = [
  { id: 'emocoes', nome: 'Jogo das emoções', modulo: 'socio', pronto: true },
  { id: 'memoria', nome: 'Jogo da memória', modulo: 'cog', pronto: true },
  { id: 'figuras', nome: 'Montar figuras', modulo: 'motor', pronto: true },
  { id: 'associacao', nome: 'Jogo de associação', modulo: 'cog', pronto: false },
  { id: 'erros', nome: 'Jogo dos 7 erros', modulo: 'cog', pronto: false },
  { id: 'quebra', nome: 'Quebra-cabeça', modulo: 'motor', pronto: false },
  { id: 'nomear', nome: 'Nomear objetos', modulo: 'ling', pronto: false },
  { id: 'organizar', nome: 'Organizar o dia', modulo: 'hab', pronto: false },
];

export const jogoPorId = (id: JogoId) => JOGOS.find((j) => j.id === id)!;

/** Dados de exemplo para os relatórios enquanto não há banco de dados (fase 2). */
export const RELATORIO_EXEMPLO = {
  acertosSemana: [42, 50, 47, 61, 66, 63, 78],
  diasSemana: ['Qui', 'Sex', 'Sáb', 'Dom', 'Seg', 'Ter', 'Qua'],
  modulos: [
    { modulo: 'hab' as ModuloId, valor: 84 },
    { modulo: 'cog' as ModuloId, valor: 74 },
    { modulo: 'motor' as ModuloId, valor: 55 },
    { modulo: 'ling' as ModuloId, valor: 50 },
    { modulo: 'socio' as ModuloId, valor: 30 },
  ],
};

/** Faixas provisórias de status (docs/DECISOES.md). O profissional poderá ajustar. */
export function statusDoValor(valor: number): 'bem' | 'evolucao' | 'reforco' {
  if (valor >= 70) return 'bem';
  if (valor >= 40) return 'evolucao';
  return 'reforco';
}
