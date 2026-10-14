import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cores, espaco, fontes, raio } from '@/theme/tokens';

const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'apagar'];

/**
 * PIN da área dos adultos.
 * Protótipo: qualquer PIN de 4 números entra. Na fase 2 ele passa a ser conferido de verdade.
 */
export default function Pin() {
  const [pin, setPin] = useState('');

  function apertar(tecla: string) {
    if (tecla === 'apagar') return setPin((p) => p.slice(0, -1));
    const novo = (pin + tecla).slice(0, 4);
    setPin(novo);
    if (novo.length === 4) {
      setTimeout(() => {
        router.dismiss();
        router.push('/inicio');
      }, 150);
    }
  }

  return (
    <SafeAreaView style={styles.raiz}>
      <Pressable onPress={() => router.back()} accessibilityRole="button" style={styles.voltar}>
        <Ionicons name="chevron-down" size={20} color={cores.texto} />
        <Text style={styles.voltarTexto}>Voltar para o jogo</Text>
      </Pressable>

      <View style={styles.cabecalho}>
        <View style={styles.cadeado}>
          <Ionicons name="lock-closed-outline" size={30} color={cores.primaria} />
        </View>
        <Text accessibilityRole="header" style={styles.titulo}>
          Área dos adultos
        </Text>
        <Text style={styles.subtitulo}>Digite o PIN de 4 números</Text>
      </View>

      <View style={styles.pontos} accessible accessibilityLabel={`${pin.length} de 4 números digitados`}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.ponto, i < pin.length && styles.pontoCheio]} />
        ))}
      </View>

      <View style={{ flex: 1 }} />

      <View style={styles.teclado}>
        {TECLAS.map((t, i) =>
          t === '' ? (
            <View key={i} style={styles.tecla} />
          ) : (
            <Pressable
              key={i}
              onPress={() => apertar(t)}
              accessibilityRole="button"
              accessibilityLabel={t === 'apagar' ? 'Apagar' : t}
              style={({ pressed }) => [styles.tecla, t !== 'apagar' && styles.teclaNumero, pressed && { opacity: 0.6 }]}>
              {t === 'apagar' ? (
                <Ionicons name="backspace-outline" size={26} color={cores.textoSuave} />
              ) : (
                <Text style={styles.teclaTexto}>{t}</Text>
              )}
            </Pressable>
          ),
        )}
      </View>
      <Text style={styles.esqueci}>Esqueci o PIN</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: cores.fundo, padding: espaco.xxl, gap: espaco.xl },
  voltar: { flexDirection: 'row', alignItems: 'center', gap: espaco.xs, minHeight: 44, alignSelf: 'flex-start' },
  voltarTexto: { fontFamily: fontes.textoForte, fontSize: 14, color: cores.texto },
  cabecalho: { alignItems: 'center', gap: espaco.s, marginTop: espaco.l },
  cadeado: { width: 64, height: 64, borderRadius: 32, backgroundColor: cores.primariaClara, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontFamily: fontes.titulo, fontSize: 26, color: cores.texto },
  subtitulo: { fontFamily: fontes.texto, fontSize: 15, color: cores.textoSuave },
  pontos: { flexDirection: 'row', gap: espaco.l, justifyContent: 'center' },
  ponto: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#C9C9DE' },
  pontoCheio: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  teclado: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14, justifyContent: 'space-between' },
  tecla: { width: '30%', minHeight: 64, alignItems: 'center', justifyContent: 'center', borderRadius: raio.medio },
  teclaNumero: { backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda },
  teclaTexto: { fontFamily: fontes.titulo, fontSize: 26, color: cores.texto },
  esqueci: { textAlign: 'center', fontFamily: fontes.textoForte, fontSize: 14, color: cores.primaria },
});
