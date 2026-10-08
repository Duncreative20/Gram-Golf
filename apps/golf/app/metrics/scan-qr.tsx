import { useState } from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Button, Divider, Screen, Tag, Text, useTheme } from '@gr/ds';
import { useStore } from '../../lib/store';
import { SAMPLE_FILES } from '../../lib/simulate';
import { StackHeader } from '../../components/StackHeader';
import { AlertMessage } from '../../components/Feedback';

// ponytail: phiên mà mã QR giả lập trỏ tới = file TrackMan mẫu — bản thật lấy mã phiên từ QR rồi tải dữ liệu từ đối tác
const LINKED_FILE = SAMPLE_FILES.find((f) => f.vendor === 'trackman')!.name;

/** Quét QR ở sân tập (thử nghiệm): khung camera giả lập → "đã liên kết phiên" → nhập dữ liệu phiên qua màn CSV. */
export default function MetricsScanQr() {
  const t = useTheme();
  const { me } = useStore();
  const [linked, setLinked] = useState(false);
  if (me?.role !== 'player') return <Redirect href="/" />;
  const accent = t.color('Color/Border/Accent/Solid/Default');
  const corner = t.size('Element-Size/Popular/Large');
  const w = t.size('Element-Size/Popular/4XSmall');
  const corners: ViewStyle[] = [
    { top: 0, left: 0, borderTopWidth: w, borderLeftWidth: w },
    { top: 0, right: 0, borderTopWidth: w, borderRightWidth: w },
    { bottom: 0, left: 0, borderBottomWidth: w, borderLeftWidth: w },
    { bottom: 0, right: 0, borderBottomWidth: w, borderRightWidth: w },
  ];
  return (
    <Screen>
      <StackHeader title="Quét QR" />
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Tag size="Small" text="Thử nghiệm" />
        {/* khung camera giả lập: nền tối ở cả 2 chế độ màu, 4 góc khung ngắm + dòng quét */}
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel="Khung camera giả lập"
          style={{ aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: t.radius('Corner-Radius/2XLarge'), backgroundColor: t.color('Color/Background/Black-Overlay/Pressed') }}
        >
          <View style={{ width: '60%', aspectRatio: 1, justifyContent: 'center' }}>
            {corners.map((c, i) => (
              <View key={i} style={[{ position: 'absolute', width: corner, height: corner, borderColor: accent }, c]} />
            ))}
            <View style={{ height: t.weight('Emphasis/Border-Weight/Active'), marginHorizontal: t.space('Spacing/Gap/XSmall'), backgroundColor: accent }} />
          </View>
        </View>
        <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Base">
          QR của sân tập dùng để liên kết phiên — đang chờ xác nhận định dạng với đối tác
        </Text>
        {linked && <AlertMessage theme="Positive" text="Đã liên kết phiên TrackMan #A1F3" />}
      </ScrollView>
      <Divider />
      <View style={{ padding: t.layout('Margin-Small') }}>
        {linked ? (
          // thay màn QR → "quay lại"/lưu xong ở màn CSV về đúng màn đã mở nguồn nhập
          <Button leadingIcon="file-chart-line" text="Nhập dữ liệu phiên" onPress={() => router.replace({ pathname: '/metrics/import-csv', params: { file: LINKED_FILE } })} />
        ) : (
          <Button leadingIcon="scan-line" text="Mô phỏng quét thành công" onPress={() => setLinked(true)} />
        )}
      </View>
    </Screen>
  );
}
