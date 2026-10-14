import { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Tela } from '@/components/Tela';
import { Aviso, Botao, BotaoIcone, Cartao, Segmentado, Selo, Texto, Titulo2 } from '@/components/ui';
import { RELATORIO_EXEMPLO, statusDoValor } from '@/data/catalogo';
import { useApp } from '@/state/AppState';
import { cores, fontes, modulos, status } from '@/theme/tokens';

type Aba = 'relatorios' | 'observacoes' | 'dias';

type Observacao = { autor: 'Profissional' | 'Responsável'; data: string; texto: string; visivel: boolean };

/** Gráfico de barras simples: acertos de primeira por dia (em %). */
function Grafico() {
  const { acertosSemana, diasSemana } = RELATORIO_EXEMPLO;
  return (
    <View accessible accessibilityLabel={`Acertos de primeira por dia: ${acertosSemana.map((v, i) => `${diasSemana[i]} ${v}%`).join(', ')}`}>
      <View style={styles.grafico}>
        {acertosSemana.map((v, i) => (
          <View key={i} style={styles.colunaWrap}>
            <Text style={styles.valor}>{v}</Text>
            <View style={[styles.coluna, { height: `${v}%`, backgroundColor: i === acertosSemana.length - 1 ? cores.primaria : '#B9BBF5' }]} />
          </View>
        ))}
      </View>
      <View style={styles.eixo}>
        {diasSemana.map((d, i) => (
          <Text key={i} style={[styles.dia, i === diasSemana.length - 1 && { color: cores.primaria, fontFamily: fontes.textoForte }]}>
            {d}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function Relatorios() {
  const app = useApp();
  const [aba, setAba] = useState<Aba>('relatorios');
  const [nova, setNova] = useState('');
  const [visivel, setVisivel] = useState(true);
  const [observacoes, setObservacoes] = useState<Observacao[]>([
    { autor: 'Profissional', data: 'TER 13/10', texto: 'Na sessão, reconheceu "triste" sozinho pela primeira vez.', visivel: true },
    { autor: 'Profissional', data: 'TER 13/10', texto: 'Observar se a queda em Socioemocional se repete.', visivel: false },
    { autor: 'Responsável', data: 'SEG 12/10', texto: 'Escovou os dentes sem ajuda depois da lição.', visivel: true },
  ]);

  const tarefasHoje = app.registros.filter((r) => r.atividade.startsWith('tarefa')).length;
  const jogosHoje = app.registros.filter((r) => r.atividade.startsWith('jogo')).length;

  return (
    <Tela comAbas titulo="Relatórios" subtitulo="Pais e profissional · dados de exemplo" direita={<BotaoIcone icone="share-outline" rotulo="Compartilhar relatório" onPress={() => {}} />}>
      <Segmentado<Aba>
        valor={aba}
        onChange={setAba}
        opcoes={[
          { valor: 'relatorios', rotulo: 'Relatórios' },
          { valor: 'observacoes', rotulo: 'Observações' },
          { valor: 'dias', rotulo: 'Dia após dia' },
        ]}
      />

      {aba === 'relatorios' ? (
        <>
          <Aviso tipo="sucesso" texto={`Parabéns! ${app.nomeCrianca} está evoluindo: +[x]% de acertos no mês.`} />

          <Cartao>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Titulo2>Acompanhamento</Titulo2>
              <Texto suave tamanho={12}>% de acertos de primeira</Texto>
            </View>
            <Grafico />
          </Cartao>

          <Cartao>
            <Titulo2>Módulos de estímulo</Titulo2>
            <Texto suave tamanho={12}>Comparado com o próprio {app.nomeCrianca}, nas últimas semanas.</Texto>
            {RELATORIO_EXEMPLO.modulos.map(({ modulo, valor }) => {
              const s = status[statusDoValor(valor)];
              return (
                <View key={modulo} style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.modNome}>{modulos[modulo].nome}</Text>
                    <Selo texto={s.rotulo} fundo={s.fundo} tinta={s.tinta} />
                  </View>
                  <View style={styles.trilho}>
                    <View style={[styles.barra, { width: `${valor}%`, backgroundColor: s.barra }]} />
                  </View>
                </View>
              );
            })}
          </Cartao>

          <Aviso tipo="reforco" texto="Socioemocional caiu nos últimos 3 dias. Vale levar para a próxima sessão." />

          <Cartao>
            <Titulo2>Pessoas com acesso</Titulo2>
            <Pessoa inicial="R" nome="[Nome do responsável]" papel="Responsável" />
            {app.profissionalAprovado ? <Pessoa inicial="P" nome="[Nome do profissional]" papel="Profissional" /> : null}
          </Cartao>
        </>
      ) : null}

      {aba === 'observacoes' ? (
        <>
          <View style={{ gap: 6 }}>
            <Text style={styles.rotulo}>Nova observação</Text>
            <TextInput
              value={nova}
              onChangeText={setNova}
              placeholder="O que você notou nesta semana?"
              placeholderTextColor="#8A8AA8"
              multiline
              accessibilityLabel="Nova observação"
              style={styles.area}
            />
          </View>
          <View style={styles.linhaSwitch}>
            <Text style={styles.rotulo}>Visível para a família</Text>
            <Switch value={visivel} onValueChange={setVisivel} trackColor={{ true: cores.primaria, false: '#C9C9DE' }} accessibilityLabel="Visível para a família" />
          </View>
          <Botao
            titulo="Salvar observação"
            desativado={!nova.trim()}
            onPress={() => {
              setObservacoes((o) => [
                { autor: app.perfil === 'profissional' ? 'Profissional' : 'Responsável', data: 'HOJE', texto: nova.trim(), visivel },
                ...o,
              ]);
              setNova('');
            }}
          />
          {observacoes.map((o, i) => (
            <Cartao key={i} estilo={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.autor, { color: o.autor === 'Profissional' ? '#5B2DB8' : '#0B5878' }]}>{`${o.autor.toUpperCase()} · ${o.data}`}</Text>
                {!o.visivel ? <Selo texto="Só para o profissional" fundo="#F0F0F8" tinta={cores.textoSuave} icone="eye-off-outline" /> : null}
              </View>
              <Texto>{o.texto}</Texto>
            </Cartao>
          ))}
        </>
      ) : null}

      {aba === 'dias' ? (
        <>
          <Texto suave tamanho={13}>Cada atividade registra tempo, tentativas, ajudas, acertos e como a criança se sentiu.</Texto>
          <Cartao estilo={{ borderColor: cores.primaria, borderWidth: 2 }}>
            <View style={styles.diaTopo}>
              <Text style={styles.diaNome}>Hoje</Text>
              <Text style={[styles.diaStatus, { color: app.licaoConcluidaHoje ? '#0D6650' : cores.primaria }]}>
                {app.licaoConcluidaHoje ? 'Completa' : 'Em andamento'}
              </Text>
            </View>
            <Texto suave tamanho={13}>{`${tarefasHoje} de ${app.habitos.length} tasks · ${jogosHoje} jogos`}</Texto>
            <View style={styles.medidas}>
              {app.registros.length ? (
                <>
                  <Medida texto={`${app.registros.reduce((s, r) => s + r.segundos, 0)} s`} />
                  <Medida texto={`${app.registros.reduce((s, r) => s + r.tentativas, 0)} tentativas`} />
                  <Medida texto={`${app.registros.reduce((s, r) => s + r.ajudas, 0)} ajudas`} />
                  {app.sentimento ? <Medida texto={`Sentiu: ${{ bem: 'bem', mais: 'mais ou menos', chateado: 'chateado' }[app.sentimento]}`} /> : null}
                </>
              ) : (
                <Texto suave tamanho={13}>Os números aparecem aqui quando a lição de hoje começar.</Texto>
              )}
            </View>
          </Cartao>
          {[
            { dia: 'Ter 13/10', sentiu: 'bem' },
            { dia: 'Seg 12/10', sentiu: 'chateado' },
          ].map((d) => (
            <Cartao key={d.dia}>
              <View style={styles.diaTopo}>
                <Text style={styles.diaNome}>{d.dia}</Text>
                <Text style={[styles.diaStatus, { color: '#0D6650' }]}>Completa</Text>
              </View>
              <View style={styles.medidas}>
                <Medida texto="[x] min" />
                <Medida texto="[x] tentativas" />
                <Medida texto="[x] ajudas" />
                <Medida texto={`Sentiu: ${d.sentiu}`} destaque={d.sentiu === 'chateado'} />
              </View>
            </Cartao>
          ))}
        </>
      ) : null}
    </Tela>
  );
}

function Pessoa({ inicial, nome, papel }: { inicial: string; nome: string; papel: string }) {
  const prof = papel === 'Profissional';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={[styles.avatar, { backgroundColor: prof ? '#F1EAFE' : '#E1F4FC' }]}>
        <Text style={{ fontFamily: fontes.textoForte, color: prof ? '#5B2DB8' : '#0B5878' }}>{inicial}</Text>
      </View>
      <Text style={{ flex: 1, fontFamily: fontes.textoForte, fontSize: 14, color: cores.texto }}>{nome}</Text>
      <Text style={{ fontFamily: fontes.texto, fontSize: 12, color: cores.textoSuave }}>{papel}</Text>
    </View>
  );
}

function Medida({ texto, destaque }: { texto: string; destaque?: boolean }) {
  return (
    <View style={[styles.medida, destaque && { backgroundColor: '#FCE6F1' }]}>
      <Text style={[styles.medidaTxt, destaque && { color: '#9C1F63' }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grafico: { height: 140, flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingTop: 16 },
  colunaWrap: { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center', gap: 2 },
  coluna: { width: '100%', borderTopLeftRadius: 6, borderTopRightRadius: 6, minHeight: 4 },
  valor: { fontFamily: fontes.textoForte, fontSize: 11, color: cores.textoSuave },
  eixo: { flexDirection: 'row', gap: 8, marginTop: 6 },
  dia: { flex: 1, textAlign: 'center', fontFamily: fontes.texto, fontSize: 11, color: cores.textoSuave },
  modNome: { fontFamily: fontes.textoForte, fontSize: 14, color: cores.texto, flex: 1 },
  trilho: { height: 10, borderRadius: 5, backgroundColor: '#ECECF7', overflow: 'hidden' },
  barra: { height: 10, borderRadius: 5 },
  rotulo: { fontFamily: fontes.textoForte, fontSize: 14, color: cores.texto },
  area: { minHeight: 100, borderRadius: 14, borderWidth: 2, borderColor: cores.borda, backgroundColor: cores.superficie, padding: 12, fontFamily: fontes.texto, fontSize: 15, color: cores.texto, textAlignVertical: 'top' },
  linhaSwitch: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, backgroundColor: cores.superficie, borderRadius: 14, borderWidth: 1, borderColor: cores.borda, paddingHorizontal: 14 },
  autor: { fontFamily: fontes.textoForte, fontSize: 12, flexShrink: 1 },
  diaTopo: { flexDirection: 'row', justifyContent: 'space-between' },
  diaNome: { fontFamily: fontes.textoForte, fontSize: 16, color: cores.texto },
  diaStatus: { fontFamily: fontes.textoForte, fontSize: 13 },
  medidas: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  medida: { backgroundColor: cores.fundo, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  medidaTxt: { fontFamily: fontes.textoForte, fontSize: 12, color: cores.texto },
  avatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});

