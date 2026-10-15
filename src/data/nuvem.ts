import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

/**
 * Ponte com o Supabase (banco de dados + contas).
 *
 * Liga sozinha quando o arquivo .env tem as duas chaves:
 *   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
 * Sem elas, o app funciona em "modo local": tudo fica salvo só no celular.
 *
 * Toda função aqui devolve { ok, erro } em vez de lançar erro, para a tela mostrar uma mensagem simples.
 */

const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const CHAVE = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  URL && CHAVE
    ? createClient(URL, CHAVE, {
        auth: {
          storage: Platform.OS === 'web' && typeof window === 'undefined' ? undefined : AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;

export const nuvemAtiva = supabase !== null;

export type Resultado<T = undefined> = { ok: true; dados: T } | { ok: false; erro: string };

const ok = <T>(dados: T): Resultado<T> => ({ ok: true, dados });
const falha = (erro: unknown): Resultado<never> => ({ ok: false, erro: traduzir(erro) });

/** Mensagens do Supabase em português simples. */
function traduzir(e: unknown): string {
  const msg = e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : String(e);
  if (/invalid login credentials/i.test(msg)) return 'E-mail ou senha errados.';
  if (/already registered/i.test(msg)) return 'Já existe uma conta com esse e-mail.';
  if (/password should be at least/i.test(msg)) return 'A senha precisa ter pelo menos 8 caracteres.';
  if (/signups? (are|is) disabled|signup.*not allowed/i.test(msg)) return 'Os cadastros estão fechados no momento. Tente de novo mais tarde.';
  if (/rate limit|too many/i.test(msg)) return 'Muitas tentativas seguidas. Espere um minuto e tente de novo.';
  if (/invalid.*email|email.*invalid/i.test(msg)) return 'Confira o e-mail digitado.';
  if (/email not confirmed/i.test(msg)) return 'Confirme o e-mail antes de entrar (veja sua caixa de entrada).';
  if (/network|fetch/i.test(msg)) return 'Sem internet agora. Tente de novo em instantes.';
  return msg || 'Algo deu errado.';
}

export type Papel = 'responsavel' | 'profissional';

export type CriancaNuvem = {
  id: string;
  nome: string;
  nascimento: string | null;
  grau: string | null;
  habitos: string[];
  trilha: string[];
  jogos_por_dia: number;
  niveis: Record<string, number>;
};

// ------------------------------------------------------------------ contas

export async function cadastrarFamilia(p: {
  email: string;
  senha: string;
  nome: string;
  crianca: { nome: string; nascimento: string | null; grau: string | null; habitos: string[] };
  emailProfissional?: string;
}): Promise<Resultado<{ criancaId: string; precisaConfirmar: boolean }>> {
  if (!supabase) return falha('Modo local');
  try {
    const { data, error } = await supabase.auth.signUp({
      email: p.email,
      password: p.senha,
      options: { data: { papel: 'responsavel', nome: p.nome } },
    });
    if (error) throw error;
    // Se o projeto pede confirmação de e-mail, ainda não há sessão: a criança é criada no primeiro login.
    if (!data.session) return ok({ criancaId: '', precisaConfirmar: true });
    const c = await criarCrianca(data.user!.id, p.crianca, p.emailProfissional);
    if (!c.ok) return c;
    return ok({ criancaId: c.dados, precisaConfirmar: false });
  } catch (e) {
    return falha(e);
  }
}

/** Cria a criança do responsável logado (e o convite do profissional, se houver). Devolve o id. */
export async function criarCrianca(
  responsavelId: string,
  crianca: { nome: string; nascimento: string | null; grau: string | null; habitos: string[] },
  emailProfissional?: string,
): Promise<Resultado<string>> {
  if (!supabase) return falha('Modo local');
  const { data: c, error } = await supabase.from('criancas').insert({ responsavel_id: responsavelId, ...crianca }).select('id').single();
  if (error) return falha(error);
  if (emailProfissional) {
    await supabase.from('vinculos').insert({ crianca_id: c.id, origem: 'convite', email_convidado: emailProfissional });
  }
  return ok(c.id as string);
}

export async function cadastrarProfissional(p: {
  email: string;
  senha: string;
  nome: string;
  area: string;
  conselho: string;
  registro: string;
  uf: string;
}): Promise<Resultado<{ precisaConfirmar: boolean }>> {
  if (!supabase) return falha('Modo local');
  try {
    const { email, senha, ...meta } = p;
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { papel: 'profissional', ...meta } },
    });
    if (error) throw error;
    return ok({ precisaConfirmar: !data.session });
  } catch (e) {
    return falha(e);
  }
}

