import type { ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { styles } from '../styles';
import { installInstructionIntro, installInstructionSteps, type InstallInstructionSegment } from './installInstructions';

export type InstallInstructionsModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function InstallInstructionsModal({ visible, onClose }: InstallInstructionsModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.installPromptBackdrop}>
        <View style={styles.installPromptCard}>
          <Text style={styles.installPromptTitle}>Install Web App</Text>
          <Text style={styles.installPromptText}>{installInstructionIntro}</Text>
          <View style={styles.installStepList}>
            {installInstructionSteps.map((step) => (
              <InstallStep key={step.number} number={step.number}>
                {step.segments.map((segment, segmentIndex) => renderInstallInstructionSegment(segment, step.number + '-' + segmentIndex))}
              </InstallStep>
            ))}
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

function renderInstallInstructionSegment(segment: InstallInstructionSegment, key: string) {
  if (segment.type === 'shareIcon') {
    return <ShareIcon key={key} />;
  }

  return (
    <Text key={key} style={styles.installStepText}>
      {segment.text}
    </Text>
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
