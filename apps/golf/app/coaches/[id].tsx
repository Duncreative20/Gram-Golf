import { ScrollView, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { EmptyState, Screen, Tag, Text, useTheme } from '@gr/ds';
import { useStore } from '../../lib/store';
import { activeCoaches, isBlocked, postsBy, profileById } from '../../lib/selectors';
import { StackHeader } from '../../components/StackHeader';
import { Section } from '../../components/Section';
import { CoachSummary } from '../../components/CoachSummary';
import { PostItem } from '../../components/PostItem';
import { BlockedNotice, FollowButton, FollowCounts } from '../../components/People';

/** Hồ sơ công khai HLV: ai cũng xem được; theo dõi KHÔNG mở dữ liệu riêng (D6). Một trong hai đã chặn người kia → không theo dõi, không xem bài. */
export default function CoachPublicProfile() {
  const t = useTheme();
  const { state, me } = useStore();
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
  const blocked = isBlocked(state, me.id, coach.id);
  const myCoach = activeCoaches(state, me.id).some((c) => c.coach.id === coach.id);
  const posts = postsBy(state, coach.id);
  return (
    <Screen>
      <StackHeader title="Hồ sơ HLV" />
      <ScrollView contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/Medium'), gap: t.space('Spacing/Gap/XLarge') }}>
        <View style={{ paddingHorizontal: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Medium') }}>
          <CoachSummary coach={coach} />
          {blocked ? (
            <BlockedNotice userId={coach.id} />
          ) : (
            <>
              {myCoach && <Tag text="HLV của bạn" icon="user-check-line" />}
              {coach.bio ? <Text variant="Body/Base/Regular">{coach.bio}</Text> : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/Medium') }}>
                <View style={{ flex: 1 }}>
                  <FollowCounts userId={coach.id} />
                </View>
                <FollowButton userId={coach.id} size="Medium (Base)" />
              </View>
            </>
          )}
        </View>
        {!blocked && (
          <Section title="Bài đăng" caption={posts.length ? `${posts.length} bài` : undefined}>
            {posts.length ? (
              <View style={{ gap: t.space('Spacing/Gap/Small') }}>
                {posts.map((p) => (
                  <PostItem key={p.id} post={p} onOpen={() => router.push(`/posts/${p.id}`)} />
                ))}
              </View>
            ) : (
              <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light" style={{ paddingHorizontal: t.layout('Margin-Small') }}>
                Chưa có bài đăng.
              </Text>
            )}
          </Section>
        )}
      </ScrollView>
    </Screen>
  );
}
