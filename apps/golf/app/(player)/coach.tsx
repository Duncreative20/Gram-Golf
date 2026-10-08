import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Accordion, Avatar, Button, Card, Dialog, EmptyState, Icon, InlineMessage, ListItem, Screen, Text, useTheme, type IconName } from '@gr/ds';
import type { CoachConnection, Profile } from '../../lib/domain';
import { NOW } from '../../lib/mock';
import { useStore } from '../../lib/store';
import { activeCoaches, connectionRequests, profileById } from '../../lib/selectors';
import { formatDate, initials, relativeTime } from '../../lib/format';
import { newId } from '../../lib/ids';
import { TabHeader } from '../../components/TabHeader';
import { Section } from '../../components/Section';
import { CoachSummary } from '../../components/CoachSummary';
import { SavedToast } from '../../components/Feedback';

// Quyền xem theo ma trận RLS (canViewPrivate): HLV kết nối active xem dữ liệu riêng; follow thì không.
const COACH_SEES: { icon: IconName; text: string }[] = [
  { icon: 'bar-chart-square-02-line', text: 'Thông số swing của mọi buổi tập' },
  { icon: 'video-recorder-line', text: 'Video swing, kết quả phân tích — và ghi chú cho bạn theo mốc thời gian' },
  { icon: 'flag-01-line', text: 'Bộ gậy và thông số từng gậy' },
  { icon: 'activity-heart-line', text: 'Chỉ số thể lực' },
];

type Connected = { coach: Profile; connection: CoachConnection };

