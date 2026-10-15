import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/Logo';
import { Botao, Texto } from '@/components/ui';
import { useMovimentoReduzido } from '@/hooks/useMovimentoReduzido';
import { useApp } from '@/state/AppState';
import { cores, fontes } from '@/theme/tokens';

/** Mensagem de boas-vindas logo depois do cadastro, com o logo em cristal. */
export default function BoasVindas() {
  const { nomeCrianca } = useApp();
  const reduzido = useMovimentoReduzido();
  const entra = useRef(new Animated.Value(reduzido ? 1 : 0)).current;
  const flutua = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduzido) return;
    Animated.timing(entra, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(flutua, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(flutua, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
  }, [reduzido]);

  const scale = entra.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  const translateY = flutua.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  return (
    <SafeAreaView style={styles.raiz}>
      <View style={styles.centro}>
        <Animated.View style={{ opacity: entra, transform: [{ scale }, { translateY }] }}>
          <Logo tamanho={220} variante="cristal" />
        </Animated.View>
        <Animated.View style={{ opacity: entra, alignItems: 'center', gap: 12 }}>
          <Text style={styles.sobre}>CADASTRO CONCLUÍDO</Text>
          <Text accessibilityRole="header" style={styles.titulo}>
            Bem-vindos ao{'\n'}Daily Hero
          </Text>
          <Texto suave centro tamanho={17}>
            {`Todo herói começa com pequenos passos. A partir de hoje, ${nomeCrianca} dá os dele aqui, um dia de cada vez.`}
          </Texto>
        </Animated.View>
      </View>
      <View style={styles.rodape}>
        <Texto suave centro tamanho={14}>
          Agora, vamos montar a rotina de casa de vocês.
        </Texto>
        <Botao titulo="Vamos começar" onPress={() => router.replace('/habitos')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: '#FFFFFF', padding: 28 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  sobre: { fontFamily: fontes.textoForte, fontSize: 13, color: cores.primaria, letterSpacing: 0.6 },
  titulo: { fontFamily: fontes.titulo, fontSize: 32, color: cores.texto, textAlign: 'center', lineHeight: 38 },
  rodape: { gap: 12 },
});
