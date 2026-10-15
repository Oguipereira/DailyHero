import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { Pixel, heroi, type Ret } from '@/components/Pixel';
import type { HabitoId } from '@/data/catalogo';
import { fontes } from '@/theme/tokens';

/** Grade da casa: 96 x 112 "pixels". Quarto e banheiro em cima, sala e cozinha embaixo. */
export const CASA_L = 96;
export const CASA_A = 112;

const P = '#2A2550';

const CASA: Ret[] = [
  // chão dos cômodos
  [2, 2, 44, 48, '#E8C391'],
  [50, 2, 44, 48, '#D6F1FB'],
  [2, 54, 44, 56, '#CFF2E4'],
  [50, 54, 44, 56, '#FFF1CF'],
  // tábuas do quarto
  ...[9, 17, 25, 33, 41].map((y): Ret => [2, y, 44, 1, '#D4AB75']),
  // azulejos do banheiro
  ...[12, 22, 32, 42].map((y): Ret => [50, y, 44, 1, '#BCE4F4']),
  ...[56, 63, 70, 77, 84].map((x): Ret => [x, 2, 1, 48, '#BCE4F4']),
  // xadrez da cozinha
  ...[[50, 66], [72, 66], [61, 77], [83, 77], [50, 88], [72, 88], [61, 99], [83, 99]].map(([x, y]): Ret => [x, y, 11, 11, '#FFE4A6']),
  // portas
  [46, 22, 4, 8, '#E8C391'],
  [18, 50, 10, 4, '#E8C391'],
  [68, 50, 10, 4, '#D6F1FB'],
  [46, 78, 4, 8, '#CFF2E4'],
  [18, 110, 10, 2, '#C98A4B'],
  // QUARTO: cama, armário, tapete
  [5, 5, 16, 24, P], [6, 6, 14, 22, '#7B5CF0'], [8, 7, 10, 5, '#FFFFFF'], [6, 13, 14, 15, '#A78BFA'],
  [33, 3, 12, 14, P], [34, 4, 10, 12, '#B4784A'], [38.5, 4, 1, 12, '#8A5530'],
  [24, 34, 12, 8, '#F6C9DD'],
  // BANHEIRO: pia, vaso, chuveiro
  [53, 3, 14, 8, P], [54, 4, 12, 6, '#FFFFFF'], [56, 5, 8, 4, '#9ED8EE'],
  [83, 3, 10, 13, P], [84, 4, 8, 4, '#FFFFFF'], [85, 8, 6, 7, '#FFFFFF'],
  [78, 34, 16, 16, P], [79, 35, 14, 14, '#8FD3EE'], [85, 41, 2, 2, '#5A9DB8'],
  // SALA: tapete com brinquedos, caixa, sofá, planta
  [8, 62, 30, 22, '#B9A6F5'], [10, 64, 26, 18, '#D6C9FB'],
  [12, 67, 4, 4, '#FF7A59'], [21, 74, 4, 4, '#5CC8F2'], [30, 69, 4, 4, '#FFD83D'],
  [35, 57, 10, 7, P], [36, 58, 8, 5, '#C98A4B'],
  [5, 97, 26, 11, P], [6, 98, 24, 4, '#3D45C8'], [6, 102, 24, 5, '#4B4FE0'],
  [39, 98, 5, 5, '#2DBE93'], [40, 103, 3, 4, '#B4784A'],
  // COZINHA: bancada, mesa, cadeiras
  [51, 55, 42, 10, P], [52, 56, 40, 8, '#E3E3F2'], [54, 57, 10, 6, '#56567A'], [70, 57, 10, 5, '#9ED8EE'],
  [63, 79, 22, 16, P], [64, 80, 20, 14, '#C98A4B'], [67, 84, 4, 4, '#FFFFFF'], [77, 84, 4, 4, '#FFFFFF'],
  [59, 83, 3, 7, '#8A5530'], [86, 83, 3, 7, '#8A5530'],
];

/** Onde fica o marcador de cada hábito no mapa (em pixels da grade). */
export const POSICAO: Record<HabitoId, [number, number]> = {
  arrumar: [39, 6],
  quarto: [13, 18],
  dentes: [60, 8],
  higiene: [88, 10],
  banho: [86, 42],
  maos: [76, 60],
  comer: [74, 88],
  brincar: [22, 74],
  comunicar: [18, 102],
};

type Estado = 'feito' | 'agora' | 'depois';

export function CasaPixel({ habitos, atual, escala }: { habitos: HabitoId[]; atual: number; escala: number }) {
  const posHeroi = POSICAO[habitos[Math.min(atual, habitos.length - 1)]] ?? [48, 50];
  return (
    <View style={styles.moldura} accessible accessibilityLabel="Mapa da casa visto de cima: quarto, banheiro, sala e cozinha">
      <Pixel largura={CASA_L} altura={CASA_A} escala={escala} rets={CASA} fundo="#3B3570">
        {[
          ['Quarto', 4, 44],
          ['Banheiro', 52, 44],
          ['Sala', 4, 87],
          ['Cozinha', 52, 105],
        ].map(([nome, x, y]) => (
          <Text key={nome as string} style={[styles.comodo, { left: (x as number) * escala, top: (y as number) * escala }]}>
            {nome as string}
          </Text>
        ))}

        {habitos.map((id, i) => {
          const [x, y] = POSICAO[id];
          const estado: Estado = i < atual ? 'feito' : i === atual ? 'agora' : 'depois';
          return (
            <View
              key={id}
              style={[
                styles.marcador,
                { left: x * escala - 13, top: y * escala - 13 },
                estado === 'feito' && { backgroundColor: '#2DBE93', borderColor: '#0F3D30' },
                estado === 'agora' && { backgroundColor: '#FFB21E' },
              ]}>
              {estado === 'feito' ? (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              ) : estado === 'agora' ? (
                <Ionicons name="star" size={14} color={P} />
              ) : (
                <Text style={styles.exclamacao}>!</Text>
              )}
            </View>
          );
        })}

        {atual < habitos.length ? (
          <View style={{ position: 'absolute', left: (posHeroi[0] - 4) * escala, top: (posHeroi[1] + 3) * escala }}>
            <Pixel largura={12} altura={16} escala={escala * 0.6} rets={heroi()} />
          </View>
        ) : null}
      </Pixel>
    </View>
  );
}

const styles = StyleSheet.create({
  moldura: { alignSelf: 'center', borderWidth: 4, borderColor: '#0F0D33', borderRadius: 6, overflow: 'hidden' },
  comodo: { position: 'absolute', fontFamily: fontes.pixel, fontSize: 11, color: '#2A2550', opacity: 0.6 },
  marcador: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: P,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exclamacao: { fontFamily: fontes.pixel, fontSize: 14, color: '#4B4FE0' },
});
