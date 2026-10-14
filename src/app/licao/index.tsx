import { router } from 'expo-router';
import { Text, View, useWindowDimensions } from 'react-native';

import { CasaPixel, CASA_L } from '@/components/CasaPixel';
import { BotaoPixel, CaixaLicao, TelaLicao } from '@/components/licao';
import { habitoPorId } from '@/data/catalogo';
import { useApp, useTrilhaDeHoje } from '@/state/AppState';
import { cores, fontes, modulos } from '@/theme/tokens';

/** Primeira parte da lição: a casa vista de cima com as tasks obrigatórias. */
export default function Casa() {
  const app = useApp();
  const trilha = useTrilhaDeHoje();
  const { width } = useWindowDimensions();
  const escala = Math.min(3.6, (Math.min(width, 430) - 48) / CASA_L);
  const total = app.habitos.length;
  const atual = app.tarefaAtual;
  const terminou = atual >= total;
  const habito = terminou ? null : habitoPorId(app.habitos[atual]);
  const tinta = habito
    ? { Quarto: modulos.socio, Banheiro: modulos.cog, Sala: modulos.hab, Cozinha: modulos.ling }[habito.comodo]
    : null;

  return (
    <TelaLicao titulo="Tasks da casa" subtitulo={terminou ? 'Tudo feito!' : `Agora: ${habito!.comodo.toLowerCase()}`} progresso={atual} total={total}>
      <CasaPixel habitos={app.habitos} atual={atual} escala={escala} />

      {habito && tinta ? (
        <CaixaLicao>
          <Text style={{ fontFamily: fontes.textoForte, fontSize: 12, color: tinta.tinta, letterSpacing: 0.5 }}>
            {`AGORA · ${habito.comodo.toUpperCase()}`}
          </Text>
          <Text style={{ fontFamily: fontes.pixel, fontSize: 24, color: cores.texto }}>{habito.nome}</Text>
          <Text style={{ fontFamily: fontes.texto, fontSize: 15, color: cores.textoSuave }}>{habito.dica}</Text>
          <BotaoPixel titulo="Vamos lá!" onPress={() => router.push('/licao/tarefa')} />
        </CaixaLicao>
      ) : (
        <CaixaLicao>
          <Text style={{ fontFamily: fontes.pixel, fontSize: 24, color: cores.texto, textAlign: 'center' }}>Casa completa!</Text>
          <Text style={{ fontFamily: fontes.texto, fontSize: 15, color: cores.textoSuave, textAlign: 'center' }}>
            {`Agora vamos treinar o cérebro com ${trilha.length} jogos.`}
          </Text>
          <View style={{ height: 4 }} />
          <BotaoPixel titulo="Ir para os jogos" cor={cores.primaria} tinta="#FFFFFF" onPress={() => router.replace('/licao/jogo')} />
        </CaixaLicao>
      )}
    </TelaLicao>
  );
}
