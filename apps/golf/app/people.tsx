import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { EmptyState, Screen, TabBar, useTheme } from '@gr/ds';
import type { Profile } from '../lib/domain';
import { useStore } from '../lib/store';
import { isBlocked, profileById } from '../lib/selectors';
import { StackHeader } from '../components/StackHeader';
import { BlockedNotice, PersonRow } from '../components/People';

/** Người theo dõi / Đang theo dõi của `userId` (mặc định: chính mình); `tab=followers|following` chọn tab mở đầu.
 *  Mở từ số đếm ở hồ sơ (của tôi, người chơi, HLV). Người đã chặn / bị chặn với người xem không hiện. */
export default function People() {
  const t = useTheme();
  const { state, me } = useStore();
  const params = useLocalSearchParams<{ userId?: string; tab?: string }>();
  const [tab, setTab] = useState(params.tab === 'following' ? 1 : 0);
  if (!me) return <Redirect href="/" />;
  const user = profileById(state, params.userId ?? me.id);
  const pad = { flex: 1, justifyContent: 'center' as const, padding: t.layout('Margin-Small') };
  if (!user || (user.id !== me.id && isBlocked(state, me.id, user.id))) {
    return (
      <Screen>
        <StackHeader title="Theo dõi" />
        <View style={pad}>
          {user ? (
            <BlockedNotice userId={user.id} />
          ) : (
            <EmptyState
              icon="file-search-line"
              title="Không tìm thấy người dùng"
              caption="Hồ sơ này không tồn tại."
              primaryText="Quay lại"
              onPrimary={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            />
          )}
        </View>
      </Screen>
    );
  }
  const visible = (ids: string[]) => ids.map((x) => profileById(state, x)).filter((p): p is Profile => !!p && !isBlocked(state, me.id, p.id));
  const lists = [
    visible(state.follows.filter((f) => f.followedId === user.id).map((f) => f.followerId)),
    visible(state.follows.filter((f) => f.followerId === user.id).map((f) => f.followedId)),
  ];
  const who = user.id === me.id ? 'Bạn' : user.name;
  const people = lists[tab];
  return (
    <Screen>
      <StackHeader title={user.name} subtitle="Theo dõi" />
      <TabBar
        items={[
          { label: 'Người theo dõi', badge: String(lists[0].length) },
          { label: 'Đang theo dõi', badge: String(lists[1].length) },
        ]}
        selectedIndex={tab}
        onChange={setTab}
      />
      {people.length ? (
        <ScrollView contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/XSmall') }}>
          {people.map((p) => (
            <PersonRow key={p.id} person={p} />
          ))}
        </ScrollView>
      ) : (
        <View style={pad}>
          <EmptyState
            icon="users-line"
            title={tab === 0 ? 'Chưa có người theo dõi' : 'Chưa theo dõi ai'}
            caption={tab === 0 ? `${who} chưa có người theo dõi nào.` : `${who} chưa theo dõi người chơi hay HLV nào.`}
          />
        </View>
      )}
    </Screen>
  );
}
