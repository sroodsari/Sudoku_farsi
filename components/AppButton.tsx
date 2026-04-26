import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export function AppButton({ label, onPress, variant = 'primary', disabled = false }: Props) {
  const handlePress = () => {
    if (disabled) return;
    Haptics.selectionAsync();
    onPress();
  };
  return (
    <Pressable onPress={handlePress} disabled={disabled} style={({ pressed }) => [styles.touch, pressed && !disabled && styles.pressed]}>
      <View style={[styles.btn, variant === 'secondary' && styles.btnSecondary, disabled && styles.btnDisabled]}>
        <Text
          style={[styles.label, variant === 'secondary' && styles.labelSecondary]}
          allowFontScaling={false}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  touch: { width: '100%' },
  pressed: { opacity: 0.7 },
  btn: {
    minHeight: 64,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  btnSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  btnDisabled: { opacity: 0.4 },
  label: {
    fontFamily: 'Vazirmatn-Bold',
    fontSize: 26,
    color: colors.primaryText,
    textAlign: 'center',
  },
  labelSecondary: { color: colors.primary },
});
