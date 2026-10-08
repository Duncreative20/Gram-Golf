/**
 * F03 · Tài khoản — kịch bản: docs/flows/F03/steps.json, storyboard: docs/flows/F03.md
 *
 * Các bước (mỗi bước shot = một story `f03--b-<nn>-<slug>`; ✓ = đã có):
 *  ✓ 01  · Đăng nhập với email chưa có tài khoản     (auth)/login            chưa đăng nhập; play: khongco@vidu.vn → Đăng nhập
 *  ✓ 02  · Quên mật khẩu — email sai dạng            (auth)/forgot-password  play: “minhanh@” → Gửi link
 *  ✓ 03  · Email đúng → Gửi link                     (auth)/forgot-password  play: minhanh@gramgolf.vn → Gửi link (có “Mở link (thử)”)
 *  ✓ 04  · Mở link → mật khẩu thiếu số → Đặt lại     (auth)/reset-password   token GG-RESET-OK; play: golfmoi / golfmoi1
 *  ✓ 05  · Đặt lại xong → Đăng nhập                  (auth)/login            params reset=1
 *  ✓ 06  · Đăng nhập Minh Anh với mật khẩu mới       (player)/home           as p-minh, tab home
 *  ✓ 07  · Đổi mật khẩu: nhập lại khác               settings/password       as p-minh; play: golfmoi2026 / golf2027 / golf2028
 *  ✓ 08  · Đổi mật khẩu xong                         settings/password       play: hợp lệ → toast (hold toast)
 *  ✓ 09  · Hồ sơ → Đăng xuất                         profile                 play: bấm Đăng xuất
 *  ✓ 10  · Xác nhận → về màn chào                    (auth)/welcome          chưa đăng nhập
 *  ✓ 11  · Link đặt lại đã hết hạn                   (auth)/reset-password   token GG-RESET-EXPIRED
 *  ✓ 12  · Link thiếu token                          (auth)/reset-password   không params
 * Biến thể:
 *  ✓ 01a · Đăng nhập — điền đúng                     (auth)/login            play: email p-minh + mật khẩu
 *  ✓ 01b · Đăng nhập — bỏ trống                      (auth)/login            play: bấm Đăng nhập
 *  ✓ 02a · Quên mật khẩu                             (auth)/forgot-password  chưa đăng nhập
 *  ✓ 04a · Đặt lại mật khẩu — form trống             (auth)/reset-password   token GG-RESET-OK
 *  ✓ 04b · Đặt lại mật khẩu — bỏ trống               (auth)/reset-password   play: bấm Đặt lại mật khẩu
 *  ✓ 06a · Đăng nhập xong — HLV                      index                   as c-tuan → ↪ /(coach)/roster
 *  ✓ 06b · Điểm vào app — người chơi (chuyển hướng)  index                   as p-minh → ↪ /(player)/home
 *  ✓ 07a · Cài đặt (lối vào Mật khẩu)                settings/index          as p-minh
 *  ✓ 07b · Đổi mật khẩu — form                       settings/password       as p-minh
 *  ✓ 09a · Hồ sơ                                     profile                 as p-minh
 *  ✓ 10a · Đã đăng xuất — điểm vào app (chuyển hướng) index                  chưa đăng nhập → ↪ /(auth)/welcome
 *
 * Tài khoản: p-minh (người chơi, minhanh@gramgolf.vn), c-tuan (HLV). Mật khẩu mock: bất kỳ ≥ 6 ký tự (không lưu — đặt lại / đổi chỉ kiểm định dạng).
 *
 * Chưa có (route không tồn tại — không dựng UI giả): không.
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { screen, userEvent } from 'storybook/test';
import Index from '../../apps/golf/app/index';
import Welcome from '../../apps/golf/app/(auth)/welcome';
import Login from '../../apps/golf/app/(auth)/login';
import ForgotPassword from '../../apps/golf/app/(auth)/forgot-password';
import ResetPassword from '../../apps/golf/app/(auth)/reset-password';
import PlayerHome from '../../apps/golf/app/(player)/home';
import Settings from '../../apps/golf/app/settings/index';
import PasswordSettings from '../../apps/golf/app/settings/password';
import Profile from '../../apps/golf/app/profile';
import { appStory, typeIn } from '../lib/appStory';

const meta = { title: 'Luồng/F03 · Tài khoản', id: 'f03' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = Parameters<NonNullable<Story['play']>>[0]['canvas'];

const fill = async (canvas: Canvas, values: Record<string, string>) => {
  for (const [label, value] of Object.entries(values)) await typeIn(await canvas.findByLabelText(label), value);
};
const click = async (canvas: Canvas, name: string) => userEvent.click(await canvas.findByRole('button', { name }));
const LINK_OK = { token: 'GG-RESET-OK' };

// ── Bước của luồng ───────────────────────────────────────────────────────────
export const B01DangNhapSai: Story = {
  name: '01 · Đăng nhập với email chưa có tài khoản',
  render: () => <Login />,
  ...appStory(),
  play: async ({ canvas }) => {
    await fill(canvas, { 'Email hoặc số điện thoại': 'khongco@vidu.vn', 'Mật khẩu': '123456' });
    await click(canvas, 'Đăng nhập');
  },
};

export const B02QuenMkLoi: Story = {
  name: '02 · Quên mật khẩu — email sai dạng',
  render: () => <ForgotPassword />,
  ...appStory(),
  play: async ({ canvas }) => {
    await fill(canvas, { Email: 'minhanh@' });
    await click(canvas, 'Gửi link');
  },
};

export const B03DaGuiLink: Story = {
  name: '03 · Email đúng → Gửi link',
  render: () => <ForgotPassword />,
  ...appStory(),
  play: async ({ canvas }) => {
    await fill(canvas, { Email: 'minhanh@gramgolf.vn' });
    await click(canvas, 'Gửi link');
    await canvas.findByRole('button', { name: 'Mở link (thử)' });
  },
};

export const B04DatLaiLoi: Story = {
  name: '04 · Mở link → mật khẩu thiếu số → Đặt lại',
  render: () => <ResetPassword />,
  ...appStory({ params: LINK_OK }),
  play: async ({ canvas }) => {
    await fill(canvas, { 'Mật khẩu mới': 'golfmoi', 'Nhập lại mật khẩu mới': 'golfmoi1' });
    await click(canvas, 'Đặt lại mật khẩu');
  },
};

export const B05VeDangNhap: Story = {
  name: '05 · Đặt lại xong → Đăng nhập',
  render: () => <Login />,
  ...appStory({ params: { reset: '1' } }),
};

export const B06VaoApp: Story = {
  name: '06 · Đăng nhập Minh Anh với mật khẩu mới',
  render: () => <PlayerHome />,
  ...appStory({ as: 'p-minh', tabs: { role: 'player', active: 'home' } }),
};

export const B07DoiMkLoi: Story = {
  name: '07 · Đổi mật khẩu: nhập lại khác',
  render: () => <PasswordSettings />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await fill(canvas, { 'Mật khẩu hiện tại': 'golfmoi2026', 'Mật khẩu mới': 'golf2027', 'Nhập lại mật khẩu mới': 'golf2028' });
    await click(canvas, 'Đổi mật khẩu');
  },
};

export const B08DoiMkXong: Story = {
  name: '08 · Đổi mật khẩu xong',
  render: () => <PasswordSettings />,
  ...appStory({ as: 'p-minh', hold: ['toast'] }),
  play: async ({ canvas }) => {
    await fill(canvas, { 'Mật khẩu hiện tại': 'golfmoi2026', 'Mật khẩu mới': 'golf2027', 'Nhập lại mật khẩu mới': 'golf2027' });
    await click(canvas, 'Đổi mật khẩu');
  },
};

export const B09DangXuat: Story = {
  name: '09 · Hồ sơ → Đăng xuất',
  render: () => <Profile />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await click(canvas, 'Đăng xuất');
    await screen.findByText('Đăng xuất?'); // Dialog vẽ trong portal
  },
};

export const B10VeChao: Story = {
  name: '10 · Xác nhận → về màn chào',
  render: () => <Welcome />,
  ...appStory(),
};

export const B11LinkHetHan: Story = {
  name: '11 · Link đặt lại đã hết hạn',
  render: () => <ResetPassword />,
  ...appStory({ params: { token: 'GG-RESET-EXPIRED' } }),
};

export const B12LinkSai: Story = {
  name: '12 · Link thiếu token',
  render: () => <ResetPassword />,
  ...appStory(),
};

// ── Biến thể ─────────────────────────────────────────────────────────────────
export const DangNhap: Story = {
  name: '01a · Đăng nhập — điền đúng',
  render: () => <Login />,
  ...appStory(),
  play: async ({ canvas }) => {
    await fill(canvas, { 'Email hoặc số điện thoại': 'minhanh@gramgolf.vn', 'Mật khẩu': 'golf2026' });
  },
};

export const DangNhapBoTrong: Story = {
  name: '01b · Đăng nhập — bỏ trống',
  render: () => <Login />,
  ...appStory(),
  play: async ({ canvas }) => {
    await click(canvas, 'Đăng nhập');
  },
};

export const QuenMatKhau: Story = {
  name: '02a · Quên mật khẩu',
  render: () => <ForgotPassword />,
  ...appStory(),
};

export const DatLaiMatKhau: Story = {
  name: '04a · Đặt lại mật khẩu — form trống',
  render: () => <ResetPassword />,
  ...appStory({ params: LINK_OK }),
};

export const DatLaiMatKhauBoTrong: Story = {
  name: '04b · Đặt lại mật khẩu — bỏ trống',
  render: () => <ResetPassword />,
  ...appStory({ params: LINK_OK }),
  play: async ({ canvas }) => {
    await click(canvas, 'Đặt lại mật khẩu');
  },
};

export const VaoAppHlv: Story = {
  name: '06a · Đăng nhập xong — HLV',
  render: () => <Index />,
  ...appStory({ as: 'c-tuan' }),
};

export const VaoAppNguoiChoi: Story = {
  name: '06b · Điểm vào app — người chơi (chuyển hướng)',
  render: () => <Index />,
  ...appStory({ as: 'p-minh' }),
};

export const CaiDat: Story = {
  name: '07a · Cài đặt (lối vào Mật khẩu)',
  render: () => <Settings />,
  ...appStory({ as: 'p-minh' }),
};

export const DoiMatKhau: Story = {
  name: '07b · Đổi mật khẩu — form',
  render: () => <PasswordSettings />,
  ...appStory({ as: 'p-minh' }),
};

export const HoSo: Story = {
  name: '09a · Hồ sơ',
  render: () => <Profile />,
  ...appStory({ as: 'p-minh' }),
};

export const DaDangXuat: Story = {
  name: '10a · Đã đăng xuất — điểm vào app (chuyển hướng)',
  render: () => <Index />,
  ...appStory(),
};
