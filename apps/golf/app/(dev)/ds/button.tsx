import { ScrollView, View } from 'react-native';
import {
  Button, IconButton, Screen, Text, useTheme,
  type ButtonSize, type IconButtonSize, type MainLevel, type IconMainLevel, type IconFlatLevel,
} from '@gr/ds';
import { darkDemo } from '../../../lib/demo';

const SIZES: ButtonSize[] = ['XLarge', 'Large', 'Medium (Base)', 'Small', 'XSmall'];
const ICON_SIZES: IconButtonSize[] = ['XLarge', 'Large', 'Medium', 'Small', 'XSmall', '2XSmall'];
const MAIN: MainLevel[] = ['Primary', 'Accent', 'Secondary', 'Tertiary', 'Danger', 'Danger Subtle', 'Positive', 'Positive Subtle'];
const ICON_MAIN: IconMainLevel[] = ['Primary', 'Accent', 'Secondary', 'Tertiary', 'Danger', 'Danger Secondary', 'Positive', 'Positive Secondary'];
const ICON_FLAT: IconFlatLevel[] = ['Primary', 'Secondary', 'Accent', 'Danger', 'Positive', 'Overlay'];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ gap: t.space('Spacing/Gap/Small') }}>
      <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">{title}</Text>
      {children}
    </View>
  );
}

export default function ButtonGallery() {
  const t = useTheme();
  const row = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: t.space('Spacing/Gap/Small'), alignItems: 'center' as const };
  const dark = darkDemo(t);
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Heading/Subheading">Button · IconButton</Text>
        <Section title="Button/Main · Level × Large">
          <View style={row}>{MAIN.map((l) => <Button key={l} level={l} text={l} leadingIcon="plus-line" />)}</View>
        </Section>
        <Section title="Button/Main · Size (Primary) + disabled">
          <View style={row}>
            {SIZES.map((s) => <Button key={s} size={s} text={s} trailingIcon="chevron-right-line-medium" />)}
            <Button text="Disabled" disabled />
            <Button level="Tertiary" text="Disabled" disabled />
          </View>
        </Section>
        <Section title="Button/Flat">
          <View style={row}>
            <Button type="Flat" level="Primary" text="Flat Primary" leadingIcon="heart-line" />
            <Button type="Flat" level="Accent" text="Flat Accent" />
            <Button type="Flat" level="Accent" text="Disabled" disabled />
          </View>
        </Section>
        <Section title="Button/Main-Overlay (trên nền tối)">
          <View style={[row, dark]}>
            <Button overlay level="Primary" text="Primary" />
            <Button overlay level="Accent" text="Accent" />
            <Button overlay level="Tertiary" text="Tertiary" />
            <Button overlay level="Primary" text="Disabled" disabled />
          </View>
        </Section>
        <Section title="Button/Icon-Main · Level">
          <View style={row}>{ICON_MAIN.map((l) => <IconButton key={l} level={l} icon="heart-line" accessibilityLabel={l} />)}</View>
        </Section>
        <Section title="Button/Icon-Main · Size">
          <View style={row}>
            {ICON_SIZES.map((s) => <IconButton key={s} size={s} icon="plus-line" accessibilityLabel={s} />)}
            <IconButton icon="plus-line" accessibilityLabel="disabled" disabled />
          </View>
        </Section>
        <Section title="Button/Icon-Flat">
          <View style={row}>{ICON_FLAT.map((l) => <IconButton key={l} type="Flat" level={l} icon="x-medium-line" accessibilityLabel={l} />)}</View>
        </Section>
        <Section title="Button/Icon-Main-Overlay (trên nền tối)">
          <View style={[row, dark]}>
            <IconButton overlay level="Primary" icon="share-01-line" accessibilityLabel="Primary" />
            <IconButton overlay level="Accent" icon="share-01-line" accessibilityLabel="Accent" />
            <IconButton overlay level="Liquid Glass" icon="share-01-line" accessibilityLabel="Liquid Glass" />
            <IconButton overlay level="Primary" icon="share-01-line" accessibilityLabel="disabled" disabled />
          </View>
        </Section>
      </ScrollView>
    </Screen>
  );
}
