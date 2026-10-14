import { Image } from 'expo-image';
import { useEffect, useId, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Polygon, Stop } from 'react-native-svg';

import { useMovimentoReduzido } from '@/hooks/useMovimentoReduzido';

const CRISTAL = require('@/assets/images/marca/logo-cristal.png');
const QUEBRADO = require('@/assets/images/marca/logo-cristal-quebrado.png');

/**
 * Desenho do logo plano (o mesmo do canvas), em vetor: fica nítido em qualquer tamanho.
 * Coordenadas num quadrado de 100 × 100.
 */
const SEGMENTOS = [
  { d: 'M48.53 8.03 A42 42 0 0 0 22.59 18.18 L30.42 27.27 A30 30 0 0 1 48.95 20.02 Z', cor: '#5CC8F2', atraso: 0 },
  { d: 'M18.91 21.76 A42 42 0 0 0 8.08 47.44 L20.06 48.17 A30 30 0 0 1 27.79 29.83 Z', cor: '#6DD3F3', atraso: 100 },
  { d: 'M8.08 52.56 A42 42 0 0 0 18.91 78.24 L27.79 70.17 A30 30 0 0 1 20.06 51.83 Z', cor: '#82E3C6', atraso: 200 },
  { d: 'M22.59 81.82 A42 42 0 0 0 48.53 91.97 L48.95 79.98 A30 30 0 0 1 30.42 72.73 Z', cor: '#C8E88A', atraso: 300 },
];
const ARCO = 'M52 8.05 A42 42 0 0 1 52 91.95 L52 80.9 A24 31 0 0 0 52 19.1 Z';
const ESTRELA = '50,37 53.29,45.47 62.36,45.98 55.33,51.73 57.64,60.52 50,55.6 42.36,60.52 44.67,51.73 37.64,45.98 46.71,45.47';
const BRILHOS = [
  { cx: 66, cy: 16, r: 1.4 },
  { cx: 76, cy: 44, r: 1.1 },
];

/** Id único para os degradês (o SVG não aceita ":" no id). */
function useIdSvg(prefixo: string) {
  return prefixo + useId().replace(/[^a-zA-Z0-9]/g, '');
}

function GradArco({ id }: { id: string }) {
  return (
    <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <Stop offset="0%" stopColor="#3D6BF2" />
      <Stop offset="55%" stopColor="#7B5CF0" />
      <Stop offset="100%" stopColor="#C46BE6" />
    </LinearGradient>
  );
}

function GradEstrela({ id }: { id: string }) {
  return (
    <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <Stop offset="0%" stopColor="#FFD83D" />
      <Stop offset="100%" stopColor="#FF980A" />
    </LinearGradient>
  );
}

/** Logo plano parado: anel + estrela. */
function LogoPlano({ tamanho }: { tamanho: number }) {
  const arco = useIdSvg('arco');
  const estrela = useIdSvg('estrela');
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 100 100" accessibilityLabel="Logo do Daily Hero">
      <Defs>
        <GradArco id={arco} />
        <GradEstrela id={estrela} />
      </Defs>
      {SEGMENTOS.map((s) => (
        <Path key={s.d} d={s.d} fill={s.cor} stroke={s.cor} strokeWidth={2.5} strokeLinejoin="round" />
      ))}
      <Path d={ARCO} fill={`url(#${arco})`} stroke={`url(#${arco})`} strokeWidth={2.5} strokeLinejoin="round" />
      <Polygon points={ESTRELA} fill={`url(#${estrela})`} stroke={`url(#${estrela})`} strokeWidth={3} strokeLinejoin="round" />
    </Svg>
  );
}

/**
 * Logo do Daily Hero.
 * - plano (padrão): abertura, login, telas dos adultos
 * - cristal: boas-vindas depois do cadastro
 * - quebrado: tela de erro
 */
export function Logo({ tamanho, variante = 'plano' }: { tamanho: number; variante?: 'plano' | 'cristal' | 'quebrado' }) {
  if (variante === 'plano') return <LogoPlano tamanho={tamanho} />;
  return (
    <Image
      source={variante === 'quebrado' ? QUEBRADO : CRISTAL}
      style={{ width: tamanho, height: tamanho }}
      contentFit="contain"
      accessibilityLabel={variante === 'quebrado' ? 'Logo do Daily Hero com as peças soltas' : 'Logo do Daily Hero em cristal'}
    />
  );
}

// ------------------------------------------------------------------ abertura animada

/** Duração da animação da abertura (igual ao canvas: tudo assenta até 3,6 s). */
export const DURACAO_ABERTURA = 3600;
const SUAVE = Easing.bezier(0.2, 0.8, 0.2, 1);

/**
 * O celular (animação nativa) não aceita "easing" dentro de interpolate.
 * Então a curva suave do canvas vira 13 pontos amostrados: mesmo movimento, funciona em todo lugar.
 */
