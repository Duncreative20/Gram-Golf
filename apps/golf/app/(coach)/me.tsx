import { ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Button, ListItem, Screen, Text, useTheme } from '@gr/ds';
import { NOW } from '../../lib/mock';
import { useStore } from '../../lib/store';
import { followerCount, followingCount, postsBy } from '../../lib/selectors';
import { relativeTime } from '../../lib/format';
import { TabHeader } from '../../components/TabHeader';
import { Section } from '../../components/Section';
import { CoachSummary } from '../../components/CoachSummary';

/** Tab Hồ sơ của HLV: hồ sơ công khai của chính mình (như người khác thấy ở coaches/[id]) + sửa hồ sơ, cài đặt; bài đã đăng. */
export default function CoachMe() {
  const t = useTheme();
  const { state, me } = useStore();
  if (!me) return <Redirect href="/" />;
  const posts = postsBy(state, me.id);
  const counts = [
    { n: followerCount(state, me.id), label: 'Người theo dõi' },
    { n: followingCount(state, me.id), label: 'Đang theo dõi' },
  ];
  return (
    <Screen edges={['top']}>
      <TabHeader title="Hồ sơ" />
      <ScrollView contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/Medium'), gap: t.space('Spacing/Gap/XLarge') }}>
        <View style={{ paddingHorizontal: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Medium') }}>
          <CoachSummary coach={me} />
          {me.bio ? <Text variant="Body/Base/Regular">{me.bio}</Text> : null}
          <View style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/XLarge') }}>
            {counts.map((c) => (
              <View key={c.label} accessible accessibilityLabel={`${c.n} ${c.label}`}>
                <Text variant="Heading/4">{String(c.n)}</Text>
                <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">{c.label}</Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/Small') }}>
            <View style={{ flex: 1 }}>
              <Button level="Secondary" size="Medium (Base)" leadingIcon="edit-02-line" text="Chỉnh sửa hồ sơ" onPress={() => router.push('/settings/account')} />
            </View>
            <View style={{ flex: 1 }}>
              <Button level="Tertiary" size="Medium (Base)" leadingIcon="settings-01-line" text="Cài đặt" onPress={() => router.push('/settings')} />
            </View>
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
