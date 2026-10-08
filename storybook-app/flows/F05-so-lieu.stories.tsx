/**
 * F05 · Số liệu — kịch bản: docs/flows/F05/steps.json, storyboard: docs/flows/F05.md
 *
 * Tài khoản: p-minh (có 8 gậy, 10 phiên swing + 2 phiên thể lực). Trạng thái rỗng: p-huy; CSV thiếu gậy: p-lan (chưa có gậy).
 *
 * Các bước (mỗi bước shot = một story `f05--b-<nn>-<slug>`; ✓ = đã có):
 *  ✓ 01 · Tổng quan trước khi nhập              (player)/home                tab home
 *  ✓ 02 · Lịch sử phiên swing                   (player)/metrics             tab metrics
 *  ✓ 03 · Chọn nguồn                            metrics/add
 *  ✓ 04 · Nhập tay — Lưu khi trống              metrics/manual               play: Lưu
 *  ✓ 05 · Carry ngoài khoảng                    metrics/manual               play: Sắt 7 + 6 chỉ số (Carry 400) → Lưu
 *  ✓ 06 · Đã lưu — Sắt 7 đầu danh sách          (player)/metrics             SAT7
 *  ✓ 07 · Chi tiết phiên vừa lưu                metrics/[id] ss-sb-sat7      SAT7
 *  ✓ 08 · Sửa phiên — Spin không phải số        metrics/manual?id=ss-sb-sat7 play: Carry 152, Spin abc → Lưu
 *  ✓ 09 · Sau khi sửa — dòng Đã sửa             metrics/[id] ss-sb-sat7      SAT7 + SAT7_SUA
 *  ✓ 10 · Lịch sử phiên thể lực                 (player)/metrics             play: tab Thể lực
 *  ✓ 11 · Phiên thể lực sau khi sửa             metrics/[id] ss-f2           THE_LUC_SUA
 *  ✓ 12 · CSV — xem trước có dòng lỗi           metrics/import-csv           play: chọn file TrackMan
 *  ✓ 13 · CSV — đã nhập (toast)                 metrics/import-csv           hold toast; play: … → Tiếp tục → Nhập 4 phiên
 *  ✓ 14 · Ảnh — đang đọc                        metrics/import-photo         hold ocr; play: ảnh loá → Đọc số liệu
 *  ✓ 15 · Ảnh — không đọc được                  metrics/import-photo         play: ảnh loá → Đọc số liệu → chờ 1,5 s
 *  ✓ 16 · Ảnh — kiểm tra, trường tin cậy thấp   metrics/import-photo         play: ket_qua_may_do.jpg → Đọc số liệu → chờ
 *  ✓ 17 · QR — đã liên kết phiên                metrics/scan-qr              play: Mô phỏng quét thành công
 *  ✓ 18 · Lịch sử theo yard                     (player)/metrics             … + CSV + OCR + YARD
 *  ✓ 19 · Sau khi xoá Sắt 7                     (player)/metrics             … + deleteSession ss-sb-sat7
 *  ✓ 20 · Tổng quan sau luồng                   (player)/home                như 19
 * Biến thể:
 *  ✓ 02a · Danh sách rỗng                       (player)/metrics             as p-huy
 *  ✓ 03a · Nhập tay — swing trống               metrics/manual
 *  ✓ 04a · Nhập tay — thể lực                   metrics/manual?kind=fitness
 *  ✓ 04b · Nhập tay — carry theo yard           metrics/manual               YARD
 *  ✓ 06a · Nhập tay — đang lưu toast            metrics/manual               hold toast; play: Driver + 6 chỉ số → Lưu
 *  ✓ 07a · Chi tiết — dialog xoá phiên          metrics/[id] ss-d6           play: Xoá phiên
 *  ✓ 07b · Chi tiết — HLV xem (chỉ đọc)         metrics/[id] ss-d6           as c-tuan
 *  ✓ 07c · Chi tiết — 403                       metrics/[id] ss-d6           as c-ha, kết nối cn-ha-minh đã huỷ
 *  ✓ 07d · Chi tiết — không tìm thấy            metrics/[id] ss-khong-co
 *  ✓ 08a · Sửa phiên — theo yard                metrics/manual?id=ss-sb-sat7 SAT7 + YARD (Carry (yd) điền sẵn)
 *  ✓ 11a · Sửa phiên thể lực — điền sẵn         metrics/manual?id=ss-f2
 *  ✓ 12a · CSV — chọn file                      metrics/import-csv
 *  ✓ 12b · CSV — file lạ                        metrics/import-csv?file=Ghi_chep_tu_nhap.csv
 *  ✓ 13a · CSV — xác nhận gậy và ngày           metrics/import-csv?file=TrackMan… + Tiếp tục
 *  ✓ 13b · CSV — xác nhận thiếu gậy             as p-lan, FSX_Export_7i.csv + Nhập 3 phiên
 *  ✓ 14a · Ảnh — chọn hãng                      metrics/import-photo
 *  ✓ 17a · QR — khung quét                      metrics/scan-qr
 *
 * Chưa có: chọn file CSV / ảnh thật của hệ điều hành (bản thử dùng file / ảnh mẫu ngay trong màn — không phải route riêng).
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import MetricsAdd from '../../apps/golf/app/metrics/add';
import MetricsManual from '../../apps/golf/app/metrics/manual';
import MetricsImportCsv from '../../apps/golf/app/metrics/import-csv';
import MetricsImportPhoto from '../../apps/golf/app/metrics/import-photo';
import MetricsScanQr from '../../apps/golf/app/metrics/scan-qr';
import MetricSessionDetail from '../../apps/golf/app/metrics/[id]';
import PlayerMetrics from '../../apps/golf/app/(player)/metrics';
import PlayerHome from '../../apps/golf/app/(player)/home';
import type { Action } from '../../apps/golf/lib/reducer';
import { NOW } from '../../apps/golf/lib/mock';
import { SAMPLE_FILES } from '../../apps/golf/lib/simulate';
import { parseLaunchMonitorCsv } from '../../apps/golf/lib/csv';
import { appStory, typeIn, type AppStoryOptions } from '../lib/appStory';

const meta = { title: 'Luồng/F05 · Số liệu', id: 'f05' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
type Play = NonNullable<Story['play']>;

const TRACKMAN = 'TrackMan_Session_2026-10-05.csv';

// Dữ liệu ghi ở các bước trước (id / thời điểm cố định → ảnh ổn định).
const SAT7 = { type: 'addSession', session: { id: 'ss-sb-sat7', playerId: 'p-minh', capturedAt: NOW, source: 'manual', clubId: 'cl-iron7', kind: 'swing', swing: { clubSpeedMph: 85, ballSpeedMph: 116, smash: 1.36, spinRpm: 6700, launchDeg: 17.5, carryM: 150 } } } as const;
const SAT7_SUA = { type: 'updateSession', session: { ...SAT7.session, swing: { ...SAT7.session.swing, carryM: 152, spinRpm: 6650 } }, at: NOW } as const;
const THE_LUC_SUA = { type: 'updateSession', session: { id: 'ss-f2', playerId: 'p-minh', capturedAt: '2026-10-04T01:00:00Z', source: 'manual', kind: 'fitness', fitness: { weightKg: 71.5, flexibility: 7, gripStrengthKg: 45, verticalJumpCm: 48 } }, at: NOW } as const;
// Bước 13: 4 dòng hợp lệ của file TrackMan → 4 phiên Driver ngày NOW (như import-csv.tsx).
const CSV: Action = {
  type: 'addSessions',
  sessions: parseLaunchMonitorCsv(SAMPLE_FILES.find((f) => f.name === TRACKMAN)!.content)
    .rows.filter((r) => r.value)
    .map((r, i) => ({ id: `ss-sb-csv-${i}`, playerId: 'p-minh', capturedAt: NOW, source: 'csv', vendor: 'trackman', clubId: 'cl-driver', kind: 'swing', swing: r.value! })),
};
const OCR = { type: 'addSession', session: { id: 'ss-sb-ocr', playerId: 'p-minh', capturedAt: NOW, source: 'photo', vendor: 'trackman', clubId: 'cl-driver', kind: 'swing', swing: { clubSpeedMph: 104.8, ballSpeedMph: 153.2, smash: 1.46, spinRpm: 2610, launchDeg: 12.1, carryM: 231 } } } as const;
const YARD = { type: 'setPrefs', userId: 'p-minh', patch: { units: 'imperial' } } as const;
// Bước 18–20: mọi thao tác ghi của lượt đi tới đó (CSV + OCR làm danh sách / Tổng quan giống màn thật).
const DEN_18: Action[] = [SAT7, SAT7_SUA, THE_LUC_SUA, CSV, OCR, YARD];
const DEN_19: Action[] = [...DEN_18, { type: 'deleteSession', id: 'ss-sb-sat7' }];

const TAB_HOME: AppStoryOptions = { as: 'p-minh', tabs: { role: 'player', active: 'home' } };
const TAB_METRICS: AppStoryOptions = { as: 'p-minh', tabs: { role: 'player', active: 'metrics' } };

const click = (el: Promise<HTMLElement>) => el.then((e) => userEvent.click(e));
const save: Play = ({ canvas }) => click(canvas.findByRole('button', { name: 'Lưu' }));
const typeAll = async (canvas: Parameters<Play>[0]['canvas'], values: [string, string][]) => {
  for (const [label, v] of values) await typeIn(await canvas.findByLabelText(label), v);
};
const pickClub = (club: string): Play => async ({ canvas, canvasElement }) => {
  await click(canvas.findByRole('combobox', { name: 'Gậy, chưa chọn' }));
  // sheet là Modal → vẽ ra ngoài #storybook-root: tìm trong cả body
  await click(within(canvasElement.ownerDocument.body).findByRole('radio', { name: new RegExp(`^${club}`) }));
  // sheet đóng xong mới làm tiếp: lúc đóng, Modal trả focus về ô Gậy và cuộn form lên đầu (đè lên `reveal` ở cuối play)
  await waitFor(() => expect(canvasElement.ownerDocument.querySelector('[aria-modal="true"]')).toBeNull());
};
// Khung ảnh cố định 390×844: cuộn phần bước đó kiểm lên trên chân form (như lượt đi CDP).
const reveal = (el: Promise<HTMLElement>) => el.then((e) => e.scrollIntoView({ block: 'end' }));
const revealCarryYd: Play = ({ canvas }) => reveal(canvas.findByLabelText('Carry (yd)'));
const csvPreview: Play = ({ canvas }) => click(canvas.findByText(TRACKMAN));
const readPhoto = (file: string): Play => async ({ canvas }) => {
  await click(canvas.findByText(file));
  await click(canvas.findByRole('button', { name: 'Đọc số liệu' }));
};

// ── Tổng quan, lịch sử, chọn nguồn ──────────────────────────────────────────
export const B01TongQuanTruoc: Story = {
  name: '01 · Minh Anh mở Tổng quan',
  render: () => <PlayerHome />,
  ...appStory(TAB_HOME),
};

export const B02LichSu: Story = {
  name: '02 · Tab Thông số',
  render: () => <PlayerMetrics />,
  ...appStory(TAB_METRICS),
};

export const DanhSachRong: Story = {
  name: '02a · Danh sách rỗng',
  render: () => <PlayerMetrics />,
  ...appStory({ as: 'p-huy', tabs: { role: 'player', active: 'metrics' } }),
};

export const B03ChonNguon: Story = {
  name: '03 · Nút + — chọn nguồn',
  render: () => <MetricsAdd />,
  ...appStory({ as: 'p-minh' }),
};

// ── Nhập tay ─────────────────────────────────────────────────────────────────
export const NhapTay: Story = {
  name: '03a · Nhập tay — swing trống',
  render: () => <MetricsManual />,
  ...appStory({ as: 'p-minh' }),
};

export const B04LoiTruong: Story = {
  name: '04 · Nhập tay → Lưu khi để trống',
  render: () => <MetricsManual />,
  ...appStory({ as: 'p-minh' }),
  play: save,
};

export const NhapTayTheLuc: Story = {
  name: '04a · Nhập tay — thể lực',
  render: () => <MetricsManual />,
  ...appStory({ as: 'p-minh', params: { kind: 'fitness' } }),
};

export const NhapTayYard: Story = {
  name: '04b · Nhập tay — carry theo yard',
  render: () => <MetricsManual />,
  ...appStory({ as: 'p-minh', setup: [YARD] }),
  play: revealCarryYd,
};

export const B05NgoaiKhoang: Story = {
  name: '05 · Sắt 7 + 6 chỉ số, Carry 400 → Lưu',
  render: () => <MetricsManual />,
  ...appStory({ as: 'p-minh' }),
  play: async (ctx) => {
    await pickClub('Sắt 7')(ctx);
    await typeAll(ctx.canvas, [
      ['Tốc độ đầu gậy (mph)', '85'],
      ['Tốc độ bóng (mph)', '116'],
      ['Smash factor', '1,36'],
      ['Spin (rpm)', '6700'],
      ['Góc bắn (°)', '17,5'],
      ['Carry (m)', '400'],
    ]);
    await save(ctx);
    await reveal(ctx.canvas.findByText('Trong khoảng 10–350 m'));
  },
};

export const B06DaLuu: Story = {
  name: '06 · Carry 150 → Lưu — về Thông số',
  render: () => <PlayerMetrics />,
  ...appStory({ ...TAB_METRICS, setup: [SAT7] }),
};

export const NhapTayDaLuu: Story = {
  name: '06a · Nhập tay — đang lưu toast',
  render: () => <MetricsManual />,
  ...appStory({ as: 'p-minh', hold: ['toast'] }),
  play: async (ctx) => {
    await pickClub('Driver')(ctx);
    await typeAll(ctx.canvas, [
      ['Tốc độ đầu gậy (mph)', '105'],
      ['Tốc độ bóng (mph)', '153'],
      ['Smash factor', '1,46'],
      ['Spin (rpm)', '2600'],
      ['Góc bắn (°)', '12,2'],
      ['Carry (m)', '231'],
    ]);
    await save(ctx);
  },
};

// ── Chi tiết + sửa phiên ─────────────────────────────────────────────────────
export const B07ChiTiet: Story = {
  name: '07 · Chạm phiên vừa lưu',
  render: () => <MetricSessionDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'ss-sb-sat7' }, setup: [SAT7] }),
};

export const ChiTietXoaDialog: Story = {
  name: '07a · Chi tiết — dialog xoá phiên',
  render: () => <MetricSessionDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'ss-d6' } }),
  play: ({ canvas }) => click(canvas.findByRole('button', { name: 'Xoá phiên' })),
};

export const ChiTietHlvXem: Story = {
  name: '07b · Chi tiết — HLV xem (chỉ đọc)',
  render: () => <MetricSessionDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'ss-d6' } }),
};

export const ChiTietKhongQuyen: Story = {
  name: '07c · Chi tiết — 403',
  render: () => <MetricSessionDetail />,
  ...appStory({ as: 'c-ha', params: { id: 'ss-d6' }, setup: [{ type: 'revokeConnection', id: 'cn-ha-minh', at: '2026-10-07T08:00:00Z' }] }),
};

export const ChiTietKhongThay: Story = {
  name: '07d · Chi tiết — không tìm thấy',
  render: () => <MetricSessionDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'ss-khong-co' } }),
};

export const B08SuaLoi: Story = {
  name: '08 · Sửa phiên: Carry 152, Spin “abc” → Lưu',
  render: () => <MetricsManual />,
  ...appStory({ as: 'p-minh', params: { id: 'ss-sb-sat7' }, setup: [SAT7] }),
  play: async (ctx) => {
    await typeAll(ctx.canvas, [
      ['Carry (m)', '152'],
      ['Spin (rpm)', 'abc'],
    ]);
    await save(ctx);
    await reveal(ctx.canvas.findByText('Không phải số'));
  },
};

export const SuaPhienYard: Story = {
  name: '08a · Sửa phiên — theo yard',
  render: () => <MetricsManual />,
  ...appStory({ as: 'p-minh', params: { id: 'ss-sb-sat7' }, setup: [SAT7, YARD] }),
  play: revealCarryYd,
};

export const B09SauSua: Story = {
  name: '09 · Spin 6650 → Lưu — dòng Đã sửa',
  render: () => <MetricSessionDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'ss-sb-sat7' }, setup: [SAT7, SAT7_SUA] }),
};

export const B10TheLuc: Story = {
  name: '10 · Quay lại → segment Thể lực',
  render: () => <PlayerMetrics />,
  ...appStory({ ...TAB_METRICS, setup: [SAT7, SAT7_SUA] }),
  play: ({ canvas }) => click(canvas.findByRole('tab', { name: /Thể lực/ })),
};

export const B11TheLucSauSua: Story = {
  name: '11 · Sửa phiên thể lực 04/10 — Cân nặng 71,5',
  render: () => <MetricSessionDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'ss-f2' }, setup: [THE_LUC_SUA] }),
};

export const SuaPhienTheLuc: Story = {
  name: '11a · Sửa phiên thể lực — điền sẵn',
  render: () => <MetricsManual />,
  ...appStory({ as: 'p-minh', params: { id: 'ss-f2' } }),
};

// ── CSV ──────────────────────────────────────────────────────────────────────
export const B12CsvXemTruoc: Story = {
  name: '12 · Nhập file CSV → file TrackMan',
  render: () => <MetricsImportCsv />,
  ...appStory({ as: 'p-minh' }),
  play: csvPreview,
};

export const CsvChonFile: Story = {
  name: '12a · CSV — chọn file',
  render: () => <MetricsImportCsv />,
  ...appStory({ as: 'p-minh' }),
};

export const CsvFileLa: Story = {
  name: '12b · CSV — file lạ',
  render: () => <MetricsImportCsv />,
  ...appStory({ as: 'p-minh', params: { file: 'Ghi_chep_tu_nhap.csv' } }),
};

export const B13CsvDaNhap: Story = {
  name: '13 · Tiếp tục → Nhập 4 phiên',
  render: () => <MetricsImportCsv />,
  ...appStory({ as: 'p-minh', hold: ['toast'] }),
  play: async (ctx) => {
    await csvPreview(ctx);
    await click(ctx.canvas.findByRole('button', { name: 'Tiếp tục' }));
    await click(ctx.canvas.findByRole('button', { name: 'Nhập 4 phiên' }));
  },
};

export const CsvXacNhan: Story = {
  name: '13a · CSV — xác nhận gậy và ngày',
  render: () => <MetricsImportCsv />,
  ...appStory({ as: 'p-minh', params: { file: TRACKMAN } }),
  play: ({ canvas }) => click(canvas.findByRole('button', { name: 'Tiếp tục' })),
};

export const CsvThieuGay: Story = {
  name: '13b · CSV — xác nhận thiếu gậy',
  render: () => <MetricsImportCsv />,
  ...appStory({ as: 'p-lan', params: { file: 'FSX_Export_7i.csv' } }),
  play: async ({ canvas }) => {
    await click(canvas.findByRole('button', { name: 'Tiếp tục' }));
    await click(canvas.findByRole('button', { name: /^Nhập \d+ phiên$/ }));
  },
};

// ── Ảnh chụp màn hình (OCR) ──────────────────────────────────────────────────
export const B14OcrDangDoc: Story = {
  name: '14 · Ảnh loá → Đọc số liệu — đang đọc',
  render: () => <MetricsImportPhoto />,
  ...appStory({ as: 'p-minh', hold: ['ocr'] }),
  play: readPhoto('chup_nghieng_bi_loa.jpg'),
};

export const AnhChonHang: Story = {
  name: '14a · Ảnh — chọn hãng',
  render: () => <MetricsImportPhoto />,
  ...appStory({ as: 'p-minh' }),
};

export const B15OcrLoi: Story = {
  name: '15 · Chờ 1,5 giây — không đọc được',
  render: () => <MetricsImportPhoto />,
  ...appStory({ as: 'p-minh' }),
  play: async (ctx) => {
    await readPhoto('chup_nghieng_bi_loa.jpg')(ctx);
    await ctx.canvas.findByText('Không đọc được số liệu', undefined, { timeout: 5000 });
  },
};

export const B16OcrKiemTra: Story = {
  name: '16 · Chọn ảnh khác → ket_qua_may_do.jpg → Đọc số liệu',
  render: () => <MetricsImportPhoto />,
  ...appStory({ as: 'p-minh' }),
  play: async (ctx) => {
    await readPhoto('ket_qua_may_do.jpg')(ctx);
    await ctx.canvas.findByText(/trường độ tin cậy thấp/, undefined, { timeout: 5000 });
  },
};

// ── QR ───────────────────────────────────────────────────────────────────────
export const B17Qr: Story = {
  name: '17 · Quét QR → Mô phỏng quét thành công',
  render: () => <MetricsScanQr />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await click(canvas.findByRole('button', { name: 'Mô phỏng quét thành công' }));
    // "Đang liên kết…" 1 s (scan-qr.tsx) — chờ trong play để ảnh luôn ở trạng thái đã liên kết
    await canvas.findByText(/^Đã liên kết phiên/, undefined, { timeout: 3000 });
  },
};

export const QuetQr: Story = {
  name: '17a · QR — khung quét',
  render: () => <MetricsScanQr />,
  ...appStory({ as: 'p-minh' }),
};

// ── Đơn vị yard, xoá, Tổng quan sau ──────────────────────────────────────────
export const B18YardLichSu: Story = {
  name: '18 · Đơn vị Yard → Thông số',
  render: () => <PlayerMetrics />,
  ...appStory({ ...TAB_METRICS, setup: DEN_18 }),
};

export const B19SauXoa: Story = {
  name: '19 · Xoá phiên Sắt 7',
  render: () => <PlayerMetrics />,
  ...appStory({ ...TAB_METRICS, setup: DEN_19 }),
};

export const B20TongQuanSau: Story = {
  name: '20 · Tab Tổng quan sau luồng',
  render: () => <PlayerHome />,
  ...appStory({ ...TAB_HOME, setup: DEN_19 }),
};
