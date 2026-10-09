import type { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Avatar, Button, Card, EmptyState, Icon, ListItem, Screen, Skeleton, SkeletonText, Tag, Text, useTheme } from '@gr/ds';
import { SOURCE_LABELS } from '../../lib/domain';
import { NOW } from '../../lib/mock';
import { useStore } from '../../lib/store';
import {
  carryByClub, clubById, clubLabel, followerCount, followingCount, latestNote, latestSwing, prefsOf, previousSwing, primaryCoach, profileById, speedTrend, swingsOf,
} from '../../lib/selectors';
import { formatDate, formatDistance, formatNumber, formatSec, formatSpeed, initials, relativeTime, swingTiles } from '../../lib/format';
import { TabHeader } from '../../components/TabHeader';
import { StatTile } from '../../components/StatTile';
import { TrendChart } from '../../components/charts/TrendChart';
import { ConcentricRings } from '../../components/charts/ConcentricRings';
import { useFirstLoad } from '../../components/ListSkeleton';

function Section({ title, caption, children }: PropsWithChildren<{ title: string; caption?: string }>) {
  const t = useTheme();
  return (
    <View style={{ gap: t.space('Spacing/Gap/Small') }}>
      <View style={{ gap: t.space('Spacing/Gap/3XSmall') }}>
        <Text variant="Heading/Subheading" accessibilityRole="header">{title}</Text>
        {caption ? <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light">{caption}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export default function PlayerHome() {
  const t = useTheme();
  const { state, me } = useStore();
  // Lần đầu mở trong phiên: giả lập tải dữ liệu → khung xương (bản thật: chờ API)
  const loading = useFirstLoad('home');
  if (!me) return <Redirect href="/" />;
  if (loading) {
    return (
      <Screen edges={['top']}>
        <TabHeader />
        <View accessible accessibilityLabel="Đang tải tổng quan" style={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/XLarge') }}>
          <Card style={{ backgroundColor: t.color('Color/Background/Accent/Subtle/Default'), gap: t.space('Spacing/Gap/Medium') }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/Medium') }}>
              <Skeleton shape="Round" size="Large - 48px" />
              <View style={{ flex: 1, gap: t.space('Spacing/Gap/XSmall') }}>
                <SkeletonText heading="Medium" />
                <SkeletonText />
              </View>
            </View>
            <Skeleton size="Large - 48px" />
          </Card>
          <View style={{ gap: t.space('Spacing/Gap/Small') }}>
            <SkeletonText heading="Small" />
            {[0, 1].map((row) => (
              <View key={row} style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/Small') }}>
                {[0, 1].map((i) => (
                  <View key={i} style={{ flex: 1 }}>
                    <Skeleton size="Large - 48px" />
                  </View>
                ))}
              </View>
            ))}
          </View>
          <View style={{ gap: t.space('Spacing/Gap/Small') }}>
            <SkeletonText heading="Small" />
            <SkeletonText lines={5} />
          </View>
        </View>
      </Screen>
    );
  }
  const units = prefsOf(state, me.id).units;
  const latest = latestSwing(state, me.id);
  const prev = latest && previousSwing(state, latest);
  const club = clubById(state, latest?.clubId);
  const tiles = latest ? swingTiles(latest.swing, prev?.swing, units) : [];
  const trend = speedTrend(state, me.id).map((p) => ({ x: formatDate(p.date).slice(0, 5), y: p.clubSpeedMph }));
  const carry = carryByClub(state, me.id).map((c) => ({ label: clubLabel(c.club), value: c.carryM, display: formatDistance(c.carryM, units) }));
  const coach = primaryCoach(state, me.id);
  const note = latestNote(state, me.id);
  const noteCoach = note && profileById(state, note.coachId);
  const noteClub = clubById(state, note && swingsOf(state, me.id).find((w) => w.id === note.swingId)?.clubId);
  const counts = [
    { n: followerCount(state, me.id, me.id), label: 'Người theo dõi' },
    { n: followingCount(state, me.id, me.id), label: 'Đang theo dõi' },
  ];
  return (
    <Screen edges={['top']}>
      <TabHeader />
      <ScrollView
        contentContainerStyle={{
          padding: t.layout('Margin-Small'),
          // chừa chỗ cho CTA nổi "Nhập số liệu"
          paddingBottom: latest ? t.size('Button/Size/Medium') + 2 * t.layout('Margin-Small') : t.layout('Margin-Small'),
          gap: t.space('Spacing/Gap/XLarge'),
        }}
      >
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
              {me.handicap !== undefined && (
                <Text variant="Body/Base/Medium" color="Color/Content/Neutral/Base">{`Handicap ${formatNumber(me.handicap, Number.isInteger(me.handicap) ? 0 : 1)}`}</Text>
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
          <View style={{ backgroundColor: t.color('Color/Background/Surface/Default'), borderRadius: t.radius('Corner-Radius/Base') }}>
            {coach ? (
              <ListItem
                type="Grouped"
                title={coach.name}
                caption="HLV chính"
                leading={
                  <View aria-hidden>
                    <Avatar size="Medium" theme={coach.avatarUrl ? 'Photo' : 'Accent'} source={coach.avatarUrl ? { uri: coach.avatarUrl } : undefined} initials={initials(coach.name)} />
                  </View>
                }
                trailing={<Icon name="chevron-right-line-medium" size={t.size('Element-Size/Popular/Base')} color="Color/Content/Neutral/Light" />}
                onPress={() => router.push(`/coaches/${coach.id}`)}
              />
            ) : (
              <ListItem
                type="Grouped"
                title="Chưa có HLV chính"
                caption="Nhập mã mời từ HLV để kết nối"
                trailing={<Icon name="chevron-right-line-medium" size={t.size('Element-Size/Popular/Base')} color="Color/Content/Neutral/Light" />}
                onPress={() => router.push('/connect/accept')}
              />
            )}
          </View>
        </Card>

        {latest ? (
          <>
            <Section title="Chỉ số swing gần nhất">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/XSmall') }}>
                <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light">
                  {[club && clubLabel(club), formatDate(latest.capturedAt)].filter(Boolean).join(' · ')}
                </Text>
                <Tag size="Small" text={SOURCE_LABELS[latest.source]} />
              </View>
              {[tiles.slice(0, 2), tiles.slice(2)].map((row, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/Small') }}>
                  {row.map((x) => (
                    <StatTile key={x.label} {...x} />
                  ))}
                </View>
              ))}
              <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">
                {prev && club ? `So với phiên ${clubLabel(club)} ngày ${formatDate(prev.capturedAt)}` : 'Chưa có phiên trước cùng gậy để so sánh'}
              </Text>
            </Section>

            <Section title={trend.length ? `Xu hướng tốc độ đầu gậy (Driver, ${trend.length} buổi)` : 'Xu hướng tốc độ đầu gậy (Driver)'}>
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
            </Section>

            {carry.length > 0 && (
              <Section title="Carry theo gậy" caption={`Carry trung bình của ${carry.length} gậy xa nhất`}>
                <Card theme="Border">
                  <ConcentricRings items={carry} accessibilityLabel={`Carry trung bình theo gậy: ${carry.map((c) => `${c.label} ${c.display}`).join(', ')}`} />
                </Card>
              </Section>
            )}
          </>
        ) : (
          <EmptyState
            icon="bar-chart-square-02-line"
            title="Chưa có số liệu"
            caption="Nhập buổi tập đầu tiên để xem chỉ số swing, xu hướng tốc độ và carry theo gậy."
            primaryText="Nhập số liệu đầu tiên"
            onPrimary={() => router.push('/metrics/add')}
          />
        )}

        {note && (
          <Section title="Ghi chú mới từ HLV">
            <Card theme="Border" onPress={() => router.push(`/swings/${note.swingId}`)}>
              <View style={{ gap: t.space('Spacing/Gap/Small') }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/XSmall') }}>
                  <View aria-hidden>
                    <Avatar size="Small" theme={noteCoach?.avatarUrl ? 'Photo' : 'Accent'} source={noteCoach?.avatarUrl ? { uri: noteCoach.avatarUrl } : undefined} initials={initials(noteCoach?.name ?? '')} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="Body/Base/DemiBold" numberOfLines={1}>{noteCoach?.name ?? 'HLV'}</Text>
                    <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">
                      {[relativeTime(note.createdAt, NOW), noteClub && clubLabel(noteClub), note.atSec !== undefined && `mốc ${formatSec(note.atSec)}`].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                </View>
                <Text variant="Body/Base/Regular" numberOfLines={3}>{note.text}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/3XSmall') }}>
                  <Text variant="Body/Small/DemiBold" color="Color/Content/Accent/Base">Xem swing</Text>
                  <Icon name="chevron-right-line-small" size={t.size('Element-Size/Popular/Small')} color="Color/Content/Accent/Base" />
                </View>
              </View>
            </Card>
          </Section>
        )}
      </ScrollView>
      {latest && (
        <View style={{ position: 'absolute', right: t.layout('Margin-Small'), bottom: t.layout('Margin-Small') }}>
          <Button size="Medium (Base)" leadingIcon="plus-line" text="Nhập số liệu" onPress={() => router.push('/metrics/add')} />
        </View>
      )}
    </Screen>
  );
}
