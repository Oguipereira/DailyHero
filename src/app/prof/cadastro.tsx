import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Campo } from '@/components/Campo';
import { Tela } from '@/components/Tela';
import { Botao } from '@/components/ui';
import { useApp } from '@/state/AppState';
import { cores, fontes } from '@/theme/tokens';

const AREAS = ['Psicologia', 'Fonoaudiologia', 'Terapia ocupacional', 'Psicopedagogia', 'Outra'];
const CONSELHOS = ['CRP', 'CRFa', 'CREFITO', 'Outro'];

function Chips({ opcoes, valor, onChange }: { opcoes: string[]; valor: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.chips}>
      {opcoes.map((o) => {
        const on = o === valor;
        return (
          <Pressable key={o} onPress={() => onChange(o)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[styles.chip, on && styles.chipOn]}>
            <Text style={[styles.chipTxt, on && { color: cores.primariaEscura, fontFamily: fontes.textoForte }]}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Cadastro do profissional em 2 etapas: conta e dados profissionais. */
export default function CadastroProfissional() {
  const { entrar } = useApp();
  const [etapa, setEtapa] = useState(1);
  const [area, setArea] = useState('Psicologia');
  const [conselho, setConselho] = useState('CRP');
  const [aceite, setAceite] = useState(false);

  return (
    <Tela
      voltar
      fundo="#FFFFFF"
      sobretitulo="CONTA DO PROFISSIONAL"
      titulo={etapa === 1 ? 'Crie seu acesso' : 'Seus dados profissionais'}
      rodape={
        etapa === 1 ? (
          <Botao titulo="Continuar" onPress={() => setEtapa(2)} />
        ) : (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Botao variante="secundario" titulo="Voltar" onPress={() => setEtapa(1)} />
            <Botao
              titulo="Criar conta"
              desativado={!aceite}
              estilo={{ flex: 1 }}
              onPress={() => {
                entrar('profissional');
                router.replace('/prof/painel');
              }}
            />
          </View>
        )
      }>
      <View style={styles.passos} accessible accessibilityLabel={`Etapa ${etapa} de 2`}>
        {['1. Sua conta', '2. Dados profissionais'].map((t, i) => (
          <View key={t} style={{ flex: 1, gap: 6 }}>
            <View style={[styles.barra, i < etapa && { backgroundColor: cores.primaria }]} />
            <Text style={[styles.passoTxt, i < etapa && { color: cores.primaria }]}>{t}</Text>
          </View>
        ))}
      </View>

      {etapa === 1 ? (
        <>
          <Campo rotulo="Nome completo" autoComplete="name" />
          <Campo rotulo="E-mail" defaultValue="clinica@email.com" keyboardType="email-address" autoCapitalize="none" dica="Veio do convite. É por ele que você entra." />
          <Campo rotulo="Crie uma senha" placeholder="Mínimo de 8 caracteres" secureTextEntry />
          <Campo rotulo="Repita a senha" secureTextEntry />
        </>
      ) : (
        <>
          <Text style={styles.rotulo}>Área de atuação</Text>
          <Chips opcoes={AREAS} valor={area} onChange={setArea} />
          <Text style={styles.rotulo}>Conselho</Text>
          <Chips opcoes={CONSELHOS} valor={conselho} onChange={setConselho} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Campo rotulo="Número" placeholder="00/00000" keyboardType="number-pad" />
            <View style={{ width: 90 }}>
              <Campo rotulo="UF" placeholder="SP" autoCapitalize="characters" maxLength={2} />
            </View>
          </View>
          <Campo rotulo="Clínica ou consultório (opcional)" />
          <Pressable onPress={() => setAceite((a) => !a)} accessibilityRole="checkbox" accessibilityState={{ checked: aceite }} style={styles.aceite}>
            <View style={[styles.caixa, aceite && styles.caixaOn]}>{aceite ? <Text style={{ color: '#FFFFFF', fontFamily: fontes.textoForte }}>✓</Text> : null}</View>
            <Text style={styles.aceiteTxt}>
              Li os Termos e a Política de Privacidade e me comprometo a usar os dados de saúde da criança só para o acompanhamento clínico.
            </Text>
          </Pressable>
        </>
      )}
    </Tela>
  );
}

const styles = StyleSheet.create({
  passos: { flexDirection: 'row', gap: 8 },
  barra: { height: 6, borderRadius: 3, backgroundColor: cores.borda },
  passoTxt: { fontFamily: fontes.textoForte, fontSize: 12, color: cores.textoSuave },
  rotulo: { fontFamily: fontes.textoForte, fontSize: 14, color: cores.texto },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 2, borderColor: cores.borda, justifyContent: 'center' },
  chipOn: { borderColor: cores.primaria, backgroundColor: cores.primariaClara },
  chipTxt: { fontFamily: fontes.texto, fontSize: 14, color: cores.texto },
  aceite: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: cores.fundo, borderRadius: 14, padding: 14 },
  caixa: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#C9C9DE', alignItems: 'center', justifyContent: 'center' },
  caixaOn: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  aceiteTxt: { flex: 1, fontFamily: fontes.textoForte, fontSize: 13, color: '#3A3960', lineHeight: 18 },
});
