import Ionicons from '@expo/vector-icons/Ionicons';
import Tabs from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';

import { cores, fontes } from '@/theme/tokens';

type Icone = ComponentProps<typeof Ionicons>['name'];

const ABAS: { nome: string; titulo: string; icone: Icone; iconeOn: Icone }[] = [
  { nome: 'inicio', titulo: 'Início', icone: 'home-outline', iconeOn: 'home' },
  { nome: 'jogos', titulo: 'Jogos', icone: 'game-controller-outline', iconeOn: 'game-controller' },
  { nome: 'relatorios', titulo: 'Relatórios', icone: 'bar-chart-outline', iconeOn: 'bar-chart' },
  { nome: 'falar', titulo: 'Falar', icone: 'chatbubble-outline', iconeOn: 'chatbubble' },
  { nome: 'perfil', titulo: 'Perfil', icone: 'person-circle-outline', iconeOn: 'person-circle' },
];

/** Área dos adultos: só se chega aqui depois do PIN. As 5 abas do documento. */
export default function AreaAdulto() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSuave,
        tabBarStyle: { backgroundColor: cores.superficie, borderTopColor: cores.borda, height: 88, paddingTop: 8 },
        tabBarLabelStyle: { fontFamily: fontes.textoForte, fontSize: 12 },
      }}>
      {ABAS.map((aba) => (
        <Tabs.Screen
          key={aba.nome}
          name={aba.nome}
          options={{
            title: aba.titulo,
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? aba.iconeOn : aba.icone} color={color} size={24} />,
          }}
        />
      ))}
    </Tabs>
  );
}
