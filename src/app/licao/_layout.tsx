import { Stack } from 'expo-router';

/** A lição é uma pilha de telas sem gesto de voltar: só se sai pelo X segurando 3 segundos. */
export default function LicaoLayout() {
  return <Stack screenOptions={{ headerShown: false, gestureEnabled: false, animation: 'fade' }} />;
}
