import { Fredoka_600SemiBold } from '@expo-google-fonts/fredoka';
import { Nunito_600SemiBold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { PixelifySans_700Bold } from '@expo-google-fonts/pixelify-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

// Segura a tela de abertura até as fontes carregarem, pra nada aparecer com a fonte errada.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontesProntas] = useFonts({
    Fredoka_600SemiBold,
    Nunito_600SemiBold,
    Nunito_800ExtraBold,
    PixelifySans_700Bold,
  });

  useEffect(() => {
    if (fontesProntas) SplashScreen.hideAsync();
  }, [fontesProntas]);

  if (!fontesProntas) return null;

  return (
    <>
      <StatusBar style="auto" />
      {/* O app abre no modo criança (index). A área dos adultos fica atrás do PIN. */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="pin" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(adulto)" />
        <Stack.Screen name="licao" options={{ gestureEnabled: false }} />
      </Stack>
    </>
  );
}
