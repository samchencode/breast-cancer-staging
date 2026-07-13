import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

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

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

const pwaInstallPromptDismissedKey = 'breastCancerStagingPwaInstallPromptDismissed';

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
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [isIosWebInstall, setIsIosWebInstall] = useState(false);
  const result = useMemo(() => calculateBreastCancerStage(input), [input]);
  const nodeOptions = nodeOptionsByBasis[input.basis];
  const isWeb = Platform.OS === 'web';
  const canInstallOnWeb = installPromptEvent != null || isIosWebInstall;

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const installed = isRunningAsInstalledPwa();
    const iosWebInstall = isIosWebBrowser();

    setIsPwaInstalled(installed);
    setIsIosWebInstall(iosWebInstall);

    if (iosWebInstall && !installed && !hasDismissedPwaInstallPrompt()) {
      setShowInstallPrompt(true);
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;

      setInstallPromptEvent(promptEvent);

      if (!hasDismissedPwaInstallPrompt()) {
        setShowInstallPrompt(true);
      }
    }

    function handleAppInstalled() {
      setInstallPromptEvent(null);
      setShowInstallPrompt(false);
      setIsPwaInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

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

  async function promptPwaInstall() {
    if (Platform.OS !== 'web') {
      return;
    }

    setShowInstallPrompt(false);

    if (isIosWebInstall) {
      setShowInstallInstructions(true);
      return;
    }

    if (!installPromptEvent) {
      return;
    }

    await installPromptEvent.prompt();

    try {
      const choice = await installPromptEvent.userChoice;

      if (choice.outcome === 'accepted') {
        setIsPwaInstalled(true);
      }
    } finally {
      setInstallPromptEvent(null);
    }
  }

  function dismissPwaInstallPrompt() {
    if (Platform.OS === 'web') {
      rememberPwaInstallPromptDismissed();
    }

    setShowInstallPrompt(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>Breast cancer staging</Text>
            <Text style={styles.title}>Stage calculator</Text>
          </View>
          {isWeb ? (
            <Pressable
              accessibilityRole="button"
              disabled={!canInstallOnWeb || isPwaInstalled}
              onPress={promptPwaInstall}
              style={[styles.installButton, (!canInstallOnWeb || isPwaInstalled) && styles.installButtonDisabled]}
            >
              <Text style={[styles.installButtonText, (!canInstallOnWeb || isPwaInstalled) && styles.installButtonTextDisabled]}>
                {isPwaInstalled ? 'Installed' : 'INSTALL'}
              </Text>
            </Pressable>
          ) : null}
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
      {isWeb ? (
        <InstallPromptModal
          visible={showInstallPrompt && canInstallOnWeb && !isPwaInstalled}
          primaryActionLabel={isIosWebInstall ? 'Show Steps' : 'Install'}
          onDismiss={dismissPwaInstallPrompt}
          onInstall={promptPwaInstall}
        />
      ) : null}
      {isWeb ? (
        <InstallInstructionsModal visible={showInstallInstructions} onClose={() => setShowInstallInstructions(false)} />
      ) : null}
    </SafeAreaView>
  );
}

function hasDismissedPwaInstallPrompt() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return true;
  }

  try {
    return window.localStorage.getItem(pwaInstallPromptDismissedKey) === 'true';
  } catch {
    return false;
  }
}

function rememberPwaInstallPromptDismissed() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(pwaInstallPromptDismissedKey, 'true');
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

function isRunningAsInstalledPwa() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return false;
  }

  const standaloneDisplayMode = typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = Boolean((window.navigator as NavigatorWithStandalone).standalone);

  return standaloneDisplayMode || iosStandalone;
}

function isIosWebBrowser() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return false;
  }

  const { maxTouchPoints, platform, userAgent } = window.navigator;
  const iosDevice = /iPad|iPhone|iPod/.test(userAgent);
  const ipadOsDesktopMode = platform === 'MacIntel' && maxTouchPoints > 1;

  return iosDevice || ipadOsDesktopMode;
}

type InstallPromptModalProps = {
  visible: boolean;
  primaryActionLabel: string;
  onDismiss: () => void;
  onInstall: () => void;
};

