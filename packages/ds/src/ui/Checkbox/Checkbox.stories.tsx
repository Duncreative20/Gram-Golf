import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';
import { Checkbox } from './Checkbox';
import { Radio, RadioRow, CheckboxRow } from '../Radio/Radio';
import { Toggle, ToggleRow } from '../Toggle/Toggle';
import { Col, Label, Row } from '../../stories/helpers';

const meta = {
  title: 'Controls/Checkbox, Radio, Toggle',
  component: Checkbox,
  tags: ['autodocs'],
  args: { select: true, shape: 'Default', accessibilityLabel: 'Nhận thông báo', onChange: fn() },
  argTypes: { shape: { control: 'radio', options: ['Default', 'Rounded'] }, type: { control: 'radio', options: ['Default', 'Indeterminate'] } },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: 'Checkbox' };
export const CheckboxStates: Story = {
  name: 'Checkbox · mọi trạng thái',
  render: () => (
    <Col>
      <Label>Shape=Default: No · Yes · Indeterminate · Disabled No · Disabled Yes</Label>
      <Row><Checkbox select={false} accessibilityLabel="No" /><Checkbox select accessibilityLabel="Yes" /><Checkbox select type="Indeterminate" accessibilityLabel="Indeterminate" /><Checkbox select={false} disabled accessibilityLabel="Disabled" /><Checkbox select disabled accessibilityLabel="Disabled Yes" /></Row>
      <Label>Shape=Rounded</Label>
      <Row><Checkbox shape="Rounded" select={false} accessibilityLabel="No" /><Checkbox shape="Rounded" select accessibilityLabel="Yes" /><Checkbox shape="Rounded" select type="Indeterminate" accessibilityLabel="Indeterminate" /><Checkbox shape="Rounded" select={false} disabled accessibilityLabel="Disabled" /><Checkbox shape="Rounded" select disabled accessibilityLabel="Disabled Yes" /></Row>
    </Col>
  ),
};
export const RadioStory: Story = {
  name: 'Radio · mark + row',
  render: () => {
    const [v, setV] = useState(0);
    return (
      <Col>
        <Row><Radio select accessibilityLabel="Chọn" /><Radio select={false} accessibilityLabel="Chưa" /><Radio select={false} disabled accessibilityLabel="Disabled" /><Radio select disabled accessibilityLabel="Disabled chọn" /></Row>
        <RadioRow label="Left side" caption="Caption đi kèm" select={v === 0} onPress={() => setV(0)} />
        <RadioRow label="Right side" side="Right" select={v === 1} onPress={() => setV(1)} />
        <RadioRow label="Disabled" caption="Không bấm được" disabled select={false} />
        <CheckboxRow label="Nhận thông báo" caption="Qua email và push" select onChange={() => {}} />
        <CheckboxRow label="Check-Side Right" side="Right" select={false} onChange={() => {}} />
      </Col>
    );
  },
};
export const ToggleStory: Story = {
  name: 'Toggle · Large / Medium / Small + row',
  render: () => {
    const [on, setOn] = useState(true);
    return (
      <Col>
        <Row><Toggle size="Large" select={on} onChange={setOn} accessibilityLabel="Large" /><Toggle size="Medium" select={on} onChange={setOn} accessibilityLabel="Medium" /><Toggle size="Small" select={on} onChange={setOn} accessibilityLabel="Small" /></Row>
        <Row><Toggle select={false} disabled accessibilityLabel="Disabled off" /><Toggle select disabled accessibilityLabel="Disabled on" /></Row>
        <ToggleRow label="Chế độ tối" caption="Theo hệ thống" select={false} onChange={() => {}} />
        <ToggleRow label="Thông báo" select onChange={() => {}} theme="Toggle-First" />
      </Col>
    );
  },
};
