/**
 * F02 · HLV mới — kịch bản: docs/flows/F02/steps.json, storyboard: docs/flows/F02.md
 *
 * Các bước (mỗi bước shot = một story `f02--b-<nn>-<slug>`; ✓ = đã có):
 *  ✓ 01  · Huấn luyện viên → Tiếp → điền form       (auth)/register     play: chọn vai → Tiếp → điền form
 *  ✓ 02  · OTP → Tiếp × 2 → Tiếp khi để trống       (auth)/onboarding   setup register (u-chau); play: Tiếp × 3
 *  ✓ 03  · Gõ “Dạy swing” → Tiếp                     (auth)/onboarding   play: Tiếp × 2 → “Dạy swing” → Tiếp
 *  ✓ 04  · Gõ giới thiệu đầy đủ                      (auth)/onboarding   play: Tiếp × 2 → BIO
 *  ✓ 05  · Tiếp → Để sau                             (coach)/roster      + BIO, tab roster
 *  ✓ 06  · Mời học viên → Tạo mã mời                 connect/invite      + BIO + mã NBC7KX (cố định)
 *  ✓ 07  · Quay lại → tab Hồ sơ                      (coach)/me          + BIO, tab me
 * Biến thể:
 *  ✓ 01a · Màn chào                                  (auth)/welcome      chưa đăng nhập
 *  ✓ 01b · Đăng ký — chọn vai Huấn luyện viên        (auth)/register     play: Huấn luyện viên
 *  ✓ 01c · Đăng ký — lỗi thông tin HLV               (auth)/register     play: thiếu học viện, số năm lẻ
 *  ✓ 01d · Xác minh OTP                              (auth)/verify-otp   params draft = hồ sơ Ngô Bảo Châu
 *  ✓ 02a · Onboarding — ảnh đại diện                 (auth)/onboarding   setup register
 *  ✓ 04a · Onboarding — mời học viên đầu tiên (4/4)  (auth)/onboarding   play: Tiếp × 2 → BIO → Tiếp
 *  ✓ 05a · Học viên trống — mục Lời mời              (coach)/roster      play: chọn "Lời mời"
 *  ✓ 06a · Mời học viên — chưa có mã                 connect/invite
 *  ✓ 06b · Học viên — lời mời đang chờ               (coach)/roster      + mã NBC7KX, mục "Lời mời"
 *  ✓ 07a · Tài khoản HLV — giới thiệu quá ngắn       settings/account    c-tuan; play: “Ngắn quá” → Lưu
 *
 * Tài khoản: HLV MỚI tạo bằng action `register` (id cố định `u-chau`, Ngô Bảo Châu — người của steps.json) — không dùng c-tuan / c-ha
 * (đã có học viên). Ghi dữ liệu ở các bước trước → `setup`: giới thiệu nghề nghiệp (bước 04 → Tiếp), mã mời (bước 06).
 * Bước đơn vị đo của onboarding giống hệt người chơi → xem f01--onboarding-don-vi (không nhân bản).
 *
 * Chưa có (route không tồn tại — không dựng UI giả): không.
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { userEvent } from 'storybook/test';
import type { Action } from '../../apps/golf/lib/reducer';
import type { Profile } from '../../apps/golf/lib/domain';
import { NOW } from '../../apps/golf/lib/mock';
import Welcome from '../../apps/golf/app/(auth)/welcome';
import Register from '../../apps/golf/app/(auth)/register';
import VerifyOtp from '../../apps/golf/app/(auth)/verify-otp';
import Onboarding from '../../apps/golf/app/(auth)/onboarding';
import CoachRoster from '../../apps/golf/app/(coach)/roster';
import CoachMe from '../../apps/golf/app/(coach)/me';
import CreateInvite from '../../apps/golf/app/connect/invite';
import AccountSettings from '../../apps/golf/app/settings/account';
import { appStory, typeIn } from '../lib/appStory';

const meta = { title: 'Luồng/F02 · HLV mới', id: 'f02' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = Parameters<NonNullable<Story['play']>>[0]['canvas'];

// HLV mới: đúng dạng `Registration` mà màn đăng ký đẩy sang OTP (SĐT đã bỏ khoảng trắng).
const draft = { role: 'coach', name: 'Ngô Bảo Châu', email: 'chau.coach@vidu.vn', phone: '0977111222', academy: 'Học viện Golf Sông Hồng', yearsExperience: 6 } as const;
const CHAU: Profile = { ...draft, id: 'u-chau', createdAt: NOW };
const BIO = '6 năm dạy swing cơ bản và tempo cho người mới, mỗi tuần 2 buổi ở sân Sông Hồng.';
const registered: Action[] = [{ type: 'register', profile: CHAU }];
const onboarded: Action[] = [...registered, { type: 'updateProfile', id: CHAU.id, patch: { bio: BIO } }];
// Mã cố định (newInvite sinh ngẫu nhiên → ảnh không ổn định), cùng bảng chữ của newInvite (không O, I, 0, 1); hạn 7 ngày từ NOW.
const withInvite: Action[] = [...onboarded, { type: 'createInvite', invite: { code: 'NBC7KX', coachId: CHAU.id, createdAt: NOW, expiresAt: '2026-10-14T08:00:00Z' } }];

const fill = async (canvas: Canvas, values: Record<string, string>) => {
  for (const [label, value] of Object.entries(values)) await typeIn(await canvas.findByLabelText(label), value);
};
const toInfoStep = async (canvas: Canvas) => {
  await userEvent.click(await canvas.findByRole('radio', { name: 'Huấn luyện viên' }));
  await userEvent.click(await canvas.findByRole('button', { name: /Tiếp/ }));
};
const next = async (canvas: Canvas, times: number) => {
  for (let i = 0; i < times; i++) await userEvent.click(await canvas.findByRole('button', { name: 'Tiếp' }));
};

// ── Bước của luồng ───────────────────────────────────────────────────────────
export const B01DangKyHlv: Story = {
  name: '01 · Huấn luyện viên → Tiếp → điền form',
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

export const B02BioBatBuoc: Story = {
  name: '02 · OTP → Tiếp × 2 → Tiếp khi để trống',
  render: () => <Onboarding />,
  ...appStory({ setup: registered }),
  play: ({ canvas }) => next(canvas, 3),
};

export const B03BioNgan: Story = {
  name: '03 · Gõ “Dạy swing” → Tiếp',
  render: () => <Onboarding />,
  ...appStory({ setup: registered }),
  play: async ({ canvas }) => {
    await next(canvas, 2);
    await typeIn(await canvas.findByLabelText('Giới thiệu'), 'Dạy swing');
    await next(canvas, 1);
  },
};

export const B04BioHopLe: Story = {
  name: '04 · Gõ giới thiệu đầy đủ',
  render: () => <Onboarding />,
  ...appStory({ setup: registered }),
  play: async ({ canvas }) => {
    await next(canvas, 2);
    await typeIn(await canvas.findByLabelText('Giới thiệu'), BIO);
  },
};

export const B05HocVienTrong: Story = {
  name: '05 · Tiếp → Để sau',
  render: () => <CoachRoster />,
  ...appStory({ setup: onboarded, tabs: { role: 'coach', active: 'roster' } }),
};

export const B06MaMoiDauTien: Story = {
  name: '06 · Mời học viên → Tạo mã mời',
  render: () => <CreateInvite />,
  ...appStory({ setup: withInvite, params: { code: 'NBC7KX' } }),
};

export const B07HoSoHlv: Story = {
  name: '07 · Quay lại → tab Hồ sơ',
  render: () => <CoachMe />,
  ...appStory({ setup: onboarded, tabs: { role: 'coach', active: 'me' } }),
};

// ── Biến thể ─────────────────────────────────────────────────────────────────
export const ManChao: Story = {
  name: '01a · Màn chào',
  render: () => <Welcome />,
  ...appStory(),
};

export const DangKyChonVai: Story = {
  name: '01b · Đăng ký — chọn vai Huấn luyện viên',
  render: () => <Register />,
  ...appStory(),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('radio', { name: 'Huấn luyện viên' }));
  },
};

export const DangKyLoi: Story = {
  name: '01c · Đăng ký — lỗi thông tin HLV',
  render: () => <Register />,
  ...appStory(),
  play: async ({ canvas }) => {
    await toInfoStep(canvas);
    await fill(canvas, { 'Họ tên': draft.name, Email: 'chau.coach@', 'Số điện thoại': '097711122', 'Mật khẩu': 'coach2026', 'Số năm kinh nghiệm': '6,5' });
    await userEvent.click(await canvas.findByRole('button', { name: /Tiếp/ }));
  },
};

export const XacMinhOtp: Story = {
  name: '01d · Xác minh OTP',
  render: () => <VerifyOtp />,
  ...appStory({ params: { draft: JSON.stringify(draft) } }),
};

export const OnboardingAnh: Story = {
  name: '02a · Onboarding — ảnh đại diện',
  render: () => <Onboarding />,
  ...appStory({ setup: registered }),
};

export const OnboardingMoiHocVien: Story = {
  name: '04a · Onboarding — mời học viên đầu tiên (bước 4/4)',
  render: () => <Onboarding />,
  ...appStory({ setup: registered }),
  play: async ({ canvas }) => {
    await next(canvas, 2);
    await typeIn(await canvas.findByLabelText('Giới thiệu'), BIO);
    await next(canvas, 1);
  },
};

export const HocVienTrongLoiMoi: Story = {
  name: '05a · Học viên trống — mục Lời mời',
  render: () => <CoachRoster />,
  ...appStory({ setup: onboarded, tabs: { role: 'coach', active: 'roster' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('tab', { name: /Lời mời/ }));
  },
};

export const MoiChuaCoMa: Story = {
  name: '06a · Mời học viên — chưa có mã',
  render: () => <CreateInvite />,
  ...appStory({ setup: onboarded }),
};

export const HocVienLoiMoiDangCho: Story = {
  name: '06b · Học viên — lời mời đang chờ',
  render: () => <CoachRoster />,
  ...appStory({ setup: withInvite, tabs: { role: 'coach', active: 'roster' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('tab', { name: /Lời mời/ }));
  },
};

export const TaiKhoanBioNgan: Story = {
  name: '07a · Tài khoản HLV — giới thiệu quá ngắn',
  render: () => <AccountSettings />,
  ...appStory({ as: 'c-tuan' }),
  play: async ({ canvas }) => {
    await typeIn(await canvas.findByLabelText('Giới thiệu'), 'Ngắn quá');
    await userEvent.click(await canvas.findByRole('button', { name: 'Lưu' }));
  },
};
