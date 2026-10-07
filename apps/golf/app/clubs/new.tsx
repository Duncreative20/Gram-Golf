import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { StackHeader } from '../../components/StackHeader';

// Tạm — Task 8 dựng màn thật.
export default function ClubNew() {
  return (
    <Screen>
      <StackHeader title="Thêm gậy" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="plus-circle-line" title="Thêm gậy" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
