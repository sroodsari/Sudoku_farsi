#!/usr/bin/env node
// Offline puzzle bank generator. Run with: node scripts/generate-puzzles.js
// Writes assets/puzzles/{easy,medium,hard}.json with N puzzles each, all
// guaranteed unique-solution.

const fs = require('fs');
const path = require('path');

const N = 81;
const rowOf = (i) => (i / 9) | 0;
const colOf = (i) => i % 9;
const boxOf = (i) => ((rowOf(i) / 3) | 0) * 3 + ((colOf(i) / 3) | 0);

const PEERS = (() => {
  const out = [];
  for (let i = 0; i < N; i++) {
    const set = new Set();
    const r = rowOf(i), c = colOf(i), b = boxOf(i);
    for (let j = 0; j < N; j++) {
      if (j === i) continue;
      if (rowOf(j) === r || colOf(j) === c || boxOf(j) === b) set.add(j);
    }
    out.push([...set]);
  }
  return out;
})();

const safe = (b, idx, v) => {
  for (const p of PEERS[idx]) if (b[p] === v) return false;
  return true;
};

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function solveRandom(b) {
  let idx = -1;
  for (let i = 0; i < N; i++) if (!b[i]) { idx = i; break; }
  if (idx === -1) return true;
  for (const v of shuffle([1,2,3,4,5,6,7,8,9])) {
    if (safe(b, idx, v)) {
      b[idx] = v;
      if (solveRandom(b)) return true;
      b[idx] = 0;
    }
  }
  return false;
}

function countSolutions(b, cap = 2) {
  const a = new Uint8Array(b);
  let count = 0;
  const rec = () => {
    if (count >= cap) return;
    let idx = -1;
    for (let i = 0; i < N; i++) if (!a[i]) { idx = i; break; }
    if (idx === -1) { count++; return; }
    for (let v = 1; v <= 9 && count < cap; v++) {
      if (safe(a, idx, v)) {
        a[idx] = v;
        rec();
        a[idx] = 0;
      }
    }
  };
  rec();
  return count;
}

function makeSolved() {
  const b = new Uint8Array(N);
  solveRandom(b);
  return b;
}

// Remove cells while preserving unique solution. targetClues = desired clue count.
function makePuzzle(targetClues) {
  const solution = makeSolved();
  const given = new Uint8Array(solution);
  const order = shuffle([...Array(N).keys()]);
  let clues = N;
  for (const idx of order) {
    if (clues <= targetClues) break;
    const saved = given[idx];
    given[idx] = 0;
    if (countSolutions(given, 2) !== 1) {
      given[idx] = saved;
    } else {
      clues--;
    }
  }
  return { given, solution, clues };
}

const ser = (b) => Array.from(b).join('');

const TARGETS = {
  easy:   { count: 30, clues: 40 },
  medium: { count: 30, clues: 32 },
  hard:   { count: 30, clues: 27 },
};

const outDir = path.join(__dirname, '..', 'assets', 'puzzles');
fs.mkdirSync(outDir, { recursive: true });

for (const [diff, cfg] of Object.entries(TARGETS)) {
  const puzzles = [];
  const prefix = diff[0]; // e/m/h
  process.stdout.write(`Generating ${cfg.count} ${diff} puzzles `);
  while (puzzles.length < cfg.count) {
    const { given, solution, clues } = makePuzzle(cfg.clues);
    // accept anything within +3 of target (removal sometimes stalls)
    if (clues > cfg.clues + 3) continue;
    if (countSolutions(given, 2) !== 1) continue; // safety net
    const id = `${prefix}${String(puzzles.length + 1).padStart(3, '0')}`;
    puzzles.push({ id, given: ser(given), solution: ser(solution) });
    process.stdout.write('.');
  }
  process.stdout.write('\n');
  fs.writeFileSync(
    path.join(outDir, `${diff}.json`),
    JSON.stringify(puzzles, null, 2) + '\n'
  );
  console.log(`  -> assets/puzzles/${diff}.json (${puzzles.length} puzzles)`);
}

console.log('Done.');
