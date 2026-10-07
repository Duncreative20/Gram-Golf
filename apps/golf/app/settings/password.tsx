import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { StackHeader } from '../../components/StackHeader';

// Tạm — Task 13 dựng màn thật.
export default function PasswordSettings() {
  return (
    <Screen>
      <StackHeader title="Mật khẩu" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="lock-01-line" title="Mật khẩu" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
