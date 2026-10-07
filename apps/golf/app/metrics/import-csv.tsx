import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { StackHeader } from '../../components/StackHeader';

// Tạm — Task 7 dựng màn thật.
export default function MetricsImportCsv() {
  return (
    <Screen>
      <StackHeader title="Nhập file CSV" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="file-chart-line" title="Nhập file CSV" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
