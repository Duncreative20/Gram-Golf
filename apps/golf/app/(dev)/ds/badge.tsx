import { ScrollView, View } from 'react-native';
import { Badge, Screen, Text, useTheme, type BadgeSize, type BadgeTheme } from '@gr/ds';

const THEMES: BadgeTheme[] = ['Accent', 'Neutral', 'Yellow', 'Orange', 'Red', 'Crimson', 'Pink', 'Plum', 'Purple', 'Violet', 'Indigo', 'Blue', 'Cyan', 'Teal', 'Green', 'Brown', 'Inverse', 'On-Color'];
const SIZES: BadgeSize[] = ['Medium', 'Small', 'XSmall'];

export default function BadgeGallery() {
  const t = useTheme();
  const row = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: t.space('Spacing/Gap/XSmall'), alignItems: 'center' as const };
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Heading/Subheading">Badge</Text>
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Size × icon × remove</Text>
        <View style={row}>
          {SIZES.map((s) => <Badge key={s} size={s} text={s} theme="Accent" background="Solid" leadingIcon="check-line" onRemove={() => {}} />)}
        </View>
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Theme · Solid</Text>
        <View style={[row, { backgroundColor: t.color('Color/Background/Surface/Alt'), padding: t.space('Spacing/Padding/XSmall') }]}>
          {THEMES.map((th) => <Badge key={th} theme={th} background="Solid" text={th} leadingIcon="check-line" />)}
        </View>
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Theme · Subtle</Text>
        <View style={row}>
          {THEMES.map((th) => <Badge key={th} theme={th} background="Subtle" text={th} leadingIcon="check-line" />)}
        </View>
      </ScrollView>
    </Screen>
  );
}
