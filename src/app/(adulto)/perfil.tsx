import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { EmConstrucao } from '@/components/EmConstrucao';
import { Tela } from '@/components/Tela';
import { cores, fontes } from '@/theme/tokens';

export default function Perfil() {
  return (
    <Tela titulo="Perfil">
      <EmConstrucao fase="FASE 2" descricao="Dados da criança, pessoas com acesso (remover profissional), hábitos da casa e ajustes de acessibilidade." />
      <Pressable
        onPress={() => router.replace('/')}
        accessibilityRole="button"
        style={styles.sair}>
        <Text style={styles.sairTexto}>Voltar ao modo criança</Text>
      </Pressable>
    </Tela>
  );
}

const styles = StyleSheet.create({
  sair: { minHeight: 52, borderRadius: 26, borderWidth: 2, borderColor: cores.borda, alignItems: 'center', justifyContent: 'center' },
  sairTexto: { fontFamily: fontes.textoForte, fontSize: 16, color: cores.texto },
});
