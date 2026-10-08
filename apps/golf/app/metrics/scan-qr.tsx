import { useEffect, useState } from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Button, Divider, Screen, Tag, Text, useTheme } from '@gr/ds';
import { useStore } from '../../lib/store';
import { SAMPLE_FILES } from '../../lib/simulate';
import { StackHeader } from '../../components/StackHeader';
import { AlertMessage } from '../../components/Feedback';

// ponytail: phiên mà mã QR giả lập trỏ tới = file TrackMan mẫu — bản thật lấy mã phiên từ QR rồi tải dữ liệu từ đối tác
const LINKED_FILE = SAMPLE_FILES.find((f) => f.vendor === 'trackman')!.name;

/** Quét QR ở sân tập (thử nghiệm): khung camera giả lập → đọc được mã → liên kết phiên (giả lập 1 s) → nhập dữ liệu phiên
 *  qua màn CSV. Mã không đọc được / không phải mã phiên → báo lỗi + quét lại. */
export default function MetricsScanQr() {
  const t = useTheme();
  const { me } = useStore();
  const [result, setResult] = useState<'linking' | 'linked' | 'invalid'>();
  useEffect(() => {
    if (result !== 'linking') return;
    const timer = setTimeout(() => setResult('linked'), 1000);
    return () => clearTimeout(timer);
  }, [result]);
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
        {result === 'linking' && <AlertMessage theme="Info" text="Đã đọc mã — đang liên kết phiên với sân tập…" />}
        {result === 'linked' && <AlertMessage theme="Positive" text="Đã liên kết phiên TrackMan #A1F3" />}
        {result === 'invalid' && <AlertMessage theme="Negative" text="Không đọc được mã — mã mờ hoặc không phải mã phiên của sân tập. Căn mã vào giữa khung rồi quét lại." />}
      </ScrollView>
      <Divider />
      <View style={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Small') }}>
        {result === 'linked' ? (
          // thay màn QR → "quay lại"/lưu xong ở màn CSV về đúng màn đã mở nguồn nhập
          <Button leadingIcon="file-chart-line" text="Nhập dữ liệu phiên" onPress={() => router.replace({ pathname: '/metrics/import-csv', params: { file: LINKED_FILE } })} />
        ) : result === 'linking' ? (
          <Button leadingIcon="scan-line" text="Đang liên kết phiên…" disabled />
        ) : result === 'invalid' ? (
          <Button leadingIcon="refresh-cw-01-line" text="Quét lại" onPress={() => setResult(undefined)} />
        ) : (
          <>
            <Button leadingIcon="scan-line" text="Mô phỏng quét thành công" onPress={() => setResult('linking')} />
            <Button level="Tertiary" text="Mô phỏng mã không đọc được" onPress={() => setResult('invalid')} />
          </>
        )}
      </View>
    </Screen>
  );
}
