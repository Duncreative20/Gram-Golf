import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { TabHeader } from '../../components/TabHeader';

// Tạm — Task 9 dựng màn thật.
export default function PlayerSwings() {
  return (
    <Screen edges={['top']}>
      <TabHeader title="Swing" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="video-recorder-line" title="Swing" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
