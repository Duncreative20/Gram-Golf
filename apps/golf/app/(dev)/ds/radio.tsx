import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { CheckboxRow, Radio, RadioRow, Screen, Text, useTheme } from '@gr/ds';

export default function RadioGallery() {
  const t = useTheme();
  const [v, setV] = useState('a');
  const [c, setC] = useState(true);
  const row = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: t.space('Spacing/Gap/Medium'), alignItems: 'center' as const };
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Heading/Subheading">Radio-Button/Radio-Mark</Text>
        <View style={row}>
          <Radio select={v === 'a'} onPress={() => setV('a')} accessibilityLabel="a" />
          <Radio select={v === 'b'} onPress={() => setV('b')} accessibilityLabel="b" />
          <Radio select={false} disabled accessibilityLabel="dis" />
          <Radio select disabled accessibilityLabel="dis2" />
        </View>
        <Text variant="Heading/Subheading">Radio-Button (Content · Radio-Side)</Text>
        <RadioRow label="Left side" caption="Caption đi kèm" select={v === 'a'} onPress={() => setV('a')} />
        <RadioRow label="Right side" side="Right" select={v === 'b'} onPress={() => setV('b')} />
        <RadioRow label="Disabled" caption="Không bấm được" select disabled />
        <Text variant="Heading/Subheading">Checkbox/Text</Text>
        <CheckboxRow label="Nhận thông báo" caption="Qua email và push" select={c} onChange={setC} />
        <CheckboxRow label="Check-Side Right" side="Right" select={!c} onChange={(n) => setC(!n)} />
        <CheckboxRow label="Disabled" select disabled />
      </ScrollView>
    </Screen>
  );
}
