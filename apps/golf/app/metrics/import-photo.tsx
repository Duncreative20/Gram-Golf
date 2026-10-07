import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Redirect } from 'expo-router';
import { AlertBanner, Button, Divider, Icon, InlineMessage, Screen, Segmented, Stepper, Text, useTheme } from '@gr/ds';
import { VENDOR_LABELS, type ID, type Vendor } from '../../lib/domain';
import { NOW } from '../../lib/mock';
import { newId } from '../../lib/ids';
import { useStore } from '../../lib/store';
import { prefsOf } from '../../lib/selectors';
import { formatDate } from '../../lib/format';
import { mockOcr, ocrPrefill } from '../../lib/simulate';
import { validateSwingMetrics } from '../../lib/validation';
import { StackHeader } from '../../components/StackHeader';
import { ClubPicker } from '../../components/ClubPicker';
import { SwingMetricsForm } from '../../components/SwingMetricsForm';
import { AlertMessage, SavedToast } from '../../components/SessionEntry';

const VENDORS: Vendor[] = ['trackman', 'foresight'];
const STEPS = [{ title: 'Chọn hãng' }, { title: 'Đọc số liệu' }, { title: 'Kiểm tra' }];

/** Nhập từ ảnh chụp màn hình máy đo: chọn hãng + khung hướng dẫn → đọc (OCR giả lập 1,5 s, huỷ được) → kiểm tra từng trường → lưu. */
export default function MetricsImportPhoto() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  const [vendorIndex, setVendorIndex] = useState(0);
  const [reading, setReading] = useState(false);
  const [review, setReview] = useState<ReturnType<typeof ocrPrefill>>();
  const [clubId, setClubId] = useState<ID>();
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState<string>(); // chú thích Toast, chốt lúc lưu
  const vendor = VENDORS[vendorIndex];
  const units = me ? prefsOf(state, me.id).units : 'metric';
  useEffect(() => {
    if (!reading) return;
    // Huỷ / rời màn trong lúc đọc → dọn timer, không điền kết quả
    const timer = setTimeout(() => {
      setReview(ocrPrefill(mockOcr(vendor), units));
      setReading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [reading]);
  if (me?.role !== 'player') return <Redirect href="/" />;
  const result = review && validateSwingMetrics(review.values, units);
  const lowConfidence = review ? Object.keys(review.highlight).length : 0;
  const invalid = result ? Object.keys(result.errors).length + (clubId ? 0 : 1) : 0;
  const step = review ? 2 : reading ? 1 : 0;
  const save = () => {
    setSubmitted(true);
    if (!result?.value || !clubId) return;
    dispatch({ type: 'addSession', session: { id: newId('ss'), playerId: me.id, capturedAt: NOW, source: 'photo', vendor, clubId, kind: 'swing', swing: result.value } });
    setSaved(`Phiên swing ngày ${formatDate(NOW)} · ảnh ${VENDOR_LABELS[vendor]}`);
  };

  let body;
  if (step === 0) {
    body = (
      <>
        <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
          <View style={{ gap: t.space('Spacing/Gap/XSmall') }}>
            <Text variant="Label/Small/DemiBold">Hãng máy đo</Text>
            <Segmented items={VENDORS.map((v) => ({ label: VENDOR_LABELS[v] }))} selectedIndex={vendorIndex} onChange={setVendorIndex} />
          </View>
          {/* khung hướng dẫn crop 4:3 viền nét đứt */}
          <View
            style={{
              aspectRatio: 4 / 3,
              alignItems: 'center',
              justifyContent: 'center',
              gap: t.space('Spacing/Gap/XSmall'),
              padding: t.space('Spacing/Padding/Large'),
              borderWidth: t.weight('Emphasis/Border-Weight/Active'),
              borderStyle: 'dashed',
              borderColor: t.color('Color/Border/Accent/Solid/Default'),
              borderRadius: t.radius('Corner-Radius/Large'),
            }}
          >
            <Icon name="crop-line" size={t.size('Element-Size/Popular/Large')} color="Color/Content/Accent/Base" />
            <Text variant="Body/Base/DemiBold" color="Color/Content/Accent/Base" style={{ textAlign: 'center' }}>
              Đặt bảng số liệu vào khung
            </Text>
            <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light" style={{ textAlign: 'center' }}>
              {`Chụp thẳng màn hình kết quả ${VENDOR_LABELS[vendor]}, đủ sáng, không bị loá`}
            </Text>
          </View>
          {/* ponytail: bản thử chưa mở thư viện ảnh/camera — bản chính dùng image picker của hệ điều hành */}
          <InlineMessage theme="Info" text="Bản thử: dùng ảnh mẫu, chưa mở thư viện ảnh" />
        </ScrollView>
        <Divider />
        <View style={{ padding: t.layout('Margin-Small') }}>
          <Button leadingIcon="image-plus-line" text="Chọn ảnh" onPress={() => setReading(true)} />
        </View>
      </>
    );
  } else if (step === 1) {
    body = (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: t.space('Spacing/Gap/Medium'), padding: t.layout('Margin-Small') }}>
        <ActivityIndicator size="large" color={t.color('Color/Content/Accent/Base')} accessibilityLabel="Đang đọc số liệu" />
        <Text variant="Heading/4">Đang đọc…</Text>
        <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light" style={{ textAlign: 'center' }}>
          {`Nhận diện số liệu trên ảnh ${VENDOR_LABELS[vendor]}`}
        </Text>
        <Button level="Tertiary" size="Medium (Base)" text="Huỷ" onPress={() => setReading(false)} />
      </View>
    );
  } else if (review && result) {
    body = (
      <>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
          {lowConfidence > 0 && <AlertBanner theme="Warning" text={`${lowConfidence} trường độ tin cậy thấp — kiểm tra trước khi lưu`} />}
          <View style={{ paddingHorizontal: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
            {/* số đọc từ ảnh: lỗi hiện ngay (không đợi bấm Lưu) để thấy trường phải sửa */}
            <SwingMetricsForm values={review.values} onChange={(values) => setReview({ ...review, values })} errors={result.errors} highlight={review.highlight} />
            <ClubPicker playerId={me.id} value={clubId} onChange={setClubId} error={submitted && !clubId ? 'Bắt buộc' : undefined} />
          </View>
        </ScrollView>
        <Divider />
        <View style={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Small') }}>
          {submitted && invalid > 0 && <AlertMessage theme="Negative" text={`Chưa lưu: ${invalid} trường cần sửa.`} />}
          <View style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/Small') }}>
            <View style={{ flex: 1 }}>
              <Button
                level="Tertiary"
                text="Chọn ảnh khác"
                disabled={!!saved}
                onPress={() => {
                  setReview(undefined);
                  setSubmitted(false);
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button text="Lưu" disabled={!!saved} onPress={save} />
            </View>
          </View>
        </View>
      </>
    );
  }

  return (
    <Screen>
      <StackHeader title="Ảnh chụp màn hình" />
      <View style={{ paddingHorizontal: t.layout('Margin-Small'), paddingBottom: t.space('Spacing/Padding/Small') }}>
        <Stepper current={step} steps={STEPS} />
      </View>
      {body}
      {saved && <SavedToast title="Đã lưu" caption={saved} />}
    </Screen>
  );
}
