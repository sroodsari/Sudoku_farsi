import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { Board } from '@/components/Board';
import type { CellState } from '@/components/Cell';
import { NumberPad } from '@/components/NumberPad';
import { colors } from '@/constants/colors';
import { fa } from '@/lib/i18n';
import { randomPuzzle, type Puzzle } from '@/lib/puzzles';
import { clearGame, loadGame, saveGame, type SavedGame } from '@/lib/storage';
import {
  N,
  PEERS,
  isComplete,
  parseBoard,
  type Difficulty,
} from '@/lib/sudoku';

type State = {
  difficulty: Difficulty;
  puzzleId: string;
  given: boolean[];
  values: number[];
  solution: number[];
  selected: number | null;
  history: { idx: number; prev: number }[];
  ready: boolean;
};

type Action =
  | { type: 'INIT'; puzzle: Puzzle; difficulty: Difficulty }
  | { type: 'LOAD'; saved: SavedGame }
  | { type: 'SELECT'; idx: number }
  | { type: 'PLACE'; value: number }
  | { type: 'ERASE' }
  | { type: 'UNDO' }
  | { type: 'HINT' };

const empty: State = {
  difficulty: 'easy',
  puzzleId: '',
  given: new Array(N).fill(false),
  values: new Array(N).fill(0),
  solution: new Array(N).fill(0),
  selected: null,
  history: [],
  ready: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INIT': {
      const g = parseBoard(action.puzzle.given);
      const s = parseBoard(action.puzzle.solution);
      const given: boolean[] = [];
      const values: number[] = [];
      const solution: number[] = [];
      for (let i = 0; i < N; i++) {
        given.push(g[i] !== 0);
        values.push(g[i]);
        solution.push(s[i]);
      }
      return {
        difficulty: action.difficulty,
        puzzleId: action.puzzle.id,
        given,
        values,
        solution,
        selected: null,
        history: [],
        ready: true,
      };
    }
    case 'LOAD': {
      const g = parseBoard(action.saved.given);
      const v = parseBoard(action.saved.values);
      const s = parseBoard(action.saved.solution);
      const given: boolean[] = [];
      const values: number[] = [];
      const solution: number[] = [];
      for (let i = 0; i < N; i++) {
        given.push(g[i] !== 0);
        values.push(v[i]);
        solution.push(s[i]);
      }
      return {
        difficulty: action.saved.difficulty,
        puzzleId: action.saved.puzzleId,
        given,
        values,
        solution,
        selected: null,
        history: action.saved.history ?? [],
        ready: true,
      };
    }
    case 'SELECT':
      return { ...state, selected: action.idx };
    case 'PLACE': {
      if (state.selected == null) return state;
      const idx = state.selected;
      if (state.given[idx]) return state;
      const prev = state.values[idx];
      if (prev === state.solution[idx]) return state;
      const next = prev === action.value ? 0 : action.value;
      if (next === prev) return state;
      const values = state.values.slice();
      values[idx] = next;
      return {
        ...state,
        values,
        history: [...state.history, { idx, prev }],
      };
    }
    case 'ERASE': {
      if (state.selected == null) return state;
      const idx = state.selected;
      if (state.given[idx]) return state;
      const prev = state.values[idx];
      if (prev === 0) return state;
      if (prev === state.solution[idx]) return state;
      const values = state.values.slice();
      values[idx] = 0;
      return { ...state, values, history: [...state.history, { idx, prev }] };
    }
    case 'UNDO': {
      if (state.history.length === 0) return state;
      const last = state.history[state.history.length - 1];
      const values = state.values.slice();
      values[last.idx] = last.prev;
      return {
        ...state,
        values,
        history: state.history.slice(0, -1),
        selected: last.idx,
      };
    }
    case 'HINT': {
      let target = state.selected;
      if (target == null || state.given[target] || state.values[target] === state.solution[target]) {
        const empties: number[] = [];
        for (let i = 0; i < N; i++) {
          if (!state.given[i] && state.values[i] !== state.solution[i]) empties.push(i);
        }
        if (empties.length === 0) return state;
        target = empties[Math.floor(Math.random() * empties.length)];
      }
      const prev = state.values[target];
      const values = state.values.slice();
      values[target] = state.solution[target];
      return {
        ...state,
        values,
        selected: target,
        history: [...state.history, { idx: target, prev }],
      };
    }
  }
}

