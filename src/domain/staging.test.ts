import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BiomarkerStatus,
  calculateBreastCancerStage,
  ClinicalNodeCategory,
  Grade,
  MetastasisCategory,
  NodeCategory,
  PathologicNodeCategory,
  StageGroup,
  StagingBasis,
  StagingInput,
  TumorCategory,
} from './staging';

type ExpectedTumorGroup = 'Tis' | 'T0' | 'T1' | 'T2' | 'T3' | 'T4';
type ExpectedNodeGroup = 'N0' | 'N1mi' | 'N1' | 'N2' | 'N3';
type ExpectedBucket = 'A' | 'B' | 'C' | 'D' | 'E';
type BiomarkerKey = `${BiomarkerStatus}|${BiomarkerStatus}|${BiomarkerStatus}`;
type ExpectedMatrix = Record<Grade, Record<BiomarkerKey, StageGroup>>;

const tumorCategories: TumorCategory[] = ['Tis', 'T0', 'T1a', 'T1b', 'T1c', 'T2', 'T3', 'T4a', 'T4b', 'T4c', 'T4d'];
const clinicalNodeCategories: ClinicalNodeCategory[] = ['N0', 'N1mi', 'N1', 'N2a', 'N2b', 'N3a', 'N3b', 'N3c'];
const pathologicNodeCategories: PathologicNodeCategory[] = [
  'N0',
  'N0(i+)',
  'N0(mol+)',
  'N1mi',
  'N1a',
  'N1b',
  'N1c',
  'N2a',
  'N2b',
  'N3a',
  'N3b',
  'N3c',
];
const metastasisCategories: MetastasisCategory[] = ['M0', 'M1'];
const grades: Grade[] = ['G1', 'G2', 'G3'];
const biomarkerStatuses: BiomarkerStatus[] = ['positive', 'negative'];
const biomarkerKeys: BiomarkerKey[] = [
  'positive|positive|positive',
  'positive|positive|negative',
  'positive|negative|positive',
  'positive|negative|negative',
  'negative|positive|positive',
  'negative|positive|negative',
  'negative|negative|positive',
  'negative|negative|negative',
];

const expectedClinicalPrognosticStage: Record<ExpectedBucket, ExpectedMatrix> = {
  A: expectedMatrix({
    G1: ['IA', 'IA', 'IA', 'IA', 'IA', 'IA', 'IA', 'IB'],
    G2: ['IA', 'IA', 'IA', 'IA', 'IA', 'IA', 'IA', 'IB'],
    G3: ['IA', 'IA', 'IA', 'IA', 'IA', 'IB', 'IB', 'IB'],
  }),
  B: expectedMatrix({
    G1: ['IB', 'IIA', 'IIA', 'IIA', 'IB', 'IIA', 'IIA', 'IIA'],
    G2: ['IB', 'IIA', 'IIA', 'IIA', 'IB', 'IIA', 'IIA', 'IIB'],
    G3: ['IB', 'IIA', 'IIA', 'IIA', 'IIA', 'IIB', 'IIB', 'IIB'],
  }),
  C: expectedMatrix({
    G1: ['IB', 'IIA', 'IIA', 'IIB', 'IIA', 'IIB', 'IIB', 'IIB'],
    G2: ['IB', 'IIA', 'IIA', 'IIB', 'IIA', 'IIB', 'IIB', 'IIIB'],
    G3: ['IB', 'IIB', 'IIB', 'IIB', 'IIB', 'IIIA', 'IIIA', 'IIIB'],
  }),
  D: expectedMatrix({
    G1: ['IIA', 'IIIA', 'IIIA', 'IIIA', 'IIA', 'IIIA', 'IIIA', 'IIIB'],
    G2: ['IIA', 'IIIA', 'IIIA', 'IIIA', 'IIA', 'IIIA', 'IIIA', 'IIIB'],
    G3: ['IIB', 'IIIA', 'IIIA', 'IIIA', 'IIIA', 'IIIB', 'IIIB', 'IIIC'],
  }),
  E: expectedMatrix({
    G1: ['IIIA', 'IIIB', 'IIIB', 'IIIB', 'IIIB', 'IIIB', 'IIIB', 'IIIC'],
    G2: ['IIIA', 'IIIB', 'IIIB', 'IIIB', 'IIIB', 'IIIB', 'IIIB', 'IIIC'],
    G3: ['IIIB', 'IIIB', 'IIIB', 'IIIB', 'IIIB', 'IIIC', 'IIIC', 'IIIC'],
  }),
};

