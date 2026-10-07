import { ScrollView, View } from 'react-native';
import { Divider, Screen, Text, useTheme, type DividerColor } from '@gr/ds';

const COLORS: DividerColor[] = ['Default', 'Medium', 'High'];

export default function DividerGallery() {
  const t = useTheme();
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Heading/Subheading">Divider</Text>
        {COLORS.map((c) => (
          <View key={c} style={{ gap: t.space('Spacing/Gap/XSmall') }}>
            <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Color={c} · Horizontal</Text>
            <Divider color={c} />
          </View>
        ))}
        <View style={{ flexDirection: 'row', height: t.size('Element-Size/Popular/2XLarge'), gap: t.space('Spacing/Gap/Large'), alignItems: 'center' }}>
          {COLORS.map((c) => (
            <View key={c} style={{ flexDirection: 'row', alignSelf: 'stretch', gap: t.space('Spacing/Gap/XSmall'), alignItems: 'center' }}>
              <Divider color={c} direction="Vertical" />
              <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">{c}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
