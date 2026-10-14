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

function Ajuste({ titulo, valorInicial }: { titulo: string; valorInicial: boolean }) {
  const [v, setV] = useState(valorInicial);
  return (
    <View style={styles.ajuste}>
      <Text style={styles.ajusteTxt}>{titulo}</Text>
      <Switch value={v} onValueChange={setV} trackColor={{ true: cores.primaria, false: '#C9C9DE' }} accessibilityLabel={titulo} />
    </View>
  );
}

export default function Perfil() {
  const app = useApp();
  const [sair, setSair] = useState<'3' | '5' | 'fim'>('3');

  return (
    <Tela comAbas titulo="Perfil">
      <View style={styles.crianca}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{app.nomeCrianca.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.criancaNome}>{app.nomeCrianca}</Text>
          <Text style={styles.criancaSub}>[x] anos · dados do cadastro</Text>
        </View>
      </View>

      <Cartao>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Titulo2>Pessoas com acesso</Titulo2>
          <Pressable onPress={() => router.push('/aprovacao')} accessibilityRole="button" style={styles.mais}>
            <Text style={styles.maisTxt}>+ Profissional</Text>
          </Pressable>
        </View>
        <Pessoa inicial="R" nome="[Nome do responsável]" email="responsavel@email.com" />
        {app.profissionalAprovado ? (
          <Pessoa
            inicial="P"
            nome="[Nome do profissional]"
            email="clinica@email.com"
            onRemover={() => app.decidirProfissional(false)}
          />
        ) : (
          <Texto suave tamanho={13}>
            {app.profissionalAprovado === null ? 'Há um pedido de acesso esperando você aprovar.' : 'Nenhum profissional com acesso.'}
          </Texto>
        )}
      </Cartao>

      <Cartao estilo={{ padding: 4, gap: 0 }}>
        <Linha icone="home-outline" titulo="Hábitos da casa" sub={`${app.habitos.length} hábitos · tocar para editar a ordem`} onPress={() => router.push('/habitos')} fundo="#DFF7EF" tinta="#0D6650" />
      </Cartao>

      <Cartao estilo={{ gap: 0 }}>
        <Titulo2>Acessibilidade e ajustes</Titulo2>
        <Ajuste titulo="Sons e música" valorInicial />
        <Ajuste titulo="Animações (inclui a abertura)" valorInicial />
        <Ajuste titulo="Narração das telas" valorInicial />
        <View style={[styles.ajuste, { flexDirection: 'column', alignItems: 'stretch', gap: 8, paddingVertical: 10 }]}>
          <Text style={styles.ajusteTxt}>Sair da atividade</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[
              { v: '3' as const, r: 'Segurar 3 s' },
              { v: '5' as const, r: 'Segurar 5 s' },
              { v: 'fim' as const, r: 'Só ao terminar' },
            ].map((o) => (
              <Pressable
                key={o.v}
                onPress={() => setSair(o.v)}
                accessibilityRole="radio"
                accessibilityState={{ selected: sair === o.v }}
                style={[styles.opcao, sair === o.v && styles.opcaoOn]}>
                <Text style={[styles.opcaoTxt, sair === o.v && { color: cores.primariaEscura, fontFamily: fontes.textoForte }]}>{o.r}</Text>
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
        <Botao variante="texto" titulo="Ver a abertura de novo" onPress={() => router.replace('/')} />
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
