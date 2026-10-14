import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { useMovimentoReduzido } from '@/hooks/useMovimentoReduzido';
import { cores, espaco, fontes, raio } from '@/theme/tokens';

const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'apagar'];
export const TAMANHO_PIN = 4;

type Props = {
  titulo: string;
  subtitulo: string;
  /** Chamado com os 4 números. Devolva uma mensagem de erro para tremer e limpar, ou nada se deu certo. */
  aoCompletar: (pin: string) => string | void | Promise<string | void>;
  /** Enquanto for maior que zero, o teclado fica travado com a contagem na tela. */
  travadoSeg?: number;
  /** Muda quando a etapa muda, para limpar os pontos. */
  etapa?: string;
  rodape?: ReactNode;
};

/** Teclado numérico do PIN: pontos, tremida no erro e trava por tempo. */
export function TecladoPin({ titulo, subtitulo, aoCompletar, travadoSeg = 0, etapa, rodape }: Props) {
  const [pin, setPin] = useState('');
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const tremer = useRef(new Animated.Value(0)).current;
  const reduzido = useMovimentoReduzido();
  const travado = travadoSeg > 0;

  // Etapa nova: limpa os pontos (o erro fica até a próxima tecla, para dar tempo de ler).
  useEffect(() => {
    setPin('');
  }, [etapa]);

  function mostrarErro(msg: string) {
    setErro(msg);
    AccessibilityInfo.announceForAccessibility(msg);
    if (reduzido) return;
    tremer.setValue(0);
    Animated.sequence(
      [10, -10, 7, -7, 0].map((v) => Animated.timing(tremer, { toValue: v, duration: 55, useNativeDriver: true })),
    ).start();
  }

  function apertar(tecla: string) {
    if (travado || ocupado) return;
    if (tecla === 'apagar') return setPin((p) => p.slice(0, -1));
    const novo = (pin + tecla).slice(0, TAMANHO_PIN);
    setPin(novo);
    setErro('');
    if (novo.length === TAMANHO_PIN) {
      setOcupado(true);
      setTimeout(async () => {
        const msg = await aoCompletar(novo);
        setOcupado(false);
        setPin('');
        if (msg) mostrarErro(msg);
      }, 150);
    }
  }

  return (
    <View style={{ flex: 1, gap: espaco.xl }}>
      <View style={styles.cabecalho}>
        <View style={styles.cadeado}>
          <Ionicons name={travado ? 'time-outline' : 'lock-closed-outline'} size={30} color={cores.primaria} />
        </View>
        <Text accessibilityRole="header" style={styles.titulo}>
          {titulo}
        </Text>
        <Text style={styles.subtitulo}>{subtitulo}</Text>
      </View>

      <Animated.View
        style={[styles.pontos, { transform: [{ translateX: tremer }] }]}
        accessible
        accessibilityLabel={`${pin.length} de ${TAMANHO_PIN} números digitados`}>
        {Array.from({ length: TAMANHO_PIN }, (_, i) => (
          <View key={i} style={[styles.ponto, i < pin.length && styles.pontoCheio, erro !== '' && styles.pontoErro]} />
        ))}
      </Animated.View>

      <Text style={[styles.erro, travado && { color: cores.textoSuave }]} accessibilityLiveRegion="polite">
        {travado ? `Muitas tentativas. Tente de novo em ${travadoSeg} s.` : erro}
      </Text>

      <View style={{ flex: 1 }} />

      <View style={[styles.teclado, travado && { opacity: 0.35 }]}>
        {TECLAS.map((t, i) =>
          t === '' ? (
            <View key={i} style={styles.tecla} />
          ) : (
            <Pressable
              key={i}
              disabled={travado}
              onPress={() => apertar(t)}
              accessibilityRole="button"
              accessibilityLabel={t === 'apagar' ? 'Apagar' : t}
              style={({ pressed }) => [styles.tecla, t !== 'apagar' && styles.teclaNumero, pressed && { opacity: 0.6 }]}>
              {t === 'apagar' ? (
                <Ionicons name="backspace-outline" size={26} color={cores.textoSuave} />
              ) : (
                <Text style={styles.teclaTexto}>{t}</Text>
              )}
            </Pressable>
          ),
        )}
      </View>
      {rodape}
    </View>
  );
}

/** PIN que uma criança acerta chutando: tudo igual (0000) ou em sequência (1234, 4321). */
export function pinFacilDemais(pin: string) {
  const d = pin.split('').map(Number);
  if (d.every((x) => x === d[0])) return true;
  const sobe = d.every((x, i) => i === 0 || x === d[i - 1] + 1);
  const desce = d.every((x, i) => i === 0 || x === d[i - 1] - 1);
  return sobe || desce;
}

const styles = StyleSheet.create({
  cabecalho: { alignItems: 'center', gap: espaco.s, marginTop: espaco.l },
  cadeado: { width: 64, height: 64, borderRadius: 32, backgroundColor: cores.primariaClara, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontFamily: fontes.titulo, fontSize: 26, color: cores.texto, textAlign: 'center' },
  subtitulo: { fontFamily: fontes.texto, fontSize: 15, color: cores.textoSuave, textAlign: 'center' },
  pontos: { flexDirection: 'row', gap: espaco.l, justifyContent: 'center' },
  ponto: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#C9C9DE' },
  pontoCheio: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  pontoErro: { borderColor: '#9C1F63' },
  erro: { minHeight: 20, textAlign: 'center', fontFamily: fontes.textoForte, fontSize: 14, color: '#9C1F63' },
  teclado: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14, justifyContent: 'space-between' },
  tecla: { width: '30%', minHeight: 64, alignItems: 'center', justifyContent: 'center', borderRadius: raio.medio },
  teclaNumero: { backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda },
  teclaTexto: { fontFamily: fontes.titulo, fontSize: 26, color: cores.texto },
});
