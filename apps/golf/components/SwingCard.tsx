import { View } from 'react-native';
import { router } from 'expo-router';
import { Badge, Card, Icon, Text, useTheme, type BadgeTheme } from '@gr/ds';
import { CAMERA_VIEW_LABELS, type JobStatus, type Swing } from '../lib/domain';
import { useStore } from '../lib/store';
import { clubById, clubLabel, notesFor } from '../lib/selectors';
import { formatDate } from '../lib/format';

const JOB: Record<JobStatus, { text: string; theme: BadgeTheme }> = {
  none: { text: 'Chưa phân tích', theme: 'Neutral' },
  queued: { text: 'Đang phân tích', theme: 'Blue' },
  processing: { text: 'Đang phân tích', theme: 'Blue' },
  succeeded: { text: 'Đã phân tích', theme: 'Green' },
  needs_review: { text: 'Cần xem lại', theme: 'Yellow' },
  failed: { text: 'Lỗi phân tích', theme: 'Red' },
};
/** Trạng thái của swing: tải lên chưa xong thì theo tải lên, xong rồi theo job phân tích. */
export const swingStatus = ({ upload, job }: Swing): { text: string; theme: BadgeTheme } =>
  upload.status === 'uploading' ? { text: `Đang tải ${Math.round(upload.progress * 100)}%`, theme: 'Blue' }
  : upload.status === 'paused' ? { text: 'Tạm dừng', theme: 'Yellow' }
  : upload.status === 'failed' ? { text: 'Lỗi tải lên', theme: 'Red' }
  : JOB[job.status];

/** Thẻ swing (tab Swing, chi tiết học viên): thumbnail, gậy, ngày · góc quay, trạng thái tải lên/phân tích, số ghi chú HLV; chạm → chi tiết swing.
 *  `awaitingFeedback` (HLV xem): thêm Badge "Cần phản hồi". */
export function SwingCard({ swing: w, awaitingFeedback }: { swing: Swing; awaitingFeedback?: boolean }) {
  const t = useTheme();
  const { state } = useStore();
  const club = clubById(state, w.clubId);
  const status = swingStatus(w);
  const notes = notesFor(state, w.id).length;
  return (
    <Card theme="Border" spacing="Small" onPress={() => router.push(`/swings/${w.id}`)}>
      <View style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/Small') }}>
        {/* thumbnail: khung dọc 9:16 nền tối + icon play (chưa có ảnh trích từ video) */}
        <View
          aria-hidden
          style={{
            width: t.size('Image-Size/Medium'),
            aspectRatio: 9 / 16,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: t.radius('Corner-Radius/Small'),
            backgroundColor: t.color('Color/Background/Black-Overlay/Pressed'),
          }}
        >
          <Icon name="play-solid" size={t.size('Element-Size/Popular/Base')} color="Color/Content/On-Dark-Overlay/Strongest" />
        </View>
        <View style={{ flex: 1, gap: t.space('Spacing/Gap/2XSmall') }}>
          <Text variant="Body/Base/DemiBold" numberOfLines={1}>{club ? clubLabel(club) : 'Chưa gắn gậy'}</Text>
          <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light">
            {`${formatDate(w.capturedAt)} · ${CAMERA_VIEW_LABELS[w.cameraView]}`}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space('Spacing/Gap/XSmall') }}>
            <Badge text={status.text} theme={status.theme} />
            {notes > 0 && <Badge text={`${notes} ghi chú HLV`} leadingIcon="message-text-circle-line" theme="Accent" />}
            {awaitingFeedback && <Badge text="Cần phản hồi" theme="Yellow" />}
          </View>
        </View>
      </View>
    </Card>
  );
}
