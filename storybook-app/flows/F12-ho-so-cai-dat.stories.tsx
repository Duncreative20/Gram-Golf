/**
 * F12 · Hồ sơ & cài đặt — kịch bản: docs/flows/F12/steps.json, storyboard: docs/flows/F12.md
 *
 * Tài khoản: p-minh (người chơi có handicap, CLB, bio; lượt đi đổi tên thành "Nguyễn Thị Minh Anh" + ảnh mẫu), c-tuan (HLV: học viện,
 * kinh nghiệm, đơn giá, có bài đăng). Bước ghi dữ liệu của lượt đi (sửa hồ sơ, công khai bộ gậy, yard, chặn Khoa, bio HLV) → `setup`.
 *
 * Các bước (mỗi bước shot = một story `f12--b-<nn>-<slug>`; ✓ = đã có):
 *  ✓ 01 · Minh Anh chạm avatar trên header       profile                as p-minh
 *  ✓ 02 · Sửa tài khoản: ảnh, họ tên, handicap    settings/account       as p-minh, play: Chọn ảnh + gõ Họ tên / Handicap / CLB
 *  ✓ 03 · Lưu → quay lại Hồ sơ                    profile                MINH_SUA
 *  ✓ 04 · Cài đặt                                 settings/index         (có mục Dev vì __DEV__)
 *  ✓ 05 · Quyền riêng tư — bật Công khai bộ gậy  settings/privacy       publicClubs
 *  ✓ 06 · Thông báo                               settings/notifications 7 loại của người chơi + Giờ yên lặng
 *  ✓ 07 · Đơn vị đo → Yard                        settings/units         YARD
 *  ✓ 08 · Quay về Tổng quan                       (player)/home          MINH_SUA + YARD, tab home
 *  ✓ 09 · Người đã chặn                           settings/privacy       … + CHAN_KHOA
 *  ✓ 10 · Bỏ chặn                                 settings/privacy       play: Bỏ chặn (toast giữ nguyên)
 *  ✓ 11 · HLV Tuấn — giới thiệu quá ngắn          settings/account       as c-tuan, play: gõ "Ngắn quá" → Lưu
 *  ✓ 12 · HLV Tuấn — giới thiệu mới               (coach)/me             BIO_TUAN, tab me
 *  ✓ 13 · Xoá tài khoản — bước 1                  settings/privacy       play: Xoá tài khoản → Dialog
 *  ✓ 14 · Sau xoá → màn chào                      (auth)/welcome         chưa đăng nhập
 * Biến thể:
 *  ✓ 02a · Tài khoản — HLV                        as c-tuan (đơn giá "450.000")
 *  ✓ 02b · Tài khoản — lỗi                        xoá tên, SĐT trùng p-lan, handicap 60 → Lưu
 *  ✓ 02c · Tài khoản — đã lưu                     Lưu → Toast “Đã lưu hồ sơ” (giữ nguyên)
 *  ✓ 04a · Mật khẩu                               settings/password
 *  ✓ 04b · Dev / 04c · Dev — đặt lại dữ liệu mẫu  settings/dev
 *  ✓ 05a · Quyền riêng tư — HLV                   as c-tuan (không có mục công khai dữ liệu)
 *  ✓ 06a · Cài đặt thông báo — HLV                đã tắt một số + giờ yên lặng
 *  ✓ 07a · Đơn vị đo — mét
 *  ✓ 12a · Hồ sơ HLV — màn hồ sơ                  profile as c-tuan
 *  ✓ 13a · Xoá tài khoản — xác nhận lần cuối      Dialog bước 2
 *
 * Trùng F03 — không nhân bản: lỗi / đã đổi mật khẩu = f03--b-07-doi-mk-loi, f03--b-08-doi-mk-xong;
 * đăng xuất (Dialog ở profile) = f03--b-09-dang-xuat.
 *
 * Chưa có (route không tồn tại — không dựng UI giả):
 *  - Ảnh đại diện từ thư viện ảnh / camera (chỉ ảnh mẫu, chưa thêm dependency).
 *  - Đổi email / xác thực lại số điện thoại (OTP) khi sửa SĐT.
 *  - Bản dev chặn ở bản release (settings/dev → Redirect khi !__DEV__): Storybook luôn __DEV__ = true nên không dựng được.
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { screen, userEvent } from 'storybook/test';
import Profile from '../../apps/golf/app/profile';
import CoachMe from '../../apps/golf/app/(coach)/me';
import PlayerHome from '../../apps/golf/app/(player)/home';
import Welcome from '../../apps/golf/app/(auth)/welcome';
import Settings from '../../apps/golf/app/settings/index';
import Account from '../../apps/golf/app/settings/account';
import Password from '../../apps/golf/app/settings/password';
import Privacy from '../../apps/golf/app/settings/privacy';
import NotificationSettings from '../../apps/golf/app/settings/notifications';
import Units from '../../apps/golf/app/settings/units';
import DevSettings from '../../apps/golf/app/settings/dev';
import { DEFAULT_PREFS } from '../../apps/golf/lib/mock';
import { SAMPLE_AVATARS } from '../../apps/golf/lib/simulate';
import { appStory, typeIn } from '../lib/appStory';

const meta = { title: 'Luồng/F12 · Hồ sơ & cài đặt', id: 'f12' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = Parameters<NonNullable<Story['play']>>[0]['canvas'];

const fill = async (canvas: Canvas, values: Record<string, string>) => {
  for (const [label, value] of Object.entries(values)) await typeIn(await canvas.findByLabelText(label), value);
};
const click = async (canvas: Canvas, name: string | RegExp) => userEvent.click(await canvas.findByRole('button', { name }));

// Dữ liệu lượt đi (docs/flows/F12/steps.json) → `setup` của bước sau.
const MINH_SUA = { type: 'updateProfile', id: 'p-minh', patch: { name: 'Nguyễn Thị Minh Anh', handicap: 13.5, homeClub: 'Sân tập Hồ Tây', avatarUrl: SAMPLE_AVATARS[0] } } as const;
const CONG_KHAI = { type: 'setPrefs', userId: 'p-minh', patch: { publicClubs: true } } as const;
const YARD = { type: 'setPrefs', userId: 'p-minh', patch: { units: 'imperial' } } as const;
const CHAN_KHOA = { type: 'block', blockerId: 'p-minh', blockedId: 'p-khoa' } as const;
const BIO_TUAN = { type: 'updateProfile', id: 'c-tuan', patch: { bio: '12 năm dạy swing cơ bản, tempo và short game cho người mới.' } } as const;

// ── 01–03 · Hồ sơ → sửa tài khoản ─────────────────────────────
export const B01HoSo: Story = {
  name: '01 · Minh Anh chạm avatar trên header',
  render: () => <Profile />,
  ...appStory({ as: 'p-minh' }),
};

export const B02SuaTaiKhoan: Story = {
  name: '02 · Chọn ảnh → họ tên, handicap, CLB mới',
  render: () => <Account />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await click(canvas, 'Chọn ảnh');
    const [avatar] = await canvas.findAllByRole('img', { name: /^Ảnh đại diện/ }); // khung Avatar (ngoài) + ảnh bên trong
    await avatar?.querySelector('img')?.decode(); // ảnh mẫu tải từ mạng → chờ xong mới chụp
    await fill(canvas, { 'Họ tên': 'Nguyễn Thị Minh Anh', Handicap: '13,5', 'CLB / sân tập (tuỳ chọn)': 'Sân tập Hồ Tây' });
  },
};

export const TaiKhoanHlv: Story = {
  name: '02a · Tài khoản — HLV',
  render: () => <Account />,
  ...appStory({ as: 'c-tuan' }),
  // khung 390×844 cắt mất ô đơn giá (điền sẵn "450.000") → cuộn tới đó
  play: async ({ canvas }) => (await canvas.findByLabelText('Đơn giá (đ/giờ, tuỳ chọn)')).scrollIntoView({ block: 'center' }),
};

export const TaiKhoanLoi: Story = {
  name: '02b · Tài khoản — lỗi',
  render: () => <Account />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await fill(canvas, { 'Họ tên': '', 'Số điện thoại': '0983 210 456', Handicap: '60' }); // SĐT của p-lan
    await click(canvas, 'Lưu');
  },
};

export const TaiKhoanDaLuu: Story = {
  name: '02c · Tài khoản — đã lưu',
  render: () => <Account />,
  ...appStory({ as: 'p-minh', hold: ['toast'] }),
  play: async ({ canvas }) => {
    await fill(canvas, { Handicap: '13,5' });
    await click(canvas, 'Lưu');
    await canvas.findByText('Đã lưu hồ sơ'); // lưu giả lập 0,6 s (DELAYS.save) → chờ toast
  },
};

export const B03HoSoSauSua: Story = {
  name: '03 · Lưu → quay lại Hồ sơ',
  render: () => <Profile />,
  ...appStory({ as: 'p-minh', setup: [MINH_SUA] }),
};

// ── 04–07 · Cài đặt ───────────────────────────────────────────
export const B04CaiDat: Story = {
  name: '04 · Cài đặt',
  render: () => <Settings />,
  ...appStory({ as: 'p-minh' }),
};

export const MatKhau: Story = {
  name: '04a · Mật khẩu',
  render: () => <Password />,
  ...appStory({ as: 'p-minh' }),
};

export const Dev: Story = {
  name: '04b · Dev',
  render: () => <DevSettings />,
  ...appStory({ as: 'p-minh' }),
};

export const DevDatLai: Story = {
  name: '04c · Dev — đặt lại dữ liệu mẫu',
  render: () => <DevSettings />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await click(canvas, /Đặt lại dữ liệu mẫu/);
  },
};

export const B05QuyenRiengTu: Story = {
  name: '05 · Quyền riêng tư → bật Công khai bộ gậy',
  render: () => <Privacy />,
  ...appStory({ as: 'p-minh', setup: [CONG_KHAI] }),
};

export const QuyenRiengTuHlv: Story = {
  name: '05a · Quyền riêng tư — HLV',
  render: () => <Privacy />,
  ...appStory({ as: 'c-tuan' }),
};

export const B06CaiDatThongBao: Story = {
  name: '06 · Thông báo',
  render: () => <NotificationSettings />,
  ...appStory({ as: 'p-minh' }),
};

export const CaiDatThongBaoHlv: Story = {
  name: '06a · Cài đặt thông báo — HLV',
  render: () => <NotificationSettings />,
  ...appStory({
    as: 'c-tuan',
    setup: [{ type: 'setPrefs', userId: 'c-tuan', patch: { quietHours: true, notify: { ...DEFAULT_PREFS.notify, like: false, follow: false } } }],
  }),
};

export const B07DonVi: Story = {
  name: '07 · Đơn vị đo → Yard',
  render: () => <Units />,
  ...appStory({ as: 'p-minh', setup: [YARD] }),
};

export const DonViMet: Story = {
  name: '07a · Đơn vị đo — mét',
  render: () => <Units />,
  ...appStory({ as: 'p-minh' }),
};

// ── 08 · Tổng quan sau khi đổi ảnh + yard ─────────────────────
export const B08TongQuanYard: Story = {
  name: '08 · Quay về Tổng quan',
  render: () => <PlayerHome />,
  ...appStory({ as: 'p-minh', tabs: { role: 'player', active: 'home' }, setup: [MINH_SUA, YARD] }),
};

// ── 09–10 · Chặn ở Cộng đồng → Người đã chặn ─────────────────
export const B09NguoiDaChan: Story = {
  name: '09 · Chặn Lê Đăng Khoa → Quyền riêng tư',
  render: () => <Privacy />,
  ...appStory({ as: 'p-minh', setup: [CONG_KHAI, CHAN_KHOA] }),
};

export const B10BoChan: Story = {
  name: '10 · Bỏ chặn',
  render: () => <Privacy />,
  ...appStory({ as: 'p-minh', setup: [CONG_KHAI, CHAN_KHOA], hold: ['toast'] }),
  play: async ({ canvas }) => {
    await click(canvas, /^Bỏ chặn/);
  },
};

// ── 11–12 · HLV Tuấn sửa giới thiệu ──────────────────────────
export const B11BioHlvLoi: Story = {
  name: '11 · HLV Tuấn — giới thiệu quá ngắn → Lưu',
  render: () => <Account />,
  ...appStory({ as: 'c-tuan' }),
  play: async ({ canvas }) => {
    await fill(canvas, { 'Giới thiệu': 'Ngắn quá' });
    await click(canvas, 'Lưu');
  },
};

export const B12HoSoHlvMoi: Story = {
  name: '12 · Giới thiệu hợp lệ → Lưu → tab Hồ sơ',
  render: () => <CoachMe />,
  ...appStory({ as: 'c-tuan', tabs: { role: 'coach', active: 'me' }, setup: [BIO_TUAN] }),
};

export const HoSoHlv: Story = {
  name: '12a · Hồ sơ HLV — màn hồ sơ',
  render: () => <Profile />,
  ...appStory({ as: 'c-tuan' }),
};

// ── 13–14 · Xoá tài khoản ────────────────────────────────────
export const B13XoaTaiKhoan: Story = {
  name: '13 · Quyền riêng tư → Xoá tài khoản',
  render: () => <Privacy />,
  ...appStory({ as: 'p-minh', setup: [CONG_KHAI] }),
  play: async ({ canvas }) => {
    await click(canvas, /Xoá tài khoản/);
    await screen.findByText('Xoá tài khoản?'); // Dialog là Modal → ngoài canvas
  },
};

export const XoaTaiKhoanLanCuoi: Story = {
  name: '13a · Xoá tài khoản — xác nhận lần cuối',
  render: () => <Privacy />,
  ...appStory({ as: 'p-minh', setup: [CONG_KHAI] }),
  play: async ({ canvas }) => {
    await click(canvas, /Xoá tài khoản/);
    await userEvent.click(await screen.findByRole('button', { name: 'Tiếp tục' }));
  },
};

export const B14SauXoa: Story = {
  name: '14 · Xoá vĩnh viễn → màn chào',
  render: () => <Welcome />,
  ...appStory(),
};
