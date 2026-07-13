import { useMemo, useState } from 'react';

import { nodeOptionsByBasis } from '../../domain/definitions';
import {
  calculateBreastCancerStage,
  type MetastasisCategory,
  type NodeCategory,
  type OncotypeScore,
  type StagingBasis,
  type StagingInput,
  type TumorCategory,
} from '../../domain/staging';

export type PickerKey = 'tumor' | 'nodes' | 'metastasis';

export const initialStagingInput: StagingInput = {
  basis: 'clinical',
  tumor: 'T1c',
  nodes: 'N0',
  metastasis: 'M0',
  grade: 'G2',
  er: 'positive',
  pr: 'positive',
  her2: 'negative',
  oncotypeScore: null,
};

export function updateStagingInput<K extends keyof StagingInput>(current: StagingInput, key: K, value: StagingInput[K]) {
  return { ...current, [key]: value };
}

export function updateStagingBasis(current: StagingInput, basis: StagingBasis): StagingInput {
  return {
    ...current,
    basis,
    nodes: 'N0',
  };
}

export function parseOncotypeScoreText(value: string): OncotypeScore | null | undefined {
  const digitsOnly = value.replace(/\D/g, '');

  if (digitsOnly.length === 0) {
    return null;
  }

  const score = Number(digitsOnly);

  if (score >= 0 && score <= 100) {
    return score as OncotypeScore;
  }

  return undefined;
}

export function useStagingCalculator() {
  const [input, setInput] = useState<StagingInput>(initialStagingInput);
  const [openPicker, setOpenPicker] = useState<PickerKey | null>(null);
  const result = useMemo(() => calculateBreastCancerStage(input), [input]);
  const nodeOptions = nodeOptionsByBasis[input.basis];

  function updateInput<K extends keyof StagingInput>(key: K, value: StagingInput[K]) {
    setInput((current) => updateStagingInput(current, key, value));
  }

  function updateBasis(value: StagingBasis) {
    setInput((current) => updateStagingBasis(current, value));
  }

  function updateOncotypeScore(value: string) {
    const nextScore = parseOncotypeScoreText(value);

    if (nextScore !== undefined) {
      updateInput('oncotypeScore', nextScore);
    }
  }

  function clearOncotypeScore() {
    updateInput('oncotypeScore', null);
  }

  function closePicker() {
    setOpenPicker(null);
  }

  function selectTumor(value: TumorCategory) {
    updateInput('tumor', value);
    closePicker();
  }

  function selectNodes(value: NodeCategory) {
    updateInput('nodes', value);
    closePicker();
  }

  function selectMetastasis(value: MetastasisCategory) {
    updateInput('metastasis', value);
    closePicker();
  }

  return {
    input,
    result,
    nodeOptions,
    openPicker,
    setOpenPicker,
    closePicker,
    updateInput,
    updateBasis,
    updateOncotypeScore,
    clearOncotypeScore,
    selectTumor,
    selectNodes,
    selectMetastasis,
  };
}
