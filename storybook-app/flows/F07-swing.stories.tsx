/**
 * F07 · Swing của người chơi — kịch bản: docs/flows/F07/steps.json, storyboard: docs/flows/F07.md
 *
 * Tài khoản: p-minh (Nguyễn Minh Anh — có gậy, 3 swing mẫu: Gỗ 3 06/10, Driver 05/10, Sắt 7 28/09); p-huy cho danh sách rỗng.
 * Story biến thể danh sách / chi tiết thêm 6 swing mẫu (SWINGS dưới đây) để đủ mọi trạng thái tải lên + phân tích.
 *
 * Các bước (mỗi bước shot = một story `f07--b-<nn>-<slug>`; ✓ = đã có):
 *  ✓ 01 · Tab Swing — danh sách                 (player)/swings             as p-minh, tab swings
 *  ✓ 02 · Lưới                                  (player)/swings             play: Lưới
 *  ✓ 03 · Lọc 7 ngày, cũ nhất trước             (player)/swings             play: Lưới → 7 ngày → Mới nhất trước
 *  ✓ 04 · Đăng swing — hướng dẫn quay           swings/new                  as p-minh
 *  ✓ 05 · Popup video quá dung lượng            swings/new                  play: Tiếp tục → swing_4k_120fps_dai.mov
 *  ✓ 06 · Popup file không phải video           swings/new                  play: Tiếp tục → anh_tu_the_chuan_bi.jpg
 *  ✓ 07 · Chọn video, gậy SW, ngày 05/10        swings/new                  play: Tiếp tục → wedge_mang_yeu.mp4 → SW → Ngày → 5 tháng 10
 *  ✓ 08 · Tạm dừng tải lên                      swings/new (bước 3)         play: như 07 → Tải lên → Tạm dừng ở 45 %
 *  ✓ 09 · Lỗi tải lên ở 60 %                    swings/new (bước 3)         play: như 07 → Tải lên (wedge_mang_yeu.mp4 lỗi ở mốc 60 %)
 *  ✓ 10 · Đang phân tích (40 %)                 swings/[id] sw-sw           (mô phỏng đứng yên)
 *  ✓ 11 · Phân tích xong + mục Gậy              swings/[id] sw-sw           swing SW vừa đăng (SW_PHAN_TICH)
 *  ✓ 12 · Bấm gợi ý → tua tới 1,3 s             swings/[id] sw-sw           play: bấm gợi ý đầu tiên
 *  ✓ 13 · Gậy của swing                         clubs/[id] cl-sw            Swing gần đây có swing 05/10
 *  ✓ 14 · Dialog xoá swing                      swings/[id] sw-sw           play: Xoá swing
 *  ✓ 15 · Sau khi xoá — danh sách               (player)/swings             as p-minh, tab swings
 *  ✓ 16 · Cần xem lại (video ngược sáng)        swings/[id] sw-sb-review    play: cuộn tới Quay lại hướng dẫn
 *  ✓ 17 · Lỗi phân tích                         swings/[id] sw-pw           pw_may_chu_ban.mp4 lỗi ở 50 % (PW_LOI)
 * Biến thể:
 *  ✓ 01a · Danh sách — đủ trạng thái            (player)/swings             + 6 swing mẫu
 *  ✓ 01b · Danh sách rỗng                       (player)/swings             as p-huy
 *  ✓ 03a · Lọc 7 ngày — không có swing          (player)/swings             xoá sw-minh-3, sw-minh-1; play: 7 ngày
 *  ✓ 07a · Chọn gậy — sheet                     swings/new (bước 2)         play: mở ô Gậy
 *  ✓ 07b · Lỗi — chưa chọn gậy                  swings/new (bước 2)         play: Tải lên khi chưa chọn gậy
 *  ✓ 08a · Đang tải lên (45 %)                  swings/new (bước 3)         mô phỏng chạy 9 nhịp rồi đứng yên
 *  ✓ 08b · Chi tiết — video tải dở              swings/[id] sw-sb-paused
 *  ✓ 09a · Thử lại → tải xong                   swings/new (bước 3)         play: Thử lại → Để sau / Phân tích ngay
 *  ✓ 10a · Chi tiết — chưa phân tích            swings/[id] sw-minh-3
 *  ✓ 15a · Mở swing đã xoá — không tìm thấy     swings/[id] sw-minh-2 đã xoá
 *
 * Chưa có: quay video trong app (camera); chọn video từ thư viện (bản thử chọn video mẫu) — ngoài Phase 2.
 */
