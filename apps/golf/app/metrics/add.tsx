import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { StackHeader } from '../../components/StackHeader';

// Tạm — Task 6 dựng màn thật.
export default function MetricsAdd() {
  return (
    <Screen>
      <StackHeader title="Nhập số liệu" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="plus-circle-line" title="Nhập số liệu" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
