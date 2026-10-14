import { Pressable, StyleSheet, Text } from 'react-native';

import { cores, fontes } from '@/theme/tokens';

type Props = { onPress: () => void; rotulo?: string };

/** O botão PLAY em pixel art, igual ao do canvas (moldura escura e sombra "dura"). */
export function BotaoPlay({ onPress, rotulo = 'PLAY' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Play: começar a lição de hoje"
      style={({ pressed }) => [styles.botao, pressed && styles.pressionado]}>
      <Text style={styles.texto}>{rotulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    minHeight: 84,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.ouro,
    borderWidth: 4,
    borderColor: cores.licaoBorda,
    borderRadius: 16,
    borderBottomWidth: 10,
  },
  pressionado: { borderBottomWidth: 4, transform: [{ translateY: 6 }] },
  texto: { fontFamily: fontes.pixel, fontSize: 42, letterSpacing: 4, color: '#2A2550' },
});
