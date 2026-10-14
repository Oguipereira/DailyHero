import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

import { useMovimentoReduzido } from '@/hooks/useMovimentoReduzido';

const CRISTAL = require('@/assets/images/marca/logo-cristal.png');
const QUEBRADO = require('@/assets/images/marca/logo-cristal-quebrado.png');

/** Logo em cristal parado (ou quebrado, na tela de erro). */
export function Logo({ tamanho, quebrado }: { tamanho: number; quebrado?: boolean }) {
  return (
    <Image
      source={quebrado ? QUEBRADO : CRISTAL}
      style={{ width: tamanho, height: tamanho }}
      contentFit="contain"
      accessibilityLabel={quebrado ? 'Logo do Daily Hero com as peças soltas' : 'Logo do Daily Hero'}
    />
  );
}

/**
 * Logo da abertura: entra girando e para no lugar, depois flutua devagar.
 * Se o celular estiver com "reduzir movimento", aparece parado.
 */
export function LogoGirando({ tamanho, aoTerminar }: { tamanho: number; aoTerminar?: () => void }) {
  const reduzido = useMovimentoReduzido();
  const giro = useRef(new Animated.Value(0)).current;
  const flutua = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduzido) {
      giro.setValue(1);
      const t = setTimeout(() => aoTerminar?.(), 600);
      return () => clearTimeout(t);
    }
    Animated.timing(giro, { toValue: 1, duration: 1600, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => {
      aoTerminar?.();
      Animated.loop(
        Animated.sequence([
          Animated.timing(flutua, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(flutua, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ).start();
    });
  }, [reduzido]);

  const rotate = giro.interpolate({ inputRange: [0, 1], outputRange: ['-300deg', '0deg'] });
  const scale = giro.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const translateY = flutua.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  return (
    <View style={{ width: tamanho, height: tamanho }}>
      <Animated.View style={{ opacity: giro, transform: [{ translateY }, { rotate }, { scale }] }}>
        <Logo tamanho={tamanho} />
      </Animated.View>
    </View>
  );
}
