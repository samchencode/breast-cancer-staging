import assert from 'node:assert/strict';
import test from 'node:test';

import {
  biomarkerOptions,
  formatBiomarkerStatusLabel,
  formatStagingBasisLabel,
  gradeOptions,
  metastasisOptions,
  shouldWrapOptionButtons,
  stagingBasisOptions,
  tumorOptions,
} from './formOptions';

test('frontend option lists match the supported calculator controls', () => {
  assert.deepEqual(stagingBasisOptions, ['clinical', 'pathologic']);
  assert.deepEqual(tumorOptions, ['Tis', 'T0', 'T1a', 'T1b', 'T1c', 'T2', 'T3', 'T4a', 'T4b', 'T4c', 'T4d']);
  assert.deepEqual(metastasisOptions, ['M0', 'M0(i+)', 'M1']);
  assert.deepEqual(gradeOptions, ['G1', 'G2', 'G3']);
  assert.deepEqual(biomarkerOptions, ['positive', 'negative']);
});

test('component label helpers keep compact UI labels stable', () => {
  assert.equal(formatStagingBasisLabel('clinical'), 'Clinical');
  assert.equal(formatStagingBasisLabel('pathologic'), 'Pathologic');
  assert.equal(formatBiomarkerStatusLabel('positive'), '+');
  assert.equal(formatBiomarkerStatusLabel('negative'), '-');
});

test('option groups wrap only when the option count is wide', () => {
  assert.equal(shouldWrapOptionButtons(4), false);
  assert.equal(shouldWrapOptionButtons(5), true);
});
