import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as SplashScreen from 'expo-splash-screen';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { HABITOS, jogoPorId, type HabitoId, type JogoId } from '@/data/catalogo';
import * as nuvem from '@/data/nuvem';
import { PIN, SENHA_LOCAL } from '@/data/segredos';
import { proximoNivel, type Nivel, type ResultadoJogo } from '@/jogos/regras';
import type { ModuloId } from '@/theme/tokens';

/**
 * Estado do app.
 * - Fica salvo no celular (AsyncStorage): fechar o app não perde nada.
 * - Se o Supabase estiver configurado (.env), cada lição também sobe para a nuvem,
 *   e o que não subiu (sem internet) fica na fila e tenta de novo depois.
 * - PIN e senha local ficam no cofre do sistema, nunca aqui (ver data/segredos.ts).
 */

export type Sentimento = 'bem' | 'mais' | 'chateado';
export type Papel = nuvem.Papel;

/** Medidas de uma atividade (docs/DECISOES.md → "O que medir"). */
export type Registro = {
  id: string;
  /** Dia no formato AAAA-MM-DD, no fuso do celular. */
  dia: string;
  atividade: string;
  modulo: ModuloId;
  nivel: number;
  /** Rodadas acertadas de primeira e total de rodadas (tarefa de casa = 1 rodada). */
  acertos: number;
  rodadas: number;
  acertouDePrimeira: boolean;
  tentativas: number;
  ajudas: number;
  segundos: number;
  enviado: boolean;
};

export type Licao = { dia: string; sentimento: Sentimento | null; enviado: boolean };

export type Observacao = {
  id: string;
  quando: string;
  autor: Papel;
  texto: string;
  visivelFamilia: boolean;
};

export type StatusProfissional = 'nenhum' | 'convidado' | 'pendente' | 'aprovado' | 'recusado';

export type Ajustes = {
  /** false = sem animações (além do que o celular já pede em "reduzir movimento"). */
  animacoes: boolean;
  /** Lê em voz alta o nome e a dica de cada tarefa. */
  narracao: boolean;
  /** Segundos segurando o X para sair da lição. 0 = só sai ao terminar. */
  sairSeg: 0 | 3 | 5;
};

type Crianca = { idNuvem: string; nome: string; nascimento: string; grau: string | null };

type Salvo = {
  logado: boolean;
  perfil: Papel;
  emailConta: string;
  nomeResponsavel: string;
  nomeProfissionalConta: string;
  crianca: Crianca;
  habitos: HabitoId[];
  trilha: JogoId[];
  jogosPorDia: number;
  niveis: Partial<Record<JogoId, Nivel>>;
  registros: Registro[];
  licoes: Licao[];
  observacoes: Observacao[];
  profissional: { status: StatusProfissional; nome: string; email: string; codigo: string };
  codigoGerado: string;
  temPin: boolean;
  ajustes: Ajustes;
  /** Cadastro feito, esperando a confirmação do e-mail para criar a criança na nuvem. */
  criancaPendente: boolean;
};

type Transitorio = {
  /** Índice da próxima tarefa de casa da lição de hoje. */
  tarefaAtual: number;
  /** Quantos jogos da trilha já foram feitos hoje. */
  jogoAtual: number;
};

type Estado = Salvo & Transitorio;

export type DadosFamilia = {
  nomeResponsavel: string;
  email: string;
  senha: string;
  nomeCrianca: string;
  nascimento: string;
  grau: string | null;
  emailProfissional: string;
};

export type DadosProfissional = {
  nome: string;
  email: string;
  senha: string;
  area: string;
  conselho: string;
  registro: string;
  uf: string;
};

