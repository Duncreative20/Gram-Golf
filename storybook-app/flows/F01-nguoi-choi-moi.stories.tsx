/**
 * F01 · Người chơi mới
 *
 * Các bước (mỗi bước = một story; ✓ = đã có):
 *  ✓ 01  · Màn chào                                   (auth)/welcome      chưa đăng nhập
 *  ✓ 02  · Đăng ký — chọn vai Người chơi              (auth)/register     chưa đăng nhập
 *  ✓ 03  · Đăng ký — thông tin hợp lệ                 (auth)/register     play: chọn vai → Tiếp → điền form
 *  ✓ 03a · Đăng ký — lỗi bỏ trống                     (auth)/register     play: Tiếp với form trống
 *  ✓ 03b · Đăng ký — email / SĐT đã có tài khoản      (auth)/register     play: email + SĐT của p-minh
 *  ✓ 04  · Xác minh OTP                               (auth)/verify-otp   params draft = hồ sơ Gia Bảo
 *  ✓ 04a · Xác minh OTP — sai mã                      (auth)/verify-otp   play: gõ 111111
 *  ✓ 04b · Xác minh OTP — thiếu thông tin đăng ký     (auth)/verify-otp   không có draft
 *  ✓ 05  · Onboarding — ảnh đại diện                  (auth)/onboarding   setup register (u-bao)
 *  ✓ 05a · Onboarding — đơn vị đo                     (auth)/onboarding   play: Tiếp
 *  ✓ 05b · Onboarding — mã mời từ HLV                 (auth)/onboarding   play: Tiếp × 2
 *  ✓ 06  · Tổng quan trống                            (player)/home       u-bao, tab home
 *  ✓ 07  · Chọn nguồn số liệu                         metrics/add         u-bao
 *  ✓ 08  · Nhập tay — chưa có gậy                     metrics/manual      u-bao (0 gậy)
 *  ✓ 08a · Nhập tay — lỗi                             metrics/manual      play: Lưu với form trống
 *  ✓ 08b · Nhập tay — hợp lệ, đã lưu                  metrics/manual      u-bao + Driver; play: chọn gậy, điền 6 chỉ số, Lưu
 *  ✓ 09  · Tổng quan có dữ liệu                       (player)/home       u-bao + Driver + phiên đầu tiên, tab home
 *
 * Tài khoản: người chơi MỚI tạo bằng action `register` (id cố định `u-bao`, Hoàng Gia Bảo) — không dùng hồ sơ mẫu có sẵn dữ liệu.
 * Người chơi mới chưa có gậy mà phiên swing bắt buộc chọn gậy → 08b / 09 thêm sẵn một Driver (`upsertClub`); bước thêm gậy thuộc F06.
 *
 * Chưa có (route không tồn tại — không dựng UI giả): không.
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fireEvent, screen, userEvent } from 'storybook/test';
import type { Action } from '../../apps/golf/lib/reducer';
import type { Club, Profile } from '../../apps/golf/lib/domain';
import { NOW } from '../../apps/golf/lib/mock';
import Welcome from '../../apps/golf/app/(auth)/welcome';
import Register from '../../apps/golf/app/(auth)/register';
import VerifyOtp from '../../apps/golf/app/(auth)/verify-otp';
import Onboarding from '../../apps/golf/app/(auth)/onboarding';
import PlayerHome from '../../apps/golf/app/(player)/home';
import MetricsAdd from '../../apps/golf/app/metrics/add';
import MetricsManual from '../../apps/golf/app/metrics/manual';
import { appStory } from '../lib/appStory';

const meta = { title: 'Luồng/F01 · Người chơi mới', id: 'f01' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

// Người chơi mới: đúng dạng `Registration` mà màn đăng ký đẩy sang OTP (SĐT đã bỏ khoảng trắng).
const draft = { role: 'player', name: 'Hoàng Gia Bảo', email: 'giabao@email.com', phone: '0977123456', handicap: 24 } as const;
const BAO: Profile = { ...draft, id: 'u-bao', createdAt: NOW };
const DRIVER: Club = { id: 'cl-bao-driver', playerId: 'u-bao', type: 'Driver', brand: 'Ping', model: 'G430 Max', shaftBrand: 'Alta CB Black', shaftFlex: 'Regular', loftDeg: 10.5, lieDeg: 58 };
const registered: Action[] = [{ type: 'register', profile: BAO }];
const withDriver: Action[] = [...registered, { type: 'upsertClub', club: DRIVER }];

type Canvas = Parameters<NonNullable<Story['play']>>[0]['canvas'];
// userEvent.type chỉ đổi DOM, state React của TextInput (react-native-web) không nhận → đặt giá trị bằng sự kiện `input` (xem issues/A.md).
const typeIn = async (el: HTMLElement, value: string) => void (await fireEvent.input(el, { target: { value } }));
const fill = async (canvas: Canvas, values: Record<string, string>) => {
  for (const [label, v] of Object.entries(values)) await typeIn(await canvas.findByLabelText(label), v);
};

export const ManChao: Story = {
  name: '01 · Màn chào',
  render: () => <Welcome />,
  ...appStory(),
};

export const DangKyChonVai: Story = {
  name: '02 · Đăng ký — chọn vai Người chơi',
  render: () => <Register />,
  ...appStory(),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('radio', { name: 'Người chơi' }));
  },
};

export const DangKyThongTin: Story = {
  name: '03 · Đăng ký — thông tin hợp lệ',
  render: () => <Register />,
  ...appStory(),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('radio', { name: 'Người chơi' }));
    await userEvent.click(await canvas.findByRole('button', { name: /Tiếp/ }));
    await fill(canvas, { 'Họ tên': draft.name, Email: draft.email, 'Số điện thoại': draft.phone, 'Mật khẩu': 'golf2026', Handicap: '24' });
  },
};

export const DangKyLoiBoTrong: Story = {
  name: '03a · Đăng ký — lỗi bỏ trống',
  render: () => <Register />,
  ...appStory(),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('radio', { name: 'Người chơi' }));
    await userEvent.click(await canvas.findByRole('button', { name: /Tiếp/ }));
    await userEvent.click(await canvas.findByRole('button', { name: /Tiếp/ }));
  },
};

export const DangKyTrungTaiKhoan: Story = {
  name: '03b · Đăng ký — email / SĐT đã có tài khoản',
  render: () => <Register />,
  ...appStory(),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('radio', { name: 'Người chơi' }));
    await userEvent.click(await canvas.findByRole('button', { name: /Tiếp/ }));
    // email (khác hoa thường) + SĐT của p-minh trong seed; mật khẩu thiếu chữ số
    await fill(canvas, { 'Họ tên': 'Nguyễn Minh Anh', Email: 'MinhAnh@gramgolf.vn', 'Số điện thoại': '0912345678', 'Mật khẩu': 'matkhaugolf', Handicap: '60' });
    await userEvent.click(await canvas.findByRole('button', { name: /Tiếp/ }));
  },
};

export const XacMinhOtp: Story = {
  name: '04 · Xác minh OTP',
  render: () => <VerifyOtp />,
  ...appStory({ params: { draft: JSON.stringify(draft) } }),
};

export const XacMinhOtpSai: Story = {
  name: '04a · Xác minh OTP — sai mã',
  render: () => <VerifyOtp />,
  ...appStory({ params: { draft: JSON.stringify(draft) } }),
  play: async ({ canvas }) => {
    await typeIn(await canvas.findByLabelText('OTP'), '111111');
  },
};

export const XacMinhOtpThieuThongTin: Story = {
  name: '04b · Xác minh OTP — thiếu thông tin đăng ký',
  render: () => <VerifyOtp />,
  ...appStory(),
};

export const OnboardingAnh: Story = {
  name: '05 · Onboarding — ảnh đại diện',
  render: () => <Onboarding />,
  ...appStory({ setup: registered }),
};

export const OnboardingDonVi: Story = {
  name: '05a · Onboarding — đơn vị đo',
  render: () => <Onboarding />,
  ...appStory({ setup: registered }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Tiếp' }));
  },
};

export const OnboardingMaMoi: Story = {
  name: '05b · Onboarding — mã mời từ HLV',
  render: () => <Onboarding />,
  ...appStory({ setup: registered }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Tiếp' }));
    await userEvent.click(await canvas.findByRole('button', { name: 'Tiếp' }));
  },
};

export const TongQuanTrong: Story = {
  name: '06 · Tổng quan trống',
  render: () => <PlayerHome />,
  ...appStory({ setup: registered, tabs: { role: 'player', active: 'home' } }),
};

export const ChonNguonSoLieu: Story = {
  name: '07 · Chọn nguồn số liệu',
  render: () => <MetricsAdd />,
  ...appStory({ setup: registered }),
};

export const NhapTayChuaCoGay: Story = {
  name: '08 · Nhập tay — chưa có gậy',
  render: () => <MetricsManual />,
  ...appStory({ setup: registered }),
};

export const NhapTayLoi: Story = {
  name: '08a · Nhập tay — lỗi',
  render: () => <MetricsManual />,
  ...appStory({ setup: registered }),
  play: async ({ canvas }) => {
    await typeIn(await canvas.findByLabelText('Smash factor'), '1,8');
    await userEvent.click(await canvas.findByRole('button', { name: 'Lưu' }));
  },
};

export const NhapTayDaLuu: Story = {
  name: '08b · Nhập tay — hợp lệ, đã lưu',
  render: () => <MetricsManual />,
  ...appStory({ setup: withDriver }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('combobox', { name: /^Gậy/ }));
    // BottomSheet vẽ trong portal (ngoài canvas) → tìm bằng screen
    await userEvent.click(await screen.findByRole('radio', { name: /Driver/ }));
    await fill(canvas, {
      'Tốc độ đầu gậy (mph)': '92',
      'Tốc độ bóng (mph)': '131',
      'Smash factor': '1,42',
      'Spin (rpm)': '3100',
      'Góc bắn (°)': '13,5',
      'Carry (m)': '188',
    });
    await userEvent.click(await canvas.findByRole('button', { name: 'Lưu' }));
  },
};

export const TongQuanCoDuLieu: Story = {
  name: '09 · Tổng quan có dữ liệu',
  render: () => <PlayerHome />,
  ...appStory({
    setup: [
      ...withDriver,
      {
        type: 'addSession',
        session: { id: 'ss-bao-1', playerId: 'u-bao', capturedAt: NOW, source: 'manual', kind: 'swing', clubId: DRIVER.id, swing: { clubSpeedMph: 92, ballSpeedMph: 131, smash: 1.42, spinRpm: 3100, launchDeg: 13.5, carryM: 188 } },
      },
    ],
    tabs: { role: 'player', active: 'home' },
  }),
};
