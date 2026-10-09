import { View } from 'react-native';
import { Badge, Card, Text, useTheme } from '@gr/ds';

/** Ô chỉ số (Card nhỏ): nhãn, giá trị lớn + đơn vị, chênh lệch (xanh = tốt, đỏ = kém). Đặt trong hàng `flexDirection: 'row'` — các ô chia đều. */
export function StatTile({ label, value, unit, delta }: { label: string; value: string; unit?: string; delta?: { text: string; good: boolean } }) {
  const t = useTheme();
  return (
    <Card theme="Border" spacing="Small" style={{ flex: 1 }}>
      <View
        accessible
        accessibilityLabel={[label, unit ? `${value} ${unit}` : value, delta && `chênh lệch ${delta.text} so với phiên trước`].filter(Boolean).join(', ')}
        style={{ gap: t.space('Spacing/Gap/2XSmall') }}
      >
        <Text variant="Body/XSmall/Medium" color="Color/Content/Neutral/Light" numberOfLines={1}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: t.space('Spacing/Gap/2XSmall') }}>
          <Text variant="Heading/3">{value}</Text>
          {unit ? <Text variant="Body/Small/Medium" color="Color/Content/Neutral/Light">{unit}</Text> : null}
        </View>
        {delta && <Badge text={delta.text} size="XSmall" theme={delta.good ? 'Green' : 'Red'} />}
      </View>
    </Card>
  );
}
