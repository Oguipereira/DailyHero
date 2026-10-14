import { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Aviso, Botao, Cartao, Segmentado, Selo, Texto, Titulo2 } from '@/components/ui';
import { statusDoValor } from '@/data/catalogo';
import { acertosPorDia, dataCurta, diaAposDia, evolucao, porModulo, quedas, registrosDeExemplo } from '@/data/relatorio';
import type { Licao, Observacao, Papel, Registro } from '@/state/AppState';
import { cores, fontes, modulos, status } from '@/theme/tokens';

type Aba = 'relatorios' | 'observacoes' | 'dias';

const SENTIU = { bem: 'bem', mais: 'mais ou menos', chateado: 'chateado' } as const;

type Props = {
  nome: string;
  hoje: string;
  registros: Registro[];
  licoes: Licao[];
  observacoes: Observacao[];
  /** Quem está olhando: a família não vê as notas "só para o profissional". */
  quemVe: Papel;
  aoObservar?: (texto: string, visivelFamilia: boolean) => void;
  /** Conteúdo extra no fim da aba Relatórios (ex.: pessoas com acesso). */
  rodapeRelatorios?: React.ReactNode;
};

/** Gráfico de barras: % de acertos de primeira nos últimos 7 dias. Dia sem lição aparece vazio. */
function Grafico({ dias }: { dias: ReturnType<typeof acertosPorDia> }) {
  const descricao = dias.map((d) => `${d.rotulo} ${d.valor === null ? 'sem lição' : `${d.valor}%`}`).join(', ');
  return (
    <View accessible accessibilityLabel={`Acertos de primeira por dia: ${descricao}`}>
      <View style={styles.grafico}>
        {dias.map((d, i) => (
          <View key={d.dia} style={styles.colunaWrap}>
            <Text style={styles.valor}>{d.valor ?? '–'}</Text>
            <View
              style={[
                styles.coluna,
                { height: `${d.valor ?? 0}%`, backgroundColor: i === dias.length - 1 ? cores.primaria : '#B9BBF5' },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={styles.eixo}>
        {dias.map((d, i) => (
          <Text key={d.dia} style={[styles.dia, i === dias.length - 1 && { color: cores.primaria, fontFamily: fontes.textoForte }]}>
            {d.rotulo}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function Relatorio({ nome, hoje, registros, licoes, observacoes, quemVe, aoObservar, rodapeRelatorios }: Props) {
  const [aba, setAba] = useState<Aba>('relatorios');
  const [exemplo, setExemplo] = useState(false);
  const [nova, setNova] = useState('');
  const [visivel, setVisivel] = useState(true);

  const semDados = registros.length === 0;
  const dados = exemplo && semDados ? registrosDeExemplo(hoje) : { registros, licoes };
  const mods = porModulo(dados.registros, hoje);
  const evo = evolucao(dados.registros, hoje);
  const caiu = quedas(dados.registros, hoje);
  const dias = diaAposDia(dados.registros, dados.licoes);
  const obsVisiveis = observacoes.filter((o) => quemVe === 'profissional' || o.visivelFamilia);

  return (
    <>
      <Segmentado<Aba>
        valor={aba}
        onChange={setAba}
        opcoes={[
          { valor: 'relatorios', rotulo: 'Relatórios' },
          { valor: 'observacoes', rotulo: 'Observações' },
          { valor: 'dias', rotulo: 'Dia após dia' },
        ]}
      />

      {semDados && aba !== 'observacoes' ? (
        <Cartao estilo={{ gap: 10 }}>
          <Texto>{exemplo ? 'Você está vendo dados de EXEMPLO.' : `Ainda não há lições de ${nome}. Os números aparecem aqui depois da primeira.`}</Texto>
          <Botao variante="secundario" titulo={exemplo ? 'Esconder exemplo' : 'Ver como fica, com dados de exemplo'} onPress={() => setExemplo((x) => !x)} />
        </Cartao>
      ) : null}

      {aba === 'relatorios' && (!semDados || exemplo) ? (
        <>
          {evo !== null && evo > 0 ? <Aviso tipo="sucesso" texto={`${nome} está evoluindo: +${evo} pontos de acerto em relação à semana passada.`} /> : null}
          {evo !== null && evo < 0 ? <Aviso tipo="info" texto={`Semana um pouco mais difícil: ${evo} pontos em relação à anterior. Oscilar é normal.`} /> : null}

          <Cartao>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Titulo2>Acompanhamento</Titulo2>
              <Texto suave tamanho={12}>% de acertos de primeira</Texto>
            </View>
            <Grafico dias={acertosPorDia(dados.registros, hoje)} />
          </Cartao>

          <Cartao>
            <Titulo2>Módulos de estímulo</Titulo2>
            <Texto suave tamanho={12}>{`Comparado com o próprio ${nome}, nas últimas 4 semanas.`}</Texto>
            {mods.map(({ modulo, valor }) => {
              const s = status[statusDoValor(valor)];
              return (
                <View key={modulo} style={{ gap: 6 }} accessible accessibilityLabel={`${modulos[modulo].nome}: ${valor}%, ${s.rotulo}`}>
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

          {caiu.map((c) => (
            <Aviso key={c.modulo} tipo="reforco" texto={`${modulos[c.modulo].nome} caiu ${c.queda} pontos nos últimos 3 dias. Vale levar para a próxima sessão.`} />
          ))}
        </>
      ) : null}

      {aba === 'relatorios' ? rodapeRelatorios : null}

      {aba === 'observacoes' ? (
        <>
          {aoObservar ? (
            <>
              <View style={{ gap: 6 }}>
                <Text style={styles.rotulo}>Nova observação</Text>
                <TextInput
                  value={nova}
                  onChangeText={setNova}
                  placeholder={quemVe === 'profissional' ? 'O que observar nesta semana?' : 'O que você notou em casa?'}
                  placeholderTextColor="#8A8AA8"
                  multiline
                  maxLength={2000}
                  accessibilityLabel="Nova observação"
                  style={styles.area}
                />
              </View>
              {quemVe === 'profissional' ? (
                <View style={styles.linhaSwitch}>
                  <Text style={styles.rotulo}>Visível para a família</Text>
                  <Switch value={visivel} onValueChange={setVisivel} trackColor={{ true: cores.primaria, false: '#C9C9DE' }} accessibilityLabel="Visível para a família" />
                </View>
              ) : null}
              <Botao
                titulo="Salvar observação"
                desativado={!nova.trim()}
                onPress={() => {
                  aoObservar(nova, visivel);
                  setNova('');
                }}
              />
            </>
          ) : null}
          {obsVisiveis.length === 0 ? <Texto suave centro>Nenhuma observação ainda.</Texto> : null}
          {obsVisiveis.map((o) => (
            <Cartao key={o.id} estilo={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.autor, { color: o.autor === 'profissional' ? '#5B2DB8' : '#0B5878' }]}>
                  {`${o.autor === 'profissional' ? 'PROFISSIONAL' : 'RESPONSÁVEL'} · ${dataCurta(o.quando.slice(0, 10)).toUpperCase()}`}
                </Text>
                {!o.visivelFamilia ? <Selo texto="Só para o profissional" fundo="#F0F0F8" tinta={cores.textoSuave} icone="eye-off-outline" /> : null}
              </View>
              <Texto>{o.texto}</Texto>
            </Cartao>
          ))}
        </>
      ) : null}

      {aba === 'dias' && (!semDados || exemplo) ? (
        <>
          <Texto suave tamanho={13}>Cada atividade registra tempo, tentativas, ajudas, acertos e como a criança se sentiu.</Texto>
          {dias.map((d) => (
            <Cartao key={d.dia} estilo={d.dia === hoje ? { borderColor: cores.primaria, borderWidth: 2 } : undefined}>
              <View style={styles.diaTopo}>
                <Text style={styles.diaNome}>{d.dia === hoje ? 'Hoje' : dataCurta(d.dia)}</Text>
                <Text style={[styles.diaStatus, { color: d.completa ? '#0D6650' : cores.primaria }]}>{d.completa ? 'Completa' : 'Incompleta'}</Text>
              </View>
              <Texto suave tamanho={13}>{`${d.tarefas} tarefas · ${d.jogos} jogos${d.acertos === null ? '' : ` · ${d.acertos}% de primeira`}`}</Texto>
              <View style={styles.medidas}>
                <Medida texto={`${d.minutos} min`} />
                <Medida texto={`${d.tentativas} tentativas`} />
                <Medida texto={`${d.ajudas} ajudas`} />
                {d.sentimento ? <Medida texto={`Sentiu: ${SENTIU[d.sentimento]}`} destaque={d.sentimento === 'chateado'} /> : null}
              </View>
            </Cartao>
          ))}
        </>
      ) : null}
    </>
  );
}

export function Pessoa({ inicial, nome, papel }: { inicial: string; nome: string; papel: string }) {
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