type Acoes = {
  /** Cada uma devolve o erro em texto, ou null se deu certo. */
  entrarComConta: (email: string, senha: string, papel: Papel) => Promise<string | null>;
  cadastrarFamilia: (d: DadosFamilia) => Promise<string | null>;
  cadastrarProfissional: (d: DadosProfissional) => Promise<string | null>;
  sair: () => void;
  apagarTudo: () => Promise<void>;
  definirHabitos: (h: HabitoId[]) => void;
  definirTrilha: (t: JogoId[], porDia: number) => void;
  concluirTarefa: (habito: HabitoId, r: { acertouDePrimeira: boolean; tentativas: number; ajudas: number; segundos: number }) => void;
  concluirJogo: (jogo: JogoId, r: ResultadoJogo) => void;
  concluirLicao: (s: Sentimento | null) => void;
  reiniciarLicao: () => void;
  criarPin: (pin: string) => Promise<void>;
  conferirPin: (pin: string) => Promise<boolean>;
  conferirSenha: (senha: string) => Promise<boolean>;
  convidarProfissional: (email: string) => void;
  usarCodigo: (codigo: string) => Promise<string | null>;
  /** true = aprovar · false = recusar (ou remover, se já estava aprovado) */
  decidirProfissional: (aprovado: boolean) => void;
  gerarCodigo: () => Promise<string>;
  adicionarObservacao: (texto: string, visivelFamilia: boolean) => void;
  mudarAjuste: <K extends keyof Ajustes>(k: K, v: Ajustes[K]) => void;
  /** Busca na nuvem o que o profissional mudou (vínculo, observações). Sem nuvem, não faz nada. */
  atualizarDaNuvem: () => Promise<void>;
};

type Derivados = {
  nuvemAtiva: boolean;
  nomeCrianca: string;
  hoje: string;
  ofensiva: number;
  licaoConcluidaHoje: boolean;
  /** Domingo a sábado da semana atual: lição feita naquele dia? */
  semana: boolean[];
  registrosHoje: Registro[];
  sentimentoHoje: Sentimento | null;
  /** Para as telas: true aprovado · null pedido esperando · false sem acesso. */
  profissionalAprovado: boolean | null;
  pendentesDeEnvio: number;
};

export type App = Estado & Acoes & Derivados;

const CHAVE = 'dailyhero:estado:v1';
const EMAIL = /^\S+@\S+\.\S+$/;

const inicial: Salvo = {
  logado: false,
  perfil: 'responsavel',
  emailConta: '',
  nomeResponsavel: '',
  nomeProfissionalConta: '',
  crianca: { idNuvem: '', nome: 'Theo', nascimento: '', grau: null },
  habitos: ['arrumar', 'dentes', 'banho', 'quarto', 'maos', 'comer', 'comunicar'],
  trilha: ['emocoes', 'memoria', 'figuras'],
  jogosPorDia: 3,
  niveis: {},
  registros: [],
  licoes: [],
  observacoes: [],
  profissional: { status: 'nenhum', nome: '', email: '', codigo: '' },
  codigoGerado: '',
  temPin: false,
  ajustes: { animacoes: true, narracao: true, sairSeg: 3 },
  criancaPendente: false,
};

// ------------------------------------------------------------------ datas

