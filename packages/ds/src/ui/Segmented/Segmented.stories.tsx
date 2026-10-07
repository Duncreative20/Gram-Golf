import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';
import { Segmented } from './Segmented';
import { TabBar } from '../TabBar/TabBar';
import { PageIndicator } from '../PageIndicator/PageIndicator';
import { Button } from '../Button/Button';
import { Col, DarkBox, Label, Row } from '../../stories/helpers';

const meta = {
  title: 'Navigation/Segmented, Tab-Bar',
  component: Segmented,
  tags: ['autodocs'],
  args: { items: [{ label: 'Tất cả', badge: '12' }, { label: 'Sân golf', icon: 'globe-01-line' }, { label: 'Resort' }], selectedIndex: 0, level: 'Primary', size: 'Medium', onChange: fn() },
  argTypes: { level: { control: 'radio', options: ['Primary', 'Secondary'] }, size: { control: 'radio', options: ['Medium', 'Small'] } },
} satisfies Meta<typeof Segmented>;
export default meta;
type Story = StoryObj<typeof meta>;

function SegDemo() {
  const [i, setI] = useState(0);
  return (
    <Col>
      <Label>Level=Primary · Medium</Label>
      <Segmented items={[{ label: 'Tất cả', badge: '12' }, { label: 'Sân golf', icon: 'globe-01-line' }, { label: 'Resort' }]} selectedIndex={i} onChange={setI} />
      <Label>Level=Secondary · Medium</Label>
      <Segmented level="Secondary" items={[{ label: 'Tất cả', badge: '12' }, { label: 'Sân golf', icon: 'globe-01-line' }, { label: 'Resort' }]} selectedIndex={i} onChange={setI} />
      <Label>Small · 2 item · hug (không cắt chữ)</Label>
      <Segmented size="Small" items={[{ label: 'Gần đây' }, { label: 'Camera' }]} selectedIndex={i % 2} onChange={setI} />
    </Col>
  );
}
export const Default: Story = { name: 'Segmented', render: () => <SegDemo /> };

const TABS = [
  { label: 'Bài viết', icon: 'home-03-line' as const, iconSelected: 'home-03-solid' as const },
  { label: 'Lưu', icon: 'bookmark-line' as const, iconSelected: 'bookmark-solid' as const, badge: '3' },
  { label: 'Đã thích', icon: 'heart-line' as const, iconSelected: 'heart-solid' as const },
  { label: 'Tắt', icon: 'eye-off-line' as const, disabled: true },
];
function TabDemo() {
  const [i, setI] = useState(0);
  return (
    <Col>
      <Label>Style=Indicator · Icon=Leading</Label>
      <TabBar items={TABS} selectedIndex={i} onChange={setI} />
      <Label>Style=Indicator · Icon=None</Label>
      <TabBar items={TABS.map(({ icon: _i, iconSelected: _s, ...x }) => x)} selectedIndex={i} onChange={setI} />
      <Label>Style=Top (badge neo góc icon)</Label>
      <TabBar style="Top" items={TABS} selectedIndex={i} onChange={setI} />
      <Label>Style=Subtle</Label>
      <TabBar style="Subtle" items={TABS} selectedIndex={i} onChange={setI} />
      <Label>Small</Label>
      <TabBar size="Small" items={TABS} selectedIndex={i} onChange={setI} />
    </Col>
  );
}
export const Tab: Story = { name: 'Tab-Bar · mọi style', render: () => <TabDemo /> };
export const Page: Story = {
  name: 'Page-Indicator',
  render: () => {
    const [a, setA] = useState(0);
    return (
      <Col>
        <Label>Neutral · bấm đổi active</Label>
        {[4, 5, 6, 7, 8].map((n) => <PageIndicator key={n} count={n} active={a % n} />)}
        <Label>Accent · Medium / Small</Label>
        <PageIndicator count={5} active={a % 5} state="Accent" />
        <PageIndicator count={5} active={a % 5} state="Accent" size="Small" />
        <Label>Overlay</Label>
        <DarkBox><PageIndicator count={5} active={a % 5} state="Overlay" /><PageIndicator count={5} active={a % 5} state="Overlay" size="Small" /></DarkBox>
        <Row><Button size="Small" level="Tertiary" text="Trước" onPress={() => setA((x) => Math.max(0, x - 1))} /><Button size="Small" level="Tertiary" text="Sau" onPress={() => setA((x) => x + 1)} /></Row>
      </Col>
    );
  },
};
