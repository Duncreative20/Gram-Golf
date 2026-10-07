import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';
import { NumberField } from './NumberField';
import { StepperControl } from './StepperControl';
import { OtpField } from '../OtpField/OtpField';
import type { NumberFieldSize } from './stepperControlStyles';
import { Col, Label } from '../../stories/helpers';

const SIZES: NumberFieldSize[] = ['Small', 'Medium (Base)', 'Large', 'XLarge'];

const meta = {
  title: 'Input/Number-Field',
  component: NumberField,
  tags: ['autodocs'],
  args: { label: 'Số người', value: 2, min: 1, max: 4, size: 'Medium (Base)', align: 'Left', onChange: fn() },
  argTypes: { size: { control: 'select', options: SIZES }, align: { control: 'radio', options: ['Left', 'Center'] }, error: { control: 'text' } },
} satisfies Meta<typeof NumberField>;
export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ align }: { align: 'Left' | 'Center' }) {
  const [n, setN] = useState<number | null>(2);
  const [m, setM] = useState<number | null>(null);
  return (
    <Col>
      {SIZES.map((s) => <NumberField key={s} align={align} size={s} label={align === 'Left' ? `Size ${s}` : undefined} value={n} onChange={setN} min={0} max={9} />)}
      <NumberField align={align} label="Trống" value={m} onChange={setM} error="Nhập số" />
      <NumberField align={align} label="Read-only" value={3} onChange={() => {}} readOnly />
      <NumberField align={align} label="Disabled" value={0} onChange={() => {}} disabled />
    </Col>
  );
}
export const AlignLeft: Story = { name: 'Align-Left · mọi cỡ + trạng thái', render: () => <Demo align="Left" /> };
export const AlignCenter: Story = { name: 'Align-Center · mọi cỡ + trạng thái', render: () => <Demo align="Center" /> };
export const Split: Story = {
  name: 'Stepper-Control-Split',
  render: () => {
    const [q, setQ] = useState(2);
    return (
      <Col>
        {(['XLarge', 'Large', 'Medium', 'Small'] as const).map((s) => <StepperControl key={s} size={s} value={q} onChange={setQ} min={0} max={9} />)}
        <StepperControl value={1} onChange={() => {}} disabled />
      </Col>
    );
  },
};
export const Otp: Story = {
  name: 'OTP-Field',
  render: () => {
    const [otp, setOtp] = useState('12');
    return (
      <Col>
        <Label>6 số XLarge</Label>
        <OtpField value={otp} onChangeText={setOtp} length={6} helpText="Nhập mã 6 số" />
        <Label>4 số Large · lỗi / disabled</Label>
        <OtpField value="1234" onChangeText={() => {}} length={4} size="Large" error="Mã không đúng" />
        <OtpField value="" onChangeText={() => {}} length={4} size="Large" disabled />
      </Col>
    );
  },
};
