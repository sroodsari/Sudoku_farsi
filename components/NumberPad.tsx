import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { toFa } from '@/lib/i18n';

type Props = {
  onPressNumber: (n: number) => void;
  onPressErase: () => void;
  disabled?: boolean;
  digitCounts: number[]; // length 10, index 1..9
};

export function NumberPad({ onPressNumber, onPressErase, disabled, digitCounts }: Props) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
        const exhausted = digitCounts[n] >= 9;
        const isDisabled = disabled || exhausted;
        return (
          <Pressable
            key={n}
            disabled={isDisabled}
            onPress={() => {
              Haptics.selectionAsync();
              onPressNumber(n);
            }}
            style={({ pressed }) => [styles.key, pressed && !isDisabled && styles.pressed, isDisabled && styles.keyDisabled]}
          >
            <Text allowFontScaling={false} style={[styles.keyText, isDisabled && styles.keyTextDisabled]}>
              {toFa(n)}
            </Text>
          </Pressable>
        );
      })}
      <Pressable
        disabled={disabled}
        onPress={() => {
          Haptics.selectionAsync();
          onPressErase();
        }}
        style={({ pressed }) => [styles.key, styles.eraseKey, pressed && !disabled && styles.pressed, disabled && styles.keyDisabled]}
      >
        <Text allowFontScaling={false} style={[styles.eraseText, disabled && styles.keyTextDisabled]}>
          ✕
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 4,
  },
  key: {
    flexBasis: '18%',
    minHeight: 64,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eraseKey: {
    borderColor: colors.danger,
  },
  pressed: { opacity: 0.6 },
  keyDisabled: {
    backgroundColor: '#EEE',
    borderColor: '#CCC',
  },
  keyText: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.primary,
  },
  keyTextDisabled: {
    color: '#AAA',
  },
  eraseText: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.danger,
  },
});
