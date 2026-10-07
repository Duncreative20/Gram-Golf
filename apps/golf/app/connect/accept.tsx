import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { StackHeader } from '../../components/StackHeader';

// Tạm — Task 10 dựng màn thật.
export default function AcceptInvite() {
  return (
    <Screen>
      <StackHeader title="Nhập mã mời" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="user-plus-line" title="Nhập mã mời" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
