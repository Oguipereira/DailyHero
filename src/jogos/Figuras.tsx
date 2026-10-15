import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BotaoPixel, CaixaLicao, Surgir } from '@/components/licao';
import { Pixel, type Ret } from '@/components/Pixel';
import { cores, fontes } from '@/theme/tokens';

import { REGRAS, embaralhar, type Nivel, type ResultadoJogo } from './regras';

/** Figuras 8x8 desenhadas com letras; cada letra é uma cor. */
const PALETA: Record<string, string> = {
  a: '#5CC8F2', // céu
  s: '#FFD83D', // sol
  v: '#2DBE93', // verde
  m: '#B4784A', // marrom
  r: '#FF7A59', // vermelho
  b: '#FFFFFF', // branco
  p: '#4B4FE0', // roxo
  t: '#2A2550', // contorno
};

const FIGURAS: { nome: string; mapa: string[] }[] = [
  { nome: 'casa', mapa: ['aaaraaaa', 'aarrraaa', 'arrrrraa', 'rrrrrrra', 'abbbbbba', 'abmbbpba', 'abmbbbba', 'vvvvvvvv'] },
  { nome: 'árvore', mapa: ['aaavvaaa', 'aavvvvaa', 'avvvvvva', 'vvvvvvvv', 'avvvvvva', 'aaamaaaa', 'aaamaaaa', 'vvvvvvvv'] },
  { nome: 'sol', mapa: ['aaasaaaa', 'asasssaa', 'aassssas', 'ssssssss', 'assssssa', 'saassssa', 'aasasaaa', 'aaaasaaa'] },
];

function rets(mapa: string[]): Ret[] {
  const out: Ret[] = [];
  mapa.forEach((linha, y) => [...linha].forEach((c, x) => out.push([x, y, 1, 1, PALETA[c]])));
  return out;
}

/** Recorta uma peça (pedaço da figura) deslocando o desenho dentro de uma janela. */
function Peca({ mapa, col, lin, cols, lins, tam }: { mapa: string[]; col: number; lin: number; cols: number; lins: number; tam: number }) {
  const escala = tam / (8 / cols);
  const alt = (8 / lins) * escala;
  return (
    <View style={{ width: tam, height: alt, overflow: 'hidden' }}>
      <Pixel
        largura={8}
        altura={8}
        escala={escala}
        rets={rets(mapa)}
        estilo={{ position: 'absolute', left: -col * tam, top: -lin * alt }}
      />
    </View>
  );
}

