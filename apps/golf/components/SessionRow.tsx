import { View } from 'react-native';
import { router } from 'expo-router';
import { Icon, ListItem, Tag, useTheme } from '@gr/ds';
import { SOURCE_LABELS, type MetricSession, type Units } from '../lib/domain';
import { useStore } from '../lib/store';
import { clubById, clubLabel } from '../lib/selectors';
import { formatDate, formatDistance, formatSpeed, formatValue } from '../lib/format';
import { FITNESS_FIELDS } from '../lib/validation';

/** Hàng phiên số liệu (tab Thông số, chi tiết học viên): swing → ngày · gậy, tốc độ · carry (theo `units` của người xem);
 *  thể lực → ngày, 4 chỉ số; Tag nguồn; chạm → chi tiết phiên. */
export function SessionRow({ session: s, units }: { session: MetricSession; units: Units }) {
  const t = useTheme();
  const { state } = useStore();
  const club = clubById(state, s.clubId);
  return (
    <ListItem
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
          <Icon name="chevron-right-line-medium" size={t.size('Element-Size/Popular/Base')} color="Color/Content/Neutral/Light" />
        </View>
      }
      onPress={() => router.push(`/metrics/${s.id}`)}
    />
  );
}
