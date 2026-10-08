/**
 * F07 · Swing của người chơi
 *
 * Tài khoản: p-minh (Nguyễn Minh Anh — có gậy, 3 swing mẫu, ghi chú của HLV Tuấn); p-huy cho danh sách rỗng.
 * Story danh sách / chi tiết thêm 6 swing mẫu (SWINGS dưới đây) để đủ mọi trạng thái tải lên + phân tích.
 *
 * Các bước (mỗi bước = một story; ✓ = đã có):
 *  ✓ 01 · Danh sách swing — đủ trạng thái     (player)/swings           as p-minh + 6 swing mẫu, tab swings
 *  ✓ 02 · Danh sách rỗng                      (player)/swings           as p-huy, tab swings
 *  ✓ 03 · Đăng swing — hướng dẫn quay         swings/new                as p-minh
 *  ✓ 04 · Chọn video, gậy, góc quay           swings/new (bước 2)       play: Tiếp tục → chọn Driver
 *  ✓ 04a · Sheet chọn gậy                     swings/new (bước 2)       play: mở ô Gậy
 *  ✓ 04b · Lỗi chưa chọn gậy                  swings/new (bước 2)       play: Tải lên khi chưa chọn gậy
 *  ✓ 05 · Đang tải lên 45 %                   swings/new (bước 3)       mô phỏng chạy 9 nhịp rồi đứng yên
 *  ✓ 05a · Tạm dừng                           swings/new (bước 3)       play: Tạm dừng ở 45 %
 *  ✓ 05b · Lỗi tải lên ở 60 %                 swings/new (bước 3)       video wedge_mang_yeu.mp4 (lỗi ở mốc 60 %)
 *  ✓ 05c · Thử lại → tải xong                 swings/new (bước 3)       play: Thử lại → Để sau / Phân tích ngay
 *  ✓ 06 · Chi tiết — video tải dở (tạm dừng)  swings/[id] sw-sb-paused
 *  ✓ 07 · Chi tiết — chưa phân tích           swings/[id] sw-minh-3
 *  ✓ 08 · Chi tiết — đang phân tích 40 %      swings/[id] sw-sb-processing (mô phỏng đứng yên)
 *  ✓ 09 · Chi tiết — đã phân tích + gợi ý theo mốc   swings/[id] sw-minh-1
 *  ✓ 09a · Bấm gợi ý → tua tới mốc            swings/[id] sw-minh-1     play: bấm gợi ý 1,3s
 *  ✓ 10 · Chi tiết — cần xem lại              swings/[id] sw-sb-review (video ngược sáng)
 *  ✓ 11 · Chi tiết — lỗi phân tích            swings/[id] sw-sb-failed
 *  ✓ 12 · Dialog xoá swing                    swings/[id] sw-minh-2 (2 ghi chú HLV)
 *  ✓ 12a · Sau khi xoá — không tìm thấy swing swings/[id] sw-minh-2 đã xoá
 *
 * Chưa có (route không tồn tại — không dựng UI giả):
 *  - Swing dạng lưới / lọc theo gậy, trạng thái — Phase 2 (tab Swing chỉ có danh sách).
 *  - Popup báo file video lỗi / không đọc được khi chọn video — Phase 2 (bản thử chỉ chọn video mẫu, chưa mở thư viện).
 *  - Quay video trong app (camera) — Phase 2.
 */
import { useLayoutEffect, type PropsWithChildren } from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react-native-web-vite';
import { userEvent, within } from 'storybook/test';
import PlayerSwings from '../../apps/golf/app/(player)/swings';
import SwingNew from '../../apps/golf/app/swings/new';
import SwingDetail from '../../apps/golf/app/swings/[id]';
import type { Action } from '../../apps/golf/lib/reducer';
import type { Swing } from '../../apps/golf/lib/domain';
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

// ── Danh sách ────────────────────────────────────────────────────────────────
export const DanhSach: Story = {
  name: '01 · Danh sách swing — đủ trạng thái',
  render: () => <PlayerSwings />,
  ...appStory({ as: 'p-minh', setup: addSwings, tabs: { role: 'player', active: 'swings' } }),
};

export const DanhSachRong: Story = {
  name: '02 · Danh sách rỗng',
  render: () => <PlayerSwings />,
  ...appStory({ as: 'p-huy', tabs: { role: 'player', active: 'swings' } }),
};

// ── Đăng swing ───────────────────────────────────────────────────────────────
export const HuongDanQuay: Story = {
  name: '03 · Đăng swing — hướng dẫn quay',
  render: () => <SwingNew />,
  ...appStory({ as: 'p-minh' }),
};

