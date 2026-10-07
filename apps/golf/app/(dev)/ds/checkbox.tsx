import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Checkbox, Screen, Text, useTheme } from '@gr/ds';

export default function CheckboxGallery() {
  const t = useTheme();
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const row = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: t.space('Spacing/Gap/Medium'), alignItems: 'center' as const };
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Heading/Subheading">Checkbox/Mark</Text>
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Shape=Default: No · Yes · Indeterminate · Disabled No · Disabled Yes</Text>
        <View style={row}>
          <Checkbox select={b} onChange={setB} accessibilityLabel="b" />
          <Checkbox select={a} onChange={setA} accessibilityLabel="a" />
          <Checkbox select type="Indeterminate" accessibilityLabel="ind" />
          <Checkbox select={false} disabled accessibilityLabel="dis" />
          <Checkbox select disabled accessibilityLabel="dis2" />
        </View>
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Shape=Rounded</Text>
        <View style={row}>
          <Checkbox shape="Rounded" select={b} onChange={setB} accessibilityLabel="rb" />
          <Checkbox shape="Rounded" select={a} onChange={setA} accessibilityLabel="ra" />
          <Checkbox shape="Rounded" select type="Indeterminate" accessibilityLabel="rind" />
          <Checkbox shape="Rounded" select={false} disabled accessibilityLabel="rdis" />
          <Checkbox shape="Rounded" select disabled accessibilityLabel="rdis2" />
        </View>
      </ScrollView>
    </Screen>
  );
}
