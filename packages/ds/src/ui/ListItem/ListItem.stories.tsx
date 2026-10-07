import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';
import { ListItem } from './ListItem';
import { Avatar } from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { Toggle } from '../Toggle/Toggle';
import { Icon } from '../../icons/Icon';
import { useTheme } from '../../theme/useTheme';
import type { AvatarSize, AvatarTheme } from '../Avatar/avatarStyles';
import { Col, Label, Row } from '../../stories/helpers';
import avatarImg from '../../../../../apps/golf/assets/images/intro-booking.jpg';

const AVATAR = { uri: avatarImg };
const SIZES: AvatarSize[] = ['3XLarge', '2XLarge', 'XLarge', 'Large', 'Medium', 'Small', 'XSmall', '2XSmall'];
const THEMES: AvatarTheme[] = ['Accent', 'Neutral', 'Yellow', 'Orange', 'Red', 'Crimson', 'Pink', 'Plum', 'Purple', 'Violet', 'Indigo', 'Blue', 'Cyan', 'Teal', 'Green', 'Brown'];

const meta = {
  title: 'Data/List-Item, Avatar',
  component: ListItem,
  tags: ['autodocs'],
  args: { title: 'Nguyễn Văn A', caption: 'Handicap 12 · Hà Nội', type: 'Inline', onPress: fn() },
  argTypes: { type: { control: 'radio', options: ['Inline', 'Grouped', 'Radio-Card'] }, leading: { control: false }, trailing: { control: false } },
} satisfies Meta<typeof ListItem>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: 'List-Item', render: (args) => <ListItem {...args} leading={<Avatar size="Large" source={AVATAR} />} /> };
export const Types: Story = {
  name: 'Inline · Grouped · Radio-Card · trailing control',
  render: () => {
    const t = useTheme();
    const [on, setOn] = useState(true);
    return (
      <Col>
        <ListItem title="Nguyễn Văn A" caption="Handicap 12 · Hà Nội" leading={<Avatar size="Large" source={AVATAR} />} trailing={<Button size="Small" level="Tertiary" text="Theo dõi" />} trailingInteractive onPress={() => {}} />
        <ListItem title="Selected" caption="State=Selected" selected leading={<Avatar size="Large" source={AVATAR} />} trailing={<Toggle select={on} onChange={setOn} accessibilityLabel="Bật" />} trailingInteractive />
        <ListItem title="Không leading" caption="Trailing text" trailing={<Icon name="chevron-right-line-medium" size={t.size('Element-Size/Popular/XSmall')} />} onPress={() => {}} />
        <Label>Grouped</Label>
        <ListItem type="Grouped" title="Tag bạn bè" leading={<Icon name="user-square-line" size={t.size('Element-Size/Popular/Small')} />} trailing={<Icon name="chevron-right-line-medium" size={t.size('Element-Size/Popular/XSmall')} />} onPress={() => {}} />
        <Label>Radio-Card</Label>
        <ListItem type="Radio-Card" title="Sân 18 lỗ" caption="Radio-Card" selected onPress={() => {}} />
        <ListItem type="Radio-Card" title="Sân 9 lỗ" caption="Radio-Card" onPress={() => {}} />
      </Col>
    );
  },
};
export const AvatarStory: Story = {
  name: 'Avatar · size · theme · square · status',
  render: () => (
    <Col>
      <Label>Photo · Circle · mọi cỡ · status</Label>
      <Row>{SIZES.map((s) => <Avatar key={s} size={s} source={AVATAR} status />)}</Row>
      <Label>Square</Label>
      <Row>{SIZES.map((s) => <Avatar key={s} size={s} shape="Square" source={AVATAR} />)}</Row>
      <Label>Initials · Solid</Label>
      <Row>{THEMES.map((th) => <Avatar key={th} theme={th} background="Solid" initials="VA" size="Large" />)}</Row>
      <Label>Initials · Subtle</Label>
      <Row>{THEMES.map((th) => <Avatar key={th} theme={th} background="Subtle" initials="VA" size="Large" />)}</Row>
    </Col>
  ),
};
