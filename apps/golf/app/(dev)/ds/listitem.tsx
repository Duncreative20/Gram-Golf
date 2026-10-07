import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Accordion, Avatar, Button, Card, ListItem, Screen, Text, Toggle, useTheme } from '@gr/ds';
import { darkDemo } from '../../../lib/demo';

export default function ListItemGallery() {
  const t = useTheme();
  const [sel, setSel] = useState(0);
  const [on, setOn] = useState(true);
  const avatar = <Avatar size="Medium" source={{ uri: 'https://i.pravatar.cc/96' }} />;
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingVertical: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Heading/Subheading" style={{ paddingHorizontal: t.layout('Margin-Small') }}>List-Item · Inline</Text>
        <View>
          <ListItem title="Nguyễn Văn A" caption="Handicap 12 · Hà Nội" leading={avatar} trailing={<Button size="Small" level="Tertiary" text="Theo dõi" />} trailingInteractive onPress={() => {}} />
          <ListItem title="Selected" caption="State=Selected" leading={avatar} selected trailing={<Toggle select={on} onChange={setOn} accessibilityLabel="t" />} trailingInteractive />
          <ListItem title="Không leading" caption="Trailing text" trailing={<Text variant="Body/XSmall/Regular" color="Color/Content/Neutral/Light">12:30</Text>} />
        </View>
        <View style={{ paddingHorizontal: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
          <Text variant="Heading/Subheading">Grouped · Radio-Card</Text>
          <View style={{ gap: t.space('Spacing/Gap/XSmall'), backgroundColor: t.color('Color/Background/Support/Neutral/Pale'), borderRadius: t.radius('Corner-Radius/Large'), padding: t.space('Spacing/Padding/XSmall') }}>
            {['Sân 18 lỗ', 'Sân 9 lỗ'].map((x, i) => (
              <ListItem key={x} type="Radio-Card" title={x} caption="Radio-Card" selected={sel === i} onPress={() => setSel(i)} />
            ))}
            <ListItem type="Grouped" title="Grouped" caption="Padding/Small, radius Base" onPress={() => {}} />
          </View>
          <Text variant="Heading/Subheading">Card</Text>
          <Card theme="Default"><Text variant="Body/Base/Regular">Default · Medium</Text></Card>
          <Card theme="Pale" spacing="Small"><Text variant="Body/Base/Regular">Pale · Small</Text></Card>
          <Card theme="Border" spacing="Small" subActionIcon="dots-horizontal-line" onSubAction={() => {}}><Text variant="Body/Base/Regular">Border · Sub-Action</Text></Card>
          <Card theme="Shadow" onPress={() => {}}><Text variant="Body/Base/Regular">Shadow · Active</Text></Card>
          <Card theme="Semi-Pale" spacing="Xsmall"><Text variant="Body/Base/Regular">Semi-Pale · Xsmall</Text></Card>
          <Text variant="Heading/Subheading">Accordion</Text>
          <Accordion title="Divider · Large" defaultExpanded>Nội dung mở sẵn. Theme Divider có đường kẻ dưới.</Accordion>
          <Accordion title="Divider · Medium" size="Medium">Nội dung.</Accordion>
          <Accordion title="Box · XLarge" size="XLarge" theme="Box">Theme Box: nền Pale, bo 2XLarge.</Accordion>
          <Accordion title="Box · Large" theme="Box">Nội dung.</Accordion>
        </View>
      </ScrollView>
    </Screen>
  );
}
