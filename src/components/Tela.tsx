import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ReactElement, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type RefreshControlProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cores, espaco, fontes, TOQUE_MINIMO } from '@/theme/tokens';

type Props = {
  titulo?: string;
  subtitulo?: string;
  /** Rótulo em cima do título, ex.: "ÁREA DO RESPONSÁVEL" */
  sobretitulo?: string;
  /** Mostra o botão de voltar no topo. */
  voltar?: boolean;
  /** Elemento à direita do título (ex.: um botão). */
  direita?: ReactNode;
  /** Conteúdo fixo no rodapé (ex.: botão principal). */
  rodape?: ReactNode;
  fundo?: string;
  /** Sem a área segura de baixo (quando há barra de abas). */
  comAbas?: boolean;
  /** Puxar para atualizar (um <RefreshControl />). */
  rolagem?: ReactElement<RefreshControlProps>;
  children?: ReactNode;
};

/** Moldura padrão das telas da área dos adultos. */
export function Tela({ titulo, subtitulo, sobretitulo, voltar, direita, rodape, fundo = cores.fundo, comAbas, rolagem, children }: Props) {
  return (
    <SafeAreaView style={[styles.raiz, { backgroundColor: fundo }]} edges={comAbas ? ['top', 'left', 'right'] : undefined}>
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled" refreshControl={rolagem}>
        {titulo || voltar ? (
          <View style={styles.cabecalho}>
            {voltar ? (
              <Pressable
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
                accessibilityRole="button"
                accessibilityLabel="Voltar"
                hitSlop={6}
                style={styles.voltar}>
                <Ionicons name="chevron-back" size={22} color={cores.texto} />
              </Pressable>
            ) : null}
            <View style={{ flex: 1, gap: 2 }}>
              {sobretitulo ? <Text style={styles.sobretitulo}>{sobretitulo}</Text> : null}
              {titulo ? (
                <Text accessibilityRole="header" style={styles.titulo}>
                  {titulo}
                </Text>
              ) : null}
              {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
            </View>
            {direita}
          </View>
        ) : null}
        {children}
      </ScrollView>
      {rodape ? <View style={styles.rodape}>{rodape}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1 },
  conteudo: { padding: espaco.xl, gap: espaco.m, flexGrow: 1 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: espaco.m, marginBottom: espaco.xs },
  voltar: {
    width: TOQUE_MINIMO,
    height: TOQUE_MINIMO,
    borderRadius: TOQUE_MINIMO / 2,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sobretitulo: { fontFamily: fontes.textoForte, fontSize: 12, color: cores.primaria, letterSpacing: 0.5 },
  titulo: { fontFamily: fontes.titulo, fontSize: 26, color: cores.texto },
  subtitulo: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoSuave },
  rodape: { paddingHorizontal: espaco.xl, paddingBottom: espaco.l, paddingTop: espaco.s, gap: espaco.s },
});
