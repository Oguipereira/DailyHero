import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Tela } from '@/components/Tela';
import { Aviso, Botao, Cartao, Texto, Titulo2 } from '@/components/ui';
import { useApp } from '@/state/AppState';
import { cores, fontes } from '@/theme/tokens';

const PERMISSOES = ['Ver relatórios e módulos de estímulo', 'Ver o dia após dia das atividades', 'Escrever observações', 'Escolher os jogos da trilha'];

/**
 * Os pais aprovam o acesso de um profissional. Tudo ou nada:
 * a lista é fixa, só há Aprovar ou Recusar. Para encerrar, remove-se no Perfil.
 */
export default function Aprovacao() {
  const app = useApp();
  const st = app.profissional.status;
  const decidido = st === 'aprovado' ? true : st === 'recusado' ? false : null;
  const nome = app.profissional.nome || 'Profissional';
  const codigo = app.profissional.codigo;

  if (st === 'nenhum' || st === 'convidado') {
    return (
      <Tela voltar sobretitulo="ÁREA DO RESPONSÁVEL" titulo="Pedido de acesso">
        <Texto suave>Nenhum pedido esperando. Para adicionar alguém, use Perfil › + Profissional.</Texto>
        <Botao titulo="Adicionar profissional" onPress={() => router.replace('/vincular')} />
      </Tela>
    );
  }

  return (
    <Tela voltar sobretitulo="ÁREA DO RESPONSÁVEL" titulo="Pedido de acesso">
      <Cartao>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{nome.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nome}>{nome}</Text>
            <Texto suave tamanho={13}>{codigo ? `Código ${codigo}` : 'Convite por e-mail'}</Texto>
          </View>
        </View>
        <Texto>{`Quer acompanhar ${app.nomeCrianca} pelo Daily Hero.`}</Texto>
        <Aviso tipo="alerta" texto="Só aprove se você conhece este profissional." />
      </Cartao>

      {decidido === true ? (
        <Cartao estilo={{ alignItems: 'center', backgroundColor: '#DFF7EF', borderColor: '#DFF7EF' }}>
          <Ionicons name="checkmark-circle" size={48} color="#2DBE93" />
          <Titulo2>Acesso aprovado</Titulo2>
          <Texto centro>{`O profissional já vê os relatórios de ${app.nomeCrianca}.`}</Texto>
          <Botao titulo="Voltar" onPress={() => router.back()} estilo={{ alignSelf: 'stretch' }} />
        </Cartao>
      ) : decidido === false ? (
        <Cartao estilo={{ alignItems: 'center' }}>
          <Titulo2>Sem acesso</Titulo2>
          <Texto suave centro>
            Nenhum dado é compartilhado com este profissional.
          </Texto>
          <Botao variante="secundario" titulo="Voltar" onPress={() => router.back()} estilo={{ alignSelf: 'stretch' }} />
        </Cartao>
      ) : (
        <>
          <Cartao>
            <Titulo2>Ao aprovar, o profissional vai poder</Titulo2>
            {PERMISSOES.map((p) => (
              <View key={p} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="checkmark" size={20} color="#2DBE93" />
                <Texto>{p}</Texto>
              </View>
            ))}
          </Cartao>
          <Texto suave centro tamanho={13}>
            O acesso é completo. Se quiser encerrar, remova o profissional em Perfil.
          </Texto>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Botao variante="perigo" titulo="Recusar" onPress={() => app.decidirProfissional(false)} />
            <Botao titulo="Aprovar acesso" onPress={() => app.decidirProfissional(true)} estilo={{ flex: 1 }} />
          </View>
        </>
      )}
    </Tela>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#F1EAFE', alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: fontes.titulo, fontSize: 22, color: '#5B2DB8' },
  nome: { fontFamily: fontes.textoForte, fontSize: 17, color: cores.texto },
});
