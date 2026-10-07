import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { TabHeader } from '../../components/TabHeader';

// Tạm — Task 6 dựng màn thật.
export default function PlayerMetrics() {
  return (
    <Screen edges={['top']}>
      <TabHeader title="Thông số" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="bar-chart-square-02-line" title="Thông số" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