function InstallPromptModal({ visible, primaryActionLabel, onDismiss, onInstall }: InstallPromptModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onDismiss}>
      <View style={styles.installPromptBackdrop}>
        <View style={styles.installPromptCard}>
          <Text style={styles.installPromptTitle}>Install Web App</Text>
          <Text style={styles.installPromptText}>Add this calculator to your device for a standalone app window.</Text>
          <View style={styles.installPromptActions}>
            <Pressable accessibilityRole="button" onPress={onDismiss} style={styles.installPromptSecondaryButton}>
              <Text style={styles.installPromptSecondaryText}>Not now</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onInstall} style={styles.installPromptPrimaryButton}>
              <Text style={styles.installPromptPrimaryText}>{primaryActionLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

type InstallInstructionsModalProps = {
  visible: boolean;
  onClose: () => void;
};

function InstallInstructionsModal({ visible, onClose }: InstallInstructionsModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.installPromptBackdrop}>
        <View style={styles.installPromptCard}>
          <Text style={styles.installPromptTitle}>Install Web App</Text>
          <Text style={styles.installPromptText}>Open this page in Safari first if you are using another browser.</Text>
          <View style={styles.installStepList}>
            <InstallStep number="1">
              <Text style={styles.installStepText}>Tap the Share button</Text>
              <ShareIcon />
              <Text style={styles.installStepText}>in Safari.</Text>
            </InstallStep>
            <InstallStep number="2">
              <Text style={styles.installStepText}>If you only see the "..." menu, tap "..." first, then choose Share.</Text>
            </InstallStep>
            <InstallStep number="3">
              <Text style={styles.installStepText}>Scroll all the way down in the share menu.</Text>
            </InstallStep>
            <InstallStep number="4">
              <Text style={styles.installStepText}>Tap Add to Home Screen.</Text>
            </InstallStep>
            <InstallStep number="5">
              <Text style={styles.installStepText}>Tap Add in the top right.</Text>
            </InstallStep>
          </View>
          <View style={styles.installPromptActions}>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.installPromptPrimaryButton}>
              <Text style={styles.installPromptPrimaryText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

type InstallStepProps = {
  number: string;
  children: ReactNode;
};

function InstallStep({ number, children }: InstallStepProps) {
  return (
    <View style={styles.installStepRow}>
      <View style={styles.installStepNumber}>
        <Text style={styles.installStepNumberText}>{number}</Text>
      </View>
      <View style={styles.installStepContent}>{children}</View>
    </View>
  );
}

function ShareIcon() {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.shareIcon}>
      <View style={styles.shareIconBox} />
      <View style={styles.shareIconShaft} />
      <View style={[styles.shareIconHead, styles.shareIconHeadLeft]} />
      <View style={[styles.shareIconHead, styles.shareIconHeadRight]} />
    </View>
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
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  headerText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
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
  installButton: {
    alignItems: 'center',
    backgroundColor: '#784c61',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  installButtonDisabled: {
    backgroundColor: '#e8dfd7',
  },
  installButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  installButtonTextDisabled: {
    color: '#8a7c73',
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
  installPromptBackdrop: {
    backgroundColor: 'rgba(36, 28, 24, 0.36)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  installPromptCard: {
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#ded4cb',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    maxWidth: 420,
    padding: 18,
    width: '100%',
  },
  installPromptTitle: {
    color: '#241c18',
    fontSize: 22,
    fontWeight: '800',
  },
  installPromptText: {
    color: '#4e433d',
    fontSize: 14,
    lineHeight: 20,
  },
  installStepList: {
    gap: 10,
  },
  installStepRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  installStepNumber: {
    alignItems: 'center',
    backgroundColor: '#e8dfd7',
    borderRadius: 6,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  installStepNumberText: {
    color: '#4e433d',
    fontSize: 13,
    fontWeight: '800',
  },
  installStepContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    minWidth: 0,
    paddingTop: 1,
  },
  installStepText: {
    color: '#241c18',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  shareIcon: {
    height: 26,
    position: 'relative',
    width: 24,
  },
  shareIconBox: {
    borderColor: '#176cc4',
    borderRadius: 3,
    borderWidth: 2,
    bottom: 1,
    height: 16,
    left: 3,
    position: 'absolute',
    width: 18,
  },
  shareIconShaft: {
    backgroundColor: '#176cc4',
    height: 17,
    left: 11,
    position: 'absolute',
    top: 0,
    width: 2,
  },
  shareIconHead: {
    backgroundColor: '#176cc4',
    height: 10,
    position: 'absolute',
    top: 0,
    width: 2,
  },
  shareIconHeadLeft: {
    left: 8,
    transform: [{ rotate: '45deg' }],
  },
  shareIconHeadRight: {
    left: 14,
    transform: [{ rotate: '-45deg' }],
  },
  installPromptActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  installPromptSecondaryButton: {
    alignItems: 'center',
    borderColor: '#cbbdb3',
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 14,
  },
  installPromptSecondaryText: {
    color: '#4e433d',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  installPromptPrimaryButton: {
    alignItems: 'center',
    backgroundColor: '#784c61',
    borderRadius: 6,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 16,
  },
  installPromptPrimaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
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
