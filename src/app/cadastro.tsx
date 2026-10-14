import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Campo } from '@/components/Campo';
import { Tela } from '@/components/Tela';
import { Aviso, Botao, Texto } from '@/components/ui';
import { useApp } from '@/state/AppState';
import { cores, fontes } from '@/theme/tokens';

const GRAUS = ['Leve', 'Moderado', 'Não verbal', 'Prefiro não informar'];

function Etapa({ n, texto, suave }: { n: number; texto: string; suave?: boolean }) {
  return (
    <View style={styles.etapa}>
      <View style={[styles.etapaNum, suave && { backgroundColor: '#F0F0F8' }]}>
        <Text style={[styles.etapaNumTxt, suave && { color: cores.textoSuave }]}>{n}</Text>
      </View>
      <Text style={[styles.etapaTxt, suave && { color: cores.textoSuave }]}>{texto}</Text>
    </View>
  );
}

/** Cadastro da família: responsável, criança e (opcional) e-mail do profissional. */
export default function Cadastro() {
  const { entrar } = useApp();
  const [grau, setGrau] = useState<string | null>(null);

  return (
    <Tela
      voltar
      titulo="Faça seu cadastro"
      subtitulo="Só o básico para criar o acesso"
      fundo="#FFFFFF"
      rodape={
        <Botao
          titulo="Enviar dados"
          onPress={() => {
            entrar('responsavel');
            router.replace('/boas-vindas');
          }}
        />
      }>
      <Etapa n={1} texto="DADOS DO RESPONSÁVEL" />
      <Campo rotulo="Nome completo" autoComplete="name" />
      <View style={styles.linha}>
        <Campo rotulo="CPF" placeholder="000.000.000-00" keyboardType="number-pad" />
        <Campo rotulo="E-mail" placeholder="voce@email.com" keyboardType="email-address" autoCapitalize="none" />
      </View>

      <Etapa n={2} texto="DADOS DA CRIANÇA" />
      <Campo rotulo="Nome completo" />
      <Campo rotulo="Nascimento" placeholder="dd/mm/aaaa" keyboardType="number-pad" />
      <View style={{ gap: 6 }}>
        <Text style={styles.rotulo}>Grau do autismo</Text>
        <View style={styles.chips}>
          {GRAUS.map((g) => {
            const on = grau === g;
            return (
              <Pressable
                key={g}
                onPress={() => setGrau(g)}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                style={[styles.chip, on && styles.chipOn]}>
                <Text style={[styles.chipTxt, on && { color: cores.primariaEscura, fontFamily: fontes.textoForte }]}>{g}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.opcional}>
        <Etapa n={3} texto="PROFISSIONAL · OPCIONAL" suave />
        <Texto suave tamanho={13}>
          Se um profissional acompanha a criança, mandamos um convite. Ele cria a própria conta e vê os relatórios.
        </Texto>
        <Campo rotulo="E-mail do profissional" placeholder="clinica@email.com" keyboardType="email-address" autoCapitalize="none" />
        <Texto suave tamanho={12}>
          Também dá pra adicionar depois, em Perfil, ou usar o código que o profissional te mandar.
        </Texto>
      </View>

      <Aviso texto="Depois do envio, o responsável recebe o acesso por e-mail e o profissional recebe o convite." />
    </Tela>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', gap: 10 },
  etapa: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  etapaNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: cores.primariaClara, alignItems: 'center', justifyContent: 'center' },
  etapaNumTxt: { fontFamily: fontes.textoForte, fontSize: 12, color: cores.primaria },
  etapaTxt: { fontFamily: fontes.textoForte, fontSize: 13, color: cores.primaria, letterSpacing: 0.4 },
  rotulo: { fontFamily: fontes.textoForte, fontSize: 14, color: cores.texto },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 2, borderColor: cores.borda, justifyContent: 'center' },
  chipOn: { borderColor: cores.primaria, backgroundColor: cores.primariaClara },
  chipTxt: { fontFamily: fontes.texto, fontSize: 14, color: cores.texto },
  opcional: { borderWidth: 2, borderStyle: 'dashed', borderColor: cores.borda, borderRadius: 16, padding: 14, gap: 10, marginTop: 6 },
});
