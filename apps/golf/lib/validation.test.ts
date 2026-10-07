import { describe, expect, it } from 'vitest';
import { validateSwingMetrics, validateFitnessMetrics, validateClub, validateRegistration, SWING_FIELDS } from './validation';

describe('validation', () => {
  it('chấp nhận bộ số hợp lệ', () => {
    const r = validateSwingMetrics({ clubSpeedMph: '104', ballSpeedMph: '152', smash: '1,46', spinRpm: '2650', launchDeg: '12,5', carryM: '228' });
    expect(r.errors).toEqual({});
    expect(r.value).toEqual({ clubSpeedMph: 104, ballSpeedMph: 152, smash: 1.46, spinRpm: 2650, launchDeg: 12.5, carryM: 228 });
  });
  it('báo lỗi theo trường: trống, ngoài khoảng, không phải số', () => {
    const r = validateSwingMetrics({ clubSpeedMph: '', ballSpeedMph: '400', smash: 'x', spinRpm: '2650', launchDeg: '12', carryM: '228' });
    expect(r.value).toBeNull();
    expect(Object.keys(r.errors).sort()).toEqual(['ballSpeedMph', 'clubSpeedMph', 'smash']);
    expect(r.errors.ballSpeedMph).toMatch(/50.*220/);
  });
  it('mỗi trường có nhãn và đơn vị', () => {
    expect(SWING_FIELDS.map((f) => f.key)).toEqual(['clubSpeedMph', 'ballSpeedMph', 'smash', 'spinRpm', 'launchDeg', 'carryM']);
    expect(SWING_FIELDS.every((f) => f.label && f.min < f.max)).toBe(true);
  });
  it('thể lực và gậy', () => {
    expect(validateFitnessMetrics({ weightKg: '72', flexibility: '7', gripStrengthKg: '45', verticalJumpCm: '48' }).value).not.toBeNull();
    expect(validateFitnessMetrics({ weightKg: '72', flexibility: '11', gripStrengthKg: '45', verticalJumpCm: '48' }).errors.flexibility).toBeTruthy();
    expect(validateClub({ brand: '', model: 'Qi10', shaftBrand: 'Fujikura', loftDeg: '10,5', lieDeg: '56', shaftWeightG: '', bounceDeg: '' }).errors.brand).toBeTruthy();
  });
});

describe('validateRegistration', () => {
  const base = { name: ' Lê Văn Hải ', email: 'hai@example.com', phone: '0912 345 678', password: 'golf2026', handicap: '18,5', academy: '', yearsExperience: '' };
  const profiles = [{ email: 'Minh@GramGolf.vn', phone: '0901 234 567' }]; // seed lưu SĐT có khoảng trắng
  it('player hợp lệ: chuẩn hoá tên, SĐT, handicap kiểu VN; không trả mật khẩu', () => {
    const r = validateRegistration('player', base, profiles);
    expect(r.errors).toEqual({});
    expect(r.value).toEqual({ role: 'player', name: 'Lê Văn Hải', email: 'hai@example.com', phone: '0912345678', handicap: 18.5 });
  });
  it('coach hợp lệ: học viện + số năm, bỏ qua handicap', () => {
    const r = validateRegistration('coach', { ...base, handicap: 'x', academy: ' Học viện Golf ABC ', yearsExperience: '12' }, profiles);
    expect(r.errors).toEqual({});
    expect(r.value).toEqual({ role: 'coach', name: 'Lê Văn Hải', email: 'hai@example.com', phone: '0912345678', academy: 'Học viện Golf ABC', yearsExperience: 12 });
  });
  it('báo lỗi theo trường khi trống', () => {
    const empty = { name: ' ', email: '', phone: '', password: '', handicap: '', academy: '', yearsExperience: '' };
    expect(Object.keys(validateRegistration('player', empty, []).errors).sort()).toEqual(['email', 'handicap', 'name', 'password', 'phone']);
    const c = validateRegistration('coach', empty, []);
    expect(c.value).toBeNull();
    expect(Object.keys(c.errors).sort()).toEqual(['academy', 'email', 'name', 'password', 'phone', 'yearsExperience']);
  });
  it('email, SĐT, mật khẩu sai định dạng', () => {
    const r = validateRegistration('player', { ...base, email: 'hai@', phone: '912345678', password: 'golfgolf' }, []);
    expect(Object.keys(r.errors).sort()).toEqual(['email', 'password', 'phone']);
    expect(validateRegistration('player', { ...base, phone: '1912345678' }, []).errors.phone).toBeDefined();
    expect(validateRegistration('player', { ...base, password: 'g0lf' }, []).errors.password).toBeDefined();
  });
  it('handicap 0–54, số năm kinh nghiệm nguyên 0–60', () => {
    expect(validateRegistration('player', { ...base, handicap: '55' }, []).errors.handicap).toMatch(/0–54/);
    expect(validateRegistration('player', { ...base, handicap: '-1' }, []).errors.handicap).toMatch(/0–54/);
    expect(validateRegistration('player', { ...base, handicap: '0' }, []).value?.handicap).toBe(0);
    const coach = { ...base, academy: 'CLB' };
    expect(validateRegistration('coach', { ...coach, yearsExperience: '61' }, []).errors.yearsExperience).toMatch(/0–60/);
    expect(validateRegistration('coach', { ...coach, yearsExperience: '2,5' }, []).errors.yearsExperience).toBeDefined();
    expect(validateRegistration('coach', { ...coach, yearsExperience: '0' }, []).value?.yearsExperience).toBe(0);
  });
  it('email (không phân biệt hoa thường) / SĐT đã có tài khoản', () => {
    const r = validateRegistration('player', { ...base, email: ' minh@gramgolf.VN', phone: '0901234567' }, profiles);
    expect(r.value).toBeNull();
    expect(Object.keys(r.errors).sort()).toEqual(['email', 'phone']);
  });
});
