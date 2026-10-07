import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { TabHeader } from '../../components/TabHeader';

// Tạm — Task 11 dựng màn thật.
export default function CoachRoster() {
  return (
    <Screen edges={['top']}>
      <TabHeader />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="users-line" title="Học viên" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
