import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';
import { Badge } from './Badge';
import { Chip } from '../Chip/Chip';
import { Tag } from '../Tag/Tag';
import type { BadgeTheme } from './badgeStyles';
import { Col, Label, Row } from '../../stories/helpers';

const THEMES: BadgeTheme[] = ['Accent', 'Neutral', 'Yellow', 'Orange', 'Red', 'Crimson', 'Pink', 'Plum', 'Purple', 'Violet', 'Indigo', 'Blue', 'Cyan', 'Teal', 'Green', 'Brown', 'Inverse', 'On-Color'];

const meta = {
  title: 'Data/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { text: 'Medium', size: 'Medium', theme: 'Accent', background: 'Solid', leadingIcon: 'check-line', onRemove: fn() },
  argTypes: { size: { control: 'select', options: ['Medium', 'Small', 'XSmall'] }, theme: { control: 'select', options: THEMES }, background: { control: 'radio', options: ['Solid', 'Subtle'] }, leadingIcon: { control: 'text' } },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: 'Mặc định' };
export const MoiTheme: Story = {
  name: 'Mọi theme · Solid / Subtle',
  render: () => (
    <Col>
      <Label>Solid</Label>
      <Row>{THEMES.map((th) => <Badge key={th} text={th} theme={th} background="Solid" leadingIcon="check-line" />)}</Row>
      <Label>Subtle</Label>
      <Row>{THEMES.map((th) => <Badge key={th} text={th} theme={th} background="Subtle" leadingIcon="check-line" />)}</Row>
    </Col>
  ),
};
export const MoiCo: Story = {
  name: 'Mọi cỡ · icon · remove',
  render: () => <Row><Badge text="Medium" leadingIcon="check-line" onRemove={() => {}} /><Badge text="Small" size="Small" leadingIcon="check-line" onRemove={() => {}} /><Badge text="XSmall" size="XSmall" leadingIcon="check-line" onRemove={() => {}} /></Row>,
};
export const ChipStory: Story = {
  name: 'Chip · Normal / Advanced / Number-Only',
  render: () => (
    <Col>
      <Label>Normal · Secondary (Medium / Small / XSmall)</Label>
      {(['Medium', 'Small', 'XSmall'] as const).map((s) => (
        <Row key={s}><Chip text="Sân 18 lỗ" size={s} select /><Chip text="Sân 9 lỗ" size={s} /><Chip text="Driving range" size={s} /><Chip text="Icon" size={s} icon="marker-pin-01-line" /></Row>
      ))}
      <Label>Normal · Primary</Label>
      <Row><Chip level="Primary" text="Unselected" /><Chip level="Primary" text="Selected" select /><Chip level="Primary" text="Icon" icon="globe-01-line" select /></Row>
      <Label>Advanced</Label>
      <Row><Chip variant="Advanced" text="Bộ lọc" counter="3" /><Chip variant="Advanced" text="Sắp xếp" size="Small" /><Chip variant="Advanced" text="Đã chọn" counter="2" select /></Row>
      <Label>Number-Only</Label>
      <Row>{['1', '2', '3', '4', '5'].map((n, i) => <Chip key={n} variant="Number-Only" text={n} select={i === 1} level={i === 4 ? 'Primary' : 'Secondary'} />)}</Row>
    </Col>
  ),
};
export const TagStory: Story = {
  name: 'Tag · Medium / Small',
  render: () => (
    <Col>
      <Row><Tag text="Text-Only" /><Tag text="Remove" onRemove={() => {}} /><Tag text="Leading-Icon" icon="marker-pin-01-line" onRemove={() => {}} /></Row>
      <Row><Tag text="Error" error onRemove={() => {}} /><Tag text="Disabled" disabled onRemove={() => {}} /><Tag text="Pressable" onPress={() => {}} /></Row>
      <Row><Tag text="Small" size="Small" onRemove={() => {}} /><Tag text="Icon" size="Small" icon="globe-01-line" /></Row>
    </Col>
  ),
};