export async function entrarNaNuvem(email: string, senha: string): Promise<Resultado<{ userId: string; papel: Papel; nome: string; crianca: CriancaNuvem | null }>> {
  if (!supabase) return falha('Modo local');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) throw error;
    const { data: perfil, error: e2 } = await supabase.from('perfis').select('papel, nome').eq('id', data.user.id).single();
    if (e2) throw e2;
    let crianca: CriancaNuvem | null = null;
    if (perfil.papel === 'responsavel') {
      const { data: c } = await supabase.from('criancas').select('*').eq('responsavel_id', data.user.id).limit(1).maybeSingle();
      crianca = (c as CriancaNuvem) ?? null;
    }
    return ok({ userId: data.user.id, papel: perfil.papel as Papel, nome: perfil.nome as string, crianca });
  } catch (e) {
    return falha(e);
  }
}

/** Confere a senha sem trocar de conta (usado no "Esqueci o PIN"). */
export async function conferirSenhaNaNuvem(senha: string): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) return false;
  const { error } = await supabase.auth.signInWithPassword({ email: data.user.email, password: senha });
  return !error;
}

export async function sairDaNuvem() {
  await supabase?.auth.signOut();
}

// ------------------------------------------------------------------ dados da criança

export async function atualizarCrianca(id: string, campos: Partial<Omit<CriancaNuvem, 'id'>>): Promise<Resultado> {
  if (!supabase || !id) return falha('Modo local');
  const { error } = await supabase.from('criancas').update(campos).eq('id', id);
  return error ? falha(error) : ok(undefined);
}

export type RegistroNuvem = {
  dia: string;
  atividade: string;
  modulo: string;
  nivel: number;
  acertos: number;
  rodadas: number;
  acertou_de_primeira: boolean;
  tentativas: number;
  ajudas: number;
  segundos: number;
};

export async function enviarRegistros(criancaId: string, lista: RegistroNuvem[]): Promise<Resultado> {
  if (!supabase || !criancaId) return falha('Modo local');
  if (lista.length === 0) return ok(undefined);
  const { error } = await supabase.from('registros').insert(lista.map((r) => ({ crianca_id: criancaId, ...r })));
  return error ? falha(error) : ok(undefined);
}

export async function enviarLicao(criancaId: string, dia: string, sentimento: string | null): Promise<Resultado> {
  if (!supabase || !criancaId) return falha('Modo local');
  const { error } = await supabase.from('licoes').upsert({ crianca_id: criancaId, dia, sentimento });
  return error ? falha(error) : ok(undefined);
}

export async function enviarObservacao(criancaId: string, papel: Papel, texto: string, visivelFamilia: boolean): Promise<Resultado> {
  if (!supabase || !criancaId) return falha('Modo local');
  const { error } = await supabase
    .from('observacoes')
    .insert({ crianca_id: criancaId, autor_papel: papel, texto, visivel_familia: visivelFamilia });
  return error ? falha(error) : ok(undefined);
}

// ------------------------------------------------------------------ profissional

/** Caminho 1: a família convida o profissional pelo e-mail dele. */
export async function convidarProfissional(criancaId: string, email: string): Promise<Resultado> {
  if (!supabase || !criancaId) return falha('Modo local');
  const { error } = await supabase.from('vinculos').insert({ crianca_id: criancaId, origem: 'convite', email_convidado: email });
  return error ? falha(error) : ok(undefined);
}

export async function gerarCodigo(): Promise<Resultado<string>> {
  if (!supabase) return falha('Modo local');
  const { data, error } = await supabase.rpc('gerar_codigo');
  return error ? falha(error) : ok(data as string);
}

export async function usarCodigo(criancaId: string, codigo: string): Promise<Resultado> {
  if (!supabase || !criancaId) return falha('Modo local');
  const { error } = await supabase.rpc('usar_codigo', { c: criancaId, cod: codigo });
  return error ? falha(error) : ok(undefined);
}

