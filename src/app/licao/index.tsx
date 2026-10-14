import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { EmConstrucao } from '@/components/EmConstrucao';
import { Tela } from '@/components/Tela';
import { cores, fontes } from '@/theme/tokens';

/** Lição diária. Na fase 3 vira a casa em pixel art, as tarefas com animação e os 3 jogos. */
export default function Licao() {
  return (
    <Tela tema="licao" titulo="Tasks da casa" subtitulo="A lição do dia começa aqui">
      <EmConstrucao
        fase="FASE 3"
        descricao="Casa vista de cima, tarefas com animação (assistir e pôr em ordem), jogos de Emoções, Memória e Montar figuras, e a saída segurando 3 segundos."
      />
      <Pressable onPress={() => router.back()} accessibilityRole="button" style={styles.voltar}>
        <Text style={styles.voltarTexto}>Voltar</Text>
      </Pressable>
    </Tela>
  );
}

const styles = StyleSheet.create({
  voltar: { minHeight: 52, borderRadius: 16, backgroundColor: cores.ouro, alignItems: 'center', justifyContent: 'center' },
  voltarTexto: { fontFamily: fontes.pixel, fontSize: 20, color: '#2E1C00' },
});
