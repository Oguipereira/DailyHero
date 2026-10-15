import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Tela } from '@/components/Tela';
import { Selo } from '@/components/ui';
import { JOGOS } from '@/data/catalogo';
import { useTrilhaDeHoje } from '@/state/AppState';
import { cores, fontes, modulos, type ModuloId } from '@/theme/tokens';

/** Catálogo dos jogos atribuídos à criança, com busca e filtro por módulo de estímulo. */
export default function Jogos() {
  const trilha = useTrilhaDeHoje();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<ModuloId | 'todos'>('todos');

  const lista = JOGOS.filter(
    (j) => (filtro === 'todos' || j.modulo === filtro) && j.nome.toLowerCase().includes(busca.trim().toLowerCase()),
  );

  return (
    <Tela comAbas titulo="Jogos" subtitulo="Escolhidos pelo profissional · abrem na atividade diária">
      <View style={styles.busca}>
        <Ionicons name="search" size={18} color={cores.textoSuave} />
        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar"
          placeholderTextColor="#8A8AA8"
          accessibilityLabel="Buscar jogo"
          style={styles.buscaInput}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {(['todos', ...Object.keys(modulos)] as (ModuloId | 'todos')[]).map((m) => {
          const on = filtro === m;
          return (
            <Pressable
              key={m}
              onPress={() => setFiltro(m)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={[styles.chip, on && styles.chipOn]}>
              <Text style={[styles.chipTxt, on && { color: '#FFFFFF', fontFamily: fontes.textoForte }]}>
                {m === 'todos' ? 'Todos' : modulos[m].nome.split(' ')[0]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {lista.map((j) => {
        const m = modulos[j.modulo];
        const naTrilha = trilha.includes(j.id);
        return (
          <View key={j.id} style={[styles.item, !j.pronto && { opacity: 0.6 }]}>
            <View style={[styles.tile, { backgroundColor: m.fundo }]}>
              <Ionicons name="game-controller" size={20} color={m.tinta} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>{j.nome}</Text>
              <Text style={[styles.modulo, { color: m.tinta }]}>{m.nome}</Text>
            </View>
            {naTrilha ? <Selo texto="Hoje" fundo="#FFF2D4" tinta="#8A5000" /> : !j.pronto ? <Selo texto="Em breve" fundo="#F0F0F8" tinta={cores.textoSuave} /> : null}
          </View>
        );
      })}
      {lista.length === 0 ? <Text style={styles.vazio}>Nenhum jogo encontrado.</Text> : null}
    </Tela>
  );
}

const styles = StyleSheet.create({
  busca: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, borderRadius: 24, backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda, paddingHorizontal: 16 },
  buscaInput: { flex: 1, minHeight: 46, fontFamily: fontes.texto, fontSize: 15, color: cores.texto },
  chip: { minHeight: 40, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: cores.borda, backgroundColor: cores.superficie, justifyContent: 'center' },
  chipOn: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  chipTxt: { fontFamily: fontes.texto, fontSize: 14, color: cores.texto },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 62, backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  tile: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  nome: { fontFamily: fontes.textoForte, fontSize: 15, color: cores.texto },
  modulo: { fontFamily: fontes.textoForte, fontSize: 12 },
  vazio: { fontFamily: fontes.texto, fontSize: 15, color: cores.textoSuave, textAlign: 'center', marginTop: 20 },
});
