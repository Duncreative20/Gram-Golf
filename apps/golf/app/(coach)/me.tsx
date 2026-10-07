import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { TabHeader } from '../../components/TabHeader';

// Tạm — Task 11 dựng màn thật.
export default function CoachMe() {
  return (
    <Screen edges={['top']}>
      <TabHeader title="Hồ sơ" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="user-circle-line" title="Hồ sơ" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
