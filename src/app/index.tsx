import { router } from 'expo-router';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LogoAbertura, useRelogioAbertura } from '@/components/Logo';
import { useApp } from '@/state/AppState';
import { cores, fontes } from '@/theme/tokens';

/**
 * Abertura (tela A0 do canvas): o anel entra girando, a estrela pula no centro
 * e o nome sobe logo depois. Toque em qualquer lugar para entrar.
 */
export default function Abertura() {
  const { logado, perfil } = useApp();
  const t = useRelogioAbertura();

  // O nome aparece entre 1,7 s e 2,2 s, subindo 10 px (igual ao canvas).
  const nome = {
    opacity: t.interpolate({ inputRange: [0, 1680, 2160], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
    transform: [{ translateY: t.interpolate({ inputRange: [0, 1680, 2160], outputRange: [10, 10, 0], extrapolate: 'clamp' }) }],
  };

  function entrar() {
    router.replace(!logado ? '/login' : perfil === 'profissional' ? '/prof/painel' : '/crianca');
  }

  return (
    <Pressable style={styles.raiz} onPress={entrar} accessibilityRole="button" accessibilityLabel="Entrar no Daily Hero">
      <LogoAbertura tamanho={200} relogio={t} />
      <Animated.View style={[styles.textos, nome]}>
        <Text style={styles.nome}>
          Daily <Text style={{ color: cores.primaria }}>Hero</Text>
        </Text>
        <Text style={styles.lema}>Um pouquinho todo dia</Text>
      </Animated.View>
      <SafeAreaView edges={['bottom']} style={styles.rodape}>
        <Animated.Text style={[styles.toque, { opacity: nome.opacity }]}>Toque para entrar</Animated.Text>
      </SafeAreaView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', gap: 28, paddingHorizontal: 24 },
  textos: { alignItems: 'center', gap: 6 },
  rodape: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  nome: { fontFamily: fontes.titulo, fontSize: 40, lineHeight: 44, color: cores.texto, letterSpacing: -0.5 },
  lema: { fontFamily: fontes.textoForte, fontSize: 17, color: cores.textoSuave },
  toque: { fontFamily: fontes.textoForte, fontSize: 15, color: cores.textoSuave, paddingHorizontal: 20, paddingVertical: 12, marginBottom: 36 },
});
