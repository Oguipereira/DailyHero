import { router } from 'expo-router';
import { useState } from 'react';

import { Campo } from '@/components/Campo';
import { Tela } from '@/components/Tela';
import { Aviso, Botao, Cartao, Segmentado, Texto, Titulo2 } from '@/components/ui';
import { useApp } from '@/state/AppState';

type Jeito = 'convite' | 'codigo';

/**
 * A família adiciona um profissional, pelos dois caminhos decididos:
 * 1. convite por e-mail (o profissional cria a conta e já entra com acesso)
 * 2. código que o profissional mandou (vira um pedido que a família aprova)
 */
export default function Vincular() {
  const app = useApp();
  const [jeito, setJeito] = useState<Jeito>('convite');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [feito, setFeito] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    setErro('');
    if (jeito === 'convite') {
      if (!/^\S+@\S+\.\S+$/.test(email)) return setErro('Confira o e-mail do profissional.');
      app.convidarProfissional(email);
      return setFeito(true);
    }
    setEnviando(true);
    const e = await app.usarCodigo(codigo);
    setEnviando(false);
    if (e) return setErro(e);
    router.replace('/aprovacao');
  }

  if (feito) {
    return (
      <Tela voltar titulo="Convite enviado">
        <Aviso tipo="sucesso" texto={`Quando ${email} criar a conta no Daily Hero com este e-mail, já vai ver os relatórios de ${app.nomeCrianca}.`} />
        <Texto suave>Se mudar de ideia, é só remover o profissional em Perfil. O acesso some na hora.</Texto>
        <Botao titulo="Voltar ao Perfil" onPress={() => router.back()} />
      </Tela>
    );
  }

  return (
    <Tela
      voltar
      sobretitulo="ÁREA DO RESPONSÁVEL"
      titulo="Adicionar profissional"
      subtitulo={`Psicólogo, fono ou terapeuta que acompanha ${app.nomeCrianca}`}
      rodape={<Botao titulo={enviando ? 'Conferindo…' : jeito === 'convite' ? 'Enviar convite' : 'Continuar'} desativado={enviando} onPress={enviar} />}>
      <Segmentado<Jeito>
        valor={jeito}
        onChange={(v) => {
          setJeito(v);
          setErro('');
        }}
        opcoes={[
          { valor: 'convite', rotulo: 'Convidar por e-mail' },
          { valor: 'codigo', rotulo: 'Tenho um código' },
        ]}
      />

      {jeito === 'convite' ? (
        <Cartao>
          <Titulo2>E-mail do profissional</Titulo2>
          <Campo rotulo="E-mail" placeholder="clinica@email.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          <Texto suave tamanho={13}>O convite vale por 48 horas. Como foi você quem convidou, o acesso já vem autorizado.</Texto>
        </Cartao>
      ) : (
        <Cartao>
          <Titulo2>Código do profissional</Titulo2>
          <Campo
            rotulo="Código"
            placeholder="DH-7K4Q"
            autoCapitalize="characters"
            maxLength={7}
            value={codigo}
            onChangeText={(v) => setCodigo(v.toUpperCase())}
          />
          <Texto suave tamanho={13}>Depois de digitar, você vê quem é e decide se aprova.</Texto>
        </Cartao>
      )}

      {erro ? <Aviso tipo="reforco" texto={erro} /> : null}
      <Aviso tipo="alerta" texto="O profissional vai ver relatórios, o dia após dia e poderá escolher os jogos. Só adicione quem você conhece." />
    </Tela>
  );
}
