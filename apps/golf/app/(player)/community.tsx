import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { TabHeader } from '../../components/TabHeader';

// Tạm — Task 12 dựng màn thật.
export default function PlayerCommunity() {
  return (
    <Screen edges={['top']}>
      <TabHeader title="Cộng đồng" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="message-chat-circle-line" title="Cộng đồng" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
