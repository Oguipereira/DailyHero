import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Share, StyleSheet, Text, View } from 'react-native';

import { Tela } from '@/components/Tela';
import { Botao, Cartao, Texto, Titulo2 } from '@/components/ui';
import { useApp } from '@/state/AppState';
import { cores, fontes } from '@/theme/tokens';

/** Caminho 2: o profissional gera um código para a família aprovar. */
export default function Vinculo() {
  const app = useApp();
  const [copiado, setCopiado] = useState(false);
  const [CODIGO, setCodigo] = useState(app.codigoGerado || '…');

  useEffect(() => {
    void app.gerarCodigo().then(setCodigo);
  }, []);

  return (
    <Tela voltar titulo="Adicionar paciente" subtitulo="Quando a família ainda não te convidou">
      <View style={styles.codigo}>
        <Text style={styles.codigoSobre}>SEU CÓDIGO DE VÍNCULO</Text>
        <Text style={styles.codigoTxt} accessibilityLabel={`Código ${CODIGO.split('').join(' ')}`}>
          {CODIGO}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'stretch' }}>
          <Botao
            variante="secundario"
            icone={copiado ? 'checkmark' : 'copy-outline'}
            titulo={copiado ? 'Copiado!' : 'Copiar'}
            onPress={async () => {
              await Clipboard.setStringAsync(CODIGO);
              setCopiado(true);
            }}
            estilo={{ flex: 1 }}
          />
          <Botao
            variante="secundario"
            icone="share-outline"
            titulo="Enviar"
            onPress={() => Share.share({ message: `Meu código de vínculo no Daily Hero: ${CODIGO}` })}
            estilo={{ flex: 1 }}
          />
        </View>
        <Text style={styles.validade}>Vale por 48 horas</Text>
      </View>

      <Cartao>
        <Titulo2>Como funciona</Titulo2>
        {['Mande o código para o responsável.', 'Ele digita no app, em Perfil › + Profissional › Tenho um código.', 'Quando ele aprovar, a criança aparece na sua lista.'].map((t, i) => (
          <View key={t} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={styles.num}>
              <Text style={styles.numTxt}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Texto>{t}</Texto>
            </View>
          </View>
        ))}
      </Cartao>

      <View style={styles.espera}>
        <Ionicons name="shield-checkmark-outline" size={22} color="#8A5000" />
        <View style={{ flex: 1 }}>
          <Text style={styles.esperaTitulo}>Nada é compartilhado sem a família</Text>
          <Texto suave tamanho={13}>A criança só aparece no seu painel depois que o responsável aprovar.</Texto>
        </View>
      </View>
    </Tela>
  );
}

const styles = StyleSheet.create({
  codigo: { backgroundColor: cores.primaria, borderRadius: 24, padding: 20, alignItems: 'center', gap: 14 },
  codigoSobre: { fontFamily: fontes.textoForte, fontSize: 12, color: '#D9DAFF', letterSpacing: 0.5 },
  codigoTxt: { fontFamily: fontes.titulo, fontSize: 42, color: '#FFFFFF', letterSpacing: 5 },
  validade: { fontFamily: fontes.texto, fontSize: 13, color: '#D9DAFF' },
  num: { width: 28, height: 28, borderRadius: 14, backgroundColor: cores.primariaClara, alignItems: 'center', justifyContent: 'center' },
  numTxt: { fontFamily: fontes.textoForte, fontSize: 14, color: cores.primaria },
  espera: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: '#C9C9DE', borderRadius: 16, padding: 14 },
  esperaTitulo: { fontFamily: fontes.textoForte, fontSize: 15, color: cores.texto },
});
