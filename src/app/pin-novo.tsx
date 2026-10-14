import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Campo } from '@/components/Campo';
import { pinFacilDemais, TecladoPin } from '@/components/TecladoPin';
import { Aviso, Botao } from '@/components/ui';
import { useApp } from '@/state/AppState';
import { cores, espaco, fontes } from '@/theme/tokens';

/**
 * Criar ou trocar o PIN dos adultos.
 * - cadastro: logo depois do cadastro da família
 * - primeiro: entrou pelo login e ainda não tinha PIN
 * - trocar: Perfil › PIN dos adultos (pede o PIN atual antes)
 * - esqueci: pede a senha da conta antes. Protótipo: a senha ainda não é conferida (fase 2, Supabase).
 */
type Origem = 'cadastro' | 'primeiro' | 'trocar' | 'esqueci';
type Etapa = 'senha' | 'atual' | 'novo' | 'confirmar';

export default function PinNovo() {
  const app = useApp();
  const { origem = 'cadastro' } = useLocalSearchParams<{ origem?: Origem }>();
  const [etapa, setEtapa] = useState<Etapa>(origem === 'esqueci' ? 'senha' : origem === 'trocar' && app.pin ? 'atual' : 'novo');
  const [novo, setNovo] = useState('');
  const [senha, setSenha] = useState('');
  const [pronto, setPronto] = useState(false);

  function terminar(pin: string) {
    app.definirPin(pin);
    if (origem === 'cadastro') return router.replace('/boas-vindas');
    if (origem === 'trocar') return setPronto(true);
    // primeiro / esqueci: entra direto na área dos adultos
    router.dismissTo('/crianca');
    router.push('/inicio');
  }

  function aoCompletar(pin: string) {
    if (etapa === 'atual') {
      if (pin !== app.pin) return 'Esse não é o PIN atual.';
      setEtapa('novo');
      return;
    }
    if (etapa === 'novo') {
      if (pinFacilDemais(pin)) return 'Fácil demais de adivinhar. Evite 1234 ou 0000.';
      setNovo(pin);
      setEtapa('confirmar');
      return;
    }
    if (pin !== novo) {
      setEtapa('novo');
      return 'Os dois PINs ficaram diferentes. Comece de novo.';
    }
    terminar(pin);
  }

  const voltar =
    origem === 'cadastro' ? null : (
      <Pressable onPress={() => router.back()} accessibilityRole="button" style={styles.voltar}>
        <Ionicons name="chevron-back" size={20} color={cores.texto} />
        <Text style={styles.voltarTexto}>Voltar</Text>
      </Pressable>
    );

  if (pronto) {
    return (
      <SafeAreaView style={[styles.raiz, { justifyContent: 'center', gap: espaco.xl }]}>
        <View style={[styles.circulo, { backgroundColor: '#DFF7EF', alignSelf: 'center' }]}>
          <Ionicons name="checkmark" size={36} color="#0D6650" />
        </View>
        <Text accessibilityRole="header" style={styles.titulo}>
          PIN trocado
        </Text>
        <Text style={styles.sub}>Use o novo PIN da próxima vez que tocar no cadeado.</Text>
        <Botao titulo="Voltar ao Perfil" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (etapa === 'senha') {
    return (
      <SafeAreaView style={[styles.raiz, { gap: espaco.xl }]}>
        {voltar}
        <View style={{ alignItems: 'center', gap: espaco.s }}>
          <View style={styles.circulo}>
            <Ionicons name="key-outline" size={30} color={cores.primaria} />
          </View>
          <Text accessibilityRole="header" style={styles.titulo}>
            Esqueceu o PIN?
          </Text>
          <Text style={styles.sub}>Confirme a senha da sua conta para criar um PIN novo.</Text>
        </View>
        <Campo rotulo="Senha da conta" secureTextEntry value={senha} onChangeText={setSenha} autoComplete="current-password" />
        <Aviso tipo="info" texto="Só o responsável sabe a senha da conta, então a criança não consegue trocar o PIN sozinha." />
        <View style={{ flex: 1 }} />
        <Botao titulo="Continuar" desativado={senha.length === 0} onPress={() => setEtapa('novo')} />
      </SafeAreaView>
    );
  }

  const textos: Record<Exclude<Etapa, 'senha'>, [string, string]> = {
    atual: ['PIN atual', 'Digite o PIN que você usa hoje'],
    novo: [
      origem === 'trocar' || origem === 'esqueci' ? 'Novo PIN' : 'Crie o PIN dos adultos',
      'Ele separa o jogo da criança do resto do app',
    ],
    confirmar: ['Repita o PIN', 'Só para ter certeza'],
  };
  const [titulo, subtitulo] = textos[etapa];

  return (
    <SafeAreaView style={styles.raiz}>
      {voltar}
      <TecladoPin
        etapa={etapa}
        titulo={titulo}
        subtitulo={subtitulo}
        aoCompletar={aoCompletar}
        rodape={
          etapa === 'novo' ? (
            <Text style={styles.dica}>Não use a data de nascimento da criança.</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: cores.fundo, padding: espaco.xxl },
  voltar: { flexDirection: 'row', alignItems: 'center', gap: espaco.xs, minHeight: 44, alignSelf: 'flex-start' },
  voltarTexto: { fontFamily: fontes.textoForte, fontSize: 14, color: cores.texto },
  circulo: { width: 64, height: 64, borderRadius: 32, backgroundColor: cores.primariaClara, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontFamily: fontes.titulo, fontSize: 26, color: cores.texto, textAlign: 'center' },
  sub: { fontFamily: fontes.texto, fontSize: 15, color: cores.textoSuave, textAlign: 'center' },
  dica: { textAlign: 'center', fontFamily: fontes.texto, fontSize: 13, color: cores.textoSuave, minHeight: 44, textAlignVertical: 'center' },
});
