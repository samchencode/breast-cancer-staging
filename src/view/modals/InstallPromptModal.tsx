import { Modal, Pressable, Text, View } from 'react-native';

import { styles } from '../styles';

export type InstallPromptModalProps = {
  visible: boolean;
  primaryActionLabel: string;
  onDismiss: () => void;
  onInstall: () => void;
};

export function InstallPromptModal({ visible, primaryActionLabel, onDismiss, onInstall }: InstallPromptModalProps) {
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
