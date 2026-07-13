import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { getNodeDefinition, nodeOptionsByBasis, tnmDefinitions } from './src/domain/definitions';
import {
  BiomarkerStatus,
  calculateBreastCancerStage,
  Grade,
  MetastasisCategory,
  NodeCategory,
  OncotypeScore,
  StagingBasis,
  StagingInput,
  TumorCategory,
} from './src/domain/staging';

const tumorOptions: TumorCategory[] = ['Tis', 'T0', 'T1a', 'T1b', 'T1c', 'T2', 'T3', 'T4a', 'T4b', 'T4c', 'T4d'];
const metastasisOptions: MetastasisCategory[] = ['M0', 'M0(i+)', 'M1'];
const gradeOptions: Grade[] = ['G1', 'G2', 'G3'];
const biomarkerOptions: BiomarkerStatus[] = ['positive', 'negative'];
type PickerKey = 'tumor' | 'nodes' | 'metastasis';

const initialInput: StagingInput = {
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

export default function App() {
  const [input, setInput] = useState<StagingInput>(initialInput);
  const [openPicker, setOpenPicker] = useState<PickerKey | null>(null);
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

  function updateOncotypeScore(value: string) {
    const digitsOnly = value.replace(/\D/g, '');

    if (digitsOnly.length === 0) {
      update('oncotypeScore', null);
      return;
    }

    const score = Number(digitsOnly);

    if (score >= 0 && score <= 100) {
      update('oncotypeScore', score as OncotypeScore);
    }
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

          <SelectorField
            label="Tumor"
            value={input.tumor}
            description={tnmDefinitions.tumor[input.tumor]}
            onPress={() => setOpenPicker('tumor')}
          />

          <View style={styles.fieldRow}>
            <SelectorField
              label="Nodes"
              value={input.nodes}
              description={getNodeDefinition(input.basis, input.nodes)}
              onPress={() => setOpenPicker('nodes')}
              fill
            />
            <SelectorField
              label="Metastasis"
              value={input.metastasis}
              description={tnmDefinitions.metastasis[input.metastasis]}
              onPress={() => setOpenPicker('metastasis')}
              fill
            />
          </View>

          <OptionGroup label="Grade" options={gradeOptions} selected={input.grade} onSelect={(value) => update('grade', value as Grade)} />

          <View style={styles.biomarkers}>
            <BiomarkerToggle label="ER" value={input.er} onSelect={(value) => update('er', value)} />
            <BiomarkerToggle label="PR" value={input.pr} onSelect={(value) => update('pr', value)} />
            <BiomarkerToggle label="HER2" value={input.her2} onSelect={(value) => update('her2', value)} />
          </View>

          <OncotypeScoreInput value={input.oncotypeScore ?? null} onChange={updateOncotypeScore} onClear={() => update('oncotypeScore', null)} />
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

      <SelectorModal
        title="Tumor"
        visible={openPicker === 'tumor'}
        options={tumorOptions}
        selected={input.tumor}
        getDescription={(value) => tnmDefinitions.tumor[value]}
        onClose={() => setOpenPicker(null)}
        onSelect={(value) => {
          update('tumor', value);
          setOpenPicker(null);
        }}
      />
      <SelectorModal
        title="Nodes"
        visible={openPicker === 'nodes'}
        options={nodeOptions}
        selected={input.nodes}
        getDescription={(value) => getNodeDefinition(input.basis, value)}
        onClose={() => setOpenPicker(null)}
        onSelect={(value) => {
          update('nodes', value as NodeCategory);
          setOpenPicker(null);
        }}
      />
      <SelectorModal
        title="Metastasis"
        visible={openPicker === 'metastasis'}
        options={metastasisOptions}
        selected={input.metastasis}
        getDescription={(value) => tnmDefinitions.metastasis[value]}
        onClose={() => setOpenPicker(null)}
        onSelect={(value) => {
          update('metastasis', value);
          setOpenPicker(null);
        }}
      />
    </SafeAreaView>
  );
}

type OncotypeScoreInputProps = {
  value: OncotypeScore;
  onChange: (value: string) => void;
  onClear: () => void;
};

function OncotypeScoreInput({ value, onChange, onClear }: OncotypeScoreInputProps) {
  return (
    <View style={styles.oncotypeGroup}>
      <Text style={styles.fieldLabel}>Oncotype DX recurrence score</Text>
      <View style={styles.oncotypeInputRow}>
        <TextInput
          accessibilityLabel="Oncotype DX recurrence score"
          keyboardType="number-pad"
          maxLength={3}
          onChangeText={onChange}
          placeholder="Not tested"
          placeholderTextColor="#8a7c73"
          style={styles.oncotypeInput}
          value={value == null ? '' : String(value)}
        />
        <Pressable accessibilityRole="button" onPress={onClear} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </Pressable>
      </View>
      <Text style={styles.optionDescription}>
        Optional 0-100 modifier. Low-risk scores affect only eligible pathologic HR+/HER2- T1-T2 N0 M0 prognostic staging.
      </Text>
    </View>
  );
}

type SelectorFieldProps = {
  label: string;
  value: string;
  description: string;
  onPress: () => void;
  fill?: boolean;
};

function SelectorField({ label, value, description, onPress, fill }: SelectorFieldProps) {
  return (
    <View style={[styles.selectorGroup, fill && styles.selectorGroupFill]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.selectorField}>
        <View style={styles.selectorValueRow}>
          <Text style={styles.selectorValue}>{value}</Text>
          <Text style={styles.selectorAction}>Change</Text>
        </View>
        <Text style={styles.selectorDescription}>{description}</Text>
      </Pressable>
    </View>
  );
}

type SelectorModalProps<T extends string> = {
  title: string;
  visible: boolean;
  options: readonly T[];
  selected: T;
  getDescription: (value: T) => string;
  onClose: () => void;
  onSelect: (value: T) => void;
};

function SelectorModal<T extends string>({ title, visible, options, selected, getDescription, onClose, onSelect }: SelectorModalProps<T>) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalOptions}>
            {options.map((option) => {
              const active = selected === option;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  key={option}
                  onPress={() => onSelect(option)}
                  style={[styles.modalOption, active && styles.modalOptionActive]}
                >
                  <View style={styles.modalOptionHeader}>
                    <Text style={[styles.modalOptionValue, active && styles.modalOptionValueActive]}>{option}</Text>
                    {active ? <Text style={styles.modalSelectedText}>Selected</Text> : null}
                  </View>
                  <Text style={[styles.modalOptionDescription, active && styles.modalOptionDescriptionActive]}>{getDescription(option)}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
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
  selectorGroup: {
    gap: 8,
  },
  selectorGroupFill: {
    flex: 1,
    minWidth: 0,
  },
  selectorField: {
    backgroundColor: '#ffffff',
    borderColor: '#d8ccc2',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    minHeight: 92,
    padding: 12,
  },
  selectorValueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  selectorValue: {
    color: '#241c18',
    fontSize: 24,
    fontWeight: '800',
  },
  selectorAction: {
    color: '#784c61',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  selectorDescription: {
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
  oncotypeGroup: {
    gap: 8,
  },
  oncotypeInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  oncotypeInput: {
    backgroundColor: '#ffffff',
    borderColor: '#d8ccc2',
    borderRadius: 8,
    borderWidth: 1,
    color: '#241c18',
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  clearButton: {
    alignItems: 'center',
    backgroundColor: '#e8dfd7',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  clearButtonText: {
    color: '#4e433d',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
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
  modalBackdrop: {
    backgroundColor: 'rgba(36, 28, 24, 0.36)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#f6f3ef',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    maxHeight: '82%',
    padding: 18,
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#241c18',
    fontSize: 22,
    fontWeight: '800',
  },
  modalCloseButton: {
    borderColor: '#cbbdb3',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalCloseText: {
    color: '#4e433d',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOptions: {
    gap: 8,
    paddingBottom: 18,
  },
  modalOption: {
    backgroundColor: '#ffffff',
    borderColor: '#d8ccc2',
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 12,
  },
  modalOptionActive: {
    backgroundColor: '#784c61',
    borderColor: '#784c61',
  },
  modalOptionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  modalOptionValue: {
    color: '#241c18',
    fontSize: 20,
    fontWeight: '800',
  },
  modalOptionValueActive: {
    color: '#ffffff',
  },
  modalSelectedText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  modalOptionDescription: {
    color: '#6f5d51',
    fontSize: 13,
    lineHeight: 18,
  },
  modalOptionDescriptionActive: {
    color: '#f7ede7',
  },
});