export function diaDe(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dd}`;
}

export function somarDias(dia: string, n: number) {
  const [a, m, d] = dia.split('-').map(Number);
  return diaDe(new Date(a, m - 1, d + n));
}

/** Dias seguidos com lição, contando até hoje (ou até ontem, se hoje ainda não teve). */
function calcularOfensiva(feitos: Set<string>, hoje: string) {
  let dia = feitos.has(hoje) ? hoje : somarDias(hoje, -1);
  let n = 0;
  while (feitos.has(dia)) {
    n++;
    dia = somarDias(dia, -1);
  }
  return n;
}

const novoId = () => Crypto.randomUUID();

/** Nascimento digitado como dd/mm/aaaa → aaaa-mm-dd (ou null se incompleto). */
function nascimentoISO(t: string) {
  const m = t.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

function codigoAleatorio() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'DH-' + Array.from(Crypto.getRandomBytes(4), (b) => letras[b % letras.length]).join('');
}

// ------------------------------------------------------------------ provedor

const Contexto = createContext<App | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [e, setE] = useState<Estado>({ ...inicial, tarefaAtual: 0, jogoAtual: 0 });
  const [carregado, setCarregado] = useState(false);
  const [hoje, setHoje] = useState(() => diaDe(new Date()));
  const ref = useRef(e);
  ref.current = e;
  const enviando = useRef(false);

  // Carrega o que estava salvo.
  useEffect(() => {
    (async () => {
      try {
        const txt = await AsyncStorage.getItem(CHAVE);
        const salvo = txt ? (JSON.parse(txt) as Partial<Salvo>) : {};
        const temPin = await PIN.existe();
        setE((s) => ({ ...s, ...salvo, ajustes: { ...s.ajustes, ...salvo.ajustes }, habitos: habitosValidos(salvo.habitos ?? s.habitos), temPin }));
      } catch {
        // Arquivo corrompido: começa do zero em vez de travar o app.
      } finally {
        setCarregado(true);
      }
      // Só agora a splash sai: a abertura já começa com o logo no mesmo lugar.
      requestAnimationFrame(() => void SplashScreen.hideAsync().catch(() => {}));
    })();
  }, []);

  // Salva a cada mudança (menos o que só vale durante a lição).
  useEffect(() => {
    if (!carregado) return;
    const { tarefaAtual: _t, jogoAtual: _j, ...salvo } = e;
    const t = setTimeout(() => AsyncStorage.setItem(CHAVE, JSON.stringify(salvo)).catch(() => {}), 250);
    return () => clearTimeout(t);
  }, [e, carregado]);

  // Vira o dia sem precisar fechar o app.
  useEffect(() => {
    const t = setInterval(() => setHoje(diaDe(new Date())), 60_000);
    return () => clearInterval(t);
  }, []);

  // Fila de envio para a nuvem: tenta sempre que aparece algo novo.
  const pendentes = e.registros.filter((r) => !r.enviado).length + e.licoes.filter((l) => !l.enviado).length;
  useEffect(() => {
    const id = e.crianca.idNuvem;
    if (!carregado || !nuvem.nuvemAtiva || !id || pendentes === 0 || enviando.current || e.perfil !== 'responsavel') return;
    enviando.current = true;
    (async () => {
      const regs = ref.current.registros.filter((r) => !r.enviado);
      const lics = ref.current.licoes.filter((l) => !l.enviado);
      const r1 = await nuvem.enviarRegistros(
        id,
        regs.map((r) => ({
          dia: r.dia,
          atividade: r.atividade,
          modulo: r.modulo,
          nivel: r.nivel,
          acertos: r.acertos,
          rodadas: r.rodadas,
          acertou_de_primeira: r.acertouDePrimeira,
          tentativas: r.tentativas,
          ajudas: r.ajudas,
          segundos: r.segundos,
        })),
      );
      const licOk: string[] = [];
      for (const l of lics) if ((await nuvem.enviarLicao(id, l.dia, l.sentimento)).ok) licOk.push(l.dia);
      const regOk = new Set(r1.ok ? regs.map((r) => r.id) : []);
      setE((s) => ({
        ...s,
        registros: s.registros.map((r) => (regOk.has(r.id) ? { ...r, enviado: true } : r)),
        licoes: s.licoes.map((l) => (licOk.includes(l.dia) ? { ...l, enviado: true } : l)),
      }));
      enviando.current = false;
    })();
  }, [pendentes, carregado, e.crianca.idNuvem, e.perfil]);

  const acoes = useMemo<Acoes>(() => {
    const atualizar = (f: (s: Estado) => Partial<Estado>) => setE((s) => ({ ...s, ...f(s) }));
    const idNuvem = () => ref.current.crianca.idNuvem;

    return {
      async entrarComConta(email, senha, papel) {
        email = email.trim();
        if (!email || !senha) return 'Preencha o e-mail e a senha.';
        if (nuvem.nuvemAtiva) {
          const r = await nuvem.entrarNaNuvem(email, senha);
          if (!r.ok) return r.erro;
          if (r.dados.papel !== papel) {
            await nuvem.sairDaNuvem();
            return r.dados.papel === 'profissional'
              ? 'Esta é uma conta de profissional. Escolha "Profissional" acima.'
              : 'Esta é uma conta de responsável. Escolha "Responsável" acima.';
          }
          let c = r.dados.crianca;
          const local = ref.current;
          if (papel === 'responsavel' && !c && local.criancaPendente && local.crianca.nome) {
            const criado = await nuvem.criarCrianca(
              r.dados.userId,
              { nome: local.crianca.nome, nascimento: nascimentoISO(local.crianca.nascimento), grau: local.crianca.grau, habitos: local.habitos },
              local.profissional.status === 'convidado' ? local.profissional.email : undefined,
            );
            if (!criado.ok) return criado.erro;
            c = { id: criado.dados, nome: local.crianca.nome, nascimento: nascimentoISO(local.crianca.nascimento), grau: local.crianca.grau, habitos: local.habitos, trilha: local.trilha, jogos_por_dia: local.jogosPorDia, niveis: {} };
          }
          // Outra conta ou outra criança neste celular: o que ficou guardado era de outra família.
          const trocouConta = local.emailConta.toLowerCase() !== email.toLowerCase() || (c ? local.crianca.idNuvem !== c.id && local.crianca.idNuvem !== '' : false);
          if (trocouConta) await PIN.apagar();
          atualizar((s) => ({
            ...(trocouConta ? { registros: [], licoes: [], observacoes: [], niveis: {}, codigoGerado: '', temPin: false, profissional: inicial.profissional } : {}),
            criancaPendente: false,
            logado: true,
            perfil: papel,
            emailConta: email,
            ...(papel === 'responsavel' ? { nomeResponsavel: r.dados.nome } : { nomeProfissionalConta: r.dados.nome }),
            ...(c
              ? {
                  crianca: { idNuvem: c.id, nome: c.nome.split(' ')[0], nascimento: c.nascimento ?? '', grau: c.grau },
                  habitos: c.habitos.length ? habitosValidos(c.habitos) : s.habitos,
                  trilha: c.trilha as JogoId[],
                  jogosPorDia: c.jogos_por_dia,
                  niveis: c.niveis as Salvo['niveis'],
                }
              : {}),
          }));
          return null;
        }
        // Modo local: se já há uma conta com senha neste celular, ela precisa bater.
        const s = ref.current;
        if (s.emailConta && (await SENHA_LOCAL.existe())) {
          const certo = s.emailConta.toLowerCase() === email.toLowerCase() && (await SENHA_LOCAL.conferir(senha));
          if (!certo && papel === 'responsavel') return 'E-mail ou senha errados.';
        }
        atualizar(() => ({ logado: true, perfil: papel, emailConta: s.emailConta || email }));
        return null;
      },

      async cadastrarFamilia(d) {
        if (!d.nomeResponsavel.trim() || !d.nomeCrianca.trim()) return 'Preencha o seu nome e o da criança.';
        if (!EMAIL.test(d.email)) return 'Confira o seu e-mail.';
        if (d.senha.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.';
        if (d.emailProfissional.trim() && !EMAIL.test(d.emailProfissional)) return 'Confira o e-mail do profissional.';
        let idNuvem = '';
        if (nuvem.nuvemAtiva) {
          const r = await nuvem.cadastrarFamilia({
            email: d.email.trim(),
            senha: d.senha,
            nome: d.nomeResponsavel.trim(),
            crianca: { nome: d.nomeCrianca.trim(), nascimento: nascimentoISO(d.nascimento), grau: d.grau, habitos: ref.current.habitos },
            emailProfissional: d.emailProfissional.trim() || undefined,
          });
          if (!r.ok) return r.erro;
          if (r.dados.precisaConfirmar) {
            // Sem sessão ainda: guarda a criança neste celular e cria na nuvem no primeiro login.
            await PIN.apagar();
            setE((s) => ({
              ...s,
              registros: [],
              licoes: [],
              observacoes: [],
              niveis: {},
              temPin: false,
              logado: false,
              perfil: 'responsavel',
              emailConta: d.email.trim(),
              nomeResponsavel: d.nomeResponsavel.trim(),
              crianca: { idNuvem: '', nome: d.nomeCrianca.trim(), nascimento: d.nascimento, grau: d.grau },
              criancaPendente: true,
              profissional: d.emailProfissional.trim()
                ? { status: 'convidado', nome: '', email: d.emailProfissional.trim(), codigo: '' }
                : inicial.profissional,
            }));
            return 'Conta criada! Abra o e-mail que enviamos e toque no link de confirmação (a página que abre depois pode dar erro, tudo bem). Depois entre pelo login.';
          }
          idNuvem = r.dados.criancaId;
        } else {
          await SENHA_LOCAL.salvar(d.senha);
        }
        await PIN.apagar();
        setE({
          ...inicial,
          logado: true,
          perfil: 'responsavel',
          emailConta: d.email.trim(),
          nomeResponsavel: d.nomeResponsavel.trim(),
          crianca: { idNuvem, nome: d.nomeCrianca.trim().split(' ')[0], nascimento: d.nascimento, grau: d.grau },
          profissional: d.emailProfissional.trim()
            ? { status: 'convidado', nome: '', email: d.emailProfissional.trim(), codigo: '' }
            : inicial.profissional,
          temPin: false,
          tarefaAtual: 0,
          jogoAtual: 0,
        });
        return null;
      },

      async cadastrarProfissional(d) {
        if (!d.nome.trim()) return 'Preencha o seu nome.';
        if (!EMAIL.test(d.email)) return 'Confira o e-mail.';
        if (d.senha.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.';
        if (!d.registro.trim() || d.uf.trim().length !== 2) return 'Preencha o número do conselho e a UF.';
        if (nuvem.nuvemAtiva) {
          const r = await nuvem.cadastrarProfissional({ ...d, email: d.email.trim() });
          if (!r.ok) return r.erro;
          if (r.dados.precisaConfirmar) return 'Conta criada! Confirme o e-mail que enviamos e depois entre pelo login.';
        }
        atualizar((s) => ({
          logado: true,
          perfil: 'profissional',
          nomeProfissionalConta: d.nome.trim(),
          // Modo local: o mesmo celular faz os dois papéis, então aceitar o convite da família já libera o acesso.
          profissional:
            s.profissional.status === 'convidado' ? { ...s.profissional, status: 'aprovado', nome: d.nome.trim() } : s.profissional,
        }));
        return null;
      },

      sair() {
        void nuvem.sairDaNuvem();
        atualizar(() => ({ logado: false }));
      },

      async apagarTudo() {
        await AsyncStorage.removeItem(CHAVE);
        await PIN.apagar();
        await SENHA_LOCAL.apagar();
        await nuvem.sairDaNuvem();
        setE({ ...inicial, tarefaAtual: 0, jogoAtual: 0 });
      },

      definirHabitos(habitos) {
        atualizar(() => ({ habitos, tarefaAtual: 0 }));
        void nuvem.atualizarCrianca(idNuvem(), { habitos });
      },

      definirTrilha(trilha, jogosPorDia) {
        atualizar(() => ({ trilha, jogosPorDia }));
        if (ref.current.perfil === 'profissional') void nuvem.salvarTrilhaNaNuvem(idNuvem(), trilha, jogosPorDia);
        else void nuvem.atualizarCrianca(idNuvem(), { trilha, jogos_por_dia: jogosPorDia });
      },

      concluirTarefa(habito, r) {
        const reg: Registro = {
          id: novoId(),
          dia: diaDe(new Date()),
          atividade: `tarefa:${habito}`,
          modulo: 'hab',
          nivel: 1,
          acertos: r.acertouDePrimeira ? 1 : 0,
          rodadas: 1,
          enviado: false,
          ...r,
        };
        atualizar((s) => ({ tarefaAtual: Math.min(s.habitos.length, s.tarefaAtual + 1), registros: [...s.registros, reg] }));
      },

      concluirJogo(jogo, r) {
        const nivel = ref.current.niveis[jogo] ?? 1;
        const novoNivel = proximoNivel(nivel, r);
        const reg: Registro = {
          id: novoId(),
          dia: diaDe(new Date()),
          atividade: `jogo:${jogo}`,
          modulo: jogoPorId(jogo).modulo,
          nivel,
          acertos: r.acertosDePrimeira,
          rodadas: r.rodadas,
          acertouDePrimeira: r.acertosDePrimeira === r.rodadas,
          tentativas: r.tentativas,
          ajudas: r.ajudas,
          segundos: r.segundos,
          enviado: false,
        };
        const niveis = { ...ref.current.niveis, [jogo]: novoNivel };
        atualizar((s) => ({ jogoAtual: s.jogoAtual + 1, registros: [...s.registros, reg], niveis }));
        if (novoNivel !== nivel) void nuvem.atualizarCrianca(idNuvem(), { niveis });
      },

      concluirLicao(sentimento) {
        const dia = diaDe(new Date());
        atualizar((s) => ({ licoes: [...s.licoes.filter((l) => l.dia !== dia), { dia, sentimento, enviado: false }] }));
      },

      reiniciarLicao: () => atualizar(() => ({ tarefaAtual: 0, jogoAtual: 0 })),

      async criarPin(pin) {
        await PIN.salvar(pin);
        atualizar(() => ({ temPin: true }));
      },

      conferirPin: (pin) => PIN.conferir(pin),

      async conferirSenha(senha) {
        if (!senha) return false;
        if (nuvem.nuvemAtiva) return nuvem.conferirSenhaNaNuvem(senha);
        if (await SENHA_LOCAL.existe()) return SENHA_LOCAL.conferir(senha);
        return true; // conta de demonstração, sem senha guardada
      },

      convidarProfissional(email) {
        atualizar(() => ({ profissional: { status: 'convidado', nome: '', email: email.trim(), codigo: '' } }));
        void nuvem.convidarProfissional(idNuvem(), email.trim());
      },

      async usarCodigo(codigo) {
        const cod = codigo.trim().toUpperCase();
        if (!/^DH-[A-Z0-9]{4}$/.test(cod)) return 'O código tem este formato: DH-7K4Q.';
        if (nuvem.nuvemAtiva) {
          const r = await nuvem.usarCodigo(idNuvem(), cod);
          if (!r.ok) return r.erro;
        } else if (ref.current.codigoGerado && cod !== ref.current.codigoGerado) {
          return 'Código não encontrado. Confira com o profissional.';
        }
        atualizar((s) => ({ profissional: { status: 'pendente', nome: s.nomeProfissionalConta || '', email: '', codigo: cod } }));
        return null;
      },

      decidirProfissional(aprovado) {
        const antes = ref.current.profissional.status;
        atualizar((s) => ({ profissional: { ...s.profissional, status: aprovado ? 'aprovado' : 'recusado' } }));
        void nuvem.decidirVinculo(idNuvem(), aprovado ? 'aprovado' : antes === 'aprovado' ? 'removido' : 'recusado');
      },

      async gerarCodigo() {
        if (nuvem.nuvemAtiva) {
          const r = await nuvem.gerarCodigo();
          if (r.ok) {
            atualizar(() => ({ codigoGerado: r.dados }));
            return r.dados;
          }
        }
        const c = ref.current.codigoGerado || codigoAleatorio();
        atualizar(() => ({ codigoGerado: c }));
        return c;
      },

      mudarAjuste: (k, v) => atualizar((s) => ({ ajustes: { ...s.ajustes, [k]: v } })),

      async atualizarDaNuvem() {
        const s = ref.current;
        if (!nuvem.nuvemAtiva || s.perfil !== 'responsavel' || !s.crianca.idNuvem) return;
        const r = await nuvem.situacaoDaFamilia(s.crianca.idNuvem);
        if (!r.ok) return;
        const v = r.dados.vinculo;
        const status: StatusProfissional = !v
          ? 'nenhum'
          : v.status === 'pendente'
            ? v.origem === 'convite'
              ? 'convidado'
              : 'pendente'
            : v.status === 'aprovado'
              ? 'aprovado'
              : 'recusado';
        atualizar(() => ({
          profissional: { status, nome: v?.nomeProfissional ?? '', email: v?.email ?? '', codigo: v?.codigo ?? '' },
          observacoes: r.dados.observacoes.map((o) => ({
            id: o.id,
            quando: o.criado_em,
            autor: o.autor_papel,
            texto: o.texto,
            visivelFamilia: o.visivel_familia,
          })),
        }));
      },

      adicionarObservacao(texto, visivelFamilia) {
        const s = ref.current;
        const o: Observacao = {
          id: novoId(),
          quando: new Date().toISOString(),
          autor: s.perfil,
          texto: texto.trim(),
          // O que a família escreve é sempre visível para os dois.
          visivelFamilia: s.perfil === 'responsavel' ? true : visivelFamilia,
        };
        atualizar((st) => ({ observacoes: [o, ...st.observacoes] }));
        void nuvem.enviarObservacao(s.crianca.idNuvem, s.perfil, o.texto, o.visivelFamilia);
      },
    };
  }, []);

  const derivados = useMemo<Derivados>(() => {
    const feitos = new Set(e.licoes.map((l) => l.dia));
    const domingo = somarDias(hoje, -new Date().getDay());
    const st = e.profissional.status;
    return {
      nuvemAtiva: nuvem.nuvemAtiva,
      nomeCrianca: e.crianca.nome,
      hoje,
      ofensiva: calcularOfensiva(feitos, hoje),
      licaoConcluidaHoje: feitos.has(hoje),
      semana: Array.from({ length: 7 }, (_, i) => feitos.has(somarDias(domingo, i))),
      registrosHoje: e.registros.filter((r) => r.dia === hoje),
      sentimentoHoje: e.licoes.find((l) => l.dia === hoje)?.sentimento ?? null,
      profissionalAprovado: st === 'aprovado' ? true : st === 'pendente' ? null : false,
      pendentesDeEnvio: pendentes,
    };
  }, [e.licoes, e.registros, e.crianca.nome, e.profissional.status, hoje, pendentes]);

  // Enquanto lê o que estava salvo, não mostra nada (é rápido; a abertura vem logo depois).
  if (!carregado) return null;

  return <Contexto.Provider value={{ ...e, ...acoes, ...derivados }}>{children}</Contexto.Provider>;
}

/** Como useApp, mas devolve null fora do provedor (para componentes que também aparecem antes dele). */
export function useAppOpcional() {
  return useContext(Contexto);
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

/** Só hábitos que existem no catálogo (protege contra dados antigos salvos). */
export function habitosValidos(h: string[]): HabitoId[] {
  return h.filter((x): x is HabitoId => HABITOS.some((y) => y.id === x));
}

/** Converte uma linha da tabela registros do Supabase para o formato do app. */
export function registroDaNuvem(x: nuvem.RegistroNuvem & { id: string }): Registro {
  return {
    id: x.id,
    dia: x.dia,
    atividade: x.atividade,
    modulo: x.modulo as ModuloId,
    nivel: x.nivel,
    acertos: x.acertos,
    rodadas: x.rodadas,
    acertouDePrimeira: x.acertou_de_primeira,
    tentativas: x.tentativas,
    ajudas: x.ajudas,
    segundos: x.segundos,
    enviado: true,
  };
}
