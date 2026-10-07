import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Screen, Segmented, Text, useTheme } from '@gr/ds';

export default function SegmentedGallery() {
  const t = useTheme();
  const [i, setI] = useState(0);
  const items = [
    { label: 'Tất cả', badge: '12' },
    { label: 'Sân golf', icon: 'globe-01-line' as const },
    { label: 'Resort' },
  ];
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Heading/Subheading">Segmented</Text>
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Level=Primary · Medium (nền Surface/Default)</Text>
        <Segmented items={items} selectedIndex={i} onChange={setI} level="Primary" size="Medium" />
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Level=Secondary · Medium (nền Surface/Alt)</Text>
        <Segmented items={items} selectedIndex={i} onChange={setI} level="Secondary" size="Medium" />
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Small · 2 item</Text>
        <View style={{ width: t.size('Image-Size/3XLarge') * 2 }}>
          <Segmented items={items.slice(0, 2)} selectedIndex={i % 2} onChange={setI} level="Primary" size="Small" />
        </View>
      </ScrollView>
    </Screen>
  );
}
