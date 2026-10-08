/**
 * F02 · HLV mới
 *
 * Các bước (mỗi bước = một story; ✓ = đã có):
 *  ✓ 01  · Màn chào                                  (auth)/welcome      chưa đăng nhập
 *  ✓ 02  · Đăng ký — chọn vai Huấn luyện viên        (auth)/register     chưa đăng nhập
 *  ✓ 03  · Đăng ký — thông tin HLV hợp lệ            (auth)/register     play: chọn vai → Tiếp → điền form
 *  ✓ 03a · Đăng ký — lỗi thông tin HLV               (auth)/register     play: thiếu học viện, số năm lẻ
 *  ✓ 04  · Xác minh OTP                              (auth)/verify-otp   params draft = hồ sơ HLV Bảo Long
 *  ✓ 05  · Onboarding — ảnh đại diện                 (auth)/onboarding   setup register (u-long)
 *  ✓ 05a · Onboarding — mời học viên đầu tiên        (auth)/onboarding   play: Tiếp × 2 (trang riêng của HLV)
 *  ✓ 06  · Học viên trống                            (coach)/roster      u-long, tab roster
 *  ✓ 06a · Học viên trống — mục Lời mời              (coach)/roster      play: chọn "Lời mời"
 *  ✓ 07  · Mời học viên — chưa có mã                 connect/invite      u-long
 *  ✓ 08  · Mời học viên — đã tạo mã                  connect/invite      u-long + mã BLG7KX (cố định)
 *  ✓ 08a · Học viên — lời mời đang chờ               (coach)/roster      u-long + mã BLG7KX, mục "Lời mời"
 *
 * Tài khoản: HLV MỚI tạo bằng action `register` (id cố định `u-long`, HLV Trịnh Bảo Long) — không dùng c-tuan / c-ha (đã có học viên).
 * Bước đơn vị đo của onboarding giống hệt người chơi → xem f01--onboarding-don-vi (không nhân bản).
 *
 * Chưa có (route không tồn tại — không dựng UI giả): không.
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fireEvent, userEvent } from 'storybook/test';
import type { Action } from '../../apps/golf/lib/reducer';
import type { Profile } from '../../apps/golf/lib/domain';
import { NOW } from '../../apps/golf/lib/mock';
import Welcome from '../../apps/golf/app/(auth)/welcome';
import Register from '../../apps/golf/app/(auth)/register';
import VerifyOtp from '../../apps/golf/app/(auth)/verify-otp';
import Onboarding from '../../apps/golf/app/(auth)/onboarding';
import CoachRoster from '../../apps/golf/app/(coach)/roster';
import CreateInvite from '../../apps/golf/app/connect/invite';
import { appStory } from '../lib/appStory';

const meta = { title: 'Luồng/F02 · HLV mới', id: 'f02' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = Parameters<NonNullable<Story['play']>>[0]['canvas'];

// HLV mới: đúng dạng `Registration` mà màn đăng ký đẩy sang OTP (SĐT đã bỏ khoảng trắng).
const draft = { role: 'coach', name: 'HLV Trịnh Bảo Long', email: 'baolong.coach@email.com', phone: '0966456789', academy: 'Học viện Golf Sông Bé', yearsExperience: 6 } as const;
const LONG: Profile = { ...draft, id: 'u-long', createdAt: NOW };
const registered: Action[] = [{ type: 'register', profile: LONG }];
// Mã cố định (newInvite sinh ngẫu nhiên → ảnh không ổn định), cùng bảng chữ của newInvite (không O, I, 0, 1); hạn 7 ngày từ NOW.
const withInvite: Action[] = [...registered, { type: 'createInvite', invite: { code: 'BLG7KX', coachId: 'u-long', createdAt: NOW, expiresAt: '2026-10-14T08:00:00Z' } }];

// userEvent.type chỉ đổi DOM, state React của TextInput (react-native-web) không nhận → đặt giá trị bằng sự kiện `input` (xem issues/A.md).
const fill = async (canvas: Canvas, values: Record<string, string>) => {
  for (const [label, value] of Object.entries(values)) await fireEvent.input(await canvas.findByLabelText(label), { target: { value } });
};
const toInfoStep = async (canvas: Canvas) => {
  await userEvent.click(await canvas.findByRole('radio', { name: 'Huấn luyện viên' }));
  await userEvent.click(await canvas.findByRole('button', { name: /Tiếp/ }));
};

export const ManChao: Story = {
  name: '01 · Màn chào',
  render: () => <Welcome />,
  ...appStory(),
};

export const DangKyChonVai: Story = {
  name: '02 · Đăng ký — chọn vai Huấn luyện viên',
  render: () => <Register />,
  ...appStory(),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('radio', { name: 'Huấn luyện viên' }));
  },
};

export const DangKyThongTin: Story = {
  name: '03 · Đăng ký — thông tin HLV hợp lệ',
  render: () => <Register />,
  ...appStory(),
  play: async ({ canvas }) => {
    await toInfoStep(canvas);
    await fill(canvas, {
      'Họ tên': draft.name,
      Email: draft.email,
      'Số điện thoại': draft.phone,
      'Mật khẩu': 'coach2026',
      'Học viện / CLB': draft.academy,
      'Số năm kinh nghiệm': '6',
    });
  },
};

export const DangKyLoi: Story = {
  name: '03a · Đăng ký — lỗi thông tin HLV',
  render: () => <Register />,
  ...appStory(),
  play: async ({ canvas }) => {
    await toInfoStep(canvas);
    await fill(canvas, { 'Họ tên': draft.name, Email: 'baolong.coach@', 'Số điện thoại': '096645678', 'Mật khẩu': 'coach2026', 'Số năm kinh nghiệm': '6,5' });
    await userEvent.click(await canvas.findByRole('button', { name: /Tiếp/ }));
  },
};

export const XacMinhOtp: Story = {
  name: '04 · Xác minh OTP',
  render: () => <VerifyOtp />,
  ...appStory({ params: { draft: JSON.stringify(draft) } }),
};

export const OnboardingAnh: Story = {
  name: '05 · Onboarding — ảnh đại diện',
  render: () => <Onboarding />,
  ...appStory({ setup: registered }),
};

export const OnboardingMoiHocVien: Story = {
  name: '05a · Onboarding — mời học viên đầu tiên',
  render: () => <Onboarding />,
  ...appStory({ setup: registered }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Tiếp' }));
    await userEvent.click(await canvas.findByRole('button', { name: 'Tiếp' }));
  },
};

export const HocVienTrong: Story = {
  name: '06 · Học viên trống',
  render: () => <CoachRoster />,
  ...appStory({ setup: registered, tabs: { role: 'coach', active: 'roster' } }),
};

export const HocVienTrongLoiMoi: Story = {
  name: '06a · Học viên trống — mục Lời mời',
  render: () => <CoachRoster />,
  ...appStory({ setup: registered, tabs: { role: 'coach', active: 'roster' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('tab', { name: /Lời mời/ }));
  },
};

export const MoiChuaCoMa: Story = {
  name: '07 · Mời học viên — chưa có mã',
  render: () => <CreateInvite />,
  ...appStory({ setup: registered }),
};

export const MoiDaTaoMa: Story = {
  name: '08 · Mời học viên — đã tạo mã',
  render: () => <CreateInvite />,
  ...appStory({ setup: withInvite, params: { code: 'BLG7KX' } }),
};

export const HocVienLoiMoiDangCho: Story = {
  name: '08a · Học viên — lời mời đang chờ',
  render: () => <CoachRoster />,
  ...appStory({ setup: withInvite, tabs: { role: 'coach', active: 'roster' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('tab', { name: /Lời mời/ }));
  },
};