const expectedPathologicPrognosticStage: Record<ExpectedBucket, ExpectedMatrix> = {
  A: expectedMatrix({
    G1: ['IA', 'IA', 'IA', 'IA', 'IA', 'IA', 'IA', 'IA'],
    G2: ['IA', 'IA', 'IA', 'IA', 'IA', 'IA', 'IA', 'IB'],
    G3: ['IA', 'IA', 'IA', 'IA', 'IA', 'IA', 'IA', 'IB'],
  }),
  B: expectedMatrix({
    G1: ['IA', 'IB', 'IB', 'IIA', 'IA', 'IB', 'IB', 'IIA'],
    G2: ['IA', 'IB', 'IB', 'IIA', 'IA', 'IIA', 'IIA', 'IIA'],
    G3: ['IA', 'IIA', 'IIA', 'IIA', 'IB', 'IIA', 'IIA', 'IIA'],
  }),
  C: expectedMatrix({
    G1: ['IA', 'IIB', 'IIB', 'IIB', 'IA', 'IIB', 'IIB', 'IIB'],
    G2: ['IB', 'IIB', 'IIB', 'IIB', 'IB', 'IIB', 'IIB', 'IIB'],
    G3: ['IB', 'IIB', 'IIB', 'IIB', 'IIA', 'IIB', 'IIB', 'IIIA'],
  }),
  D: expectedMatrix({
    G1: ['IB', 'IIIA', 'IIIA', 'IIIA', 'IB', 'IIIA', 'IIIA', 'IIIA'],
    G2: ['IB', 'IIIA', 'IIIA', 'IIIA', 'IB', 'IIIA', 'IIIA', 'IIIB'],
    G3: ['IIA', 'IIIA', 'IIIA', 'IIIA', 'IIB', 'IIIA', 'IIIA', 'IIIC'],
  }),
  E: expectedMatrix({
    G1: ['IIIA', 'IIIB', 'IIIB', 'IIIB', 'IIIA', 'IIIB', 'IIIB', 'IIIB'],
    G2: ['IIIA', 'IIIB', 'IIIB', 'IIIB', 'IIIA', 'IIIB', 'IIIB', 'IIIC'],
    G3: ['IIIB', 'IIIB', 'IIIB', 'IIIB', 'IIIB', 'IIIC', 'IIIC', 'IIIC'],
  }),
};

test('calculates anatomic and prognostic stage for every supported input combination', () => {
  let checked = 0;

  for (const input of allInputs()) {
    const actual = calculateBreastCancerStage(input);
    const context = JSON.stringify(input);

    assert.equal(actual.anatomicStage, expectedAnatomicStage(input), `anatomic stage mismatch for ${context}`);
    assert.equal(actual.prognosticStage, expectedPrognosticStage(input), `prognostic stage mismatch for ${context}`);
    checked += 1;
  }

  assert.equal(checked, 10560);
});

function* allInputs(): Generator<StagingInput> {
  for (const basis of ['clinical', 'pathologic'] satisfies StagingBasis[]) {
    const nodeCategories: readonly NodeCategory[] = basis === 'clinical' ? clinicalNodeCategories : pathologicNodeCategories;

    for (const tumor of tumorCategories) {
      for (const nodes of nodeCategories) {
        for (const metastasis of metastasisCategories) {
          for (const grade of grades) {
            for (const er of biomarkerStatuses) {
              for (const pr of biomarkerStatuses) {
                for (const her2 of biomarkerStatuses) {
                  yield { basis, tumor, nodes, metastasis, grade, er, pr, her2 };
                }
              }
            }
          }
        }
      }
    }
  }
}

