import { ScrollView, View } from 'react-native';
import { Screen, Tag, Text, useTheme } from '@gr/ds';

export default function TagGallery() {
  const t = useTheme();
  const row = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: t.space('Spacing/Gap/Small'), alignItems: 'center' as const };
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Heading/Subheading">Tag · Medium</Text>
        <View style={row}>
          <Tag text="Text-Only" />
          <Tag text="Remove" onRemove={() => {}} />
          <Tag text="Leading-Icon" icon="marker-pin-01-line" onRemove={() => {}} />
          <Tag text="Leading-Photo" photo={{ uri: 'https://i.pravatar.cc/64' }} onRemove={() => {}} />
        </View>
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Error · Disabled · Pressable</Text>
        <View style={row}>
          <Tag text="Error" error onRemove={() => {}} />
          <Tag text="Disabled" disabled onRemove={() => {}} />
          <Tag text="Pressable" onPress={() => {}} />
        </View>
        <Text variant="Heading/Subheading">Tag · Small</Text>
        <View style={row}>
          <Tag size="Small" text="Small" onRemove={() => {}} />
          <Tag size="Small" text="Icon" icon="globe-01-line" />
        </View>
      </ScrollView>
    </Screen>
  );
}
