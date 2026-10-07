import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { TabHeader } from '../../components/TabHeader';

// Tạm — Task 5 dựng màn thật.
export default function PlayerHome() {
  return (
    <Screen edges={['top']}>
      <TabHeader />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="home-02-line" title="Tổng quan" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
