/**
 * F04 · Kết nối HLV–học viên — mỗi bước `shot` của docs/flows/F04/steps.json = một story `B<nn>…` (id `f04--b-<nn>-<slug>`);
 * story `<nn><a|b…>` = trạng thái khác của bước gần nhất. Mã ngẫu nhiên của lượt CDP thay bằng mã cố định TUAN77 (Tuấn) / HAMR27 (Hà).
 *
 * Các bước (✓ = có story):
 *  ✓ 01 · HLV Tuấn mở tab Học viên               (coach)/roster                as c-tuan
 *  ✓ 02 · Lời mời                                (coach)/roster ?seg=loi-moi   as c-tuan
 *  ✓ 03 · Mời học viên → Tạo mã mời              connect/invite ?code=TUAN77   as c-tuan
 *  ✓ 03a–03c · chia sẻ (ShareSheet) / HLV chưa có mã / thu hồi — dialog
 *  ✓ 04 · Tìm học viên “huy”                     connect/invite                as c-tuan (đã thu hồi TUAN24)
 *  ✓ 04a · Không có kết quả
 *  ✓ 05 · Gửi lời mời → toast                    connect/invite                as c-tuan
 *  ✓ 06 · Thông báo lời mời                      notifications                 as p-huy
 *  ✓ 07 · Tab HLV — Lời mời từ HLV               (player)/coach                as p-huy
 *  ✓ 07a–07b · chưa có HLV (Tìm HLV) / đã từ chối lời mời
 *  ✓ 08 · Chấp nhận lời mời → HLV chính          (player)/coach                as p-huy
 *  ✓ 09 · HLV nhận thông báo                     (coach)/inbox                 as c-tuan
 *  ✓ 10 · Chi tiết học viên (nút Huỷ kết nối)    students/[id] p-huy           as c-tuan
 *  ✓ 11 · Hồ sơ HLV — Gửi yêu cầu kết nối        coaches/[id] c-tuan           as p-khoa
 *  ✓ 11a–11d · HLV của bạn / HLV đang mời bạn / không tìm thấy / chặn HLV đang mời — dialog
 *  ✓ 12 · Đã gửi yêu cầu                         coaches/[id] c-tuan           as p-khoa
 *  ✓ 13 · HLV duyệt yêu cầu                      (coach)/roster ?seg=loi-moi   as c-tuan
 *  ✓ 13a–13b · HLV đã mời, chờ học viên / Lời mời trống
 *  ✓ 14 · Roster có Huy + Khoa                   (coach)/roster                as c-tuan
 *  ✓ 15 · Đặt Tuấn làm HLV chính                 (player)/coach                as p-khoa
 *  ✓ 15a · HLV chính + HLV khác (dữ liệu mẫu)
 *  ✓ 16–20 · Nhập mã: sai / hết hạn / đã dùng / đã thu hồi / đã kết nối      connect/accept   as p-khoa
 *  ✓ 16a · để trống
 *  ✓ 21 · HLV Hà — yêu cầu mẫu của Huy           (coach)/roster ?seg=loi-moi   as c-ha
 *  ✓ 22 · Xem trước HLV phụ (mã HAMR27)          connect/accept                as p-huy
 *  ✓ 22a · Xem trước — sẽ là HLV chính
 *  ✓ 23 · Hai HLV                                (player)/coach                as p-huy
 *  ✓ 23a · Chấp nhận kết nối — toast
 *  ✓ 24 · HLV Hà nhận thông báo                  (coach)/inbox                 as c-ha
 *  ✓ 25 · Roster của Hà có Huy                   (coach)/roster                as c-ha
 *  ✓ 26 · Học viên huỷ HLV Hà → toast            (player)/coach                as p-huy
 *  ✓ 26a–26b · dialog / đã huỷ HLV chính
 *  ✓ 27 · Roster của Hà mất Huy                  (coach)/roster                as c-ha
 *  ✓ 28 · HLV Hà mở lại học viên → 403           students/[id] p-huy           as c-ha
 *  ✓ 29 · HLV Tuấn huỷ kết nối — dialog          students/[id] p-huy           as c-tuan
 *  ✓ 30 · Ngay sau khi huỷ → 403                 students/[id] p-huy           as c-tuan
 *  ✓ 31 · Roster sau huỷ                         (coach)/roster                as c-tuan
 *
 * Chưa có: không.
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { screen, userEvent } from 'storybook/test';
import { NOW } from '../../apps/golf/lib/mock';
import type { Action } from '../../apps/golf/lib/reducer';
import CreateInvite from '../../apps/golf/app/connect/invite';
import AcceptInvite from '../../apps/golf/app/connect/accept';
import PlayerCoach from '../../apps/golf/app/(player)/coach';
import CoachPublicProfile from '../../apps/golf/app/coaches/[id]';
import CoachRoster from '../../apps/golf/app/(coach)/roster';
import CoachInbox from '../../apps/golf/app/(coach)/inbox';
import Notifications from '../../apps/golf/app/notifications';
import StudentDetail from '../../apps/golf/app/students/[id]';
import { appStory, typeIn } from '../lib/appStory';

const meta = { title: 'Luồng/F04 · Kết nối HLV–học viên', id: 'f04' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = Parameters<NonNullable<Story['play']>>[0]['canvas'];

// Thao tác ghi dữ liệu ở các bước trước (id / mã cố định thay cho giá trị ngẫu nhiên của lượt CDP)
const EXP = '2026-10-14T08:00:00Z';
const INV_TUAN = { type: 'createInvite', invite: { code: 'TUAN77', coachId: 'c-tuan', createdAt: NOW, expiresAt: EXP } } as const; // thay ${code} của lượt CDP
const REVOKE_TUAN24 = { type: 'revokeInvite', code: 'TUAN24' } as const;
const REQ_TUAN_HUY = { type: 'requestConnection', id: 'rq-tuan-huy', coachId: 'c-tuan', playerId: 'p-huy', by: 'coach', at: NOW, notificationId: 'nt-rq-tuan-huy' } as const;
const ACC_TUAN_HUY = { type: 'respondConnection', id: 'rq-tuan-huy', accept: true, at: NOW, notificationId: 'nt-acc-tuan-huy' } as const;
const REQ_KHOA = { type: 'requestConnection', id: 'rq-tuan-khoa', coachId: 'c-tuan', playerId: 'p-khoa', by: 'player', at: NOW, notificationId: 'nt-rq-tuan-khoa' } as const;
const ACC_KHOA = { type: 'respondConnection', id: 'rq-tuan-khoa', accept: true, at: NOW, notificationId: 'nt-acc-tuan-khoa' } as const;
const PRIMARY_KHOA = { type: 'setPrimaryCoach', connectionId: 'rq-tuan-khoa' } as const;
const INV_HA = { type: 'createInvite', invite: { code: 'HAMR27', coachId: 'c-ha', createdAt: NOW, expiresAt: EXP } } as const;
const HUY_NHAP_MA_HA = { type: 'acceptInvite', code: 'HAMR27', playerId: 'p-huy', at: NOW, id: 'cx-ha-huy', notificationId: 'nt-cx-ha-huy' } as const;
const HUY_HUY_HA = { type: 'revokeConnection', id: 'cx-ha-huy', at: NOW } as const;
const TUAN_HUY_HUY = { type: 'revokeConnection', id: 'rq-tuan-huy', at: NOW } as const;
// Chạm thông báo = đánh dấu đã đọc (số trên chuông khớp lượt CDP): bước 07 Huy chạm lời mời, bước 10 Tuấn chạm "Huy đã chấp nhận".
const READ_HUY: Action = { type: 'markRead', userId: 'p-huy', at: NOW, ids: ['nt-rq-tuan-huy'] };
const READ_TUAN: Action = { type: 'markRead', userId: 'c-tuan', at: NOW, ids: ['nt-acc-tuan-huy'] };
const TUAN_SAU_13 = [INV_TUAN, REVOKE_TUAN24, REQ_TUAN_HUY, ACC_TUAN_HUY, READ_TUAN, REQ_KHOA]; // dữ liệu của Tuấn ở bước 13
const HUY_HAI_HLV = [REQ_TUAN_HUY, READ_HUY, ACC_TUAN_HUY, INV_HA, HUY_NHAP_MA_HA]; // trạng thái sau bước 23
const KHOA_TUAN_CHINH = [REQ_KHOA, ACC_KHOA, PRIMARY_KHOA]; // sau bước 15

const ROSTER = { role: 'coach', active: 'roster' } as const;
const INBOX = { role: 'coach', active: 'inbox' } as const;
const COACH_TAB = { role: 'player', active: 'coach' } as const;

// Học viên gõ mã rồi bấm "Kiểm tra" (mã rỗng = chỉ bấm).
const checkCode = async (canvas: Canvas, code: string) => {
  if (code) await typeIn(await canvas.findByPlaceholderText('Ví dụ: AB23CD'), code);
  await userEvent.click(await canvas.findByRole('button', { name: 'Kiểm tra' }));
};
// HLV gõ vào ô "Mời học viên cụ thể".
const findStudent = async (canvas: Canvas, q: string) => typeIn(await canvas.findByPlaceholderText('Tên, email hoặc số điện thoại'), q);
const click = async (canvas: Canvas, label: string) => userEvent.click(await canvas.findByLabelText(label));

// ── Bước ──────────────────────────────────────────────────────────────────────────────────────

export const B01Roster: Story = {
  name: '01 · HLV Tuấn mở tab Học viên',
  render: () => <CoachRoster />,
  ...appStory({ as: 'c-tuan', tabs: ROSTER }),
};

export const B02LoiMoi: Story = {
  name: '02 · Chạm Lời mời',
  render: () => <CoachRoster />,
  ...appStory({ as: 'c-tuan', tabs: ROSTER, params: { seg: 'loi-moi' } }),
};

export const B03TaoMa: Story = {
  name: '03 · Mời học viên → Tạo mã mời',
  render: () => <CreateInvite />,
  ...appStory({ as: 'c-tuan', params: { code: 'TUAN77' }, setup: [INV_TUAN] }),
};

export const B04TimHocVien: Story = {
  name: '04 · Thu hồi TUAN24; tìm “huy”',
  render: () => <CreateInvite />,
  ...appStory({ as: 'c-tuan', params: { code: 'TUAN77' }, setup: [INV_TUAN, REVOKE_TUAN24] }),
  play: ({ canvas }) => findStudent(canvas, 'huy'),
};

export const B05DaGuiLoiMoi: Story = {
  name: '05 · Gửi lời mời',
  render: () => <CreateInvite />,
  ...appStory({ as: 'c-tuan', params: { code: 'TUAN77' }, setup: [INV_TUAN, REVOKE_TUAN24], hold: ['toast'] }),
  play: async ({ canvas }) => {
    await findStudent(canvas, 'huy');
    await click(canvas, 'Gửi lời mời kết nối tới Phạm Quốc Huy');
  },
};

export const B06ThongBaoLoiMoi: Story = {
  name: '06 · Phạm Quốc Huy → chuông',
  render: () => <Notifications />,
  ...appStory({ as: 'p-huy', setup: [REQ_TUAN_HUY] }),
};

export const B07TabHlvLoiMoi: Story = {
  name: '07 · Chạm thông báo → tab HLV',
  render: () => <PlayerCoach />,
  ...appStory({ as: 'p-huy', tabs: COACH_TAB, setup: [REQ_TUAN_HUY, READ_HUY] }),
};

export const B08DaKetNoi: Story = {
  name: '08 · Chấp nhận lời mời',
  render: () => <PlayerCoach />,
  ...appStory({ as: 'p-huy', tabs: COACH_TAB, setup: [REQ_TUAN_HUY, READ_HUY], hold: ['toast'] }),
  play: ({ canvas }) => click(canvas, 'Chấp nhận lời mời của HLV Đỗ Minh Tuấn'),
};

export const B09HlvNhanThongBao: Story = {
  name: '09 · HLV Tuấn → tab Thông báo',
  render: () => <CoachInbox />,
  ...appStory({ as: 'c-tuan', tabs: INBOX, setup: [REQ_TUAN_HUY, ACC_TUAN_HUY] }),
};

export const B10ChiTietHocVien: Story = {
  name: '10 · Chạm thông báo → chi tiết học viên',
  render: () => <StudentDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'p-huy' }, setup: [REQ_TUAN_HUY, ACC_TUAN_HUY] }),
};

export const B11HoSoHlv: Story = {
  name: '11 · Lê Đăng Khoa mở hồ sơ HLV Tuấn',
  render: () => <CoachPublicProfile />,
  ...appStory({ as: 'p-khoa', params: { id: 'c-tuan' } }),
};

export const B12DaGuiYeuCau: Story = {
  name: '12 · Gửi yêu cầu kết nối',
  render: () => <CoachPublicProfile />,
  ...appStory({ as: 'p-khoa', params: { id: 'c-tuan' }, setup: [REQ_KHOA] }),
};

export const B13HlvDuyet: Story = {
  name: '13 · HLV Tuấn → Học viên → Lời mời',
  render: () => <CoachRoster />,
  ...appStory({ as: 'c-tuan', tabs: ROSTER, params: { seg: 'loi-moi' }, setup: TUAN_SAU_13 }),
};

export const B14RosterCoKhoa: Story = {
  name: '14 · Duyệt → Tất cả',
  render: () => <CoachRoster />,
  ...appStory({ as: 'c-tuan', tabs: ROSTER, setup: [...TUAN_SAU_13, ACC_KHOA] }),
};

export const B15DoiHlvChinh: Story = {
  name: '15 · Khoa đặt Tuấn làm HLV chính',
  render: () => <PlayerCoach />,
  ...appStory({ as: 'p-khoa', tabs: COACH_TAB, setup: [REQ_KHOA, ACC_KHOA], hold: ['toast'] }),
  play: ({ canvas }) => click(canvas, 'Đặt HLV Đỗ Minh Tuấn làm HLV chính'),
};

export const B16MaSai: Story = {
  name: '16 · Nhập mã ABCDEF',
  render: () => <AcceptInvite />,
  ...appStory({ as: 'p-khoa', setup: KHOA_TUAN_CHINH }),
  play: ({ canvas }) => checkCode(canvas, 'ABCDEF'),
};

export const B17MaHetHan: Story = {
  name: '17 · Nhập HAEXP1',
  render: () => <AcceptInvite />,
  ...appStory({ as: 'p-khoa', setup: KHOA_TUAN_CHINH }),
  play: ({ canvas }) => checkCode(canvas, 'HAEXP1'),
};

export const B18MaDaDung: Story = {
  name: '18 · Nhập USED01',
  render: () => <AcceptInvite />,
  ...appStory({ as: 'p-khoa', setup: KHOA_TUAN_CHINH }),
  play: ({ canvas }) => checkCode(canvas, 'USED01'),
};

export const B19MaThuHoi: Story = {
  name: '19 · Nhập TUAN24 (đã thu hồi)',
  render: () => <AcceptInvite />,
  ...appStory({ as: 'p-khoa', setup: [...KHOA_TUAN_CHINH, REVOKE_TUAN24] }),
  play: ({ canvas }) => checkCode(canvas, 'TUAN24'),
};

export const B20DaKetNoiMa: Story = {
  name: '20 · Nhập mã của HLV Tuấn',
  render: () => <AcceptInvite />,
  ...appStory({ as: 'p-khoa', setup: [...KHOA_TUAN_CHINH, INV_TUAN] }),
  play: ({ canvas }) => checkCode(canvas, 'TUAN77'),
};

export const B21HaYeuCauMau: Story = {
  name: '21 · HLV Hà → Học viên → Lời mời',
  render: () => <CoachRoster />,
  ...appStory({ as: 'c-ha', tabs: ROSTER, params: { seg: 'loi-moi' }, setup: [REQ_TUAN_HUY, ACC_TUAN_HUY] }), // Huy đã có HLV chính → "bạn sẽ là HLV phụ"
};

export const B22XemTruocHlvPhu: Story = {
  name: '22 · Huy nhập mã của HLV Hà',
  render: () => <AcceptInvite />,
  ...appStory({ as: 'p-huy', setup: [REQ_TUAN_HUY, ACC_TUAN_HUY, INV_HA] }),
  play: ({ canvas }) => checkCode(canvas, 'HAMR27'),
};

export const B23HaiHlv: Story = {
  name: '23 · Chấp nhận kết nối → hai HLV',
  render: () => <PlayerCoach />,
  ...appStory({ as: 'p-huy', tabs: COACH_TAB, setup: HUY_HAI_HLV }),
};

export const B24HaNhanThongBao: Story = {
  name: '24 · HLV Hà → tab Thông báo',
  render: () => <CoachInbox />,
  ...appStory({ as: 'c-ha', tabs: INBOX, setup: HUY_HAI_HLV }),
};

export const B25HaRosterCoHuy: Story = {
  name: '25 · Roster của Hà có Huy',
  render: () => <CoachRoster />,
  ...appStory({ as: 'c-ha', tabs: ROSTER, setup: HUY_HAI_HLV }),
};

export const B26HocVienHuy: Story = {
  name: '26 · Huy huỷ kết nối với HLV Hà',
  render: () => <PlayerCoach />,
  ...appStory({ as: 'p-huy', tabs: COACH_TAB, setup: HUY_HAI_HLV, hold: ['toast'] }),
  play: async ({ canvas }) => {
    await click(canvas, 'Huỷ kết nối với HLV Vũ Thanh Hà');
    await userEvent.click(await screen.findByRole('button', { name: 'Huỷ kết nối' }));
  },
};

export const B27HaRosterMatHuy: Story = {
  name: '27 · Roster của Hà mất Huy',
  render: () => <CoachRoster />,
  ...appStory({ as: 'c-ha', tabs: ROSTER, setup: [...HUY_HAI_HLV, HUY_HUY_HA] }),
};

export const B28HaMatQuyen403: Story = {
  name: '28 · Hà chạm lại thông báo cũ → 403',
  render: () => <StudentDetail />,
  ...appStory({ as: 'c-ha', params: { id: 'p-huy' }, setup: [...HUY_HAI_HLV, HUY_HUY_HA] }),
};

export const B29HlvHuyKetNoi: Story = {
  name: '29 · HLV Tuấn huỷ kết nối — dialog',
  render: () => <StudentDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'p-huy' }, setup: [REQ_TUAN_HUY, ACC_TUAN_HUY] }),
  play: async ({ canvas }) => {
    await click(canvas, 'Huỷ kết nối với Phạm Quốc Huy');
    await screen.findByText('Huỷ kết nối với Phạm Quốc Huy?');
  },
};

export const B30MatQuyen403: Story = {
  name: '30 · Xác nhận → 403 ngay',
  render: () => <StudentDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'p-huy' }, setup: [REQ_TUAN_HUY, ACC_TUAN_HUY, TUAN_HUY_HUY] }),
};

export const B31RosterSauHuy: Story = {
  name: '31 · Quay lại roster',
  render: () => <CoachRoster />,
  ...appStory({ as: 'c-tuan', tabs: ROSTER, setup: [...TUAN_SAU_13, ACC_KHOA, TUAN_HUY_HUY] }),
};

// ── Biến thể (trạng thái khác của bước gần nhất) ──────────────────────────────────────────────

export const HlvChiaSeMa: Story = {
  name: '03a · Tạo mã — chia sẻ (ShareSheet)',
  render: () => <CreateInvite />,
  ...appStory({ as: 'c-tuan', params: { code: 'TUAN24' } }),
  play: ({ canvas }) => click(canvas, 'Chia sẻ mã mời'),
};

export const HlvChuaCoLoiMoi: Story = {
  name: '03b · Mời học viên — HLV chưa có mã nào',
  render: () => <CreateInvite />,
  ...appStory({ as: 'c-ha' }),
};

export const HlvThuHoiDialog: Story = {
  name: '03c · Thu hồi mã — dialog xác nhận',
  render: () => <CreateInvite />,
  ...appStory({ as: 'c-tuan', params: { code: 'TUAN24' } }),
  play: async ({ canvas }) => {
    await click(canvas, 'Thu hồi mã TUAN24');
    await screen.findByText('Thu hồi mã TUAN24?');
  },
};

export const TimKhongCo: Story = {
  name: '04a · Mời học viên cụ thể — không có kết quả',
  render: () => <CreateInvite />,
  ...appStory({ as: 'c-tuan', params: { code: 'TUAN77' }, setup: [INV_TUAN, REVOKE_TUAN24] }),
  play: ({ canvas }) => findStudent(canvas, 'zzz'),
};

export const TabHlvChuaKetNoi: Story = {
  name: '07a · Tab HLV — chưa có HLV (Tìm HLV)',
  render: () => <PlayerCoach />,
  ...appStory({ as: 'p-huy', tabs: COACH_TAB }),
};

export const TuChoiLoiMoi: Story = {
  name: '07b · Tab HLV — đã từ chối lời mời',
  render: () => <PlayerCoach />,
  ...appStory({ as: 'p-huy', tabs: COACH_TAB, setup: [REQ_TUAN_HUY, READ_HUY], hold: ['toast'] }),
  play: ({ canvas }) => click(canvas, 'Từ chối lời mời của HLV Đỗ Minh Tuấn'),
};

export const HoSoHlv: Story = {
  name: '11a · Hồ sơ HLV — HLV của bạn',
  render: () => <CoachPublicProfile />,
  ...appStory({ as: 'p-minh', params: { id: 'c-tuan' } }),
};

export const HoSoHlvDangMoi: Story = {
  name: '11b · Hồ sơ HLV — HLV đang mời bạn (Chấp nhận / Từ chối)',
  render: () => <CoachPublicProfile />,
  ...appStory({ as: 'p-huy', params: { id: 'c-tuan' }, setup: [REQ_TUAN_HUY] }),
};

export const HoSoHlvKhongCo: Story = {
  name: '11c · Hồ sơ HLV — không tìm thấy',
  render: () => <CoachPublicProfile />,
  ...appStory({ as: 'p-minh', params: { id: 'c-khong-co' } }),
};

export const HoSoHlvChan: Story = {
  name: '11d · Hồ sơ HLV — chặn HLV đang mời (Báo cáo / Chặn trên header)',
  render: () => <CoachPublicProfile />,
  ...appStory({ as: 'p-huy', params: { id: 'c-tuan' }, setup: [REQ_TUAN_HUY] }),
  play: ({ canvas }) => click(canvas, 'Chặn HLV Đỗ Minh Tuấn'),
};

export const LoiMoiDaGui: Story = {
  name: '13a · Lời mời — HLV đã mời, chờ học viên (Huỷ lời mời)',
  render: () => <CoachRoster />,
  ...appStory({ as: 'c-tuan', tabs: ROSTER, params: { seg: 'loi-moi' }, setup: [REQ_TUAN_HUY] }),
};

export const LoiMoiTrong: Story = {
  name: '13b · Lời mời — trống',
  render: () => <CoachRoster />,
  ...appStory({ as: 'c-tuan', tabs: ROSTER, params: { seg: 'loi-moi' }, setup: [REVOKE_TUAN24] }),
};

export const TabHlv: Story = {
  name: '15a · Tab HLV — HLV chính + HLV khác (dữ liệu mẫu)',
  render: () => <PlayerCoach />,
  ...appStory({ as: 'p-minh', tabs: COACH_TAB }),
};

export const NhapMaDeTrong: Story = {
  name: '16a · Nhập mã — để trống',
  render: () => <AcceptInvite />,
  ...appStory({ as: 'p-huy' }),
  play: ({ canvas }) => checkCode(canvas, ''),
};

export const XemTruocHlvChinh: Story = {
  name: '22a · Xem trước — sẽ là HLV chính',
  render: () => <AcceptInvite />,
  ...appStory({ as: 'p-huy' }),
  play: ({ canvas }) => checkCode(canvas, 'TUAN24'),
};

export const ChapNhanKetNoi: Story = {
  name: '23a · Chấp nhận kết nối — toast',
  render: () => <AcceptInvite />,
  ...appStory({ as: 'p-huy', hold: ['toast'] }),
  play: async ({ canvas }) => {
    await checkCode(canvas, 'TUAN24');
    await userEvent.click(await canvas.findByRole('button', { name: 'Chấp nhận kết nối' }));
  },
};

export const HuyKetNoiDialog: Story = {
  name: '26a · Huỷ kết nối — dialog',
  render: () => <PlayerCoach />,
  ...appStory({ as: 'p-minh', tabs: COACH_TAB }),
  play: async ({ canvas }) => {
    await click(canvas, 'Huỷ kết nối với HLV Đỗ Minh Tuấn');
    await screen.findByText('Huỷ kết nối với HLV Đỗ Minh Tuấn?');
  },
};

export const DaHuyHlvChinh: Story = {
  name: '26b · Đã huỷ HLV chính',
  render: () => <PlayerCoach />,
  ...appStory({ as: 'p-minh', tabs: COACH_TAB, setup: [{ type: 'revokeConnection', id: 'cn-tuan-minh', at: NOW }] }),
};
