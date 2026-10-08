/**
 * F12 · Hồ sơ & cài đặt
 *
 * Tài khoản: p-minh (người chơi có handicap, CLB, bio), c-tuan (HLV: học viện, kinh nghiệm, đơn giá, có bài đăng).
 * Vào: avatar trên TabHeader → profile (mọi vai) / tab Hồ sơ (HLV) → Cài đặt → từng mục.
 *
 * Các bước (mỗi bước = một story; ✓ = đã có):
 *  ✓ 01  · Hồ sơ người chơi                    profile                as p-minh
 *  ✓ 02  · Hồ sơ HLV — tab Hồ sơ               (coach)/me             as c-tuan, tab coach/me
 *  ✓ 02a · Hồ sơ HLV — màn hồ sơ               profile                as c-tuan
 *  ✓ 03  · Cài đặt                             settings/index         as p-minh (có mục Dev vì __DEV__)
 *  ✓ 04  · Tài khoản — người chơi              settings/account       as p-minh
 *  ✓ 04a · Tài khoản — HLV                     settings/account       as c-tuan
 *  ✓ 04b · Tài khoản — lỗi                     xoá tên, SĐT trùng p-lan, handicap 60 → Lưu
 *  ✓ 04c · Tài khoản — đã lưu                  Lưu → Toast “Đã lưu hồ sơ”
 *  ✓ 05  · Mật khẩu                            settings/password
 *  ✓ 06  · Quyền riêng tư                      settings/privacy       as p-minh (chưa chặn ai)
 *  ✓ 06a · Quyền riêng tư — đã chặn, công khai bộ gậy    p-minh chặn p-lan + p-khoa, publicClubs bật
 *  ✓ 06b · Xoá tài khoản — bước 1              Dialog “Xoá tài khoản?”
 *  ✓ 06c · Xoá tài khoản — xác nhận lần cuối   Dialog bước 2
 *  ✓ 06d · Quyền riêng tư — HLV                as c-tuan (không có mục công khai dữ liệu)
 *  ✓ 07  · Cài đặt thông báo — người chơi      settings/notifications as p-minh
 *  ✓ 07a · Cài đặt thông báo — HLV, đã tắt một số + giờ yên lặng   as c-tuan
 *  ✓ 08  · Đơn vị đo — mét                     settings/units
 *  ✓ 08a · Đơn vị đo — yard                    prefs.units = imperial
 *  ✓ 09  · Dev                                 settings/dev           as p-minh
 *  ✓ 09a · Dev — đặt lại dữ liệu mẫu (dialog)
 *
 * Trùng F03 — không nhân bản: lỗi / đã đổi mật khẩu = f03--doi-mat-khau-loi, f03--doi-mat-khau-xong;
 * đăng xuất (Dialog ở profile) = f03--ho-so-dang-xuat. 01 · Hồ sơ, 03 · Cài đặt, 05 · Mật khẩu giữ làm bước của luồng này.
 *
 * Chưa có (route không tồn tại — không dựng UI giả):
 *  - Đổi ảnh đại diện (chưa có chọn ảnh; avatarUrl chỉ đọc).
 *  - Đổi email / xác thực lại số điện thoại (OTP) khi sửa SĐT.
 *  - Bản dev chặn ở bản release (settings/dev → Redirect khi !__DEV__): Storybook luôn __DEV__ = true nên không dựng được.
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fireEvent, screen, userEvent } from 'storybook/test';
import Profile from '../../apps/golf/app/profile';
import CoachMe from '../../apps/golf/app/(coach)/me';
import Settings from '../../apps/golf/app/settings/index';
import Account from '../../apps/golf/app/settings/account';
import Password from '../../apps/golf/app/settings/password';
import Privacy from '../../apps/golf/app/settings/privacy';
import NotificationSettings from '../../apps/golf/app/settings/notifications';
import Units from '../../apps/golf/app/settings/units';
import DevSettings from '../../apps/golf/app/settings/dev';
import { DEFAULT_PREFS } from '../../apps/golf/lib/mock';
import { appStory } from '../lib/appStory';

const meta = { title: 'Luồng/F12 · Hồ sơ & cài đặt', id: 'f12' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = Parameters<NonNullable<Story['play']>>[0]['canvas'];

// userEvent.type chỉ đổi chữ trong DOM, KHÔNG gọi onChangeText của TextInput (RNW 0.21 + React 19) → gõ bằng fireEvent.change.
const typeIn = async (canvas: Canvas, label: string, value: string) => fireEvent.change(await canvas.findByLabelText(label), { target: { value } });
const click = async (canvas: Canvas, name: string | RegExp) => userEvent.click(await canvas.findByRole('button', { name }));

// ── 01–02 · Hồ sơ ─────────────────────────────────────────────
export const HoSoNguoiChoi: Story = {
  name: '01 · Hồ sơ người chơi',
  render: () => <Profile />,
  ...appStory({ as: 'p-minh' }),
};

export const HoSoHlvTab: Story = {
  name: '02 · Hồ sơ HLV — tab Hồ sơ',
  render: () => <CoachMe />,
  ...appStory({ as: 'c-tuan', tabs: { role: 'coach', active: 'me' } }),
};

export const HoSoHlv: Story = {
  name: '02a · Hồ sơ HLV — màn hồ sơ',
  render: () => <Profile />,
  ...appStory({ as: 'c-tuan' }),
};

// ── 03 · Cài đặt ──────────────────────────────────────────────
export const CaiDat: Story = {
  name: '03 · Cài đặt',
  render: () => <Settings />,
  ...appStory({ as: 'p-minh' }),
};

// ── 04 · Tài khoản ────────────────────────────────────────────
export const TaiKhoan: Story = {
  name: '04 · Tài khoản — người chơi',
  render: () => <Account />,
  ...appStory({ as: 'p-minh' }),
};

export const TaiKhoanHlv: Story = {
  name: '04a · Tài khoản — HLV',
  render: () => <Account />,
  ...appStory({ as: 'c-tuan' }),
};

export const TaiKhoanLoi: Story = {
  name: '04b · Tài khoản — lỗi',
  render: () => <Account />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await typeIn(canvas, 'Họ tên', '');
    await typeIn(canvas, 'Số điện thoại', '0983 210 456'); // SĐT của p-lan
    await typeIn(canvas, 'Handicap', '60');
    await click(canvas, 'Lưu');
  },
};

export const TaiKhoanDaLuu: Story = {
  name: '04c · Tài khoản — đã lưu',
  render: () => <Account />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await typeIn(canvas, 'Handicap', '13,5');
    await click(canvas, 'Lưu');
  },
};

// ── 05 · Mật khẩu ─────────────────────────────────────────────
export const MatKhau: Story = {
  name: '05 · Mật khẩu',
  render: () => <Password />,
  ...appStory({ as: 'p-minh' }),
};

// ── 06 · Quyền riêng tư ───────────────────────────────────────
export const QuyenRiengTu: Story = {
  name: '06 · Quyền riêng tư',
  render: () => <Privacy />,
  ...appStory({ as: 'p-minh' }),
};

export const QuyenRiengTuDaChan: Story = {
  name: '06a · Quyền riêng tư — đã chặn, công khai bộ gậy',
  render: () => <Privacy />,
  ...appStory({
    as: 'p-minh',
    setup: [
      { type: 'block', blockerId: 'p-minh', blockedId: 'p-lan' },
      { type: 'block', blockerId: 'p-minh', blockedId: 'p-khoa' },
      { type: 'setPrefs', userId: 'p-minh', patch: { publicClubs: true } },
    ],
  }),
};

export const XoaTaiKhoan: Story = {
  name: '06b · Xoá tài khoản — bước 1',
  render: () => <Privacy />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await click(canvas, /Xoá tài khoản/);
  },
};

export const XoaTaiKhoanLanCuoi: Story = {
  name: '06c · Xoá tài khoản — xác nhận lần cuối',
  render: () => <Privacy />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await click(canvas, /Xoá tài khoản/);
    await userEvent.click(await screen.findByRole('button', { name: 'Tiếp tục' })); // Dialog là Modal → ngoài canvas
  },
};

export const QuyenRiengTuHlv: Story = {
  name: '06d · Quyền riêng tư — HLV',
  render: () => <Privacy />,
  ...appStory({ as: 'c-tuan' }),
};

// ── 07 · Cài đặt thông báo ────────────────────────────────────
export const CaiDatThongBao: Story = {
  name: '07 · Cài đặt thông báo — người chơi',
  render: () => <NotificationSettings />,
  ...appStory({ as: 'p-minh' }),
};

export const CaiDatThongBaoHlv: Story = {
  name: '07a · Cài đặt thông báo — HLV, đã tắt một số + giờ yên lặng',
  render: () => <NotificationSettings />,
  ...appStory({
    as: 'c-tuan',
    setup: [{ type: 'setPrefs', userId: 'c-tuan', patch: { quietHours: true, notify: { ...DEFAULT_PREFS.notify, like: false, follow: false } } }],
  }),
};

// ── 08 · Đơn vị đo ────────────────────────────────────────────
export const DonViMet: Story = {
  name: '08 · Đơn vị đo — mét',
  render: () => <Units />,
  ...appStory({ as: 'p-minh' }),
};

export const DonViYard: Story = {
  name: '08a · Đơn vị đo — yard',
  render: () => <Units />,
  ...appStory({ as: 'p-minh', setup: [{ type: 'setPrefs', userId: 'p-minh', patch: { units: 'imperial' } }] }),
};

// ── 09 · Dev ──────────────────────────────────────────────────
export const Dev: Story = {
  name: '09 · Dev',
  render: () => <DevSettings />,
  ...appStory({ as: 'p-minh' }),
};

export const DevDatLai: Story = {
  name: '09a · Dev — đặt lại dữ liệu mẫu',
  render: () => <DevSettings />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await click(canvas, /Đặt lại dữ liệu mẫu/);
  },
};
