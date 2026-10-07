import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { TabHeader } from '../../components/TabHeader';

// Tạm — Task 10 dựng màn thật.
export default function PlayerCoach() {
  return (
    <Screen edges={['top']}>
      <TabHeader title="HLV" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="user-check-line" title="HLV" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
