import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Tela } from '@/components/Tela';
import { Aviso, BotaoIcone, Segmentado, Selo, Texto } from '@/components/ui';
import * as nuvem from '@/data/nuvem';
import { quedas } from '@/data/relatorio';
import { diaDe, registroDaNuvem, somarDias, useApp, type Registro } from '@/state/AppState';
import { cores, fontes, modulos } from '@/theme/tokens';

type Filtro = 'todos' | 'atencao' | 'sem';

type Paciente = {
  id: string;
  nome: string;
  idade: string;
  ofensiva: number;
  diasSemLicao: number;
  alerta: string;
};

const CORES = [
  { fundo: '#E1F4FC', tinta: '#0B5878' },
  { fundo: '#EEF8DC', tinta: '#46650F' },
  { fundo: '#FFF2D4', tinta: '#8A5000' },
  { fundo: '#F1EAFE', tinta: '#5B2DB8' },
];

/** "7 anos" a partir de dd/mm/aaaa ou aaaa-mm-dd. */
function idade(nascimento: string | null) {
  if (!nascimento) return '';
  const iso = nascimento.includes('/') ? nascimento.split('/').reverse().join('-') : nascimento;
  const [a, m, d] = iso.split('-').map(Number);
  if (!a || !m || !d) return '';
  const h = new Date();
  let anos = h.getFullYear() - a;
  if (h.getMonth() + 1 < m || (h.getMonth() + 1 === m && h.getDate() < d)) anos--;
  return anos >= 0 && anos < 30 ? `${anos} anos` : '';
}

/** Resume um paciente a partir dos dias com lição e dos registros. */
function resumir(id: string, nome: string, nasc: string | null, diasComLicao: string[], registros: Registro[]): Paciente {
  const hoje = diaDe(new Date());
  const feitos = new Set(diasComLicao);
  let ofensiva = 0;
  for (let d = feitos.has(hoje) ? hoje : somarDias(hoje, -1); feitos.has(d); d = somarDias(d, -1)) ofensiva++;
  let diasSemLicao = 0;
  while (diasSemLicao < 30 && !feitos.has(somarDias(hoje, -diasSemLicao))) diasSemLicao++;
  const q = quedas(registros, hoje)[0];
  return { id, nome, idade: idade(nasc), ofensiva, diasSemLicao, alerta: q ? `${modulos[q.modulo].nome} precisa reforço` : '' };
}

