import type { Units } from './domain';

export const mToYd = (m: number) => m * 1.0936133;
export const ydToM = (yd: number) => yd / 1.0936133;
const vn = (n: number, digits = 0) => n.toFixed(digits).replace('.', ',');

export const formatDistance = (m: number, units: Units) => (units === 'imperial' ? `${Math.round(mToYd(m))} yd` : `${Math.round(m)} m`);
export const formatSpeed = (mph: number) => `${Math.round(mph)} mph`;
export const formatTempo = (ratio: number) => `${vn(ratio, 1)} : 1`;
export const formatNumber = (n: number, digits = 0) => vn(n, digits);

const pad = (n: number) => String(n).padStart(2, '0');
export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
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
