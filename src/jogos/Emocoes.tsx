import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BotaoPixel, CaixaLicao, Surgir } from '@/components/licao';
import { Pixel, rosto } from '@/components/Pixel';
import { cores, fontes } from '@/theme/tokens';

import { REGRAS, embaralhar, type Nivel, type ResultadoJogo } from './regras';

type Emocao = 'feliz' | 'triste' | 'bravo';

const INFO: Record<Emocao, { rotulo: string; pele: string; pista: string }> = {
  feliz: { rotulo: 'Feliz', pele: '#FFD83D', pista: 'a boca virada para cima' },
  triste: { rotulo: 'Triste', pele: '#8FD3EE', pista: 'a boca para baixo e a lágrima' },
  bravo: { rotulo: 'Bravo', pele: '#FF9A7A', pista: 'as sobrancelhas apertadas' },
};

/** Jogo das emoções (socioemocional): vê um rosto e escolhe como a pessoa se sente. */
export function Emocoes({ nivel = 1, onFim }: { nivel?: Nivel; onFim: (r: ResultadoJogo) => void }) {
  const rodadas = REGRAS.emocoes.rodadas;
  const nOpcoes = REGRAS.emocoes.opcoesPorNivel[nivel];
  const sequencia = useMemo(
    () => Array.from({ length: rodadas }, (_, i) => (['triste', 'feliz', 'bravo', 'feliz', 'triste'] as Emocao[])[i % 5]),
    [],
  );
  const inicio = useRef(Date.now()).current;

  const [rodada, setRodada] = useState(0);
  const [escolha, setEscolha] = useState<Emocao | null>(null);
  const [errosRodada, setErrosRodada] = useState(0);
  const [dica, setDica] = useState(false);
  const [placar, setPlacar] = useState({ acertosDePrimeira: 0, tentativas: 0, ajudas: 0 });

  const certa = sequencia[rodada];
  const opcoes = useMemo(() => {
    const outras = embaralhar((['feliz', 'triste', 'bravo'] as Emocao[]).filter((e) => e !== certa)).slice(0, nOpcoes - 1);
    return embaralhar([certa, ...outras]);
  }, [rodada]);

  const acertou = escolha === certa;

  // Dica automática se ficar parado (conta como ajuda).
  useEffect(() => {
    if (acertou || dica) return;
    const t = setTimeout(() => {
      setDica(true);
      setPlacar((p) => ({ ...p, ajudas: p.ajudas + 1 }));
    }, REGRAS.dicaAutomaticaSeg * 1000);
    return () => clearTimeout(t);
  }, [rodada, acertou, dica]);

  function escolher(e: Emocao) {
    if (acertou) return;
    setEscolha(e);
    const certo = e === certa;
    setPlacar((p) => ({
      ...p,
      tentativas: p.tentativas + 1,
      acertosDePrimeira: p.acertosDePrimeira + (certo && errosRodada === 0 ? 1 : 0),
    }));
    if (!certo) setErrosRodada((n) => n + 1);
  }

  function proxima() {
    if (rodada + 1 >= rodadas) {
      onFim({ ...placar, rodadas, segundos: Math.round((Date.now() - inicio) / 1000) });
      return;
    }
    setRodada((r) => r + 1);
    setEscolha(null);
    setErrosRodada(0);
    setDica(false);
  }

  return (
    <View style={{ gap: 14 }}>
      <View style={styles.cena}>
        <Pixel largura={16} altura={16} escala={10} rets={rosto(certa, INFO[certa].pele)} />
        <Text style={styles.pergunta}>Como ele está se sentindo?</Text>
        <Text style={styles.rodada}>{`rodada ${rodada + 1} de ${rodadas}`}</Text>
      </View>

      <View style={styles.opcoes}>
        {opcoes.map((e) => {
          const marcada = escolha === e;
          const ok = marcada && e === certa;
          const errada = marcada && e !== certa;
          return (
            <Pressable
              key={e}
              onPress={() => escolher(e)}
              accessibilityRole="button"
              accessibilityLabel={INFO[e].rotulo}
              accessibilityState={{ selected: marcada }}
              style={[styles.opcao, ok && styles.opcaoOk, errada && styles.opcaoErrada]}>
              <Pixel largura={16} altura={16} escala={3.5} rets={rosto(e, INFO[e].pele)} />
              <Text style={styles.opcaoTxt}>{INFO[e].rotulo}</Text>
            </Pressable>
          );
        })}
      </View>

      {!acertou ? (
        <Pressable
          onPress={() => {
            if (!dica) setPlacar((p) => ({ ...p, ajudas: p.ajudas + 1 }));
            setDica(true);
          }}
          accessibilityRole="button"
          style={styles.botaoDica}>
          <Ionicons name="bulb-outline" size={18} color={cores.ouroClaro} />
          <Text style={styles.botaoDicaTxt}>Pedir dica</Text>
        </Pressable>
      ) : null}

      {dica && !acertou ? (
        <Surgir>
          <CaixaLicao cor={cores.licaoSuperficie} estilo={{ borderColor: cores.ouroClaro }}>
            <Text style={styles.dicaTxt}>{`Dica: olhe ${INFO[certa].pista}.`}</Text>
          </CaixaLicao>
        </Surgir>
      ) : null}

      {escolha && !acertou ? (
        <Surgir>
          <CaixaLicao cor="#FFF2D4">
            <Text style={styles.quaseTitulo}>Quase!</Text>
            <Text style={styles.quaseTxt}>Olhe a boca e os olhos dele. Tente de novo.</Text>
          </CaixaLicao>
        </Surgir>
      ) : null}

      {acertou ? (
        <Surgir>
          <CaixaLicao cor="#DFF7EF">
            <Text style={styles.okTitulo}>Isso mesmo!</Text>
            <Text style={styles.okTxt}>{`${INFO[certa].pista.charAt(0).toUpperCase()}${INFO[certa].pista.slice(1)} mostram que ele está ${INFO[certa].rotulo.toLowerCase()}.`}</Text>
            <BotaoPixel titulo={rodada + 1 >= rodadas ? 'Terminar jogo' : 'Próxima'} cor={cores.primaria} tinta="#FFFFFF" onPress={proxima} />
          </CaixaLicao>
        </Surgir>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cena: { backgroundColor: '#D6F1FB', borderWidth: 4, borderColor: cores.licaoBorda, borderRadius: 6, padding: 16, alignItems: 'center', gap: 8 },
  pergunta: { fontFamily: fontes.pixel, fontSize: 22, color: cores.texto, textAlign: 'center' },
  rodada: { fontFamily: fontes.textoForte, fontSize: 13, color: '#4C8FA8' },
  opcoes: { flexDirection: 'row', gap: 10 },
  opcao: {
    flex: 1,
    minHeight: 110,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderBottomWidth: 7,
    borderColor: cores.licaoBorda,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  opcaoOk: { backgroundColor: '#DFF7EF', borderColor: '#1A8A69' },
  opcaoErrada: { backgroundColor: '#FFF2D4', borderColor: '#A85A00' },
  opcaoTxt: { fontFamily: fontes.pixel, fontSize: 18, color: cores.texto },
  botaoDica: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', minHeight: 44, paddingHorizontal: 14, borderRadius: 12, borderWidth: 2, borderColor: cores.ouroClaro },
  botaoDicaTxt: { fontFamily: fontes.pixel, fontSize: 16, color: cores.ouroClaro },
  dicaTxt: { fontFamily: fontes.textoForte, fontSize: 15, color: '#FFF2D4' },
  quaseTitulo: { fontFamily: fontes.pixel, fontSize: 22, color: '#6B3E00' },
  quaseTxt: { fontFamily: fontes.textoForte, fontSize: 15, color: '#6B3E00' },
  okTitulo: { fontFamily: fontes.pixel, fontSize: 22, color: '#0D4F3E' },
  okTxt: { fontFamily: fontes.textoForte, fontSize: 15, color: '#0D4F3E' },
});
