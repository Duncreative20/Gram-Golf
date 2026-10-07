import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { StackHeader } from '../../components/StackHeader';

// Tạm — Task 13 dựng màn thật.
export default function AccountSettings() {
  return (
    <Screen>
      <StackHeader title="Tài khoản" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="user-circle-line" title="Tài khoản" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
