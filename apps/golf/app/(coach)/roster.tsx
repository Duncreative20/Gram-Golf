import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Avatar, Badge, Button, Card, EmptyState, Icon, ListItem, Screen, SearchField, Segmented, Text, useTheme } from '@gr/ds';
import type { Profile } from '../../lib/domain';
import { NOW } from '../../lib/mock';
import { useStore } from '../../lib/store';
import { fold, followerCount, followingCount, needsFeedback, pendingInvites, roster, swingsOf } from '../../lib/selectors';
import { formatDate, formatNumber, formatValue, initials, relativeTime, timeLeft } from '../../lib/format';
import { TabHeader } from '../../components/TabHeader';

/** Tab Học viên của HLV: hero HLV; lọc Tất cả / Cần phản hồi / Lời mời; tìm học viên theo tên không dấu → chi tiết học viên;
 *  lời mời đang chờ → mở lại mã ở connect/invite để sao chép / chia sẻ lại. */
export default function CoachRoster() {
  const t = useTheme();
  const { state, me } = useStore();
  const [seg, setSeg] = useState(0);
  const [query, setQuery] = useState('');
  if (!me) return <Redirect href="/" />;
  const students = roster(state, me.id);
  const waiting = needsFeedback(state, me.id);
  const invites = pendingInvites(state, me.id, NOW);
  const q = fold(query.trim());
  const shown = (seg === 1 ? waiting : students).filter((p) => fold(p.name).includes(q));
  const invite = () => router.push('/connect/invite');
  const pad = { paddingHorizontal: t.layout('Margin-Small') };
  const chevron = <Icon name="chevron-right-line-medium" size={t.size('Element-Size/Popular/Base')} color="Color/Content/Neutral/Light" />;
  const note = (text: string) => (
    <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light" style={pad}>{text}</Text>
  );
  const counts = [
    { n: students.length, label: 'Học viên' },
    { n: followerCount(state, me.id), label: 'Người theo dõi' },
    { n: followingCount(state, me.id), label: 'Đang theo dõi' },
  ];
  const studentRow = (p: Profile) => {
    const latest = swingsOf(state, p.id)[0];
    return (
      <ListItem
        key={p.id}
        title={p.name}
        caption={[p.handicap !== undefined && `Handicap ${formatValue(p.handicap)}`, latest ? `Swing mới ${relativeTime(latest.capturedAt, NOW).toLowerCase()}` : 'Chưa có swing']
          // khoảng trắng không ngắt trong từng cụm → hàng hẹp (có Badge) xuống dòng ở " · ", không tách "1 | ngày trước"
          .flatMap((x) => (x ? [x.replace(/ /g, '\u00a0')] : []))
          .join(' · ')}
        leading={
          <View aria-hidden>
            <Avatar size="Medium" theme={p.avatarUrl ? 'Photo' : 'Accent'} source={p.avatarUrl ? { uri: p.avatarUrl } : undefined} initials={initials(p.name)} />
          </View>
        }
        trailing={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/XSmall') }}>
            {waiting.some((w) => w.id === p.id) && <Badge text="Cần phản hồi" theme="Yellow" />}
            {chevron}
          </View>
        }
        onPress={() => router.push(`/students/${p.id}`)}
      />
    );
  };
  return (
    <Screen edges={['top']}>
      <TabHeader />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: t.space('Spacing/Padding/XSmall'), paddingBottom: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Medium') }}>
        <View style={pad}>
          <Card style={{ backgroundColor: t.color('Color/Background/Accent/Subtle/Default'), gap: t.space('Spacing/Gap/Medium') }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/Medium') }}>
              <Avatar
                size="XLarge"
                theme={me.avatarUrl ? 'Photo' : 'Accent'}
                background="Solid"
                source={me.avatarUrl ? { uri: me.avatarUrl } : undefined}
                initials={initials(me.name)}
                accessibilityLabel={`Ảnh đại diện ${me.name}`}
              />
              <View style={{ flex: 1, gap: t.space('Spacing/Gap/2XSmall') }}>
                <Text variant="Heading/4" numberOfLines={2}>{me.name}</Text>
                {me.academy ? <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Base">{me.academy}</Text> : null}
                {me.rating !== undefined && (
                  <View
                    accessible
                    accessibilityLabel={`Đánh giá ${formatNumber(me.rating, 1)} trên 5`}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/3XSmall') }}
                  >
                    <Icon name="star-01-solid" size={t.size('Element-Size/Popular/Small')} color="Color/Content/Warning/Base" />
                    <Text variant="Body/Base/DemiBold">{formatNumber(me.rating, 1)}</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/XLarge') }}>
              {counts.map((c) => (
                <View key={c.label} accessible accessibilityLabel={`${c.n} ${c.label}`}>
                  <Text variant="Heading/4">{String(c.n)}</Text>
                  <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">{c.label}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Lọc đặt trên ô tìm: ô tìm chỉ hiện ở 2 mục học viên — đổi sang "Lời mời" không làm Segmented nhảy chỗ dưới ngón tay. */}
        <View style={pad}>
          <Segmented
            items={[
              { label: 'Tất cả' },
              { label: 'Cần phản hồi', badge: waiting.length ? String(waiting.length) : undefined },
              { label: 'Lời mời', badge: invites.length ? String(invites.length) : undefined },
            ]}
            selectedIndex={seg}
            onChange={setSeg}
          />
        </View>

        {seg !== 2 && students.length > 0 && (
          <View style={pad}>
            <SearchField placeholder="Tìm học viên" value={query} onChangeText={setQuery} />
          </View>
        )}

        {seg === 2 ? (
          <View style={{ gap: t.space('Spacing/Gap/Medium') }}>
            {invites.length ? (
              <View>
                <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light" style={[pad, { paddingBottom: t.space('Spacing/Padding/XSmall') }]}>
                  Mã còn hạn, chưa có học viên dùng — chạm một mã để sao chép hoặc chia sẻ lại.
                </Text>
                {invites.map((i) => (
                  <ListItem
                    key={i.code}
                    title={i.code}
                    caption={`${timeLeft(i.expiresAt, NOW)} · tạo ${formatDate(i.createdAt)}`}
                    accessibilityLabel={`Mã mời ${i.code.split('').join(' ')}, ${timeLeft(i.expiresAt, NOW).toLowerCase()}, tạo ${formatDate(i.createdAt)}`}
                    leading={<Icon name="ticket-01-line" size={t.size('Element-Size/Popular/Base')} color="Color/Content/Neutral/Base" />}
                    trailing={chevron}
                    onPress={() => router.push({ pathname: '/connect/invite', params: { code: i.code } })}
                  />
                ))}
              </View>
            ) : (
              note('Chưa có lời mời nào đang chờ.')
            )}
            <View style={pad}>
              <Button size="Medium (Base)" leadingIcon="user-plus-line" text="Mời học viên" onPress={invite} />
            </View>
          </View>
        ) : students.length === 0 ? (
          <View style={pad}>
            <EmptyState
              icon="users-line"
              title="Chưa có học viên"
              caption="Tạo mã mời rồi gửi cho học viên — kết nối xong bạn xem được thông số, swing, bộ gậy và thể lực của họ."
              primaryText="Mời học viên"
              onPrimary={invite}
            />
          </View>
        ) : shown.length > 0 ? (
          <View>{shown.map(studentRow)}</View>
        ) : q ? (
          note(`Không tìm thấy học viên nào tên “${query.trim()}”.`)
        ) : (
          note('Không có học viên nào cần phản hồi. Swing phân tích xong mà bạn chưa ghi chú sẽ hiện ở đây.')
        )}
      </ScrollView>
    </Screen>
  );
}
