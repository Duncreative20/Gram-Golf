import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Avatar, Button, Dialog, EmptyState, Screen, Text, useTheme, type TopNavAction } from '@gr/ds';
import { useStore } from '../../lib/store';
import { canViewPrivate, isBlocked, postsBy, profileById } from '../../lib/selectors';
import { formatValue, initials } from '../../lib/format';
import { StackHeader } from '../../components/StackHeader';
import { Section } from '../../components/Section';
import { PostItem } from '../../components/PostItem';
import { ReportSheet } from '../../components/ReportSheet';
import { SavedToast } from '../../components/SessionEntry';
import { BlockedNotice, FollowButton, FollowCounts } from '../../components/People';

const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

/** Hồ sơ công khai người chơi: handicap, CLB, theo dõi, bài đăng. KHÔNG hiện thông số / swing / bộ gậy (D6) — chỉ HLV có kết nối
 *  active thấy nút "Xem dữ liệu học viên". Chặn (Dialog) → back; Báo cáo (lý do). Một trong hai đã chặn → không theo dõi, không xem bài. */
export default function UserProfile() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [toast, setToast] = useState<{ key: number; title: string }>();
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
  const posts = postsBy(state, user.id);
  const details = [user.handicap !== undefined && `Handicap ${formatValue(user.handicap)}`, user.homeClub].filter(Boolean).join(' · ');
  // ponytail: "menu ⋯" (Chặn, Báo cáo) thành 2 action thẳng trên header — chọn mục trong menu BottomSheet rồi mở ngay Dialog / sheet
  // khác bị kẹt trên iOS (Modal đang đóng, Task 9–10); DS có callback đóng sheet thì gộp lại thành menu.
  const actions: TopNavAction[] = self
    ? []
    : [
        { icon: 'flag-01-line', accessibilityLabel: 'Báo cáo người dùng', onPress: () => setReporting(true) },
        // đã chặn nhau thì thôi; HLV đang kèm học viên này phải huỷ kết nối trước (chặn không gỡ kết nối)
        ...(blocked || coaching ? [] : [{ icon: 'slash-circle-01-line' as const, accessibilityLabel: `Chặn ${user.name}`, onPress: () => setConfirmBlock(true) }]),
      ];
  return (
    <Screen>
      <StackHeader title="Hồ sơ" actions={actions} />
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
      <ReportSheet
        visible={reporting}
        heading="Báo cáo người dùng"
        targetUserId={user.id}
        onClose={() => setReporting(false)}
        onReported={() => {
          setReporting(false);
          setToast((prev) => ({ key: (prev?.key ?? 0) + 1, title: 'Đã gửi báo cáo' }));
        }}
      />
      <Dialog
        visible={confirmBlock}
        onRequestClose={() => setConfirmBlock(false)}
        theme="Warning"
        title={`Chặn ${user.name}?`}
        body="Hai bạn sẽ không thấy bài của nhau và bỏ theo dõi lẫn nhau."
        primaryText="Chặn"
        destructive
        onPrimary={() => {
          setConfirmBlock(false);
          dispatch({ type: 'block', blockerId: me.id, blockedId: user.id });
          back();
        }}
        secondaryText="Huỷ"
      />
      {toast && <SavedToast key={toast.key} title={toast.title} onDone={() => setToast(undefined)} />}
    </Screen>
  );
}
