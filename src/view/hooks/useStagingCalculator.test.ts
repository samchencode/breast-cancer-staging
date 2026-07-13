import assert from 'node:assert/strict';
import test from 'node:test';

import { initialStagingInput, parseOncotypeScoreText, updateStagingBasis, updateStagingInput } from './useStagingCalculator';
import type { StagingInput } from '../../domain/staging';

test('staging calculator hook starts with the expected default input', () => {
  assert.deepEqual(initialStagingInput, {
    basis: 'clinical',
    tumor: 'T1c',
    nodes: 'N0',
    metastasis: 'M0',
    grade: 'G2',
    er: 'positive',
    pr: 'positive',
    her2: 'negative',
    oncotypeScore: null,
  });
});

test('staging input updates return a new input without mutating the current one', () => {
  const current: StagingInput = { ...initialStagingInput, grade: 'G2' };
  const next = updateStagingInput(current, 'grade', 'G3');

  assert.notStrictEqual(next, current);
  assert.equal(current.grade, 'G2');
  assert.equal(next.grade, 'G3');
});

test('changing staging basis resets nodes to the shared N0 default', () => {
  const current: StagingInput = { ...initialStagingInput, basis: 'clinical', nodes: 'N1' };
  const next = updateStagingBasis(current, 'pathologic');

  assert.equal(next.basis, 'pathologic');
  assert.equal(next.nodes, 'N0');
  assert.equal(current.nodes, 'N1');
});

test('Oncotype score parsing preserves existing UI input behavior', () => {
  assert.equal(parseOncotypeScoreText(''), null);
  assert.equal(parseOncotypeScoreText('not tested'), null);
  assert.equal(parseOncotypeScoreText('score 10'), 10);
  assert.equal(parseOncotypeScoreText('100'), 100);
  assert.equal(parseOncotypeScoreText('101'), undefined);
});
