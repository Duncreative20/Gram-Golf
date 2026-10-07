import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AvatarGroup, ColorSelector, DockIcon, EmptyState, IntegrationConnector, Screen, Text, useTheme, type DockIconSize, type DockIconTheme } from '@gr/ds';

const SIZES: DockIconSize[] = ['XLarge', 'Large', 'Medium', 'Small', 'XSmall'];
const THEMES: DockIconTheme[] = ['Neutral', 'Accent', 'Inverse', 'Pale', 'Blue', 'Green', 'Orange', 'Purple'];

export default function MiscGallery() {
  const t = useTheme();
  const [color, setColor] = useState(0);
  const palette = [t.color('Color/Background/Accent/Solid/Default'), t.color('Color/Background/Support/Blue/Solid'), t.color('Color/Background/Support/Orange/Solid'), t.color('Color/Background/Negative/Solid/Default')];
  const row = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: t.space('Spacing/Gap/Small'), alignItems: 'center' as const };
  const avatars = [1, 2, 3, 4, 5, 6, 7].map((i) => ({ source: { uri: `https://i.pravatar.cc/96?img=${i}` } }));
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Heading/Subheading">Dock-Icon · Size</Text>
        <View style={row}>{SIZES.map((s) => <DockIcon key={s} size={s} icon="home-03-solid" theme="Accent" background="Solid" />)}</View>
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Theme × Solid / Subtle</Text>
        <View style={row}>{THEMES.map((th) => <DockIcon key={th} theme={th} background="Solid" icon="bell-01-line" />)}</View>
        <View style={row}>{THEMES.map((th) => <DockIcon key={th} theme={th} background="Subtle" icon="bell-01-line" />)}</View>
        <Text variant="Heading/Subheading">Integration-Connector</Text>
        <View style={row}>
          <IntegrationConnector icon="link-01-line" background="Connected" />
          <IntegrationConnector icon="link-01-line" background="Default" />
          <IntegrationConnector icon="link-01-line" background="Error" />
          <IntegrationConnector icon="link-01-line" background="Disabled" />
          <IntegrationConnector icon="link-01-line" background="Connected" size="Large" />
        </View>
        <Text variant="Heading/Subheading">Color-Selector</Text>
        <View style={row}>{palette.map((c, i) => <ColorSelector key={c} color={c} select={color === i} onPress={() => setColor(i)} accessibilityLabel={`Màu ${i + 1}`} />)}</View>
        <Text variant="Heading/Subheading">Avatar/Group</Text>
        <AvatarGroup avatars={avatars} size="Medium" background="Subtle" />
        <AvatarGroup avatars={avatars} size="Small" background="Solid" max={3} />
        <AvatarGroup avatars={avatars.slice(0, 2)} />
        <Text variant="Heading/Subheading">Empty-State</Text>
        <EmptyState title="Chưa có bài viết" caption="Theo dõi golfer khác để thấy bài viết ở đây." primaryText="Khám phá" secondaryText="Để sau" onPrimary={() => {}} onSecondary={() => {}} />
        <EmptyState icon="search-medium-line" title="Không tìm thấy" />
      </ScrollView>
    </Screen>
  );
}
