import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/constants/colors';

export type CellState = {
  value: number;
  given: boolean;
  selected: boolean;
  peer: boolean;
  match: boolean;
  conflict: boolean;
};

type Props = CellState & {
  index: number;
  size: number;
  onPress: (index: number) => void;
};

function CellInner({ index, size, value, given, selected, peer, match, conflict, onPress }: Props) {
  const col = index % 9;
  const row = (index / 9) | 0;

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
          borderRightWidth: col === 8 ? 0 : col % 3 === 2 ? 4 : 1,
          borderBottomWidth: row === 8 ? 0 : row % 3 === 2 ? 4 : 1,
        },
      ]}
    >
      {value > 0 && (
        <Text
          allowFontScaling={false}
          style={[
            styles.text,
            { fontSize: size * 0.55, color: textColor, fontWeight: given ? '700' : '600' },
          ]}
        >
          {value}
        </Text>
      )}
    </Pressable>
  );
}

export const Cell = memo(CellInner);

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.cellBoxBorder,
  },
  text: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});
