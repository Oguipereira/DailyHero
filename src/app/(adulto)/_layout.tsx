import Ionicons from '@expo/vector-icons/Ionicons';
import Tabs from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';

import { cores, fontes } from '@/theme/tokens';

type Icone = ComponentProps<typeof Ionicons>['name'];

const ABAS: { nome: string; titulo: string; icone: Icone }[] = [
  { nome: 'inicio', titulo: 'Início', icone: 'home-outline' },
  { nome: 'jogos', titulo: 'Jogos', icone: 'game-controller-outline' },
  { nome: 'relatorios', titulo: 'Relatórios', icone: 'bar-chart-outline' },
  { nome: 'falar', titulo: 'Falar', icone: 'chatbubble-outline' },
  { nome: 'perfil', titulo: 'Perfil', icone: 'person-circle-outline' },
];

/** Área dos adultos: só se chega aqui depois do PIN. Navegação com as 5 abas do documento. */
export default function AreaAdulto() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSuave,
        tabBarStyle: { backgroundColor: cores.superficie, borderTopColor: cores.borda },
        tabBarLabelStyle: { fontFamily: fontes.textoForte, fontSize: 12 },
      }}>
      {ABAS.map((aba) => (
        <Tabs.Screen
          key={aba.nome}
          name={aba.nome}
          options={{
            title: aba.titulo,
            tabBarIcon: ({ color, size }) => <Ionicons name={aba.icone} color={color} size={size} />,
          }}
        />
      ))}
    </Tabs>
  );
}
