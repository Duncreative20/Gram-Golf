import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { StackHeader } from '../components/StackHeader';

// Tạm — Task 13 dựng màn thật.
export default function Notifications() {
  return (
    <Screen>
      <StackHeader title="Thông báo" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="bell-01-line" title="Thông báo" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
