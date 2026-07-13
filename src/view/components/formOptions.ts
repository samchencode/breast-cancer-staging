import type { BiomarkerStatus, Grade, MetastasisCategory, StagingBasis, TumorCategory } from '../../domain/staging';

export const stagingBasisOptions: StagingBasis[] = ['clinical', 'pathologic'];
export const tumorOptions: TumorCategory[] = ['Tis', 'T0', 'T1a', 'T1b', 'T1c', 'T2', 'T3', 'T4a', 'T4b', 'T4c', 'T4d'];
export const metastasisOptions: MetastasisCategory[] = ['M0', 'M0(i+)', 'M1'];
export const gradeOptions: Grade[] = ['G1', 'G2', 'G3'];
export const biomarkerOptions: BiomarkerStatus[] = ['positive', 'negative'];

export function formatStagingBasisLabel(value: StagingBasis) {
  return value === 'clinical' ? 'Clinical' : 'Pathologic';
}

export function formatBiomarkerStatusLabel(value: BiomarkerStatus) {
  return value === 'positive' ? '+' : '-';
}

export function shouldWrapOptionButtons(optionCount: number) {
  return optionCount > 4;
}
