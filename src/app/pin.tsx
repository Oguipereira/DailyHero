import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TecladoPin } from '@/components/TecladoPin';
import { useApp } from '@/state/AppState';
import { cores, espaco, fontes } from '@/theme/tokens';

const TENTATIVAS = 3;
const ESPERA_SEG = 30;

/**
 * PIN da área dos adultos. Confere com o PIN criado no cadastro.
 * 3 erros seguidos travam o teclado por 30 s, para a criança não ficar chutando.
 * Se ainda não existe PIN (entrou pelo login, sem cadastro), manda criar.
 */
export default function Pin() {
  const app = useApp();
  const [erros, setErros] = useState(0);
  const [travadoSeg, setTravadoSeg] = useState(0);

  useEffect(() => {
    if (!app.temPin) router.replace({ pathname: '/pin-novo', params: { origem: 'primeiro' } });
  }, [app.temPin]);

  useEffect(() => {
    if (travadoSeg <= 0) return;
    const t = setTimeout(() => setTravadoSeg((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [travadoSeg]);

  async function conferir(pin: string) {
    if (await app.conferirPin(pin)) {
      router.dismiss();
      router.push('/inicio');
      return;
    }
    const n = erros + 1;
    if (n >= TENTATIVAS) {
      setErros(0);
      setTravadoSeg(ESPERA_SEG);
      return 'PIN errado.';
    }
    setErros(n);
    return `PIN errado. Mais ${TENTATIVAS - n} ${TENTATIVAS - n === 1 ? 'tentativa' : 'tentativas'}.`;
  }

  return (
    <SafeAreaView style={styles.raiz}>
      <Pressable onPress={() => router.back()} accessibilityRole="button" style={styles.voltar}>
        <Ionicons name="chevron-down" size={20} color={cores.texto} />
        <Text style={styles.voltarTexto}>Voltar para o jogo</Text>
      </Pressable>
      <TecladoPin
        titulo="Área dos adultos"
        subtitulo="Digite o PIN de 4 números"
        aoCompletar={conferir}
        travadoSeg={travadoSeg}
        rodape={
          <Pressable
            onPress={() => router.push({ pathname: '/pin-novo', params: { origem: 'esqueci' } })}
            accessibilityRole="button"
            style={styles.esqueci}>
            <Text style={styles.esqueciTxt}>Esqueci o PIN</Text>
          </Pressable>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: cores.fundo, padding: espaco.xxl },
  voltar: { flexDirection: 'row', alignItems: 'center', gap: espaco.xs, minHeight: 44, alignSelf: 'flex-start' },
  voltarTexto: { fontFamily: fontes.textoForte, fontSize: 14, color: cores.texto },
  esqueci: { minHeight: 44, alignSelf: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  esqueciTxt: { fontFamily: fontes.textoForte, fontSize: 14, color: cores.primaria },
});
