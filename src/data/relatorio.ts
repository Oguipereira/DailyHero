import type { Licao, Registro } from '@/state/AppState';
import { diaDe, somarDias } from '@/state/AppState';
import { modulos, type ModuloId } from '@/theme/tokens';

/**
 * Contas dos relatórios. Tudo compara a criança com ela mesma, nunca com outras crianças.
 * A medida principal é "% de acertos de primeira": rodadas acertadas sem errar antes / total de rodadas.
 */

const SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const ORDEM_MODULOS: ModuloId[] = ['hab', 'cog', 'motor', 'ling', 'socio'];

function taxa(lista: Registro[]): number | null {
  const rodadas = lista.reduce((s, r) => s + r.rodadas, 0);
  if (rodadas === 0) return null;
  return Math.round((100 * lista.reduce((s, r) => s + r.acertos, 0)) / rodadas);
}

function rotuloDia(dia: string) {
  const [a, m, d] = dia.split('-').map(Number);
  return SEMANA[new Date(a, m - 1, d).getDay()];
}

export function dataCurta(dia: string) {
  const [, m, d] = dia.split('-');
  return `${rotuloDia(dia)} ${d}/${m}`;
}

/** Últimos N dias (do mais antigo para hoje), com a taxa de cada dia ou null se não teve lição. */
export function acertosPorDia(registros: Registro[], hoje: string, n = 7) {
  return Array.from({ length: n }, (_, i) => {
    const dia = somarDias(hoje, i - (n - 1));
    return { dia, rotulo: rotuloDia(dia), valor: taxa(registros.filter((r) => r.dia === dia)) };
  });
}

/** Taxa por módulo nos últimos `dias` dias. Só entram módulos que já têm dados. */
export function porModulo(registros: Registro[], hoje: string, dias = 28) {
  const desde = somarDias(hoje, -(dias - 1));
  const recentes = registros.filter((r) => r.dia >= desde);
  return ORDEM_MODULOS.flatMap((modulo) => {
    const v = taxa(recentes.filter((r) => r.modulo === modulo));
    return v === null ? [] : [{ modulo, valor: v }];
  });
}

/** Diferença entre as duas últimas semanas, em pontos percentuais (null se faltam dados). */
export function evolucao(registros: Registro[], hoje: string) {
  const esta = taxa(registros.filter((r) => r.dia > somarDias(hoje, -7)));
  const passada = taxa(registros.filter((r) => r.dia <= somarDias(hoje, -7) && r.dia > somarDias(hoje, -14)));
  return esta === null || passada === null ? null : esta - passada;
}

/** Módulos que caíram 15 pontos ou mais nos últimos 3 dias, comparando com os 14 dias anteriores. */
export function quedas(registros: Registro[], hoje: string) {
  const inicioRecente = somarDias(hoje, -2);
  const inicioBase = somarDias(hoje, -16);
  return ORDEM_MODULOS.flatMap((modulo) => {
    const doModulo = registros.filter((r) => r.modulo === modulo);
    const recente = taxa(doModulo.filter((r) => r.dia >= inicioRecente));
    const base = taxa(doModulo.filter((r) => r.dia >= inicioBase && r.dia < inicioRecente));
    return recente !== null && base !== null && base - recente >= 15 ? [{ modulo, queda: base - recente }] : [];
  });
}

export type ResumoDia = {
  dia: string;
  tarefas: number;
  jogos: number;
  minutos: number;
  tentativas: number;
  ajudas: number;
  acertos: number | null;
  sentimento: Licao['sentimento'];
  completa: boolean;
};

/** Um cartão por dia em que houve atividade, do mais novo para o mais antigo. */
export function diaAposDia(registros: Registro[], licoes: Licao[], limite = 14): ResumoDia[] {
  const dias = [...new Set([...registros.map((r) => r.dia), ...licoes.map((l) => l.dia)])].sort().reverse().slice(0, limite);
  return dias.map((dia) => {
    const doDia = registros.filter((r) => r.dia === dia);
    const licao = licoes.find((l) => l.dia === dia);
    return {
      dia,
      tarefas: doDia.filter((r) => r.atividade.startsWith('tarefa')).length,
      jogos: doDia.filter((r) => r.atividade.startsWith('jogo')).length,
      minutos: Math.max(1, Math.round(doDia.reduce((s, r) => s + r.segundos, 0) / 60)),
      tentativas: doDia.reduce((s, r) => s + r.tentativas, 0),
      ajudas: doDia.reduce((s, r) => s + r.ajudas, 0),
      acertos: taxa(doDia),
      sentimento: licao?.sentimento ?? null,
      completa: Boolean(licao),
    };
  });
}

/** Texto para compartilhar com o profissional ou guardar. */
export function textoParaCompartilhar(nome: string, registros: Registro[], licoes: Licao[], hoje = diaDe(new Date())) {
  const mods = porModulo(registros, hoje);
  const evo = evolucao(registros, hoje);
  const dias = diaAposDia(registros, licoes, 7);
  const linhas = [
    `Daily Hero · ${nome} · ${dataCurta(hoje)}`,
    evo === null ? '' : `Acertos de primeira: ${evo >= 0 ? '+' : ''}${evo} pontos em relação à semana passada.`,
    '',
    'Módulos (últimas 4 semanas):',
    ...mods.map((m) => `• ${modulos[m.modulo].nome}: ${m.valor}%`),
    '',
    'Últimos dias:',
    ...dias.map((d) => `• ${dataCurta(d.dia)}: ${d.tarefas} tarefas, ${d.jogos} jogos, ${d.minutos} min, ${d.ajudas} ajudas${d.sentimento ? `, sentiu-se ${d.sentimento}` : ''}`),
  ];
  return linhas.filter((l, i) => l !== '' || linhas[i - 1] !== '').join('\n');
}

/**
 * Registros inventados para mostrar como o relatório fica antes da primeira lição.
 * Nunca são salvos nem enviados: a tela marca claramente "exemplo".
 */
export function registrosDeExemplo(hoje: string): { registros: Registro[]; licoes: Licao[] } {
  const base: Record<ModuloId, number[]> = {
    hab: [70, 75, 72, 80, 82, 85, 88],
    cog: [55, 60, 58, 66, 70, 72, 78],
    motor: [40, 45, 50, 48, 55, 58, 60],
    ling: [45, 44, 50, 52, 48, 55, 50],
    socio: [50, 55, 52, 48, 35, 30, 28],
  };
  const registros: Registro[] = [];
  const licoes: Licao[] = [];
  for (let i = 0; i < 14; i++) {
    const dia = somarDias(hoje, i - 13);
    const k = i % 7;
    if (i === 9) continue; // um dia sem lição, como na vida real
    (Object.keys(base) as ModuloId[]).forEach((modulo) => {
      const acertos = Math.round(base[modulo][k] / 10) - (i < 7 ? 1 : 0);
      registros.push({
        id: `ex-${i}-${modulo}`,
        dia,
        atividade: modulo === 'hab' ? 'tarefa:exemplo' : 'jogo:exemplo',
        modulo,
        nivel: 1,
        acertos: Math.max(0, acertos),
        rodadas: 10,
        acertouDePrimeira: acertos >= 10,
        tentativas: 12 + (k % 3),
        ajudas: modulo === 'socio' ? 2 : k % 2,
        segundos: 120 + 15 * k,
        enviado: true,
      });
    });
    licoes.push({ dia, sentimento: i === 12 ? 'chateado' : i % 4 === 0 ? 'mais' : 'bem', enviado: true });
  }
  return { registros, licoes };
}
