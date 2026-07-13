import { Pressable, Text } from 'react-native';

import { styles } from '../styles';

export type InstallButtonProps = {
  disabled: boolean;
  installed: boolean;
  onPress: () => void;
};

export function InstallButton({ disabled, installed, onPress }: InstallButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.installButton, disabled && styles.installButtonDisabled]}
    >
      <Text style={[styles.installButtonText, disabled && styles.installButtonTextDisabled]}>{installed ? 'Installed' : 'INSTALL'}</Text>
    </Pressable>
  );
}
