import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, Share } from 'react-native';

import { Relatorio } from '@/components/Relatorio';
import { Tela } from '@/components/Tela';
import { Aviso, Botao, BotaoIcone } from '@/components/ui';
import * as nuvem from '@/data/nuvem';
import { textoParaCompartilhar } from '@/data/relatorio';
import { diaDe, registroDaNuvem, somarDias, useApp, type Licao, type Observacao, type Registro } from '@/state/AppState';

type Dados = { registros: Registro[]; licoes: Licao[]; observacoes: Observacao[] };

/**
 * Relatório de um paciente, visto pelo profissional.
 * Vê tudo, inclusive as próprias notas "só para o profissional", e pode escrever observações.
 */
export default function Paciente() {
  const app = useApp();
  const { id = 'local', nome = app.nomeCrianca } = useLocalSearchParams<{ id?: string; nome?: string }>();
  const local = id === 'local' || !nuvem.nuvemAtiva;
  const [remoto, setRemoto] = useState<Dados>({ registros: [], licoes: [], observacoes: [] });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    if (local) return;
    setCarregando(true);
    const r = await nuvem.dadosDoPaciente(id, somarDias(diaDe(new Date()), -60));
    setCarregando(false);
    if (!r.ok) return setErro(r.erro);
    setErro('');
    setRemoto({
      registros: r.dados.registros.map(registroDaNuvem),
      licoes: r.dados.licoes.map((l) => ({ dia: l.dia, sentimento: l.sentimento, enviado: true })),
      observacoes: r.dados.observacoes.map((o) => ({ id: o.id, quando: o.criado_em, autor: o.autor_papel, texto: o.texto, visivelFamilia: o.visivel_familia })),
    });
  }, [id, local]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const dados: Dados = local ? { registros: app.registros, licoes: app.licoes, observacoes: app.observacoes } : remoto;

  async function observar(texto: string, visivel: boolean) {
    if (local) return app.adicionarObservacao(texto, visivel);
    const r = await nuvem.enviarObservacao(id, 'profissional', texto.trim(), visivel);
    if (!r.ok) return setErro(r.erro);
    void carregar();
  }

  return (
    <Tela
      voltar
      sobretitulo="PACIENTE"
      titulo={nome}
      direita={
        <BotaoIcone
          icone="share-outline"
          rotulo="Compartilhar resumo"
          onPress={() => Share.share({ message: textoParaCompartilhar(nome, dados.registros, dados.licoes) })}
        />
      }
      rolagem={local ? undefined : <RefreshControl refreshing={carregando} onRefresh={carregar} />}>
      {erro ? <Aviso tipo="reforco" texto={erro} /> : null}
      <Relatorio
        nome={nome}
        hoje={app.hoje}
        registros={dados.registros}
        licoes={dados.licoes}
        observacoes={dados.observacoes}
        quemVe="profissional"
        aoObservar={observar}
        rodapeRelatorios={
          <Botao
            variante="secundario"
            icone="git-branch-outline"
            titulo="Montar a trilha de jogos"
            onPress={() => router.push({ pathname: '/prof/trilha', params: { id, nome } })}
          />
        }
      />
    </Tela>
  );
}
