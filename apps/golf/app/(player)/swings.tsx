import { ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Badge, Button, Card, EmptyState, Icon, Screen, Text, useTheme, type BadgeTheme } from '@gr/ds';
import { CAMERA_VIEW_LABELS, type JobStatus, type Swing } from '../../lib/domain';
import { useStore } from '../../lib/store';
import { clubById, clubLabel, notesFor, swingsOf } from '../../lib/selectors';
import { formatDate } from '../../lib/format';
import { TabHeader } from '../../components/TabHeader';

const JOB: Record<JobStatus, { text: string; theme: BadgeTheme }> = {
  none: { text: 'Chưa phân tích', theme: 'Neutral' },
  queued: { text: 'Đang phân tích', theme: 'Blue' },
  processing: { text: 'Đang phân tích', theme: 'Blue' },
  succeeded: { text: 'Đã phân tích', theme: 'Green' },
  needs_review: { text: 'Cần xem lại', theme: 'Yellow' },
  failed: { text: 'Lỗi phân tích', theme: 'Red' },
};
/** Trạng thái của swing: tải lên chưa xong thì theo tải lên, xong rồi theo job phân tích. */
const statusOf = ({ upload, job }: Swing): { text: string; theme: BadgeTheme } =>
  upload.status === 'uploading' ? { text: `Đang tải ${Math.round(upload.progress * 100)}%`, theme: 'Blue' }
  : upload.status === 'paused' ? { text: 'Tạm dừng', theme: 'Yellow' }
  : upload.status === 'failed' ? { text: 'Lỗi tải lên', theme: 'Red' }
  : JOB[job.status];

export default function PlayerSwings() {
  const t = useTheme();
  const { state, me } = useStore();
  if (!me) return <Redirect href="/" />;
  const swings = swingsOf(state, me.id);
  const post = () => router.push('/swings/new');
  return (
    <Screen edges={['top']}>
      <TabHeader title="Swing" />
      {swings.length > 0 ? (
        <>
          <ScrollView
            contentContainerStyle={{
              padding: t.layout('Margin-Small'),
              // chừa chỗ cho nút nổi "Đăng swing"
              paddingBottom: t.size('Button/Size/Medium') + 2 * t.layout('Margin-Small'),
              gap: t.space('Spacing/Gap/Small'),
            }}
          >
            {swings.map((w) => {
              const club = clubById(state, w.clubId);
              const status = statusOf(w);
              const notes = notesFor(state, w.id).length;
              return (
                <Card key={w.id} theme="Border" spacing="Small" onPress={() => router.push(`/swings/${w.id}`)}>
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
                      </View>
                    </View>
                  </View>
                </Card>
              );
            })}
          </ScrollView>
          <View style={{ position: 'absolute', right: t.layout('Margin-Small'), bottom: t.layout('Margin-Small') }}>
            <Button size="Medium (Base)" leadingIcon="video-recorder-line" text="Đăng swing" onPress={post} />
          </View>
        </>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
          <EmptyState
            icon="video-recorder-line"
            title="Chưa có swing nào"
            caption="Quay video swing theo hướng dẫn rồi đăng lên để nhận phân tích ước lượng và ghi chú từ HLV."
            primaryText="Đăng swing"
            onPrimary={post}
          />
        </View>
      )}
    </Screen>
  );
}
