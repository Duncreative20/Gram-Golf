import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Avatar, Card, Dialog, EmptyState, Screen, Segmented, TabBar, Text, useTheme } from '@gr/ds';
import { SOURCE_LABELS } from '../../lib/domain';
import { NOW } from '../../lib/mock';
import { useStore } from '../../lib/store';
import {
  awaitsFeedback, canViewPrivate, clubById, clubLabel, clubsOf, latestFitness, latestSwing, openConnection, prefsOf, previousSwing, profileById, sessionsOf, speedTrend, swingsByReview, swingsOf,
} from '../../lib/selectors';
import { formatDate, formatNumber, formatSpeed, formatValue, initials, swingTiles } from '../../lib/format';
import { FITNESS_FIELDS } from '../../lib/validation';
import { StackHeader } from '../../components/StackHeader';
import { Section } from '../../components/Section';
import { StatTile } from '../../components/StatTile';
import { TrendChart } from '../../components/charts/TrendChart';
import { SessionRow } from '../../components/SessionRow';
import { SwingCard } from '../../components/SwingCard';
import { NoAccess } from '../../components/NoAccess';
import { ClubGrid } from '../clubs';

type Tile = Parameters<typeof StatTile>[0];

/** Chi tiết học viên (HLV xem): cổng canViewPrivate (D6) — chỉ HLV có kết nối active (hoặc chính người chơi) xem được;
 *  người theo dõi, HLV đã bị huỷ kết nối → NoAccess. 5 tab: Tổng quan · Thông số · Swing (→ swings/[id] để ghi chú) · Bộ gậy · Thể lực. */
