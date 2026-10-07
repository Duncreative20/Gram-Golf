import type { Units } from './domain';

export const mToYd = (m: number) => m * 1.0936133;
export const ydToM = (yd: number) => yd / 1.0936133;
const vn = (n: number, digits = 0) => n.toFixed(digits).replace('.', ',');

export const formatDistance = (m: number, units: Units) => (units === 'imperial' ? `${Math.round(mToYd(m))} yd` : `${Math.round(m)} m`);
export const formatSpeed = (mph: number) => `${Math.round(mph)} mph`;
export const formatTempo = (ratio: number) => `${vn(ratio, 1)} : 1`;
export const formatNumber = (n: number, digits = 0) => vn(n, digits);
/** Số kiểu VN kèm đơn vị: "104 mph", "12,4°", "7/10", "1,46". Bỏ `digits` = giữ nguyên số ("1,56", "-10"). */
export const formatValue = (n: number, unit = '', digits?: number) =>
  `${digits === undefined ? String(n).replace('.', ',') : vn(n, digits)}${unit && unit !== '°' && !unit.startsWith('/') ? ' ' : ''}${unit}`;
/** Chênh lệch của chỉ số càng cao càng tốt (tốc độ, smash, carry): làm tròn theo `digits` rồi mới xét dấu → "+1 mph" / "-0,01" / "0". */
export const statDelta = (diff: number, digits = 0, unit?: string) => {
  const r = Number(diff.toFixed(digits));
  return { text: `${r > 0 ? '+' : ''}${vn(r, digits)}${unit ? ` ${unit}` : ''}`, good: r >= 0 };
};

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
/** "1,48" | "2.650" | " 12 " → số; trống/không hợp lệ → null. Dấu chấm và phẩy đều là thập phân (không có phân cách nghìn). */
export const parseNumberVN = (raw: string): number | null => {
  const s = raw.trim().replace(',', '.');
  if (s === '' || !/^-?\d+(\.\d+)?$/.test(s)) return null;
  return Number(s);
};
/** Chữ tắt cho Avatar: chữ đầu của 2 từ cuối ("HLV Đỗ Minh Tuấn" → "MT"); tên rỗng → "". */
export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(-2).map((w) => w.charAt(0).toUpperCase()).join('');
