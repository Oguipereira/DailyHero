import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { cores, fontes } from '@/theme/tokens';

/** Campo de texto com rótulo e dica opcional. */
export function Campo({ rotulo, dica, ...props }: { rotulo: string; dica?: string } & TextInputProps) {
  return (
    <View style={{ gap: 6, flex: 1 }}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput
        accessibilityLabel={rotulo}
        placeholderTextColor="#8A8AA8"
        style={styles.input}
        {...props}
      />
      {dica ? <Text style={styles.dica}>{dica}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  rotulo: { fontFamily: fontes.textoForte, fontSize: 14, color: cores.texto },
  input: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: cores.borda,
    backgroundColor: '#F8F8FD',
    paddingHorizontal: 14,
    fontFamily: fontes.texto,
    fontSize: 16,
    color: cores.texto,
  },
  dica: { fontFamily: fontes.texto, fontSize: 12, color: cores.textoSuave },
});
