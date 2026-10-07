import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';
import { Button } from './Button';
import { IconButton } from './IconButton';
import type { ButtonSize, IconButtonSize, IconFlatLevel, IconMainLevel, MainLevel } from './buttonStyles';
import { Col, DarkBox, Label, Row } from '../../stories/helpers';

const SIZES: ButtonSize[] = ['XLarge', 'Large', 'Medium (Base)', 'Small', 'XSmall'];
const MAIN: MainLevel[] = ['Primary', 'Accent', 'Secondary', 'Tertiary', 'Danger', 'Danger Subtle', 'Positive', 'Positive Subtle'];
const ICON_MAIN: IconMainLevel[] = ['Primary', 'Accent', 'Secondary', 'Tertiary', 'Danger', 'Danger Secondary', 'Positive', 'Positive Secondary'];
const ICON_FLAT: IconFlatLevel[] = ['Primary', 'Secondary', 'Accent', 'Danger', 'Positive', 'Overlay'];
const ICON_SIZES: IconButtonSize[] = ['XLarge', 'Large', 'Medium', 'Small', 'XSmall', '2XSmall'];

const meta = {
  title: 'Controls/Button',
  component: Button,
  tags: ['autodocs'],
  args: { text: 'Đặt sân', level: 'Primary', size: 'Large', onPress: fn() },
  argTypes: {
    // type=Flat chỉ có level Primary/Accent (FlatLevel) — chọn level khác với Flat là tổ hợp không có trong Figma

    level: { control: 'select', options: MAIN },
    size: { control: 'select', options: SIZES },
    type: { control: 'radio', options: ['Main', 'Flat'] },
    leadingIcon: { control: 'text' },
    trailingIcon: { control: 'text' },
    onPress: { control: false },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const MoiLevelCo: Story = {
  name: 'Mọi level × cỡ',
  render: () => (
    <Col>
      {SIZES.map((s) => (
        <Row key={s}>
          {MAIN.map((l) => <Button key={l} level={l} size={s} text={l} leadingIcon="plus-line" />)}
        </Row>
      ))}
    </Col>
  ),
};
export const CoIcon: Story = { name: 'Có icon', args: { leadingIcon: 'plus-line', trailingIcon: 'chevron-right-line-medium', level: 'Accent' } };
export const Khoa: Story = {
  name: 'Khoá (disabled)',
  render: () => <Row>{MAIN.map((l) => <Button key={l} level={l} text={l} disabled />)}</Row>,
};
export const Flat: Story = {
  render: () => (
    <Row>
      <Button type="Flat" level="Primary" text="Flat Primary" leadingIcon="heart-line" />
      <Button type="Flat" level="Accent" text="Flat Accent" />
      <Button type="Flat" level="Primary" text="Disabled" disabled />
    </Row>
  ),
};
export const Overlay: Story = {
  name: 'Main-Overlay (trên nền tối)',
  render: () => (
    <DarkBox>
      <Row>
        <Button overlay level="Primary" text="Primary" />
        <Button overlay level="Accent" text="Accent" />
        <Button overlay level="Tertiary" text="Tertiary" />
        <Button overlay level="Primary" text="Disabled" disabled />
      </Row>
    </DarkBox>
  ),
};
export const IconMain: Story = {
  name: 'IconButton · level × cỡ',
  render: () => (
    <Col>
      <Label>Icon-Main · Level</Label>
      <Row>{ICON_MAIN.map((l) => <IconButton key={l} level={l} icon="heart-line" accessibilityLabel={l} />)}</Row>
      <Label>Icon-Main · Size</Label>
      <Row>{ICON_SIZES.map((s) => <IconButton key={s} size={s} icon="plus-line" accessibilityLabel={s} />)}</Row>
      <Label>Icon-Flat</Label>
      <Row>{ICON_FLAT.map((l) => <IconButton key={l} type="Flat" level={l} icon="x-medium-line" accessibilityLabel={l} />)}</Row>
      <Label>Icon-Main-Overlay</Label>
      <DarkBox>
        <Row>
          <IconButton overlay level="Primary" icon="share-01-line" accessibilityLabel="Primary" />
          <IconButton overlay level="Accent" icon="share-01-line" accessibilityLabel="Accent" />
          <IconButton overlay level="Liquid Glass" icon="share-01-line" accessibilityLabel="Liquid Glass" />
          <IconButton overlay level="Primary" icon="share-01-line" accessibilityLabel="Disabled" disabled />
        </Row>
      </DarkBox>
    </Col>
  ),
};
