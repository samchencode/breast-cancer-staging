# AGENTS.md

## Expo Version Rule

Expo has changed. Before writing code that touches Expo, React Native, web behavior, build configuration, or dependencies, read the exact versioned docs for this project:

https://docs.expo.dev/versions/v57.0.0/

This project currently uses Expo SDK 57.

## Project

This is an Expo React Native breast cancer staging calculator. It calculates anatomic and prognostic stage groups from staging basis, TNM category, grade, ER status, PR status, HER2 status, and an optional Oncotype DX recurrence score modifier.

The app is educational/prototype software, not validated clinical decision support.

## Commands

- `npm run start`: start Expo.
- `npm run ios`: start Expo for iOS.
- `npm run android`: start Expo for Android.
- `npm run web`: start Expo for web.
- `npm run typecheck`: run TypeScript validation.
- `npm test`: compile and run the domain unit tests.
- `npm run test:verbose`: run the expanded golden-fixture subtests when detailed output is needed.

## Architecture

- Keep staging rules, types, lookup tables, and calculation helpers in `src/domain`.
- Keep React Native components focused on input state, rendering, layout, and accessibility.
- Do not put staging rules directly in `App.tsx` or other view components.
- Keep TNM label/description copy in `src/domain/definitions.ts` so it remains easy to edit without changing calculator logic.
- Keep clinical and pathologic node definitions separate. Clinical and pathologic nodal staging do not share the same option set.
- Treat medical staging behavior as high-risk domain logic. Prefer source-backed table data and golden-fixture tests over informal conditionals.

## Domain Data

- `src/domain/staging.ts` owns stage calculation behavior.
- `src/domain/definitions.ts` owns user-facing TNM definitions and option lists.
- `src/domain/staging.golden.json` stores one expected output row per supported input combination.
- `src/domain/staging.test.ts` should stay thin. It should read the golden file and compare outputs, not reimplement the staging algorithm.
- Keep optional modifiers, such as Oncotype DX, implemented in domain helpers with focused tests around eligibility and boundary behavior.

## Clinical Safety

- Do not present unvalidated calculations as clinically authoritative.
- Use NCI PDQ/AJCC source material for staging behavior. Treatment guidelines are not enough to change stage-group behavior.
- If changing Oncotype DX / 21-gene recurrence score support, verify the exact AJCC staging criteria first. It should not change anatomic stage.
- Update `README.md` whenever staging scope, assumptions, source material, or validation status changes.
- Run `npm test` after editing anything in `src/domain`.
- Run `npm run typecheck` after TypeScript or UI changes.
