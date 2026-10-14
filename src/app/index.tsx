import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LogoGirando } from '@/components/Logo';
import { useApp } from '@/state/AppState';
import { cores, fontes } from '@/theme/tokens';

/** Abertura: o logo entra girando. Toque para entrar. */
export default function Abertura() {
  const { logado } = useApp();
  const [pronto, setPronto] = useState(false);

  function entrar() {
    router.replace(logado ? '/crianca' : '/login');
  }

  return (
    <SafeAreaView style={styles.raiz}>
      <Pressable style={styles.area} onPress={entrar} accessibilityRole="button" accessibilityLabel="Entrar no Daily Hero">
        <LogoGirando tamanho={230} aoTerminar={() => setPronto(true)} />
        <View style={{ alignItems: 'center', gap: 6, opacity: pronto ? 1 : 0 }}>
          <Text style={styles.nome}>
            Daily <Text style={{ color: cores.primaria }}>Hero</Text>
          </Text>
          <Text style={styles.lema}>Um pouquinho todo dia</Text>
        </View>
      </Pressable>
      <Text style={[styles.toque, { opacity: pronto ? 1 : 0 }]}>Toque para entrar</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: '#FFFFFF' },
  area: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28 },
  nome: { fontFamily: fontes.titulo, fontSize: 40, color: cores.texto },
  lema: { fontFamily: fontes.textoForte, fontSize: 17, color: cores.textoSuave },
  toque: { textAlign: 'center', fontFamily: fontes.textoForte, fontSize: 15, color: cores.textoSuave, paddingBottom: 32 },
});
