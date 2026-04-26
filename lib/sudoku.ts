export type Difficulty = 'easy' | 'medium' | 'hard';

export const SIZE = 9;
export const N = 81;

export const rowOf = (idx: number) => (idx / 9) | 0;
export const colOf = (idx: number) => idx % 9;
export const boxOf = (idx: number) => ((rowOf(idx) / 3) | 0) * 3 + ((colOf(idx) / 3) | 0);

export const PEERS: readonly (readonly number[])[] = (() => {
  const peers: number[][] = [];
  for (let i = 0; i < N; i++) {
    const set = new Set<number>();
    const r = rowOf(i), c = colOf(i), b = boxOf(i);
    for (let j = 0; j < N; j++) {
      if (j === i) continue;
      if (rowOf(j) === r || colOf(j) === c || boxOf(j) === b) set.add(j);
    }
    peers.push([...set]);
  }
  return peers;
})();

export function parseBoard(s: string): Uint8Array {
  if (s.length !== N) throw new Error(`bad board length ${s.length}`);
  const b = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    const ch = s.charCodeAt(i) - 48;
    b[i] = ch >= 0 && ch <= 9 ? ch : 0;
  }
  return b;
}

export function serializeBoard(b: Uint8Array): string {
  let s = '';
  for (let i = 0; i < N; i++) s += String.fromCharCode(48 + b[i]);
  return s;
}

export function findConflicts(values: Uint8Array): boolean[] {
  const out = new Array(N).fill(false);
  for (let i = 0; i < N; i++) {
    const v = values[i];
    if (!v) continue;
    for (const p of PEERS[i]) {
      if (values[p] === v) {
        out[i] = true;
        break;
      }
    }
  }
  return out;
}

export function isComplete(values: Uint8Array): boolean {
  for (let i = 0; i < N; i++) if (!values[i]) return false;
  const conflicts = findConflicts(values);
  for (let i = 0; i < N; i++) if (conflicts[i]) return false;
  return true;
}

function isSafe(values: Uint8Array, idx: number, v: number): boolean {
  for (const p of PEERS[idx]) if (values[p] === v) return false;
  return true;
}

export function solve(values: Uint8Array): Uint8Array | null {
  const b = new Uint8Array(values);
  if (!solveInPlace(b)) return null;
  return b;
}

function solveInPlace(b: Uint8Array): boolean {
  let idx = -1;
  for (let i = 0; i < N; i++) if (!b[i]) { idx = i; break; }
  if (idx === -1) return true;
  for (let v = 1; v <= 9; v++) {
    if (isSafe(b, idx, v)) {
      b[idx] = v;
      if (solveInPlace(b)) return true;
      b[idx] = 0;
    }
  }
  return false;
}

export function countSolutions(values: Uint8Array, cap = 2): number {
  const b = new Uint8Array(values);
  let count = 0;
  const rec = (): void => {
    if (count >= cap) return;
    let idx = -1;
    for (let i = 0; i < N; i++) if (!b[i]) { idx = i; break; }
    if (idx === -1) { count++; return; }
    for (let v = 1; v <= 9 && count < cap; v++) {
      if (isSafe(b, idx, v)) {
        b[idx] = v;
        rec();
        b[idx] = 0;
      }
    }
  };
  rec();
  return count;
}
