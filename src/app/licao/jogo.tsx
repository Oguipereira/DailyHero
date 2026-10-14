import { router } from 'expo-router';

import { TelaLicao } from '@/components/licao';
import { jogoPorId } from '@/data/catalogo';
import { Emocoes } from '@/jogos/Emocoes';
import { Figuras } from '@/jogos/Figuras';
import { Memoria } from '@/jogos/Memoria';
import type { ResultadoJogo } from '@/jogos/regras';
import { useApp, useTrilhaDeHoje } from '@/state/AppState';

/** Segunda parte da lição: a trilha de estímulos, um jogo depois do outro. */
export default function Jogo() {
  const app = useApp();
  const trilha = useTrilhaDeHoje();
  const indice = app.jogoAtual;
  const id = trilha[indice];

  if (!id) {
    // Trilha acabou (ou está vazia): vai para o fim da lição.
    setTimeout(() => router.replace('/licao/fim'), 0);
    return null;
  }

  const jogo = jogoPorId(id);
  const nivel = app.niveis[id] ?? 1;

  function terminar(r: ResultadoJogo) {
    app.concluirJogo(id!, r);
    if (indice + 1 >= trilha.length) router.replace('/licao/fim');
  }

  const titulo = jogo.nome.replace('Jogo das ', '').replace('Jogo da ', '');
  const nome = titulo.charAt(0).toUpperCase() + titulo.slice(1);

  return (
    <TelaLicao titulo={nome} subtitulo={`Jogo ${indice + 1} de ${trilha.length}`} progresso={indice} total={trilha.length}>
      {id === 'emocoes' ? (
        <Emocoes key={indice} nivel={nivel} onFim={terminar} />
      ) : id === 'memoria' ? (
        <Memoria key={indice} nivel={nivel} onFim={terminar} />
      ) : id === 'figuras' ? (
        <Figuras key={indice} nivel={nivel} onFim={terminar} />
      ) : (
        <Figuras key={indice} nivel={nivel} onFim={terminar} />
      )}
    </TelaLicao>
  );
}
