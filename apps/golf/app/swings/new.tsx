import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Button, Card, Divider, Icon, InlineMessage, ListItem, Screen, Segmented, Stepper, Text, useTheme, type ButtonProps } from '@gr/ds';
import { CAMERA_VIEW_LABELS, type CameraView, type ID } from '../../lib/domain';
import { NOW } from '../../lib/mock';
import { newId } from '../../lib/ids';
import { useStore } from '../../lib/store';
import { clubById, clubLabel } from '../../lib/selectors';
import { formatSec } from '../../lib/format';
import { SAMPLE_VIDEOS } from '../../lib/simulate';
import { StackHeader } from '../../components/StackHeader';
import { ClubPicker } from '../../components/ClubPicker';
import { SwingUpload } from '../../components/SwingUpload';
import { AlertMessage } from '../../components/SessionEntry';

const STEPS = [{ title: 'Hướng dẫn quay' }, { title: 'Chọn video' }, { title: 'Tải lên' }];
const VIEWS: CameraView[] = ['face-on', 'down-the-line'];
// Điều kiện quay để phân tích được (tech review §8.3)
const GUIDE = [
  { title: '60 fps trở lên', caption: 'Quay 60 fps hoặc quay chậm để thấy rõ tempo và lúc chạm bóng' },
  { title: 'Toàn thân và đầu gậy', caption: 'Giữ cả người và đầu gậy trong khung suốt cú swing, không cắt chân tay' },
  { title: 'Face-on hoặc down-the-line', caption: 'Đặt máy ngang hông, đối diện người đánh (face-on) hoặc phía sau theo hướng bóng (down-the-line)' },
  { title: 'Tránh ngược sáng', caption: 'Quay xuôi sáng, đủ tương phản để tách người và gậy khỏi nền' },
];

