import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';
import { TextField } from './TextField';
import { SearchField } from './SearchField';
import { SelectField } from './SelectField';
import { TextArea } from './TextArea';
import { MessageInput } from './MessageInput';
import { DateField } from './DateField';
import { FieldGroup } from './FieldGroup';
import type { InputSize } from './textFieldStyles';
import { Col, DarkBox, Label } from '../../stories/helpers';

const SIZES: InputSize[] = ['Small', 'Medium (Base)', 'Large', 'XLarge'];

const meta = {
  title: 'Input/Text-Field',
  component: TextField,
  tags: ['autodocs'],
  args: { label: 'Họ tên', placeholder: 'Nhập họ tên', helpText: 'Tên hiển thị trên hồ sơ', size: 'Medium (Base)', onChangeText: fn() },
  argTypes: { size: { control: 'select', options: SIZES }, error: { control: 'text' }, leadingIcon: { control: 'text' }, trailingIcon: { control: 'text' } },
} satisfies Meta<typeof TextField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: 'Mặc định' };
export const MoiCo: Story = { name: 'Mọi cỡ', render: () => <Col>{SIZES.map((s) => <TextField key={s} size={s} placeholder={`Size=${s}`} />)}</Col> };
export const TrangThai: Story = {
  name: 'Trạng thái',
  render: () => (
    <Col>
      <TextField label="Có chữ" value="Nguyễn Văn A" onChangeText={() => {}} clearable />
      <TextField label="Lỗi" placeholder="you@example.com" error="Email không hợp lệ" />
      <TextField label="Read-only" value="Không sửa được" readOnly />
      <TextField label="Disabled" placeholder="Disabled" disabled helpText="Không khả dụng" />
      <TextField label="Icon" placeholder="Mật khẩu" leadingIcon="lock-01-line" trailingIcon="eye-line" trailingAccessibilityLabel="Hiện mật khẩu" onTrailingPress={() => {}} secureTextEntry />
    </Col>
  ),
};
export const Search: Story = {
  name: 'Search · Default / Rounded / Overlay',
  render: () => (
    <Col>
      <SearchField placeholder="Tìm sân golf" />
      <SearchField type="Rounded" placeholder="Tìm sân golf" />
      <DarkBox>
        <SearchField overlay placeholder="Tìm trên nền tối" />
        <SearchField overlay type="Rounded" placeholder="Rounded" />
      </DarkBox>
    </Col>
  ),
};
export const Select: Story = {
  name: 'Select-Field',
  render: () => (
    <Col>
      <SelectField label="Sân" placeholder="Chọn sân" onPress={() => {}} />
      <SelectField label="Đã chọn" value="Sân 18 lỗ" onPress={() => {}} />
      <SelectField label="Lỗi" placeholder="Chọn" error="Bắt buộc" onPress={() => {}} />
      <SelectField label="Disabled" value="—" disabled onPress={() => {}} />
    </Col>
  ),
};
export const Area: Story = {
  name: 'Text-Area',
  render: () => (
    <Col>
      <TextArea label="Ghi chú" placeholder="Nhập ghi chú…" helpText="Tối đa 500 ký tự" />
      <TextArea size="Small" placeholder="Small · error" error="Không được để trống" />
      <TextArea size="Large" placeholder="Large · disabled" disabled />
    </Col>
  ),
};
function MessageDemo({ overlay }: { overlay?: boolean }) {
  const [v, setV] = useState('');
  const [v2, setV2] = useState('Hẹn 7h sân A nhé');
  const items = (
    <>
      <MessageInput overlay={overlay} placeholder="Nhắn gì đó…" value={v} onChangeText={setV} onSend={() => setV('')} />
      <MessageInput overlay={overlay} value={v2} onChangeText={setV2} onSend={() => setV2('')} helpText="Có chữ → nút gửi" />
      <MessageInput overlay={overlay} value="Không gửi được" onChangeText={() => {}} error="Mất kết nối" />
      <MessageInput overlay={overlay} value="Chỉ đọc" onChangeText={() => {}} readOnly />
      <MessageInput overlay={overlay} placeholder="Disabled" disabled />
    </>
  );
  return overlay ? <DarkBox>{items}</DarkBox> : <Col>{items}</Col>;
}
export const Message: Story = { name: 'Message-Input', render: () => <MessageDemo /> };
export const MessageOverlay: Story = { name: 'Message-Input-Overlay', render: () => <MessageDemo overlay /> };
export const Date: Story = {
  name: 'Date-Field',
  render: () => (
    <Col>
      <DateField label="Ngày chơi" placeholder="Chọn ngày" onPress={() => {}} helpText="Mở Date-Picker" />
      <DateField label="Đã chọn" value="24/09/2026" onPress={() => {}} />
      <DateField label="Lỗi" placeholder="Chọn ngày" error="Bắt buộc" onPress={() => {}} />
      <DateField label="Read-only" value="24/09/2026" readOnly onPress={() => {}} />
      <DateField label="Disabled" placeholder="—" disabled onPress={() => {}} />
    </Col>
  ),
};
export const Group: Story = {
  name: 'Field-Group',
  render: () => (
    <Col>
      <Label>Medium</Label>
      <FieldGroup label="Địa chỉ" rows={[{ key: 'street', placeholder: 'Số nhà, đường' }, { key: 'ward', placeholder: 'Phường' }, { key: 'city', placeholder: 'Thành phố', leadingIcon: 'marker-pin-01-line' }]} />
      <Label>Small · XLarge</Label>
      <FieldGroup size="Small" rows={[{ key: 'a', placeholder: 'Small 1' }, { key: 'b', placeholder: 'Small 2' }]} />
      <FieldGroup size="XLarge" label="XLarge" rows={[{ key: 'a', value: 'Đã nhập' }, { key: 'b', placeholder: 'Dòng 2' }]} />
    </Col>
  ),
};
