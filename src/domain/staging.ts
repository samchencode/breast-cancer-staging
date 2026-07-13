export type StagingBasis = 'clinical' | 'pathologic';
export type TumorCategory =
  | 'Tis'
  | 'T0'
  | 'T1a'
  | 'T1b'
  | 'T1c'
  | 'T2'
  | 'T3'
  | 'T4a'
  | 'T4b'
  | 'T4c'
  | 'T4d';
export type TumorGroup = 'Tis' | 'T0' | 'T1' | 'T2' | 'T3' | 'T4';
export type NodeGroup = 'N0' | 'N1mi' | 'N1' | 'N2' | 'N3';
export type ClinicalNodeCategory = 'N0' | 'N1mi' | 'N1' | 'N2a' | 'N2b' | 'N3a' | 'N3b' | 'N3c';
export type PathologicNodeCategory =
  | 'N0'
  | 'N0(i+)'
  | 'N0(mol+)'
  | 'N1mi'
  | 'N1a'
  | 'N1b'
  | 'N1c'
  | 'N2a'
  | 'N2b'
  | 'N3a'
  | 'N3b'
  | 'N3c';
export type NodeCategory = ClinicalNodeCategory | PathologicNodeCategory;
export type MetastasisCategory = 'M0' | 'M0(i+)' | 'M1';
export type Grade = 'G1' | 'G2' | 'G3';
export type BiomarkerStatus = 'positive' | 'negative';
export type OncotypeScore = number | null;

export type StageGroup =
  | '0'
  | 'IA'
  | 'IB'
  | 'IIA'
  | 'IIB'
  | 'IIIA'
  | 'IIIB'
  | 'IIIC'
  | 'IV'
  | 'Not applicable';

export type StagingInput = {
  basis: StagingBasis;
  tumor: TumorCategory;
  nodes: NodeCategory;
  metastasis: MetastasisCategory;
  grade: Grade;
  er: BiomarkerStatus;
  pr: BiomarkerStatus;
  her2: BiomarkerStatus;
  oncotypeScore?: OncotypeScore;
};

export type StagingResult = {
  prefix: 'c' | 'p';
  tnm: string;
  anatomicStage: StageGroup;
  prognosticStage: StageGroup;
  subtype: string;
  notes: string[];
};

type BiomarkerKey = `${BiomarkerStatus}|${BiomarkerStatus}|${BiomarkerStatus}`;
type PrognosticBucket = 'A' | 'B' | 'C' | 'D' | 'E';
type PrognosticMatrix = Record<Grade, Record<BiomarkerKey, StageGroup>>;
const LOW_RISK_ONCOTYPE_MAX_EXCLUSIVE = 11;

// Prognostic buckets are internal row groups for the AJCC prognostic tables, not
// user-facing stage names. M1 and Tis/N0 are handled before these buckets.
//
// A: T0/T1 with N0 or N1mi.
// B: T0/T1 with N1, or T2 with N0.
// C: T2 with N1/N1mi, or T3 with N0.
// D: T0-T3 with N2, or T3 with N1/N1mi.
// E: T4 with any N, or any T with N3.
//
// Each matrix row is grade-specific. Values are ordered by BIOMARKER_KEYS:
// HER2+/ER+/PR+, HER2+/ER+/PR-, HER2+/ER-/PR+, HER2+/ER-/PR-,
// HER2-/ER+/PR+, HER2-/ER+/PR-, HER2-/ER-/PR+, HER2-/ER-/PR-.
const BIOMARKER_KEYS: BiomarkerKey[] = [
  'positive|positive|positive',
  'positive|positive|negative',
  'positive|negative|positive',
  'positive|negative|negative',
  'negative|positive|positive',
  'negative|positive|negative',
  'negative|negative|positive',
  'negative|negative|negative',
];

