import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/Logo';
import { Botao } from '@/components/ui';
import { useApp } from '@/state/AppState';
import { cores, espaco, fontes } from '@/theme/tokens';

/**
 * Onde o link de confirmação do e-mail cai (exp://…/--/confirmado ou dailyhero://confirmado).
 * A conta já foi confirmada pelo Supabase antes de chegar aqui; só falta entrar.
 */
export default function Confirmado() {
  const { emailConta } = useApp();
  return (
    <SafeAreaView style={styles.raiz}>
      <View style={styles.centro}>
        <Logo tamanho={120} />
        <Text accessibilityRole="header" style={styles.titulo}>
          E-mail confirmado!
        </Text>
        <Text style={styles.sub}>
          {emailConta ? `A conta ${emailConta} está pronta.` : 'Sua conta está pronta.'} Agora é só entrar.
        </Text>
      </View>
      <Botao titulo="Entrar" onPress={() => router.replace('/login')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: '#FFFFFF', padding: espaco.xxl, gap: espaco.xl },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: espaco.m },
  titulo: { fontFamily: fontes.titulo, fontSize: 28, color: cores.texto, textAlign: 'center' },
  sub: { fontFamily: fontes.texto, fontSize: 16, color: cores.textoSuave, textAlign: 'center', lineHeight: 22 },
});
