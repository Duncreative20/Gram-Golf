/**
 * F09 · HLV xem học viên — kịch bản: docs/flows/F09/steps.json, storyboard: docs/flows/F09.md
 *
 * Tài khoản: c-tuan (học viên p-minh có đủ dữ liệu, p-lan mới — 1 swing chờ phản hồi; lời mời TUAN24 đang chờ). Luồng chỉ đọc: không bước nào
 * ghi dữ liệu nên story không có `setup` (trừ biến thể dựng trạng thái rỗng). Bước 10–13 mở thẳng link với tài khoản không có quyền.
 *
 * Các bước (mỗi bước shot = một story `f09--b-<nn>-<slug>`; ✓ = đã có):
 *  ✓ 01 · Tìm “lan”                              (coach)/roster              as c-tuan, tab roster, play: gõ “lan”
 *  ✓ 02 · Cần phản hồi                           (coach)/roster              play: bấm Cần phản hồi
 *  ✓ 03 · Nguyễn Minh Anh — Tổng quan            students/[id] p-minh        as c-tuan
 *  ✓ 04 · Tab Thông số                           students/[id] p-minh        play: tab Thông số
 *  ✓ 05 · Phiên Gỗ 3 chỉ đọc                     metrics/[id] ss-w1          as c-tuan (không Sửa / Xoá)
 *  ✓ 06 · Tab Swing                              students/[id] p-minh        play: tab Swing
 *  ✓ 07 · Tab Bộ gậy                             students/[id] p-minh        play: tab Bộ gậy
 *  ✓ 08 · Driver chỉ đọc                         clubs/[id]/index cl-driver  as c-tuan (không Sửa / Lưu trữ / Xoá)
 *  ✓ 09 · Tab Thể lực                            students/[id] p-minh        play: tab Thể lực
 *  ✓ 10 · 403 — người theo dõi                   students/[id] p-minh        as p-khoa (theo dõi, không kết nối)
 *  ✓ 11 · 403 — kết nối đã huỷ                   students/[id] p-lan         as c-ha (cn-ha-lan revoked)
 *  ✓ 12 · 403 — swing của Minh Anh               swings/[id] sw-minh-1       as p-khoa
 *  ✓ 13 · 404 — học viên không tồn tại           students/[id] khong-co      as c-tuan
 * Biến thể:
 *  ✓ 01a · Danh sách học viên                    (coach)/roster
 *  ✓ 01b · Tìm — không thấy                      (coach)/roster + gõ “Quang”
 *  ✓ 02a · Cần phản hồi — rỗng                   setup addNote cho sw-lan-1
 *  ✓ 02b · Lọc Lời mời                           (coach)/roster + bấm Lời mời
 *  ✓ 02c · Lời mời — rỗng                        setup revokeInvite TUAN24
 *  ✓ 02d · Chưa có học viên                      setup revokeConnection cn-tuan-minh, cn-tuan-lan
 *  ✓ 03a · Tổng quan — học viên chưa có dữ liệu  students/[id] p-lan
 *  ✓ 06a · Tab Swing — swing cần phản hồi        students/[id] p-lan (badge trên tab)
 *
 * Chưa có: —
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { userEvent } from 'storybook/test';
import CoachRoster from '../../apps/golf/app/(coach)/roster';
import StudentDetail from '../../apps/golf/app/students/[id]';
import MetricSessionDetail from '../../apps/golf/app/metrics/[id]';
import ClubDetail from '../../apps/golf/app/clubs/[id]/index';
import SwingDetail from '../../apps/golf/app/swings/[id]';
import { appStory, typeIn } from '../lib/appStory';

const meta = { title: 'Luồng/F09 · HLV xem học viên', id: 'f09' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
type Play = NonNullable<Story['play']>;

const roster = { as: 'c-tuan', tabs: { role: 'coach', active: 'roster' } } as const;
// Bấm một tab (Segmented ở roster / TabBar ở chi tiết học viên) theo nhãn — tên có thể kèm số badge.
const tab = (label: string): Play => async ({ canvas }) => {
  await userEvent.click(await canvas.findByRole('tab', { name: new RegExp(`^${label}`) }));
};
const search = (q: string): Play => async ({ canvas }) => typeIn(await canvas.findByPlaceholderText('Tìm học viên'), q);
const minh = { as: 'c-tuan', params: { id: 'p-minh' } };

// ── Học viên (roster) ───────────────────────────────────────────────────────
export const B01Tim: Story = {
  name: '01 · Học viên → gõ “lan”',
  render: () => <CoachRoster />,
  ...appStory(roster),
  play: search('lan'),
};

export const DanhSach: Story = {
  name: '01a · Danh sách học viên',
  render: () => <CoachRoster />,
  ...appStory(roster),
};

export const TimKhongThay: Story = {
  name: '01b · Tìm — không thấy',
  render: () => <CoachRoster />,
  ...appStory(roster),
  play: search('Quang'),
};

export const B02CanPhanHoi: Story = {
  name: '02 · Xoá ô tìm → Cần phản hồi',
  render: () => <CoachRoster />,
  ...appStory(roster),
  play: tab('Cần phản hồi'),
};

export const CanPhanHoiRong: Story = {
  name: '02a · Cần phản hồi — rỗng',
  render: () => <CoachRoster />,
  ...appStory({
    ...roster,
    setup: [
      {
        type: 'addNote',
        note: { id: 'note-sb-lan', swingId: 'sw-lan-1', coachId: 'c-tuan', atSec: 1.2, text: 'Giữ đầu ổn định hơn ở đỉnh backswing.', createdAt: '2026-10-07T07:00:00Z' },
        notificationId: 'nt-sb-lan',
      },
    ],
  }),
  play: tab('Cần phản hồi'),
};

export const LoiMoi: Story = {
  name: '02b · Lọc Lời mời',
  render: () => <CoachRoster />,
  ...appStory(roster),
  play: tab('Lời mời'),
};

export const LoiMoiRong: Story = {
  name: '02c · Lời mời — rỗng',
  render: () => <CoachRoster />,
  ...appStory({ ...roster, setup: [{ type: 'revokeInvite', code: 'TUAN24' }] }),
  play: tab('Lời mời'),
};

export const ChuaCoHocVien: Story = {
  name: '02d · Chưa có học viên',
  render: () => <CoachRoster />,
  ...appStory({
    ...roster,
    setup: [
      { type: 'revokeConnection', id: 'cn-tuan-minh', at: '2026-10-07T08:00:00Z' },
      { type: 'revokeConnection', id: 'cn-tuan-lan', at: '2026-10-07T08:00:00Z' },
    ],
  }),
};

// ── Chi tiết học viên — 5 tab chỉ đọc ──────────────────────────────────────
export const B03TongQuan: Story = {
  name: '03 · Tất cả → Nguyễn Minh Anh (Tổng quan)',
  render: () => <StudentDetail />,
  ...appStory(minh),
};

export const TongQuanRong: Story = {
  name: '03a · Tổng quan — học viên chưa có dữ liệu',
  render: () => <StudentDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'p-lan' } }),
};

export const B04ThongSo: Story = {
  name: '04 · Tab Thông số',
  render: () => <StudentDetail />,
  ...appStory(minh),
  play: tab('Thông số'),
};

export const B05PhienChiDoc: Story = {
  name: '05 · Chạm phiên Gỗ 3 — chỉ đọc',
  render: () => <MetricSessionDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'ss-w1' } }),
};

export const B06Swing: Story = {
  name: '06 · Tab Swing',
  render: () => <StudentDetail />,
  ...appStory(minh),
  play: tab('Swing'),
};

export const SwingCanPhanHoi: Story = {
  name: '06a · Tab Swing — swing cần phản hồi',
  render: () => <StudentDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'p-lan' } }),
  play: tab('Swing'),
};

export const B07BoGay: Story = {
  name: '07 · Tab Bộ gậy',
  render: () => <StudentDetail />,
  ...appStory(minh),
  play: tab('Bộ gậy'),
};

export const B08GayChiDoc: Story = {
  name: '08 · Chạm Driver — chỉ đọc',
  render: () => <ClubDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'cl-driver' } }),
};

export const B09TheLuc: Story = {
  name: '09 · Tab Thể lực',
  render: () => <StudentDetail />,
  ...appStory(minh),
  play: tab('Thể lực'),
};

// ── Mở thẳng link khi không có quyền (403) / không tồn tại (404) ───────────
export const B10_403NguoiTheoDoi: Story = {
  name: '10 · Người theo dõi mở /students/p-minh — 403',
  render: () => <StudentDetail />,
  ...appStory({ as: 'p-khoa', params: { id: 'p-minh' } }),
};

export const B11_403DaHuy: Story = {
  name: '11 · HLV Hà mở /students/p-lan (đã huỷ) — 403',
  render: () => <StudentDetail />,
  ...appStory({ as: 'c-ha', params: { id: 'p-lan' } }),
};

export const B12_403Swing: Story = {
  name: '12 · Người theo dõi mở swing của Minh Anh — 403',
  render: () => <SwingDetail />,
  ...appStory({ as: 'p-khoa', params: { id: 'sw-minh-1' } }),
};

export const B13_404HocVien: Story = {
  name: '13 · Học viên không tồn tại — 404',
  render: () => <StudentDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'khong-co' } }),
};
