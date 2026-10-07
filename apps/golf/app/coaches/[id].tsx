import { ScrollView, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Button, EmptyState, ListItem, Screen, Tag, Text, useTheme } from '@gr/ds';
import { NOW } from '../../lib/mock';
import { useStore } from '../../lib/store';
import { activeCoaches, followerCount, isFollowing, postsBy, profileById } from '../../lib/selectors';
import { relativeTime } from '../../lib/format';
import { newId } from '../../lib/ids';
import { StackHeader } from '../../components/StackHeader';
import { Section } from '../../components/Section';
import { CoachSummary } from '../../components/CoachSummary';

/** Hồ sơ công khai HLV: ai cũng xem được; theo dõi KHÔNG mở dữ liệu riêng (D6). */
export default function CoachPublicProfile() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!me) return <Redirect href="/" />;
  const coach = profileById(state, id);
  if (coach?.role !== 'coach') {
    return (
      <Screen>
        <StackHeader title="Hồ sơ HLV" />
        <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
          <EmptyState
            icon="file-search-line"
            title="Không tìm thấy HLV"
            caption="Hồ sơ này không tồn tại."
            primaryText="Quay lại"
            onPrimary={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          />
        </View>
      </Screen>
    );
  }
  const self = coach.id === me.id;
  const myCoach = activeCoaches(state, me.id).some((c) => c.coach.id === coach.id);
  const following = isFollowing(state, me.id, coach.id);
  const followers = followerCount(state, coach.id);
  const posts = postsBy(state, coach.id);
  return (
    <Screen>
      <StackHeader title="Hồ sơ HLV" />
      <ScrollView contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/Medium'), gap: t.space('Spacing/Gap/XLarge') }}>
        <View style={{ paddingHorizontal: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Medium') }}>
          <CoachSummary coach={coach} />
          {myCoach && <Tag text="HLV của bạn" icon="user-check-line" />}
          {coach.bio ? <Text variant="Body/Base/Regular">{coach.bio}</Text> : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/Medium') }}>
            <View style={{ flex: 1 }} accessible accessibilityLabel={`${followers} người theo dõi`}>
              <Text variant="Heading/4">{String(followers)}</Text>
              <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Người theo dõi</Text>
            </View>
            {!self && (
              <Button
                level={following ? 'Tertiary' : 'Primary'}
                size="Medium (Base)"
                leadingIcon={following ? 'check-line' : 'user-plus-line'}
                text={following ? 'Đang theo dõi' : 'Theo dõi'}
                onPress={() => dispatch({ type: 'toggleFollow', followerId: me.id, followedId: coach.id, at: NOW, notificationId: newId('nt') })}
              />
            )}
          </View>
        </View>
        {/* Tạm — Task 12 thay bằng PostItem (mở bài, thích, bình luận). */}
        <Section title="Bài đăng" caption={posts.length ? `${posts.length} bài` : undefined}>
          {posts.length ? (
            posts.map((p) => (
              <ListItem key={p.id} title={p.title} caption={[relativeTime(p.createdAt, NOW), p.tags.map((tag) => `#${tag}`).join(' ')].filter(Boolean).join(' · ')} />
            ))
          ) : (
            <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light" style={{ paddingHorizontal: t.layout('Margin-Small') }}>
              Chưa có bài đăng.
            </Text>
          )}
        </Section>
      </ScrollView>
    </Screen>
  );
}