export const ChonVideo: Story = {
  name: '04 · Chọn video, gậy, góc quay',
  render: () => <SwingNew />,
  ...appStory({ as: 'p-minh' }),
  play: pick('Driver'),
};

export const ChonGay: Story = {
  name: '04a · Chọn gậy — sheet danh sách gậy',
  render: () => <SwingNew />,
  ...story({ as: 'p-minh' }),
  play: async (ctx) => {
    await toStep2(ctx);
    await click(ctx.canvas.findByRole('combobox', { name: /^Gậy/ }));
  },
};

export const LoiChuaChonGay: Story = {
  name: '04b · Lỗi — chưa chọn gậy',
  render: () => <SwingNew />,
  ...appStory({ as: 'p-minh' }),
  play: async (ctx) => {
    await toStep2(ctx);
    await click(ctx.canvas.findByRole('button', { name: 'Tải lên' }));
  },
};

export const DangTai: Story = {
  name: '05 · Đang tải lên (45 %)',
  render: () => <SwingNew />,
  ...story({ as: 'p-minh' }, ticks(9)),
  play: async (ctx) => {
    await upload('Driver')(ctx);
    await ctx.canvas.findByText('Đang tải lên 45%');
  },
};

export const TamDung: Story = {
  name: '05a · Tạm dừng tải lên',
  render: () => <SwingNew />,
  ...story({ as: 'p-minh' }, ticks(9)),
  play: async (ctx) => {
    await upload('Driver')(ctx);
    await ctx.canvas.findByText('Đang tải lên 45%');
    await click(ctx.canvas.findByRole('button', { name: 'Tạm dừng' }));
  },
};

export const LoiTai: Story = {
  name: '05b · Lỗi tải lên (mất mạng ở 60 %)',
  render: () => <SwingNew />,
  ...story({ as: 'p-minh' }, ticks(20)),
  play: upload('SW', 'wedge_mang_yeu.mp4'),
};

export const ThuLaiTaiXong: Story = {
  name: '05c · Thử lại → tải xong',
  render: () => <SwingNew />,
  ...story({ as: 'p-minh' }, ticks(20)),
  play: async (ctx) => {
    await upload('SW', 'wedge_mang_yeu.mp4')(ctx);
    await click(ctx.canvas.findByRole('button', { name: 'Thử lại' }));
    await ctx.canvas.findByRole('button', { name: 'Phân tích ngay' });
  },
};

// ── Chi tiết ─────────────────────────────────────────────────────────────────
const detail = (id: string): AppStoryOptions => ({ as: 'p-minh', params: { id }, setup: addSwings });

export const ChiTietTaiDo: Story = {
  name: '06 · Chi tiết — video tải dở (tạm dừng)',
  render: () => <SwingDetail />,
  ...appStory(detail('sw-sb-paused')),
};

export const ChiTietChuaPhanTich: Story = {
  name: '07 · Chi tiết — chưa phân tích',
  render: () => <SwingDetail />,
  ...appStory(detail('sw-minh-3')),
};

export const ChiTietDangPhanTich: Story = {
  name: '08 · Chi tiết — đang phân tích (40 %)',
  render: () => <SwingDetail />,
  ...story(detail('sw-sb-processing'), ticks(0)),
};

export const ChiTietDaPhanTich: Story = {
  name: '09 · Chi tiết — đã phân tích + gợi ý theo mốc',
  render: () => <SwingDetail />,
  ...appStory(detail('sw-minh-1')),
};

export const BamGoiY: Story = {
  name: '09a · Bấm gợi ý → tua video tới mốc',
  render: () => <SwingDetail />,
  ...appStory(detail('sw-minh-1')),
  play: async ({ canvas }) => {
    await click(canvas.findByRole('button', { name: /^1,3 ?s: Giữ góc cổ tay/ }));
  },
};

export const ChiTietCanXemLai: Story = {
  name: '10 · Chi tiết — cần xem lại (video chưa đủ rõ)',
  render: () => <SwingDetail />,
  ...appStory(detail('sw-sb-review')),
};

export const ChiTietLoiPhanTich: Story = {
  name: '11 · Chi tiết — lỗi phân tích',
  render: () => <SwingDetail />,
  ...appStory(detail('sw-sb-failed')),
};

export const XoaDialog: Story = {
  name: '12 · Dialog xoá swing',
  render: () => <SwingDetail />,
  ...story(detail('sw-minh-2')),
  play: async ({ canvas }) => {
    await click(canvas.findByRole('button', { name: 'Xoá swing' }));
  },
};

export const DaXoa: Story = {
  name: '12a · Sau khi xoá — không tìm thấy swing',
  render: () => <SwingDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'sw-minh-2' }, setup: [{ type: 'deleteSwing', id: 'sw-minh-2' }] }),
};
