import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Tela } from '@/components/Tela';
import { Botao, Texto } from '@/components/ui';
import { HABITOS, type HabitoId } from '@/data/catalogo';
import { useApp } from '@/state/AppState';
import { cores, fontes } from '@/theme/tokens';

/** Os pais escolhem os hábitos da casa tocando na ordem do dia. */
export default function Habitos() {
  const app = useApp();
  const [ordem, setOrdem] = useState<HabitoId[]>(app.habitos);
  const veioDoPerfil = useLocalSearchParams<{ de?: string }>().de === 'perfil';

  function alternar(id: HabitoId) {
    setOrdem((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  }

  return (
    <Tela
      voltar={veioDoPerfil}
      sobretitulo="ETAPA DOS PAIS"
      titulo="Quais hábitos vocês fazem em casa?"
      subtitulo="Toque na ordem do dia. Eles viram as tasks obrigatórias da lição."
      rodape={
        <>
          <Texto suave tamanho={14}>{`${ordem.length} hábitos na rotina`}</Texto>
          <Botao
            titulo="Salvar rotina"
            desativado={ordem.length === 0}
            onPress={() => {
              app.definirHabitos(ordem);
              if (veioDoPerfil) return router.back();
              // Fim do primeiro acesso: limpa a pilha (login/cadastro) para o "voltar" não levar até lá.
              if (router.canDismiss()) router.dismissAll();
              router.replace('/crianca');
            }}
          />
        </>
      }>
      {HABITOS.map((h) => {
        const pos = ordem.indexOf(h.id) + 1;
        const on = pos > 0;
        return (
          <Pressable
            key={h.id}
            onPress={() => alternar(h.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
            accessibilityLabel={on ? `${h.nome}, posição ${pos}` : h.nome}
            style={[styles.item, on && styles.itemOn]}>
            <View style={[styles.num, on && styles.numOn]}>{on ? <Text style={styles.numTxt}>{pos}</Text> : null}</View>
            <Text style={styles.nome}>{h.nome}</Text>
            <Text style={styles.comodo}>{h.comodo}</Text>
          </Pressable>
        );
      })}
    </Tela>
  );
}

const styles = StyleSheet.create({
  item: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemOn: { borderColor: cores.primaria },
  num: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#C9C9DE', alignItems: 'center', justifyContent: 'center' },
  numOn: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  numTxt: { fontFamily: fontes.textoForte, fontSize: 14, color: '#FFFFFF' },
  nome: { flex: 1, fontFamily: fontes.textoForte, fontSize: 16, color: cores.texto },
  comodo: { fontFamily: fontes.textoForte, fontSize: 12, color: cores.textoSuave },
});
