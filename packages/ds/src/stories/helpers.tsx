import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { Text } from '../ui/Text';

/** Khung xếp story: hàng/cột dùng token gap, không số lẻ (check:literals). */
export function Row({ children, wrap = true }: PropsWithChildren<{ wrap?: boolean }>) {
  const t = useTheme();
  return <View style={{ flexDirection: 'row', flexWrap: wrap ? 'wrap' : 'nowrap', alignItems: 'center', gap: t.space('Spacing/Gap/Small') }}>{children}</View>;
}
export function Col({ children }: PropsWithChildren) {
  const t = useTheme();
  return <View style={{ gap: t.space('Spacing/Gap/Medium'), alignSelf: 'stretch' }}>{children}</View>;
}
export function Label({ children }: PropsWithChildren) {
  return <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">{children}</Text>;
}
/** Hộp nền tối cố định cho component overlay (token On-Dark-Overlay chỉ đúng trên nền tối). */
export function DarkBox({ children }: PropsWithChildren) {
  const t = useTheme();
  return (
    <View style={{ backgroundColor: t.color(t.scheme === 'dark' ? 'Color/Background/Inverse/Solid/Default' : 'Color/Background/Neutral/Solid/Default'), padding: t.space('Spacing/Padding/Medium'), borderRadius: t.radius('Corner-Radius/Large'), gap: t.space('Spacing/Gap/Small') }}>
      {children}
    </View>
  );
}
