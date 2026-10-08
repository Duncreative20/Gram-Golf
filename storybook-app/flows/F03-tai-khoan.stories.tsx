/**
 * F03 · Tài khoản
 *
 * Các bước (mỗi bước = một story; ✓ = đã có):
 *  ✓ 01  · Đăng nhập — điền đúng                     (auth)/login            chưa đăng nhập; play: email p-minh + mật khẩu
 *  ✓ 01a · Đăng nhập — bỏ trống                      (auth)/login            play: bấm Đăng nhập
 *  ✓ 01b · Đăng nhập — sai tài khoản / mật khẩu      (auth)/login            play: email không có tài khoản
 *  ✓ 02  · Đăng nhập xong — điểm vào app (người chơi) index                  as p-minh → ↪ /(player)/home
 *  ✓ 02a · Đăng nhập xong — điểm vào app (HLV)       index                   as c-tuan → ↪ /(coach)/roster
 *  ✓ 03  · Quên mật khẩu                             (auth)/forgot-password  chưa đăng nhập
 *  ✓ 03a · Quên mật khẩu — email không hợp lệ        (auth)/forgot-password  play
 *  ✓ 03b · Quên mật khẩu — đã gửi hướng dẫn          (auth)/forgot-password  play
 *  ✓ 04  · Cài đặt (lối vào Mật khẩu)                settings/index          as p-minh
 *  ✓ 05  · Đổi mật khẩu                              settings/password       as p-minh
 *  ✓ 05a · Đổi mật khẩu — lỗi                        settings/password       play: mới trùng hiện tại, nhập lại không khớp
 *  ✓ 05b · Đổi mật khẩu — đã đổi                     settings/password       play: hợp lệ → toast
 *  ✓ 06  · Hồ sơ                                     profile                 as p-minh
 *  ✓ 06a · Hồ sơ — dialog đăng xuất                  profile                 play: bấm Đăng xuất
 *  ✓ 07  · Đã đăng xuất — điểm vào app               index                   chưa đăng nhập → ↪ /(auth)/welcome
 *
 * Tài khoản: p-minh (người chơi, minhanh@gramgolf.vn), c-tuan (HLV). Mật khẩu mock: bất kỳ ≥ 6 ký tự.
 *
 * Chưa có (route không tồn tại — không dựng UI giả):
 *  - Đặt lại mật khẩu từ link trong email (màn nhập mật khẩu mới sau "Quên mật khẩu") — Phase 2.
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fireEvent, screen, userEvent } from 'storybook/test';
import Index from '../../apps/golf/app/index';
import Login from '../../apps/golf/app/(auth)/login';
import ForgotPassword from '../../apps/golf/app/(auth)/forgot-password';
import Settings from '../../apps/golf/app/settings/index';
import PasswordSettings from '../../apps/golf/app/settings/password';
import Profile from '../../apps/golf/app/profile';
import { appStory } from '../lib/appStory';

const meta = { title: 'Luồng/F03 · Tài khoản', id: 'f03' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = Parameters<NonNullable<Story['play']>>[0]['canvas'];

// userEvent.type chỉ đổi DOM, state React của TextInput (react-native-web) không nhận → đặt giá trị bằng sự kiện `input` (xem issues/A.md).
const fill = async (canvas: Canvas, values: Record<string, string>) => {
  for (const [label, value] of Object.entries(values)) await fireEvent.input(await canvas.findByLabelText(label), { target: { value } });
};
const click = async (canvas: Canvas, name: string) => userEvent.click(await canvas.findByRole('button', { name }));

export const DangNhap: Story = {
  name: '01 · Đăng nhập — điền đúng',
  render: () => <Login />,
  ...appStory(),
  play: async ({ canvas }) => {
    await fill(canvas, { 'Email hoặc số điện thoại': 'minhanh@gramgolf.vn', 'Mật khẩu': 'golf2026' });
  },
};

export const DangNhapBoTrong: Story = {
  name: '01a · Đăng nhập — bỏ trống',
  render: () => <Login />,
  ...appStory(),
  play: async ({ canvas }) => {
    await click(canvas, 'Đăng nhập');
  },
};

export const DangNhapSai: Story = {
  name: '01b · Đăng nhập — sai tài khoản / mật khẩu',
  render: () => <Login />,
  ...appStory(),
  play: async ({ canvas }) => {
    await fill(canvas, { 'Email hoặc số điện thoại': 'minhanh@gramgolf.com', 'Mật khẩu': 'golf2026' });
    await click(canvas, 'Đăng nhập');
  },
};

export const VaoAppNguoiChoi: Story = {
  name: '02 · Đăng nhập xong — điểm vào app (người chơi)',
  render: () => <Index />,
  ...appStory({ as: 'p-minh' }),
};

export const VaoAppHlv: Story = {
  name: '02a · Đăng nhập xong — điểm vào app (HLV)',
  render: () => <Index />,
  ...appStory({ as: 'c-tuan' }),
};

export const QuenMatKhau: Story = {
  name: '03 · Quên mật khẩu',
  render: () => <ForgotPassword />,
  ...appStory(),
};

export const QuenMatKhauEmailSai: Story = {
  name: '03a · Quên mật khẩu — email không hợp lệ',
  render: () => <ForgotPassword />,
  ...appStory(),
  play: async ({ canvas }) => {
    await fill(canvas, { Email: 'minhanh@gramgolf' });
    await click(canvas, 'Gửi hướng dẫn');
  },
};

export const QuenMatKhauDaGui: Story = {
  name: '03b · Quên mật khẩu — đã gửi hướng dẫn',
  render: () => <ForgotPassword />,
  ...appStory(),
  play: async ({ canvas }) => {
    await fill(canvas, { Email: 'minhanh@gramgolf.vn' });
    await click(canvas, 'Gửi hướng dẫn');
  },
};

export const CaiDat: Story = {
  name: '04 · Cài đặt (lối vào Mật khẩu)',
  render: () => <Settings />,
  ...appStory({ as: 'p-minh' }),
};

export const DoiMatKhau: Story = {
  name: '05 · Đổi mật khẩu',
  render: () => <PasswordSettings />,
  ...appStory({ as: 'p-minh' }),
};

export const DoiMatKhauLoi: Story = {
  name: '05a · Đổi mật khẩu — lỗi',
  render: () => <PasswordSettings />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await fill(canvas, { 'Mật khẩu hiện tại': 'golf2026', 'Mật khẩu mới': 'golf2026', 'Nhập lại mật khẩu mới': 'golf2027' });
    await userEvent.click((await canvas.findAllByRole('button', { name: 'Hiện mật khẩu' }))[0]!); // một nút hiện cả 3 ô → thấy vì sao lỗi
    await click(canvas, 'Đổi mật khẩu');
  },
};

export const DoiMatKhauXong: Story = {
  name: '05b · Đổi mật khẩu — đã đổi',
  render: () => <PasswordSettings />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await fill(canvas, { 'Mật khẩu hiện tại': 'golf2026', 'Mật khẩu mới': 'swing2027', 'Nhập lại mật khẩu mới': 'swing2027' });
    await click(canvas, 'Đổi mật khẩu');
  },
};

export const HoSo: Story = {
  name: '06 · Hồ sơ',
  render: () => <Profile />,
  ...appStory({ as: 'p-minh' }),
};

export const HoSoDangXuat: Story = {
  name: '06a · Hồ sơ — dialog đăng xuất',
  render: () => <Profile />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await click(canvas, 'Đăng xuất');
    await screen.findByText('Đăng xuất?'); // Dialog vẽ trong portal
  },
};

export const DaDangXuat: Story = {
  name: '07 · Đã đăng xuất — điểm vào app',
  render: () => <Index />,
  ...appStory(),
};
