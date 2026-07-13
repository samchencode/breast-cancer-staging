# Breast Cancer Staging

An Expo React Native app for calculating breast cancer anatomic and prognostic stage groups from AJCC-style TNM inputs, grade, ER status, PR status, HER2 status, and an optional Oncotype DX recurrence score modifier.

This is educational/prototype software. Do not use it for clinical decision-making until the staging tables, edge cases, and implementation have been independently validated against the current AJCC/NCCN source material.

## What It Does

- Runs on iOS, Android, and web through Expo SDK 57.
- Lets the user choose clinical or pathologic staging.
- Uses modal selectors for tumor, nodes, and metastasis categories.
- Shows editable TNM descriptions from `src/domain/definitions.ts`.
- Keeps clinical and pathologic node definitions separate.
- Calculates anatomic stage from TNM.
- Calculates prognostic stage from TNM, grade, ER, PR, and HER2.
- Supports a narrow Oncotype DX recurrence score modifier for eligible pathologic prognostic staging.
- Keeps staging logic in `src/domain/staging.ts`, separate from React Native view code in `App.tsx`.

## Current Scope

The current domain model includes:

- Tumor categories: `Tis`, `T0`, `T1a`, `T1b`, `T1c`, `T2`, `T3`, `T4a`, `T4b`, `T4c`, `T4d`.
- Clinical nodes: `N0`, `N1mi`, `N1`, `N2a`, `N2b`, `N3a`, `N3b`, `N3c`.
- Pathologic nodes: `N0`, `N0(i+)`, `N0(mol+)`, `N1mi`, `N1a`, `N1b`, `N1c`, `N2a`, `N2b`, `N3a`, `N3b`, `N3c`.
- Metastasis categories: `M0`, `M0(i+)`, `M1`.
- Grade: `G1`, `G2`, `G3`.
- Biomarkers: ER, PR, and HER2 positive/negative.
- Optional Oncotype DX recurrence score: integer `0` through `100`.

Oncotype DX is implemented only as a prognostic-stage modifier for eligible pathologic HR+/HER2- T1-T2 N0 M0 cases. Low-risk scores `0` through `10` (`<11`) modify the pathologic prognostic stage to `IA`. The score does not modify anatomic stage and does not modify clinical prognostic stage.

## Getting Started

Use Node.js `22.13.x` or newer compatible with Expo SDK 57. Before changing Expo or React Native behavior, read the versioned Expo docs:

https://docs.expo.dev/versions/v57.0.0/

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npm run start
```

Run a specific target:

```bash
npm run ios
npm run android
npm run web
```

## Validation

Run TypeScript validation:

```bash
npm run typecheck
```

Run the domain test suite:

```bash
npm test
```

`npm test` compiles the test build and checks the calculator against `src/domain/staging.golden.json`. The golden file has one row per supported baseline input combination, without the optional Oncotype DX modifier. Focused tests cover the Oncotype modifier boundaries. Use `npm run test:verbose` only when you need to inspect the expanded per-input subtests.

## Project Layout

- `App.tsx`: React Native view state and controls.
- `src/domain/staging.ts`: staging types, normalization helpers, anatomic stage logic, and prognostic stage tables.
- `src/domain/definitions.ts`: editable user-facing TNM descriptions and clinical/pathologic node option lists.
- `src/domain/staging.test.ts`: golden-fixture test runner.
- `src/domain/staging.golden.json`: expected stage outputs for supported inputs.

## Clinical Sources

Primary behavior should be checked against:

- NCI PDQ Breast Cancer Treatment, Stage Information for Breast Cancer: https://www.cancer.gov/types/breast/hp/breast-treatment-pdq
- AJCC Cancer Staging Manual, 8th edition, Breast chapter: https://www.facs.org/quality-programs/cancer-programs/american-joint-committee-on-cancer/
- NCI PDQ Oncotype DX discussion for recurrence-score context: https://www.cancer.gov/types/breast/hp/breast-treatment-pdq
- NCI PDQ TAILORx discussion for the low-risk recurrence-score cutoff used here: https://www.cancer.gov/types/breast/hp/breast-treatment-pdq

NCI PDQ republishes AJCC staging tables with permission and notes that U.S. reporting uses the Clinical and Pathological Prognostic Stage Group tables for invasive breast cancer.
