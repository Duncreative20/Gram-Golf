import { useEffect, useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Button, EmptyState, Screen, SearchField, Skeleton, SkeletonText, TabBar, Text, useTheme } from '@gr/ds';
import { useStore } from '../lib/store';
import { discover, feed } from '../lib/selectors';
import { TabHeader } from './TabHeader';
import { PostItem } from './PostItem';
import { PersonRow } from './People';

const TABS = [{ label: 'Bảng tin' }, { label: 'Khám phá' }];

/** Tab Cộng đồng (người chơi và HLV dùng chung — 2 file tab re-export). Bảng tin = bài của mình + người đang theo dõi
 *  (người đã chặn / bị chặn biến mất); Khám phá = tìm người theo tên không dấu → hồ sơ, theo dõi. Nút nổi "Đăng bài". */
export default function CommunityScreen() {
  const t = useTheme();
  const { state, me } = useStore();
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState('');
  // Lần đầu mở: giả lập tải bảng tin 400 ms → khung xương bài viết (bản thật: chờ API)
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);
  if (!me) return <Redirect href="/" />;
  const posts = feed(state, me.id);
  const people = discover(state, me.id, query);
  const pad = { paddingHorizontal: t.layout('Margin-Small') };
  return (
    <Screen edges={['top']}>
      <TabHeader title="Cộng đồng" />
      <TabBar items={TABS} selectedIndex={tab} onChange={setTab} />
      {tab === 0 ? (
        <>
          {loading ? (
            <View accessible accessibilityLabel="Đang tải bảng tin" style={{ paddingTop: t.space('Spacing/Gap/Small'), gap: t.space('Spacing/Gap/Small') }}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[pad, { paddingVertical: t.space('Spacing/Padding/Medium'), gap: t.space('Spacing/Gap/Small'), backgroundColor: t.color('Color/Background/Surface/Default') }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/XSmall') }}>
                    <Skeleton shape="Round" size="Small - 32px" />
                    <View style={{ flex: 1 }}>
                      <SkeletonText />
                    </View>
                  </View>
                  <SkeletonText heading="Small" />
                  <SkeletonText lines={3} />
                </View>
              ))}
            </View>
          ) : posts.length ? (
            <FlatList
              data={posts}
              keyExtractor={(p) => p.id}
              renderItem={({ item }) => <PostItem post={item} onOpen={() => router.push(`/posts/${item.id}`)} />}
              // chừa chỗ cho nút nổi "Đăng bài"
              contentContainerStyle={{ paddingTop: t.space('Spacing/Gap/Small'), paddingBottom: t.size('Button/Size/Medium') + 2 * t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Small') }}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
              <EmptyState
                icon="message-chat-circle-line"
                title="Chưa có bài viết"
                caption="Theo dõi người chơi và HLV để thấy bài của họ ở đây, hoặc đăng bài đầu tiên của bạn."
                primaryText="Khám phá người chơi"
                onPrimary={() => setTab(1)}
              />
            </View>
          )}
          <View style={{ position: 'absolute', right: t.layout('Margin-Small'), bottom: t.layout('Margin-Small') }}>
            <Button size="Medium (Base)" leadingIcon="plus-line" text="Đăng bài" onPress={() => router.push('/community/compose')} />
          </View>
        </>
      ) : (
        <>
          <View style={[pad, { paddingVertical: t.space('Spacing/Padding/Small') }]}>
            <SearchField placeholder="Tìm người chơi, HLV" value={query} onChangeText={setQuery} />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: t.layout('Margin-Small') }}>
            {people.length ? (
              people.map((p) => <PersonRow key={p.id} person={p} />)
            ) : (
              <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light" style={pad}>
                {query.trim() ? `Không tìm thấy ai tên “${query.trim()}”.` : 'Chưa có người dùng nào khác.'}
              </Text>
            )}
          </ScrollView>
        </>
      )}
    </Screen>
  );
}
