import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '@/components/ui';
import { useMovimentoReduzido } from '@/hooks/useMovimentoReduzido';
import { cores, fontes } from '@/theme/tokens';

const FASE_MS = 4000;

/** Pausa: respiração guiada. O círculo cresce (inspira) e diminui (expira), 4 s cada. */
export default function Pausa() {
  const reduzido = useMovimentoReduzido();
  const escala = useRef(new Animated.Value(0)).current;
  const [inspira, setInspira] = useState(true);
  const [conta, setConta] = useState(4);

  useEffect(() => {
    const t = setInterval(() => {
      setConta((c) => {
        if (c <= 1) {
          setInspira((i) => !i);
          return 4;
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
      duration: FASE_MS,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    }).start();
  }, [inspira, reduzido]);

  const scale = escala.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1] });

  return (
    <SafeAreaView style={styles.raiz}>
      <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Voltar" style={styles.voltar}>
        <Ionicons name="chevron-back" size={24} color={cores.primaria} />
      </Pressable>

      <View style={styles.centro}>
        <Text accessibilityRole="header" style={styles.titulo}>
          Hora de respirar
        </Text>
        <Animated.View style={[styles.anel1, { transform: [{ scale }] }]}>
          <View style={styles.anel2}>
            <View style={styles.anel3} accessible accessibilityLabel={`${inspira ? 'Inspira' : 'Solta'}, ${conta}`}>
              <Text style={styles.fase}>{inspira ? 'Inspira' : 'Solta'}</Text>
              <Text style={styles.conta}>{conta}</Text>
            </View>
          </View>
        </Animated.View>
        <Text style={styles.texto}>O círculo cresce: puxe o ar. Ele diminui: solte devagar.</Text>
      </View>

      <View style={{ gap: 12 }}>
        <Botao titulo="Estou melhor" onPress={() => router.back()} />
        <Botao variante="secundario" titulo="Mais um pouquinho" onPress={() => setConta(4)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: '#E8F6FD', padding: 24 },
  voltar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28 },
  titulo: { fontFamily: fontes.titulo, fontSize: 30, color: cores.texto },
  anel1: { width: 260, height: 260, borderRadius: 130, backgroundColor: '#CDEEFB', alignItems: 'center', justifyContent: 'center' },
  anel2: { width: 200, height: 200, borderRadius: 100, backgroundColor: '#A8E0F5', alignItems: 'center', justifyContent: 'center' },
  anel3: { width: 140, height: 140, borderRadius: 70, backgroundColor: cores.primaria, alignItems: 'center', justifyContent: 'center' },
  fase: { fontFamily: fontes.textoForte, fontSize: 18, color: '#FFFFFF' },
  conta: { fontFamily: fontes.titulo, fontSize: 40, color: '#FFFFFF' },
  texto: { fontFamily: fontes.textoForte, fontSize: 18, color: '#2E3A66', textAlign: 'center', maxWidth: 280 },
});
