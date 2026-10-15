import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Respiracao } from '@/components/Respiracao';
import { useApp } from '@/state/AppState';
import { cores, espaco, fontes } from '@/theme/tokens';

/**
 * Botão X da lição: só sai se a pessoa segurar pelo tempo escolhido no Perfil (3 ou 5 s).
 * Um anel dourado vai enchendo enquanto segura. Soltou antes, volta a zero.
 */
function SairSegurando({ onSair, segundos }: { onSair: () => void; segundos: number }) {
  const progresso = useRef(new Animated.Value(0)).current;
  const [segurando, setSegurando] = useState(false);
  const anim = useRef<Animated.CompositeAnimation | null>(null);

  function comecar() {
    setSegurando(true);
    anim.current = Animated.timing(progresso, { toValue: 1, duration: segundos * 1000, useNativeDriver: false });
    anim.current.start(({ finished }) => {
      if (finished) {
        setSegurando(false);
        progresso.setValue(0);
        onSair();
      }
    });
  }
  function soltar() {
    anim.current?.stop();
    setSegurando(false);
    Animated.timing(progresso, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  }

  const largura = progresso.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <Pressable
        onPressIn={comecar}
        onPressOut={soltar}
        accessibilityRole="button"
        accessibilityLabel={`Segure ${segundos} segundos para sair da lição`}
        style={styles.x}>
        <Ionicons name="close" size={24} color={cores.licaoTextoSuave} />
        <View style={styles.barraFundo}>
          <Animated.View style={[styles.barra, { width: largura }]} />
        </View>
      </Pressable>
      <Text style={styles.xDica}>{segurando ? 'segure...' : 'segure'}</Text>
    </View>
  );
}

/** Moldura de toda tela da lição: fundo escuro, X de sair, título e barra de progresso em blocos. */
export function TelaLicao({
  titulo,
  subtitulo,
  progresso,
  total,
  children,
  rolar = true,
}: {
  titulo: string;
  subtitulo?: string;
  progresso?: number;
  total?: number;
  children: ReactNode;
  rolar?: boolean;
}) {
  const [pausada, setPausada] = useState(false);
  const [respirando, setRespirando] = useState(false);
  const [rodada, setRodada] = useState(0);
  const sairSeg = useApp().ajustes.sairSeg;
  const Corpo = rolar ? ScrollView : View;

  return (
    <SafeAreaView style={styles.raiz}>
      <View style={styles.topo}>
        {sairSeg > 0 ? <SairSegurando segundos={sairSeg} onSair={() => setPausada(true)} /> : <View style={{ width: 44 }} />}
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" style={styles.titulo}>
            {titulo}
          </Text>
          {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
        </View>
        {total ? <Text style={styles.contador}>{`${progresso ?? 0}/${total}`}</Text> : null}
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Pressable
            onPress={() => {
              setRodada((r) => r + 1);
              setRespirando(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Preciso de pausa: respirar um pouco"
            style={styles.pausa}>
            <Ionicons name="pause" size={22} color={cores.licaoTextoSuave} />
          </Pressable>
          <Text style={styles.xDica}>pausa</Text>
        </View>
      </View>

      {total ? (
        <View style={styles.blocos} accessible accessibilityLabel={`${progresso ?? 0} de ${total}`}>
          {Array.from({ length: total }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.bloco,
                i < (progresso ?? 0) && { backgroundColor: cores.ouro },
                i === (progresso ?? 0) && { borderWidth: 2, borderColor: cores.ouro },
              ]}
            />
          ))}
        </View>
      ) : null}

      <Corpo style={{ flex: 1 }} contentContainerStyle={rolar ? styles.corpo : undefined}>
        {rolar ? children : <View style={[styles.corpo, { flex: 1 }]}>{children}</View>}
      </Corpo>

      {/* Preciso de pausa: respiração guiada sem sair da lição. Fecha e volta exatamente de onde parou. */}
      <Modal visible={respirando} animationType="fade" onRequestClose={() => setRespirando(false)}>
        <SafeAreaView style={styles.respiraRaiz}>
          <Text accessibilityRole="header" style={styles.respiraTitulo}>
            Hora de respirar
          </Text>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Respiracao reiniciar={rodada} />
          </View>
          <View style={{ gap: 12, alignSelf: 'stretch' }}>
            <BotaoPixel titulo="Estou melhor" cor={cores.primaria} tinta="#FFFFFF" onPress={() => setRespirando(false)} />
            <Pressable onPress={() => setRodada((r) => r + 1)} accessibilityRole="button" style={styles.respiraMais}>
              <Text style={styles.respiraMaisTxt}>Mais um pouquinho</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={pausada} transparent animationType="fade" onRequestClose={() => setPausada(false)}>
        <View style={styles.veu}>
          <View style={styles.dialogo} accessibilityViewIsModal>
            <Text style={styles.dialogoTitulo}>Lição pausada</Text>
            <Text style={styles.dialogoTexto}>O progresso fica salvo. Dá pra continuar depois.</Text>
            <BotaoPixel titulo="Continuar lição" onPress={() => setPausada(false)} />
            <Pressable
              onPress={() => {
                setPausada(false);
                router.dismissTo('/crianca');
              }}
              accessibilityRole="button"
              style={styles.dialogoSair}>
              <Text style={styles.dialogoSairTexto}>Sair para o início</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/** Botão "de videogame": moldura escura, sombra dura que afunda ao apertar. */
export function BotaoPixel({
  titulo,
  onPress,
  cor = cores.ouro,
  tinta = '#2E1C00',
  sombra = cores.licaoBorda,
  grande,
  desativado,
  estilo,
}: {
  titulo: string;
  onPress: () => void;
  cor?: string;
  tinta?: string;
  sombra?: string;
  grande?: boolean;
  desativado?: boolean;
  estilo?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desativado}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.bp,
        { backgroundColor: cor, borderBottomColor: sombra, minHeight: grande ? 72 : 56 },
        pressed && { borderBottomWidth: 3, transform: [{ translateY: 4 }] },
        desativado && { opacity: 0.4 },
        estilo,
      ]}>
      <Text style={[styles.bpTexto, { color: tinta, fontSize: grande ? 28 : 20 }]}>{titulo}</Text>
    </Pressable>
  );
}

