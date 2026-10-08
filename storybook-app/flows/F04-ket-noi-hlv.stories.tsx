/**
 * F04 · Kết nối HLV–học viên
 *
 * Các bước (mỗi bước = một story; ✓ = đã có):
 *  ✓ 01  · HLV tạo mã mời                      connect/invite?code=TUAN24   as c-tuan
 *  ✓ 01a · HLV mở màn mời — chưa có lời mời     connect/invite               as c-ha (HAEXP1 đã hết hạn)
 *  ✓ 01b · HLV chia sẻ mã (ShareSheet)          connect/invite?code=TUAN24   as c-tuan + bấm Chia sẻ
 *  ✓ 01c · HLV thu hồi mã — dialog xác nhận     connect/invite?code=TUAN24   as c-tuan + bấm Thu hồi
 *  ✓ 01d · HLV thu hồi mã — đã thu hồi          connect/invite?code=TUAN24   as c-tuan, setup revokeInvite
 *  ✓ 02  · Học viên nhập mã                    connect/accept               as p-huy (chưa có HLV)
 *  ✓ 02a–02f · Lỗi mã: để trống / sai / hết hạn (HAEXP1) / đã dùng (USED01) / đã thu hồi (TUAN24 sau revokeInvite) / đã kết nối (p-minh + TUAN24)
 *  ✓ 03  · Xem trước HLV — sẽ là HLV chính      connect/accept + TUAN24 + Kiểm tra   as p-huy
 *  ✓ 03a · Xem trước HLV — sẽ là HLV phụ        connect/accept + TUAN24 + Kiểm tra   as p-khoa (HLV chính c-ha)
 *  ✓ 04  · Chấp nhận kết nối → toast           connect/accept               as p-huy
 *  ✓ 05  · Tab HLV — HLV chính + HLV khác       (player)/coach               as p-minh, tab coach
 *  ✓ 05a · Tab HLV — chưa kết nối               (player)/coach               as p-huy
 *  ✓ 05b · Đặt làm HLV chính                    (player)/coach               as p-minh + bấm Đặt c-ha làm HLV chính
 *  ✓ 05c · Huỷ kết nối — dialog                 (player)/coach               as p-minh + bấm Huỷ kết nối HLV chính
 *  ✓ 05d · Đã huỷ HLV chính — chưa có HLV chính (player)/coach               as p-minh, setup revokeConnection cn-tuan-minh
 *  ✓ 06  · Hồ sơ HLV                           coaches/[id]  id c-tuan      as p-minh (tag “HLV của bạn”)
 *  ✓ 06a · Hồ sơ HLV — không tìm thấy           coaches/[id]  id c-khong-co  as p-minh
 *
 * Chưa có (route không tồn tại — không dựng UI giả):
 *  - Lời mời 2 chiều (HLV gửi lời mời trong app, học viên nhận / từ chối) — Phase 2.
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fireEvent, screen, userEvent } from 'storybook/test';
import CreateInvite from '../../apps/golf/app/connect/invite';
import AcceptInvite from '../../apps/golf/app/connect/accept';
import PlayerCoach from '../../apps/golf/app/(player)/coach';
import CoachPublicProfile from '../../apps/golf/app/coaches/[id]';
import { appStory } from '../lib/appStory';

const meta = { title: 'Luồng/F04 · Kết nối HLV–học viên', id: 'f04' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = Parameters<NonNullable<Story['play']>>[0]['canvas'];

// Gõ vào TextField của RN-web: userEvent.type chỉ đổi giá trị DOM, onChangeText của React không chạy (state vẫn rỗng,
// bấm "Kiểm tra" báo "Nhập mã mời") → đặt giá trị bằng fireEvent.change để state của màn nhận mã.
const typeCode = (field: HTMLElement, code: string) => fireEvent.change(field, { target: { value: code } });

// Học viên gõ mã rồi bấm "Kiểm tra" (mã rỗng = chỉ bấm).
const checkCode = async (canvas: Canvas, code: string) => {
  const field = await canvas.findByPlaceholderText('Ví dụ: AB23CD');
  if (code) typeCode(field, code);
  await userEvent.click(await canvas.findByRole('button', { name: 'Kiểm tra' }));
};

export const HlvTaoMa: Story = {
  name: '01 · HLV tạo mã mời',
  render: () => <CreateInvite />,
  ...appStory({ as: 'c-tuan', params: { code: 'TUAN24' } }),
};

export const HlvChuaCoLoiMoi: Story = {
  name: '01a · HLV mở màn mời — chưa có lời mời',
  render: () => <CreateInvite />,
  ...appStory({ as: 'c-ha' }),
};

export const HlvChiaSeMa: Story = {
  name: '01b · HLV chia sẻ mã',
  render: () => <CreateInvite />,
  ...appStory({ as: 'c-tuan', params: { code: 'TUAN24' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByLabelText('Chia sẻ mã mời'));
  },
};

export const HlvThuHoiDialog: Story = {
  name: '01c · HLV thu hồi mã — dialog xác nhận',
  render: () => <CreateInvite />,
  ...appStory({ as: 'c-tuan', params: { code: 'TUAN24' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByLabelText('Thu hồi mã TUAN24'));
    await screen.findByText('Thu hồi mã TUAN24?');
  },
};

export const HlvDaThuHoi: Story = {
  name: '01d · HLV thu hồi mã — đã thu hồi',
  render: () => <CreateInvite />,
  ...appStory({ as: 'c-tuan', params: { code: 'TUAN24' }, setup: [{ type: 'revokeInvite', code: 'TUAN24' }] }),
};

export const HocVienNhapMa: Story = {
  name: '02 · Học viên nhập mã',
  render: () => <AcceptInvite />,
  ...appStory({ as: 'p-huy' }),
  play: async ({ canvas }) => {
    typeCode(await canvas.findByPlaceholderText('Ví dụ: AB23CD'), 'TUAN24');
  },
};

export const NhapMaDeTrong: Story = {
  name: '02a · Nhập mã — lỗi để trống',
  render: () => <AcceptInvite />,
  ...appStory({ as: 'p-huy' }),
  play: ({ canvas }) => checkCode(canvas, ''),
};

export const NhapMaSai: Story = {
  name: '02b · Nhập mã — lỗi mã không tồn tại',
  render: () => <AcceptInvite />,
  ...appStory({ as: 'p-huy' }),
  play: ({ canvas }) => checkCode(canvas, 'ZZ99ZZ'),
};

export const NhapMaHetHan: Story = {
  name: '02c · Nhập mã — lỗi mã hết hạn',
  render: () => <AcceptInvite />,
  ...appStory({ as: 'p-huy' }),
  play: ({ canvas }) => checkCode(canvas, 'HAEXP1'),
};

export const NhapMaDaDung: Story = {
  name: '02d · Nhập mã — lỗi mã đã dùng',
  render: () => <AcceptInvite />,
  ...appStory({ as: 'p-huy' }),
  play: ({ canvas }) => checkCode(canvas, 'USED01'),
};

export const NhapMaDaThuHoi: Story = {
  name: '02e · Nhập mã — lỗi mã đã thu hồi',
  render: () => <AcceptInvite />,
  ...appStory({ as: 'p-huy', setup: [{ type: 'revokeInvite', code: 'TUAN24' }] }),
  play: ({ canvas }) => checkCode(canvas, 'TUAN24'),
};

export const NhapMaDaKetNoi: Story = {
  name: '02f · Nhập mã — đã kết nối HLV này',
  render: () => <AcceptInvite />,
  ...appStory({ as: 'p-minh' }),
  play: ({ canvas }) => checkCode(canvas, 'TUAN24'),
};

export const XemTruocHlvChinh: Story = {
  name: '03 · Xem trước HLV — sẽ là HLV chính',
  render: () => <AcceptInvite />,
  ...appStory({ as: 'p-huy' }),
  play: ({ canvas }) => checkCode(canvas, 'TUAN24'),
};

export const XemTruocHlvPhu: Story = {
  name: '03a · Xem trước HLV — sẽ là HLV phụ',
  render: () => <AcceptInvite />,
  ...appStory({ as: 'p-khoa' }),
  play: ({ canvas }) => checkCode(canvas, 'TUAN24'),
};

export const ChapNhanKetNoi: Story = {
  name: '04 · Chấp nhận kết nối',
  render: () => <AcceptInvite />,
  ...appStory({ as: 'p-huy' }),
  play: async ({ canvas }) => {
    await checkCode(canvas, 'TUAN24');
    await userEvent.click(await canvas.findByRole('button', { name: 'Chấp nhận kết nối' }));
  },
};

export const TabHlv: Story = {
  name: '05 · Tab HLV — HLV chính và HLV khác',
  render: () => <PlayerCoach />,
  ...appStory({ as: 'p-minh', tabs: { role: 'player', active: 'coach' } }),
};

export const TabHlvChuaKetNoi: Story = {
  name: '05a · Tab HLV — chưa kết nối HLV',
  render: () => <PlayerCoach />,
  ...appStory({ as: 'p-huy', tabs: { role: 'player', active: 'coach' } }),
};

export const DatLamHlvChinh: Story = {
  name: '05b · Tab HLV — đặt làm HLV chính',
  render: () => <PlayerCoach />,
  ...appStory({ as: 'p-minh', tabs: { role: 'player', active: 'coach' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByLabelText('Đặt HLV Vũ Thanh Hà làm HLV chính'));
  },
};

export const HuyKetNoiDialog: Story = {
  name: '05c · Tab HLV — huỷ kết nối (dialog)',
  render: () => <PlayerCoach />,
  ...appStory({ as: 'p-minh', tabs: { role: 'player', active: 'coach' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByLabelText('Huỷ kết nối với HLV Đỗ Minh Tuấn'));
    await screen.findByText('Huỷ kết nối với HLV Đỗ Minh Tuấn?');
  },
};

export const DaHuyHlvChinh: Story = {
  name: '05d · Tab HLV — đã huỷ HLV chính',
  render: () => <PlayerCoach />,
  ...appStory({
    as: 'p-minh',
    tabs: { role: 'player', active: 'coach' },
    setup: [{ type: 'revokeConnection', id: 'cn-tuan-minh', at: '2026-10-07T08:00:00Z' }],
  }),
};

export const HoSoHlv: Story = {
  name: '06 · Hồ sơ HLV',
  render: () => <CoachPublicProfile />,
  ...appStory({ as: 'p-minh', params: { id: 'c-tuan' } }),
};

export const HoSoHlvKhongCo: Story = {
  name: '06a · Hồ sơ HLV — không tìm thấy',
  render: () => <CoachPublicProfile />,
  ...appStory({ as: 'p-minh', params: { id: 'c-khong-co' } }),
};
