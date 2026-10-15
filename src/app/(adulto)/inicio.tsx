import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { BotaoPlay } from '@/components/BotaoPlay';
import { EmConstrucao } from '@/components/EmConstrucao';
import { Tela } from '@/components/Tela';
import { cores, fontes } from '@/theme/tokens';

export default function Inicio() {
  return (
    <Tela titulo="Oi, [Nome]!" subtitulo="Área dos adultos">
      <EmConstrucao fase="FASE 1" descricao="Ofensiva da semana, cartão da atividade diária e Sobre nós (Quem somos, Parceiros, Tutorial)." />
      <BotaoPlay onPress={() => router.push('/licao')} />
      <Text style={styles.nota}>O adulto também pode iniciar a lição por aqui.</Text>
    </Tela>
  );
}

const styles = StyleSheet.create({
  nota: { fontFamily: fontes.texto, fontSize: 13, color: cores.textoSuave, textAlign: 'center' },
});
