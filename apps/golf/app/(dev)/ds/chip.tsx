import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Chip, Screen, Text, useTheme, type ChipSize } from '@gr/ds';

const SIZES: ChipSize[] = ['Medium', 'Small', 'XSmall'];

export default function ChipGallery() {
  const t = useTheme();
  const [sel, setSel] = useState('Sân 18 lỗ');
  const row = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: t.space('Spacing/Gap/Small'), alignItems: 'center' as const };
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Heading/Subheading">Chip/Normal · Secondary</Text>
        {SIZES.map((size) => (
          <View key={size} style={row}>
            {['Sân 18 lỗ', 'Sân 9 lỗ', 'Driving range'].map((x) => (
              <Chip key={x} size={size} text={x} select={sel === x} onPress={() => setSel(x)} />
            ))}
            <Chip size={size} text="Icon" icon="marker-pin-01-line" />
          </View>
        ))}
        <Text variant="Heading/Subheading">Chip/Normal · Primary</Text>
        <View style={row}>
          <Chip level="Primary" text="Unselected" />
          <Chip level="Primary" text="Selected" select />
          <Chip level="Primary" text="Icon" icon="globe-01-line" select />
        </View>
        <Text variant="Heading/Subheading">Chip/Advanced</Text>
        <View style={row}>
          <Chip variant="Advanced" size="Medium" text="Bộ lọc" counter="3" />
          <Chip variant="Advanced" size="Small" text="Sắp xếp" />
          <Chip variant="Advanced" size="Medium" text="Đã chọn" counter="2" select />
        </View>
        <Text variant="Heading/Subheading">Chip/Number-Only</Text>
        <View style={row}>
          {['1', '2', '3'].map((n) => (
            <Chip key={n} variant="Number-Only" size="Medium" text={n} select={n === '2'} />
          ))}
          <Chip variant="Number-Only" size="Small" text="4" />
          <Chip variant="Number-Only" size="XSmall" text="5" level="Primary" select />
        </View>
      </ScrollView>
    </Screen>
  );
}
