import { Share } from 'react-native';

import { Pessoa, Relatorio } from '@/components/Relatorio';
import { Tela } from '@/components/Tela';
import { BotaoIcone, Cartao, Titulo2 } from '@/components/ui';
import { textoParaCompartilhar } from '@/data/relatorio';
import { useApp } from '@/state/AppState';

/** Relatórios na área da família. Os números vêm das lições salvas no celular (e na nuvem, se ligada). */
export default function Relatorios() {
  const app = useApp();

  return (
    <Tela
      comAbas
      titulo="Relatórios"
      subtitulo={`Família e profissional · ${app.nomeCrianca}`}
      direita={
        <BotaoIcone
          icone="share-outline"
          rotulo="Compartilhar resumo"
          onPress={() => Share.share({ message: textoParaCompartilhar(app.nomeCrianca, app.registros, app.licoes, app.hoje) })}
        />
      }>
      <Relatorio
        nome={app.nomeCrianca}
        hoje={app.hoje}
        registros={app.registros}
        licoes={app.licoes}
        observacoes={app.observacoes}
        quemVe="responsavel"
        aoObservar={app.adicionarObservacao}
        rodapeRelatorios={
          <Cartao>
            <Titulo2>Pessoas com acesso</Titulo2>
            <Pessoa inicial={(app.nomeResponsavel || 'R').charAt(0)} nome={app.nomeResponsavel || 'Responsável'} papel="Responsável" />
            {app.profissional.status === 'aprovado' ? (
              <Pessoa inicial={(app.profissional.nome || 'P').charAt(0)} nome={app.profissional.nome || 'Profissional'} papel="Profissional" />
            ) : null}
          </Cartao>
        }
      />
    </Tela>
  );
}
