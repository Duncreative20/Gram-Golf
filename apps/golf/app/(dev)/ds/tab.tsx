import { useState } from 'react';
import { ScrollView } from 'react-native';
import { Screen, TabBar, Text, useTheme } from '@gr/ds';

export default function TabGallery() {
  const t = useTheme();
  const [i, setI] = useState(0);
  const items = [
    { label: 'Bài viết', icon: 'home-03-line' as const, iconSelected: 'home-03-solid' as const },
    { label: 'Lưu', icon: 'bookmark-line' as const, iconSelected: 'bookmark-solid' as const, badge: '3' },
    { label: 'Đã thích', icon: 'heart-line' as const, iconSelected: 'heart-solid' as const },
    { label: 'Tắt', icon: 'eye-off-line' as const, disabled: true },
  ];
  const textOnly = items.map(({ label, disabled }) => ({ label, disabled }));
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingVertical: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Heading/Subheading" style={{ paddingHorizontal: t.layout('Margin-Small') }}>Tab-Bar</Text>
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light" style={{ paddingHorizontal: t.layout('Margin-Small') }}>Style=Indicator · Icon=Leading</Text>
        <TabBar items={items} selectedIndex={i} onChange={setI} style="Indicator" />
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light" style={{ paddingHorizontal: t.layout('Margin-Small') }}>Style=Indicator · Icon=None</Text>
        <TabBar items={textOnly} selectedIndex={i} onChange={setI} style="Indicator" />
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light" style={{ paddingHorizontal: t.layout('Margin-Small') }}>Style=Top</Text>
        <TabBar items={items} selectedIndex={i} onChange={setI} style="Top" />
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light" style={{ paddingHorizontal: t.layout('Margin-Small') }}>Style=Subtle</Text>
        <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: t.layout('Margin-Small') }} showsHorizontalScrollIndicator={false}>
          <TabBar items={items} selectedIndex={i} onChange={setI} style="Subtle" />
        </ScrollView>
      </ScrollView>
    </Screen>
  );
}
