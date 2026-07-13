import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import { calculateBreastCancerStage, StageGroup, StagingInput } from './staging';

type GoldenRow = [
  basis: StagingInput['basis'],
  tumor: StagingInput['tumor'],
  nodes: StagingInput['nodes'],
  metastasis: StagingInput['metastasis'],
  grade: StagingInput['grade'],
  er: StagingInput['er'],
  pr: StagingInput['pr'],
  her2: StagingInput['her2'],
  anatomicStage: StageGroup,
  prognosticStage: StageGroup,
];

type GoldenFixture = {
  source: string;
  rows: GoldenRow[];
};

const fixture = JSON.parse(
  readFileSync(join(process.cwd(), 'src/domain/staging.golden.json'), 'utf8'),
) as GoldenFixture;

test('golden staging fixture', async (t) => {
  assert.equal(fixture.rows.length, 15840, 'golden fixture should cover every supported staging input');

  for (const row of fixture.rows) {
    const [basis, tumor, nodes, metastasis, grade, er, pr, her2, anatomicStage, prognosticStage] = row;
    const input: StagingInput = { basis, tumor, nodes, metastasis, grade, er, pr, her2 };

    await t.test(`${basis} ${tumor} ${nodes} ${metastasis} ${grade} HER2:${her2} ER:${er} PR:${pr}`, () => {
      const actual = calculateBreastCancerStage(input);

      assert.deepEqual(
        {
          anatomicStage: actual.anatomicStage,
          prognosticStage: actual.prognosticStage,
        },
        {
          anatomicStage,
          prognosticStage,
        },
      );
    });
  }
});

test('low-risk Oncotype DX score modifies eligible pathologic prognostic stage to IA', () => {
  const actual = calculateBreastCancerStage({
    basis: 'pathologic',
    tumor: 'T2',
    nodes: 'N0',
    metastasis: 'M0',
    grade: 'G3',
    er: 'positive',
    pr: 'positive',
    her2: 'negative',
    oncotypeScore: 10,
  });

  assert.equal(actual.anatomicStage, 'IIA');
  assert.equal(actual.prognosticStage, 'IA');
  assert.ok(actual.notes.some((note) => note.includes('Oncotype DX recurrence score modified')));
});

test('Oncotype DX score 11 is not a low-risk prognostic stage modifier', () => {
  const actual = calculateBreastCancerStage({
    basis: 'pathologic',
    tumor: 'T2',
    nodes: 'N0',
    metastasis: 'M0',
    grade: 'G3',
    er: 'positive',
    pr: 'positive',
    her2: 'negative',
    oncotypeScore: 11,
  });

  assert.equal(actual.anatomicStage, 'IIA');
  assert.equal(actual.prognosticStage, 'IB');
});

test('Oncotype DX score does not modify clinical prognostic stage', () => {
  const actual = calculateBreastCancerStage({
    basis: 'clinical',
    tumor: 'T2',
    nodes: 'N0',
    metastasis: 'M0',
    grade: 'G3',
    er: 'positive',
    pr: 'positive',
    her2: 'negative',
    oncotypeScore: 10,
  });

  assert.equal(actual.anatomicStage, 'IIA');
  assert.equal(actual.prognosticStage, 'IIA');
});

test('Oncotype DX score does not modify node-positive pathologic prognostic stage', () => {
  const actual = calculateBreastCancerStage({
    basis: 'pathologic',
    tumor: 'T1c',
    nodes: 'N1a',
    metastasis: 'M0',
    grade: 'G3',
    er: 'positive',
    pr: 'positive',
    her2: 'negative',
    oncotypeScore: 10,
  });

  assert.equal(actual.anatomicStage, 'IIA');
  assert.equal(actual.prognosticStage, 'IB');
});

test('Oncotype DX score does not modify hormone receptor negative pathologic prognostic stage', () => {
  const actual = calculateBreastCancerStage({
    basis: 'pathologic',
    tumor: 'T2',
    nodes: 'N0',
    metastasis: 'M0',
    grade: 'G3',
    er: 'negative',
    pr: 'negative',
    her2: 'negative',
    oncotypeScore: 10,
  });

  assert.equal(actual.anatomicStage, 'IIA');
  assert.equal(actual.prognosticStage, 'IIA');
});

test('Oncotype DX score can modify eligible M0(i+) and N0(i+) pathologic staging', () => {
  const actual = calculateBreastCancerStage({
    basis: 'pathologic',
    tumor: 'T2',
    nodes: 'N0(i+)',
    metastasis: 'M0(i+)',
    grade: 'G3',
    er: 'positive',
    pr: 'positive',
    her2: 'negative',
    oncotypeScore: 10,
  });

  assert.equal(actual.anatomicStage, 'IIA');
  assert.equal(actual.prognosticStage, 'IA');
});
