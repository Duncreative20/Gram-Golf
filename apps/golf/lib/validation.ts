import type { FitnessMetrics, Profile, Role, SwingMetrics, Units } from './domain';
import { formatValue, mToYd, parseNumberVN, ydToM } from './format';

export interface FieldSpec<K extends string> { key: K; label: string; unit: string; min: number; max: number; digits: number }
export const SWING_FIELDS: FieldSpec<keyof SwingMetrics>[] = [
  { key: 'clubSpeedMph', label: 'Tốc độ đầu gậy', unit: 'mph', min: 40, max: 150, digits: 0 },
  { key: 'ballSpeedMph', label: 'Tốc độ bóng', unit: 'mph', min: 50, max: 220, digits: 0 },
  { key: 'smash', label: 'Smash factor', unit: '', min: 1, max: 1.56, digits: 2 },
  { key: 'spinRpm', label: 'Spin', unit: 'rpm', min: 500, max: 12000, digits: 0 },
  { key: 'launchDeg', label: 'Góc bắn', unit: '°', min: -10, max: 45, digits: 1 },
  { key: 'carryM', label: 'Carry', unit: 'm', min: 10, max: 350, digits: 0 },
];
export const FITNESS_FIELDS: FieldSpec<keyof FitnessMetrics>[] = [
  { key: 'weightKg', label: 'Cân nặng', unit: 'kg', min: 30, max: 200, digits: 1 },
  { key: 'flexibility', label: 'Độ dẻo', unit: '/10', min: 0, max: 10, digits: 0 },
  { key: 'gripStrengthKg', label: 'Lực nắm', unit: 'kg', min: 5, max: 100, digits: 0 },
  { key: 'verticalJumpCm', label: 'Bật cao', unit: 'cm', min: 5, max: 120, digits: 0 },
];

/** Ô nhập swing theo đơn vị hiển thị: imperial → carry nhập yard, khoảng làm tròn vào trong để đổi về mét vẫn hợp lệ. */
export const swingFields = (units: Units): FieldSpec<keyof SwingMetrics>[] =>
  units === 'metric' ? SWING_FIELDS : SWING_FIELDS.map((f) => (f.key === 'carryM' ? { ...f, unit: 'yd', min: Math.ceil(mToYd(f.min)), max: Math.floor(mToYd(f.max)) } : f));
/** Khoảng hợp lệ viết kiểu VN: "40–150 mph", "1–1,56", "-10–45°" (gợi ý dưới ô nhập + thông báo lỗi). */
export const rangeText = (f: FieldSpec<string>) => `${formatValue(f.min)}–${formatValue(f.max, f.unit)}`;

export type Raw<K extends string> = Record<K, string>;
export interface Validated<T> { value: T | null; errors: Partial<Record<keyof T, string>> }

function validateFields<K extends string>(specs: FieldSpec<K>[], raw: Raw<K>): Validated<Record<K, number>> {
  const errors: Partial<Record<K, string>> = {};
  const out = {} as Record<K, number>;
  for (const f of specs) {
    const n = parseNumberVN(raw[f.key] ?? '');
    if (n === null) errors[f.key] = raw[f.key]?.trim() ? 'Không phải số' : 'Bắt buộc';
    else if (n < f.min || n > f.max) errors[f.key] = `Trong khoảng ${rangeText(f)}`;
    else out[f.key] = n;
  }
  return { value: Object.keys(errors).length ? null : out, errors };
}
/** `units` = đơn vị người dùng nhập carry (prefs); giá trị trả về luôn ở mét (D9). */
export const validateSwingMetrics = (raw: Raw<keyof SwingMetrics>, units: Units = 'metric') => {
  const r = validateFields(swingFields(units), raw) as Validated<SwingMetrics>;
  if (r.value && units === 'imperial') r.value.carryM = ydToM(r.value.carryM);
  return r;
};
export const validateFitnessMetrics = (raw: Raw<keyof FitnessMetrics>) => validateFields(FITNESS_FIELDS, raw) as Validated<FitnessMetrics>;