/** Montar figuras (motor fino e coordenação): toque na peça e depois no lugar dela. */
export function Figuras({ nivel = 1, onFim }: { nivel?: Nivel; onFim: (r: ResultadoJogo) => void }) {
  const rodadas = REGRAS.figuras.rodadas;
  const nPecas = REGRAS.figuras.pecasPorNivel[nivel];
  const cols = 2;
  const lins = nPecas / 2;
  const inicio = useRef(Date.now()).current;

  const [rodada, setRodada] = useState(0);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [colocadas, setColocadas] = useState<number[]>([]);
  const [errosRodada, setErrosRodada] = useState(0);
  const [errou, setErrou] = useState(false);
  const [placar, setPlacar] = useState({ acertosDePrimeira: 0, tentativas: 0 });

  const figura = FIGURAS[rodada % FIGURAS.length];
  const ordem = useMemo(() => {
    let o = embaralhar(Array.from({ length: nPecas }, (_, i) => i));
    if (o.every((v, i) => v === i)) o = [...o].reverse();
    return o;
  }, [rodada]);
  const terminou = colocadas.length === nPecas;

  const TAM_ALVO = 120;
  const TAM_PECA = 64;

  function soltarEm(lugar: number) {
    if (selecionada === null || colocadas.includes(lugar)) return;
    setPlacar((p) => ({ ...p, tentativas: p.tentativas + 1 }));
    if (selecionada === lugar) {
      const novas = [...colocadas, lugar];
      setColocadas(novas);
      setSelecionada(null);
      setErrou(false);
      if (novas.length === nPecas && errosRodada === 0) setPlacar((p) => ({ ...p, acertosDePrimeira: p.acertosDePrimeira + 1 }));
    } else {
      setErrou(true);
      setErrosRodada((n) => n + 1);
    }
  }

  function proxima() {
    if (rodada + 1 >= rodadas) {
      onFim({ ...placar, rodadas, ajudas: 0, segundos: Math.round((Date.now() - inicio) / 1000) });
      return;
    }
    setRodada((r) => r + 1);
    setColocadas([]);
    setSelecionada(null);
    setErrosRodada(0);
    setErrou(false);
  }

  return (
    <View style={{ gap: 14 }}>
      <View style={{ alignItems: 'center', gap: 2 }}>
        <Text style={styles.pergunta}>{`Monte a ${figura.nome}!`}</Text>
        <Text style={styles.sub}>{`figura ${rodada + 1} de ${rodadas} · toque na peça e depois no lugar`}</Text>
      </View>

      <View style={styles.alvo}>
        {Array.from({ length: lins }).map((_, l) => (
          <View key={l} style={{ flexDirection: 'row' }}>
            {Array.from({ length: cols }).map((__, c) => {
              const idx = l * cols + c;
              const cheio = colocadas.includes(idx);
              return (
                <Pressable
                  key={c}
                  onPress={() => soltarEm(idx)}
                  accessibilityRole="button"
                  accessibilityLabel={cheio ? 'Lugar preenchido' : `Lugar ${idx + 1}`}
                  style={[styles.lugar, { width: TAM_ALVO, height: (TAM_ALVO * cols) / lins }]}>
                  {cheio ? (
                    <Peca mapa={figura.mapa} col={c} lin={l} cols={cols} lins={lins} tam={TAM_ALVO} />
                  ) : (
                    <View style={{ opacity: 0.18 }}>
                      <Peca mapa={figura.mapa} col={c} lin={l} cols={cols} lins={lins} tam={TAM_ALVO} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {!terminou ? (
        <View style={styles.bandeja}>
          {ordem
            .filter((i) => !colocadas.includes(i))
            .map((i) => (
              <Pressable
                key={i}
                onPress={() => setSelecionada(i)}
                accessibilityRole="button"
                accessibilityLabel={`Peça ${i + 1}`}
                accessibilityState={{ selected: selecionada === i }}
                style={[styles.peca, selecionada === i && styles.pecaSel]}>
                <Peca mapa={figura.mapa} col={i % cols} lin={Math.floor(i / cols)} cols={cols} lins={lins} tam={TAM_PECA} />
              </Pressable>
            ))}
        </View>
      ) : null}

      {errou && !terminou ? (
        <Surgir>
          <CaixaLicao cor="#FFF2D4">
            <Text style={styles.quase}>Quase! Olhe o desenho clarinho no quadro e procure onde a peça encaixa.</Text>
          </CaixaLicao>
        </Surgir>
      ) : null}

      {terminou ? (
        <Surgir>
          <CaixaLicao cor="#DFF7EF">
            <Text style={styles.ok}>{`Você montou a ${figura.nome}!`}</Text>
            <BotaoPixel titulo={rodada + 1 >= rodadas ? 'Terminar jogo' : 'Próxima figura'} cor={cores.primaria} tinta="#FFFFFF" onPress={proxima} />
          </CaixaLicao>
        </Surgir>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pergunta: { fontFamily: fontes.pixel, fontSize: 24, color: '#FFFFFF' },
  sub: { fontFamily: fontes.textoForte, fontSize: 13, color: cores.licaoTextoSuave, textAlign: 'center' },
  alvo: { alignSelf: 'center', borderWidth: 4, borderColor: cores.licaoBorda, backgroundColor: '#FFFFFF' },
  lugar: { borderWidth: 1, borderColor: '#C9C6F2', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  bandeja: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  peca: { padding: 4, borderRadius: 10, borderWidth: 3, borderBottomWidth: 6, borderColor: cores.licaoBorda, backgroundColor: '#FFFFFF' },
  pecaSel: { borderColor: cores.ouroClaro, transform: [{ translateY: -4 }] },
  quase: { fontFamily: fontes.textoForte, fontSize: 15, color: '#6B3E00' },
  ok: { fontFamily: fontes.pixel, fontSize: 22, color: '#0D4F3E', textAlign: 'center' },
});
