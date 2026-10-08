/**
 * F06 · Bộ gậy
 *
 * Tài khoản: p-minh (8 gậy, có swing + phiên gắn gậy). Rỗng: p-huy. HLV chỉ đọc: c-tuan (kết nối active với p-minh).
 * 403: c-ha xem p-lan (kết nối cn-ha-lan đã huỷ trong seed) / c-ha xem gậy p-minh sau khi huỷ cn-ha-minh.
 *
 * Các bước (mỗi bước = một story; ✓ = đã có):
 *  ✓ 01  · Danh sách theo nhóm                 clubs/index                     as p-minh
 *  ✓ 01a · Danh sách rỗng                      clubs/index                     as p-huy
 *  ✓ 01b · Bộ gậy trong tab Thông số           (player)/metrics + segment Bộ gậy, tab metrics
 *  ✓ 02  · Thêm gậy — form trống               clubs/new                       as p-minh
 *  ✓ 02a · Thêm gậy — lỗi validate             clubs/new + Loft 70, Lie "abc" + Lưu
 *  ✓ 02b · Thêm gậy — chọn loại (sheet)        clubs/new + bấm Loại gậy
 *  ✓ 02c · Thêm gậy — wedge có bounce          clubs/new + chọn SW
 *  ✓ 02d · Thêm gậy — tuỳ chỉnh                clubs/new + chọn Tuỳ chỉnh + tên gậy
 *  ✓ 03  · Chi tiết gậy                        clubs/[id] cl-driver
 *  ✓ 04  · Sửa gậy                             clubs/[id]/edit cl-driver
 *  ✓ 04a · Sửa gậy đã lưu trữ → về chi tiết    clubs/[id]/edit cl-driver, archiveClub (guard Redirect)
 *  ✓ 05  · Dialog lưu trữ                      clubs/[id] cl-driver + Lưu trữ gậy
 *  ✓ 05a · Gậy đã lưu trữ                      clubs/[id] cl-driver, archiveClub
 *  ✓ 06  · HLV xem bộ gậy học viên (chỉ đọc)   clubs/index?playerId=p-minh     as c-tuan
 *  ✓ 06a · HLV xem chi tiết gậy (chỉ đọc)      clubs/[id] cl-driver            as c-tuan
 *  ✓ 07  · Không quyền — bộ gậy (403)          clubs/index?playerId=p-lan      as c-ha
 *  ✓ 07a · Không quyền — chi tiết gậy (403)    clubs/[id] cl-driver            as c-ha, huỷ cn-ha-minh
 *  ✓ 07b · Không tìm thấy gậy                  clubs/[id] cl-khong-co
 *
 * Chưa có (route không tồn tại — không dựng UI giả):
 *  - Danh sách gậy đã lưu trữ + khôi phục gậy — Phase 2 (hiện chỉ lưu trữ một chiều; gậy lưu trữ chỉ mở được qua link chi tiết).
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fireEvent, userEvent, within } from 'storybook/test';
import Clubs from '../../apps/golf/app/clubs/index';
import ClubNew from '../../apps/golf/app/clubs/new';
import ClubDetail from '../../apps/golf/app/clubs/[id]/index';
import ClubEdit from '../../apps/golf/app/clubs/[id]/edit';
import PlayerMetrics from '../../apps/golf/app/(player)/metrics';
import { appStory } from '../lib/appStory';

// Dialog / sheet trong ảnh chụp: .storybook/shot.css.
const meta = { title: 'Luồng/F06 · Bộ gậy', id: 'f06' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

// Gõ vào ô nhập: userEvent.type chỉ đổi DOM, không tới onChangeText của TextInput react-native-web (render sau trả ô về rỗng) → dùng fireEvent.change.
type Canvas = { findByLabelText: (label: string) => Promise<HTMLElement> };
const fill = async (canvas: Canvas, label: string, value: string) => {
  fireEvent.change(await canvas.findByLabelText(label), { target: { value } });
};
// BottomSheet chọn loại gậy là Modal → vẽ ngoài #storybook-root: mở bằng ô Loại gậy, chọn trong body.
const pickType = async (canvas: { findByRole: (role: string, o: { name: string }) => Promise<HTMLElement> }, canvasElement: HTMLElement, type: string) => {
  await userEvent.click(await canvas.findByRole('combobox', { name: 'Loại gậy, chưa chọn' }));
  await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole('radio', { name: type }));
};

const ARCHIVE_DRIVER = [{ type: 'archiveClub' as const, id: 'cl-driver', at: '2026-10-07T08:00:00Z' }];

export const DanhSach: Story = {
  name: '01 · Danh sách theo nhóm',
  render: () => <Clubs />,
  ...appStory({ as: 'p-minh' }),
};

export const DanhSachRong: Story = {
  name: '01a · Danh sách rỗng',
  render: () => <Clubs />,
  ...appStory({ as: 'p-huy' }),
};

export const TabThongSo: Story = {
  name: '01b · Bộ gậy trong tab Thông số',
  render: () => <PlayerMetrics />,
  ...appStory({ as: 'p-minh', tabs: { role: 'player', active: 'metrics' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('tab', { name: /Bộ gậy/ }));
  },
};

export const ThemGay: Story = {
  name: '02 · Thêm gậy — form trống',
  render: () => <ClubNew />,
  ...appStory({ as: 'p-minh' }),
};

export const ThemGayLoi: Story = {
  name: '02a · Thêm gậy — lỗi validate',
  render: () => <ClubNew />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await fill(canvas, 'Hãng', 'TaylorMade');
    await fill(canvas, 'Loft (°)', '70');
    await fill(canvas, 'Lie (°)', 'abc');
    await userEvent.click(await canvas.findByRole('button', { name: 'Lưu' }));
  },
};

export const ThemGayChonLoai: Story = {
  name: '02b · Thêm gậy — chọn loại gậy',
  render: () => <ClubNew />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('combobox', { name: 'Loại gậy, chưa chọn' }));
  },
};

export const ThemGayWedge: Story = {
  name: '02c · Thêm gậy — wedge có bounce',
  render: () => <ClubNew />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas, canvasElement }) => {
    await pickType(canvas, canvasElement, 'SW');
  },
};

export const ThemGayTuyChinh: Story = {
  name: '02d · Thêm gậy — tuỳ chỉnh',
  render: () => <ClubNew />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas, canvasElement }) => {
    await pickType(canvas, canvasElement, 'Tuỳ chỉnh');
    await fill(canvas, 'Tên gậy', 'Chipper 37°');
  },
};

export const ChiTiet: Story = {
  name: '03 · Chi tiết gậy',
  render: () => <ClubDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'cl-driver' } }),
};

export const SuaGay: Story = {
  name: '04 · Sửa gậy',
  render: () => <ClubEdit />,
  ...appStory({ as: 'p-minh', params: { id: 'cl-driver' } }),
};

export const SuaGayDaLuuTru: Story = {
  name: '04a · Sửa gậy đã lưu trữ — về chi tiết',
  render: () => <ClubEdit />,
  ...appStory({ as: 'p-minh', params: { id: 'cl-driver' }, setup: ARCHIVE_DRIVER }),
};

export const LuuTruDialog: Story = {
  name: '05 · Dialog lưu trữ gậy',
  render: () => <ClubDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'cl-driver' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Lưu trữ gậy' }));
  },
};

export const DaLuuTru: Story = {
  name: '05a · Gậy đã lưu trữ',
  render: () => <ClubDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'cl-driver' }, setup: ARCHIVE_DRIVER }),
};

export const HlvXemBoGay: Story = {
  name: '06 · HLV xem bộ gậy học viên',
  render: () => <Clubs />,
  ...appStory({ as: 'c-tuan', params: { playerId: 'p-minh' } }),
};

export const HlvXemChiTiet: Story = {
  name: '06a · HLV xem chi tiết gậy',
  render: () => <ClubDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'cl-driver' } }),
};

export const KhongQuyenBoGay: Story = {
  name: '07 · Không quyền — bộ gậy (403)',
  render: () => <Clubs />,
  ...appStory({ as: 'c-ha', params: { playerId: 'p-lan' } }),
};

export const KhongQuyenChiTiet: Story = {
  name: '07a · Không quyền — chi tiết gậy (403)',
  render: () => <ClubDetail />,
  ...appStory({ as: 'c-ha', params: { id: 'cl-driver' }, setup: [{ type: 'revokeConnection', id: 'cn-ha-minh', at: '2026-10-07T08:00:00Z' }] }),
};

export const KhongTimThay: Story = {
  name: '07b · Không tìm thấy gậy',
  render: () => <ClubDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'cl-khong-co' } }),
};
