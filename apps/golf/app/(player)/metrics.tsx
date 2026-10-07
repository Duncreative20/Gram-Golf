import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router, type Href } from 'expo-router';
import { EmptyState, IconButton, Screen, Segmented, useTheme, type IconName } from '@gr/ds';
import { useStore } from '../../lib/store';
import { clubsOf, prefsOf, sessionsOf } from '../../lib/selectors';
import { TabHeader } from '../../components/TabHeader';
import { SessionRow } from '../../components/SessionRow';
import { ClubGrid } from '../clubs';

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
  const clubs = clubsOf(state, me.id);
  const rows = seg === 2 ? [] : sessionsOf(state, me.id, seg === 0 ? 'swing' : 'fitness').map((s) => <SessionRow key={s.id} session={s} units={units} />);
  return (
    <Screen edges={['top']}>
      <TabHeader title="Thông số" />
      <View style={{ paddingHorizontal: t.layout('Margin-Small'), paddingBottom: t.space('Spacing/Padding/Small') }}>
        <Segmented items={SEGMENTS} selectedIndex={seg} onChange={setSeg} />
      </View>
      {(seg === 2 ? clubs.length : rows.length) > 0 ? (
        <>
          {/* chừa chỗ cho nút "+" nổi */}
          <ScrollView contentContainerStyle={{ paddingBottom: t.size('Button/Size/Large') + 2 * t.layout('Margin-Small') }}>
            {seg === 2 ? (
              <View style={{ paddingHorizontal: t.layout('Margin-Small') }}>
                <ClubGrid clubs={clubs} />
              </View>
            ) : (
              rows
            )}
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
