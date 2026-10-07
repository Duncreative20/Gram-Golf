import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';
import { View } from 'react-native';
import { DatePicker, DateWheel, TimeWheel, type DateRange } from './DatePicker';
import { useTheme } from '../../theme/useTheme';
import { Col, Label } from '../../stories/helpers';

const today = new Date();
const key = (d: number) => `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const meta = {
  title: 'Input/Date-Picker',
  component: DatePicker,
  tags: ['autodocs'],
  args: { size: 'Large', type: 'Paged', headerAlign: 'Start', value: today, onChange: fn(), markedDates: [key(3), key(9), key(21)] },
  argTypes: {
    value: { control: false }, size: { control: 'radio', options: ['Large', 'Small'] }, type: { control: 'radio', options: ['Paged', 'Scroll'] }, headerAlign: { control: 'radio', options: ['Start', 'Center'] }, weekStartsOn: { control: 'radio', options: [0, 1] } },
} satisfies Meta<typeof DatePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

function Surface({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return <View style={{ backgroundColor: t.color('Color/Background/Surface/Default'), borderRadius: t.radius('Corner-Radius/Large') }}>{children}</View>;
}
export const Paged: Story = { name: 'Paged · single', render: (args) => <Surface><DatePicker {...args} /></Surface> };
export const Range: Story = {
  name: 'Paged · Small · range · header Center',
  render: () => {
    const [r, setR] = useState<DateRange>({ start: new Date(today.getFullYear(), today.getMonth(), 5), end: new Date(today.getFullYear(), today.getMonth(), 12) });
    return <Surface><DatePicker mode="range" size="Small" headerAlign="Center" value={r} onChange={setR} /></Surface>;
  },
};
export const Scroll: Story = {
  name: 'Scroll · 3 tháng',
  render: () => {
    const t = useTheme();
    const [d, setD] = useState<Date | null>(today);
    return <View style={{ height: t.size('Input/Size/XLarge') * 8 }}><Surface><DatePicker type="Scroll" months={3} value={d} onChange={setD} /></Surface></View>;
  },
};
export const Wheel: Story = {
  name: 'Wheel · Date / Time',
  render: () => {
    const [w, setW] = useState(today);
    const [hm, setHm] = useState({ h: 7, m: 30 });
    return (
      <Col>
        <Label>Date — {w.toLocaleDateString('vi-VN')}</Label>
        <DateWheel value={w} onChange={setW} />
        <Label>Time — {`${hm.h}:${String(hm.m).padStart(2, '0')}`}</Label>
        <TimeWheel hour={hm.h} minute={hm.m} minuteStep={5} onChange={(h, m) => setHm({ h, m })} />
      </Col>
    );
  },
};
