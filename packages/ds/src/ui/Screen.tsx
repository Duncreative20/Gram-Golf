import type { PropsWithChildren } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';
import type { ThemeLightKey } from '../generated/keys';

/**
 * Khung màn. Figma `Mobile/Content-Area` (40012219:21010) chỉ là slot rộng Viewport-Width → children đặt thẳng.
 * `bottomIndicator` = Figma `System/Bottom-Indicator` (308:46297): thanh 121×4 (gần nhất: gr-dm-128 × gr-dm-4), padding trên Medium / dưới XSmall.
 */
export function Screen({
  background = 'Color/Background/Canvas/Alt',
  edges = ['top', 'bottom'],
  bottomIndicator,
  children,
}: PropsWithChildren<{ background?: ThemeLightKey; edges?: Edge[]; bottomIndicator?: boolean }>) {
  const t = useTheme();
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: t.color(background) }}>
      <StatusBar barStyle={t.scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={{ flex: 1 }}>{children}</View>
      {bottomIndicator ? (
        <View style={{ alignItems: 'center', paddingTop: t.space('Spacing/Padding/Medium'), paddingBottom: t.space('Spacing/Padding/XSmall'), paddingHorizontal: t.layout('Margin-Comfortable') }}>
          <View style={{ width: t.primitive('gr-dm-128'), height: t.primitive('gr-dm-4'), borderRadius: t.radius('Corner-Radius/Rounded'), backgroundColor: t.color('Color/Background/Neutral/Subtle/Pressed') }} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}
