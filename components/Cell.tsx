import { memo, useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/constants/colors';
import { toFa } from '@/lib/i18n';

export type CellState = {
  value: number;
  given: boolean;
  selected: boolean;
  peer: boolean;
  match: boolean;
  conflict: boolean;
  correct: boolean;
};

type Props = CellState & {
  index: number;
  size: number;
  onPress: (index: number) => void;
};

function CellInner({ index, size, value, given, selected, peer, match, conflict, correct, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const flash = useRef(new Animated.Value(0)).current;
  const prevCorrect = useRef(correct);

  useEffect(() => {
    if (correct && !prevCorrect.current) {
      scale.setValue(1);
      flash.setValue(1);
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.18,
            duration: 120,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 180,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(flash, {
          toValue: 0,
          duration: 620,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevCorrect.current = correct;
  }, [correct, scale, flash]);

  const bg = conflict
    ? colors.cellConflict
    : selected
    ? colors.cellSelected
    : match
    ? colors.cellMatch
    : peer
    ? colors.cellPeer
    : colors.surface;

  const textColor = conflict
    ? colors.cellConflictText
    : selected
    ? '#FFFFFF'
    : given
    ? colors.given
    : colors.filled;

  return (
    <Pressable
      onPress={() => onPress(index)}
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          backgroundColor: bg,
        },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: colors.cellMatch, opacity: flash },
        ]}
      />
      {value > 0 && (
        <Animated.Text
          allowFontScaling={false}
          style={[
            styles.text,
            {
              fontSize: size * 0.55,
              color: textColor,
              fontWeight: given ? '700' : '600',
              transform: [{ scale }],
            },
          ]}
        >
          {toFa(value)}
        </Animated.Text>
      )}
    </Pressable>
  );
}

export const Cell = memo(CellInner);

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});
