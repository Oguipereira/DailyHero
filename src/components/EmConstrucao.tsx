import { StyleSheet, Text, View } from 'react-native';

import { cores, espaco, fontes, raio } from '@/theme/tokens';

type Props = { fase: string; descricao: string };

/** Cartão provisório: marca o que ainda vai ser construído e em qual fase do plano. */
export function EmConstrucao({ fase, descricao }: Props) {
  return (
    <View style={styles.cartao}>
      <Text style={styles.fase}>{fase}</Text>
      <Text style={styles.descricao}>{descricao}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficie,
    borderColor: cores.borda,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: raio.medio,
    padding: espaco.l,
    gap: espaco.xs,
  },
  fase: { fontFamily: fontes.textoForte, fontSize: 13, color: cores.primaria, letterSpacing: 0.5 },
  descricao: { fontFamily: fontes.texto, fontSize: 15, color: cores.textoSuave },
});
