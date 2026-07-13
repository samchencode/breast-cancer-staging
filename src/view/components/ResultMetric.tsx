import { Text, View } from 'react-native';

import { styles } from '../styles';

export type ResultMetricProps = {
  label: string;
  value: string;
};

export function ResultMetric({ label, value }: ResultMetricProps) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}
