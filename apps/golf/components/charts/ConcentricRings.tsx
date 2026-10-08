import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text, useTheme, type ThemeLightKey } from '@gr/ds';

// Ngoài → trong: thang Brand từ bước thấp (nhạt) tới cao (đậm). Soft < Solid < Deep theo độ nổi trên nền, đúng cả sáng lẫn tối.
const FILLS: ThemeLightKey[] = ['Color/Background/Support/Brand/Soft', 'Color/Background/Support/Brand/Solid', 'Color/Background/Support/Brand/Deep'];

/** Tối đa 3 hình tròn đồng tâm, bán kính ∝ value / max (lớn nhất ở ngoài cùng, nhạt nhất); chú thích bên phải. 1 gậy → chỉ chú thích. */
export function ConcentricRings({ items, accessibilityLabel }: { items: { label: string; value: number; display: string }[]; accessibilityLabel: string }) {
  const t = useTheme();
  const size = t.primitive('gr-dm-144');
  const swatch = t.size('Element-Size/Popular/XSmall');
  const rings = [...items].sort((a, b) => b.value - a.value).slice(0, FILLS.length);
  const max = rings[0]?.value || 1;
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel} style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/Large') }}>
      {/* 1 gậy → một đĩa đặc to, không còn là vòng đồng tâm: chỉ hàng chú giải */}
      {rings.length > 1 && (
        <Svg width={size} height={size}>
          {rings.map((r, i) => (
            <Circle key={i} cx={size / 2} cy={size / 2} r={((size / 2) * r.value) / max} fill={t.color(FILLS[i])} />
          ))}
        </Svg>
      )}
      <View style={{ flex: 1, gap: t.space('Spacing/Gap/Small') }}>
        {rings.map((r, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/XSmall') }}>
            <View style={{ width: swatch, height: swatch, borderRadius: t.radius('Corner-Radius/Rounded'), backgroundColor: t.color(FILLS[i]) }} />
            <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Base" numberOfLines={1} style={{ flex: 1 }}>
              {r.label}
            </Text>
            <Text variant="Body/Base/DemiBold">{r.display}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
