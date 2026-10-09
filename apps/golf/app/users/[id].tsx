import { ScrollView, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Avatar, Button, EmptyState, Screen, Text, useTheme } from '@gr/ds';
import { useStore } from '../../lib/store';
import { canViewPrivate, isBlocked, profileById } from '../../lib/selectors';
import { formatValue, initials } from '../../lib/format';
import { StackHeader } from '../../components/StackHeader';
import { PostsSection, useShareToast } from '../../components/PostItem';
import { BlockedNotice, FollowButton, FollowCounts, ProfileScreen } from '../../components/People';

const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

/** Hồ sơ công khai người chơi: handicap, CLB, theo dõi, bài đăng. KHÔNG hiện thông số / swing / bộ gậy (D6) — chỉ HLV có kết nối
 *  active thấy nút "Xem dữ liệu học viên". Báo cáo / Chặn ở header (ProfileScreen). Một trong hai đã chặn → không theo dõi, không xem bài. */
export default function UserProfile() {
  const t = useTheme();
  const { state, me } = useStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const share = useShareToast();
  if (!me) return <Redirect href="/" />;
  const user = profileById(state, id);
  if (user?.role === 'coach') return <Redirect href={`/coaches/${user.id}`} />;
  if (!user) {
    return (
      <Screen>
        <StackHeader title="Hồ sơ" />
        <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
          <EmptyState icon="file-search-line" title="Không tìm thấy người dùng" caption="Hồ sơ này không tồn tại." primaryText="Quay lại" onPrimary={back} />
        </View>
      </Screen>
    );
  }
  const self = user.id === me.id;
  const blocked = isBlocked(state, me.id, user.id);
  const coaching = !self && canViewPrivate(state, me.id, user.id); // người xem là HLV có kết nối active với người chơi này
  const details = [user.handicap !== undefined && `Handicap ${formatValue(user.handicap)}`, user.homeClub].filter(Boolean).join(' · ');
  return (
    <ProfileScreen title="Hồ sơ" user={user}>
      <ScrollView contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/Medium'), gap: t.space('Spacing/Gap/XLarge') }}>
        <View style={{ paddingHorizontal: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Medium') }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/Medium') }}>
            <View aria-hidden>
              <Avatar size="XLarge" theme={user.avatarUrl ? 'Photo' : 'Accent'} background="Solid" source={user.avatarUrl ? { uri: user.avatarUrl } : undefined} initials={initials(user.name)} />
            </View>
            <View style={{ flex: 1, gap: t.space('Spacing/Gap/2XSmall') }}>
              <Text variant="Heading/4" numberOfLines={2} accessibilityRole="header">{user.name}</Text>
              {details ? <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light">{details}</Text> : null}
            </View>
          </View>
          {blocked ? (
            <BlockedNotice userId={user.id} />
          ) : (
            <>
              {user.bio ? <Text variant="Body/Base/Regular">{user.bio}</Text> : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/Medium') }}>
                <View style={{ flex: 1 }}>
                  <FollowCounts userId={user.id} />
                </View>
                <FollowButton userId={user.id} size="Medium (Base)" />
              </View>
              {coaching && (
                <Button level="Secondary" size="Medium (Base)" leadingIcon="bar-chart-square-02-line" text="Xem dữ liệu học viên" onPress={() => router.push(`/students/${user.id}`)} />
              )}
            </>
          )}
        </View>
        {!blocked && <PostsSection authorId={user.id} onShared={share.onShared} />}
      </ScrollView>
      {share.toast}
    </ProfileScreen>
  );
}
