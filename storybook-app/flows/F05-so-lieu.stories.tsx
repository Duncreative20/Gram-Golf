/**
 * F05 · Số liệu
 *
 * Tài khoản: p-minh (có 8 gậy, 10 phiên swing + 2 phiên thể lực). Trạng thái rỗng: p-huy; CSV thiếu gậy: p-lan (chưa có gậy).
 *
 * Các bước (mỗi bước = một story; ✓ = đã có):
 *  ✓ 01  · Chọn nguồn                          metrics/add                     as p-minh
 *  ✓ 02  · Nhập tay — form swing trống         metrics/manual                  as p-minh
 *  ✓ 02a · Nhập tay — lỗi validate             metrics/manual + bấm Lưu        (ngoài khoảng, không phải số, bắt buộc, chưa chọn gậy)
 *  ✓ 02b · Nhập tay — hợp lệ, đã lưu (toast)   metrics/manual + chọn gậy Driver + 6 chỉ số
 *  ✓ 02c · Nhập tay — thể lực                  metrics/manual?kind=fitness
 *  ✓ 02d · Nhập tay — carry theo yard          metrics/manual                  setPrefs units imperial
 *  ✓ 03  · CSV — chọn file                     metrics/import-csv
 *  ✓ 03a · CSV — xem trước có dòng lỗi         metrics/import-csv?file=TrackMan_Session_2026-10-05.csv
 *  ✓ 03b · CSV — file lạ                       metrics/import-csv?file=Ghi_chep_tu_nhap.csv
 *  ✓ 03c · CSV — xác nhận gậy + ngày           metrics/import-csv?file=TrackMan… + Tiếp tục
 *  ✓ 03d · CSV — đã nhập (toast)               … + Nhập 4 phiên
 *  ✓ 03e · CSV — xác nhận thiếu gậy            as p-lan, FSX_Export_7i.csv + Nhập 3 phiên
 *  ✓ 04  · Ảnh — chọn hãng                     metrics/import-photo
 *  ✓ 04a · Ảnh — đang đọc                      metrics/import-photo + Đọc số liệu (giữ hẹn giờ OCR)
 *  ✓ 04b · Ảnh — kiểm tra, trường tin cậy thấp metrics/import-photo + Đọc số liệu (bỏ chờ OCR)
 *  ✓ 04c · Ảnh — không đọc được (ảnh mờ)       metrics/import-photo + ảnh chup_nghieng_bi_loa.jpg + Đọc số liệu
 *  ✓ 05  · QR — khung quét                     metrics/scan-qr
 *  ✓ 05a · QR — đã liên kết phiên              metrics/scan-qr + Mô phỏng quét thành công
 *  ✓ 06  · Danh sách Swing                     (player)/metrics                tab metrics
 *  ✓ 06a · Danh sách Thể lực                   (player)/metrics + segment Thể lực
 *  ✓ 06b · Danh sách rỗng                      (player)/metrics                as p-huy
 *  ✓ 07  · Chi tiết phiên swing (CSV)          metrics/[id] ss-d6
 *  ✓ 07a · Chi tiết phiên thể lực              metrics/[id] ss-f2
 *  ✓ 07b · Chi tiết — dialog xoá phiên         metrics/[id] ss-d6 + Xoá phiên
 *  ✓ 07c · Chi tiết — HLV xem (chỉ đọc)        metrics/[id] ss-d6              as c-tuan
 *  ✓ 07d · Chi tiết — không có quyền (403)     metrics/[id] ss-d6              as c-ha, kết nối cn-ha-minh đã huỷ
 *  ✓ 07e · Chi tiết — không tìm thấy phiên     metrics/[id] ss-khong-co
 *  ✓ 08  · Tổng quan                           (player)/home                   tab home
 *
 * Chưa có (route không tồn tại — không dựng UI giả):
 *  - Không. (Chọn file CSV / ảnh thật của hệ điều hành là bản thử dùng file / ảnh mẫu ngay trong màn — không phải route riêng.)
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fireEvent, userEvent, within } from 'storybook/test';
import MetricsAdd from '../../apps/golf/app/metrics/add';
import MetricsManual from '../../apps/golf/app/metrics/manual';
import MetricsImportCsv from '../../apps/golf/app/metrics/import-csv';
import MetricsImportPhoto from '../../apps/golf/app/metrics/import-photo';
import MetricsScanQr from '../../apps/golf/app/metrics/scan-qr';
import MetricSessionDetail from '../../apps/golf/app/metrics/[id]';
import PlayerMetrics from '../../apps/golf/app/(player)/metrics';
import PlayerHome from '../../apps/golf/app/(player)/home';
import { appStory } from '../lib/appStory';

// Dialog / sheet trong ảnh chụp: .storybook/shot.css.
const meta = { title: 'Luồng/F05 · Số liệu', id: 'f05' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const TRACKMAN = 'TrackMan_Session_2026-10-05.csv';

// Gõ vào ô nhập: userEvent.type chỉ đổi DOM, không tới onChangeText của TextInput react-native-web (render sau trả ô về rỗng) → dùng fireEvent.change.
type Canvas = { findByLabelText: (label: string) => Promise<HTMLElement> };
const fill = async (canvas: Canvas, label: string, value: string) => {
  fireEvent.change(await canvas.findByLabelText(label), { target: { value } });
};

// Màn ảnh giả lập OCR bằng MỘT hẹn giờ 1500 ms — story giữ màn ở "Đang đọc…" ('never') hoặc bỏ chờ ('now') để ảnh chụp không phụ thuộc thời điểm.
// ponytail: khớp theo số 1500 ms; màn đổi thời lượng OCR thì sửa ở đây.
const ocrTimer = (mode: 'never' | 'now') => () => {
  const orig = window.setTimeout;
  window.setTimeout = ((fn: TimerHandler, ms?: number, ...rest: unknown[]) =>
    ms === 1500 ? (mode === 'now' ? orig(fn, 0, ...rest) : 0) : orig(fn, ms, ...rest)) as typeof window.setTimeout;
  return () => {
    window.setTimeout = orig;
  };
};

export const ChonNguon: Story = {
  name: '01 · Chọn nguồn',
  render: () => <MetricsAdd />,
  ...appStory({ as: 'p-minh' }),
};

export const NhapTay: Story = {
  name: '02 · Nhập tay — swing',
  render: () => <MetricsManual />,
  ...appStory({ as: 'p-minh' }),
};

export const NhapTayLoi: Story = {
  name: '02a · Nhập tay — lỗi validate',
  render: () => <MetricsManual />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await fill(canvas, 'Tốc độ đầu gậy (mph)', '160');
    await fill(canvas, 'Smash factor', 'abc');
    await fill(canvas, 'Spin (rpm)', '2650');
    await userEvent.click(await canvas.findByRole('button', { name: 'Lưu' }));
  },
};

export const NhapTayDaLuu: Story = {
  name: '02b · Nhập tay — hợp lệ, đã lưu',
  render: () => <MetricsManual />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(await canvas.findByRole('combobox', { name: 'Gậy, chưa chọn' }));
    // BottomSheet là Modal → vẽ ngoài #storybook-root, tìm trong body
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole('radio', { name: /^Driver/ }));
    const values: [string, string][] = [
      ['Tốc độ đầu gậy (mph)', '105'],
      ['Tốc độ bóng (mph)', '153'],
      ['Smash factor', '1,46'],
      ['Spin (rpm)', '2600'],
      ['Góc bắn (°)', '12,2'],
      ['Carry (m)', '231'],
    ];
    for (const [label, v] of values) await fill(canvas, label, v);
    await userEvent.click(await canvas.findByRole('button', { name: 'Lưu' }));
  },
};

export const NhapTayTheLuc: Story = {
  name: '02c · Nhập tay — thể lực',
  render: () => <MetricsManual />,
  ...appStory({ as: 'p-minh', params: { kind: 'fitness' } }),
};

export const NhapTayYard: Story = {
  name: '02d · Nhập tay — carry theo yard',
  render: () => <MetricsManual />,
  ...appStory({ as: 'p-minh', setup: [{ type: 'setPrefs', userId: 'p-minh', patch: { units: 'imperial' } }] }),
};

export const CsvChonFile: Story = {
  name: '03 · CSV — chọn file',
  render: () => <MetricsImportCsv />,
  ...appStory({ as: 'p-minh' }),
};

export const CsvXemTruoc: Story = {
  name: '03a · CSV — xem trước có dòng lỗi',
  render: () => <MetricsImportCsv />,
  ...appStory({ as: 'p-minh', params: { file: TRACKMAN } }),
};

export const CsvFileLa: Story = {
  name: '03b · CSV — file lạ',
  render: () => <MetricsImportCsv />,
  ...appStory({ as: 'p-minh', params: { file: 'Ghi_chep_tu_nhap.csv' } }),
};

export const CsvXacNhan: Story = {
  name: '03c · CSV — xác nhận gậy và ngày',
  render: () => <MetricsImportCsv />,
  ...appStory({ as: 'p-minh', params: { file: TRACKMAN } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Tiếp tục' }));
  },
};

export const CsvDaNhap: Story = {
  name: '03d · CSV — đã nhập',
  render: () => <MetricsImportCsv />,
  ...appStory({ as: 'p-minh', params: { file: TRACKMAN } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Tiếp tục' }));
    await userEvent.click(await canvas.findByRole('button', { name: /^Nhập \d+ phiên$/ }));
  },
};

export const CsvThieuGay: Story = {
  name: '03e · CSV — xác nhận thiếu gậy',
  render: () => <MetricsImportCsv />,
  ...appStory({ as: 'p-lan', params: { file: 'FSX_Export_7i.csv' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Tiếp tục' }));
    await userEvent.click(await canvas.findByRole('button', { name: /^Nhập \d+ phiên$/ }));
  },
};

export const AnhChonHang: Story = {
  name: '04 · Ảnh — chọn hãng',
  render: () => <MetricsImportPhoto />,
  ...appStory({ as: 'p-minh' }),
};

export const AnhDangDoc: Story = {
  name: '04a · Ảnh — đang đọc',
  render: () => <MetricsImportPhoto />,
  ...appStory({ as: 'p-minh' }),
  beforeEach: ocrTimer('never'),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Đọc số liệu' }));
  },
};

export const AnhKiemTra: Story = {
  name: '04b · Ảnh — kiểm tra, trường tin cậy thấp',
  render: () => <MetricsImportPhoto />,
  ...appStory({ as: 'p-minh' }),
  beforeEach: ocrTimer('now'),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Đọc số liệu' }));
    await canvas.findByText(/độ tin cậy thấp — kiểm tra trước khi lưu/);
  },
};

export const AnhKhongDocDuoc: Story = {
  name: '04c · Ảnh — không đọc được (ảnh mờ)',
  render: () => <MetricsImportPhoto />,
  ...appStory({ as: 'p-minh' }),
  beforeEach: ocrTimer('now'),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByText('chup_nghieng_bi_loa.jpg'));
    await userEvent.click(await canvas.findByRole('button', { name: 'Đọc số liệu' }));
    await canvas.findByText('Không đọc được số liệu');
  },
};

export const QuetQr: Story = {
  name: '05 · QR — khung quét',
  render: () => <MetricsScanQr />,
  ...appStory({ as: 'p-minh' }),
};

export const QuetQrDaLienKet: Story = {
  name: '05a · QR — đã liên kết phiên',
  render: () => <MetricsScanQr />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Mô phỏng quét thành công' }));
    // "Đang liên kết…" 1 s (scan-qr.tsx) — chờ trong play để ảnh luôn ở trạng thái đã liên kết
    await canvas.findByText(/^Đã liên kết phiên/, undefined, { timeout: 3000 });
  },
};

export const DanhSachSwing: Story = {
  name: '06 · Danh sách Swing',
  render: () => <PlayerMetrics />,
  ...appStory({ as: 'p-minh', tabs: { role: 'player', active: 'metrics' } }),
};

export const DanhSachTheLuc: Story = {
  name: '06a · Danh sách Thể lực',
  render: () => <PlayerMetrics />,
  ...appStory({ as: 'p-minh', tabs: { role: 'player', active: 'metrics' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('tab', { name: /Thể lực/ }));
  },
};

export const DanhSachRong: Story = {
  name: '06b · Danh sách rỗng',
  render: () => <PlayerMetrics />,
  ...appStory({ as: 'p-huy', tabs: { role: 'player', active: 'metrics' } }),
};

export const ChiTietPhien: Story = {
  name: '07 · Chi tiết phiên swing',
  render: () => <MetricSessionDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'ss-d6' } }),
};

export const ChiTietTheLuc: Story = {
  name: '07a · Chi tiết phiên thể lực',
  render: () => <MetricSessionDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'ss-f2' } }),
};

export const ChiTietXoaDialog: Story = {
  name: '07b · Chi tiết — dialog xoá phiên',
  render: () => <MetricSessionDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'ss-d6' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Xoá phiên' }));
  },
};

export const ChiTietHlvXem: Story = {
  name: '07c · Chi tiết — HLV xem (chỉ đọc)',
  render: () => <MetricSessionDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'ss-d6' } }),
};

export const ChiTietKhongQuyen: Story = {
  name: '07d · Chi tiết — không có quyền (403)',
  render: () => <MetricSessionDetail />,
  ...appStory({ as: 'c-ha', params: { id: 'ss-d6' }, setup: [{ type: 'revokeConnection', id: 'cn-ha-minh', at: '2026-10-07T08:00:00Z' }] }),
};

export const ChiTietKhongThay: Story = {
  name: '07e · Chi tiết — không tìm thấy phiên',
  render: () => <MetricSessionDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'ss-khong-co' } }),
};

export const TongQuan: Story = {
  name: '08 · Tổng quan',
  render: () => <PlayerHome />,
  ...appStory({ as: 'p-minh', tabs: { role: 'player', active: 'home' } }),
};
