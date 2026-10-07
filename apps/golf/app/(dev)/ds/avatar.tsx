import { ScrollView, View } from 'react-native';
import { Avatar, Screen, Text, useTheme, type AvatarSize, type AvatarTheme } from '@gr/ds';

const SIZES: AvatarSize[] = ['3XLarge', '2XLarge', 'XLarge', 'Large', 'Medium', 'Small', 'XSmall', '2XSmall'];
const THEMES: AvatarTheme[] = ['Accent', 'Neutral', 'Yellow', 'Orange', 'Red', 'Crimson', 'Pink', 'Plum', 'Purple', 'Violet', 'Indigo', 'Blue', 'Cyan', 'Teal', 'Green', 'Brown'];
const photo = require('../../../assets/images/intro-booking.jpg');

export default function AvatarGallery() {
  const t = useTheme();
  const row = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: t.space('Spacing/Gap/Small'), alignItems: 'flex-end' as const };
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Heading/Subheading">Avatar/Single</Text>
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Photo · Circle · Size · Status</Text>
        <View style={row}>{SIZES.map((s) => <Avatar key={s} size={s} source={photo} status />)}</View>
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Square</Text>
        <View style={row}>{SIZES.map((s) => <Avatar key={s} size={s} shape="Square" source={photo} />)}</View>
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Theme · Solid (initials)</Text>
        <View style={row}>{THEMES.map((th) => <Avatar key={th} theme={th} background="Solid" initials="VA" />)}</View>
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Theme · Subtle</Text>
        <View style={row}>{THEMES.map((th) => <Avatar key={th} theme={th} background="Subtle" initials="VA" />)}</View>
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Text theo size</Text>
        <View style={row}>{SIZES.map((s) => <Avatar key={s} size={s} theme="Accent" background="Solid" initials="A" />)}</View>
      </ScrollView>
    </Screen>
  );
}
