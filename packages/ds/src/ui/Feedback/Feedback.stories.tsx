import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';
import { AlertBanner } from './AlertBanner';
import { InlineMessage } from './InlineMessage';
import { Toast } from './Toast';
import { ProgressBar, Skeleton, SkeletonText } from '../Progress/ProgressBar';
import { Accordion } from '../Accordion/Accordion';
import { Text } from '../Text';
import type { StatusTheme } from './feedbackStyles';
import { Col, DarkBox, Label, Row } from '../../stories/helpers';

const THEMES: StatusTheme[] = ['Neutral', 'Info', 'Positive', 'Warning', 'Negative'];

const meta = {
  title: 'Feedback/Alert, Inline, Toast',
  component: AlertBanner,
  tags: ['autodocs'],
  args: { text: 'Thông báo toàn trang', theme: 'Info', size: 'Medium', actionText: 'Xem', onAction: fn(), onClose: fn() },
  argTypes: { theme: { control: 'select', options: THEMES }, size: { control: 'radio', options: ['Medium', 'Small'] } },
} satisfies Meta<typeof AlertBanner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: 'Alert-Banner' };
export const MoiTheme: Story = {
  name: 'Alert-Banner · mọi theme',
  render: () => <Col>{THEMES.map((th) => <AlertBanner key={th} theme={th} text={`${th} — thông báo toàn trang`} actionText="Xem" onAction={() => {}} onClose={() => {}} />)}<AlertBanner theme="Info" size="Small" text="Small · Info" onClose={() => {}} /></Col>,
};
export const Inline: Story = {
  name: 'Inline-Message',
  render: () => <Col>{THEMES.map((th) => <InlineMessage key={th} theme={th} title={th} text="Caption mô tả chi tiết, có thể xuống dòng." actionText="Hành động" onAction={() => {}} onClose={() => {}} />)}<InlineMessage text="Không title, không action" /></Col>,
};
export const ToastStory: Story = {
  name: 'Toast-Message',
  render: () => (
    <Col>
      <Toast title="Đã lưu" caption="Bài viết đã vào bộ sưu tập" actionText="Mở" onAction={() => {}} onClose={() => {}} />
      <Toast type="Subtle" title="Subtle" caption="Popover bg + border" onClose={() => {}} />
      <Toast type="Positive" title="Thành công" />
      <Toast type="Warning" title="Cảnh báo" caption="On-Brights" />
      <Toast type="Negative" title="Lỗi" actionText="Thử lại" onAction={() => {}} />
    </Col>
  ),
};
export const Progress: Story = {
  name: 'Progress-Bar · Skeleton',
  render: () => (
    <Col>
      <ProgressBar value={0.25} label="Accent · 25%" />
      <ProgressBar value={0.5} theme="Neutral" label="Neutral · 50%" />
      <ProgressBar value={0.75} theme="Status" status="Warning" label="Status Warning" />
      <ProgressBar value={1} theme="Status" status="Positive" />
      <DarkBox><ProgressBar value={0.6} theme="Overlay" label="Overlay" /></DarkBox>
      <Label>Skeleton</Label>
      <Row><Skeleton shape="Round" /><Skeleton /><Skeleton shape="Pill" /><Skeleton shape="Pill" size="Small - 32px" /></Row>
      <SkeletonText heading="Large" />
      <SkeletonText lines={3} />
    </Col>
  ),
};
export const AccordionStory: Story = {
  name: 'Accordion · Divider / Box',
  render: () => (
    <Col>
      <Accordion title="Divider · Large" defaultExpanded><Text variant="Body/Base/Regular">Nội dung mở sẵn. Theme Divider có đường kẻ dưới.</Text></Accordion>
      <Accordion title="Divider · Medium" size="Medium" />
      <Accordion title="Box · XLarge" theme="Box" size="XLarge" />
      <Accordion title="Box · Large" theme="Box" />
    </Col>
  ),
};