/** Đăng swing: hướng dẫn quay → chọn video mẫu, gậy, góc quay → tải lên (tiến độ, tạm dừng, lỗi + thử lại) → phân tích ngay hoặc để sau. */
export default function SwingNew() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  const [step, setStep] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);
  const [view, setView] = useState<CameraView>(SAMPLE_VIDEOS[0].cameraView);
  const [clubId, setClubId] = useState<ID>();
  const [submitted, setSubmitted] = useState(false);
  const [swingId] = useState(() => newId('sw')); // id cố định từ lúc mở màn → bấm "Tải lên" 2 lần không tạo 2 swing
  if (me?.role !== 'player') return <Redirect href="/" />;
  const video = SAMPLE_VIDEOS[videoIndex];
  const swing = state.swings.find((w) => w.id === swingId);
  const club = clubById(state, clubId);
  const upload = () => {
    setSubmitted(true);
    if (!clubId || swing) return;
    dispatch({
      type: 'addSwing',
      swing: {
        id: swingId, playerId: me.id, clubId, capturedAt: NOW, fileName: video.fileName, durationSec: video.durationSec, cameraView: view,
        upload: { status: 'uploading', progress: 0 }, job: { status: 'none', progress: 0 },
      },
    });
    setStep(2);
  };
  // Thay màn đăng bằng chi tiết: "quay lại" từ chi tiết về danh sách, không về form đã tải xong.
  const finish = (analyze: boolean) => {
    if (analyze) dispatch({ type: 'jobUpdate', id: swingId, status: 'queued', progress: 0, at: NOW, notificationId: newId('nt') });
    router.replace(`/swings/${swingId}`);
  };
  const footer = (left: { text: string; onPress: () => void }, right: ButtonProps) => (
    <View style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/Small') }}>
      <View style={{ flex: 1 }}>
        <Button level="Tertiary" text={left.text} onPress={left.onPress} />
      </View>
      <View style={{ flex: 1 }}>
        <Button {...right} />
      </View>
    </View>
  );

  let body;
  if (step === 0) {
    body = (
      <>
        <ScrollView contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/Medium'), gap: t.space('Spacing/Gap/Large') }}>
          <View style={{ alignItems: 'center', gap: t.space('Spacing/Gap/XSmall'), paddingHorizontal: t.layout('Margin-Small') }}>
            {/* minh hoạ: khung dọc của điện thoại, bóng người nằm trọn trong vùng nét đứt */}
            <View
              aria-hidden
              style={{
                width: '32%',
                aspectRatio: 9 / 16,
                padding: t.space('Spacing/Padding/Small'),
                borderRadius: t.radius('Corner-Radius/Large'),
                backgroundColor: t.color('Color/Background/Black-Overlay/Pressed'),
              }}
            >
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: t.weight('Emphasis/Border-Weight/Active'),
                  borderStyle: 'dashed',
                  borderColor: t.color('Color/Border/Accent/Solid/Default'),
                  borderRadius: t.radius('Corner-Radius/Base'),
                }}
              >
                <Icon name="user-solid" size={t.size('Image-Size/Large')} color="Color/Content/On-Dark-Overlay/Strongest" />
              </View>
            </View>
            <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light" style={{ textAlign: 'center' }}>
              Cả người và đầu gậy nằm trọn trong khung
            </Text>
          </View>
          <View>
            {GUIDE.map((g) => (
              <ListItem
                key={g.title}
                title={g.title}
                caption={g.caption}
                leading={<Icon name="check-circle-line" size={t.size('Element-Size/Popular/Medium')} color="Color/Content/Accent/Base" />}
              />
            ))}
          </View>
        </ScrollView>
        <Divider />
        <View style={{ padding: t.layout('Margin-Small') }}>
          <Button text="Tiếp tục" onPress={() => setStep(1)} />
        </View>
      </>
    );
  } else if (step === 1) {
    body = (
      <>
        <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
          <View style={{ gap: t.space('Spacing/Gap/XSmall') }}>
            <Text variant="Label/Small/DemiBold">Video</Text>
            {/* ponytail: bản thử chưa mở thư viện video/camera — bản chính dùng trình chọn video của hệ điều hành */}
            <InlineMessage theme="Info" text="Bản thử: chọn một video mẫu, chưa mở thư viện video" />
            <View accessibilityRole="radiogroup" accessibilityLabel="Video" style={{ gap: t.space('Spacing/Gap/XSmall') }}>
              {SAMPLE_VIDEOS.map((v, i) => (
                <ListItem
                  key={v.fileName}
                  type="Radio-Card"
                  title={v.fileName}
                  caption={`${formatSec(v.durationSec)} · ${CAMERA_VIEW_LABELS[v.cameraView]}`}
                  selected={i === videoIndex}
                  onPress={() => {
                    setVideoIndex(i);
                    setView(v.cameraView); // góc quay mặc định theo video, vẫn sửa được bên dưới
                  }}
                />
              ))}
            </View>
          </View>
          <ClubPicker playerId={me.id} value={clubId} onChange={setClubId} error={submitted && !clubId ? 'Bắt buộc' : undefined} />
          <View role="group" aria-label="Góc quay" style={{ gap: t.space('Spacing/Gap/XSmall') }}>
            <Text variant="Label/Small/DemiBold">Góc quay</Text>
            <Segmented items={VIEWS.map((v) => ({ label: CAMERA_VIEW_LABELS[v] }))} selectedIndex={VIEWS.indexOf(view)} onChange={(i) => setView(VIEWS[i])} />
          </View>
        </ScrollView>
        <Divider />
        <View style={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Small') }}>
          {submitted && !clubId && <AlertMessage theme="Negative" text="Chưa tải lên: chọn gậy cho video này." />}
          {/* không đặt "Quay lại" — trùng tên với nút back của header nhưng khác hành động */}
          {footer({ text: 'Hướng dẫn', onPress: () => setStep(0) }, { leadingIcon: 'upload-cloud-line', text: 'Tải lên', onPress: upload })}
        </View>
      </>
    );
  } else {
    body = (
      <>
        <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
          <Card theme="Border" spacing="Small">
            <Text variant="Body/Base/DemiBold" numberOfLines={1}>{video.fileName}</Text>
            <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light">
              {[club && clubLabel(club), CAMERA_VIEW_LABELS[view], formatSec(video.durationSec)].filter(Boolean).join(' · ')}
            </Text>
          </Card>
          {swing && <SwingUpload swing={swing} />}
        </ScrollView>
        {swing?.upload.status === 'done' && (
          <>
            <Divider />
            <View style={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Small') }}>
              <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light">Kết quả là ước lượng từ video, không phải đo đạc</Text>
              {footer({ text: 'Để sau', onPress: () => finish(false) }, { leadingIcon: 'stars-01-line', text: 'Phân tích ngay', onPress: () => finish(true) })}
            </View>
          </>
        )}
      </>
    );
  }

  return (
    <Screen>
      <StackHeader title="Đăng swing" />
      <View style={{ paddingHorizontal: t.layout('Margin-Small'), paddingBottom: t.space('Spacing/Padding/Small') }}>
        <Stepper current={step} steps={STEPS} />
      </View>
      {body}
    </Screen>
  );
}
