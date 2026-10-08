/**
 * F08 · HLV review swing — kịch bản: docs/flows/F08/steps.json, storyboard: docs/flows/F08.md
 *
 * Tài khoản: p-minh (Nguyễn Minh Anh — HLV chính Tuấn, HLV phụ Hà) đăng swing Driver mới `sw-moi` → c-tuan (HLV Đỗ Minh Tuấn) nhận thông báo,
 * review: chèn mốc, gửi 2 ghi chú, sửa ghi chú 1, xoá ghi chú 2 → c-ha (HLV Vũ Thanh Hà) thấy ghi chú của Tuấn nhưng không sửa / xoá được,
 * "Đã review" của Hà rỗng → p-minh nhận thông báo, bấm chip "Tua tới 1,3 s".
 *
 * Các bước (mỗi bước shot = một story `f08--b-<nn>-<slug>`; ✓ = đã có):
 *  ✓ 01 · Tải lên xong                          swings/new                  as p-minh, play: Tiếp tục → Driver → Tải lên → chờ Phân tích ngay
 *  ✓ 02 · Phân tích xong                        swings/[id] sw-moi          as p-minh
 *  ✓ 03 · HLV Tuấn — thông báo swing mới        (coach)/inbox               as c-tuan
 *  ✓ 04 · Cần phản hồi                          (coach)/roster              as c-tuan, play: lọc Cần phản hồi
 *  ✓ 05 · Tab Swing — Chưa review               students/[id] p-minh        as c-tuan, play: tab Swing
 *  ✓ 06 · Workspace                             swings/[id] sw-moi          as c-tuan
 *  ✓ 07 · Chèn mốc rồi viết                     swings/[id] sw-moi          play: Đỉnh → Chèn mốc 1,3 s → gõ
 *  ✓ 08 · Đã gửi ghi chú                        swings/[id] sw-moi          play: như 07 → Gửi
 *  ✓ 09 · Đang sửa ghi chú                      swings/[id] sw-moi          2 ghi chú, play: Sửa ghi chú 1 → gõ
 *  ✓ 10 · Dialog xoá ghi chú                    swings/[id] sw-moi          ghi chú 1 đã sửa, play: Xoá ghi chú 2
 *  ✓ 11 · Sau khi xoá                           swings/[id] sw-moi          play: Xoá ghi chú 2 → Xoá (Dialog)
 *  ✓ 12 · HLV Hà — Chưa review                  students/[id] p-minh        as c-ha, play: tab Swing
 *  ✓ 13 · HLV Hà xem ghi chú của Tuấn           swings/[id] sw-moi          as c-ha (không Sửa / Xoá)
 *  ✓ 14 · Học viên nhận thông báo               notifications               as p-minh
 *  ✓ 15 · Tua theo mốc                          swings/[id] sw-moi          as p-minh, play: Tua tới 1,3 s
 *  ✓ 16 · Đã review                             students/[id] p-minh        as c-tuan, play: tab Swing → Đã review
 *  ✓ 17 · Chưa review                           students/[id] p-minh        as c-tuan, play: tab Swing
 * Biến thể:
 *  ✓ 06a · Workspace — swing chưa có ghi chú    swings/[id] sw-lan-1        as c-tuan
 *  ✓ 07a · Tua tới mốc Chạm bóng rồi viết       swings/[id] sw-minh-1       as c-ha, play: bấm mốc → gõ
 *  ✓ 08a · Lỗi — ghi chú trống                  swings/[id] sw-minh-1       as c-ha, play: gõ khoảng trắng → Gửi
 *  ✓ 13a · HLV đã huỷ kết nối — 403             swings/[id] sw-lan-1        as c-ha (kết nối cn-ha-lan đã huỷ)
 *  ✓ 16a · Đã review — rỗng                     students/[id] p-minh        as c-ha, play: tab Swing → Đã review
 *
 * Chưa có: ghi chú vẽ / đánh dấu trên khung hình video (ngoài Phase 2).
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fireEvent, screen, userEvent, waitForElementToBeRemoved } from 'storybook/test';
import CoachRoster from '../../apps/golf/app/(coach)/roster';
import CoachInbox from '../../apps/golf/app/(coach)/inbox';
import Notifications from '../../apps/golf/app/notifications';
import StudentDetail from '../../apps/golf/app/students/[id]';
import SwingDetail from '../../apps/golf/app/swings/[id]';
import SwingNew from '../../apps/golf/app/swings/new';
import { NOW } from '../../apps/golf/lib/mock';
import { mockAnalysis } from '../../apps/golf/lib/simulate';
import { appStory, typeIn } from '../lib/appStory';

const meta = { title: 'Luồng/F08 · HLV review swing', id: 'f08' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
type Play = NonNullable<Story['play']>;
type Canvas = Parameters<Play>[0]['canvas'];

const NOTE = 'Chạm bóng: hông mở tốt nhưng đầu nhấc sớm — giữ mắt ở bóng thêm nửa nhịp.';
const click = (el: Promise<HTMLElement>) => el.then((e) => userEvent.click(e));
// Gõ vào ô ghi chú bằng fireEvent.input (setter gốc + sự kiện input), KHÔNG dùng userEvent.type: trong Chrome headless khi chụp,
// userEvent.type vào MessageInput để chữ hiện trong ô nhưng React không nhận onChange (state rỗng → không có nút Gửi). Xem issues/D.md.
// append: gõ tiếp sau nội dung đang có (vd sau mốc vừa chèn).
const typeNote = async (canvas: Canvas, text: string, append = false) => {
  const el = (await canvas.findByPlaceholderText(/^Ghi chú tại/)) as HTMLInputElement;
  fireEvent.input(el, { target: { value: append ? el.value + text : text } });
};
const write = (text: string): Play => async ({ canvas }) => {
  await click(canvas.findByRole('button', { name: /^Chạm bóng, 1,6 ?s$/ }));
  await typeNote(canvas, text);
};
const tab = (canvas: Canvas, name: RegExp) => click(canvas.findByRole('tab', { name }));
// Khung ảnh cố định 390×844: cuộn mục ghi chú (dưới phần Phân tích) vào giữa màn để ảnh thấy điều bước đó kiểm.
const reveal = (el: Promise<HTMLElement>) => el.then((e) => e.scrollIntoView({ block: 'center' }));

// Trạng thái dùng chung (id / thời điểm cố định). MOI = Minh Anh đăng swing Driver mới + phân tích xong (bước 01–02).
const SW = 'sw-moi';
const MOI = [
  { type: 'addSwing', swing: { id: SW, playerId: 'p-minh', clubId: 'cl-driver', capturedAt: NOW, fileName: 'driver_face_on_60fps.mp4', durationSec: 4.2, cameraView: 'face-on', upload: { status: 'uploading', progress: 0 }, job: { status: 'none', progress: 0 } } },
  { type: 'uploadUpdate', id: SW, status: 'done', progress: 1, at: NOW, notificationId: 'nt-up-moi' }, // báo HLV Tuấn + Hà (swing_uploaded)
  { type: 'jobUpdate', id: SW, status: 'succeeded', progress: 1, analysis: mockAnalysis('driver_face_on_60fps.mp4', 4.2).analysis, at: NOW, notificationId: 'nt-an-moi' },
] as const;
// Bước 15 của lượt đi: Tuấn chạm thông báo swing mới (id nt-up-moi-0 = kết nối đầu tiên của Minh Anh, cn-tuan-minh) → chuông còn 1.
const READ_TUAN = { type: 'markRead' as const, userId: 'c-tuan', at: NOW, ids: ['nt-up-moi-0'] };
const NOTE_1 = { type: 'addNote', note: { id: 'note-moi-1', swingId: SW, coachId: 'c-tuan', atSec: 1.3, text: '[1,3 s] Vai mở sớm ở đầu downswing', createdAt: NOW }, notificationId: 'nt-note-moi-1' } as const;
const NOTE_2 = { type: 'addNote', note: { id: 'note-moi-2', swingId: SW, coachId: 'c-tuan', atSec: 1.6, text: 'Tay dẫn trước bóng tốt', createdAt: NOW }, notificationId: 'nt-note-moi-2' } as const;
const EDIT_1 = { type: 'editNote', id: 'note-moi-1', coachId: 'c-tuan', text: '[1,3 s] Vai mở sớm — giữ lưng quay về mục tiêu thêm một nhịp', at: NOW } as const;
const DEL_2 = { type: 'deleteNote', id: 'note-moi-2', coachId: 'c-tuan' } as const;
// Trạng thái sau bước 11 — gồm cả ghi chú 2 đã xoá: thông báo của nó vẫn còn ở học viên (xoá không thu hồi thông báo, F08.md).
const DA_REVIEW = [...MOI, READ_TUAN, NOTE_1, NOTE_2, EDIT_1, DEL_2];
const TUAN_SW = { as: 'c-tuan', params: { id: SW } } as const;

// ── Học viên đăng swing ──────────────────────────────────────────────────────
export const B01TaiXong: Story = {
  name: '01 · Minh Anh đăng swing Driver → Tải lên',
  render: () => <SwingNew />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await click(canvas.findByRole('button', { name: 'Tiếp tục' }));
    await click(canvas.findByRole('combobox', { name: /^Gậy/ }));
    // sheet chọn gậy là Modal → ngoài #storybook-root
    await click(screen.findByRole('radio', { name: /^Driver/ }));
    await click(canvas.findByRole('button', { name: 'Tải lên' }));
    await canvas.findByRole('button', { name: 'Phân tích ngay' }, { timeout: 8000 });
  },
};

export const B02PhanTichXong: Story = {
  name: '02 · Phân tích ngay',
  render: () => <SwingDetail />,
  ...appStory({ as: 'p-minh', params: { id: SW }, setup: [...MOI] }),
};

// ── HLV Tuấn review ──────────────────────────────────────────────────────────
export const B03ThongBaoSwingMoi: Story = {
  name: '03 · HLV Tuấn → tab Thông báo',
  render: () => <CoachInbox />,
  ...appStory({ as: 'c-tuan', tabs: { role: 'coach', active: 'inbox' }, setup: [...MOI] }),
};

export const B04CanPhanHoi: Story = {
  name: '04 · Chạm thông báo → Học viên › Cần phản hồi',
  render: () => <CoachRoster />,
  ...appStory({ as: 'c-tuan', tabs: { role: 'coach', active: 'roster' }, setup: [...MOI, READ_TUAN] }),
  play: ({ canvas }) => tab(canvas, /^Cần phản hồi/),
};

export const B05SwingChuaReview: Story = {
  name: '05 · Nguyễn Minh Anh → tab Swing (Chưa review)',
  render: () => <StudentDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'p-minh' }, setup: [...MOI, READ_TUAN] }),
  play: ({ canvas }) => tab(canvas, /^Swing/),
};

export const B06Workspace: Story = {
  name: '06 · Chạm swing Driver mới — workspace',
  render: () => <SwingDetail />,
  ...appStory({ ...TUAN_SW, setup: [...MOI, READ_TUAN] }),
};

const chenMoc: Play = async ({ canvas }) => {
  await click(canvas.findByRole('button', { name: 'Đỉnh, 1,3 s' }));
  await click(canvas.findByRole('button', { name: 'Chèn mốc 1,3 s' }));
  await typeNote(canvas, 'Vai mở sớm ở đầu downswing', true);
};

export const B07ChenMoc: Story = {
  name: '07 · Mốc Đỉnh → Chèn mốc 1,3 s → gõ nhận xét',
  render: () => <SwingDetail />,
  ...appStory({ ...TUAN_SW, setup: [...MOI, READ_TUAN] }),
  play: chenMoc,
};

export const B08DaGui: Story = {
  name: '08 · Gửi',
  render: () => <SwingDetail />,
  ...appStory({ ...TUAN_SW, setup: [...MOI, READ_TUAN] }),
  play: async (ctx) => {
    await chenMoc(ctx);
    await click(ctx.canvas.findByRole('button', { name: 'Gửi' }));
    await reveal(ctx.canvas.findByRole('button', { name: 'Tua tới 1,3 s' }));
  },
};

export const B09DangSua: Story = {
  name: '09 · Gửi ghi chú thứ hai → Sửa ghi chú thứ nhất',
  render: () => <SwingDetail />,
  ...appStory({ ...TUAN_SW, setup: [...MOI, READ_TUAN, NOTE_1, NOTE_2] }),
  play: async ({ canvas }) => {
    await click(canvas.findAllByRole('button', { name: /^Sửa ghi chú/ }).then((all) => all[0]!));
    await typeIn(await canvas.findByPlaceholderText('Sửa ghi chú'), EDIT_1.text);
  },
};

const askDelete2: Play = async ({ canvas }) => {
  await click(canvas.findByRole('button', { name: /^Xoá ghi chú Tại 1,6 s/ }));
  await screen.findByText('Xoá ghi chú này?');
};

export const B10XoaGhiChu: Story = {
  name: '10 · Lưu sửa → Xoá ghi chú thứ hai',
  render: () => <SwingDetail />,
  ...appStory({ ...TUAN_SW, setup: [...MOI, READ_TUAN, NOTE_1, NOTE_2, EDIT_1] }),
  play: askDelete2,
};

// Xác nhận Xoá là thao tác của chính bước 11 → làm trong play (DEL_2 chỉ dùng cho bước sau): ảnh có trợ giúp "Đã xoá ghi chú".
export const B11SauXoa: Story = {
  name: '11 · Xác nhận Xoá',
  render: () => <SwingDetail />,
  ...appStory({ ...TUAN_SW, setup: [...MOI, READ_TUAN, NOTE_1, NOTE_2, EDIT_1] }),
  play: async (ctx) => {
    await askDelete2(ctx);
    await click(screen.findByRole('button', { name: 'Xoá' }));
    await waitForElementToBeRemoved(() => screen.queryByText('Xoá ghi chú này?'));
    await ctx.canvas.findByText('Đã xoá ghi chú'); // xoá giả lập 0,6 s (DELAYS.save)
    await reveal(ctx.canvas.findByText('Ghi chú HLV'));
  },
};

// ── HLV phụ Hà ───────────────────────────────────────────────────────────────
export const B12HaChuaReview: Story = {
  name: '12 · HLV Hà → Nguyễn Minh Anh → tab Swing',
  render: () => <StudentDetail />,
  ...appStory({ as: 'c-ha', params: { id: 'p-minh' }, setup: DA_REVIEW }),
  play: ({ canvas }) => tab(canvas, /^Swing/),
};

export const B13HaXemGhiChu: Story = {
  name: '13 · HLV Hà mở swing Driver mới (không Sửa / Xoá)',
  render: () => <SwingDetail />,
  ...appStory({ as: 'c-ha', params: { id: SW }, setup: DA_REVIEW }),
  play: ({ canvas }) => reveal(canvas.findByText('Ghi chú HLV')),
};

// ── Học viên ─────────────────────────────────────────────────────────────────
export const B14HocVienNhanThongBao: Story = {
  name: '14 · Minh Anh → chuông',
  render: () => <Notifications />,
  ...appStory({ as: 'p-minh', setup: DA_REVIEW }),
};

export const B15TuaTheoMoc: Story = {
  name: '15 · Chạm thông báo → chip Tua tới 1,3 s',
  render: () => <SwingDetail />,
  ...appStory({ as: 'p-minh', params: { id: SW }, setup: DA_REVIEW }),
  play: ({ canvas }) => click(canvas.findByRole('button', { name: 'Tua tới 1,3 s' })),
};

// ── HLV Tuấn: Đã review / Chưa review ────────────────────────────────────────
export const B16DaReview: Story = {
  name: '16 · HLV Tuấn → Minh Anh → Swing → Đã review',
  render: () => <StudentDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'p-minh' }, setup: DA_REVIEW }),
  play: async ({ canvas }) => {
    await tab(canvas, /^Swing/);
    await tab(canvas, /^Đã review/);
  },
};

export const B17ChuaReview: Story = {
  name: '17 · Chưa review',
  render: () => <StudentDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'p-minh' }, setup: DA_REVIEW }),
  play: ({ canvas }) => tab(canvas, /^Swing/),
};

// ── Biến thể ─────────────────────────────────────────────────────────────────
export const ChuaCoGhiChu: Story = {
  name: '06a · Workspace — swing chưa có ghi chú nào',
  render: () => <SwingDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'sw-lan-1' } }),
  play: ({ canvas }) => reveal(canvas.findByText('Ghi chú HLV')),
};

export const DangViet: Story = {
  name: '07a · Tua tới mốc “Chạm bóng” rồi viết',
  render: () => <SwingDetail />,
  ...appStory({ as: 'c-ha', params: { id: 'sw-minh-1' } }),
  play: write(NOTE),
};

export const LoiTrong: Story = {
  name: '08a · Lỗi — ghi chú trống',
  render: () => <SwingDetail />,
  ...appStory({ as: 'c-ha', params: { id: 'sw-minh-1' } }),
  play: async ({ canvas }) => {
    await typeNote(canvas, '   ');
    await click(canvas.findByRole('button', { name: 'Gửi' }));
  },
};

export const KhongCoQuyen: Story = {
  name: '13a · HLV đã huỷ kết nối — không có quyền (403)',
  render: () => <SwingDetail />,
  ...appStory({ as: 'c-ha', params: { id: 'sw-lan-1' } }),
};

export const DaReviewRong: Story = {
  name: '16a · Đã review — rỗng (HLV phụ chưa ghi chú)',
  render: () => <StudentDetail />,
  ...appStory({ as: 'c-ha', params: { id: 'p-minh' } }),
  play: async ({ canvas }) => {
    await tab(canvas, /^Swing/);
    await tab(canvas, /^Đã review/);
  },
};
