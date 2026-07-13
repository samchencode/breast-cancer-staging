import { Pressable, Text, TextInput, View } from 'react-native';

import type { OncotypeScore } from '../../domain/staging';
import { styles } from '../styles';

export type OncotypeScoreInputProps = {
  value: OncotypeScore | null;
  onChange: (value: string) => void;
  onClear: () => void;
};

export function OncotypeScoreInput({ value, onChange, onClear }: OncotypeScoreInputProps) {
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
