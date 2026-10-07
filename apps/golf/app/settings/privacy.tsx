import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { StackHeader } from '../../components/StackHeader';

// Tạm — Task 13 dựng màn thật.
export default function PrivacySettings() {
  return (
    <Screen>
      <StackHeader title="Quyền riêng tư" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="shield-line" title="Quyền riêng tư" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
