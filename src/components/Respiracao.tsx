import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { useMovimentoReduzido } from '@/hooks/useMovimentoReduzido';
import { cores, fontes } from '@/theme/tokens';

const FASE_SEG = 4;

/**
 * Respiração guiada: o círculo cresce (inspira) e diminui (solta), 4 s cada, com contagem.
 * Usada na pausa de dentro da lição e na tela de pausa.
 * `reiniciar` muda de valor para recomeçar a contagem ("mais um pouquinho").
 */
export function Respiracao({ reiniciar = 0 }: { reiniciar?: number }) {
  const reduzido = useMovimentoReduzido();
  const escala = useRef(new Animated.Value(0)).current;
  const [inspira, setInspira] = useState(true);
  const [conta, setConta] = useState(FASE_SEG);

  useEffect(() => {
    setInspira(true);
    setConta(FASE_SEG);
  }, [reiniciar]);

  useEffect(() => {
    const t = setInterval(() => {
      setConta((c) => {
        if (c <= 1) {
          setInspira((i) => !i);
          return FASE_SEG;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (reduzido) return;
    Animated.timing(escala, {
      toValue: inspira ? 1 : 0,
      duration: FASE_SEG * 1000,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    }).start();
  }, [inspira, reduzido]);

  const scale = escala.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1] });

  return (
    <View style={styles.centro}>
      <Animated.View style={[styles.anel1, { transform: [{ scale }] }]}>
        <View style={styles.anel2}>
          <View style={styles.anel3} accessible accessibilityLiveRegion="polite" accessibilityLabel={`${inspira ? 'Inspira' : 'Solta'}, ${conta}`}>
            <Text style={styles.fase}>{inspira ? 'Inspira' : 'Solta'}</Text>
            <Text style={styles.conta}>{conta}</Text>
          </View>
        </View>
      </Animated.View>
      <Text style={styles.texto}>O círculo cresce: puxe o ar. Ele diminui: solte devagar.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { alignItems: 'center', justifyContent: 'center', gap: 28 },
  anel1: { width: 260, height: 260, borderRadius: 130, backgroundColor: '#CDEEFB', alignItems: 'center', justifyContent: 'center' },
  anel2: { width: 200, height: 200, borderRadius: 100, backgroundColor: '#A8E0F5', alignItems: 'center', justifyContent: 'center' },
  anel3: { width: 140, height: 140, borderRadius: 70, backgroundColor: cores.primaria, alignItems: 'center', justifyContent: 'center' },
  fase: { fontFamily: fontes.textoForte, fontSize: 18, color: '#FFFFFF' },
  conta: { fontFamily: fontes.titulo, fontSize: 40, color: '#FFFFFF' },
  texto: { fontFamily: fontes.textoForte, fontSize: 18, color: '#2E3A66', textAlign: 'center', maxWidth: 280 },
});
