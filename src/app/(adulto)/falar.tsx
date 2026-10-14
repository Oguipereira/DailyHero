import Ionicons from '@expo/vector-icons/Ionicons';
import * as Speech from 'expo-speech';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Tela } from '@/components/Tela';
import { cores, fontes } from '@/theme/tokens';

type Icone = ComponentProps<typeof Ionicons>['name'];
type Figura = { palavra: string; icone: Icone; fundo: string; tinta: string };
type Categoria = 'Quero' | 'Sinto' | 'Comer' | 'Pessoas' | 'Ajuda';

const AZUL = { fundo: '#E1F4FC', tinta: '#0B5878' };
const OURO = { fundo: '#FFF2D4', tinta: '#8A5000' };
const VERDE = { fundo: '#DFF7EF', tinta: '#0D6650' };
const ROXO = { fundo: '#F1EAFE', tinta: '#5B2DB8' };
const ROSA = { fundo: '#FCE6F1', tinta: '#9C1F63' };

/** Figuras do PECS por categoria. A primeira palavra de cada categoria inicia a frase. */
const FIGURAS: Record<Categoria, { inicio: string; itens: Figura[] }> = {
  Quero: {
    inicio: 'Eu quero',
    itens: [
      { palavra: 'água', icone: 'water-outline', ...AZUL },
      { palavra: 'comer', icone: 'restaurant-outline', ...OURO },
      { palavra: 'brincar', icone: 'football-outline', ...VERDE },
      { palavra: 'banheiro', icone: 'man-outline', ...AZUL },
      { palavra: 'colo', icone: 'heart-outline', ...ROXO },
      { palavra: 'dormir', icone: 'moon-outline', ...ROXO },
      { palavra: 'sair', icone: 'exit-outline', ...VERDE },
      { palavra: 'música', icone: 'musical-notes-outline', ...OURO },
      { palavra: 'parar', icone: 'hand-left-outline', ...ROSA },
    ],
  },
  Sinto: {
    inicio: 'Eu estou',
    itens: [
      { palavra: 'feliz', icone: 'happy-outline', ...OURO },
      { palavra: 'triste', icone: 'sad-outline', ...AZUL },
      { palavra: 'bravo', icone: 'flame-outline', ...ROSA },
      { palavra: 'cansado', icone: 'bed-outline', ...ROXO },
      { palavra: 'com medo', icone: 'alert-circle-outline', ...ROXO },
      { palavra: 'com dor', icone: 'bandage-outline', ...ROSA },
    ],
  },
  Comer: {
    inicio: 'Eu quero comer',
    itens: [
      { palavra: 'fruta', icone: 'nutrition-outline', ...VERDE },
      { palavra: 'pão', icone: 'fast-food-outline', ...OURO },
      { palavra: 'leite', icone: 'cafe-outline', ...AZUL },
      { palavra: 'biscoito', icone: 'ellipse-outline', ...OURO },
      { palavra: 'sorvete', icone: 'ice-cream-outline', ...ROSA },
      { palavra: 'suco', icone: 'beer-outline', ...VERDE },
    ],
  },
  Pessoas: {
    inicio: 'Eu quero a',
    itens: [
      { palavra: 'mamãe', icone: 'woman-outline', ...ROSA },
      { palavra: 'papai', icone: 'man-outline', ...AZUL },
      { palavra: 'vovó', icone: 'heart-circle-outline', ...ROXO },
      { palavra: 'professora', icone: 'school-outline', ...VERDE },
    ],
  },
  Ajuda: {
    inicio: 'Eu preciso de',
    itens: [
      { palavra: 'ajuda', icone: 'help-buoy-outline', ...ROSA },
      { palavra: 'silêncio', icone: 'volume-mute-outline', ...ROXO },
      { palavra: 'um abraço', icone: 'people-outline', ...OURO },
      { palavra: 'uma pausa', icone: 'pause-circle-outline', ...VERDE },
    ],
  },
};

