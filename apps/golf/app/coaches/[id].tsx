import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { StackHeader } from '../../components/StackHeader';

// Tạm — Task 10 dựng màn thật.
export default function CoachPublicProfile() {
  return (
    <Screen>
      <StackHeader title="Hồ sơ HLV" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="user-check-line" title="Hồ sơ HLV" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
