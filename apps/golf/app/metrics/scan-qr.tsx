import { View } from 'react-native';
import { EmptyState, Screen } from '@gr/ds';
import { StackHeader } from '../../components/StackHeader';

// Tạm — Task 7 dựng màn thật.
export default function MetricsScanQr() {
  return (
    <Screen>
      <StackHeader title="Quét QR" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState icon="scan-line" title="Quét QR" caption="Đang dựng" />
      </View>
    </Screen>
  );
}
