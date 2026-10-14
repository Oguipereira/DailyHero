import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Tela } from '@/components/Tela';
import { Aviso, Botao, Cartao, Texto, Titulo2 } from '@/components/ui';
import { JOGOS, jogoPorId, type JogoId } from '@/data/catalogo';
import * as nuvem from '@/data/nuvem';
import { useApp } from '@/state/AppState';
import { cores, fontes, modulos } from '@/theme/tokens';

/** O profissional monta a trilha de jogos da criança e quantos entram por dia. */
export default function Trilha() {
  const app = useApp();
  const { id = 'local', nome = app.nomeCrianca } = useLocalSearchParams<{ id?: string; nome?: string }>();
  const local = id === 'local' || !nuvem.nuvemAtiva;
  const [trilha, setTrilha] = useState<JogoId[]>(local ? app.trilha : []);
  const [porDia, setPorDia] = useState(local ? app.jogosPorDia : 3);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Na nuvem, carrega a trilha atual deste paciente.
  useEffect(() => {
    if (local) return;
    void nuvem.listarPacientes().then((r) => {
      const c = r.ok ? r.dados.find((x) => x.id === id) : undefined;
      if (!c) return setErro(r.ok ? 'Paciente não encontrado.' : r.erro);
      setTrilha(c.trilha as JogoId[]);
      setPorDia(c.jogos_por_dia);
    });
  }, [id, local]);

  async function salvar() {
    if (local) {
      app.definirTrilha(trilha, porDia);
      return router.back();
    }
    setSalvando(true);
    const r = await nuvem.salvarTrilhaNaNuvem(id, trilha, porDia);
    setSalvando(false);
    if (!r.ok) return setErro(r.erro);
    router.back();
  }
  const cheia = trilha.length >= porDia;
  const prontos = JOGOS.filter((j) => j.pronto && !trilha.includes(j.id));

  return (
    <Tela
      voltar
      titulo={`Trilha de ${nome}`}
      subtitulo="Jogos da atividade diária"
      rodape={
        <Botao titulo={salvando ? 'Salvando…' : 'Salvar trilha'} desativado={trilha.length === 0 || salvando} onPress={salvar} />
      }>
      {erro ? <Aviso tipo="reforco" texto={erro} /> : null}
      <Aviso texto="O nível de cada jogo se ajusta sozinho: sobe quando a criança acerta quase tudo sem ajuda e desce quando erra muito." />

      <Cartao estilo={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Titulo2>Jogos por dia</Titulo2>
          <Texto suave tamanho={12}>Mantém a lição curta, sem viciar</Texto>
        </View>
        <Pressable
          onPress={() => {
            const p = Math.max(1, porDia - 1);
            setPorDia(p);
            setTrilha((t) => t.slice(0, p));
          }}
          accessibilityRole="button"
          accessibilityLabel="Menos um jogo"
          style={styles.passo}>
          <Ionicons name="remove" size={22} color={cores.texto} />
        </Pressable>
        <Text style={styles.porDia} accessibilityLiveRegion="polite">
          {porDia}
        </Text>
        <Pressable onPress={() => setPorDia((p) => Math.min(5, p + 1))} accessibilityRole="button" accessibilityLabel="Mais um jogo" style={styles.passo}>
          <Ionicons name="add" size={22} color={cores.texto} />
        </Pressable>
      </Cartao>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Titulo2>Na trilha</Titulo2>
        <Texto suave tamanho={13}>{`${trilha.length} de ${porDia}${cheia ? ' · cheia' : ''}`}</Texto>
      </View>
      {trilha.map((id, i) => {
        const j = jogoPorId(id);
        return (
          <View key={id} style={[styles.item, { borderColor: cores.primaria, borderWidth: 2 }]}>
            <View style={styles.num}>
              <Text style={styles.numTxt}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>{j.nome}</Text>
              <Text style={[styles.mod, { color: modulos[j.modulo].tinta }]}>{modulos[j.modulo].nome}</Text>
            </View>
            <Pressable onPress={() => setTrilha((t) => t.filter((x) => x !== id))} accessibilityRole="button" accessibilityLabel={`Tirar ${j.nome} da trilha`} style={styles.acao}>
              <Ionicons name="remove-circle-outline" size={24} color="#9C1F63" />
            </Pressable>
          </View>
        );
      })}
      {trilha.length === 0 ? <Texto suave centro>Adicione jogos do catálogo abaixo.</Texto> : null}

      <Titulo2>Catálogo</Titulo2>
      {prontos.length === 0 ? <Texto suave>Todos os jogos prontos já estão na trilha. Novos jogos chegam nas próximas versões.</Texto> : null}
      {prontos.map((j) => (
        <View key={j.id} style={styles.item}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nome}>{j.nome}</Text>
            <Text style={[styles.mod, { color: modulos[j.modulo].tinta }]}>{modulos[j.modulo].nome}</Text>
          </View>
          <Pressable
            disabled={cheia}
            onPress={() => setTrilha((t) => [...t, j.id])}
            accessibilityRole="button"
            accessibilityLabel={cheia ? 'Trilha cheia' : `Adicionar ${j.nome}`}
            style={[styles.acao, cheia && { opacity: 0.35 }]}>
            <Ionicons name="add-circle-outline" size={24} color={cores.primaria} />
          </Pressable>
        </View>
      ))}
    </Tela>
  );
}

const styles = StyleSheet.create({
  passo: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: cores.borda, alignItems: 'center', justifyContent: 'center' },
  porDia: { width: 36, textAlign: 'center', fontFamily: fontes.titulo, fontSize: 22, color: cores.texto },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 58, backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda, borderRadius: 16, paddingLeft: 12, paddingRight: 4 },
  num: { width: 26, height: 26, borderRadius: 13, backgroundColor: cores.primaria, alignItems: 'center', justifyContent: 'center' },
  numTxt: { fontFamily: fontes.textoForte, fontSize: 13, color: '#FFFFFF' },
  nome: { fontFamily: fontes.textoForte, fontSize: 15, color: cores.texto },
  mod: { fontFamily: fontes.textoForte, fontSize: 12 },
  acao: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
