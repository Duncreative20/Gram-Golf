import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Screen, Text, Toggle, ToggleRow, useTheme } from '@gr/ds';

export default function ToggleGallery() {
  const t = useTheme();
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const row = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: t.space('Spacing/Gap/Medium'), alignItems: 'center' as const };
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Heading/Subheading">Toggle-Button · Large / Medium / Small</Text>
        <View style={row}>
          <Toggle size="Large" select={a} onChange={setA} accessibilityLabel="L" />
          <Toggle size="Medium" select={a} onChange={setA} accessibilityLabel="M" />
          <Toggle size="Small" select={a} onChange={setA} accessibilityLabel="S" />
        </View>
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Disabled off · on</Text>
        <View style={row}>
          <Toggle select={false} disabled accessibilityLabel="d1" />
          <Toggle select disabled accessibilityLabel="d2" />
        </View>
        <Text variant="Heading/Subheading">Toggle (Text-First · Toggle-First)</Text>
        <ToggleRow label="Chế độ tối" caption="Theo hệ thống" select={b} onChange={setB} />
        <ToggleRow theme="Toggle-First" label="Thông báo" select={a} onChange={setA} />
        <ToggleRow label="Disabled" select disabled />
      </ScrollView>
    </Screen>
  );
}
