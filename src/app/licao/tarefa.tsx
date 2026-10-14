import * as Speech from 'expo-speech';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BotaoPixel, CaixaLicao, Surgir, TelaLicao } from '@/components/licao';
import { Pixel, heroi } from '@/components/Pixel';
import { habitoPorId } from '@/data/catalogo';
import { useMovimentoReduzido } from '@/hooks/useMovimentoReduzido';
import { useApp } from '@/state/AppState';
import { cores, fontes } from '@/theme/tokens';

const QUADRO_MS = 1600;

/**
 * Tarefa de casa como estímulo (modelação por vídeo):
 * 1. a criança assiste os 3 passos da ação;
 * 2. depois põe os passos na ordem certa.
 */
export default function Tarefa() {
  const app = useApp();
  const habito = habitoPorId(app.habitos[app.tarefaAtual]);

  // Narração: lê o nome da tarefa e os passos em voz alta (dá para desligar no Perfil).
  useEffect(() => {
    if (!app.ajustes.narracao) return;
    Speech.speak(`${habito.nome}. ${habito.passos.join(', depois, ')}.`, { language: 'pt-BR', rate: 0.9 });
    return () => {
      Speech.stop();
    };
  }, [habito.id, app.ajustes.narracao]);
  const reduzido = useMovimentoReduzido();
  const inicio = useRef(Date.now()).current;

  const [quadro, setQuadro] = useState(0);
  const [colocados, setColocados] = useState<number[]>([]);
  const [tentativas, setTentativas] = useState(0);
  const [errou, setErrou] = useState(false);
  const [errosTotal, setErrosTotal] = useState(0);

  // Ordem embaralhada fixa para esta tarefa (nunca já na ordem certa).
  const embaralhado = useMemo(() => [1, 2, 0], []);

  useEffect(() => {
    if (reduzido) return;
    const t = setInterval(() => setQuadro((q) => (q + 1) % 3), QUADRO_MS);
    return () => clearInterval(t);
  }, [reduzido]);

  const terminou = colocados.length === 3;

  function tocar(passo: number) {
    setTentativas((t) => t + 1);
    if (passo === colocados.length) {
      setColocados((c) => [...c, passo]);
      setErrou(false);
    } else {
      setErrou(true);
      setErrosTotal((e) => e + 1);
    }
  }

  function concluir() {
    app.concluirTarefa(habito.id, {
      acertouDePrimeira: errosTotal === 0,
      tentativas,
      ajudas: 0,
      segundos: Math.round((Date.now() - inicio) / 1000),
    });
    router.back();
  }

  return (
    <TelaLicao titulo={habito.nome} subtitulo={`${habito.comodo} · tarefa ${app.tarefaAtual + 1} de ${app.habitos.length}`}>
      <Text style={styles.etapa}>1. ASSISTA</Text>
      <View style={styles.tela} accessible accessibilityLabel={`Animação: ${habito.passos.join(', depois ')}`}>
        <View style={styles.cena}>
          <Pixel largura={12} altura={16} escala={7} rets={heroi()} />
          <View style={styles.balao}>
            <Text style={styles.balaoNum}>{quadro + 1}</Text>
          </View>
        </View>
        <Text style={styles.legenda}>{habito.passos[reduzido ? 1 : quadro]}</Text>
        <View style={styles.pontos}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.ponto, i === quadro && { backgroundColor: cores.licaoBorda }]} />
          ))}
        </View>
      </View>
      <Text style={styles.provisorio}>[Animação provisória · no app entra o vídeo final da ação]</Text>

      <Text style={styles.etapa}>2. AGORA VOCÊ: COLOQUE NA ORDEM</Text>
      <View style={styles.linha}>
        {[0, 1, 2].map((i) => {
          const p = colocados[i];
          return (
            <View key={i} style={[styles.slot, p !== undefined && styles.slotCheio]}>
              <Text style={[styles.slotNum, p !== undefined && { color: '#2E1C00' }]}>{i + 1}</Text>
              <Text style={styles.slotTxt}>{p !== undefined ? habito.passos[p] : ''}</Text>
            </View>
          );
        })}
      </View>

      {!terminou ? (
        <View style={styles.linha}>
          {embaralhado
            .filter((p) => !colocados.includes(p))
            .map((p) => (
              <Pressable
                key={p}
                onPress={() => tocar(p)}
                accessibilityRole="button"
                accessibilityLabel={habito.passos[p]}
                style={({ pressed }) => [styles.carta, pressed && { transform: [{ translateY: 3 }], borderBottomWidth: 3 }]}>
                <Text style={styles.cartaTxt}>{habito.passos[p]}</Text>
              </Pressable>
            ))}
        </View>
      ) : null}

      {errou && !terminou ? (
        <Surgir>
          <CaixaLicao cor="#FFF2D4">
            <Text style={styles.feedbackTxt}>Quase! O que o herói fez primeiro? Olhe a animação de novo.</Text>
          </CaixaLicao>
        </Surgir>
      ) : null}

      {terminou ? (
        <Surgir>
          <CaixaLicao cor="#DFF7EF">
            <Text style={[styles.feedbackTitulo]}>Muito bem!</Text>
            <BotaoPixel titulo="Próxima tarefa" cor={cores.primaria} tinta="#FFFFFF" onPress={concluir} />
          </CaixaLicao>
        </Surgir>
      ) : null}
    </TelaLicao>
  );
}

const styles = StyleSheet.create({
  etapa: { fontFamily: fontes.textoForte, fontSize: 13, color: cores.ouroClaro, letterSpacing: 0.6 },
  tela: { backgroundColor: '#D6F1FB', borderWidth: 4, borderColor: cores.licaoBorda, borderRadius: 6, padding: 12, alignItems: 'center', gap: 8 },
  cena: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  balao: { width: 34, height: 34, borderRadius: 4, backgroundColor: cores.ouro, borderWidth: 3, borderColor: cores.licaoBorda, alignItems: 'center', justifyContent: 'center' },
  balaoNum: { fontFamily: fontes.pixel, fontSize: 18, color: cores.licaoBorda },
  legenda: { fontFamily: fontes.pixel, fontSize: 20, color: cores.licaoBorda, textAlign: 'center' },
  pontos: { flexDirection: 'row', gap: 6 },
  ponto: { width: 10, height: 10, backgroundColor: '#9ED8EE' },
  provisorio: { fontFamily: fontes.texto, fontSize: 12, color: '#8E89C9', textAlign: 'center' },
  linha: { flexDirection: 'row', gap: 8 },
  slot: { flex: 1, minHeight: 72, borderWidth: 3, borderStyle: 'dashed', borderColor: '#4A4590', borderRadius: 10, alignItems: 'center', justifyContent: 'center', padding: 4, gap: 2 },
  slotCheio: { backgroundColor: cores.ouro, borderStyle: 'solid', borderColor: cores.licaoBorda },
  slotNum: { fontFamily: fontes.pixel, fontSize: 18, color: '#8E89C9' },
  slotTxt: { fontFamily: fontes.textoForte, fontSize: 12, color: '#2E1C00', textAlign: 'center' },
  carta: {
    flex: 1,
    minHeight: 76,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderBottomWidth: 7,
    borderColor: cores.licaoBorda,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  cartaTxt: { fontFamily: fontes.pixel, fontSize: 16, color: cores.texto, textAlign: 'center' },
  feedbackTxt: { fontFamily: fontes.textoForte, fontSize: 15, color: '#6B3E00' },
  feedbackTitulo: { fontFamily: fontes.pixel, fontSize: 24, color: '#0D4F3E', textAlign: 'center' },
});