const CLINICAL_PROGNOSTIC_STAGE: Record<PrognosticBucket, PrognosticMatrix> = {
  A: makeMatrix({
    G1: ['IA', 'IA', 'IA', 'IA', 'IA', 'IA', 'IA', 'IB'],
    G2: ['IA', 'IA', 'IA', 'IA', 'IA', 'IA', 'IA', 'IB'],
    G3: ['IA', 'IA', 'IA', 'IA', 'IA', 'IB', 'IB', 'IB'],
  }),
  B: makeMatrix({
    G1: ['IB', 'IIA', 'IIA', 'IIA', 'IB', 'IIA', 'IIA', 'IIA'],
    G2: ['IB', 'IIA', 'IIA', 'IIA', 'IB', 'IIA', 'IIA', 'IIB'],
    G3: ['IB', 'IIA', 'IIA', 'IIA', 'IIA', 'IIB', 'IIB', 'IIB'],
  }),
  C: makeMatrix({
    G1: ['IB', 'IIA', 'IIA', 'IIB', 'IIA', 'IIB', 'IIB', 'IIB'],
    G2: ['IB', 'IIA', 'IIA', 'IIB', 'IIA', 'IIB', 'IIB', 'IIIB'],
    G3: ['IB', 'IIB', 'IIB', 'IIB', 'IIB', 'IIIA', 'IIIA', 'IIIB'],
  }),
  D: makeMatrix({
    G1: ['IIA', 'IIIA', 'IIIA', 'IIIA', 'IIA', 'IIIA', 'IIIA', 'IIIB'],
    G2: ['IIA', 'IIIA', 'IIIA', 'IIIA', 'IIA', 'IIIA', 'IIIA', 'IIIB'],
    G3: ['IIB', 'IIIA', 'IIIA', 'IIIA', 'IIIA', 'IIIB', 'IIIB', 'IIIC'],
  }),
  E: makeMatrix({
    G1: ['IIIA', 'IIIB', 'IIIB', 'IIIB', 'IIIB', 'IIIB', 'IIIB', 'IIIC'],
    G2: ['IIIA', 'IIIB', 'IIIB', 'IIIB', 'IIIB', 'IIIB', 'IIIB', 'IIIC'],
    G3: ['IIIB', 'IIIB', 'IIIB', 'IIIB', 'IIIB', 'IIIC', 'IIIC', 'IIIC'],
  }),
};

const PATHOLOGIC_PROGNOSTIC_STAGE: Record<PrognosticBucket, PrognosticMatrix> = {
  A: makeMatrix({
    G1: ['IA', 'IA', 'IA', 'IA', 'IA', 'IA', 'IA', 'IA'],
    G2: ['IA', 'IA', 'IA', 'IA', 'IA', 'IA', 'IA', 'IB'],
    G3: ['IA', 'IA', 'IA', 'IA', 'IA', 'IA', 'IA', 'IB'],
  }),
  B: makeMatrix({
    G1: ['IA', 'IB', 'IB', 'IIA', 'IA', 'IB', 'IB', 'IIA'],
    G2: ['IA', 'IB', 'IB', 'IIA', 'IA', 'IIA', 'IIA', 'IIA'],
    G3: ['IA', 'IIA', 'IIA', 'IIA', 'IB', 'IIA', 'IIA', 'IIA'],
  }),
  C: makeMatrix({
    G1: ['IA', 'IIB', 'IIB', 'IIB', 'IA', 'IIB', 'IIB', 'IIB'],
    G2: ['IB', 'IIB', 'IIB', 'IIB', 'IB', 'IIB', 'IIB', 'IIB'],
    G3: ['IB', 'IIB', 'IIB', 'IIB', 'IIA', 'IIB', 'IIB', 'IIIA'],
  }),
  D: makeMatrix({
    G1: ['IB', 'IIIA', 'IIIA', 'IIIA', 'IB', 'IIIA', 'IIIA', 'IIIA'],
    G2: ['IB', 'IIIA', 'IIIA', 'IIIA', 'IB', 'IIIA', 'IIIA', 'IIIB'],
    G3: ['IIA', 'IIIA', 'IIIA', 'IIIA', 'IIB', 'IIIA', 'IIIA', 'IIIC'],
  }),
  E: makeMatrix({
    G1: ['IIIA', 'IIIB', 'IIIB', 'IIIB', 'IIIA', 'IIIB', 'IIIB', 'IIIB'],
    G2: ['IIIA', 'IIIB', 'IIIB', 'IIIB', 'IIIA', 'IIIB', 'IIIB', 'IIIC'],
    G3: ['IIIB', 'IIIB', 'IIIB', 'IIIB', 'IIIB', 'IIIC', 'IIIC', 'IIIC'],
  }),
};