function expectedAnatomicStage(input: Pick<StagingInput, 'tumor' | 'nodes' | 'metastasis'>): StageGroup {
  if (input.metastasis === 'M1') {
    return 'IV';
  }

  const tumorGroup = expectedTumorForStage(input.tumor, input.nodes);
  const nodeGroup = expectedNodeGroup(input.nodes);

  if (tumorGroup === 'Tis' && nodeGroup === 'N0') {
    return '0';
  }

  if (nodeGroup === 'N3') {
    return 'IIIC';
  }

  if (tumorGroup === 'T4') {
    return 'IIIB';
  }

  if (nodeGroup === 'N2') {
    return 'IIIA';
  }

  if (nodeGroup === 'N1mi') {
    if (tumorGroup === 'T0' || tumorGroup === 'T1') {
      return 'IB';
    }

    if (tumorGroup === 'T2') {
      return 'IIB';
    }

    return 'IIIA';
  }

  if (nodeGroup === 'N1') {
    if (tumorGroup === 'T0' || tumorGroup === 'T1') {
      return 'IIA';
    }

    if (tumorGroup === 'T2') {
      return 'IIB';
    }

    return 'IIIA';
  }

  if (tumorGroup === 'Tis') {
    return '0';
  }

  if (tumorGroup === 'T0' || tumorGroup === 'T1') {
    return 'IA';
  }

  if (tumorGroup === 'T2') {
    return 'IIA';
  }

  return 'IIB';
}

function expectedPrognosticStage(input: StagingInput): StageGroup {
  if (input.metastasis === 'M1') {
    return 'IV';
  }

  const tumorGroup = expectedTumorForStage(input.tumor, input.nodes);
  const nodeGroup = expectedNodeGroup(input.nodes);

  if (tumorGroup === 'Tis' && nodeGroup === 'N0') {
    return '0';
  }

  const matrix = input.basis === 'clinical' ? expectedClinicalPrognosticStage : expectedPathologicPrognosticStage;
  const bucket = expectedBucket(tumorGroup, nodeGroup);

  return matrix[bucket][input.grade][expectedBiomarkerKey(input)];
}

function expectedTumorGroup(tumor: TumorCategory): ExpectedTumorGroup {
  if (tumor === 'T1a' || tumor === 'T1b' || tumor === 'T1c') {
    return 'T1';
  }

  if (tumor === 'T4a' || tumor === 'T4b' || tumor === 'T4c' || tumor === 'T4d') {
    return 'T4';
  }

  return tumor;
}

function expectedTumorForStage(tumor: TumorCategory, nodes: NodeCategory): ExpectedTumorGroup {
  const tumorGroup = expectedTumorGroup(tumor);

  if (tumorGroup === 'Tis' && expectedNodeGroup(nodes) !== 'N0') {
    return 'T0';
  }

  return tumorGroup;
}

function expectedNodeGroup(nodes: NodeCategory): ExpectedNodeGroup {
  if (nodes === 'N1mi') {
    return 'N1mi';
  }

  if (nodes.startsWith('N3')) {
    return 'N3';
  }

  if (nodes.startsWith('N2')) {
    return 'N2';
  }

  if (nodes.startsWith('N1')) {
    return 'N1';
  }

  return 'N0';
}

function expectedBucket(tumorGroup: ExpectedTumorGroup, nodeGroup: ExpectedNodeGroup): ExpectedBucket {
  if (nodeGroup === 'N3' || tumorGroup === 'T4') {
    return 'E';
  }

  if (
    (nodeGroup === 'N2' && (tumorGroup === 'T0' || tumorGroup === 'T1' || tumorGroup === 'T2' || tumorGroup === 'T3')) ||
    ((nodeGroup === 'N1' || nodeGroup === 'N1mi') && tumorGroup === 'T3')
  ) {
    return 'D';
  }

  if ((tumorGroup === 'T2' && (nodeGroup === 'N1' || nodeGroup === 'N1mi')) || (tumorGroup === 'T3' && nodeGroup === 'N0')) {
    return 'C';
  }

  if (((tumorGroup === 'T0' || tumorGroup === 'T1') && nodeGroup === 'N1') || (tumorGroup === 'T2' && nodeGroup === 'N0')) {
    return 'B';
  }

  return 'A';
}

function expectedBiomarkerKey(input: Pick<StagingInput, 'her2' | 'er' | 'pr'>): BiomarkerKey {
  return `${input.her2}|${input.er}|${input.pr}`;
}

function expectedMatrix(rows: Record<Grade, StageGroup[]>): ExpectedMatrix {
  return {
    G1: expectedBiomarkerStageMap(rows.G1),
    G2: expectedBiomarkerStageMap(rows.G2),
    G3: expectedBiomarkerStageMap(rows.G3),
  };
}

function expectedBiomarkerStageMap(stages: StageGroup[]): Record<BiomarkerKey, StageGroup> {
  return biomarkerKeys.reduce<Record<BiomarkerKey, StageGroup>>(
    (map, key, index) => ({
      ...map,
      [key]: stages[index],
    }),
    {} as Record<BiomarkerKey, StageGroup>,
  );
}
