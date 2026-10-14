import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/Logo';
import { Aviso, Botao, Texto } from '@/components/ui';
import { useMovimentoReduzido } from '@/hooks/useMovimentoReduzido';
import { cores, fontes } from '@/theme/tokens';

/**
 * Erro do sistema (área dos adultos). O cristal quebrado aparece aqui.
 * Na lição, a criança nunca vê esta tela: lá o erro leva para a Pausa.
 */
export default function Erro() {
  const reduzido = useMovimentoReduzido();
  const [tentando, setTentando] = useState(false);
  const [tentativas, setTentativas] = useState(0);
  const deriva = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduzido) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(deriva, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(deriva, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
  }, [reduzido]);

  const translateY = deriva.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
  const rotate = deriva.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-1deg'] });

  function tentar() {
    setTentando(true);
    setTimeout(() => {
      setTentando(false);
      setTentativas((t) => t + 1);
    }, 1400);
  }

  return (
    <SafeAreaView style={styles.raiz}>
      <View style={styles.centro}>
        <Animated.View style={{ transform: [{ translateY }, { rotate }] }}>
          <Logo tamanho={230} quebrado />
        </Animated.View>
        <Text accessibilityRole="header" style={styles.titulo}>
          Algo se quebrou{'\n'}por aqui
        </Text>
        <Texto suave centro tamanho={17}>
          Não foi nada que você fez. Já estamos juntando as peças, e o progresso de hoje está guardado.
        </Texto>
        {tentativas > 0 && !tentando ? <Aviso tipo="alerta" texto="Ainda não voltou. Confira a internet ou tente daqui a pouco." /> : null}
      </View>
      <View style={{ gap: 10 }}>
        <Botao titulo={tentando ? 'Tentando…' : 'Tentar de novo'} onPress={tentar} desativado={tentando} />
        <Botao variante="secundario" titulo="Voltar ao início" onPress={() => router.replace('/crianca')} />
        <Texto suave centro tamanho={13}>
          Código [DH-000] · Falar com o suporte
        </Texto>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: '#FFFFFF', padding: 28 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  titulo: { fontFamily: fontes.titulo, fontSize: 30, color: cores.texto, textAlign: 'center', lineHeight: 36 },
});
