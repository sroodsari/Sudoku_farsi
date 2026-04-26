import { I18nManager, StyleSheet, View } from 'react-native';
import { colors } from '@/constants/colors';
import { Cell, type CellState } from './Cell';

type Props = {
  cells: CellState[];
  size: number;
  onCellPress: (index: number) => void;
};

export function Board({ cells, size, onCellPress }: Props) {
  const cellSize = (size - 4) / 9;
  return (
    <View style={[styles.board, { width: size, height: size }]}>
      {cells.map((c, i) => (
        <Cell key={i} {...c} index={i} size={cellSize} onPress={onCellPress} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.cellBoxBorder,
    borderRadius: 4,
    overflow: 'hidden',
  },
});
