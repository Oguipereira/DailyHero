import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BotaoPlay } from '@/components/BotaoPlay';
import { Logo } from '@/components/Logo';
import { Tela } from '@/components/Tela';
import { Aviso, BotaoIcone, Cartao, SemanaOfensiva, Texto, Titulo2 } from '@/components/ui';
import { useApp, useTrilhaDeHoje } from '@/state/AppState';
import { cores, fontes } from '@/theme/tokens';

type Icone = ComponentProps<typeof Ionicons>['name'];

function Atalho({ titulo, icone, fundo, tinta, onPress }: { titulo: string; icone: Icone; fundo: string; tinta: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={[styles.atalho, { backgroundColor: fundo }]}>
      <Ionicons name={icone} size={26} color={tinta} />
      <Text style={[styles.atalhoTxt, { color: tinta }]}>{titulo}</Text>
    </Pressable>
  );
}

const DIAS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export default function Inicio() {
  const app = useApp();

  // Puxa da nuvem o que o profissional mudou (pedido de acesso, observações).
  useEffect(() => {
    void app.atualizarDaNuvem();
  }, []);
  const trilha = useTrilhaDeHoje();
  const hoje = new Date().getDay();

  return (
    <Tela
      comAbas
      sobretitulo={DIAS[hoje].toUpperCase()}
      titulo={`Família do ${app.nomeCrianca}`}
      direita={<BotaoIcone icone="happy-outline" rotulo="Voltar ao modo criança" onPress={() => router.replace('/crianca')} />}>
      {app.profissionalAprovado === null ? (
        <Pressable onPress={() => router.push('/aprovacao')} accessibilityRole="button">
          <Aviso tipo="alerta" texto="Um profissional pediu acesso aos relatórios. Toque para ver." />
        </Pressable>
      ) : null}

      <Cartao>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={styles.fogo}>
            <Ionicons name="flame" size={22} color="#E07A00" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.ofensiva}>{`${app.ofensiva} dias seguidos`}</Text>
            <Texto suave tamanho={13}>
              {app.licaoConcluidaHoje ? 'Lição de hoje feita!' : `Faça a lição de hoje para chegar a ${app.ofensiva + 1}`}
            </Texto>
          </View>
        </View>
        <SemanaOfensiva dias={app.semana} hojeIndice={hoje} />
      </Cartao>

      <View style={styles.licao}>
        <Text style={styles.licaoSobre}>ATIVIDADE DIÁRIA</Text>
        <Text style={styles.licaoTitulo}>Dia de herói em casa</Text>
        <View style={styles.licaoItem}>
          <Text style={styles.licaoNum}>1</Text>
          <Text style={styles.licaoItemTxt}>Tasks obrigatórias</Text>
          <Text style={styles.licaoQtd}>{`${app.habitos.length} hábitos`}</Text>
        </View>
        <View style={styles.licaoItem}>
          <Text style={styles.licaoNum}>2</Text>
          <Text style={styles.licaoItemTxt}>Trilha de estímulos</Text>
          <Text style={styles.licaoQtd}>{`${trilha.length} jogos`}</Text>
        </View>
        <BotaoPlay
          onPress={() => {
            app.reiniciarLicao();
            router.push('/licao');
          }}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Ionicons name="lock-closed" size={14} color="#D9DAFF" />
          <Text style={styles.licaoNota}>A tela fica trancada até o fim da atividade</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Atalho titulo="Quero falar" icone="chatbubble-ellipses-outline" fundo="#E1F4FC" tinta="#0B5878" onPress={() => router.push('/falar')} />
        <Atalho titulo="Preciso de pausa" icone="pause-circle-outline" fundo="#DFF7EF" tinta="#0D6650" onPress={() => router.push('/pausa')} />
      </View>

      <Titulo2>Sobre nós</Titulo2>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Atalho titulo="Quem somos" icone="help-circle-outline" fundo="#F1EAFE" tinta="#5B2DB8" onPress={() => router.push('/sobre')} />
        <Atalho titulo="Parceiros" icone="people-outline" fundo="#E1F4FC" tinta="#0B5878" onPress={() => router.push('/sobre')} />
        <Atalho titulo="Tutorial" icone="book-outline" fundo="#EEF8DC" tinta="#46650F" onPress={() => router.push('/sobre')} />
      </View>

      <View style={{ alignItems: 'center', paddingVertical: 8, opacity: 0.9 }}>
        <Logo tamanho={56} />
      </View>
    </Tela>
  );
}

const styles = StyleSheet.create({
  fogo: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF2D4', alignItems: 'center', justifyContent: 'center' },
  ofensiva: { fontFamily: fontes.titulo, fontSize: 20, color: cores.texto },
  licao: { backgroundColor: cores.primaria, borderRadius: 26, padding: 18, gap: 10 },
  licaoSobre: { fontFamily: fontes.textoForte, fontSize: 12, color: '#D9DAFF', letterSpacing: 0.5 },
  licaoTitulo: { fontFamily: fontes.titulo, fontSize: 24, color: '#FFFFFF', marginBottom: 4 },
  licaoItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#5C60EA', borderRadius: 14, padding: 10 },
  licaoNum: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    color: cores.primaria,
    textAlign: 'center',
    lineHeight: 30,
    fontFamily: fontes.textoForte,
    overflow: 'hidden',
  },
  licaoItemTxt: { flex: 1, fontFamily: fontes.textoForte, fontSize: 15, color: '#FFFFFF' },
  licaoQtd: { fontFamily: fontes.textoForte, fontSize: 13, color: '#D9DAFF' },
  licaoNota: { fontFamily: fontes.texto, fontSize: 13, color: '#D9DAFF' },
  atalho: { flex: 1, minHeight: 92, borderRadius: 20, padding: 14, justifyContent: 'space-between' },
  atalhoTxt: { fontFamily: fontes.textoForte, fontSize: 15 },
});
