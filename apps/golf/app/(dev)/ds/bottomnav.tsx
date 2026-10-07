import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { BottomNavigation, Screen, Text, useTheme, type BottomNavTheme } from '@gr/ds';

const THEMES: BottomNavTheme[] = ['Neutral', 'Accent', 'Neutral-Surface', 'Accent-Surface', 'Neutral-Solid', 'Accent-Solid', 'Overlay'];

export default function BottomNavGallery() {
  const t = useTheme();
  const [i, setI] = useState(0);
  const items = [
    { label: 'Trang chủ', icon: 'home-02-line' as const, iconSelected: 'home-02-solid' as const },
    { label: 'Khám phá', icon: 'search-medium-line' as const },
    { label: 'Chuyến đi', icon: 'luggage-02-line' as const, iconSelected: 'luggage-02-solid' as const, noti: true },
    { label: 'Cửa hàng', icon: 'shopping-cart-line-2' as const, noti: '3' },
    { label: 'Hội viên', icon: 'user-circle-line' as const, iconSelected: 'user-circle-solid' as const },
  ];
  return (
    <Screen background="Color/Background/Surface/Alt">
      <ScrollView contentContainerStyle={{ paddingVertical: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Heading/Subheading" style={{ paddingHorizontal: t.layout('Margin-Small') }}>Bottom-Navigation/Mobile/Floating</Text>
        {THEMES.map((th) => (
          <View key={th} style={{ gap: t.space('Spacing/Gap/XSmall') }}>
            <Text variant="Caption/Regular" color="Color/Content/Neutral/Light" style={{ paddingHorizontal: t.layout('Margin-Small') }}>Theme={th}</Text>
            <BottomNavigation items={items} selectedIndex={i} onChange={setI} theme={th} />
          </View>
        ))}
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light" style={{ paddingHorizontal: t.layout('Margin-Small') }}>Floating-Glass · Overlay (nền tối)</Text>
        <View style={{ backgroundColor: t.color('Color/Background/Inverse/Solid/Default'), paddingVertical: t.space('Spacing/Padding/Medium') }}>
          <BottomNavigation items={items} selectedIndex={i} onChange={setI} type="Floating-Glass" theme="Overlay" />
        </View>
      </ScrollView>
    </Screen>
  );
}
