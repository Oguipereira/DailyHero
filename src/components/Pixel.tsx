import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

/**
 * Desenho em pixel art feito de retângulos.
 * Cada item é [x, y, largura, altura, cor] na grade; `escala` diz quantos pontos vale 1 pixel.
 */
export type Ret = [number, number, number, number, string];

export function Pixel({
  largura,
  altura,
  escala,
  rets,
  fundo,
  estilo,
  children,
}: {
  largura: number;
  altura: number;
  escala: number;
  rets: Ret[];
  fundo?: string;
  estilo?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  return (
    <View style={[{ width: largura * escala, height: altura * escala, backgroundColor: fundo }, estilo]}>
      {rets.map(([x, y, w, h, c], i) => (
        <View
          key={i}
          style={{ position: 'absolute', left: x * escala, top: y * escala, width: w * escala, height: h * escala, backgroundColor: c }}
        />
      ))}
      {children}
    </View>
  );
}

/** O herói (uma criança) em pixel art, de frente. */
export function heroi(dx = 0, dy = 0): Ret[] {
  const r = (x: number, y: number, w: number, h: number, c: string): Ret => [x + dx, y + dy, w, h, c];
  return [
    r(1, 8, 10, 7, '#FFB21E'),
    r(3, 0, 6, 2, '#2A2550'),
    r(3, 2, 6, 4, '#F2C29A'),
    r(4, 3, 1, 1, '#2A2550'),
    r(7, 3, 1, 1, '#2A2550'),
    r(5, 5, 2, 1, '#C0583A'),
    r(3, 6, 6, 6, '#4B4FE0'),
    r(5, 7, 2, 2, '#FFD83D'),
    r(1, 7, 2, 4, '#4B4FE0'),
    r(9, 7, 2, 4, '#4B4FE0'),
    r(1, 11, 2, 1, '#F2C29A'),
    r(9, 11, 2, 1, '#F2C29A'),
    r(3, 12, 2, 3, '#2A2550'),
    r(7, 12, 2, 3, '#2A2550'),
    r(3, 15, 2, 1, '#FF7A59'),
    r(7, 15, 2, 1, '#FF7A59'),
  ];
}

type Expressao = 'feliz' | 'triste' | 'bravo' | 'assustado' | 'calmo';

/** Rosto 16x16 em pixel art para o Jogo das emoções. */
export function rosto(expressao: Expressao, pele = '#F2C29A'): Ret[] {
  const base: Ret[] = [
    [3, 2, 10, 1, '#2A2550'],
    [2, 3, 1, 11, '#2A2550'],
    [13, 3, 1, 11, '#2A2550'],
    [3, 14, 10, 1, '#2A2550'],
    [3, 3, 10, 11, pele],
    [3, 3, 10, 2, '#2A2550'],
  ];
  const olhos: Ret[] = [
    [5, 7, 1, 2, '#2A2550'],
    [10, 7, 1, 2, '#2A2550'],
  ];
  switch (expressao) {
    case 'feliz':
      return [...base, ...olhos, [4, 10, 1, 1, '#2A2550'], [11, 10, 1, 1, '#2A2550'], [5, 11, 6, 1, '#2A2550']];
    case 'triste':
      return [...base, ...olhos, [6, 11, 4, 1, '#2A2550'], [5, 12, 1, 1, '#2A2550'], [10, 12, 1, 1, '#2A2550'], [4, 9, 1, 2, '#5CC8F2']];
    case 'bravo':
      return [...base, [4, 6, 2, 1, '#2A2550'], [10, 6, 2, 1, '#2A2550'], [5, 7, 1, 1, '#2A2550'], [10, 7, 1, 1, '#2A2550'], [5, 11, 6, 1, '#2A2550']];
    case 'assustado':
      return [...base, [5, 7, 2, 2, '#2A2550'], [9, 7, 2, 2, '#2A2550'], [7, 10, 2, 2, '#2A2550']];
    case 'calmo':
      return [...base, [5, 8, 2, 1, '#2A2550'], [9, 8, 2, 1, '#2A2550'], [6, 11, 4, 1, '#2A2550']];
  }
}