const AMOSTRAS = [0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
function curvaSuave(t: Animated.Value, ate: number, de: number, para: number, unidade = '') {
  return t.interpolate({
    inputRange: AMOSTRAS.map((x) => x * ate),
    outputRange: AMOSTRAS.map((x) => {
      const v = de + (para - de) * SUAVE(x);
      return unidade ? `${v}${unidade}` : v;
    }) as number[] | string[],
    extrapolate: 'clamp',
  });
}

/**
 * Relógio da abertura: vai de 0 a 3600 (milissegundos), uma vez só.
 * A tela usa o mesmo relógio para fazer o nome aparecer na hora certa.
 * Com "reduzir movimento", já começa no fim (tudo parado no lugar).
 */
export function useRelogioAbertura() {
  const reduzido = useMovimentoReduzido();
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduzido) {
      t.setValue(DURACAO_ABERTURA);
      return;
    }
    t.setValue(0);
    const anim = Animated.timing(t, { toValue: DURACAO_ABERTURA, duration: DURACAO_ABERTURA, easing: Easing.linear, useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [reduzido]);
  return t;
}

/**
 * Logo da abertura, com a animação do canvas (tela A0):
 * 1. o anel entra girando de -300° e crescendo (0 a 1,6 s)
 * 2. os segmentos acendem um depois do outro
 * 3. a estrela pula no centro (1,3 a 2,1 s)
 * 4. dois brilhos piscam no arco (2 a 2,9 s)
 */
export function LogoAbertura({ tamanho, relogio: t }: { tamanho: number; relogio: Animated.Value }) {
  const arco = useIdSvg('arcoA');
  const estrela = useIdSvg('estrelaA');

  const anel = {
    opacity: t.interpolate({ inputRange: [0, 400], outputRange: [0, 1], extrapolate: 'clamp' }),
    transform: [
      { rotate: curvaSuave(t, 1600, -300, 0, 'deg') },
      { scale: curvaSuave(t, 1600, 0.7, 1) },
    ],
  };
  const acende = (atraso: number) => ({
    opacity: t.interpolate({ inputRange: [atraso, atraso + 320], outputRange: [0, 1], extrapolate: 'clamp' }),
  });
  const pulo = {
    transform: [
      { scale: t.interpolate({ inputRange: [0, 1280, 1760, 2080], outputRange: [0, 0, 1.2, 1], extrapolate: 'clamp' }) },
      { rotate: t.interpolate({ inputRange: [0, 1280, 1760, 2080], outputRange: ['-45deg', '-45deg', '8deg', '0deg'], extrapolate: 'clamp' }) },
    ],
  };
  const brilho = { opacity: t.interpolate({ inputRange: [0, 2000, 2320, 2880], outputRange: [0, 0, 1, 0], extrapolate: 'clamp' }) };

  const camada = { position: 'absolute' as const, width: tamanho, height: tamanho };

  return (
    <View style={{ width: tamanho, height: tamanho }} accessible accessibilityRole="image" accessibilityLabel="Logo do Daily Hero">
      <Animated.View style={[camada, anel]}>
        {SEGMENTOS.map((s) => (
          <Animated.View key={s.d} style={[StyleSheet.absoluteFill, acende(s.atraso)]}>
            <Svg width={tamanho} height={tamanho} viewBox="0 0 100 100">
              <Path d={s.d} fill={s.cor} stroke={s.cor} strokeWidth={2.5} strokeLinejoin="round" />
            </Svg>
          </Animated.View>
        ))}
        <Animated.View style={[StyleSheet.absoluteFill, acende(150)]}>
          <Svg width={tamanho} height={tamanho} viewBox="0 0 100 100">
            <Defs>
              <GradArco id={arco} />
            </Defs>
            <Path d={ARCO} fill={`url(#${arco})`} stroke={`url(#${arco})`} strokeWidth={2.5} strokeLinejoin="round" />
          </Svg>
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, brilho]}>
          <Svg width={tamanho} height={tamanho} viewBox="0 0 100 100">
            {BRILHOS.map((b) => (
              <Circle key={b.cx} cx={b.cx} cy={b.cy} r={b.r} fill="#FFFFFF" />
            ))}
          </Svg>
        </Animated.View>
      </Animated.View>
      <Animated.View style={[camada, pulo]}>
        <Svg width={tamanho} height={tamanho} viewBox="0 0 100 100">
          <Defs>
            <GradEstrela id={estrela} />
          </Defs>
          <Polygon points={ESTRELA} fill={`url(#${estrela})`} stroke={`url(#${estrela})`} strokeWidth={3} strokeLinejoin="round" />
        </Svg>
      </Animated.View>
    </View>
  );
}
