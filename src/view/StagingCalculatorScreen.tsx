import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

import { BiomarkerToggle } from './components/BiomarkerToggle';
import { InstallButton } from './components/InstallButton';
import { OncotypeScoreInput } from './components/OncotypeScoreInput';
import { OptionGroup } from './components/OptionGroup';
import { ResultMetric } from './components/ResultMetric';
import { SelectorField } from './components/SelectorField';
import {
  formatStagingBasisLabel,
  gradeOptions,
  metastasisOptions,
  stagingBasisOptions,
  tumorOptions,
} from './components/formOptions';
import { getNodeDefinition, tnmDefinitions } from '../domain/definitions';
import type { Grade, StagingBasis } from '../domain/staging';
import { usePwaInstallPrompt } from './hooks/usePwaInstallPrompt';
import { useStagingCalculator } from './hooks/useStagingCalculator';
import { InstallInstructionsModal } from './modals/InstallInstructionsModal';
import { InstallPromptModal } from './modals/InstallPromptModal';
import { SelectorModal } from './modals/SelectorModal';
import { styles } from './styles';

export function StagingCalculatorScreen() {
  const calculator = useStagingCalculator();
  const install = usePwaInstallPrompt();
  const installButtonDisabled = !install.canInstallOnWeb || install.isPwaInstalled;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>Breast cancer staging</Text>
            <Text style={styles.title}>Stage calculator</Text>
          </View>
          {install.isWeb ? (
            <InstallButton disabled={installButtonDisabled} installed={install.isPwaInstalled} onPress={install.promptPwaInstall} />
          ) : null}
        </View>

        <View style={styles.resultPanel}>
          <ResultMetric label="TNM" value={calculator.result.tnm} />
          <View style={styles.resultGrid}>
            <ResultMetric label="Anatomic stage" value={calculator.result.anatomicStage} />
            <ResultMetric label="Prognostic stage" value={calculator.result.prognosticStage} />
          </View>
          <Text style={styles.subtype}>{calculator.result.subtype}</Text>
        </View>

        <View style={styles.form}>
          <OptionGroup
            label="Staging basis"
            options={stagingBasisOptions}
            selected={calculator.input.basis}
            onSelect={(value) => calculator.updateBasis(value as StagingBasis)}
            formatLabel={formatStagingBasisLabel}
          />

          <SelectorField
            label="Tumor"
            value={calculator.input.tumor}
            description={tnmDefinitions.tumor[calculator.input.tumor]}
            onPress={() => calculator.setOpenPicker('tumor')}
          />

          <View style={styles.fieldRow}>
            <SelectorField
              label="Nodes"
              value={calculator.input.nodes}
              description={getNodeDefinition(calculator.input.basis, calculator.input.nodes)}
              onPress={() => calculator.setOpenPicker('nodes')}
              fill
            />
            <SelectorField
              label="Metastasis"
              value={calculator.input.metastasis}
              description={tnmDefinitions.metastasis[calculator.input.metastasis]}
              onPress={() => calculator.setOpenPicker('metastasis')}
              fill
            />
          </View>

          <OptionGroup
            label="Grade"
            options={gradeOptions}
            selected={calculator.input.grade}
            onSelect={(value) => calculator.updateInput('grade', value as Grade)}
          />

          <View style={styles.biomarkers}>
            <BiomarkerToggle label="ER" value={calculator.input.er} onSelect={(value) => calculator.updateInput('er', value)} />
            <BiomarkerToggle label="PR" value={calculator.input.pr} onSelect={(value) => calculator.updateInput('pr', value)} />
            <BiomarkerToggle label="HER2" value={calculator.input.her2} onSelect={(value) => calculator.updateInput('her2', value)} />
          </View>

          <OncotypeScoreInput
            value={calculator.input.oncotypeScore ?? null}
            onChange={calculator.updateOncotypeScore}
            onClear={calculator.clearOncotypeScore}
          />
        </View>

        <View style={styles.notesPanel}>
          <Text style={styles.notesTitle}>Interpretation notes</Text>
          {calculator.result.notes.map((note) => (
            <Text key={note} style={styles.note}>
              {note}
            </Text>
          ))}
        </View>
      </ScrollView>

      <SelectorModal
        title="Tumor"
        visible={calculator.openPicker === 'tumor'}
        options={tumorOptions}
        selected={calculator.input.tumor}
        getDescription={(value) => tnmDefinitions.tumor[value]}
        onClose={calculator.closePicker}
        onSelect={calculator.selectTumor}
      />
      <SelectorModal
        title="Nodes"
        visible={calculator.openPicker === 'nodes'}
        options={calculator.nodeOptions}
        selected={calculator.input.nodes}
        getDescription={(value) => getNodeDefinition(calculator.input.basis, value)}
        onClose={calculator.closePicker}
        onSelect={calculator.selectNodes}
      />
      <SelectorModal
        title="Metastasis"
        visible={calculator.openPicker === 'metastasis'}
        options={metastasisOptions}
        selected={calculator.input.metastasis}
        getDescription={(value) => tnmDefinitions.metastasis[value]}
        onClose={calculator.closePicker}
        onSelect={calculator.selectMetastasis}
      />
      {install.isWeb ? (
        <InstallPromptModal
          visible={install.showInstallPrompt && install.canInstallOnWeb && !install.isPwaInstalled}
          primaryActionLabel={install.installPromptPrimaryActionLabel}
          onDismiss={install.dismissPwaInstallPrompt}
          onInstall={install.promptPwaInstall}
        />
      ) : null}
      {install.isWeb ? <InstallInstructionsModal visible={install.showInstallInstructions} onClose={install.closeInstallInstructions} /> : null}
    </SafeAreaView>
  );
}
