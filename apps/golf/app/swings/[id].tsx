import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { StackHeader } from '../../components/StackHeader';

// Tạm — Task 9 dựng màn thật.
export default function SwingDetail() {
  return (
    <Screen>
      <StackHeader title="Chi tiết swing" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="video-recorder-line" title="Chi tiết swing" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
