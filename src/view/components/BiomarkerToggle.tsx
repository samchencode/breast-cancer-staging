import { Pressable, Text, View } from 'react-native';

import type { BiomarkerStatus } from '../../domain/staging';
import { styles } from '../styles';
import { biomarkerOptions, formatBiomarkerStatusLabel } from './formOptions';

export type BiomarkerToggleProps = {
  label: string;
  value: BiomarkerStatus;
  onSelect: (value: BiomarkerStatus) => void;
};

export function BiomarkerToggle({ label, value, onSelect }: BiomarkerToggleProps) {
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
              <Text style={[styles.optionText, active && styles.optionTextActive]}>{formatBiomarkerStatusLabel(option)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
