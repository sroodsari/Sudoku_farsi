import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import 'react-native-reanimated';
import { colors } from '@/constants/colors';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Vazirmatn-Regular': require('../assets/fonts/Vazirmatn-Regular.ttf'),
    'Vazirmatn-Bold': require('../assets/fonts/Vazirmatn-Bold.ttf'),
    'Vazirmatn-Black': require('../assets/fonts/Vazirmatn-Black.ttf'),
    'Lalezar': require('../assets/fonts/Lalezar-Regular.ttf'),
  });

  const [webFontsPainted, setWebFontsPainted] = useState(Platform.OS !== 'web');

  useEffect(() => {
    if (Platform.OS !== 'web' || !loaded) return;
    const fonts = (typeof document !== 'undefined' ? document.fonts : null) as
      | FontFaceSet
      | null;
    if (!fonts?.ready) {
      setWebFontsPainted(true);
      return;
    }
    fonts.ready.then(() => setWebFontsPainted(true)).catch(() => setWebFontsPainted(true));
  }, [loaded]);

  const ready = (loaded || !!error) && webFontsPainted;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <>
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="game" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
