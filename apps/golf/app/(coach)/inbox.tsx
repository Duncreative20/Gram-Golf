import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { TabHeader } from '../../components/TabHeader';

// Tạm — Task 13 dựng màn thật.
export default function CoachInbox() {
  return (
    <Screen edges={['top']}>
      <TabHeader title="Thông báo" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="bell-01-line" title="Thông báo" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
