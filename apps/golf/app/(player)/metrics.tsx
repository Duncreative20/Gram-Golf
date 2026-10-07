import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router, type Href } from 'expo-router';
import { Button, EmptyState, Icon, IconButton, ListItem, Screen, Segmented, Tag, Text, useTheme, type IconName } from '@gr/ds';
import { SOURCE_LABELS } from '../../lib/domain';
import { useStore } from '../../lib/store';
import { clubById, clubLabel, clubsOf, prefsOf, sessionsOf } from '../../lib/selectors';
import { formatDate, formatDistance, formatSpeed, formatValue } from '../../lib/format';
import { FITNESS_FIELDS } from '../../lib/validation';
import { TabHeader } from '../../components/TabHeader';

const SEGMENTS = [{ label: 'Swing' }, { label: 'Thể lực' }, { label: 'Bộ gậy' }];
// Nút "+" và empty state của từng segment dẫn tới đúng chỗ thêm: thể lực chỉ nhập tay, Bộ gậy → thêm gậy.
const ADD: { label: string; href: Href; icon: IconName; title: string; caption: string }[] = [
  { label: 'Nhập số liệu', href: '/metrics/add', icon: 'bar-chart-square-02-line', title: 'Chưa có phiên swing', caption: 'Nhập số liệu từ máy đo (file CSV, ảnh chụp màn hình) hoặc nhập tay để theo dõi tiến bộ.' },
  { label: 'Nhập thể lực', href: { pathname: '/metrics/manual', params: { kind: 'fitness' } }, icon: 'activity-heart-line', title: 'Chưa có phiên thể lực', caption: 'Ghi cân nặng, độ dẻo, lực nắm và bật cao để theo dõi thể lực.' },
  { label: 'Thêm gậy', href: '/clubs/new', icon: 'flag-01-line', title: 'Chưa có gậy nào', caption: 'Thêm gậy để gắn với từng phiên số liệu và video swing.' },
];

export default function PlayerMetrics() {
  const t = useTheme();
  const { state, me } = useStore();
  const [seg, setSeg] = useState(0);
  if (!me) return <Redirect href="/" />;
  const units = prefsOf(state, me.id).units;
  const add = ADD[seg];
  const chevron = <Icon name="chevron-right-line-medium" size={t.size('Element-Size/Popular/Base')} color="Color/Content/Neutral/Light" />;
  const rows =
    seg === 2
      ? clubsOf(state, me.id).map((c) => <ListItem key={c.id} title={clubLabel(c)} caption={`${c.brand} ${c.model} · ${formatValue(c.loftDeg, '°')} · ${c.shaftFlex}`} />)
      : sessionsOf(state, me.id, seg === 0 ? 'swing' : 'fitness').map((s) => {
          const club = clubById(state, s.clubId);
          return (
            <ListItem
              key={s.id}
              title={s.kind === 'swing' ? `${formatDate(s.capturedAt)} · ${club ? clubLabel(club) : 'Chưa gắn gậy'}` : formatDate(s.capturedAt)}
              caption={
                s.kind === 'swing'
                  ? `${formatSpeed(s.swing.clubSpeedMph)} · ${formatDistance(s.swing.carryM, units)}`
                  : // khoảng trắng không ngắt trong từng chỉ số → xuống dòng chỉ ở " · ", không tách "45 | kg"
                    FITNESS_FIELDS.map((f) => `${f.label} ${formatValue(s.fitness[f.key], f.unit, f.digits)}`.replace(/ /g, '\u00a0')).join(' · ')
              }
              trailing={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/XSmall') }}>
                  <Tag size="Small" text={SOURCE_LABELS[s.source]} />
                  {chevron}
                </View>
              }
              onPress={() => router.push(`/metrics/${s.id}`)}
            />
          );
        });
  return (
    <Screen edges={['top']}>
      <TabHeader title="Thông số" />
      <View style={{ paddingHorizontal: t.layout('Margin-Small'), paddingBottom: t.space('Spacing/Padding/Small') }}>
        <Segmented items={SEGMENTS} selectedIndex={seg} onChange={setSeg} />
      </View>
      {rows.length ? (
        <>
          {/* chừa chỗ cho nút "+" nổi */}
          <ScrollView contentContainerStyle={{ paddingBottom: t.size('Button/Size/Large') + 2 * t.layout('Margin-Small') }}>
            {seg === 2 && (
              // ponytail: danh sách gậy đơn giản — Task 8 thay bằng ClubGrid của clubs/index
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: t.layout('Margin-Small') }}>
                <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light">{`${rows.length} gậy`}</Text>
                <Button type="Flat" level="Accent" size="Small" trailingIcon="chevron-right-line-small" text="Quản lý bộ gậy" onPress={() => router.push('/clubs')} />
              </View>
            )}
            {rows}
          </ScrollView>
          <View style={{ position: 'absolute', right: t.layout('Margin-Small'), bottom: t.layout('Margin-Small') }}>
            <IconButton icon="plus-line" accessibilityLabel={add.label} onPress={() => router.push(add.href)} />
          </View>
        </>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
          <EmptyState icon={add.icon} title={add.title} caption={add.caption} primaryText={add.label} onPrimary={() => router.push(add.href)} />
        </View>
      )}
    </Screen>
  );
}