export function calculateBreastCancerStage(input: StagingInput): StagingResult {
  const prefix = input.basis === 'clinical' ? 'c' : 'p';
  const anatomicStage = calculateAnatomicStage(input);
  const prognosticStage = calculatePrognosticStage(input);
  const notes = buildNotes(input, anatomicStage, prognosticStage);

  return {
    prefix,
    tnm: `${prefix}${input.tumor} ${prefix}${input.nodes} ${input.metastasis}`,
    anatomicStage,
    prognosticStage,
    subtype: getBiomarkerSubtype(input),
    notes,
  };
}

export function calculateAnatomicStage(input: Pick<StagingInput, 'tumor' | 'nodes' | 'metastasis'>): StageGroup {
  if (normalizeMetastasisCategory(input.metastasis) === 'M1') {
    return 'IV';
  }

  const tumorGroup = normalizeTumorCategory(input.tumor);
  const nodeGroup = normalizeNodeCategory(input.nodes);

  if (tumorGroup === 'Tis' && nodeGroup === 'N0') {
    return '0';
  }

  if (tumorGroup === 'Tis') {
    return 'Not applicable';
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

  if (tumorGroup === 'T0' || tumorGroup === 'T1') {
    return 'IA';
  }

  if (tumorGroup === 'T2') {
    return 'IIA';
  }

  return 'IIB';
}

export function calculatePrognosticStage(input: StagingInput): StageGroup {
  if (normalizeMetastasisCategory(input.metastasis) === 'M1') {
    return 'IV';
  }

  const tumorGroup = normalizeTumorForPrognosticStage(input.tumor, input.nodes);
  const nodeGroup = normalizeNodeCategory(input.nodes);

  if (tumorGroup === 'Tis' && nodeGroup === 'N0') {
    return '0';
  }

  const bucket = getPrognosticBucket(tumorGroup, nodeGroup);
  const matrix = input.basis === 'clinical' ? CLINICAL_PROGNOSTIC_STAGE : PATHOLOGIC_PROGNOSTIC_STAGE;
  const tableStage = matrix[bucket][input.grade][getBiomarkerKey(input)];

  if (qualifiesForLowRiskOncotypeModifier(input)) {
    return 'IA';
  }

  return tableStage;
}

export function getBiomarkerSubtype(input: Pick<StagingInput, 'er' | 'pr' | 'her2'>): string {
  const hormoneReceptorPositive = input.er === 'positive' || input.pr === 'positive';

  if (hormoneReceptorPositive && input.her2 === 'positive') {
    return 'HR+/HER2+';
  }

  if (hormoneReceptorPositive) {
    return 'HR+/HER2-';
  }

  if (input.her2 === 'positive') {
    return 'HER2-enriched pattern';
  }

  return 'Triple negative';
}

export function normalizeTumorCategory(tumor: TumorCategory): TumorGroup {
  if (tumor === 'T1a' || tumor === 'T1b' || tumor === 'T1c') {
    return 'T1';
  }

  if (tumor === 'T4a' || tumor === 'T4b' || tumor === 'T4c' || tumor === 'T4d') {
    return 'T4';
  }

  return tumor;
}

export function normalizeNodeCategory(nodes: NodeCategory): NodeGroup {
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

export function normalizeMetastasisCategory(metastasis: MetastasisCategory): 'M0' | 'M1' {
  return metastasis === 'M1' ? 'M1' : 'M0';
}

export function isValidOncotypeScore(score: OncotypeScore | undefined): score is number {
  return typeof score === 'number' && Number.isInteger(score) && score >= 0 && score <= 100;
}

export function qualifiesForLowRiskOncotypeModifier(input: StagingInput): boolean {
  if (!isValidOncotypeScore(input.oncotypeScore) || input.oncotypeScore >= LOW_RISK_ONCOTYPE_MAX_EXCLUSIVE) {
    return false;
  }

  const tumorGroup = normalizeTumorCategory(input.tumor);
  const hormoneReceptorPositive = input.er === 'positive' || input.pr === 'positive';

  return (
    input.basis === 'pathologic' &&
    (tumorGroup === 'T1' || tumorGroup === 'T2') &&
    normalizeNodeCategory(input.nodes) === 'N0' &&
    normalizeMetastasisCategory(input.metastasis) === 'M0' &&
    hormoneReceptorPositive &&
    input.her2 === 'negative'
  );
}

function getPrognosticBucket(tumorGroup: TumorGroup, nodeGroup: NodeGroup): PrognosticBucket {
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

  if (
    ((tumorGroup === 'T0' || tumorGroup === 'T1') && nodeGroup === 'N1') ||
    (tumorGroup === 'T2' && nodeGroup === 'N0')
  ) {
    return 'B';
  }

  return 'A';
}

function normalizeTumorForPrognosticStage(tumor: TumorCategory, nodes: NodeCategory): TumorGroup {
  const tumorGroup = normalizeTumorCategory(tumor);

  if (tumorGroup === 'Tis' && normalizeNodeCategory(nodes) !== 'N0') {
    return 'T0';
  }

  return tumorGroup;
}

function getBiomarkerKey(input: Pick<StagingInput, 'her2' | 'er' | 'pr'>): BiomarkerKey {
  return `${input.her2}|${input.er}|${input.pr}`;
}

function makeMatrix(rows: Record<Grade, StageGroup[]>): PrognosticMatrix {
  return {
    G1: makeBiomarkerStageMap(rows.G1),
    G2: makeBiomarkerStageMap(rows.G2),
    G3: makeBiomarkerStageMap(rows.G3),
  };
}

function makeBiomarkerStageMap(stages: StageGroup[]): Record<BiomarkerKey, StageGroup> {
  return BIOMARKER_KEYS.reduce<Record<BiomarkerKey, StageGroup>>(
    (map, key, index) => ({
      ...map,
      [key]: stages[index],
    }),
    {} as Record<BiomarkerKey, StageGroup>,
  );
}

function buildNotes(input: StagingInput, anatomicStage: StageGroup, prognosticStage: StageGroup): string[] {
  const notes = [
    'Educational prototype only; validate against current AJCC/NCCN source tables before clinical use.',
  ];

  if (normalizeMetastasisCategory(input.metastasis) === 'M1') {
    notes.push('Distant metastasis sets both stage groups to IV.');
  }

  if (input.metastasis === 'M0(i+)') {
    notes.push('M0(i+) is recorded separately but is staged using the T and N categories, not as stage IV.');
  }

  if (input.oncotypeScore != null && !isValidOncotypeScore(input.oncotypeScore)) {
    notes.push('Oncotype DX recurrence score must be an integer from 0 to 100; the score was not used.');
  }

  if (input.tumor === 'Tis' && normalizeNodeCategory(input.nodes) === 'N0') {
    notes.push('In situ disease with N0/M0 is grouped as stage 0.');
  }

  if (input.tumor === 'Tis' && normalizeNodeCategory(input.nodes) !== 'N0') {
    notes.push('Tis with nodal involvement has no anatomic stage group in this calculator; prognostic staging uses the nodal tumor information grouped with T0.');
  }

  if (anatomicStage !== prognosticStage) {
    notes.push('Prognostic stage was assigned from TNM, grade, ER, PR, HER2, and eligible prognostic modifiers.');
  }

  if (qualifiesForLowRiskOncotypeModifier(input)) {
    notes.push('Low-risk Oncotype DX recurrence score modified the pathologic prognostic stage to IA.');
  } else if (isValidOncotypeScore(input.oncotypeScore)) {
    notes.push('Oncotype DX recurrence score was entered but did not meet the criteria for a prognostic stage modifier.');
  }

  if (input.basis === 'clinical') {
    notes.push('Clinical staging uses pre-treatment examination, imaging, and biopsy information.');
  } else {
    notes.push('Pathologic staging uses surgical pathology information when available.');
  }

  return notes;
}
