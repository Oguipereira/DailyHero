import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Respiracao } from '@/components/Respiracao';
import { Botao } from '@/components/ui';
import { cores, fontes } from '@/theme/tokens';

/**
 * Tela de pausa avulsa (prévia em Perfil › Telas de teste).
 * No uso real a pausa abre de dentro da lição, pelo botão "Pausa" no topo.
 */
export default function Pausa() {
  const [rodada, setRodada] = useState(0);
  return (
    <SafeAreaView style={styles.raiz}>
      <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Voltar" style={styles.voltar}>
        <Ionicons name="chevron-back" size={24} color={cores.primaria} />
      </Pressable>
      <View style={styles.centro}>
        <Text accessibilityRole="header" style={styles.titulo}>
          Hora de respirar
        </Text>
        <Respiracao reiniciar={rodada} />
      </View>
      <View style={{ gap: 12 }}>
        <Botao titulo="Estou melhor" onPress={() => router.back()} />
        <Botao variante="secundario" titulo="Mais um pouquinho" onPress={() => setRodada((r) => r + 1)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: '#E8F6FD', padding: 24 },
  voltar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28 },
  titulo: { fontFamily: fontes.titulo, fontSize: 30, color: cores.texto },
});