export default function GameScreen() {
  const router = useRouter();
  const { difficulty, fresh } = useLocalSearchParams<{ difficulty: Difficulty; fresh: string }>();
  const [state, dispatch] = useReducer(reducer, empty);
  const { width, height } = useWindowDimensions();
  const initialized = useRef(false);
  const won = useRef(false);

  // Initial load
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    (async () => {
      if (fresh === '0') {
        const saved = await loadGame();
        if (saved) {
          dispatch({ type: 'LOAD', saved });
          return;
        }
      }
      const p = randomPuzzle(difficulty ?? 'easy');
      dispatch({ type: 'INIT', puzzle: p, difficulty: difficulty ?? 'easy' });
    })();
  }, [difficulty, fresh]);

  // Auto-save on every change
  useEffect(() => {
    if (!state.ready) return;
    if (won.current) return;
    const givenStr = state.given
      .map((g, i) => (g ? state.values[i] : 0))
      .join('');
    const valuesStr = state.values.join('');
    const solutionStr = state.solution.join('');
    saveGame({
      difficulty: state.difficulty,
      puzzleId: state.puzzleId,
      given: givenStr,
      values: valuesStr,
      solution: solutionStr,
      history: state.history,
    });
  }, [state]);

  const conflicts = useMemo(() => {
    const out = new Array(N).fill(false);
    for (let i = 0; i < N; i++) {
      const v = state.values[i];
      if (!v || state.given[i]) continue;
      if (v !== state.solution[i]) out[i] = true;
    }
    return out;
  }, [state.values, state.given, state.solution]);

  const completed = useMemo(() => {
    if (!state.ready) return false;
    const arr = new Uint8Array(N);
    for (let i = 0; i < N; i++) arr[i] = state.values[i];
    return isComplete(arr);
  }, [state.values, state.ready]);

  // Trigger win once
  useEffect(() => {
    if (completed && !won.current) {
      won.current = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      clearGame();
    }
  }, [completed]);

  const digitCounts = useMemo(() => {
    const counts = new Array(10).fill(0);
    for (let i = 0; i < N; i++) counts[state.values[i]]++;
    return counts;
  }, [state.values]);

  const cells: CellState[] = useMemo(() => {
    const sel = state.selected;
    const selValue = sel != null ? state.values[sel] : 0;
    const peerSet = sel != null ? new Set(PEERS[sel]) : null;
    return state.values.map((v, i) => {
      const peer = peerSet ? peerSet.has(i) : false;
      const match = selValue > 0 && v === selValue && i !== sel;
      const locked = state.given[i] || (v !== 0 && v === state.solution[i]);
      return {
        value: v,
        given: locked,
        selected: i === sel,
        peer,
        match,
        conflict: !!conflicts[i],
      };
    });
  }, [state.values, state.given, state.selected, conflicts]);

  const onCellPress = useCallback((idx: number) => {
    Haptics.selectionAsync();
    dispatch({ type: 'SELECT', idx });
  }, []);

  const onPressNumber = useCallback((n: number) => {
    dispatch({ type: 'PLACE', value: n });
  }, []);

  const onPressErase = useCallback(() => {
    dispatch({ type: 'ERASE' });
  }, []);

  const onNewGame = useCallback(() => {
    const fresh = () => {
      won.current = false;
      const p = randomPuzzle(state.difficulty, state.puzzleId);
      dispatch({ type: 'INIT', puzzle: p, difficulty: state.difficulty });
    };
    const dirty = state.history.length > 0;
    if (!dirty) return fresh();
    Alert.alert(fa.newGameConfirm, '', [
      { text: fa.no, style: 'cancel' },
      { text: fa.yes, onPress: fresh },
    ]);
  }, [state.difficulty, state.puzzleId, state.history.length]);

  const onBack = useCallback(() => {
    router.replace('/');
  }, [router]);

  const onHint = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    dispatch({ type: 'HINT' });
  }, []);

  const [helpOpen, setHelpOpen] = useState(false);
  const onOpenHelp = useCallback(() => {
    Haptics.selectionAsync();
    setHelpOpen(true);
  }, []);
  const onCloseHelp = useCallback(() => setHelpOpen(false), []);

  const boardSize = Math.min(width - 24, height * 0.5, 480);

  if (!state.ready) {
    return <SafeAreaView style={styles.safe} />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            onBack();
          }}
          style={styles.iconBtn}
        >
          <Text allowFontScaling={false} style={styles.iconText}>‹</Text>
        </Pressable>
        <Text allowFontScaling={false} style={styles.diffLabel}>
          {fa[state.difficulty]}
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.boardWrap}>
        <Board cells={cells} size={boardSize} onCellPress={onCellPress} />
      </View>

      <View style={styles.padWrap}>
        <NumberPad
          onPressNumber={onPressNumber}
          onPressErase={onPressErase}
          digitCounts={digitCounts}
        />
      </View>

      <View style={styles.bottomBar}>
        <View style={styles.bottomRow}>
          <View style={styles.bottomBtn}>
            <AppButton label={fa.help} onPress={onOpenHelp} variant="secondary" size="sm" />
          </View>
          <View style={styles.bottomBtn}>
            <AppButton label={fa.hint} onPress={onHint} variant="secondary" size="sm" />
          </View>
        </View>
      </View>

      <Modal visible={helpOpen} transparent animationType="fade" onRequestClose={onCloseHelp}>
        <View style={styles.winBackdrop}>
          <View style={styles.helpCard}>
            <Text allowFontScaling={false} style={styles.helpTitle}>
              {fa.rulesTitle}
            </Text>
            <ScrollView style={styles.helpScroll} contentContainerStyle={styles.helpScrollContent}>
              <Text allowFontScaling={false} style={styles.helpBody}>
                {fa.rulesBody}
              </Text>
            </ScrollView>
            <View style={{ height: 16 }} />
            <AppButton label={fa.close} onPress={onCloseHelp} />
          </View>
        </View>
      </Modal>

      <Modal visible={completed} transparent animationType="fade">
        <View style={styles.winBackdrop}>
          <View style={styles.winCard}>
            <Text allowFontScaling={false} style={styles.winTitle}>
              {fa.win}
            </Text>
            <Text allowFontScaling={false} style={styles.winSubtitle}>
              {fa.winSubtitle}
            </Text>
            <View style={{ height: 24 }} />
            <AppButton label={fa.newGame} onPress={onNewGame} />
            <View style={{ height: 12 }} />
            <AppButton label={fa.back} onPress={onBack} variant="secondary" />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  iconBtn: {
    minWidth: 64,
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 36,
  },
  diffLabel: {
    fontFamily: 'Vazirmatn-Bold',
    fontSize: 24,
    color: colors.text,
  },
  boardWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  padWrap: {
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  bottomBar: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bottomBtn: { flex: 1 },
  helpCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
  },
  helpTitle: {
    fontFamily: 'Vazirmatn-Bold',
    fontSize: 28,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  helpScroll: { flexShrink: 1 },
  helpScrollContent: { paddingVertical: 8 },
  helpBody: {
    fontFamily: 'Vazirmatn-Regular',
    fontSize: 19,
    lineHeight: 32,
    color: colors.text,
    textAlign: 'right',
  },
  winBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  winCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  winTitle: {
    fontFamily: 'Vazirmatn-Bold',
    fontSize: 48,
    color: colors.primary,
    marginBottom: 12,
  },
  winSubtitle: {
    fontFamily: 'Vazirmatn-Regular',
    fontSize: 22,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
