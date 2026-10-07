// Dựng lại từ ảnh logo 07/10/2026 — thay bằng SVG gốc khi có (NỢ BRAND).
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Text, useTheme } from '@gr/ds';

// 3 chevron hướng lên, tầng cách đều 16 (khe ≈ nét); chevron dưới uốn thành chữ G (nét ngang vào trong ở phải dưới).
const MARK = 'M8 29 L32 5 L56 29 M8 45 L32 21 L56 45 M44 49 L32 37 L8 61 L16 69 L48 69 L56 61 L56 55 L38 55';
// Nét theo đơn vị viewBox (64×72) để logo co giãn đều (≈ size/12 px). Brief gợi ý size/10 (≈ 7 đơn vị) — đo thử: khe giữa các tầng
// dính lại ở cỡ 32, nên chọn 6 = khe ≈ nét.
const STROKE = 6;

export function Logo({ size, variant = 'mark', tone = 'brand' }: { size?: number; variant?: 'mark' | 'full'; tone?: 'brand' | 'onBrand' }) {
  const t = useTheme();
  const h = size ?? t.primitive('gr-dm-48');
  const mark = (
    <Svg width={(h * 64) / 72} height={h} viewBox="0 0 64 72">
      <Path
        d={MARK}
        fill="none"
        stroke={t.color(tone === 'brand' ? 'Color/Background/Accent/Solid/Default' : 'Color/Content/On-Accent/Default')}
        strokeWidth={STROKE}
        strokeLinejoin="miter"
      />
    </Svg>
  );
  return (
    <View accessible accessibilityRole="image" accessibilityLabel="GramGolf" style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/Small') }}>
      {mark}
      {variant === 'full' && (
        // Trên nền teal (onBrand) chữ dùng navy On-Accent như biểu tượng; nền thường dùng Neutral/Strongest.
        <Text variant="Heading/3" color={tone === 'brand' ? 'Color/Content/Neutral/Strongest' : 'Color/Content/On-Accent/Default'}>GramGolf</Text>
      )}
    </View>
  );
}
