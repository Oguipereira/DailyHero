import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BotaoPixel } from '@/components/licao';
import { Pixel, heroi, rosto } from '@/components/Pixel';
import { SemanaOfensiva } from '@/components/ui';
import { useMovimentoReduzido } from '@/hooks/useMovimentoReduzido';
import { useApp, useTrilhaDeHoje, type Sentimento } from '@/state/AppState';
import { cores, espaco, fontes } from '@/theme/tokens';

const CARINHAS: { valor: Sentimento; rotulo: string; rosto: 'feliz' | 'calmo' | 'triste'; pele: string }[] = [
  { valor: 'bem', rotulo: 'Bem', rosto: 'feliz', pele: '#FFD83D' },
  { valor: 'mais', rotulo: 'Mais ou menos', rosto: 'calmo', pele: '#8FD3EE' },
  { valor: 'chateado', rotulo: 'Chateado', rosto: 'triste', pele: '#C4B0FC' },
];

/** Fim da lição: comemora, soma a ofensiva e pergunta como a criança se sentiu. Sem "jogar de novo". */
export default function Fim() {
  const app = useApp();
  const trilha = useTrilhaDeHoje();
  const reduzido = useMovimentoReduzido();
  const [sentimento, setSentimento] = useState<Sentimento | null>(null);
  const pulo = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduzido) return;
    const l = Animated.loop(
      Animated.sequence([
        Animated.timing(pulo, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(pulo, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    );
    l.start();
    return () => l.stop();
  }, [reduzido]);

  const hoje = new Date().getDay();
  const ofensivaNova = app.licaoConcluidaHoje ? app.ofensiva : app.ofensiva + 1;

  function voltar() {
    app.concluirLicao(sentimento);
    router.dismissTo('/crianca');
  }

  return (
    <SafeAreaView style={styles.raiz}>
      <ScrollView contentContainerStyle={styles.corpo}>
        <Animated.View style={{ alignSelf: 'center', transform: [{ translateY: pulo.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }] }}>
          <Pixel largura={12} altura={16} escala={9} rets={heroi()} />
        </Animated.View>

        <View style={{ alignItems: 'center', gap: 6 }}>
          <Text accessibilityRole="header" style={styles.titulo}>
            Lição completa!
          </Text>
          <Text style={styles.sub}>{`Você fez as ${app.habitos.length} tarefas e os ${trilha.length} jogos.`}</Text>
        </View>

        <View style={styles.ofensiva}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.ofensivaTitulo}>{`${ofensivaNova} dias seguidos`}</Text>
            <View style={styles.mais1}>
              <Text style={styles.mais1Txt}>+1 hoje</Text>
            </View>
          </View>
          <SemanaOfensiva feitos={Math.min(hoje + 1, 7)} hojeIndice={-1} escuro />
        </View>

        <View style={{ gap: 10 }}>
          <Text style={styles.pergunta}>Como você se sentiu hoje?</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {CARINHAS.map((c) => {
              const on = sentimento === c.valor;
              return (
                <Pressable
                  key={c.valor}
                  onPress={() => setSentimento(c.valor)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={c.rotulo}
                  style={[styles.carinha, on && styles.carinhaOn]}>
                  <Pixel largura={16} altura={16} escala={3} rets={rosto(c.rosto, c.pele)} />
                  <Text style={[styles.carinhaTxt, on && { color: cores.texto }]}>{c.rotulo}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.aviso}>
          <Text style={styles.avisoTxt}>O relatório de hoje já foi para sua família e terapeuta.</Text>
        </View>

        <View style={{ gap: 10, marginTop: espaco.s }}>
          <Text style={styles.ate}>Até amanhã, herói!</Text>
          <BotaoPixel titulo="Voltar ao início" grande onPress={voltar} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: cores.licaoFundo },
  corpo: { padding: espaco.xl, gap: espaco.l },
  titulo: { fontFamily: fontes.pixel, fontSize: 36, color: cores.ouroClaro },
  sub: { fontFamily: fontes.textoForte, fontSize: 16, color: cores.licaoTextoSuave, textAlign: 'center' },
  ofensiva: { backgroundColor: cores.licaoSuperficie, borderWidth: 3, borderColor: cores.licaoBorda, borderRadius: 10, padding: 14, gap: 12 },
  ofensivaTitulo: { fontFamily: fontes.pixel, fontSize: 22, color: '#FFFFFF' },
  mais1: { backgroundColor: cores.ouro, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  mais1Txt: { fontFamily: fontes.textoForte, fontSize: 13, color: '#2E1C00' },
  pergunta: { fontFamily: fontes.pixel, fontSize: 20, color: '#FFFFFF', textAlign: 'center' },
  carinha: {
    flex: 1,
    minHeight: 92,
    borderRadius: 12,
    borderWidth: 3,
    borderBottomWidth: 6,
    borderColor: cores.licaoBorda,
    backgroundColor: cores.licaoSuperficie,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 6,
  },
  carinhaOn: { backgroundColor: '#FFFFFF', borderColor: cores.ouroClaro },
  carinhaTxt: { fontFamily: fontes.pixel, fontSize: 13, color: '#FFFFFF', textAlign: 'center' },
  aviso: { backgroundColor: '#F1EAFE', borderRadius: 14, padding: 12 },
  avisoTxt: { fontFamily: fontes.textoForte, fontSize: 14, color: '#4A22A0' },
  ate: { fontFamily: fontes.pixel, fontSize: 20, color: '#FFFFFF', textAlign: 'center' },
});
