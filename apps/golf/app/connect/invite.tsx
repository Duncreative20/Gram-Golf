import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { StackHeader } from '../../components/StackHeader';

// Tạm — Task 10 dựng màn thật.
export default function CreateInvite() {
  return (
    <Screen>
      <StackHeader title="Mời học viên" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="user-plus-line" title="Mời học viên" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
