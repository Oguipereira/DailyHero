import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BotaoPixel, CaixaLicao, Surgir } from '@/components/licao';
import { cores, fontes } from '@/theme/tokens';

import { REGRAS, embaralhar, type Nivel, type ResultadoJogo } from './regras';

type Icone = ComponentProps<typeof Ionicons>['name'];

/** Objetos da casa (ligam a Memória às tarefas da manhã). */
const OBJETOS: { nome: string; icone: Icone; fundo: string; tinta: string }[] = [
  { nome: 'escova', icone: 'brush', fundo: '#E1F4FC', tinta: '#0B5878' },
  { nome: 'prato', icone: 'restaurant', fundo: '#FFF2D4', tinta: '#8A5000' },
  { nome: 'cama', icone: 'bed', fundo: '#F1EAFE', tinta: '#5B2DB8' },
  { nome: 'água', icone: 'water', fundo: '#DFF7EF', tinta: '#0D6650' },
];

/** Jogo da memória (cognitivo e memória): achar os pares de objetos da casa. */
export function Memoria({ nivel = 1, onFim }: { nivel?: Nivel; onFim: (r: ResultadoJogo) => void }) {
  const nCartas = REGRAS.memoria.cartasPorNivel[nivel];
  const cartas = useMemo(() => {
    const pares = OBJETOS.slice(0, nCartas / 2);
    return embaralhar([...pares, ...pares].map((o, i) => ({ ...o, id: i })));
  }, []);
  const inicio = useRef(Date.now()).current;

  const [abertas, setAbertas] = useState<number[]>([]);
  const [achadas, setAchadas] = useState<string[]>([]);
  const [tentativas, setTentativas] = useState(0);
  const [vistas, setVistas] = useState<Set<number>>(new Set());
  const [errosQueEvitaria, setErrosQueEvitaria] = useState(0);

  const terminou = achadas.length === nCartas / 2;

  useEffect(() => {
    if (abertas.length !== 2) return;
    const [a, b] = abertas.map((i) => cartas[i]);
    if (!a || !b) return setAbertas([]);
    setTentativas((t) => t + 1);
    if (a.nome === b.nome) {
      setAchadas((x) => [...x, a.nome]);
      setAbertas([]);
      return;
    }
    // Erro "evitável": a carta par já tinha sido vista antes.
    const parDeA = cartas.findIndex((c, i) => c.nome === a.nome && i !== abertas[0]);
    if (vistas.has(parDeA)) setErrosQueEvitaria((n) => n + 1);
    const t = setTimeout(() => setAbertas([]), 900);
    return () => clearTimeout(t);
  }, [abertas]);

  function virar(i: number) {
    if (!cartas[i] || abertas.length === 2 || abertas.includes(i) || achadas.includes(cartas[i].nome)) return;
    setAbertas((a) => [...a, i]);
    setVistas((v) => new Set(v).add(i));
  }

  const colunas = nCartas <= 4 ? 2 : nCartas <= 6 ? 3 : 4;

  return (
    <View style={{ gap: 14 }}>
      <View style={styles.cabeca}>
        <Text style={styles.pergunta}>Ache os pares!</Text>
        <Text style={styles.sub}>{`${achadas.length} de ${nCartas / 2} pares`}</Text>
      </View>

      <View style={styles.grade}>
        {cartas.map((c, i) => {
          const visivel = abertas.includes(i) || achadas.includes(c.nome);
          return (
            <View key={c.id} style={{ width: `${100 / colunas}%`, padding: 5 }}>
              <Pressable
                onPress={() => virar(i)}
                accessibilityRole="button"
                accessibilityLabel={visivel ? c.nome : 'Carta virada'}
                style={[styles.carta, visivel ? { backgroundColor: c.fundo } : styles.cartaVirada]}>
                {visivel ? (
                  <>
                    <Ionicons name={c.icone} size={38} color={c.tinta} />
                    <Text style={[styles.nome, { color: c.tinta }]}>{c.nome}</Text>
                  </>
                ) : (
                  <Ionicons name="star" size={28} color={cores.ouroClaro} />
                )}
              </Pressable>
            </View>
          );
        })}
      </View>

      {terminou ? (
        <Surgir>
          <CaixaLicao cor="#DFF7EF">
            <Text style={styles.okTitulo}>Achou todos!</Text>
            <BotaoPixel
              titulo="Terminar jogo"
              cor={cores.primaria}
              tinta="#FFFFFF"
              onPress={() =>
                onFim({
                  acertosDePrimeira: Math.max(0, nCartas / 2 - errosQueEvitaria),
                  rodadas: nCartas / 2,
                  tentativas,
                  ajudas: 0,
                  segundos: Math.round((Date.now() - inicio) / 1000),
                })
              }
            />
          </CaixaLicao>
        </Surgir>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cabeca: { alignItems: 'center', gap: 2 },
  pergunta: { fontFamily: fontes.pixel, fontSize: 24, color: '#FFFFFF' },
  sub: { fontFamily: fontes.textoForte, fontSize: 14, color: cores.licaoTextoSuave },
  grade: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  carta: {
    aspectRatio: 0.85,
    borderWidth: 3,
    borderBottomWidth: 7,
    borderColor: cores.licaoBorda,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cartaVirada: { backgroundColor: cores.primaria },
  nome: { fontFamily: fontes.pixel, fontSize: 15 },
  okTitulo: { fontFamily: fontes.pixel, fontSize: 22, color: '#0D4F3E', textAlign: 'center' },
});
