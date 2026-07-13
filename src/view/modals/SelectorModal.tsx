import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { styles } from '../styles';

export type SelectorModalProps<T extends string> = {
  title: string;
  visible: boolean;
  options: readonly T[];
  selected: T;
  getDescription: (value: T) => string;
  onClose: () => void;
  onSelect: (value: T) => void;
};

export function SelectorModal<T extends string>({ title, visible, options, selected, getDescription, onClose, onSelect }: SelectorModalProps<T>) {
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
