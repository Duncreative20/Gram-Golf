import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { StackHeader } from '../../components/StackHeader';

// Tạm — Task 8 dựng màn thật.
export default function Clubs() {
  return (
    <Screen>
      <StackHeader title="Bộ gậy" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="flag-01-line" title="Bộ gậy" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
