import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { StackHeader } from '../../components/StackHeader';

// Tạm — Task 7 dựng màn thật.
export default function MetricsImportPhoto() {
  return (
    <Screen>
      <StackHeader title="Ảnh chụp màn hình" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="image-line" title="Ảnh chụp màn hình" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
