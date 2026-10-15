import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cores, espaco, fontes } from '@/theme/tokens';

type Props = {
  titulo?: string;
  subtitulo?: string;
  /** "adulto" = fundo claro; "licao" = fundo escuro da lição em pixel art */
  tema?: 'adulto' | 'licao';
  children?: ReactNode;
};

/** Moldura padrão de toda tela: respeita o entalhe do celular, fundo e título. */
export function Tela({ titulo, subtitulo, tema = 'adulto', children }: Props) {
  const escuro = tema === 'licao';
  return (
    <SafeAreaView style={[styles.raiz, { backgroundColor: escuro ? cores.licaoFundo : cores.fundo }]}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        {titulo ? (
          <View style={styles.cabecalho}>
            <Text
              accessibilityRole="header"
              style={[styles.titulo, { color: escuro ? '#FFFFFF' : cores.texto }]}>
              {titulo}
            </Text>
            {subtitulo ? (
              <Text style={[styles.subtitulo, { color: escuro ? cores.licaoTextoSuave : cores.textoSuave }]}>
                {subtitulo}
              </Text>
            ) : null}
          </View>
        ) : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1 },
  conteudo: { padding: espaco.xl, gap: espaco.m, flexGrow: 1 },
  cabecalho: { gap: espaco.xs, marginBottom: espaco.s },
  titulo: { fontFamily: fontes.titulo, fontSize: 28 },
  subtitulo: { fontFamily: fontes.texto, fontSize: 15 },
});