export default function PlayerCoach() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  // `revoking` giữ HLV đang hỏi để tiêu đề Dialog không trống khi Dialog mờ dần lúc đóng
  const [revoking, setRevoking] = useState<Connected>();
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState<{ key: number; title: string }>();
  if (!me) return <Redirect href="/" />;
  const coaches = activeCoaches(state, me.id);
  const primary = coaches.find((c) => c.connection.isPrimary);
  const others = coaches.filter((c) => !c.connection.isPrimary);
  const since = (c: CoachConnection) => `Kết nối từ ${formatDate(c.acceptedAt ?? c.invitedAt)}`;
  const enterCode = () => router.push('/connect/accept');
  const notify = (title: string) => setToast((prev) => ({ key: (prev?.key ?? 0) + 1, title })); // key mới → Toast hiện lại từ đầu
  const askRevoke = (c: Connected) => {
    setRevoking(c);
    setConfirm(true);
  };
  const pad = { paddingHorizontal: t.layout('Margin-Small') };
  const chevron = <Icon name="chevron-right-line-medium" size={t.size('Element-Size/Popular/Base')} color="Color/Content/Neutral/Light" />;
  const { incoming, outgoing } = connectionRequests(state, me.id);
  const avatar = (p: Profile) => (
    <View aria-hidden>
      <Avatar size="Medium" theme={p.avatarUrl ? 'Photo' : 'Accent'} source={p.avatarUrl ? { uri: p.avatarUrl } : undefined} initials={initials(p.name)} />
    </View>
  );
  // D5 khi kích hoạt: chưa có HLV chính → lời mời nhận lời thành HLV chính, có rồi → HLV phụ (reducer quyết, chữ ở đây chỉ báo trước)
  const becomes = primary ? 'HLV phụ' : 'HLV chính';
  const respond = (c: CoachConnection, accept: boolean) => {
    const name = profileById(state, c.coachId)?.name ?? 'HLV';
    dispatch({ type: 'respondConnection', id: c.id, accept, at: NOW, notificationId: newId('nt') });
    notify(accept ? `Đã kết nối với ${name} — ${becomes}` : `Đã từ chối lời mời của ${name}`);
  };
  const requestRow = (c: CoachConnection, kind: 'incoming' | 'outgoing') => {
    const coach = profileById(state, c.coachId)!;
    const when = relativeTime(c.invitedAt, NOW).toLowerCase();
    return (
      <View key={c.id}>
        <ListItem
          title={coach.name}
          // khoảng trắng không ngắt trong từng cụm → hàng xuống dòng ở " · ", không tách "HLV | chính" (như roster)
          caption={(kind === 'incoming' ? ['Mời bạn kết nối', when, `nhận lời → ${becomes}`] : ['Bạn gửi yêu cầu', when, 'chờ HLV duyệt']).map((x) => x.replace(/ /g, '\u00a0')).join(' · ')}
          leading={avatar(coach)}
          trailing={chevron}
          onPress={() => router.push(`/coaches/${coach.id}`)}
        />
        <View style={{ ...pad, flexDirection: 'row', flexWrap: 'wrap', gap: t.space('Spacing/Gap/XSmall'), paddingBottom: t.space('Spacing/Padding/XSmall') }}>
          {kind === 'incoming' ? (
            <>
              <Button size="Small" leadingIcon="user-check-line" text="Chấp nhận" accessibilityLabel={`Chấp nhận lời mời của ${coach.name}`} onPress={() => respond(c, true)} />
              <Button level="Tertiary" size="Small" text="Từ chối" accessibilityLabel={`Từ chối lời mời của ${coach.name}`} onPress={() => respond(c, false)} />
            </>
          ) : (
            <Button
              level="Tertiary"
              size="Small"
              text="Huỷ yêu cầu"
              accessibilityLabel={`Huỷ yêu cầu kết nối với ${coach.name}`}
              onPress={() => {
                dispatch({ type: 'revokeConnection', id: c.id, at: NOW });
                notify(`Đã huỷ yêu cầu gửi ${coach.name}`);
              }}
            />
          )}
        </View>
      </View>
    );
  };
  return (
    <Screen edges={['top']}>
      <TabHeader title="HLV" />
      <ScrollView contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/Medium'), gap: t.space('Spacing/Gap/XLarge') }}>
        {incoming.length > 0 && (
          <Section title="Lời mời từ HLV" caption="Nhận lời thì HLV xem được thông số, swing, bộ gậy và thể lực của bạn">
            {incoming.map((c) => requestRow(c, 'incoming'))}
          </Section>
        )}
        {outgoing.length > 0 && (
          <Section title="Yêu cầu đã gửi" caption="Chờ HLV duyệt">
            {outgoing.map((c) => requestRow(c, 'outgoing'))}
          </Section>
        )}
        {coaches.length === 0 ? (
          <View style={pad}>
            <EmptyState
              icon="user-check-line"
              title="Chưa kết nối HLV"
              caption="Nhập mã mời HLV gửi cho bạn để HLV xem thông số, swing, bộ gậy và góp ý cho bạn."
              primaryText="Nhập mã mời"
              onPrimary={enterCode}
              secondaryText="Tìm HLV"
              onSecondary={() => router.push('/(player)/community')}
            />
          </View>
        ) : (
          <>
            <Section title="HLV chính">
              <View style={pad}>
                {primary ? (
                  <Card theme="Border" style={{ gap: t.space('Spacing/Gap/Medium') }}>
                    <CoachSummary coach={primary.coach} />
                    <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">{since(primary.connection)}</Text>
                    <View style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/Small') }}>
                      <View style={{ flex: 1 }}>
                        <Button
                          level="Secondary"
                          size="Medium (Base)"
                          text="Xem hồ sơ"
                          accessibilityLabel={`Xem hồ sơ ${primary.coach.name}`}
                          onPress={() => router.push(`/coaches/${primary.coach.id}`)}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Button level="Tertiary" size="Medium (Base)" text="Huỷ kết nối" accessibilityLabel={`Huỷ kết nối với ${primary.coach.name}`} onPress={() => askRevoke(primary)} />
                      </View>
                    </View>
                  </Card>
                ) : (
                  // Huỷ HLV chính không tự đôn HLV khác lên (Review Focus 3) — người chơi tự chọn
                  <InlineMessage theme="Info" text="Chưa có HLV chính. Chọn “Đặt làm HLV chính” ở một HLV bên dưới." />
                )}
              </View>
            </Section>
            {others.length > 0 && (
              <Section title="HLV khác" caption="Cũng xem được dữ liệu và ghi chú swing cho bạn">
                {others.map((c) => (
                  <View key={c.connection.id}>
                    <ListItem
                      title={c.coach.name}
                      caption={[c.coach.academy, since(c.connection)].filter(Boolean).join(' · ')}
                      leading={
                        <View aria-hidden>
                          <Avatar
                            size="Medium"
                            theme={c.coach.avatarUrl ? 'Photo' : 'Accent'}
                            source={c.coach.avatarUrl ? { uri: c.coach.avatarUrl } : undefined}
                            initials={initials(c.coach.name)}
                          />
                        </View>
                      }
                      trailing={chevron}
                      onPress={() => router.push(`/coaches/${c.coach.id}`)}
                    />
                    {/* Hai thao tác hiện thẳng thay cho menu BottomSheet: "Huỷ kết nối" phải mở Dialog — iOS không mở được Modal khi Modal khác đang đóng (Task 9). */}
                    <View style={{ ...pad, flexDirection: 'row', flexWrap: 'wrap', gap: t.space('Spacing/Gap/XSmall'), paddingBottom: t.space('Spacing/Padding/XSmall') }}>
                      <Button
                        level="Secondary"
                        size="Small"
                        leadingIcon="star-01-line"
                        text="Đặt làm HLV chính"
                        accessibilityLabel={`Đặt ${c.coach.name} làm HLV chính`}
                        onPress={() => {
                          dispatch({ type: 'setPrimaryCoach', connectionId: c.connection.id });
                          notify(`Đã đặt ${c.coach.name} làm HLV chính`);
                        }}
                      />
                      <Button level="Tertiary" size="Small" text="Huỷ kết nối" accessibilityLabel={`Huỷ kết nối với ${c.coach.name}`} onPress={() => askRevoke(c)} />
                    </View>
                  </View>
                ))}
              </Section>
            )}
            <View style={pad}>
              <Button level="Secondary" size="Medium (Base)" leadingIcon="key-line" text="Nhập mã mời" onPress={enterCode} />
            </View>
            <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light" style={pad}>
              Hoặc tìm HLV ở Cộng đồng › Khám phá rồi gửi yêu cầu kết nối từ hồ sơ HLV.
            </Text>
          </>
        )}
        <View style={pad}>
          <Accordion title="HLV xem được gì?" theme="Box" size="Medium">
            <View style={{ gap: t.space('Spacing/Gap/Small') }}>
              <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Base">HLV đã kết nối (chính và khác) xem được:</Text>
              {COACH_SEES.map((x) => (
                <View key={x.text} style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/XSmall') }}>
                  <Icon name={x.icon} size={t.size('Element-Size/Popular/Base')} color="Color/Content/Accent/Base" />
                  <Text variant="Body/Base/Regular" style={{ flex: 1 }}>{x.text}</Text>
                </View>
              ))}
              <View style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/XSmall') }}>
                <Icon name="eye-off-line" size={t.size('Element-Size/Popular/Base')} color="Color/Content/Neutral/Light" />
                <Text variant="Body/Base/Regular" style={{ flex: 1 }}>
                  Người theo dõi bạn <Text variant="Body/Base/DemiBold">không</Text> xem được những dữ liệu này — họ chỉ thấy hồ sơ công khai và bài đăng.
                </Text>
              </View>
              <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light">
                Huỷ kết nối bất cứ lúc nào: HLV mất quyền xem ngay, ghi chú cũ vẫn được giữ.
              </Text>
            </View>
          </Accordion>
        </View>
      </ScrollView>
      <Dialog
        visible={confirm}
        onRequestClose={() => setConfirm(false)}
        theme="Warning"
        title={`Huỷ kết nối với ${revoking?.coach.name ?? 'HLV'}?`}
        body="HLV sẽ mất quyền xem dữ liệu của bạn ngay lập tức. Lịch sử ghi chú vẫn được giữ."
        primaryText="Huỷ kết nối"
        destructive
        onPrimary={() => {
          setConfirm(false);
          if (!revoking) return;
          dispatch({ type: 'revokeConnection', id: revoking.connection.id, at: NOW });
          notify(`Đã huỷ kết nối với ${revoking.coach.name}`);
        }}
        secondaryText="Giữ kết nối"
      />
      {toast && <SavedToast key={toast.key} title={toast.title} onDone={() => setToast(undefined)} />}
    </Screen>
  );
}
