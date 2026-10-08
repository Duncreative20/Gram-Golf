// Mảnh "người dùng" dùng chung: Khám phá, danh sách theo dõi (people), hồ sơ (profile, users/[id], coaches/[id], tab Hồ sơ HLV).
import { Pressable, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Avatar, Badge, Button, EmptyState, Text, useTheme, type ButtonSize } from '@gr/ds';
import type { ID, Profile } from '../lib/domain';
import { NOW } from '../lib/mock';
import { useStore } from '../lib/store';
import { followerCount, followingCount, isFollowing, profileById } from '../lib/selectors';
import { formatValue, initials } from '../lib/format';
import { newId } from '../lib/ids';

/** Hồ sơ công khai theo vai trò: HLV → coaches/[id], người chơi → users/[id]. */
export const profileHref = (p: Pick<Profile, 'id' | 'role'>): Href => (p.role === 'coach' ? `/coaches/${p.id}` : `/users/${p.id}`);

/** Theo dõi / Đang theo dõi `userId` (toggleFollow — đã chặn nhau thì reducer bỏ qua). Không hiện với chính mình. */
export function FollowButton({ userId, size = 'Small' }: { userId: ID; size?: ButtonSize }) {
  const { state, dispatch, me } = useStore();
  if (!me || me.id === userId) return null;
  const following = isFollowing(state, me.id, userId);
  const text = following ? 'Đang theo dõi' : 'Theo dõi';
  return (
    <Button
      level={following ? 'Tertiary' : 'Primary'}
      size={size}
      // nút nhỏ trong hàng danh sách bỏ icon để tên người dùng đủ chỗ ở 390px
      leadingIcon={size === 'Small' ? undefined : following ? 'check-line' : 'user-plus-line'}
      text={text}
      accessibilityLabel={`${text} ${profileById(state, userId)?.name ?? ''}`.trim()}
      onPress={() => dispatch({ type: 'toggleFollow', followerId: me.id, followedId: userId, at: NOW, notificationId: newId('nt') })}
    />
  );
}

/** Số người theo dõi / đang theo dõi của `userId`; chạm → danh sách tương ứng (people). `centered`: căn giữa (hồ sơ của tôi). */
export function FollowCounts({ userId, centered }: { userId: ID; centered?: boolean }) {
  const t = useTheme();
  const { state } = useStore();
  const counts = [
    { tab: 'followers', n: followerCount(state, userId), label: 'Người theo dõi' },
    { tab: 'following', n: followingCount(state, userId), label: 'Đang theo dõi' },
  ];
  return (
    <View style={{ flexDirection: 'row', justifyContent: centered ? 'center' : 'flex-start', gap: t.space(centered ? 'Spacing/Gap/2XLarge' : 'Spacing/Gap/XLarge') }}>
      {counts.map((c) => (
        <Pressable
          key={c.tab}
          accessibilityRole="button"
          accessibilityLabel={`${c.label}: ${c.n}`}
          hitSlop={t.space('Spacing/Gap/XSmall')}
          onPress={() => router.push({ pathname: '/people', params: { userId, tab: c.tab } })}
          style={{ alignItems: centered ? 'center' : 'flex-start' }}
        >
          <Text variant="Heading/4">{String(c.n)}</Text>
          <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">{c.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** Hàng người dùng: avatar, tên + Badge HLV, "hcp 14" · CLB / học viện → hồ sơ; nút Theo dõi tách riêng bên phải
 *  (không lồng nút trong nút — cả hai đều tới được bằng trình đọc màn hình). */
export function PersonRow({ person: p }: { person: Profile }) {
  const t = useTheme();
  const coach = p.role === 'coach';
  const caption = coach ? p.academy : [p.handicap !== undefined && `hcp ${formatValue(p.handicap)}`, p.homeClub].filter(Boolean).join(' · ');
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space('Spacing/Gap/Small'),
        paddingHorizontal: t.layout('Margin-Small'),
        paddingVertical: t.space('Spacing/Padding/XSmall'),
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={[p.name, coach && 'HLV', caption].filter(Boolean).join(', ')}
        onPress={() => router.push(profileHref(p))}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/Small') }}
      >
        <Avatar size="Medium" theme={p.avatarUrl ? 'Photo' : 'Accent'} source={p.avatarUrl ? { uri: p.avatarUrl } : undefined} initials={initials(p.name)} />
        <View style={{ flex: 1, gap: t.space('Spacing/Gap/3XSmall') }}>
          <Text variant="Body/Base/DemiBold" numberOfLines={1}>{p.name}</Text>
          {/* Badge HLV xuống dòng chú thích: tên HLV dài vẫn đủ chỗ bên cạnh nút Theo dõi */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/XSmall') }}>
            {coach && <Badge text="HLV" theme="Accent" />}
            {caption ? <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light" numberOfLines={1} style={{ flexShrink: 1 }}>{caption}</Text> : null}
          </View>
        </View>
      </Pressable>
      <FollowButton userId={p.id} />
    </View>
  );
}

/** Thay nội dung hồ sơ khi một trong hai đã chặn người kia: không theo dõi, không xem bài (Review Focus 5). */
export function BlockedNotice({ userId }: { userId: ID }) {
  const { state, me } = useStore();
  const mine = state.blocks.some((b) => b.blockerId === me?.id && b.blockedId === userId);
  return (
    <EmptyState
      icon="slash-circle-01-line"
      title={mine ? 'Bạn đã chặn người này' : 'Không xem được nội dung'}
      caption={mine ? 'Hai bạn không thấy bài của nhau và không theo dõi được nhau.' : 'Bạn không xem được bài đăng và không theo dõi được người này.'}
    />
  );
}
