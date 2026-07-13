# AGENTS.md

## Project

This is an Expo React Native app for breast cancer staging calculations.

## Commands

- `npm run start`: start Expo.
- `npm run ios`: start Expo for iOS.
- `npm run android`: start Expo for Android.
- `npm run web`: start Expo for web.
- `npm run typecheck`: run TypeScript validation.
- `npm test`: compile and run the domain unit tests.

## Architecture

- Keep staging rules, types, lookup tables, and calculation helpers in `src/domain`.
- Keep React Native components focused on input state, rendering, and accessibility.
- Do not put staging rules directly in `App.tsx` or other view components.
- Treat medical staging logic as regulated/high-risk domain behavior. Prefer table-driven, test-covered logic over informal conditionals as the app matures.
- Run `npm test` after editing anything in `src/domain`.
- Keep domain tests golden-fixture based. Do not reimplement the staging algorithm in the test suite.

## Clinical Safety

- Do not present unvalidated calculations as clinically authoritative.
- Update `README.md` whenever staging scope, assumptions, or validation status changes.
- Add representative fixture tests before broadening clinical coverage.
