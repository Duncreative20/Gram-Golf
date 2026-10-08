import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Badge, Button, Card, Chip, EmptyState, Icon, Screen, Segmented, Text, useTheme } from '@gr/ds';
import type { Swing } from '../../lib/domain';
import { NOW } from '../../lib/mock';
import { useStore } from '../../lib/store';
import { clubById, clubLabel, filterSwings, swingsOf, type SwingPeriod } from '../../lib/selectors';
import { formatDate } from '../../lib/format';
import { TabHeader } from '../../components/TabHeader';
import { SwingCard, swingStatus } from '../../components/SwingCard';
import { ListSkeleton, useFirstLoad } from '../../components/ListSkeleton';

const VIEWS = [
  { label: 'Danh sách', icon: 'menu-01-line' as const },
  { label: 'Lưới', icon: 'dots-grid-line' as const },
];
const PERIODS: { key: SwingPeriod; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: '7d', label: '7 ngày' },
  { key: '30d', label: '30 ngày' },
];

/** Ô lưới (chỉ màn này dùng): thumbnail dọc, gậy, ngày, trạng thái; chạm → chi tiết swing. */
function SwingTile({ swing: w }: { swing: Swing }) {
  const t = useTheme();
  const { state } = useStore();
  const club = clubById(state, w.clubId);
  const status = swingStatus(w);
  return (
    <Card theme="Border" spacing="Small" style={{ flex: 1, gap: t.space('Spacing/Gap/2XSmall') }} onPress={() => router.push(`/swings/${w.id}`)}>
      <View
        aria-hidden
        style={{
          width: '100%',
          aspectRatio: 3 / 4,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: t.radius('Corner-Radius/Small'),
          backgroundColor: t.color('Color/Background/Black-Overlay/Pressed'),
        }}
      >
        <Icon name="play-solid" size={t.size('Element-Size/Popular/Medium')} color="Color/Content/On-Dark-Overlay/Strongest" />
      </View>
      <Text variant="Body/Small/DemiBold" numberOfLines={1}>{club ? clubLabel(club) : 'Chưa gắn gậy'}</Text>
      <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">{formatDate(w.capturedAt)}</Text>
      <View style={{ flexDirection: 'row' }}>
        <Badge text={status.text} theme={status.theme} />
      </View>
    </Card>
  );
}

/** Tab Swing: Danh sách / Lưới, lọc theo khoảng ngày (7 / 30 ngày tới hôm nay), sắp xếp theo ngày quay (MVP "My Swings"). */
export default function PlayerSwings() {
  const t = useTheme();
  const { state, me } = useStore();
  const [view, setView] = useState(0);
  const [period, setPeriod] = useState<SwingPeriod>('all');
  const [order, setOrder] = useState<'newest' | 'oldest'>('newest');
  const loading = useFirstLoad('swings');
  if (!me) return <Redirect href="/" />;
  const all = swingsOf(state, me.id);
  const swings = filterSwings(all, period, order, NOW);
  const post = () => router.push('/swings/new');
  const margin = t.layout('Margin-Small');
  return (
    <Screen edges={['top']}>
      <TabHeader title="Swing" />
      {loading ? <ListSkeleton /> : all.length > 0 ? (
        <>
          <View style={{ paddingHorizontal: margin, paddingBottom: t.space('Spacing/Padding/XSmall'), gap: t.space('Spacing/Gap/Small') }}>
            <Segmented size="Small" items={VIEWS} selectedIndex={view} onChange={setView} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space('Spacing/Gap/XSmall') }}>
              {PERIODS.map((p) => (
                <Chip key={p.key} text={p.label} icon={p.key === 'all' ? undefined : 'calendar-line'} select={period === p.key} onPress={() => setPeriod(p.key)} />
              ))}
              <Chip text={order === 'newest' ? 'Mới nhất trước' : 'Cũ nhất trước'} icon="switch-vertical-01-line" onPress={() => setOrder(order === 'newest' ? 'oldest' : 'newest')} />
            </View>
          </View>
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: margin,
              paddingTop: t.space('Spacing/Padding/XSmall'),
              // chừa chỗ cho nút nổi "Đăng swing"
              paddingBottom: t.size('Button/Size/Medium') + 2 * margin,
              gap: t.space('Spacing/Gap/Small'),
            }}
          >
            {swings.length === 0 ? (
              <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light">
                {`Không có swing nào trong ${PERIODS.find((p) => p.key === period)!.label} qua.`}
              </Text>
            ) : view === 0 ? (
              swings.map((w) => <SwingCard key={w.id} swing={w} />)
            ) : (
              // lưới 2 cột như ClubGrid: hàng lẻ thêm ô trống để ô cuối giữ nửa chiều ngang
              Array.from({ length: Math.ceil(swings.length / 2) }, (_, i) => swings.slice(i * 2, i * 2 + 2)).map((row, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: t.layout('Gutter') }}>
                  {row.map((w) => (
                    <SwingTile key={w.id} swing={w} />
                  ))}
                  {row.length === 1 && <View style={{ flex: 1 }} />}
                </View>
              ))
            )}
          </ScrollView>
          <View style={{ position: 'absolute', right: margin, bottom: margin }}>
            <Button size="Medium (Base)" leadingIcon="video-recorder-line" text="Đăng swing" onPress={post} />
          </View>
        </>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', padding: margin }}>
          <EmptyState
            icon="video-recorder-line"
            title="Chưa có swing nào"
            caption="Quay video swing theo hướng dẫn rồi đăng lên để nhận phân tích ước lượng và ghi chú từ HLV."
            primaryText="Đăng swing"
            onPrimary={post}
          />
        </View>
      )}
    </Screen>
  );
}