export async function decidirVinculo(criancaId: string, status: 'aprovado' | 'recusado' | 'removido'): Promise<Resultado> {
  if (!supabase || !criancaId) return falha('Modo local');
  const de = status === 'removido' ? 'aprovado' : 'pendente';
  const { error } = await supabase.from('vinculos').update({ status }).eq('crianca_id', criancaId).eq('status', de);
  return error ? falha(error) : ok(undefined);
}

export async function salvarTrilhaNaNuvem(criancaId: string, trilha: string[], porDia: number): Promise<Resultado> {
  if (!supabase || !criancaId) return falha('Modo local');
  const { error } = await supabase.rpc('definir_trilha', { c: criancaId, nova_trilha: trilha, por_dia: porDia });
  return error ? falha(error) : ok(undefined);
}

/** Pacientes do profissional (só os aprovados aparecem, por causa das regras do banco). */
export async function listarPacientes(): Promise<Resultado<CriancaNuvem[]>> {
  if (!supabase) return falha('Modo local');
  const { data, error } = await supabase.from('criancas').select('*').order('nome');
  return error ? falha(error) : ok((data ?? []) as CriancaNuvem[]);
}


export async function aceitarMeusConvites(): Promise<number> {
  if (!supabase) return 0;
  const { data } = await supabase.rpc('aceitar_meus_convites');
  return (data as number) ?? 0;
}

export async function meusPedidos(): Promise<{ codigo: string; crianca_nome: string }[]> {
  if (!supabase) return [];
  const { data } = await supabase.rpc('meus_pedidos');
  return (data as { codigo: string; crianca_nome: string }[]) ?? [];
}

export type DadosPaciente = {
  registros: (RegistroNuvem & { id: string })[];
  licoes: { dia: string; sentimento: 'bem' | 'mais' | 'chateado' | null }[];
  observacoes: { id: string; criado_em: string; autor_papel: Papel; texto: string; visivel_familia: boolean }[];
};

/** Tudo que o profissional precisa para ver o relatório de um paciente (últimos 60 dias). */
export async function dadosDoPaciente(criancaId: string, desde: string): Promise<Resultado<DadosPaciente>> {
  if (!supabase) return falha('Modo local');
  const [r, l, o] = await Promise.all([
    supabase.from('registros').select('*').eq('crianca_id', criancaId).gte('dia', desde),
    supabase.from('licoes').select('dia, sentimento').eq('crianca_id', criancaId).gte('dia', desde),
    supabase.from('observacoes').select('*').eq('crianca_id', criancaId).order('criado_em', { ascending: false }),
  ]);
  const erro = r.error ?? l.error ?? o.error;
  if (erro) return falha(erro);
  return ok({ registros: r.data as DadosPaciente['registros'], licoes: l.data as DadosPaciente['licoes'], observacoes: o.data as DadosPaciente['observacoes'] });
}

export async function enviarObservacaoComo(criancaId: string, texto: string, visivelFamilia: boolean) {
  return enviarObservacao(criancaId, 'profissional', texto, visivelFamilia);
}

export type SituacaoFamilia = {
  vinculo: { status: 'pendente' | 'aprovado' | 'recusado' | 'removido'; origem: 'convite' | 'codigo'; codigo: string | null; email: string | null; nomeProfissional: string } | null;
  observacoes: DadosPaciente['observacoes'];
};

/** O que mudou do lado do profissional: situação do vínculo e observações novas. */
export async function situacaoDaFamilia(criancaId: string): Promise<Resultado<SituacaoFamilia>> {
  if (!supabase || !criancaId) return falha('Modo local');
  const [v, o] = await Promise.all([
    supabase.from('vinculos').select('*').eq('crianca_id', criancaId).order('criado_em', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('observacoes').select('*').eq('crianca_id', criancaId).order('criado_em', { ascending: false }),
  ]);
  if (v.error || o.error) return falha(v.error ?? o.error);
  let vinculo: SituacaoFamilia['vinculo'] = null;
  if (v.data) {
    let nomeProfissional = '';
    if (v.data.profissional_id) {
      const p = await supabase.from('perfis').select('nome').eq('id', v.data.profissional_id).maybeSingle();
      nomeProfissional = (p.data?.nome as string) ?? '';
    }
    vinculo = { status: v.data.status, origem: v.data.origem, codigo: v.data.codigo, email: v.data.email_convidado, nomeProfissional };
  }
  return ok({ vinculo, observacoes: (o.data ?? []) as DadosPaciente['observacoes'] });
}
