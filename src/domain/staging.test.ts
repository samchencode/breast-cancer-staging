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
