import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Tela } from '@/components/Tela';
import { Botao, Cartao, Texto, Titulo2 } from '@/components/ui';
import { useApp } from '@/state/AppState';
import { cores, fontes } from '@/theme/tokens';

type Icone = ComponentProps<typeof Ionicons>['name'];

function Linha({ icone, titulo, sub, onPress, fundo, tinta }: { icone: Icone; titulo: string; sub?: string; onPress: () => void; fundo: string; tinta: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.linha}>
      <View style={[styles.linhaIcone, { backgroundColor: fundo }]}>
        <Ionicons name={icone} size={20} color={tinta} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.linhaTitulo}>{titulo}</Text>
        {sub ? <Text style={styles.linhaSub}>{sub}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={cores.textoSuave} />
    </Pressable>
  );
}

function Ajuste({ titulo, valor, onChange }: { titulo: string; valor: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.ajuste}>
      <Text style={styles.ajusteTxt}>{titulo}</Text>
      <Switch value={valor} onValueChange={onChange} trackColor={{ true: cores.primaria, false: '#C9C9DE' }} accessibilityLabel={titulo} />
    </View>
  );
}

/** "7 anos" a partir de dd/mm/aaaa (ou null se a data não foi preenchida). */
function idade(nasc: string) {
  const m = nasc.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const hoje = new Date();
  let anos = hoje.getFullYear() - Number(m[3]);
  if (hoje.getMonth() + 1 < Number(m[2]) || (hoje.getMonth() + 1 === Number(m[2]) && hoje.getDate() < Number(m[1]))) anos--;
  return anos >= 0 && anos < 30 ? `${anos} ${anos === 1 ? 'ano' : 'anos'}` : null;
}

