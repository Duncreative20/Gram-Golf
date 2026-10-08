/**
 * F08 · HLV review swing
 *
 * Tài khoản: c-ha (HLV Vũ Thanh Hà — HLV phụ của p-minh; 2 swing của Minh Anh đã phân tích mà Hà chưa ghi chú → “Cần phản hồi”,
 * ghi chú của HLV Tuấn không tính). 03a dùng c-tuan + swing của p-lan (chưa ai ghi chú). 05: p-minh xem ghi chú HLV.
 * (Luồng F09 dùng c-tuan cho roster / chi tiết học viên — F08 cố ý dùng c-ha để không trùng ảnh.)
 *
 * Các bước (mỗi bước = một story; ✓ = đã có):
 *  ✓ 01 · Học viên — lọc “Cần phản hồi”             (coach)/roster              as c-ha, tab roster, play: lọc Cần phản hồi
 *  ✓ 02 · Chi tiết học viên — tab Swing              students/[id] p-minh       as c-ha, play: tab Swing
 *  ✓ 03 · Swing của học viên — ô ghi chú theo mốc    swings/[id] sw-minh-1       as c-ha (đã có ghi chú của HLV Tuấn)
 *  ✓ 03a · Chưa có ghi chú nào                       swings/[id] sw-lan-1        as c-tuan
 *  ✓ 03b · Tua tới mốc “Chạm bóng” rồi viết ghi chú  swings/[id] sw-minh-1       play: bấm mốc → gõ
 *  ✓ 03c · Lỗi — ghi chú trống                       swings/[id] sw-minh-1       play: gõ khoảng trắng → Gửi
 *  ✓ 04 · Đã gửi ghi chú                             swings/[id] sw-minh-1       play: bấm mốc → gõ → Gửi
 *  ✓ 04a · HLV đã huỷ kết nối — không có quyền (403) swings/[id] sw-lan-1        as c-ha (kết nối cn-ha-lan đã huỷ)
 *  ✓ 05 · Học viên xem ghi chú — bấm mốc             swings/[id] sw-minh-1       as p-minh + ghi chú của c-ha, play: bấm ghi chú
 *
 * Chưa có (route không tồn tại — không dựng UI giả):
 *  - Sửa / xoá ghi chú HLV — Phase 2 (ghi chú chỉ thêm được).
 *  - Ghi chú vẽ / đánh dấu trên khung hình video — Phase 2.
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fireEvent, userEvent } from 'storybook/test';
import CoachRoster from '../../apps/golf/app/(coach)/roster';
import StudentDetail from '../../apps/golf/app/students/[id]';
import SwingDetail from '../../apps/golf/app/swings/[id]';
import { NOW } from '../../apps/golf/lib/mock';
import { appStory } from '../lib/appStory';

const meta = { title: 'Luồng/F08 · HLV review swing', id: 'f08' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
type Play = NonNullable<Story['play']>;

const NOTE = 'Chạm bóng: hông mở tốt nhưng đầu nhấc sớm — giữ mắt ở bóng thêm nửa nhịp.';
const click = (el: Promise<HTMLElement>) => el.then((e) => userEvent.click(e));
// Gõ vào ô ghi chú bằng fireEvent.input (setter gốc + sự kiện input), KHÔNG dùng userEvent.type: trong Chrome headless khi chụp,
// userEvent.type vào MessageInput để chữ hiện trong ô nhưng React không nhận onChange (state rỗng → không có nút Gửi). Xem issues/D.md.
const typeNote = async (canvas: Parameters<Play>[0]['canvas'], text: string) =>
  fireEvent.input(await canvas.findByPlaceholderText(/^Ghi chú tại/), { target: { value: text } });
const write = (text: string): Play => async ({ canvas }) => {
  await click(canvas.findByRole('button', { name: /^Chạm bóng, 1,6 ?s$/ }));
  await typeNote(canvas, text);
};

export const CanPhanHoi: Story = {
  name: '01 · Học viên — lọc “Cần phản hồi”',
  render: () => <CoachRoster />,
  ...appStory({ as: 'c-ha', tabs: { role: 'coach', active: 'roster' } }),
  play: async ({ canvas }) => {
    await click(canvas.findByRole('tab', { name: /^Cần phản hồi/ }));
  },
};

export const TabSwing: Story = {
  name: '02 · Chi tiết học viên — tab Swing',
  render: () => <StudentDetail />,
  ...appStory({ as: 'c-ha', params: { id: 'p-minh' } }),
  play: async ({ canvas }) => {
    await click(canvas.findByRole('tab', { name: /^Swing/ }));
  },
};

export const SwingHocVien: Story = {
  name: '03 · Swing của học viên — ô ghi chú theo mốc',
  render: () => <SwingDetail />,
  ...appStory({ as: 'c-ha', params: { id: 'sw-minh-1' } }),
};

export const ChuaCoGhiChu: Story = {
  name: '03a · Swing chưa có ghi chú nào',
  render: () => <SwingDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'sw-lan-1' } }),
};

export const DangViet: Story = {
  name: '03b · Tua tới mốc “Chạm bóng” rồi viết ghi chú',
  render: () => <SwingDetail />,
  ...appStory({ as: 'c-ha', params: { id: 'sw-minh-1' } }),
  play: write(NOTE),
};

export const LoiTrong: Story = {
  name: '03c · Lỗi — ghi chú trống',
  render: () => <SwingDetail />,
  ...appStory({ as: 'c-ha', params: { id: 'sw-minh-1' } }),
  play: async ({ canvas }) => {
    await typeNote(canvas, '   ');
    await click(canvas.findByRole('button', { name: 'Gửi' }));
  },
};

export const DaGui: Story = {
  name: '04 · Đã gửi ghi chú',
  render: () => <SwingDetail />,
  ...appStory({ as: 'c-ha', params: { id: 'sw-minh-1' } }),
  play: async (ctx) => {
    await write(NOTE)(ctx);
    await click(ctx.canvas.findByRole('button', { name: 'Gửi' }));
  },
};

export const KhongCoQuyen: Story = {
  name: '04a · HLV đã huỷ kết nối — không có quyền (403)',
  render: () => <SwingDetail />,
  ...appStory({ as: 'c-ha', params: { id: 'sw-lan-1' } }),
};

export const HocVienXemGhiChu: Story = {
  name: '05 · Học viên xem ghi chú — bấm mốc',
  render: () => <SwingDetail />,
  ...appStory({
    as: 'p-minh',
    params: { id: 'sw-minh-1' },
    // ghi chú HLV Hà vừa gửi ở bước 04 (id / thời điểm cố định)
    setup: [{ type: 'addNote', note: { id: 'note-sb-ha', swingId: 'sw-minh-1', coachId: 'c-ha', atSec: 1.62, text: NOTE, createdAt: NOW }, notificationId: 'nt-sb-ha' }],
  }),
  play: async ({ canvas }) => {
    await click(canvas.findByRole('button', { name: /^HLV Vũ Thanh Hà/ }));
  },
};
