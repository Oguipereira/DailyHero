import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BotaoPlay } from '@/components/BotaoPlay';
import { cores, espaco, fontes, TOQUE_MINIMO } from '@/theme/tokens';

/**
 * Modo criança: é onde o app abre.
 * A criança só vê o PLAY. O cadeado no canto leva ao PIN da área dos adultos.
 */
export default function ModoCrianca() {
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

      <Text style={styles.ola}>Oi, [Nome]!</Text>

      {/* TODO fase 3: herói em pixel art e ofensiva da semana */}
      <View style={styles.meio} />

      <BotaoPlay onPress={() => router.push('/licao')} />
      <Text style={styles.hoje}>Hoje: 7 tarefas da casa e 3 jogos</Text>
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
  meio: { flex: 1 },
  hoje: { fontFamily: fontes.texto, fontSize: 15, color: cores.licaoTextoSuave, textAlign: 'center' },
});
