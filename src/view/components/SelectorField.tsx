import { Pressable, Text, View } from 'react-native';

import { styles } from '../styles';

export type SelectorFieldProps = {
  label: string;
  value: string;
  description: string;
  onPress: () => void;
  fill?: boolean;
};

export function SelectorField({ label, value, description, onPress, fill }: SelectorFieldProps) {
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
