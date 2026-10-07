import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { StackHeader } from '../../components/StackHeader';

// Tạm — Task 13 dựng màn thật.
export default function UnitSettings() {
  return (
    <Screen>
      <StackHeader title="Đơn vị đo" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="sliders-01-line" title="Đơn vị đo" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
