import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BotaoPlay } from '@/components/BotaoPlay';
import { Pixel, heroi } from '@/components/Pixel';
import { SemanaOfensiva } from '@/components/ui';
import { useMovimentoReduzido } from '@/hooks/useMovimentoReduzido';
import { useApp, useTrilhaDeHoje } from '@/state/AppState';
import { cores, espaco, fontes, TOQUE_MINIMO } from '@/theme/tokens';

/**
 * Modo criança: é onde o app abre no dia a dia.
 * A criança só vê o herói, a ofensiva e o PLAY. O cadeado leva ao PIN dos adultos.
 */
export default function ModoCrianca() {
  const app = useApp();
  const trilha = useTrilhaDeHoje();
  const reduzido = useMovimentoReduzido();
  const pulo = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduzido) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulo, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(pulo, { toValue: 0, duration: 450, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduzido]);

  const translateY = pulo.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const hoje = new Date().getDay();
  const feitosNaSemana = Math.min(hoje + (app.licaoConcluidaHoje ? 1 : 0), 7);

  return (
    <SafeAreaView style={styles.raiz}>
      <View style={styles.topo}>
        <Pressable
          onPress={() => router.push('/pin')}
          accessibilityRole="button"
          accessibilityLabel="Área dos adultos"
          style={styles.cadeado}>
          <Ionicons name="lock-closed" size={20} color="#8E89C9" />
        </Pressable>
      </View>

      <Text style={styles.ola}>{`Oi, ${app.nomeCrianca}!`}</Text>

      <View style={styles.palco}>
        <Animated.View style={{ transform: [{ translateY }] }}>
          <Pixel largura={12} altura={16} escala={12} rets={heroi()} />
        </Animated.View>
        <View style={styles.sombra} />
      </View>

      <View style={styles.ofensiva}>
        <Text style={styles.ofensivaTitulo}>{`${app.ofensiva} dias seguidos!`}</Text>
        <SemanaOfensiva feitos={feitosNaSemana} hojeIndice={hoje} escuro />
      </View>

      <View style={{ flex: 1 }} />

      {app.licaoConcluidaHoje ? (
        <View style={styles.feito}>
          <Text style={styles.feitoTitulo}>Lição de hoje feita!</Text>
          <Text style={styles.hoje}>Volte amanhã, herói.</Text>
        </View>
      ) : (
        <>
          <BotaoPlay
            onPress={() => {
              app.reiniciarLicao();
              router.push('/licao');
            }}
          />
          <Text style={styles.hoje}>{`Hoje: ${app.habitos.length} tarefas da casa e ${trilha.length} jogos`}</Text>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: cores.licaoFundo, padding: espaco.xl, gap: espaco.l },
  topo: { alignItems: 'flex-end' },
  cadeado: {
    width: TOQUE_MINIMO,
    height: TOQUE_MINIMO,
    borderRadius: TOQUE_MINIMO / 2,
    backgroundColor: cores.licaoSuperficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ola: { fontFamily: fontes.pixel, fontSize: 34, color: '#FFFFFF', textAlign: 'center' },
  palco: { alignItems: 'center', gap: 4, marginTop: espaco.s },
  sombra: { width: 120, height: 10, backgroundColor: cores.licaoBorda },
  ofensiva: {
    backgroundColor: cores.licaoSuperficie,
    borderWidth: 3,
    borderColor: cores.licaoBorda,
    borderRadius: 10,
    padding: 14,
    gap: 10,
  },
  ofensivaTitulo: { fontFamily: fontes.pixel, fontSize: 20, color: '#FFFFFF', textAlign: 'center' },
  hoje: { fontFamily: fontes.texto, fontSize: 15, color: cores.licaoTextoSuave, textAlign: 'center' },
  feito: { alignItems: 'center', gap: 6, paddingBottom: espaco.xl },
  feitoTitulo: { fontFamily: fontes.pixel, fontSize: 28, color: cores.ouroClaro },
});
