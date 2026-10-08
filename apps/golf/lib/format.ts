import type { SwingMetrics, Units } from './domain';

export const mToYd = (m: number) => m * 1.0936133;
export const ydToM = (yd: number) => yd / 1.0936133;
const vn = (n: number, digits = 0) => n.toFixed(digits).replace('.', ',');

export const formatDistance = (m: number, units: Units) => (units === 'imperial' ? `${Math.round(mToYd(m))} yd` : `${Math.round(m)} m`);
export const formatSpeed = (mph: number) => `${Math.round(mph)} mph`;
export const formatTempo = (ratio: number) => `${vn(ratio, 1)} : 1`;
/** Thời điểm / độ dài tính bằng giây, một kiểu cho mọi màn: "1,3 s". */
export const formatSec = (sec: number) => `${vn(sec, 1)} s`;
export const formatNumber = (n: number, digits = 0) => vn(n, digits);
/** Số kiểu VN kèm đơn vị: "104 mph", "12,4°", "7/10", "1,46". Bỏ `digits` = giữ nguyên số ("1,56", "-10"). */
export const formatValue = (n: number, unit = '', digits?: number) =>
  `${digits === undefined ? String(n).replace('.', ',') : vn(n, digits)}${unit && unit !== '°' && !unit.startsWith('/') ? ' ' : ''}${unit}`;
/** Chênh lệch của chỉ số càng cao càng tốt (tốc độ, smash, carry): làm tròn theo `digits` rồi mới xét dấu → "+1 mph" / "-0,01" / "0". */
export const statDelta = (diff: number, digits = 0, unit?: string) => {
  const r = Number(diff.toFixed(digits));
  return { text: `${r > 0 ? '+' : ''}${vn(r, digits)}${unit ? ` ${unit}` : ''}`, good: r >= 0 };
};
// 4 ô "Chỉ số swing gần nhất" — cả 4 càng cao càng tốt (statDelta: tăng = tốt). Carry đổi m → yd theo đơn vị hiển thị.
const SWING_TILES: { key: keyof SwingMetrics; label: string; unit?: string; digits: number }[] = [
  { key: 'clubSpeedMph', label: 'Tốc độ đầu gậy', unit: 'mph', digits: 0 },
  { key: 'ballSpeedMph', label: 'Tốc độ bóng', unit: 'mph', digits: 0 },
  { key: 'smash', label: 'Smash', digits: 2 },
  { key: 'carryM', label: 'Carry', unit: 'm', digits: 0 },
];
/** Props cho 4 `StatTile` của phiên swing `latest` (Tổng quan người chơi, tab Tổng quan ở chi tiết học viên); chênh lệch so với `prev` = phiên trước cùng gậy. */
export const swingTiles = (latest: SwingMetrics, prev: SwingMetrics | undefined, units: Units) =>
  SWING_TILES.map(({ key, label, unit, digits }) => {
    const v = (m: SwingMetrics) => (key === 'carryM' && units === 'imperial' ? mToYd(m.carryM) : m[key]);
    const u = key === 'carryM' && units === 'imperial' ? 'yd' : unit;
    return { label, unit: u, value: vn(v(latest), digits), delta: prev && statDelta(v(latest) - v(prev), digits, u) };
  });

const pad = (n: number) => String(n).padStart(2, '0');
// Việt Nam UTC+7 cố định (không có giờ mùa hè) — không dựa vào Intl/múi giờ của máy.
const VN_OFFSET_MS = 7 * 3600 * 1000;
export const formatDate = (iso: string) => {
  const d = new Date(Date.parse(iso) + VN_OFFSET_MS);
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
};
/** Ngày local (0 giờ) trùng ngày lịch VN của `iso` — giá trị cho DatePicker của DS (DS so ngày theo giờ máy). */
export const vnDay = (iso: string) => {
  const d = new Date(Date.parse(iso) + VN_OFFSET_MS);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};
/** Đổi ngày lịch VN của `iso` thành `day` (ngày chọn trên DatePicker), giữ nguyên giờ trong ngày theo giờ VN. */
export const withVnDay = (iso: string, day: Date) => {
  const timeOfDay = (Date.parse(iso) + VN_OFFSET_MS) % 86400000;
  return new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()) - VN_OFFSET_MS + timeOfDay).toISOString();
};
export const relativeTime = (iso: string, now: string) => {
  const s = (Date.parse(now) - Date.parse(iso)) / 1000;
  if (s < 60) return 'Vừa xong';
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} ngày trước`;
  return formatDate(iso);
};
/** Thời gian còn lại tới `iso` (hạn mã mời), làm tròn xuống: "Còn 6 ngày" / "Còn 23 giờ" / "Còn 45 phút"; tới hoặc quá hạn → "Hết hạn". */
export const timeLeft = (iso: string, now: string) => {
  const s = (Date.parse(iso) - Date.parse(now)) / 1000;
  if (s <= 0) return 'Hết hạn';
  if (s < 3600) return `Còn ${Math.max(1, Math.floor(s / 60))} phút`;
  if (s < 86400) return `Còn ${Math.floor(s / 3600)} giờ`;
  return `Còn ${Math.floor(s / 86400)} ngày`;
};
/** Tiền VND kiểu VN: "450.000 đ". */
export const formatVnd = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} đ`;
/** Mã mời người dùng gõ/dán → mã chuẩn: dán cả link mời ("…/i/tuan24") thì lấy phần mã; in hoa, chỉ giữ A–Z 0–9, tối đa 6 ký tự. */
export const parseInviteCode = (raw: string) =>
  (raw.match(/\/i\/([a-z0-9]+)/i)?.[1] ?? raw).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
/** "1,48" | "2.650" | " 12 " → số; trống/không hợp lệ → null. Dấu chấm và phẩy đều là thập phân (không có phân cách nghìn). */
export const parseNumberVN = (raw: string): number | null => {
  const s = raw.trim().replace(',', '.');
  if (s === '' || !/^-?\d+(\.\d+)?$/.test(s)) return null;
  return Number(s);
};
/** Mốc chèn vào ghi chú HLV: "[1,3 s]" (cùng dạng formatSec). */
export const markText = (sec: number) => `[${formatSec(sec)}]`;
/** Nút "Chèn mốc" ở ô ghi chú: thêm mốc vào cuối nội dung đang soạn, cách chữ trước 1 khoảng trắng, chừa khoảng trắng để gõ tiếp. */
export const insertMark = (text: string, sec: number) => `${text}${text && !/\s$/.test(text) ? ' ' : ''}${markText(sec)} `;
/** Các mốc "[1,3 s]" (hoặc gõ tay "[1,3s]") trong ghi chú (giây), theo thứ tự xuất hiện; chữ khác dạng ("1,3 s" không ngoặc, "[abc]") bỏ qua. */
export const noteMarks = (text: string) => [...text.matchAll(/\[(\d+(?:[.,]\d{1,2})?) ?s\]/g)].map((m) => parseNumberVN(m[1]!)!);
/** Dung lượng file kiểu VN: "38 MB", "2,4 MB" (dưới 10 MB có 1 chữ số), từ 1000 MB → "1,5 GB". */
export const formatSize = (mb: number) => (mb >= 1000 ? `${vn(mb / 1000, 1)} GB` : `${vn(mb, mb < 10 ? 1 : 0)} MB`);
/** Chữ tắt cho Avatar: chữ đầu của 2 từ cuối ("HLV Đỗ Minh Tuấn" → "MT"); tên rỗng → "". */
export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(-2).map((w) => w.charAt(0).toUpperCase()).join('');
