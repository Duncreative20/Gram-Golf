import { ScrollView, View } from 'react-native';
import { ICONS, Icon, Screen, Text, useTheme, type IconName } from '@gr/ds';

export default function IconGallery() {
  const t = useTheme();
  const names = Object.keys(ICONS) as IconName[];
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Medium') }}>
        <Text variant="Heading/Subheading">Icon · {names.length}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space('Spacing/Gap/Medium') }}>
          {names.map((n) => (
            <View key={n} style={{ width: t.size('Element-Size/Popular/2XLarge'), alignItems: 'center', gap: t.space('Spacing/Gap/2XSmall') }}>
              <Icon name={n} size={24} />
              <Icon name={n} size={20} color="Color/Content/Accent/Base" />
              <Text variant="Caption/Regular" color="Color/Content/Neutral/Light" numberOfLines={2} style={{ textAlign: 'center' }}>{n}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