import { useLayoutEffect, type PropsWithChildren } from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react-native-web-vite';
import { userEvent, within } from 'storybook/test';
import ClubDetail from '../../apps/golf/app/clubs/[id]/index';
import PlayerSwings from '../../apps/golf/app/(player)/swings';
import SwingNew from '../../apps/golf/app/swings/new';
import SwingDetail from '../../apps/golf/app/swings/[id]';
import type { Action } from '../../apps/golf/lib/reducer';
import type { Swing, SwingAnalysis } from '../../apps/golf/lib/domain';
import { NOW } from '../../apps/golf/lib/mock';
import { ANALYSIS_TICK_MS, UPLOAD_TICK_MS, mockAnalysis } from '../../apps/golf/lib/simulate';
import { appStory, type AppStoryOptions } from '../lib/appStory';

const meta = { title: 'Luồng/F07 · Swing của người chơi', id: 'f07' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
type Play = NonNullable<Story['play']>;

// 6 swing mẫu của p-minh, mỗi cái một trạng thái (id / thời điểm cố định → ảnh ổn định). Cùng 3 swing seed = đủ mọi Badge.
const base = { playerId: 'p-minh', durationSec: 4.2, cameraView: 'face-on' } as const;
const done = { status: 'done', progress: 1 } as const;
const SWINGS: Swing[] = [
  { ...base, id: 'sw-sb-uploading', clubId: 'cl-driver', capturedAt: '2026-10-07T07:40:00Z', fileName: 'driver_face_on_60fps.mp4', upload: { status: 'uploading', progress: 0.45 }, job: { status: 'none', progress: 0 } },
  { ...base, id: 'sw-sb-paused', clubId: 'cl-pw', capturedAt: '2026-10-07T07:20:00Z', fileName: 'pw_face_on.mp4', upload: { status: 'paused', progress: 0.3 }, job: { status: 'none', progress: 0 } },
  { ...base, id: 'sw-sb-upfail', clubId: 'cl-sw', capturedAt: '2026-10-07T07:00:00Z', fileName: 'wedge_mang_yeu.mp4', durationSec: 3.1, upload: { status: 'failed', progress: 0.6 }, job: { status: 'none', progress: 0 } },
  { ...base, id: 'sw-sb-processing', clubId: 'cl-hybrid4', capturedAt: '2026-10-06T16:00:00Z', fileName: 'hybrid4_face_on.mp4', upload: done, job: { status: 'processing', progress: 0.4 } },
  { ...base, id: 'sw-sb-review', clubId: 'cl-driver', capturedAt: '2026-10-04T09:00:00Z', fileName: 'driver_nguoc_sang.mp4', durationSec: 4.0, upload: done, job: { status: 'needs_review', progress: 1 }, analysis: mockAnalysis('driver_nguoc_sang.mp4', 4.0).analysis },
  { ...base, id: 'sw-sb-failed', clubId: 'cl-iron5', capturedAt: '2026-09-30T09:00:00Z', fileName: 'sat5_dtl.mp4', cameraView: 'down-the-line', upload: done, job: { status: 'failed', progress: 0 } },
];
const addSwings: Action[] = SWINGS.map((swing) => ({ type: 'addSwing', swing }));

// Mô phỏng tải lên / phân tích chạy bằng setInterval(UPLOAD_TICK_MS | ANALYSIS_TICK_MS) theo thời gian thật → story không đứng yên, ảnh chụp lệch.
// `ticks(n)`: trong story này mỗi bộ đếm mô phỏng chạy ngay n nhịp rồi dừng (9 nhịp tải = 45 %); bộ đếm khác (phát video, Storybook) giữ nguyên.
function SimTicks({ n, children }: PropsWithChildren<{ n: number }>) {
  useLayoutEffect(() => {
    const real = window.setInterval;
    window.setInterval = ((fn: (...a: unknown[]) => void, ms?: number, ...args: unknown[]) => {
      if (ms !== UPLOAD_TICK_MS && ms !== ANALYSIS_TICK_MS) return real(fn, ms, ...args);
      let left = n;
      const id = real(() => (left-- > 0 ? fn(...args) : window.clearInterval(id)), 0);
      return id;
    }) as typeof window.setInterval;
    return () => {
      window.setInterval = real;
    };
  }, []);
  return children;
}
const ticks = (n: number): Decorator => (Story) => <SimTicks n={n}><Story /></SimTicks>;

/** appStory + decorator riêng của story (ticks). */
const story = (opts: AppStoryOptions, ...more: Decorator[]) => {
  const s = appStory(opts);
  return { ...s, decorators: [...s.decorators, ...more] };
};

// Sheet / dialog là Modal → vẽ ra ngoài #storybook-root: tìm trong cả body.
const page = (el: HTMLElement) => within(el.ownerDocument.body);
const click = (el: Promise<HTMLElement>) => el.then((e) => userEvent.click(e));
const toStep2: Play = async ({ canvas }) => {
  await click(canvas.findByRole('button', { name: 'Tiếp tục' }));
};
const pick = (club: string, video?: string): Play => async (ctx) => {
  await toStep2(ctx);
  if (video) await click(ctx.canvas.findByText(video));
  await click(ctx.canvas.findByRole('combobox', { name: /^Gậy/ }));
  await click(page(ctx.canvasElement).findByRole('radio', { name: new RegExp(`^${club}`) }));
};
const upload = (club: string, video?: string): Play => async (ctx) => {
  await pick(club, video)(ctx);
  await click(ctx.canvas.findByRole('button', { name: 'Tải lên' }));
};

// Swing SW của bước 07–14: Minh Anh đăng wedge_mang_yeu.mp4 (gậy SW, ngày 05/10) → tải xong; job theo bước (đang phân tích / xong).
const swSw = (job: Swing['job'], analysis?: SwingAnalysis): Action => ({
  type: 'addSwing',
  swing: { ...base, id: 'sw-sw', clubId: 'cl-sw', capturedAt: '2026-10-05T08:00:00Z', fileName: 'wedge_mang_yeu.mp4', durationSec: 3.1, upload: done, job, analysis },
});
const SW_PHAN_TICH = swSw({ status: 'succeeded', progress: 1 }, mockAnalysis('wedge_mang_yeu.mp4', 3.1).analysis);
// Bước 17: pw_may_chu_ban.mp4 (gậy PW) — máy chủ bận, phân tích lỗi ở 50 %.
const PW_LOI = { type: 'addSwing', swing: { ...base, id: 'sw-pw', clubId: 'cl-pw', capturedAt: NOW, fileName: 'pw_may_chu_ban.mp4', durationSec: 3.4, cameraView: 'down-the-line', upload: done, job: { status: 'failed', progress: 0.5 } } } as const;
const SW_DETAIL: AppStoryOptions = { as: 'p-minh', params: { id: 'sw-sw' }, setup: [SW_PHAN_TICH] };
const TAB_SWING: AppStoryOptions = { as: 'p-minh', tabs: { role: 'player', active: 'swings' } };
// Khung ảnh cố định 390×844: cuộn phần bước đó kiểm vào giữa màn (như lượt đi CDP).
const reveal = (el: Promise<HTMLElement>) => el.then((e) => e.scrollIntoView({ block: 'center' }));
// Bước 07: wedge_mang_yeu.mp4 + gậy SW + ngày 05/10 — bước 08, 09 tải lên tiếp từ đây.
const chonSwNgay: Play = async (ctx) => {
  await pick('SW', 'wedge_mang_yeu.mp4')(ctx);
  await click(ctx.canvas.findByRole('button', { name: 'Ngày, 07/10/2026' }));
  await click(page(ctx.canvasElement).findByRole('button', { name: /, 5 tháng 10/ }));
  await ctx.canvas.findByRole('button', { name: 'Ngày, 05/10/2026' });
};
const grid: Play = ({ canvas }) => click(canvas.findByRole('tab', { name: 'Lưới' }));
// chọn file lỗi → Dialog (Modal, ngoài canvas)
const reject = (file: string, title: string): Play => async (ctx) => {
  await toStep2(ctx);
  await click(ctx.canvas.findByText(file));
  await page(ctx.canvasElement).findByText(title);
};

// ── Danh sách ────────────────────────────────────────────────────────────────
export const B01DanhSach: Story = {
  name: '01 · Minh Anh mở tab Swing',
  render: () => <PlayerSwings />,
  ...appStory(TAB_SWING),
};

export const DanhSach: Story = {
  name: '01a · Danh sách — đủ trạng thái',
  render: () => <PlayerSwings />,
  ...appStory({ ...TAB_SWING, setup: addSwings }),
};

export const DanhSachRong: Story = {
  name: '01b · Danh sách rỗng',
  render: () => <PlayerSwings />,
  ...appStory({ as: 'p-huy', tabs: { role: 'player', active: 'swings' } }),
};

export const B02Luoi: Story = {
  name: '02 · Chọn Lưới',
  render: () => <PlayerSwings />,
  ...appStory(TAB_SWING),
  play: grid,
};

export const B03LocSapXep: Story = {
  name: '03 · Lọc 7 ngày → đổi sắp xếp',
  render: () => <PlayerSwings />,
  ...appStory(TAB_SWING),
  play: async (ctx) => {
    await grid(ctx);
    await click(ctx.canvas.findByRole('button', { name: '7 ngày' }));
    await click(ctx.canvas.findByRole('button', { name: 'Mới nhất trước' }));
    await ctx.canvas.findByRole('button', { name: 'Cũ nhất trước' });
  },
};

export const Loc7NgayRong: Story = {
  name: '03a · Lọc 7 ngày — không có swing',
  render: () => <PlayerSwings />,
  ...appStory({ ...TAB_SWING, setup: [{ type: 'deleteSwing', id: 'sw-minh-3' }, { type: 'deleteSwing', id: 'sw-minh-1' }] }),
  play: async ({ canvas }) => {
    await click(canvas.findByRole('button', { name: '7 ngày' }));
    await canvas.findByText('Không có swing nào trong 7 ngày qua.');
  },
};

// ── Đăng swing ───────────────────────────────────────────────────────────────
export const B04HuongDan: Story = {
  name: '04 · Đăng swing — hướng dẫn quay',
  render: () => <SwingNew />,
  ...appStory({ as: 'p-minh' }),
};

export const B05QuaDungLuong: Story = {
  name: '05 · Chọn swing_4k_120fps_dai.mov — quá dung lượng',
  render: () => <SwingNew />,
  ...appStory({ as: 'p-minh' }),
  play: reject('swing_4k_120fps_dai.mov', 'Video quá dung lượng'),
};

export const B06KhongPhaiVideo: Story = {
  name: '06 · Chọn anh_tu_the_chuan_bi.jpg — không phải video',
  render: () => <SwingNew />,
  ...appStory({ as: 'p-minh' }),
  play: reject('anh_tu_the_chuan_bi.jpg', 'File không phải video'),
};

export const B07ChonVideoGayNgay: Story = {
  name: '07 · Chọn wedge_mang_yeu.mp4, gậy SW, ngày 05/10',
  render: () => <SwingNew />,
  ...appStory({ as: 'p-minh' }),
  play: async (ctx) => {
    await chonSwNgay(ctx);
    await reveal(ctx.canvas.findByRole('button', { name: 'Ngày, 05/10/2026' }));
  },
};

export const ChonGay: Story = {
  name: '07a · Chọn gậy — sheet',
  render: () => <SwingNew />,
  ...story({ as: 'p-minh' }),
  play: async (ctx) => {
    await toStep2(ctx);
    await click(ctx.canvas.findByRole('combobox', { name: /^Gậy/ }));
  },
};

export const LoiChuaChonGay: Story = {
  name: '07b · Lỗi — chưa chọn gậy',
  render: () => <SwingNew />,
  ...appStory({ as: 'p-minh' }),
  play: async (ctx) => {
    await toStep2(ctx);
    await click(ctx.canvas.findByRole('button', { name: 'Tải lên' }));
    await reveal(ctx.canvas.findByRole('combobox', { name: /^Gậy/ }));
  },
};

export const B08TamDung: Story = {
  name: '08 · Tải lên → Tạm dừng',
  render: () => <SwingNew />,
  ...story({ as: 'p-minh' }, ticks(9)),
  play: async (ctx) => {
    await chonSwNgay(ctx);
    await click(ctx.canvas.findByRole('button', { name: 'Tải lên' }));
    await ctx.canvas.findByText('Đang tải lên 45%');
    await click(ctx.canvas.findByRole('button', { name: 'Tạm dừng' }));
  },
};

export const DangTai: Story = {
  name: '08a · Đang tải lên (45 %)',
  render: () => <SwingNew />,
  ...story({ as: 'p-minh' }, ticks(9)),
  play: async (ctx) => {
    await upload('Driver')(ctx);
    await ctx.canvas.findByText('Đang tải lên 45%');
  },
};

// ── Chi tiết ─────────────────────────────────────────────────────────────────
const detail = (id: string): AppStoryOptions => ({ as: 'p-minh', params: { id }, setup: addSwings });

export const ChiTietTaiDo: Story = {
  name: '08b · Chi tiết — video tải dở',
  render: () => <SwingDetail />,
  ...appStory(detail('sw-sb-paused')),
};

export const B09LoiMang: Story = {
  name: '09 · Tiếp tục → lỗi tải lên ở 60 %',
  render: () => <SwingNew />,
  ...story({ as: 'p-minh' }, ticks(20)),
  play: async (ctx) => {
    await chonSwNgay(ctx);
    await click(ctx.canvas.findByRole('button', { name: 'Tải lên' }));
    await ctx.canvas.findByText('Lỗi tải lên ở 60%');
  },
};

export const ThuLaiTaiXong: Story = {
  name: '09a · Thử lại → tải xong',
  render: () => <SwingNew />,
  ...story({ as: 'p-minh' }, ticks(20)),
  play: async (ctx) => {
    await upload('SW', 'wedge_mang_yeu.mp4')(ctx);
    await click(ctx.canvas.findByRole('button', { name: 'Thử lại' }));
    await ctx.canvas.findByRole('button', { name: 'Phân tích ngay' });
  },
};

export const B10DangPhanTich: Story = {
  name: '10 · Thử lại → Phân tích ngay — đang phân tích',
  render: () => <SwingDetail />,
  ...story({ ...SW_DETAIL, setup: [swSw({ status: 'processing', progress: 0.4 })] }, ticks(0)),
};

export const ChiTietChuaPhanTich: Story = {
  name: '10a · Chi tiết — chưa phân tích',
  render: () => <SwingDetail />,
  ...appStory(detail('sw-minh-3')),
};

export const B11PhanTichXong: Story = {
  name: '11 · Phân tích xong — mục Gậy có thông số',
  render: () => <SwingDetail />,
  ...appStory(SW_DETAIL),
};

export const B12TuaTheoTip: Story = {
  name: '12 · Chạm gợi ý đầu tiên — tua tới 1,3 s',
  render: () => <SwingDetail />,
  ...appStory(SW_DETAIL),
  play: async ({ canvas }) => {
    await click(canvas.findByRole('button', { name: /^1,3 ?s: Giữ góc cổ tay lâu hơn ở đầu downswing/ }));
    await reveal(canvas.findByText('1,3 s / 3,1 s'));
  },
};

export const B13GayCuaSwing: Story = {
  name: '13 · Chạm mục Gậy — chi tiết gậy SW',
  render: () => <ClubDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'cl-sw' }, setup: [SW_PHAN_TICH] }),
};

