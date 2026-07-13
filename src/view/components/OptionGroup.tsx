import { Pressable, Text, View } from 'react-native';

import { styles } from '../styles';
import { shouldWrapOptionButtons } from './formOptions';

export type OptionGroupProps<T extends string> = {
  label: string;
  options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
  formatLabel?: (value: T) => string;
  description?: string;
};

export function OptionGroup<T extends string>({ label, options, selected, onSelect, formatLabel, description }: OptionGroupProps<T>) {
  const wrapOptions = shouldWrapOptionButtons(options.length);

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
              style={[styles.optionButton, wrapOptions && styles.optionButtonWrapped, active && styles.optionButtonActive]}
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
