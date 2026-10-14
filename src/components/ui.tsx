import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { cores, espaco, fontes, raio, TOQUE_MINIMO } from '@/theme/tokens';

type IconeNome = ComponentProps<typeof Ionicons>['name'];

/** Botão principal (cheio) ou secundário (contorno) da área dos adultos. */
export function Botao({
  titulo,
  onPress,
  variante = 'primario',
  icone,
  desativado,
  estilo,
}: {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'perigo' | 'texto';
  icone?: IconeNome;
  desativado?: boolean;
  estilo?: StyleProp<ViewStyle>;
}) {
  const cor =
    variante === 'primario' ? '#FFFFFF' : variante === 'perigo' ? '#9C1F63' : variante === 'texto' ? cores.primaria : cores.texto;
  return (
    <Pressable
      onPress={onPress}
      disabled={desativado}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!desativado }}
      style={({ pressed }) => [
        styles.botao,
        variante === 'primario' && { backgroundColor: cores.primaria },
        variante === 'secundario' && { borderWidth: 2, borderColor: cores.borda, backgroundColor: cores.superficie },
        variante === 'perigo' && { borderWidth: 2, borderColor: '#F3C7DD', backgroundColor: cores.superficie },
        variante === 'texto' && { minHeight: TOQUE_MINIMO },
        desativado && { opacity: 0.45 },
        pressed && { opacity: 0.8 },
        estilo,
      ]}>
      {icone ? <Ionicons name={icone} size={20} color={cor} /> : null}
      <Text style={[styles.botaoTexto, { color: cor }]}>{titulo}</Text>
    </Pressable>
  );
}

/** Cartão branco com borda clara. */
export function Cartao({ children, estilo }: { children: ReactNode; estilo?: StyleProp<ViewStyle> }) {
  return <View style={[styles.cartao, estilo]}>{children}</View>;
}

export function Titulo2({ children }: { children: ReactNode }) {
  return (
    <Text accessibilityRole="header" style={styles.titulo2}>
      {children}
    </Text>
  );
}

export function Texto({ children, suave, forte, tamanho = 15, cor, centro }: {
  children: ReactNode;
  suave?: boolean;
  forte?: boolean;
  tamanho?: number;
  cor?: string;
  centro?: boolean;
}) {
  return (
    <Text
      style={{
        fontFamily: forte ? fontes.textoForte : fontes.texto,
        fontSize: tamanho,
        color: cor ?? (suave ? cores.textoSuave : cores.texto),
        textAlign: centro ? 'center' : undefined,
        lineHeight: tamanho * 1.35,
      }}>
      {children}
    </Text>
  );
}

/** Etiqueta pequena colorida (status, módulo...). */
export function Selo({ texto, fundo, tinta, icone }: { texto: string; fundo: string; tinta: string; icone?: IconeNome }) {
  return (
    <View style={[styles.selo, { backgroundColor: fundo }]}>
      {icone ? <Ionicons name={icone} size={12} color={tinta} /> : null}
      <Text style={[styles.seloTexto, { color: tinta }]}>{texto}</Text>
    </View>
  );
}

/** Aviso com ícone (dica, alerta, informação). */
export function Aviso({ texto, tipo = 'info' }: { texto: string; tipo?: 'info' | 'alerta' | 'sucesso' | 'reforco' }) {
  const t = {
    info: { fundo: '#F1EAFE', tinta: '#4A22A0', icone: 'information-circle-outline' as IconeNome },
    alerta: { fundo: '#FFF2D4', tinta: '#6B3E00', icone: 'alert-circle-outline' as IconeNome },
    sucesso: { fundo: '#DFF7EF', tinta: '#0D4F3E', icone: 'checkmark-circle-outline' as IconeNome },
    reforco: { fundo: '#FCE6F1', tinta: '#7A1A4E', icone: 'bulb-outline' as IconeNome },
  }[tipo];
  return (
    <View style={[styles.aviso, { backgroundColor: t.fundo }]}>
      <Ionicons name={t.icone} size={20} color={t.tinta} />
      <Text style={[styles.avisoTexto, { color: t.tinta }]}>{texto}</Text>
    </View>
  );
}

/** Botão redondo só com ícone (voltar, fechar...). */
export function BotaoIcone({ icone, rotulo, onPress, escuro }: { icone: IconeNome; rotulo: string; onPress: () => void; escuro?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      hitSlop={6}
      style={[
        styles.icone,
        escuro ? { backgroundColor: cores.licaoSuperficie } : { backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda },
      ]}>
      <Ionicons name={icone} size={22} color={escuro ? cores.licaoTextoSuave : cores.texto} />
    </Pressable>
  );
}

/** Opções lado a lado em que só uma fica marcada (ex.: Responsável / Profissional). */
export function Segmentado<T extends string>({ opcoes, valor, onChange }: {
  opcoes: { valor: T; rotulo: string }[];
  valor: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.seg}>
      {opcoes.map((o) => {
        const on = o.valor === valor;
        return (
          <Pressable
            key={o.valor}
            onPress={() => onChange(o.valor)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={[styles.segItem, on && styles.segItemOn]}>
            <Text style={[styles.segTexto, on && { color: cores.primaria, fontFamily: fontes.textoForte }]}>{o.rotulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Fileira de bolinhas da semana (ofensiva). */
export function SemanaOfensiva({ feitos, hojeIndice, escuro }: { feitos: number; hojeIndice: number; escuro?: boolean }) {
  const dias = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      {dias.map((d, i) => {
        const feito = i < feitos;
        const hoje = i === hojeIndice && !feito;
        return (
          <View key={i} style={{ alignItems: 'center', gap: 4 }} accessible accessibilityLabel={`${d}: ${feito ? 'feito' : hoje ? 'hoje' : 'ainda não'}`}>
            <Text style={{ fontFamily: fontes.textoForte, fontSize: 12, color: hoje ? (escuro ? cores.ouroClaro : cores.primaria) : escuro ? cores.licaoTextoSuave : cores.textoSuave }}>
              {d}
            </Text>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: escuro ? 4 : 14,
                backgroundColor: feito ? cores.ouro : hoje ? 'transparent' : escuro ? '#3B3570' : '#ECECF7',
                borderWidth: hoje ? 3 : 0,
                borderColor: escuro ? cores.ouroClaro : cores.primaria,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {feito ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  botao: {
    minHeight: 54,
    borderRadius: raio.pilula,
    paddingHorizontal: espaco.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.s,
  },
  botaoTexto: { fontFamily: fontes.textoForte, fontSize: 16 },
  cartao: {
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.medio,
    padding: espaco.l,
    gap: espaco.m,
  },
  titulo2: { fontFamily: fontes.textoForte, fontSize: 16, color: cores.texto },
  selo: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start' },
  seloTexto: { fontFamily: fontes.textoForte, fontSize: 12 },
  aviso: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 12, borderRadius: 14 },
  avisoTexto: { flex: 1, fontFamily: fontes.textoForte, fontSize: 14, lineHeight: 19 },
  icone: { width: TOQUE_MINIMO + 4, height: TOQUE_MINIMO + 4, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  seg: { flexDirection: 'row', backgroundColor: '#ECECF7', borderRadius: 16, padding: 4, gap: 4 },
  segItem: { flex: 1, minHeight: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  segItemOn: { backgroundColor: cores.superficie },
  segTexto: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoSuave },
});
