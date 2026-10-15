import { Fredoka_600SemiBold } from '@expo-google-fonts/fredoka';
import { Nunito_600SemiBold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { PixelifySans_700Bold } from '@expo-google-fonts/pixelify-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AppStateProvider } from '@/state/AppState';

// Segura a tela de carregamento (splash) até as fontes e os dados salvos estarem prontos.
// Quem esconde é o AppStateProvider, quando termina de ler os dados. A splash some com um fade suave.
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: 300 });

/**
 * Mapa do app:
 * - index (abertura) → login / cadastro → boas-vindas → hábitos → crianca
 * - crianca: o modo criança, onde o app abre no dia a dia (só o PLAY)
 * - licao/*: a lição trancada (casa, tarefas e jogos)
 * - pin → (adulto)/*: área dos adultos com 5 abas
 * - prof/*: telas do profissional
 */
export default function RootLayout() {
  const [fontesProntas] = useFonts({
    Fredoka_600SemiBold,
    Nunito_600SemiBold,
    Nunito_800ExtraBold,
    PixelifySans_700Bold,
  });

  if (!fontesProntas) return null;

  return (
    <AppStateProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="crianca" options={{ gestureEnabled: false }} />
        <Stack.Screen name="pin" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="pin-novo" options={{ gestureEnabled: false }} />
        <Stack.Screen name="licao" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(adulto)" options={{ gestureEnabled: false }} />
      </Stack>
    </AppStateProvider>
  );
}
