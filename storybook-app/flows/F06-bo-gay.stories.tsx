/**
 * F06 · Bộ gậy — kịch bản: docs/flows/F06/steps.json, storyboard: docs/flows/F06.md
 *
 * Tài khoản: p-minh (8 gậy, có swing + phiên gắn gậy). Rỗng: p-huy. HLV chỉ đọc: c-tuan (kết nối active với p-minh).
 * 403: c-ha xem p-lan (kết nối cn-ha-lan đã huỷ trong seed) / c-ha xem gậy p-minh sau khi huỷ cn-ha-minh.
 *
 * Các bước (mỗi bước shot = một story `f06--b-<nn>-<slug>`; ✓ = đã có):
 *  ✓ 01 · Tab Thông số → Bộ gậy                 (player)/metrics                 tab metrics; play: tab Bộ gậy
 *  ✓ 02 · Nút + → Loại gậy (16 loại)            clubs/new                        play: Loại gậy
 *  ✓ 03 · Tuỳ chỉnh, điền tên + thông số        clubs/new                        play: Tuỳ chỉnh → tên / hãng / model / hãng cán / loft 37 / lie 62
 *  ✓ 04 · Đã thêm — nhóm Khác có Chipper        (player)/metrics                 CHIPPER; play: tab Bộ gậy
 *  ✓ 05 · Nhập tay → Gậy: có Chipper            metrics/manual                   CHIPPER; play: Gậy
 *  ✓ 06 · Thêm gậy mới → chọn sẵn Hybrid 3      metrics/manual                   + HYBRID3; play: Gậy → Hybrid 3 (chọn sẵn sau khi thêm: lượt CDP)
 *  ✓ 07 · Đăng swing → Gậy: Chipper + Hybrid 3  swings/new                       play: Tiếp tục → Gậy
 *  ✓ 08 · Sửa model xong                        clubs/[id] cl-sb-chipper         + CHIPPER_SUA
 *  ✓ 09 · Sau lưu trữ — dòng Gậy đã lưu trữ     (player)/metrics                 + LUU_TRU; play: tab Bộ gậy
 *  ✓ 10 · Bộ gậy › Lưu trữ                      clubs/index?view=archived
 *  ✓ 11 · Gậy đã lưu trữ                        clubs/[id] cl-sb-chipper         Khôi phục gậy / Xoá gậy, không có Sửa
 *  ✓ 12 · Khôi phục → Xoá gậy (dialog)          clubs/[id] cl-sb-chipper         play: Xoá gậy
 *  ✓ 13 · Sau xoá — Lưu trữ rỗng                clubs/index?view=archived
 *  ✓ 14 · Driver gắn 7 phiên/swing — không xoá  clubs/[id] cl-driver             play: cuộn tới chú thích
 * Biến thể:
 *  ✓ 01a · Danh sách theo nhóm (màn Bộ gậy)     clubs/index
 *  ✓ 01b · Bộ gậy rỗng                          clubs/index                      as p-huy
 *  ✓ 02a · Thêm gậy — form trống                clubs/new
 *  ✓ 03a · Thêm gậy — lỗi validate              clubs/new + Loft 70, Lie "abc" + Lưu
 *  ✓ 03b · Thêm gậy — wedge có bounce           clubs/new + chọn SW
 *  ✓ 08a · Sửa gậy                              clubs/[id]/edit cl-driver
 *  ✓ 08b · Dialog lưu trữ gậy                   clubs/[id] cl-driver + Lưu trữ gậy
 *  ✓ 11a · Sửa gậy đã lưu trữ → về chi tiết     clubs/[id]/edit cl-driver, archiveClub (guard Redirect)
 *  ✓ 11b · Đã khôi phục — toast                 như 11, hold toast; play: Khôi phục gậy
 *  ✓ 14a · HLV xem bộ gậy học viên (chỉ đọc)    clubs/index?playerId=p-minh      as c-tuan
 *  ✓ 14b · HLV xem chi tiết gậy (chỉ đọc)       clubs/[id] cl-driver             as c-tuan
 *  ✓ 14c · Không quyền — bộ gậy (403)           clubs/index?playerId=p-lan       as c-ha
 *  ✓ 14d · Không quyền — chi tiết gậy (403)     clubs/[id] cl-driver             as c-ha, huỷ cn-ha-minh
 *  ✓ 14e · Không tìm thấy gậy                   clubs/[id] cl-khong-co
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { expect, screen, userEvent, waitFor } from 'storybook/test';
import Clubs from '../../apps/golf/app/clubs/index';
import ClubNew from '../../apps/golf/app/clubs/new';
import ClubDetail from '../../apps/golf/app/clubs/[id]/index';
import ClubEdit from '../../apps/golf/app/clubs/[id]/edit';
import PlayerMetrics from '../../apps/golf/app/(player)/metrics';
import MetricsManual from '../../apps/golf/app/metrics/manual';
import SwingNew from '../../apps/golf/app/swings/new';
import type { Action } from '../../apps/golf/lib/reducer';
import { NOW } from '../../apps/golf/lib/mock';
import { appStory, typeIn, type AppStoryOptions } from '../lib/appStory';

const meta = { title: 'Luồng/F06 · Bộ gậy', id: 'f06' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
type Play = NonNullable<Story['play']>;

// Dữ liệu ghi ở các bước trước (id / thời điểm cố định → ảnh ổn định). Flex = mặc định của form (clubRaw → 'Regular').
const CHIPPER = { type: 'upsertClub', club: { id: 'cl-sb-chipper', playerId: 'p-minh', type: 'Tuỳ chỉnh', customName: 'Chipper 37°', brand: 'Cleveland', model: 'Smart Sole 4', shaftBrand: 'True Temper', shaftFlex: 'Regular', loftDeg: 37, lieDeg: 62 } } as const;
const CHIPPER_SUA = { type: 'upsertClub', club: { ...CHIPPER.club, model: 'Smart Sole 4 C' } } as const;
const HYBRID3 = { type: 'upsertClub', club: { id: 'cl-sb-hybrid3', playerId: 'p-minh', type: 'Hybrid 3', brand: 'Ping', model: 'G430', shaftBrand: 'Alta CB', shaftFlex: 'Regular', loftDeg: 19, lieDeg: 59 } } as const;
const LUU_TRU = { type: 'archiveClub', id: 'cl-sb-chipper', at: NOW } as const;
// Bước 08 trở đi: Hybrid 3 (bước 06) đã có trong bộ gậy như lượt đi thật → số "Đang dùng" / lưới khớp màn thật.
const SUA_XONG: Action[] = [CHIPPER, HYBRID3, CHIPPER_SUA];
const DA_LUU_TRU: Action[] = [...SUA_XONG, LUU_TRU];
const SAU_XOA: Action[] = [HYBRID3]; // Chipper đã xoá

const TAB_METRICS: AppStoryOptions = { as: 'p-minh', tabs: { role: 'player', active: 'metrics' } };
const ARCHIVE_DRIVER = [{ type: 'archiveClub' as const, id: 'cl-driver', at: '2026-10-07T08:00:00Z' }];

const click = (el: Promise<HTMLElement>) => el.then((e) => userEvent.click(e));
// Khung ảnh cố định 390×844: cuộn phần bước đó kiểm lên trên chân màn (như lượt đi CDP). Chờ font nạp xong trước khi cuộn — font về sau
// làm chữ xuống dòng, đẩy dòng cuối ra khỏi khung.
const reveal = (el: Promise<HTMLElement>, block: ScrollLogicalPosition = 'end') =>
  el.then(async (e) => {
    await document.fonts.ready;
    e.scrollIntoView({ block });
  });
const tabClubs: Play = ({ canvas }) => click(canvas.findByRole('tab', { name: /Bộ gậy/ }));
const openTypes: Play = ({ canvas }) => click(canvas.findByRole('combobox', { name: 'Loại gậy, chưa chọn' }));
const openClubs: Play = ({ canvas }) => click(canvas.findByRole('combobox', { name: 'Gậy, chưa chọn' }));
// BottomSheet (loại gậy / chọn gậy) là Modal → vẽ ngoài #storybook-root: chọn trong `screen`. Chờ sheet đóng hẳn: lúc đóng, Modal trả
// focus về ô Loại gậy và cuộn form lên đầu (đè lên `reveal` ở cuối play).
const pickType = (type: string): Play => async (ctx) => {
  await openTypes(ctx);
  await click(screen.findByRole('radio', { name: type }));
  await waitFor(() => expect(document.querySelector('[aria-modal="true"]')).toBeNull());
};

// ── Danh sách, thêm gậy ──────────────────────────────────────────────────────
export const B01BoGay: Story = {
  name: '01 · Tab Thông số → Bộ gậy',
  render: () => <PlayerMetrics />,
  ...appStory(TAB_METRICS),
  play: tabClubs,
};

export const DanhSach: Story = {
  name: '01a · Danh sách theo nhóm (màn Bộ gậy)',
  render: () => <Clubs />,
  ...appStory({ as: 'p-minh' }),
};

export const DanhSachRong: Story = {
  name: '01b · Bộ gậy rỗng',
  render: () => <Clubs />,
  ...appStory({ as: 'p-huy' }),
};

export const B02_16Loai: Story = {
  name: '02 · Nút + → Loại gậy',
  render: () => <ClubNew />,
  ...appStory({ as: 'p-minh' }),
  play: openTypes,
};

export const ThemGay: Story = {
  name: '02a · Thêm gậy — form trống',
  render: () => <ClubNew />,
  ...appStory({ as: 'p-minh' }),
};

export const B03FormTuyChinh: Story = {
  name: '03 · Tuỳ chỉnh, điền tên + thông số',
  render: () => <ClubNew />,
  ...appStory({ as: 'p-minh' }),
  play: async (ctx) => {
    await pickType('Tuỳ chỉnh')(ctx);
    const { canvas } = ctx;
    for (const [label, v] of [['Tên gậy', 'Chipper 37°'], ['Hãng', 'Cleveland'], ['Model', 'Smart Sole 4'], ['Hãng cán', 'True Temper'], ['Loft (°)', '37'], ['Lie (°)', '62']]) {
      await typeIn(await canvas.findByLabelText(label), v);
    }
    await reveal(canvas.findByText('Khoảng hợp lệ 45–80°'));
  },
};

export const ThemGayLoi: Story = {
  name: '03a · Thêm gậy — lỗi validate',
  render: () => <ClubNew />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await typeIn(await canvas.findByLabelText('Hãng'), 'TaylorMade');
    await typeIn(await canvas.findByLabelText('Loft (°)'), '70');
    await typeIn(await canvas.findByLabelText('Lie (°)'), 'abc');
    await click(canvas.findByRole('button', { name: 'Lưu' }));
  },
};

export const ThemGayWedge: Story = {
  name: '03b · Thêm gậy — wedge có bounce',
  render: () => <ClubNew />,
  ...appStory({ as: 'p-minh' }),
  play: async (ctx) => {
    await pickType('SW')(ctx);
    await reveal(ctx.canvas.findByLabelText(/^Bounce/));
  },
};

export const B04ThemXong: Story = {
  name: '04 · Lưu — nhóm Khác có Chipper 37°',
  render: () => <PlayerMetrics />,
  ...appStory({ ...TAB_METRICS, setup: [CHIPPER] }),
  play: async (ctx) => {
    await tabClubs(ctx);
    await reveal(ctx.canvas.findByText('Chipper 37°'), 'center');
  },
};

// ── Gậy mới ở chỗ chọn gậy ───────────────────────────────────────────────────
export const B05GayMoiTrongPicker: Story = {
  name: '05 · Nhập tay → Gậy: có Chipper 37°',
  render: () => <MetricsManual />,
  ...appStory({ as: 'p-minh', setup: [CHIPPER] }),
  play: async (ctx) => {
    await openClubs(ctx);
    await reveal(screen.findByText('Thêm gậy mới'));
  },
};

export const B06ChonSanGayMoi: Story = {
  name: '06 · Thêm gậy mới → Hybrid 3 được chọn sẵn',
  render: () => <MetricsManual />,
  ...appStory({ as: 'p-minh', setup: [CHIPPER, HYBRID3] }),
  play: async (ctx) => {
    await openClubs(ctx);
    await click(screen.findByRole('radio', { name: /^Hybrid 3/ }));
  },
};

export const B07GayMoiODangSwing: Story = {
  name: '07 · Đăng swing → Gậy: Chipper 37° + Hybrid 3',
  render: () => <SwingNew />,
  ...appStory({ as: 'p-minh', setup: [CHIPPER, HYBRID3] }),
  play: async (ctx) => {
    await click(ctx.canvas.findByRole('button', { name: 'Tiếp tục' }));
    await openClubs(ctx);
    await reveal(screen.findByRole('radio', { name: /^Chipper 37°/ }));
  },
};

// ── Chi tiết, sửa, lưu trữ, khôi phục, xoá ───────────────────────────────────
export const B08SuaXong: Story = {
  name: '08 · Sửa model → chi tiết có Lưu trữ + Xoá gậy',
  render: () => <ClubDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'cl-sb-chipper' }, setup: SUA_XONG }),
};

export const SuaGay: Story = {
  name: '08a · Sửa gậy',
  render: () => <ClubEdit />,
  ...appStory({ as: 'p-minh', params: { id: 'cl-driver' } }),
};

export const LuuTruDialog: Story = {
  name: '08b · Dialog lưu trữ gậy',
  render: () => <ClubDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'cl-driver' } }),
  play: ({ canvas }) => click(canvas.findByRole('button', { name: 'Lưu trữ gậy' })),
};

export const B09SauLuuTru: Story = {
  name: '09 · Lưu trữ → dòng Gậy đã lưu trữ',
  render: () => <PlayerMetrics />,
  ...appStory({ ...TAB_METRICS, setup: DA_LUU_TRU }),
  play: tabClubs,
};

export const B10LuuTru: Story = {
  name: '10 · Bộ gậy › Lưu trữ',
  render: () => <Clubs />,
  ...appStory({ as: 'p-minh', params: { view: 'archived' }, setup: DA_LUU_TRU }),
};

export const B11GayLuuTru: Story = {
  name: '11 · Gậy đã lưu trữ — Khôi phục / Xoá',
  render: () => <ClubDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'cl-sb-chipper' }, setup: DA_LUU_TRU }),
};

export const SuaGayDaLuuTru: Story = {
  name: '11a · Sửa gậy đã lưu trữ — về chi tiết',
  render: () => <ClubEdit />,
  ...appStory({ as: 'p-minh', params: { id: 'cl-driver' }, setup: ARCHIVE_DRIVER }),
};

export const DaKhoiPhuc: Story = {
  name: '11b · Đã khôi phục — toast',
  render: () => <ClubDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'cl-sb-chipper' }, setup: DA_LUU_TRU, hold: ['toast'] }),
  play: ({ canvas }) => click(canvas.findByRole('button', { name: 'Khôi phục gậy' })),
};

export const B12XoaGay: Story = {
  name: '12 · Khôi phục → Xoá gậy (dialog)',
  render: () => <ClubDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'cl-sb-chipper' }, setup: SUA_XONG }),
  play: async ({ canvas }) => {
    await click(canvas.findByRole('button', { name: 'Xoá gậy' }));
    await screen.findByText('Xoá gậy này?'); // Dialog vẽ trong portal
  },
};

export const B13SauXoa: Story = {
  name: '13 · Xoá → Lưu trữ rỗng',
  render: () => <Clubs />,
  ...appStory({ as: 'p-minh', params: { view: 'archived' }, setup: SAU_XOA }),
};

export const B14DriverKhongXoa: Story = {
  name: '14 · Driver gắn 7 phiên/swing — không có Xoá gậy',
  render: () => <ClubDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'cl-driver' }, setup: SAU_XOA }),
  play: ({ canvas }) => reveal(canvas.findByText(/đã gắn với 7 phiên\/swing/)),
};

// ── HLV / quyền ──────────────────────────────────────────────────────────────
export const HlvXemBoGay: Story = {
  name: '14a · HLV xem bộ gậy học viên',
  render: () => <Clubs />,
  ...appStory({ as: 'c-tuan', params: { playerId: 'p-minh' } }),
};

export const HlvXemChiTiet: Story = {
  name: '14b · HLV xem chi tiết gậy',
  render: () => <ClubDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'cl-driver' } }),
};

export const KhongQuyenBoGay: Story = {
  name: '14c · Không quyền — bộ gậy (403)',
  render: () => <Clubs />,
  ...appStory({ as: 'c-ha', params: { playerId: 'p-lan' } }),
};

export const KhongQuyenChiTiet: Story = {
  name: '14d · Không quyền — chi tiết gậy (403)',
  render: () => <ClubDetail />,
  ...appStory({ as: 'c-ha', params: { id: 'cl-driver' }, setup: [{ type: 'revokeConnection', id: 'cn-ha-minh', at: '2026-10-07T08:00:00Z' }] }),
};

export const KhongTimThay: Story = {
  name: '14e · Không tìm thấy gậy',
  render: () => <ClubDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'cl-khong-co' } }),
};
