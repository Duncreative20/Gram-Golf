import { Pressable, ScrollView, View } from 'react-native';
import { Redirect, router, type Href } from 'expo-router';
import { Avatar, Button, DockIcon, EmptyState, Screen, Text, useTheme } from '@gr/ds';
import type { AppNotification, NotificationType, Profile } from '../lib/domain';
import { NOW } from '../lib/mock';
import { useStore } from '../lib/store';
import { notificationsOf, profileById } from '../lib/selectors';
import { initials, relativeTime } from '../lib/format';
import { StackHeader } from './StackHeader';
import { TabHeader } from './TabHeader';
import { Section } from './Section';
import { profileHref } from './People';

/** Câu theo loại, đứng sau tên người gửi; `analysis_done` là thông báo hệ thống (không có người gửi) nên là cả câu. */
const SENTENCE: Record<NotificationType, string> = {
  coach_note: 'đã ghi chú swing của bạn',
  follow: 'đã theo dõi bạn',
  like: 'đã thích bài viết của bạn',
  comment: 'đã bình luận',
  invite_accepted: 'đã chấp nhận lời mời',
  analysis_done: 'Phân tích swing đã xong',
  connect_request: 'mời bạn kết nối',
  swing_uploaded: 'vừa tải lên swing mới',
};

/** Chạm thông báo → swing / hồ sơ người theo dõi / bài viết / học viên vừa nhận lời mời; thiếu id → chỉ đánh dấu đã đọc. */
function target(n: AppNotification, actor?: Profile): Href | undefined {
  switch (n.type) {
    case 'swing_uploaded':
    case 'coach_note':
    case 'analysis_done':
      return n.refId ? `/swings/${n.refId}` : undefined;
    case 'like':
    case 'comment':
      return n.refId ? `/posts/${n.refId}` : undefined;
    case 'follow':
      return actor ? profileHref(actor) : undefined;
    case 'invite_accepted':
      return n.actorId ? `/students/${n.actorId}` : undefined;
    case 'connect_request':
      return '/(player)/coach';
  }
}

function NotificationRow({ n }: { n: AppNotification }) {
  const t = useTheme();
  const { state, dispatch } = useStore();
  const actor = n.actorId ? profileById(state, n.actorId) : undefined;
  const name = n.actorId ? actor?.name ?? 'Người dùng' : undefined;
  const sentence = name ? `${name} ${SENTENCE[n.type]}` : SENTENCE[n.type];
  const time = relativeTime(n.createdAt, NOW);
  const unread = !n.readAt;
  const open = () => {
    dispatch({ type: 'markRead', userId: n.userId, at: NOW, ids: [n.id] });
    const href = target(n, actor);
    if (href) router.push(href);
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${unread ? 'Chưa đọc. ' : ''}${sentence}, ${time}`}
      onPress={open}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space('Spacing/Gap/Small'),
        paddingHorizontal: t.layout('Margin-Small'),
        paddingVertical: t.space('Spacing/Padding/Small'),
        backgroundColor: pressed ? t.color('Color/Background/Neutral/Flat/Hover') : undefined,
      })}
    >
      {name ? (
        <Avatar size="Medium" theme={actor?.avatarUrl ? 'Photo' : 'Accent'} source={actor?.avatarUrl ? { uri: actor.avatarUrl } : undefined} initials={initials(name)} />
      ) : (
        <DockIcon icon="stars-01-line" size="Medium" theme="Accent" />
      )}
      <View style={{ flex: 1, gap: t.space('Spacing/Gap/3XSmall') }}>
        <Text variant={unread ? 'Body/Base/DemiBold' : 'Body/Base/Regular'}>{sentence}</Text>
        <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light">{time}</Text>
      </View>
      {unread && (
        <View
          style={{
            width: t.size('Element-Size/Popular/2XSmall'),
            height: t.size('Element-Size/Popular/2XSmall'),
            borderRadius: t.radius('Corner-Radius/Rounded'),
            backgroundColor: t.color('Color/Background/Accent/Solid/Default'),
          }}
        />
      )}
    </Pressable>
  );
}

/** Trung tâm thông báo: nhóm "Mới" (chưa đọc) / "Trước đó". Dùng ở `/notifications` (stack, chuông trên header) và tab
 *  Thông báo của HLV (`tab` → header tab, không nút quay lại). */
export default function NotificationsScreen({ tab }: { tab?: boolean }) {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  if (!me) return <Redirect href="/" />;
  const all = notificationsOf(state, me.id);
  const fresh = all.filter((n) => !n.readAt);
  const earlier = all.filter((n) => n.readAt);
  return (
    <Screen edges={tab ? ['top'] : undefined}>
      {tab ? <TabHeader title="Thông báo" /> : <StackHeader title="Thông báo" />}
      {all.length ? (
        <ScrollView contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/Medium'), gap: t.space('Spacing/Gap/Large') }}>
          {fresh.length > 0 && (
            <View style={{ alignItems: 'flex-end', paddingHorizontal: t.layout('Margin-Small') }}>
              <Button level="Tertiary" size="Small" leadingIcon="check-done-line" text="Đánh dấu đã đọc tất cả" onPress={() => dispatch({ type: 'markRead', userId: me.id, at: NOW })} />
            </View>
          )}
          {[
            { title: 'Mới', items: fresh },
            { title: 'Trước đó', items: earlier },
          ]
            .filter((g) => g.items.length)
            .map((g) => (
              <Section key={g.title} title={g.title}>
                {g.items.map((n) => (
                  <NotificationRow key={n.id} n={n} />
                ))}
              </Section>
            ))}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
          <EmptyState icon="bell-01-line" title="Chưa có thông báo" caption="Ghi chú của HLV, người theo dõi mới, lượt thích và bình luận sẽ hiện ở đây." />
        </View>
      )}
    </Screen>
  );
}
