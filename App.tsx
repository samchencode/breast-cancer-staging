import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getNodeDefinition, nodeOptionsByBasis, tnmDefinitions } from './src/domain/definitions';
import {
  BiomarkerStatus,
  calculateBreastCancerStage,
  Grade,
  MetastasisCategory,
  NodeCategory,
  StagingBasis,
  StagingInput,
  TumorCategory,
} from './src/domain/staging';

const tumorOptions: TumorCategory[] = ['Tis', 'T0', 'T1a', 'T1b', 'T1c', 'T2', 'T3', 'T4a', 'T4b', 'T4c', 'T4d'];
const metastasisOptions: MetastasisCategory[] = ['M0', 'M1'];
const gradeOptions: Grade[] = ['G1', 'G2', 'G3'];
const biomarkerOptions: BiomarkerStatus[] = ['positive', 'negative'];

const initialInput: StagingInput = {
  basis: 'clinical',
  tumor: 'T1c',
  nodes: 'N0',
  metastasis: 'M0',
  grade: 'G2',
  er: 'positive',
  pr: 'positive',
  her2: 'negative',
};

export default function App() {
  const [input, setInput] = useState<StagingInput>(initialInput);
  const result = useMemo(() => calculateBreastCancerStage(input), [input]);
  const nodeOptions = nodeOptionsByBasis[input.basis];

  function update<K extends keyof StagingInput>(key: K, value: StagingInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function updateBasis(value: StagingBasis) {
    setInput((current) => ({
      ...current,
      basis: value,
      nodes: 'N0',
    }));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Breast cancer staging</Text>
          <Text style={styles.title}>Stage calculator</Text>
        </View>

        <View style={styles.resultPanel}>
          <ResultMetric label="TNM" value={result.tnm} />
          <View style={styles.resultGrid}>
            <ResultMetric label="Anatomic stage" value={result.anatomicStage} />
            <ResultMetric label="Prognostic stage" value={result.prognosticStage} />
          </View>
          <Text style={styles.subtype}>{result.subtype}</Text>
        </View>

        <View style={styles.form}>
          <OptionGroup
            label="Staging basis"
            options={['clinical', 'pathologic']}
            selected={input.basis}
            onSelect={(value) => updateBasis(value as StagingBasis)}
            formatLabel={(value) => (value === 'clinical' ? 'Clinical' : 'Pathologic')}
          />

          <OptionGroup
            label="Tumor"
            options={tumorOptions}
            selected={input.tumor}
            onSelect={(value) => update('tumor', value as TumorCategory)}
            description={tnmDefinitions.tumor[input.tumor]}
          />

          <View style={styles.fieldRow}>
            <OptionGroup
              label="Nodes"
              options={nodeOptions}
              selected={input.nodes}
              onSelect={(value) => update('nodes', value as NodeCategory)}
              description={getNodeDefinition(input.basis, input.nodes)}
            />
            <OptionGroup
              label="Metastasis"
              options={metastasisOptions}
              selected={input.metastasis}
              onSelect={(value) => update('metastasis', value as MetastasisCategory)}
              description={tnmDefinitions.metastasis[input.metastasis]}
            />
          </View>

          <OptionGroup label="Grade" options={gradeOptions} selected={input.grade} onSelect={(value) => update('grade', value as Grade)} />

          <View style={styles.biomarkers}>
            <BiomarkerToggle label="ER" value={input.er} onSelect={(value) => update('er', value)} />
            <BiomarkerToggle label="PR" value={input.pr} onSelect={(value) => update('pr', value)} />
            <BiomarkerToggle label="HER2" value={input.her2} onSelect={(value) => update('her2', value)} />
          </View>
        </View>

        <View style={styles.notesPanel}>
          <Text style={styles.notesTitle}>Interpretation notes</Text>
          {result.notes.map((note) => (
            <Text key={note} style={styles.note}>
              {note}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type OptionGroupProps<T extends string> = {
  label: string;
  options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
  formatLabel?: (value: T) => string;
  description?: string;
};

function OptionGroup<T extends string>({ label, options, selected, onSelect, formatLabel, description }: OptionGroupProps<T>) {
  return (
    <View style={styles.optionGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.segmentedControl}>
        {options.map((option) => {
          const active = selected === option;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={option}
              onPress={() => onSelect(option)}
              style={[styles.optionButton, options.length > 4 && styles.optionButtonWrapped, active && styles.optionButtonActive]}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>{formatLabel ? formatLabel(option) : option}</Text>
            </Pressable>
          );
        })}
      </View>
      {description ? <Text style={styles.optionDescription}>{description}</Text> : null}
    </View>
  );
}

type BiomarkerToggleProps = {
  label: string;
  value: BiomarkerStatus;
  onSelect: (value: BiomarkerStatus) => void;
};

function BiomarkerToggle({ label, value, onSelect }: BiomarkerToggleProps) {
  return (
    <View style={styles.biomarkerToggle}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.segmentedControl}>
        {biomarkerOptions.map((option) => {
          const active = value === option;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={option}
              onPress={() => onSelect(option)}
              style={[styles.optionButton, active && styles.optionButtonActive]}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>{option === 'positive' ? '+' : '-'}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f3ef',
  },
  screen: {
    gap: 18,
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    gap: 4,
    paddingTop: 8,
  },
  eyebrow: {
    color: '#6f5d51',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: '#241c18',
    fontSize: 34,
    fontWeight: '800',
  },
  resultPanel: {
    backgroundColor: '#ffffff',
    borderColor: '#ded4cb',
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 18,
  },
  resultGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metric: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  metricLabel: {
    color: '#6f5d51',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: '#241c18',
    fontSize: 30,
    fontWeight: '800',
  },
  subtype: {
    alignSelf: 'flex-start',
    backgroundColor: '#e9f2ef',
    borderRadius: 6,
    color: '#183d35',
    fontSize: 15,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  form: {
    gap: 18,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionGroup: {
    flex: 1,
    gap: 8,
  },
  fieldLabel: {
    color: '#3a312d',
    fontSize: 14,
    fontWeight: '700',
  },
  segmentedControl: {
    backgroundColor: '#e8dfd7',
    borderRadius: 8,
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: 4,
    padding: 4,
  },
  optionButton: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  optionButtonWrapped: {
    flexBasis: 52,
  },
  optionButtonActive: {
    backgroundColor: '#784c61',
  },
  optionText: {
    color: '#4e433d',
    fontSize: 14,
    fontWeight: '700',
  },
  optionTextActive: {
    color: '#ffffff',
  },
  optionDescription: {
    color: '#6f5d51',
    fontSize: 12,
    lineHeight: 17,
  },
  biomarkers: {
    flexDirection: 'row',
    gap: 12,
  },
  biomarkerToggle: {
    flex: 1,
    gap: 8,
  },
  notesPanel: {
    backgroundColor: '#fff8df',
    borderColor: '#e2ca83',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  notesTitle: {
    color: '#3c2c11',
    fontSize: 16,
    fontWeight: '800',
  },
  note: {
    color: '#4b3b20',
    fontSize: 14,
    lineHeight: 20,
  },
});