export default function StudentDetail() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tab, setTab] = useState(0);
  const [review, setReview] = useState(0); // tab Swing của HLV: 0 Chưa review, 1 Đã review
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  if (!me) return <Redirect href="/" />;
  const student = profileById(state, id);
  if (student?.role !== 'player' || !canViewPrivate(state, me.id, student.id)) {
    const revoked = state.connections.some((c) => c.coachId === me.id && c.playerId === id && c.status === 'revoked' && c.acceptedAt);
    return (
      <Screen>
        <StackHeader title="Học viên" />
        <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
          {student?.role === 'player' ? (
            <NoAccess reason={revoked ? 'Kết nối với học viên này đã bị huỷ nên bạn không còn xem được dữ liệu của họ.' : undefined} />
          ) : (
            <EmptyState
              icon="file-search-line"
              title="Không tìm thấy học viên"
              caption="Học viên này không tồn tại."
              primaryText="Quay lại"
              onPrimary={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            />
          )}
        </View>
      </Screen>
    );
  }

  const units = prefsOf(state, me.id).units; // hiển thị theo đơn vị của người xem
  // HLV đang có kết nối active (đã qua cổng canViewPrivate) được tự huỷ kết nối — MVP §5 "Hủy kết nối học viên/HLV"
  const connection = me.role === 'coach' ? openConnection(state, me.id, student.id) : undefined;
  const swings = swingsOf(state, student.id);
  const awaiting = me.role === 'coach' ? swings.filter((w) => awaitsFeedback(state, w, me.id)) : [];
  const pad = { paddingHorizontal: t.layout('Margin-Small') };
  const empty = (text: string) => (
    <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light" style={pad}>{text}</Text>
  );
  const tiles = (items: Tile[]) =>
    [items.slice(0, 2), items.slice(2)].map((row, i) => (
      <View key={i} style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/Small') }}>
        {row.map((x) => (
          <StatTile key={x.label} {...x} />
        ))}
      </View>
    ));

  const overview = () => {
    const latest = latestSwing(state, student.id);
    if (!latest) return empty('Học viên chưa có phiên swing nào.');
    const prev = previousSwing(state, latest);
    const club = clubById(state, latest.clubId);
    const trend = speedTrend(state, student.id).map((p) => ({ x: formatDate(p.date).slice(0, 5), y: p.clubSpeedMph }));
    return (
      <>
        <Section title="Chỉ số swing gần nhất" caption={[club && clubLabel(club), formatDate(latest.capturedAt), SOURCE_LABELS[latest.source]].filter(Boolean).join(' · ')}>
          <View style={[pad, { gap: t.space('Spacing/Gap/Small') }]}>
            {tiles(swingTiles(latest.swing, prev?.swing, units))}
            <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">
              {prev && club ? `So với phiên ${clubLabel(club)} ngày ${formatDate(prev.capturedAt)}` : 'Chưa có phiên trước cùng gậy để so sánh'}
            </Text>
          </View>
        </Section>
        <Section title={trend.length ? `Xu hướng tốc độ đầu gậy (Driver, ${trend.length} buổi)` : 'Xu hướng tốc độ đầu gậy (Driver)'}>
          <View style={pad}>
            <Card theme="Border">
              {trend.length ? (
                <TrendChart
                  data={trend}
                  formatY={formatSpeed}
                  accessibilityLabel={`Tốc độ đầu gậy Driver, ${trend.length} buổi gần nhất: ${trend.map((p) => `${p.x} ${formatSpeed(p.y)}`).join(', ')}`}
                />
              ) : (
                <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light">Chưa có buổi Driver nào.</Text>
              )}
            </Card>
          </View>
        </Section>
      </>
    );
  };

  const metrics = () => {
    const sessions = sessionsOf(state, student.id, 'swing');
    if (!sessions.length) return empty('Học viên chưa có phiên swing nào.');
    return (
      <View>
        {sessions.map((s) => (
          <SessionRow key={s.id} session={s} units={units} />
        ))}
      </View>
    );
  };

  const swingList = () => {
    if (!swings.length) return empty('Học viên chưa đăng swing nào.');
    if (me.role !== 'coach') {
      return (
        <View style={[pad, { gap: t.space('Spacing/Gap/Small') }]}>
          {swings.map((w) => (
            <SwingCard key={w.id} swing={w} />
          ))}
        </View>
      );
    }
    // MVP "Đã review / Chưa review": theo ghi chú của chính HLV đang xem (swingsByReview)
    const groups = swingsByReview(state, student.id, me.id);
    const list = review === 0 ? groups.unreviewed : groups.reviewed;
    return (
      <View style={[pad, { gap: t.space('Spacing/Gap/Small') }]}>
        <Segmented
          items={[
            { label: 'Chưa review', badge: String(groups.unreviewed.length) },
            { label: 'Đã review', badge: String(groups.reviewed.length) },
          ]}
          selectedIndex={review}
          onChange={setReview}
        />
        <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light">Chạm một swing để xem phân tích, chèn mốc và ghi chú.</Text>
        {list.length ? (
          list.map((w) => <SwingCard key={w.id} swing={w} awaitingFeedback={awaiting.includes(w)} />)
        ) : (
          <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light">
            {review === 0 ? 'Không còn swing nào chờ bạn review.' : 'Bạn chưa ghi chú swing nào của học viên này.'}
          </Text>
        )}
      </View>
    );
  };

  const clubList = () => {
    const clubs = clubsOf(state, student.id);
    if (!clubs.length) return empty('Học viên chưa thêm gậy nào.');
    return (
      <View style={pad}>
        <ClubGrid clubs={clubs} />
      </View>
    );
  };

  const fitness = () => {
    const latest = latestFitness(state, student.id);
    if (!latest) return empty('Học viên chưa có phiên thể lực nào.');
    const history = sessionsOf(state, student.id, 'fitness');
    return (
      <>
        <Section title="Thể lực gần nhất" caption={`${formatDate(latest.capturedAt)} · ${SOURCE_LABELS[latest.source]}`}>
          <View style={[pad, { gap: t.space('Spacing/Gap/Small') }]}>
            {tiles(FITNESS_FIELDS.map((f) => ({ label: f.label, value: formatNumber(latest.fitness[f.key], f.digits), unit: f.unit })))}
          </View>
        </Section>
        <Section title="Lịch sử" caption={`${history.length} phiên`}>
          {history.map((s) => (
            <SessionRow key={s.id} session={s} units={units} />
          ))}
        </Section>
      </>
    );
  };

  const TABS = [
    { label: 'Tổng quan', render: overview },
    { label: 'Thông số', render: metrics },
    // badge: số swing chờ HLV này phản hồi — nối với "Cần phản hồi" ở tab Học viên
    { label: 'Swing', badge: awaiting.length ? String(awaiting.length) : undefined, render: swingList },
    { label: 'Bộ gậy', render: clubList },
    { label: 'Thể lực', render: fitness },
  ];
  return (
    <Screen>
      <StackHeader
        title="Học viên"
        actions={connection ? [{ icon: 'user-minus-line', accessibilityLabel: `Huỷ kết nối với ${student.name}`, onPress: () => setConfirmRevoke(true) }] : undefined}
      />
      <View style={[pad, { flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/Medium'), paddingBottom: t.space('Spacing/Padding/Small') }]}>
        <View aria-hidden>
          <Avatar size="Large" theme={student.avatarUrl ? 'Photo' : 'Accent'} source={student.avatarUrl ? { uri: student.avatarUrl } : undefined} initials={initials(student.name)} />
        </View>
        <View style={{ flex: 1, gap: t.space('Spacing/Gap/3XSmall') }}>
          <Text variant="Heading/4" numberOfLines={2}>{student.name}</Text>
          <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light">
            {[student.handicap !== undefined && `Handicap ${formatValue(student.handicap)}`, student.homeClub].filter(Boolean).join(' · ')}
          </Text>
        </View>
      </View>
      {/* 5 tab (có badge) có thể rộng hơn màn → cuộn ngang. flexGrow/flexShrink 0: thanh tab giữ đúng chiều cao của nó —
          không chiếm chỗ còn lại, không bị nén khi nội dung tab dài (mặc định ScrollView co lại → thanh tab nhảy 8px khi đổi tab) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, flexShrink: 0 }}>
        <TabBar items={TABS} selectedIndex={tab} onChange={setTab} />
      </ScrollView>
      <ScrollView key={tab} contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/Medium'), gap: t.space('Spacing/Gap/XLarge') }}>
        {TABS[tab].render()}
      </ScrollView>
      <Dialog
        visible={confirmRevoke}
        onRequestClose={() => setConfirmRevoke(false)}
        theme="Warning"
        title={`Huỷ kết nối với ${student.name}?`}
        body="Bạn sẽ mất quyền xem thông số, swing, bộ gậy và thể lực của học viên ngay lập tức. Ghi chú đã gửi vẫn được giữ."
        primaryText="Huỷ kết nối"
        destructive
        onPrimary={() => {
          setConfirmRevoke(false);
          // vẽ lại ngay → nhánh NoAccess "Kết nối … đã bị huỷ" (403) — đúng điều HLV vừa được cảnh báo
          if (connection) dispatch({ type: 'revokeConnection', id: connection.id, at: NOW });
        }}
        secondaryText="Giữ kết nối"
      />
    </Screen>
  );
}
