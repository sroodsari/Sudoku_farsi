import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { colors } from '@/constants/colors';
import { fa } from '@/lib/i18n';
import { loadGame, type SavedGame } from '@/lib/storage';
import type { Difficulty } from '@/lib/sudoku';

export default function Home() {
  const router = useRouter();
  const [saved, setSaved] = useState<SavedGame | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadGame().then(setSaved);
    }, [])
  );

  const start = (difficulty: Difficulty) => {
    router.push({ pathname: '/game', params: { difficulty, fresh: '1' } });
  };
  const resume = () => {
    if (!saved) return;
    router.push({ pathname: '/game', params: { difficulty: saved.difficulty, fresh: '0' } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text allowFontScaling={false} style={styles.title}>
            {fa.appTitle}
          </Text>
          <Text allowFontScaling={false} style={styles.subtitle}>
            {fa.chooseDifficulty}
          </Text>
        </View>

        <View style={styles.buttons}>
          {saved && (
            <AppButton label={fa.continue} onPress={resume} />
          )}
          <AppButton label={fa.easy} onPress={() => start('easy')} variant={saved ? 'secondary' : 'primary'} />
          <AppButton label={fa.medium} onPress={() => start('medium')} variant="secondary" />
          <AppButton label={fa.hard} onPress={() => start('hard')} variant="secondary" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 24,
    paddingBottom: 32,
    justifyContent: 'space-between',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 440,
  },
  header: { alignItems: 'center', marginTop: 32 },
  title: {
    fontFamily: 'Vazirmatn-Black',
    fontSize: 76,
    color: colors.primary,
    letterSpacing: -2,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'Vazirmatn-Regular',
    fontSize: 22,
    color: colors.textMuted,
    textAlign: 'center',
  },
  buttons: {
    gap: 16,
    paddingBottom: 24,
  },
});
