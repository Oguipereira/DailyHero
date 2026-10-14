import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Tela } from '@/components/Tela';
import { BotaoIcone, Segmentado, Selo } from '@/components/ui';
import { useApp } from '@/state/AppState';
import { cores, fontes } from '@/theme/tokens';

type Filtro = 'todos' | 'atencao' | 'sem';

const PACIENTES = [
  { nome: '[Criança 1]', idade: 7, ofensiva: 4, fezHoje: true, alerta: 'Socioemocional precisa reforço', fundo: '#E1F4FC', tinta: '#0B5878' },
  { nome: '[Criança 2]', idade: 5, ofensiva: 0, fezHoje: false, alerta: '', fundo: '#EEF8DC', tinta: '#46650F' },
  { nome: '[Criança 3]', idade: 9, ofensiva: 12, fezHoje: true, alerta: '', fundo: '#FFF2D4', tinta: '#8A5000' },
];

/** Painel do profissional: uma conta, várias crianças. */
export default function Painel() {
  const app = useApp();
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const lista = PACIENTES.filter((p) => filtro === 'todos' || (filtro === 'atencao' && p.alerta) || (filtro === 'sem' && !p.fezHoje));

  return (
    <Tela
      sobretitulo="OLÁ, [NOME DO PROFISSIONAL]"
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
      }>
      <Segmentado<Filtro>
        valor={filtro}
        onChange={setFiltro}
        opcoes={[
          { valor: 'todos', rotulo: 'Todos' },
          { valor: 'atencao', rotulo: 'Pedem atenção' },
          { valor: 'sem', rotulo: 'Sem lição' },
        ]}
      />

      {lista.map((p) => (
        <View key={p.nome} style={styles.cartao}>
          <Pressable onPress={() => router.push('/relatorios')} accessibilityRole="button" accessibilityLabel={`Abrir relatórios de ${p.nome}`} style={styles.topo}>
            <View style={[styles.avatar, { backgroundColor: p.fundo }]}>
              <Text style={[styles.avatarTxt, { color: p.tinta }]}>{p.nome.match(/\d/)?.[0] ?? '?'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>{p.nome}</Text>
              <Text style={styles.meta}>{`${p.idade} anos · ofensiva de ${p.ofensiva} dias`}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={cores.textoSuave} />
          </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              <Selo texto={p.fezHoje ? 'Lição de hoje feita' : 'Sem lição há 2 dias'} fundo={p.fezHoje ? '#DFF7EF' : '#FFF2D4'} tinta={p.fezHoje ? '#0D6650' : '#8A5000'} />
              {p.alerta ? <Selo texto={p.alerta} fundo="#FCE6F1" tinta="#9C1F63" /> : null}
            </View>
            <Pressable onPress={() => router.push('/prof/trilha')} accessibilityRole="button" accessibilityLabel={`Montar a trilha de ${p.nome}`} style={styles.trilha}>
              <Ionicons name="git-branch-outline" size={14} color={cores.primaria} />
              <Text style={styles.trilhaTxt}>Trilha</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <Pressable onPress={() => router.push('/prof/vinculo')} accessibilityRole="button" style={styles.espera}>
        <Ionicons name="time-outline" size={22} color="#8A5000" />
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>Aguardando aprovação</Text>
          <Text style={styles.meta}>Código DH-7K4Q enviado à família</Text>
        </View>
      </Pressable>
    </Tela>
  );
}

const styles = StyleSheet.create({
  cartao: { backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda, borderRadius: 20, padding: 14, gap: 10 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: fontes.titulo, fontSize: 18 },
  nome: { fontFamily: fontes.textoForte, fontSize: 16, color: cores.texto },
  meta: { fontFamily: fontes.texto, fontSize: 13, color: cores.textoSuave },
  trilha: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36, paddingHorizontal: 12, borderRadius: 18, backgroundColor: cores.primariaClara },
  trilhaTxt: { fontFamily: fontes.textoForte, fontSize: 13, color: cores.primaria },
  espera: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: '#C9C9DE', borderRadius: 20, padding: 14 },
});
