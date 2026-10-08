import { ScrollView, View } from 'react-native';
import { Redirect } from 'expo-router';
import { RadioRow, Screen, useTheme } from '@gr/ds';
import type { Units } from '../../lib/domain';
import { useStore } from '../../lib/store';
import { prefsOf } from '../../lib/selectors';
import { formatDistance } from '../../lib/format';
import { StackHeader } from '../../components/StackHeader';
import { Section } from '../../components/Section';

const UNITS: { value: Units; label: string }[] = [
  { value: 'metric', label: 'Mét' },
  { value: 'imperial', label: 'Yard' },
];

/** Đơn vị hiển thị khoảng cách (D9: dữ liệu luôn lưu mét, chỉ đổi cách hiện). Chọn là lưu ngay. */
export default function UnitSettings() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  if (!me) return <Redirect href="/" />;
  const units = prefsOf(state, me.id).units;
  return (
    <Screen>
      <StackHeader title="Đơn vị đo" />
      <ScrollView contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/Medium') }}>
        <Section title="Khoảng cách" caption="Áp dụng cho carry ở Tổng quan, Thông số, Bộ gậy và form nhập. Dữ liệu đã lưu không đổi.">
          <View accessibilityRole="radiogroup" accessibilityLabel="Đơn vị khoảng cách" style={{ paddingHorizontal: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/XSmall') }}>
            {UNITS.map((u) => (
              <RadioRow
                key={u.value}
                label={u.label}
                caption={`Ví dụ: Carry ${formatDistance(228, u.value)}`}
                select={units === u.value}
                onPress={() => dispatch({ type: 'setPrefs', userId: me.id, patch: { units: u.value } })}
              />
            ))}
          </View>
        </Section>
      </ScrollView>
    </Screen>
  );
}
