import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Campo } from '@/components/Campo';
import { Logo } from '@/components/Logo';
import { Tela } from '@/components/Tela';
import { Botao, Segmentado, Texto } from '@/components/ui';
import { useApp } from '@/state/AppState';
import { cores, fontes } from '@/theme/tokens';

/**
 * Login único: responsável e profissional entram pela mesma tela.
 * Protótipo: qualquer e-mail e senha entram. Na fase 2 o login passa a ser real.
 */
export default function Login() {
  const { entrar } = useApp();
  const [quem, setQuem] = useState<'responsavel' | 'profissional'>('responsavel');

  function continuar() {
    entrar(quem);
    router.replace(quem === 'responsavel' ? '/crianca' : '/prof/painel');
  }

  return (
    <Tela
      fundo="#FFFFFF"
      rodape={
        <Texto suave centro tamanho={12}>
          Ao continuar, você concorda com os Termos de Serviço e a Política de Privacidade.
        </Texto>
      }>
      <View style={styles.marca}>
        <Logo tamanho={96} />
        <Text style={styles.nome}>
          Daily <Text style={{ color: cores.primaria }}>Hero</Text>
        </Text>
      </View>

      <View style={{ gap: 4, marginTop: 8 }}>
        <Text accessibilityRole="header" style={styles.titulo}>
          Entrar
        </Text>
        <Texto suave>Use o acesso que chegou no seu e-mail.</Texto>
      </View>

      <Segmentado
        valor={quem}
        onChange={setQuem}
        opcoes={[
          { valor: 'responsavel', rotulo: 'Responsável' },
          { valor: 'profissional', rotulo: 'Profissional' },
        ]}
      />

      <Campo rotulo="E-mail" placeholder="email@dominio.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <Campo rotulo="Senha" placeholder="Sua senha" secureTextEntry autoComplete="password" />

      <Botao titulo="Continuar" onPress={continuar} />

      <Botao
        variante="texto"
        titulo={quem === 'responsavel' ? 'Primeiro acesso? Cadastrar família' : 'Ainda não tem conta? Criar conta profissional'}
        onPress={() => router.push(quem === 'responsavel' ? '/cadastro' : '/prof/cadastro')}
      />
    </Tela>
  );
}

const styles = StyleSheet.create({
  marca: { alignItems: 'center', gap: 8, marginTop: 20 },
  nome: { fontFamily: fontes.titulo, fontSize: 30, color: cores.texto },
  titulo: { fontFamily: fontes.titulo, fontSize: 26, color: cores.texto },
});