export default function Perfil() {
  const app = useApp();
  const [confirmarApagar, setConfirmarApagar] = useState(false);

  return (
    <Tela comAbas titulo="Perfil">
      <View style={styles.crianca}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{app.nomeCrianca.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.criancaNome}>{app.nomeCrianca}</Text>
          <Text style={styles.criancaSub}>{idade(app.crianca.nascimento) ?? 'Dados do cadastro'}</Text>
        </View>
      </View>

      <Cartao>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Titulo2>Pessoas com acesso</Titulo2>
          <Pressable onPress={() => router.push('/vincular')} accessibilityRole="button" style={styles.mais}>
            <Text style={styles.maisTxt}>+ Profissional</Text>
          </Pressable>
        </View>
        <Pessoa inicial={(app.nomeResponsavel || 'R').charAt(0)} nome={app.nomeResponsavel || 'Responsável'} email={app.emailConta || 'Conta deste celular'} />
        {app.profissional.status === 'aprovado' ? (
          <Pessoa
            inicial={(app.profissional.nome || 'P').charAt(0)}
            nome={app.profissional.nome || 'Profissional'}
            email={app.profissional.email || 'Profissional'}
            onRemover={() => app.decidirProfissional(false)}
          />
        ) : app.profissional.status === 'pendente' ? (
          <Pressable onPress={() => router.push('/aprovacao')} accessibilityRole="button">
            <Texto tamanho={13}>Há um pedido de acesso esperando você aprovar. Toque para ver.</Texto>
          </Pressable>
        ) : app.profissional.status === 'convidado' ? (
          <Texto suave tamanho={13}>{`Convite enviado para ${app.profissional.email}. Esperando o profissional criar a conta.`}</Texto>
        ) : (
          <Texto suave tamanho={13}>Nenhum profissional com acesso.</Texto>
        )}
      </Cartao>

      <Cartao estilo={{ padding: 4, gap: 0 }}>
        <Linha icone="home-outline" titulo="Hábitos da casa" sub={`${app.habitos.length} hábitos · tocar para editar a ordem`} onPress={() => router.push({ pathname: '/habitos', params: { de: 'perfil' } })} fundo="#DFF7EF" tinta="#0D6650" />
        <Linha icone="keypad-outline" titulo="PIN dos adultos" sub={app.temPin ? 'Trocar o PIN' : 'Ainda não criado · tocar para criar'} onPress={() => router.push({ pathname: '/pin-novo', params: { origem: 'trocar' } })} fundo="#F1EAFE" tinta="#5B2DB8" />
      </Cartao>

      <Cartao estilo={{ gap: 0 }}>
        <Titulo2>Acessibilidade e ajustes</Titulo2>
        <Ajuste titulo="Animações (inclui a abertura)" valor={app.ajustes.animacoes} onChange={(v) => app.mudarAjuste('animacoes', v)} />
        <Ajuste titulo="Narração das tarefas (voz)" valor={app.ajustes.narracao} onChange={(v) => app.mudarAjuste('narracao', v)} />
        <View style={[styles.ajuste, { flexDirection: 'column', alignItems: 'stretch', gap: 8, paddingVertical: 10 }]}>
          <Text style={styles.ajusteTxt}>Sair da atividade</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[
              { v: 3 as const, r: 'Segurar 3 s' },
              { v: 5 as const, r: 'Segurar 5 s' },
              { v: 0 as const, r: 'Só ao terminar' },
            ].map((o) => (
              <Pressable
                key={o.v}
                onPress={() => app.mudarAjuste('sairSeg', o.v)}
                accessibilityRole="radio"
                accessibilityState={{ selected: app.ajustes.sairSeg === o.v }}
                style={[styles.opcao, app.ajustes.sairSeg === o.v && styles.opcaoOn]}>
                <Text style={[styles.opcaoTxt, app.ajustes.sairSeg === o.v && { color: cores.primariaEscura, fontFamily: fontes.textoForte }]}>{o.r}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Cartao>

      <Botao variante="secundario" icone="happy-outline" titulo="Voltar ao modo criança" onPress={() => router.replace('/crianca')} />

      <Cartao estilo={{ borderStyle: 'dashed', borderWidth: 2 }}>
        <Titulo2>Telas de teste (só no protótipo)</Titulo2>
        <Botao variante="texto" titulo="Ver a tela de erro" onPress={() => router.push('/erro')} />
        <Botao variante="texto" titulo="Ver o convite do profissional" onPress={() => router.push('/prof/convite')} />
        <Botao variante="texto" titulo="Ver a pausa" onPress={() => router.push('/pausa')} />
        <Botao variante="texto" titulo="Ver a abertura de novo" onPress={() => router.replace('/')} />
      </Cartao>

      <Cartao>
        <Titulo2>Privacidade</Titulo2>
        <Texto suave tamanho={13}>
          {app.nuvemAtiva
            ? `Dados salvos neste celular e na sua conta.${app.pendentesDeEnvio ? ` ${app.pendentesDeEnvio} atividades esperando internet para subir.` : ' Tudo enviado.'}`
            : 'Modo local: os dados ficam só neste celular. Ninguém mais tem acesso.'}
        </Texto>
        <Botao
          variante="perigo"
          titulo={confirmarApagar ? 'Toque de novo para apagar TUDO' : 'Apagar os dados deste celular'}
          onPress={async () => {
            if (!confirmarApagar) return setConfirmarApagar(true);
            await app.apagarTudo();
            router.replace('/login');
          }}
        />
        {confirmarApagar ? <Botao variante="texto" titulo="Cancelar" onPress={() => setConfirmarApagar(false)} /> : null}
      </Cartao>

      <Botao
        variante="perigo"
        titulo="Sair da conta"
        onPress={() => {
          app.sair();
          router.replace('/login');
        }}
      />
    </Tela>
  );
}

function Pessoa({ inicial, nome, email, onRemover }: { inicial: string; nome: string; email: string; onRemover?: () => void }) {
  const prof = inicial === 'P';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={[styles.pAvatar, { backgroundColor: prof ? '#F1EAFE' : '#E1F4FC' }]}>
        <Text style={{ fontFamily: fontes.textoForte, color: prof ? '#5B2DB8' : '#0B5878' }}>{inicial}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fontes.textoForte, fontSize: 14, color: cores.texto }}>{nome}</Text>
        <Text style={{ fontFamily: fontes.texto, fontSize: 12, color: cores.textoSuave }}>{email}</Text>
      </View>
      {onRemover ? (
        <Pressable onPress={onRemover} accessibilityRole="button" accessibilityLabel="Remover profissional" style={styles.remover}>
          <Text style={styles.removerTxt}>Remover</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  crianca: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: cores.primaria, borderRadius: 20, padding: 16 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: cores.ouro, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: fontes.titulo, fontSize: 22, color: '#2E1C00' },
  criancaNome: { fontFamily: fontes.titulo, fontSize: 20, color: '#FFFFFF' },
  criancaSub: { fontFamily: fontes.texto, fontSize: 13, color: '#D9DAFF' },
  mais: { minHeight: 36, paddingHorizontal: 12, borderRadius: 18, backgroundColor: cores.primariaClara, justifyContent: 'center' },
  maisTxt: { fontFamily: fontes.textoForte, fontSize: 13, color: cores.primaria },
  pAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  remover: { minHeight: 36, paddingHorizontal: 12, borderRadius: 18, borderWidth: 1, borderColor: '#F3C7DD', justifyContent: 'center' },
  removerTxt: { fontFamily: fontes.textoForte, fontSize: 13, color: '#9C1F63' },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingHorizontal: 12 },
  linhaIcone: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  linhaTitulo: { fontFamily: fontes.textoForte, fontSize: 15, color: cores.texto },
  linhaSub: { fontFamily: fontes.texto, fontSize: 12, color: cores.textoSuave },
  ajuste: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 50 },
  ajusteTxt: { fontFamily: fontes.textoForte, fontSize: 15, color: cores.texto, flex: 1 },
  opcao: { flex: 1, minHeight: 44, borderRadius: 12, borderWidth: 2, borderColor: cores.borda, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  opcaoOn: { borderColor: cores.primaria, backgroundColor: cores.primariaClara },
  opcaoTxt: { fontFamily: fontes.texto, fontSize: 12, color: cores.texto, textAlign: 'center' },
});
