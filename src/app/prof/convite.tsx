import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tela } from '@/components/Tela';
import { Aviso, Botao, Cartao, Titulo2 } from '@/components/ui';
import { useApp } from '@/state/AppState';
import { cores, fontes } from '@/theme/tokens';

type Icone = ComponentProps<typeof Ionicons>['name'];

const PODE: { icone: Icone; texto: string }[] = [
  { icone: 'bar-chart-outline', texto: 'Ver relatórios por módulo de estímulo' },
  { icone: 'create-outline', texto: 'Escrever observações para a família' },
  { icone: 'calendar-outline', texto: 'Acompanhar o dia a dia entre as sessões' },
  { icone: 'game-controller-outline', texto: 'Escolher os jogos da trilha da criança' },
];

/** Caminho 1: o profissional abre o convite que a família mandou por e-mail. */
export default function Convite() {
  const { nomeCrianca } = useApp();
  return (
    <Tela
      voltar
      fundo="#FFFFFF"
      rodape={
        <>
          <Botao titulo="Aceitar e criar conta" onPress={() => router.push('/prof/cadastro')} />
          <Botao variante="secundario" titulo="Já tenho conta no Daily Hero" onPress={() => router.push('/login')} />
        </>
      }>
      <View style={styles.par}>
        <View style={[styles.bola, { backgroundColor: '#E1F4FC' }]}>
          <Text style={{ fontFamily: fontes.titulo, fontSize: 24, color: '#0B5878' }}>R</Text>
        </View>
        <Ionicons name="arrow-forward" size={24} color={cores.primaria} />
        <View style={[styles.bola, { backgroundColor: '#F1EAFE' }]}>
          <Ionicons name="medkit-outline" size={28} color="#5B2DB8" />
        </View>
      </View>
      <Text style={styles.sobre}>CONVITE PARA PROFISSIONAL</Text>
      <Text accessibilityRole="header" style={styles.titulo}>
        {`[Nome do responsável] convidou você para acompanhar ${nomeCrianca}`}
      </Text>
      <Cartao>
        <Titulo2>Com o acesso, você poderá:</Titulo2>
        {PODE.map((p) => (
          <View key={p.texto} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.icone}>
              <Ionicons name={p.icone} size={18} color={cores.primaria} />
            </View>
            <Text style={styles.item}>{p.texto}</Text>
          </View>
        ))}
      </Cartao>
      <Aviso tipo="sucesso" texto="O convite partiu do responsável, então o acesso já vem autorizado." />
    </Tela>
  );
}

const styles = StyleSheet.create({
  par: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 8 },
  bola: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  sobre: { fontFamily: fontes.textoForte, fontSize: 13, color: cores.primaria, letterSpacing: 0.5, textAlign: 'center' },
  titulo: { fontFamily: fontes.titulo, fontSize: 24, color: cores.texto, textAlign: 'center', lineHeight: 30 },
  icone: { width: 34, height: 34, borderRadius: 10, backgroundColor: cores.primariaClara, alignItems: 'center', justifyContent: 'center' },
  item: { flex: 1, fontFamily: fontes.textoForte, fontSize: 15, color: cores.texto },
});
