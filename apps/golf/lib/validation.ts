import type { Club, ClubType, FitnessMetrics, Profile, Role, ShaftFlex, SwingMetrics, Units } from './domain';
import { formatValue, mToYd, parseNumberVN, ydToM } from './format';

/** `optional`: ô để trống là hợp lệ (không có giá trị). */
export interface FieldSpec<K extends string> { key: K; label: string; unit: string; min: number; max: number; digits: number; optional?: boolean }
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

/** Ô tuỳ chọn để trống → không có trong `value`. */
function validateFields<K extends string>(specs: FieldSpec<K>[], raw: Raw<K>): Validated<Record<K, number>> {
  const errors: Partial<Record<K, string>> = {};
  const out = {} as Record<K, number>;
  for (const f of specs) {
    const s = raw[f.key] ?? '';
    const n = parseNumberVN(s);
    if (n === null) {
      if (s.trim()) errors[f.key] = 'Không phải số';
      else if (!f.optional) errors[f.key] = 'Bắt buộc';
    } else if (n < f.min || n > f.max) errors[f.key] = `Trong khoảng ${rangeText(f)}`;
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

type ClubNumberKey = 'shaftWeightG' | 'loftDeg' | 'lieDeg' | 'bounceDeg';
/** Ô số của form gậy, theo thứ tự hiển thị. Bounce chỉ hiện với wedge (hoặc khi đã có giá trị) — màn quyết. */
export const CLUB_FIELDS: FieldSpec<ClubNumberKey>[] = [
  { key: 'shaftWeightG', label: 'Trọng lượng cán', unit: 'g', min: 30, max: 150, digits: 0, optional: true },
  { key: 'loftDeg', label: 'Loft', unit: '°', min: 0, max: 64, digits: 1 },
  { key: 'lieDeg', label: 'Lie', unit: '°', min: 45, max: 80, digits: 1 },
  { key: 'bounceDeg', label: 'Bounce', unit: '°', min: 0, max: 20, digits: 0, optional: true },
];
/** Giá trị form gậy (chuỗi như người dùng gõ). `type` chưa chọn = undefined; `customName` chỉ dùng khi loại "Tuỳ chỉnh". */
export interface ClubRaw extends Raw<ClubNumberKey> { type?: ClubType; customName: string; brand: string; model: string; shaftBrand: string; shaftFlex: ShaftFlex }
type ClubFields = Omit<Club, 'id' | 'playerId' | 'archivedAt'>;

/** Lỗi theo trường như form số liệu ("Bắt buộc" / "Không phải số" / "Trong khoảng 0–64°"); `value` = mọi trường của gậy trừ id/chủ. */
export function validateClub(raw: ClubRaw): { errors: Partial<Record<keyof ClubRaw, string>>; value: ClubFields | null } {
  const errors: Partial<Record<keyof ClubRaw, string>> = {};
  if (!raw.type) errors.type = 'Bắt buộc';
  const custom = raw.type === 'Tuỳ chỉnh';
  if (custom && !raw.customName.trim()) errors.customName = 'Bắt buộc';
  for (const k of ['brand', 'model', 'shaftBrand'] as const) if (!raw[k].trim()) errors[k] = 'Bắt buộc';
  const nums = validateFields(CLUB_FIELDS, raw);
  Object.assign(errors, nums.errors);
  if (!raw.type || !nums.value || Object.keys(errors).length) return { errors, value: null };
  const n: Partial<Record<ClubNumberKey, number>> = nums.value; // ô tuỳ chọn để trống không có giá trị
  return {
    errors,
    value: {
      type: raw.type, customName: custom ? raw.customName.trim() : undefined,
      brand: raw.brand.trim(), model: raw.model.trim(), shaftBrand: raw.shaftBrand.trim(), shaftFlex: raw.shaftFlex,
      shaftWeightG: n.shaftWeightG, loftDeg: n.loftDeg!, lieDeg: n.lieDeg!, bounceDeg: n.bounceDeg,
    },
  };
}

const LOFT: Partial<Record<ClubType, number>> = { Driver: 10.5, 'Gỗ 3': 15, 'Gỗ 5': 18, 'Hybrid 3': 19, 'Hybrid 4': 22, PW: 46, GW: 50, SW: 56, LW: 60, Putter: 3 };
/** Loft gợi ý (°) theo loại: sắt 4 = 21°, mỗi số sắt +3,5°; gậy tuỳ chỉnh không có gợi ý. */
export function defaultLoft(type: ClubType): number | undefined {
  const iron = /^Sắt (\d)$/.exec(type);
  return iron ? 21 + (Number(iron[1]) - 4) * 3.5 : LOFT[type];
}
/** Ô loft khi đổi loại gậy: còn trống hoặc vẫn đúng gợi ý của loại cũ (người dùng chưa tự nhập) → gợi ý của loại mới; đã tự nhập → giữ nguyên. */
export function loftOnTypeChange(loft: string, from: ClubType | undefined, to: ClubType): string {
  const untouched = !loft.trim() || (from !== undefined && parseNumberVN(loft) === defaultLoft(from));
  if (!untouched) return loft;
  const suggested = defaultLoft(to);
  return suggested === undefined ? '' : formatValue(suggested);
}
/** Giá trị ban đầu của form: gậy mới → trống (flex Regular); sửa gậy → số viết kiểu VN ("10,5"). */
export function clubRaw(c?: Club): ClubRaw {
  const num = (n?: number) => (n === undefined ? '' : formatValue(n));
  return {
    type: c?.type, customName: c?.customName ?? '', brand: c?.brand ?? '', model: c?.model ?? '', shaftBrand: c?.shaftBrand ?? '',
    shaftFlex: c?.shaftFlex ?? 'Regular', shaftWeightG: num(c?.shaftWeightG), loftDeg: num(c?.loftDeg), lieDeg: num(c?.lieDeg), bounceDeg: num(c?.bounceDeg),
  };
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

export const POST_TITLE_MAX = 120;
export const POST_CONTENT_MAX = 2000;
export const POST_TAGS_MAX = 5;
/** Form đăng bài: tiêu đề và nội dung bắt buộc (sau khi bỏ khoảng trắng hai đầu), tối đa 120 / 2000 ký tự. */
export function validatePost(raw: { title: string; content: string }) {
  const errors: Partial<Record<'title' | 'content', string>> = {};
  const title = raw.title.trim();
  const content = raw.content.trim();
  if (!title) errors.title = 'Bắt buộc';
  else if (title.length > POST_TITLE_MAX) errors.title = `Tối đa ${POST_TITLE_MAX} ký tự`;
  if (!content) errors.content = 'Bắt buộc';
  else if (content.length > POST_CONTENT_MAX) errors.content = `Tối đa ${POST_CONTENT_MAX} ký tự`;
  return { errors, value: Object.keys(errors).length ? null : { title, content } };
}
/** Thêm tag từ chữ người dùng gõ ("Driver, #tempo"): tách theo dấu phẩy, bỏ "#" đầu và khoảng trắng thừa, chữ thường, bỏ trùng; đủ 5 tag thì bỏ phần dư. */
export const addTags = (tags: string[], input: string) =>
  input
    .split(',')
    .map((x) => x.trim().replace(/^#+/, '').trim().replace(/\s+/g, ' ').toLowerCase())
    .reduce((acc, tag) => (tag && !acc.includes(tag) && acc.length < POST_TAGS_MAX ? [...acc, tag] : acc), tags);