export const B14XoaSwing: Story = {
  name: '14 · Quay lại → Xoá swing',
  render: () => <SwingDetail />,
  ...appStory(SW_DETAIL),
  play: async ({ canvas, canvasElement }) => {
    await click(canvas.findByRole('button', { name: 'Xoá swing' }));
    await page(canvasElement).findByText('Xoá swing này?');
  },
};

export const B15SauXoa: Story = {
  name: '15 · Xoá — về danh sách',
  render: () => <PlayerSwings />,
  ...appStory(TAB_SWING),
};

export const DaXoa: Story = {
  name: '15a · Mở swing đã xoá — không tìm thấy',
  render: () => <SwingDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'sw-minh-2' }, setup: [{ type: 'deleteSwing', id: 'sw-minh-2' }] }),
};

export const B16CanXemLai: Story = {
  name: '16 · Đăng driver_nguoc_sang.mp4 — cần xem lại',
  render: () => <SwingDetail />,
  ...appStory(detail('sw-sb-review')),
  play: ({ canvas }) => reveal(canvas.findByRole('button', { name: 'Quay lại hướng dẫn' })),
};

export const B17PhanTichLoi: Story = {
  name: '17 · Đăng pw_may_chu_ban.mp4 — phân tích lỗi',
  render: () => <SwingDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'sw-pw' }, setup: [PW_LOI] }),
};