/** Painel do profissional: uma conta, várias crianças. Só aparece quem a família aprovou. */
export default function Painel() {
  const app = useApp();
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pedidos, setPedidos] = useState<{ codigo: string; crianca_nome: string }[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    if (!nuvem.nuvemAtiva) {
      // Modo local: o paciente é a criança deste celular, se a família aprovou.
      const s = app.profissional.status;
      setPacientes(
        s === 'aprovado' ? [resumir('local', app.nomeCrianca, app.crianca.nascimento, app.licoes.map((l) => l.dia), app.registros)] : [],
      );
      setPedidos(s === 'pendente' ? [{ codigo: app.profissional.codigo, crianca_nome: app.nomeCrianca }] : []);
      return;
    }
    setCarregando(true);
    await nuvem.aceitarMeusConvites();
    const [r, p] = await Promise.all([nuvem.listarPacientes(), nuvem.meusPedidos()]);
    setPedidos(p);
    if (!r.ok) {
      setErro(r.erro);
      setCarregando(false);
      return;
    }
    const desde = somarDias(diaDe(new Date()), -30);
    const lista = await Promise.all(
      r.dados.map(async (c) => {
        const d = await nuvem.dadosDoPaciente(c.id, desde);
        const regs = d.ok ? d.dados.registros.map(registroDaNuvem) : [];
        return resumir(c.id, c.nome, c.nascimento, d.ok ? d.dados.licoes.map((l) => l.dia) : [], regs);
      }),
    );
    setPacientes(lista);
    setErro('');
    setCarregando(false);
  }, [app.profissional.status, app.profissional.codigo, app.licoes, app.registros, app.nomeCrianca, app.crianca.nascimento]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const lista = pacientes.filter((p) => filtro === 'todos' || (filtro === 'atencao' && p.alerta) || (filtro === 'sem' && p.diasSemLicao > 0));
  const primeiroNome = app.nomeProfissionalConta ? app.nomeProfissionalConta.split(' ')[0].toUpperCase() : 'PROFISSIONAL';

  return (
    <Tela
      sobretitulo={`OLÁ, ${primeiroNome}`}
      titulo="Seus pacientes"
      direita={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <BotaoIcone icone="add" rotulo="Adicionar paciente" onPress={() => router.push('/prof/vinculo')} />
          <BotaoIcone
            icone="log-out-outline"
            rotulo="Sair da conta"
            onPress={() => {
              app.sair();
              router.replace('/login');
            }}
          />
        </View>
      }
      rolagem={<RefreshControl refreshing={carregando} onRefresh={carregar} />}>
      <Segmentado<Filtro>
        valor={filtro}
        onChange={setFiltro}
        opcoes={[
          { valor: 'todos', rotulo: 'Todos' },
          { valor: 'atencao', rotulo: 'Pedem atenção' },
          { valor: 'sem', rotulo: 'Sem lição hoje' },
        ]}
      />

      {erro ? <Aviso tipo="reforco" texto={erro} /> : null}

      {pacientes.length === 0 && !carregando ? (
        <View style={styles.vazio}>
          <Ionicons name="people-outline" size={36} color={cores.textoSuave} />
          <Texto centro>Nenhum paciente ainda.</Texto>
          <Texto suave centro tamanho={13}>
            Peça para a família te convidar pelo seu e-mail, ou gere um código no botão + e mande para ela.
          </Texto>
        </View>
      ) : null}

      {lista.map((p, i) => {
        const cor = CORES[i % CORES.length];
        return (
          <View key={p.id} style={styles.cartao}>
            <Pressable
              onPress={() => router.push({ pathname: '/prof/paciente', params: { id: p.id, nome: p.nome } })}
              accessibilityRole="button"
              accessibilityLabel={`Abrir relatórios de ${p.nome}`}
              style={styles.topo}>
              <View style={[styles.avatar, { backgroundColor: cor.fundo }]}>
                <Text style={[styles.avatarTxt, { color: cor.tinta }]}>{p.nome.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nome}>{p.nome}</Text>
                <Text style={styles.meta}>{[p.idade, `ofensiva de ${p.ofensiva} ${p.ofensiva === 1 ? 'dia' : 'dias'}`].filter(Boolean).join(' · ')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={cores.textoSuave} />
            </Pressable>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                <Selo
                  texto={
                    p.diasSemLicao === 0
                      ? 'Lição de hoje feita'
                      : p.diasSemLicao >= 30
                        ? 'Ainda sem lições'
                        : `Sem lição há ${p.diasSemLicao} ${p.diasSemLicao === 1 ? 'dia' : 'dias'}`
                  }
                  fundo={p.diasSemLicao === 0 ? '#DFF7EF' : '#FFF2D4'}
                  tinta={p.diasSemLicao === 0 ? '#0D6650' : '#8A5000'}
                />
                {p.alerta ? <Selo texto={p.alerta} fundo="#FCE6F1" tinta="#9C1F63" /> : null}
              </View>
              <Pressable
                onPress={() => router.push({ pathname: '/prof/trilha', params: { id: p.id, nome: p.nome } })}
                accessibilityRole="button"
                accessibilityLabel={`Montar a trilha de ${p.nome}`}
                style={styles.trilha}>
                <Ionicons name="git-branch-outline" size={14} color={cores.primaria} />
                <Text style={styles.trilhaTxt}>Trilha</Text>
              </Pressable>
            </View>
          </View>
        );
      })}

      {pedidos.map((p) => (
        <View key={p.codigo} style={styles.espera}>
          <Ionicons name="time-outline" size={22} color="#8A5000" />
          <View style={{ flex: 1 }}>
            <Text style={styles.nome}>{`${p.crianca_nome} · aguardando aprovação`}</Text>
            <Text style={styles.meta}>{`A família digitou o código ${p.codigo}`}</Text>
          </View>
        </View>
      ))}
    </Tela>
  );
}

const styles = StyleSheet.create({
  vazio: { alignItems: 'center', gap: 8, padding: 24, borderWidth: 2, borderStyle: 'dashed', borderColor: '#C9C9DE', borderRadius: 20 },
  cartao: { backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda, borderRadius: 20, padding: 14, gap: 10 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: fontes.titulo, fontSize: 18 },
  nome: { fontFamily: fontes.textoForte, fontSize: 16, color: cores.texto },
  meta: { fontFamily: fontes.texto, fontSize: 13, color: cores.textoSuave },
  trilha: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 12, borderRadius: 22, backgroundColor: cores.primariaClara },
  trilhaTxt: { fontFamily: fontes.textoForte, fontSize: 13, color: cores.primaria },
  espera: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: '#C9C9DE', borderRadius: 20, padding: 14 },
});