/** Falar (PECS): a criança ou o adulto monta uma frase com figuras e o celular fala em voz alta. */
export default function Falar() {
  const [categoria, setCategoria] = useState<Categoria>('Quero');
  const [frase, setFrase] = useState<string[]>([]);
  const cat = FIGURAS[categoria];

  function tocar(f: Figura) {
    const nova = frase.length === 0 ? [cat.inicio, f.palavra] : [...frase, f.palavra];
    setFrase(nova);
    Speech.speak(f.palavra, { language: 'pt-BR' });
  }

  return (
    <Tela comAbas titulo="Falar" subtitulo="Figuras (PECS) com voz. Toque para montar a frase.">
      <View style={styles.frase}>
        <View style={styles.fraseTexto}>
          {frase.length === 0 ? (
            <Text style={styles.placeholder}>Toque nas figuras…</Text>
          ) : (
            frase.map((p, i) => (
              <View key={i} style={[styles.palavra, { backgroundColor: i === 0 ? '#FFF2D4' : '#E1F4FC' }]}>
                <Text style={styles.palavraTxt}>{p}</Text>
              </View>
            ))
          )}
        </View>
        <Pressable onPress={() => setFrase([])} accessibilityRole="button" accessibilityLabel="Apagar frase" style={styles.apagar}>
          <Ionicons name="close" size={20} color={cores.textoSuave} />
        </Pressable>
        <Pressable
          onPress={() => frase.length && Speech.speak(frase.join(' '), { language: 'pt-BR' })}
          accessibilityRole="button"
          accessibilityLabel="Falar a frase em voz alta"
          style={styles.falar}>
          <Ionicons name="volume-high" size={26} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView horizontal style={{ flexGrow: 0 }} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, alignItems: 'center' }}>
        {(Object.keys(FIGURAS) as Categoria[]).map((c) => {
          const on = c === categoria;
          return (
            <Pressable
              key={c}
              onPress={() => setCategoria(c)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={[styles.cat, on && styles.catOn]}>
              <Text style={[styles.catTxt, on && { color: '#FFFFFF', fontFamily: fontes.textoForte }]}>{c}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.grade}>
        {cat.itens.map((f) => (
          <View key={f.palavra} style={{ width: '33.33%', padding: 5 }}>
            <Pressable
              onPress={() => tocar(f)}
              accessibilityRole="button"
              accessibilityLabel={f.palavra}
              style={({ pressed }) => [styles.figura, pressed && { opacity: 0.7 }, f.palavra === 'parar' && { backgroundColor: '#FCE6F1' }]}>
              <View style={[styles.figIcone, { backgroundColor: f.palavra === 'parar' ? '#FFFFFF' : f.fundo }]}>
                <Ionicons name={f.icone} size={32} color={f.tinta} />
              </View>
              <Text style={styles.figTxt}>{f.palavra}</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </Tela>
  );
}

const styles = StyleSheet.create({
  frase: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: cores.superficie, borderWidth: 2, borderColor: cores.borda, borderRadius: 22, padding: 10 },
  fraseTexto: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6, minHeight: 56, alignItems: 'center' },
  placeholder: { fontFamily: fontes.texto, fontSize: 15, color: '#8A8AA8', paddingLeft: 4 },
  palavra: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  palavraTxt: { fontFamily: fontes.textoForte, fontSize: 16, color: cores.texto },
  apagar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: cores.borda, alignItems: 'center', justifyContent: 'center' },
  falar: { width: 58, height: 58, borderRadius: 29, backgroundColor: cores.primaria, alignItems: 'center', justifyContent: 'center' },
  cat: { minHeight: 44, paddingHorizontal: 18, borderRadius: 22, borderWidth: 1, borderColor: cores.borda, backgroundColor: cores.superficie, justifyContent: 'center' },
  catOn: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  catTxt: { fontFamily: fontes.texto, fontSize: 15, color: cores.texto },
  grade: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  figura: { minHeight: 108, backgroundColor: cores.superficie, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 6 },
  figIcone: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  figTxt: { fontFamily: fontes.textoForte, fontSize: 15, color: cores.texto, textAlign: 'center' },
});
