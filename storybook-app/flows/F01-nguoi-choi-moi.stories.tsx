/**
 * F01 · Người chơi mới — kịch bản: docs/flows/F01/steps.json, storyboard: docs/flows/F01.md
 *
 * Các bước (mỗi bước shot = một story `f01--b-<nn>-<slug>`; ✓ = đã có):
 *  ✓ 01  · Mở app lần đầu                             (auth)/welcome      chưa đăng nhập
 *  ✓ 02  · Tạo tài khoản → chọn Người chơi            (auth)/register     play: Người chơi
 *  ✓ 03  · Tiếp → Tiếp khi để trống                   (auth)/register     play: Người chơi → Tiếp → Tiếp
 *  ✓ 04  · Điền thông tin, handicap 24,5 → Tiếp       (auth)/verify-otp   params draft = hồ sơ Lê Văn Hải
 *  ✓ 05  · Nhập 123456 → Chọn ảnh                     (auth)/onboarding   setup register (u-hai); play: Chọn ảnh
 *  ✓ 06  · Tiếp → Mét → Tiếp                          (auth)/onboarding   + ảnh mẫu; play: Tiếp × 2
 *  ✓ 07  · Để sau → Tổng quan trống                   (player)/home       + ảnh mẫu, tab home
 *  ✓ 08  · Nhập số liệu đầu tiên → Nhập tay → Gậy     metrics/manual      + ảnh mẫu (0 gậy); play: Gậy
 *  ✓ 09  · Thêm gậy mới Driver → Lưu — chọn sẵn       metrics/manual      + Driver; play: Gậy → Driver (chọn sẵn sau khi thêm: lượt CDP)
 *  ✓ 10  · Điền 6 chỉ số → Lưu                        (player)/home       + Driver + phiên đầu tiên, tab home; play: cuộn tới Carry
 * Biến thể:
 *  ✓ 03a · Đăng ký — thông tin hợp lệ                 (auth)/register     play: chọn vai → Tiếp → điền form
 *  ✓ 03b · Đăng ký — email / SĐT đã có                (auth)/register     play: email + SĐT của p-minh
 *  ✓ 04a · OTP — sai mã                               (auth)/verify-otp   play: gõ 111111
 *  ✓ 04b · OTP — thiếu thông tin đăng ký              (auth)/verify-otp   không có draft
 *  ✓ 05a · Onboarding — đơn vị đo                     (auth)/onboarding   play: Tiếp
 *  ✓ 07a · Chọn nguồn số liệu                         metrics/add
 *  ✓ 09a · Nhập tay — lỗi                             metrics/manual      play: Smash 1,8 → Lưu
 *  ✓ 09b · Nhập tay — đã lưu                          metrics/manual      + Driver; play: chọn gậy, điền 6 chỉ số, Lưu; hold toast
 *
 * Tài khoản: người chơi MỚI tạo bằng action `register` (id cố định `u-hai`, Lê Văn Hải — người của steps.json), không dùng hồ sơ mẫu có
 * sẵn dữ liệu. Ghi dữ liệu ở các bước trước → `setup`: ảnh mẫu đầu tiên (bước 05 "Chọn ảnh"), Driver (bước 09), phiên đầu tiên (bước 10).
 * "Mét" ở bước 06 là mặc định — không cần action.
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { expect, screen, userEvent, waitFor } from 'storybook/test';
import type { Action } from '../../apps/golf/lib/reducer';
import type { Club, Profile } from '../../apps/golf/lib/domain';
import { NOW } from '../../apps/golf/lib/mock';
import { nextSampleAvatar } from '../../apps/golf/lib/simulate';
import Welcome from '../../apps/golf/app/(auth)/welcome';
import Register from '../../apps/golf/app/(auth)/register';
import VerifyOtp from '../../apps/golf/app/(auth)/verify-otp';
import Onboarding from '../../apps/golf/app/(auth)/onboarding';
import PlayerHome from '../../apps/golf/app/(player)/home';
import MetricsAdd from '../../apps/golf/app/metrics/add';
import MetricsManual from '../../apps/golf/app/metrics/manual';
import { appStory, typeIn } from '../lib/appStory';

const meta = { title: 'Luồng/F01 · Người chơi mới', id: 'f01' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
type Play = NonNullable<Story['play']>;

// Người chơi mới: đúng dạng `Registration` mà màn đăng ký đẩy sang OTP (SĐT đã bỏ khoảng trắng, handicap "24,5" → 24.5).
const draft = { role: 'player', name: 'Lê Văn Hải', email: 'hai.le@vidu.vn', phone: '0911222333', handicap: 24.5 } as const;
const HAI: Profile = { ...draft, id: 'u-hai', createdAt: NOW };
// Gậy của bước 09: loft 10,5 = gợi ý của Driver, flex = mặc định của form.
const DRIVER: Club = { id: 'cl-hai-driver', playerId: 'u-hai', type: 'Driver', brand: 'Callaway', model: 'Paradym', shaftBrand: 'Project X', shaftFlex: 'Regular', loftDeg: 10.5, lieDeg: 58 };
const registered: Action[] = [{ type: 'register', profile: HAI }];
const onboarded: Action[] = [...registered, { type: 'updateProfile', id: HAI.id, patch: { avatarUrl: nextSampleAvatar() } }];
const withDriver: Action[] = [...onboarded, { type: 'upsertClub', club: DRIVER }];

type Canvas = Parameters<Play>[0]['canvas'];
const fill = async (canvas: Canvas, values: Record<string, string>) => {
  for (const [label, v] of Object.entries(values)) await typeIn(await canvas.findByLabelText(label), v);
};
const click = (el: Promise<HTMLElement>) => el.then((e) => userEvent.click(e));
// BottomSheet chọn gậy là Modal → vẽ ngoài canvas: tìm trong `screen`.
const openClubs: Play = ({ canvas }) => click(canvas.findByRole('combobox', { name: 'Gậy, chưa chọn' }));
const pickDriver: Play = async (ctx) => {
  await openClubs(ctx);
  await click(screen.findByRole('radio', { name: /^Driver/ }));
  await waitFor(() => expect(document.querySelector('[aria-modal="true"]')).toBeNull()); // sheet đóng hẳn trước khi chụp
};

// ── Đăng ký ──────────────────────────────────────────────────────────────────
export const B01Chao: Story = {
  name: '01 · Mở app lần đầu',
  render: () => <Welcome />,
  ...appStory(),
};

export const B02ChonVaiTro: Story = {
  name: '02 · Tạo tài khoản → chọn Người chơi',
  render: () => <Register />,
  ...appStory(),
  play: async ({ canvas }) => {
    await click(canvas.findByRole('radio', { name: 'Người chơi' }));
  },
};

export const B03LoiForm: Story = {
  name: '03 · Tiếp → Tiếp khi để trống',
  render: () => <Register />,
  ...appStory(),
  play: async ({ canvas }) => {
    await click(canvas.findByRole('radio', { name: 'Người chơi' }));
    await click(canvas.findByRole('button', { name: /Tiếp/ }));
    await click(canvas.findByRole('button', { name: /Tiếp/ }));
  },
};

export const DangKyThongTin: Story = {
  name: '03a · Đăng ký — thông tin hợp lệ',
  render: () => <Register />,
  ...appStory(),
  play: async ({ canvas }) => {
    await click(canvas.findByRole('radio', { name: 'Người chơi' }));
    await click(canvas.findByRole('button', { name: /Tiếp/ }));
    await fill(canvas, { 'Họ tên': draft.name, Email: draft.email, 'Số điện thoại': draft.phone, 'Mật khẩu': 'golf2026', Handicap: '24,5' });
  },
};

export const DangKyTrungTaiKhoan: Story = {
  name: '03b · Đăng ký — email / SĐT đã có',
  render: () => <Register />,
  ...appStory(),
  play: async ({ canvas }) => {
    await click(canvas.findByRole('radio', { name: 'Người chơi' }));
    await click(canvas.findByRole('button', { name: /Tiếp/ }));
    // email (khác hoa thường) + SĐT của p-minh trong seed; mật khẩu thiếu chữ số
    await fill(canvas, { 'Họ tên': 'Nguyễn Minh Anh', Email: 'MinhAnh@gramgolf.vn', 'Số điện thoại': '0912345678', 'Mật khẩu': 'matkhaugolf', Handicap: '60' });
    await click(canvas.findByRole('button', { name: /Tiếp/ }));
  },
};

export const B04Otp: Story = {
  name: '04 · Điền thông tin, handicap 24,5 → Tiếp',
  render: () => <VerifyOtp />,
  ...appStory({ params: { draft: JSON.stringify(draft) } }),
};

export const XacMinhOtpSai: Story = {
  name: '04a · OTP — sai mã',
  render: () => <VerifyOtp />,
  ...appStory({ params: { draft: JSON.stringify(draft) } }),
  play: async ({ canvas }) => {
    await typeIn(await canvas.findByLabelText('OTP'), '111111');
  },
};

export const XacMinhOtpThieuThongTin: Story = {
  name: '04b · OTP — thiếu thông tin đăng ký',
  render: () => <VerifyOtp />,
  ...appStory(),
};

// ── Onboarding ───────────────────────────────────────────────────────────────
export const B05AnhDaiDien: Story = {
  name: '05 · Nhập 123456 → Chọn ảnh',
  render: () => <Onboarding />,
  ...appStory({ setup: registered }),
  play: async ({ canvas }) => {
    await click(canvas.findByRole('button', { name: /Chọn ảnh/ }));
    await canvas.findByRole('button', { name: /Dùng chữ tắt/ });
  },
};

export const OnboardingDonVi: Story = {
  name: '05a · Onboarding — đơn vị đo',
  render: () => <Onboarding />,
  ...appStory({ setup: registered }),
  play: async ({ canvas }) => {
    await click(canvas.findByRole('button', { name: 'Tiếp' }));
  },
};

export const B06MaMoi: Story = {
  name: '06 · Tiếp → Mét → Tiếp',
  render: () => <Onboarding />,
  ...appStory({ setup: onboarded }),
  play: async ({ canvas }) => {
    await click(canvas.findByRole('button', { name: 'Tiếp' }));
    await click(canvas.findByRole('button', { name: 'Tiếp' }));
  },
};

// ── Số liệu đầu tiên ─────────────────────────────────────────────────────────
export const B07TongQuanTrong: Story = {
  name: '07 · Để sau → Tổng quan trống',
  render: () => <PlayerHome />,
  ...appStory({ setup: onboarded, tabs: { role: 'player', active: 'home' } }),
};

export const ChonNguonSoLieu: Story = {
  name: '07a · Chọn nguồn số liệu',
  render: () => <MetricsAdd />,
  ...appStory({ setup: onboarded }),
};

export const B08ChuaCoGay: Story = {
  name: '08 · Nhập số liệu đầu tiên → Nhập tay → Gậy',
  render: () => <MetricsManual />,
  ...appStory({ setup: onboarded }),
  play: async (ctx) => {
    await openClubs(ctx);
    await screen.findByText('Thêm gậy mới');
  },
};

export const B09GayChonSan: Story = {
  name: '09 · Thêm gậy mới Driver → Lưu — chọn sẵn',
  render: () => <MetricsManual />,
  ...appStory({ setup: withDriver }),
  play: pickDriver,
};

export const NhapTayLoi: Story = {
  name: '09a · Nhập tay — lỗi',
  render: () => <MetricsManual />,
  ...appStory({ setup: onboarded }),
  play: async ({ canvas }) => {
    await typeIn(await canvas.findByLabelText('Smash factor'), '1,8');
    await click(canvas.findByRole('button', { name: 'Lưu' }));
  },
};

export const NhapTayDaLuu: Story = {
  name: '09b · Nhập tay — đã lưu',
  render: () => <MetricsManual />,
  ...appStory({ setup: withDriver, hold: ['toast'] }),
  play: async (ctx) => {
    await pickDriver(ctx);
    await fill(ctx.canvas, {
      'Tốc độ đầu gậy (mph)': '95',
      'Tốc độ bóng (mph)': '135',
      'Smash factor': '1,42',
      'Spin (rpm)': '3100',
      'Góc bắn (°)': '13',
      'Carry (m)': '195',
    });
    await click(ctx.canvas.findByRole('button', { name: 'Lưu' }));
  },
};

export const B10TongQuanCoDuLieu: Story = {
  name: '10 · Điền 6 chỉ số → Lưu',
  render: () => <PlayerHome />,
  ...appStory({
    setup: [
      ...withDriver,
      {
        type: 'addSession',
        session: { id: 'ss-hai-1', playerId: 'u-hai', capturedAt: NOW, source: 'manual', kind: 'swing', clubId: DRIVER.id, swing: { clubSpeedMph: 95, ballSpeedMph: 135, smash: 1.42, spinRpm: 3100, launchDeg: 13, carryM: 195 } },
      },
    ],
    tabs: { role: 'player', active: 'home' },
  }),
  // Khung 390×844 cắt mất "Carry theo gậy" (bước kiểm: 1 gậy → chỉ chú giải, không vẽ vòng) → cuộn tới đó; chờ font trước khi cuộn.
  play: async ({ canvas }) => {
    const rings = await canvas.findByRole('img', { name: /^Carry trung bình theo gậy/ });
    await document.fonts.ready;
    rings.scrollIntoView({ block: 'center' });
  },
};
