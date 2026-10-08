import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { Text, useTheme } from '@gr/ds';
import { formatNumber } from '../../lib/format';

/**
 * Biểu đồ đường cũ → mới: polyline + chấm, nhãn x dưới trục, giá trị điểm cuối in đậm (`formatY`, mặc định số VN ≤ 1 chữ số thập phân).
 * Mỗi điểm nằm giữa một cột rộng đều, nên hàng nhãn x chỉ cần flex (không phải đo chữ). Chiều rộng đo bằng onLayout.
 */
export function TrendChart({
  data,
  height,
  accessibilityLabel,
  formatY = (y) => formatNumber(y, Number.isInteger(y) ? 0 : 1),
}: {
  data: { x: string; y: number }[];
  height?: number;
  accessibilityLabel: string;
  formatY?: (y: number) => string;
}) {
  const t = useTheme();
  const [width, setWidth] = useState(0);
  if (!data.length) return null;
  const h = height ?? t.primitive('gr-dm-160');
  const accent = t.color('Color/Content/Accent/Base');
  const stroke = t.weight('Emphasis/Border-Weight/Active');
  const dot = t.size('Element-Size/Popular/2XSmall') / 2;
  const lastDot = t.size('Element-Size/Popular/XSmall') / 2;
  const gap = t.space('Spacing/Gap/2XSmall');
  const labelH = t.text('Body/Base/DemiBold').lineHeight;
  const ys = data.map((d) => d.y);
  // Nhãn giá trị cuối nằm phía đường không đi tới: đoạn cuối đi xuống → nhãn dưới điểm, còn lại → trên; chừa chỗ đúng phía đó
  // (đặt cố định phía trên thì đoạn đi xuống dốc cắt qua chữ).
  const below = ys.length > 1 && ys[ys.length - 2] > ys[ys.length - 1];
  const room = labelH + gap + lastDot;
  const top = below ? lastDot : room;
  const bottom = h - (below ? room : lastDot);
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  const col = width / data.length;
  const pts = data.map((d, i) => ({ x: col * (i + 0.5), y: hi === lo ? (top + bottom) / 2 : bottom - ((d.y - lo) / (hi - lo)) * (bottom - top) }));
  const last = pts[pts.length - 1];
  const lastY = ys[ys.length - 1];
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel} style={{ gap: t.space('Spacing/Gap/XSmall') }}>
      <View style={{ height: h }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <>
            <Svg width={width} height={h}>
              {[top, (top + bottom) / 2, bottom].map((y, i) => (
                <Line key={i} x1={0} x2={width} y1={y} y2={y} stroke={t.color('Color/Border/Neutral/Pale/Default')} strokeWidth={1} />
              ))}
              <Polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={accent} strokeWidth={stroke} strokeLinejoin="round" strokeLinecap="round" />
              {pts.map((p, i) =>
                i === pts.length - 1 ? (
                  <Circle key={i} cx={p.x} cy={p.y} r={lastDot} fill={accent} />
                ) : (
                  <Circle key={i} cx={p.x} cy={p.y} r={dot} fill={t.color('Color/Background/Surface/Default')} stroke={accent} strokeWidth={stroke} />
                ),
              )}
            </Svg>
            {/* hộp rộng 2 cột, tâm ở điểm cuối: nhãn có đơn vị không bị cắt dù cột hẹp */}
            <View style={{ position: 'absolute', left: last.x - col, width: 2 * col, top: below ? last.y + lastDot + gap : last.y - lastDot - gap - labelH }}>
              <Text variant="Body/Base/DemiBold" color="Color/Content/Accent/Base" numberOfLines={1} style={{ textAlign: 'center' }}>
                {formatY(lastY)}
              </Text>
            </View>
          </>
        )}
      </View>
      <View style={{ flexDirection: 'row' }}>
        {data.map((d, i) => (
          <Text key={i} variant="Caption/Regular" color="Color/Content/Neutral/Light" numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>
            {d.x}
          </Text>
        ))}
      </View>
    </View>
  );
}
