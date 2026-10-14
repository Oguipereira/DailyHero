import { StyleSheet, Text, View } from 'react-native';

import { EmConstrucao } from '@/components/EmConstrucao';
import { Tela } from '@/components/Tela';
import { espaco, fontes, modulos, raio } from '@/theme/tokens';

/** Os 3 jogos da primeira versão, um por módulo (decidido em 14/10). */
const JOGOS_MVP = [
  { nome: 'Emoções', modulo: 'socio' as const },
  { nome: 'Memória', modulo: 'cog' as const },
  { nome: 'Montar figuras', modulo: 'motor' as const },
];

export default function Jogos() {
  return (
    <Tela titulo="Jogos" subtitulo="Atribuídos pelo profissional · abrem na atividade diária">
      {JOGOS_MVP.map((j) => {
        const m = modulos[j.modulo];
        return (
          <View key={j.nome} style={[styles.cartao, { backgroundColor: m.fundo }]}>
            <Text style={[styles.nome, { color: m.tinta }]}>{j.nome}</Text>
            <Text style={[styles.modulo, { color: m.tinta }]}>{m.nome}</Text>
          </View>
        );
      })}
      <EmConstrucao fase="FASE 1" descricao="Busca e filtro por módulo, como no canvas." />
    </Tela>
  );
}

const styles = StyleSheet.create({
  cartao: { borderRadius: raio.medio, padding: espaco.l, gap: 2 },
  nome: { fontFamily: fontes.textoForte, fontSize: 17 },
  modulo: { fontFamily: fontes.texto, fontSize: 13 },
});