/** Cartão branco "flutuando" sobre o fundo escuro da lição (feedback, instruções). */
export function CaixaLicao({ children, cor = '#FFFFFF', estilo }: { children: ReactNode; cor?: string; estilo?: StyleProp<ViewStyle> }) {
  return <View style={[styles.caixa, { backgroundColor: cor }, estilo]}>{children}</View>;
}

/** Aparece de leve (opacidade), respeitando quem desligou animações. */
export function Surgir({ children }: { children: ReactNode }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, []);
  return <Animated.View style={{ opacity: v }}>{children}</Animated.View>;
}

export const estilosLicao = StyleSheet.create({
  pixelTitulo: { fontFamily: fontes.pixel, color: '#FFFFFF' },
});

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: cores.licaoFundo },
  topo: { flexDirection: 'row', alignItems: 'center', gap: espaco.m, paddingHorizontal: espaco.xl, paddingTop: espaco.s },
  x: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: cores.licaoSuperficie,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  barraFundo: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 6, backgroundColor: '#3B3570' },
  barra: { height: 6, backgroundColor: cores.ouro },
  xDica: { fontFamily: fontes.texto, fontSize: 11, color: '#8E89C9' },
  titulo: { fontFamily: fontes.pixel, fontSize: 24, color: '#FFFFFF' },
  subtitulo: { fontFamily: fontes.texto, fontSize: 14, color: cores.licaoTextoSuave },
  pausa: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: cores.licaoBorda, alignItems: 'center', justifyContent: 'center' },
  respiraRaiz: { flex: 1, backgroundColor: '#E8F6FD', padding: espaco.xxl, alignItems: 'center' },
  respiraTitulo: { fontFamily: fontes.titulo, fontSize: 30, color: cores.texto, marginTop: espaco.xl },
  respiraMais: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  respiraMaisTxt: { fontFamily: fontes.textoForte, fontSize: 16, color: cores.primaria },
  contador: { fontFamily: fontes.pixel, fontSize: 20, color: cores.ouroClaro },
  blocos: { flexDirection: 'row', gap: 5, paddingHorizontal: espaco.xl, marginTop: espaco.m },
  bloco: { flex: 1, height: 12, backgroundColor: '#3B3570' },
  corpo: { padding: espaco.xl, gap: espaco.m },
  veu: { flex: 1, backgroundColor: 'rgba(15,13,51,0.85)', alignItems: 'center', justifyContent: 'center', padding: espaco.xxl },
  dialogo: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 22, gap: 12 },
  dialogoTitulo: { fontFamily: fontes.pixel, fontSize: 24, color: cores.texto, textAlign: 'center' },
  dialogoTexto: { fontFamily: fontes.texto, fontSize: 15, color: cores.textoSuave, textAlign: 'center' },
  dialogoSair: { minHeight: 48, borderRadius: 16, borderWidth: 2, borderColor: cores.primaria, alignItems: 'center', justifyContent: 'center' },
  dialogoSairTexto: { fontFamily: fontes.textoForte, fontSize: 16, color: cores.primaria },
  bp: {
    borderRadius: 14,
    borderWidth: 3,
    borderColor: cores.licaoBorda,
    borderBottomWidth: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  bpTexto: { fontFamily: fontes.pixel },
  caixa: {
    borderRadius: 16,
    borderWidth: 3,
    borderColor: cores.licaoBorda,
    borderBottomWidth: 7,
    padding: espaco.l,
    gap: espaco.s,
  },
});
