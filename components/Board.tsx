import { colors } from '@/constants/colors';
import { StyleSheet, View } from 'react-native';
import { Cell, type CellState } from './Cell';

type Props = {
  cells: CellState[];
  size: number;
  onCellPress: (index: number) => void;
};

export function Board({ cells, size, onCellPress }: Props) {
  const innerSize = size - 8;
  const cellSize = innerSize / 9;
  const lines = [1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <View style={[styles.board, { width: size, height: size }]}>
      {cells.map((c, i) => (
        <Cell key={i} {...c} index={i} size={cellSize} onPress={onCellPress} />
      ))}
      {lines.map((i) => {
        const w = i % 3 === 0 ? 4 : 1;
        return (
          <View
            key={`v${i}`}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: cellSize * i - w / 2,
              top: 0,
              width: w,
              height: innerSize,
              backgroundColor: colors.cellBoxBorder,
            }}
          />
        );
      })}
      {lines.map((i) => {
        const h = i % 3 === 0 ? 4 : 1;
        return (
          <View
            key={`h${i}`}
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: cellSize * i - h / 2,
              left: 0,
              width: innerSize,
              height: h,
              backgroundColor: colors.cellBoxBorder,
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surface,
    borderWidth: 4,
    borderColor: colors.cellBoxBorder,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
