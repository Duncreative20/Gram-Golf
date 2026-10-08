/**
 * F09 · HLV xem học viên
 *
 * Tài khoản: c-tuan (học viên p-minh có đủ dữ liệu, p-lan mới — 1 swing chờ phản hồi; lời mời TUAN24 đang chờ).
 *
 * Các bước (mỗi bước = một story; ✓ = đã có):
 *  ✓ 01  · Danh sách học viên — Tất cả          (coach)/roster               as c-tuan, tab roster
 *  ✓ 01a · Tìm học viên                          (coach)/roster + gõ “lan”
 *  ✓ 01b · Tìm học viên — không thấy             (coach)/roster + gõ “Quang”
 *  ✓ 02  · Lọc Cần phản hồi                      (coach)/roster + bấm Cần phản hồi
 *  ✓ 02a · Cần phản hồi — rỗng                   setup addNote cho sw-lan-1
 *  ✓ 03  · Lọc Lời mời                           (coach)/roster + bấm Lời mời
 *  ✓ 03a · Lời mời — rỗng                        setup revokeInvite TUAN24
 *  ✓ 04  · Chưa có học viên                      setup revokeConnection cn-tuan-minh, cn-tuan-lan
 *  ✓ 05  · Chi tiết học viên — Tổng quan         students/[id]  id p-minh   as c-tuan
 *  ✓ 05a · Tổng quan — học viên chưa có dữ liệu  students/[id]  id p-lan
 *  ✓ 06  · Tab Thông số                          + bấm tab Thông số
 *  ✓ 07  · Tab Swing                             + bấm tab Swing
 *  ✓ 07a · Tab Swing — swing cần phản hồi        id p-lan (badge trên tab)
 *  ✓ 08  · Tab Bộ gậy                            + bấm tab Bộ gậy
 *  ✓ 09  · Tab Thể lực                           + bấm tab Thể lực
 *  ✓ 10  · Không có quyền — kết nối đã huỷ       students/[id]  id p-lan   as c-ha (cn-ha-lan revoked)
 *  ✓ 10a · Không có quyền — người theo dõi       students/[id]  id p-minh  as p-khoa (theo dõi, không kết nối)
 *  ✓ 10b · Không tìm thấy học viên               students/[id]  id p-khong-co
 *
 * Chưa có (route không tồn tại — không dựng UI giả): —
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fireEvent, userEvent } from 'storybook/test';
import CoachRoster from '../../apps/golf/app/(coach)/roster';
import StudentDetail from '../../apps/golf/app/students/[id]';
import { appStory } from '../lib/appStory';

const meta = { title: 'Luồng/F09 · HLV xem học viên', id: 'f09' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
type Play = NonNullable<Story['play']>;

const roster = { as: 'c-tuan', tabs: { role: 'coach', active: 'roster' } } as const;
// Bấm một tab (Segmented ở roster / TabBar ở chi tiết học viên) theo nhãn — tên có thể kèm số badge.
const tab = (label: string): Play => async ({ canvas }) => {
  await userEvent.click(await canvas.findByRole('tab', { name: new RegExp(`^${label}`) }));
};
// Ô nhập RN-web: userEvent.type chỉ đổi giá trị DOM (onChangeText không chạy) → fireEvent.change.
const search = (q: string): Play => async ({ canvas }) => {
  fireEvent.change(await canvas.findByPlaceholderText('Tìm học viên'), { target: { value: q } });
};

export const DanhSach: Story = {
  name: '01 · Danh sách học viên',
  render: () => <CoachRoster />,
  ...appStory(roster),
};

export const TimHocVien: Story = {
  name: '01a · Tìm học viên',
  render: () => <CoachRoster />,
  ...appStory(roster),
  play: search('lan'),
};

export const TimKhongThay: Story = {
  name: '01b · Tìm học viên — không thấy',
  render: () => <CoachRoster />,
  ...appStory(roster),
  play: search('Quang'),
};

export const CanPhanHoi: Story = {
  name: '02 · Lọc Cần phản hồi',
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
  name: '03 · Lọc Lời mời',
  render: () => <CoachRoster />,
  ...appStory(roster),
  play: tab('Lời mời'),
};

export const LoiMoiRong: Story = {
  name: '03a · Lời mời — rỗng',
  render: () => <CoachRoster />,
  ...appStory({ ...roster, setup: [{ type: 'revokeInvite', code: 'TUAN24' }] }),
  play: tab('Lời mời'),
};

export const ChuaCoHocVien: Story = {
  name: '04 · Chưa có học viên',
  render: () => <CoachRoster />,
  ...appStory({
    ...roster,
    setup: [
      { type: 'revokeConnection', id: 'cn-tuan-minh', at: '2026-10-07T08:00:00Z' },
      { type: 'revokeConnection', id: 'cn-tuan-lan', at: '2026-10-07T08:00:00Z' },
    ],
  }),
};

const minh = { as: 'c-tuan', params: { id: 'p-minh' } };

export const TongQuan: Story = {
  name: '05 · Chi tiết học viên — Tổng quan',
  render: () => <StudentDetail />,
  ...appStory(minh),
};

export const TongQuanRong: Story = {
  name: '05a · Tổng quan — học viên chưa có dữ liệu',
  render: () => <StudentDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'p-lan' } }),
};

export const ThongSo: Story = {
  name: '06 · Tab Thông số',
  render: () => <StudentDetail />,
  ...appStory(minh),
  play: tab('Thông số'),
};

export const Swing: Story = {
  name: '07 · Tab Swing',
  render: () => <StudentDetail />,
  ...appStory(minh),
  play: tab('Swing'),
};

export const SwingCanPhanHoi: Story = {
  name: '07a · Tab Swing — swing cần phản hồi',
  render: () => <StudentDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'p-lan' } }),
  play: tab('Swing'),
};

export const BoGay: Story = {
  name: '08 · Tab Bộ gậy',
  render: () => <StudentDetail />,
  ...appStory(minh),
  play: tab('Bộ gậy'),
};

export const TheLuc: Story = {
  name: '09 · Tab Thể lực',
  render: () => <StudentDetail />,
  ...appStory(minh),
  play: tab('Thể lực'),
};

export const KhongQuyenDaHuy: Story = {
  name: '10 · Không có quyền — kết nối đã huỷ',
  render: () => <StudentDetail />,
  ...appStory({ as: 'c-ha', params: { id: 'p-lan' } }),
};

export const KhongQuyenNguoiTheoDoi: Story = {
  name: '10a · Không có quyền — người theo dõi',
  render: () => <StudentDetail />,
  ...appStory({ as: 'p-khoa', params: { id: 'p-minh' } }),
};

export const KhongTimThay: Story = {
  name: '10b · Không tìm thấy học viên',
  render: () => <StudentDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'p-khong-co' } }),
};
