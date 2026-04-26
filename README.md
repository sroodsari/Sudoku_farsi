# Sudoku Farsi

A small iOS Sudoku app with a Farsi (Persian) UI and Latin numerals on the board, built for one user (my grandfather). Optimized for an elderly user: large touch targets, high-contrast colors, simple flows, no timer, no accounts, no sound.

Built with Expo Router + React Native.

## Features

- 90 unique-solution puzzles bundled (30 easy, 30 medium, 30 hard)
- Tap a cell to highlight matching numbers, peer cells (row/col/box), and conflicts
- Single-step undo
- Auto-resume — close the app mid-puzzle and pick up where you left off
- All UI strings in Farsi (Vazirmatn font), board numerals in English

## Local development

```bash
npm install
npx expo start
```

Press `i` to launch in the iOS simulator. Custom fonts and forced RTL require a **dev build**, not Expo Go:

```bash
npx expo run:ios
```

## Regenerating puzzles

```bash
node scripts/generate-puzzles.js
```

Writes `assets/puzzles/{easy,medium,hard}.json`. Each puzzle is verified to have exactly one solution.

## Shipping to TestFlight

1. Enroll in the [Apple Developer Program](https://developer.apple.com/programs/) ($99/yr; ~24–48h approval).
2. Update `app.json` `ios.bundleIdentifier` to a unique reverse-DNS string you own (current placeholder: `com.shopencore.sudokufarsi`).
3. Install the EAS CLI and log in:
   ```bash
   npm i -g eas-cli
   eas login
   eas init
   ```
4. Build the iOS production binary in the cloud (no Mac required):
   ```bash
   eas build -p ios --profile production
   ```
5. Create the app record in [App Store Connect](https://appstoreconnect.apple.com) (name, SKU, bundle ID, simple privacy-policy URL).
6. Submit:
   ```bash
   eas submit -p ios --latest
   ```
7. In App Store Connect → TestFlight, add grandpa's Apple ID email as a tester. He installs the TestFlight app from the App Store; the build will appear there.

## Project structure

```
app/
  _layout.tsx     RTL + Vazirmatn font + stack nav
  index.tsx       Home: title, difficulty buttons, Continue
  game.tsx        Game screen with reducer, board, number pad
components/
  AppButton.tsx   Large elderly-friendly button
  Board.tsx       9×9 grid with thick box borders
  Cell.tsx        Single cell with all highlight states
  NumberPad.tsx   1–9 + erase, large keys
constants/
  colors.ts
lib/
  sudoku.ts       Conflict detection, solver, peer tables
  puzzles.ts      Puzzle bank loader
  storage.ts      AsyncStorage save/load
  i18n.ts         Farsi strings
assets/
  fonts/          Vazirmatn-Regular.ttf, Vazirmatn-Bold.ttf
  puzzles/        easy.json, medium.json, hard.json
scripts/
  generate-puzzles.js   Offline puzzle generator + validator
```
