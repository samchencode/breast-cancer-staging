# Breast Cancer Staging

Expo React Native app for calculating breast cancer anatomic and prognostic stage groups from TNM, grade, and ER/PR/HER2 status.

This is an educational software prototype. Do not use it for clinical decision-making until the staging tables and implementation have been independently validated against the current AJCC/NCCN source material.

## Features

- Runs on iOS, Android, and web through Expo.
- Supports clinical and pathologic staging basis selection.
- Calculates anatomic stage from T, N, and M categories.
- Calculates a prototype prognostic stage adjustment from anatomic stage, grade, and ER/PR/HER2 status.
- Keeps staging business logic in `src/domain/staging.ts`, separate from React Native view code in `App.tsx`.

## Getting Started

```bash
npm install
npm run start
```

Platform-specific commands:

```bash
npm run ios
npm run android
npm run web
```

## Validation

```bash
npm run typecheck
npm test
```

`npm test` checks the calculator against `src/domain/staging.golden.json`. Use `npm run test:verbose` only when you need to inspect the one-subtest-per-input expansion.

## Clinical Scope

The domain module is intentionally isolated so staging tables can be reviewed or extended without changing the UI. Before clinical use:

- Independently validate the table transcription against current AJCC/NCCN source material.
- Confirm handling of special cases such as post-neoadjuvant staging, T subcategories, N subcategories, unknown biomarkers, and multigene assay criteria.

## References

- National Cancer Institute PDQ breast cancer treatment information: https://www.cancer.gov/types/breast/hp/breast-treatment-pdq
- American Joint Committee on Cancer staging resources: https://www.facs.org/quality-programs/cancer-programs/american-joint-committee-on-cancer/