export interface ClubRaw { brand: string; model: string; shaftBrand: string; loftDeg: string; lieDeg: string; shaftWeightG: string; bounceDeg: string }
export function validateClub(raw: ClubRaw) {
  const errors: Partial<Record<keyof ClubRaw, string>> = {};
  for (const k of ['brand', 'model', 'shaftBrand'] as const) if (!raw[k].trim()) errors[k] = 'Bắt buộc';
  const num = (k: keyof ClubRaw, min: number, max: number, optional: boolean) => {
    if (optional && !raw[k].trim()) return undefined;
    const n = parseNumberVN(raw[k]);
    if (n === null || n < min || n > max) { errors[k] = `Trong khoảng ${min}–${max}`; return undefined; }
    return n;
  };
  const loftDeg = num('loftDeg', 0, 64, false);
  const lieDeg = num('lieDeg', 45, 80, false);
  const shaftWeightG = num('shaftWeightG', 30, 150, true);
  const bounceDeg = num('bounceDeg', 0, 20, true);
  return { errors, value: Object.keys(errors).length ? null : { brand: raw.brand.trim(), model: raw.model.trim(), shaftBrand: raw.shaftBrand.trim(), loftDeg: loftDeg!, lieDeg: lieDeg!, shaftWeightG, bounceDeg } };
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export interface RegistrationRaw { name: string; email: string; phone: string; password: string; handicap: string; academy: string; yearsExperience: string }
export type Registration = Pick<Profile, 'role' | 'name' | 'email' | 'phone' | 'handicap' | 'academy' | 'yearsExperience'>;
/** Form đăng ký (B2). Mật khẩu chỉ kiểm, không nằm trong `value`. `profiles` để chặn email (không phân biệt hoa thường) / SĐT đã có. */
export function validateRegistration(role: Role, raw: RegistrationRaw, profiles: Pick<Profile, 'email' | 'phone'>[]) {
  const errors: Partial<Record<keyof RegistrationRaw, string>> = {};
  const name = raw.name.trim().replace(/\s+/g, ' ');
  const email = raw.email.trim();
  const phone = raw.phone.replace(/\s/g, '');
  if (!name) errors.name = 'Bắt buộc';
  if (!email) errors.email = 'Bắt buộc';
  else if (!EMAIL_RE.test(email)) errors.email = 'Email không hợp lệ';
  else if (profiles.some((p) => p.email.toLowerCase() === email.toLowerCase())) errors.email = 'Email đã có tài khoản';
  if (!phone) errors.phone = 'Bắt buộc';
  else if (!/^0\d{9}$/.test(phone)) errors.phone = 'Gồm 10 số, bắt đầu bằng 0';
  else if (profiles.some((p) => p.phone.replace(/\s/g, '') === phone)) errors.phone = 'Số điện thoại đã có tài khoản';
  if (!raw.password) errors.password = 'Bắt buộc';
  else if (raw.password.length < 8 || !/\d/.test(raw.password)) errors.password = 'Tối thiểu 8 ký tự, có ít nhất 1 chữ số';
  const num = (k: 'handicap' | 'yearsExperience', max: number, integer: boolean) => {
    const n = parseNumberVN(raw[k]);
    if (n === null) errors[k] = raw[k].trim() ? 'Không phải số' : 'Bắt buộc';
    else if (n < 0 || n > max || (integer && !Number.isInteger(n))) errors[k] = `${integer ? 'Số nguyên' : 'Trong khoảng'} 0–${max}`;
    else return n;
  };
  const extra: Partial<Registration> = {};
  if (role === 'player') extra.handicap = num('handicap', 54, false);
  else {
    extra.academy = raw.academy.trim();
    if (!extra.academy) errors.academy = 'Bắt buộc';
    extra.yearsExperience = num('yearsExperience', 60, true);
  }
  const value: Registration | null = Object.keys(errors).length ? null : { role, name, email, phone, ...extra };
  return { errors, value };
}
