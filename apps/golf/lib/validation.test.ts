import { describe, expect, it } from 'vitest';
import { CLUB_TYPES } from './domain';
import { seedState } from './mock';
import { validateSwingMetrics, validateFitnessMetrics, validateClub, validateRegistration, validatePost, addTags, SWING_FIELDS, swingFields, rangeText, defaultLoft, loftOnTypeChange, clubRaw, type ClubRaw } from './validation';

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
    expect(validateClub({ ...clubRaw(), type: 'Driver', model: 'Qi10', shaftBrand: 'Fujikura', loftDeg: '10,5', lieDeg: '56' }).errors.brand).toBeTruthy();
  });
  it('khoảng hợp lệ viết số kiểu VN, đơn vị liền với ° và /x', () => {
    expect(rangeText(SWING_FIELDS[0]!)).toBe('40–150 mph');
    const r = validateSwingMetrics({ clubSpeedMph: '104', ballSpeedMph: '152', smash: '1,7', spinRpm: '2650', launchDeg: '50', carryM: '228' });
    expect(r.errors.smash).toBe('Trong khoảng 1–1,56');
    expect(r.errors.launchDeg).toBe('Trong khoảng -10–45°');
    expect(validateFitnessMetrics({ weightKg: '72', flexibility: '11', gripStrengthKg: '45', verticalJumpCm: '48' }).errors.flexibility).toBe('Trong khoảng 0–10/10');
  });
});

describe('carry theo đơn vị hiển thị (D9: luôn lưu mét)', () => {
  const raw = { clubSpeedMph: '104', ballSpeedMph: '152', smash: '1,46', spinRpm: '2650', launchDeg: '12,5', carryM: '250' };
  it('metric: giữ nguyên SWING_FIELDS, carry nhập mét', () => {
    expect(swingFields('metric')).toBe(SWING_FIELDS);
    expect(validateSwingMetrics(raw, 'metric').value?.carryM).toBe(250);
  });
  it('imperial: carry nhập yard, khoảng đổi sang yard mà vẫn nằm trong 10–350 m', () => {
    expect(swingFields('imperial').find((f) => f.key === 'carryM')).toMatchObject({ unit: 'yd', min: 11, max: 382 });
    expect(swingFields('imperial').filter((f) => f.key !== 'carryM')).toEqual(SWING_FIELDS.filter((f) => f.key !== 'carryM'));
  });
  it('imperial: lưu carry đã đổi về mét; ngoài khoảng yard báo lỗi bằng yard', () => {
    expect(validateSwingMetrics(raw, 'imperial').value?.carryM).toBeCloseTo(228.6, 1);
    const r = validateSwingMetrics({ ...raw, carryM: '383' }, 'imperial');
    expect(r.value).toBeNull();
    expect(r.errors.carryM).toBe('Trong khoảng 11–382 yd');
  });
});

describe('gậy: validateClub, loft gợi ý, giá trị ban đầu của form', () => {
  const base: ClubRaw = {
    type: 'Driver', customName: '', brand: ' TaylorMade ', model: 'Qi10', shaftBrand: 'Fujikura Ventus Blue 6', shaftFlex: 'Stiff',
    shaftWeightG: '', loftDeg: '10,5', lieDeg: '56', bounceDeg: '',
  };
  it('hợp lệ: chữ được trim, số kiểu VN; ô tuỳ chọn để trống thì không có giá trị', () => {
    expect(validateClub(base)).toEqual({
      errors: {},
      value: { type: 'Driver', brand: 'TaylorMade', model: 'Qi10', shaftBrand: 'Fujikura Ventus Blue 6', shaftFlex: 'Stiff', loftDeg: 10.5, lieDeg: 56 },
    });
    expect(validateClub({ ...base, shaftWeightG: '63', bounceDeg: '12,5' }).value).toMatchObject({ shaftWeightG: 63, bounceDeg: 12.5 });
  });
  it('lỗi theo trường như form số liệu: trống / không phải số / ngoài khoảng kèm đơn vị', () => {
    const r = validateClub({ ...base, type: undefined, brand: ' ', loftDeg: '', lieDeg: 'abc', shaftWeightG: '20', bounceDeg: '25' });
    expect(r.value).toBeNull();
    expect(r.errors).toEqual({ type: 'Bắt buộc', brand: 'Bắt buộc', loftDeg: 'Bắt buộc', lieDeg: 'Không phải số', shaftWeightG: 'Trong khoảng 30–150 g', bounceDeg: 'Trong khoảng 0–20°' });
    expect(validateClub({ ...base, lieDeg: '90' }).errors).toEqual({ lieDeg: 'Trong khoảng 45–80°' });
  });
  it('gậy tuỳ chỉnh bắt buộc tên; loại khác không lưu tên tuỳ chỉnh còn sót', () => {
    expect(validateClub({ ...base, type: 'Tuỳ chỉnh', customName: '  ' }).errors).toEqual({ customName: 'Bắt buộc' });
    expect(validateClub({ ...base, type: 'Tuỳ chỉnh', customName: ' Chipper 37° ' }).value?.customName).toBe('Chipper 37°');
    expect(validateClub({ ...base, customName: 'Chipper' }).value?.customName).toBeUndefined();
  });
  it('loft gợi ý theo loại: sắt 4 = 21°, mỗi số sắt +3,5°; gậy tuỳ chỉnh không có', () => {
    expect(defaultLoft('Sắt 4')).toBe(21);
    expect(defaultLoft('Sắt 7')).toBe(31.5);
    expect(defaultLoft('Sắt 9')).toBe(38.5);
    expect(defaultLoft('Driver')).toBe(10.5);
    expect(defaultLoft('LW')).toBe(60);
    expect(defaultLoft('Tuỳ chỉnh')).toBeUndefined();
  });
  it('loại nào (trừ tuỳ chỉnh) cũng có loft gợi ý, và gợi ý qua được validateClub', () => {
    for (const type of CLUB_TYPES) {
      const loft = defaultLoft(type);
      expect(loft, type).toBeDefined();
      expect(validateClub({ ...base, type, loftDeg: String(loft) }).errors, type).toEqual({});
    }
  });
  it('đổi loại gậy: ô loft trống hoặc còn đúng gợi ý của loại cũ → gợi ý mới; người dùng đã tự nhập → giữ nguyên', () => {
    expect(loftOnTypeChange('', undefined, 'Driver')).toBe('10,5');
    expect(loftOnTypeChange(' ', 'Driver', 'Hybrid 4')).toBe('22');
    expect(loftOnTypeChange('10,5', 'Driver', 'Gỗ 3')).toBe('15');
    expect(loftOnTypeChange('10.5', 'Driver', 'Sắt 7')).toBe('31,5');
    expect(loftOnTypeChange('9', 'Driver', 'Gỗ 3')).toBe('9');
    expect(loftOnTypeChange('10,5', 'Driver', 'Tuỳ chỉnh')).toBe('');
    expect(loftOnTypeChange('17', 'Tuỳ chỉnh', 'Driver')).toBe('17');
  });
  it('form gậy mới bắt đầu trống (flex Regular); mở form sửa rồi lưu nguyên → gậy không đổi', () => {
    expect(clubRaw()).toEqual({ type: undefined, customName: '', brand: '', model: '', shaftBrand: '', shaftFlex: 'Regular', shaftWeightG: '', loftDeg: '', lieDeg: '', bounceDeg: '' });
    for (const c of seedState().clubs) {
      const { id, playerId, ...fields } = c;
      expect(validateClub(clubRaw(c)).value, `${id} của ${playerId}`).toEqual(fields);
    }
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

describe('bài viết', () => {
  it('tiêu đề và nội dung bắt buộc (bỏ khoảng trắng hai đầu), tối đa 120 / 2000 ký tự', () => {
    expect(validatePost({ title: '  Tempo 3:1 ', content: ' Đếm nhịp khi lên gậy. ' })).toEqual({ errors: {}, value: { title: 'Tempo 3:1', content: 'Đếm nhịp khi lên gậy.' } });
    expect(validatePost({ title: ' ', content: '\n' })).toEqual({ errors: { title: 'Bắt buộc', content: 'Bắt buộc' }, value: null });
    expect(validatePost({ title: 'a'.repeat(121), content: 'b'.repeat(2001) })).toEqual({ errors: { title: 'Tối đa 120 ký tự', content: 'Tối đa 2000 ký tự' }, value: null });
    expect(validatePost({ title: 'a'.repeat(120), content: 'b'.repeat(2000) }).value).not.toBeNull();
  });
  it('tag: chữ thường, bỏ "#" và khoảng trắng thừa, tách theo dấu phẩy, bỏ trùng, tối đa 5', () => {
    expect(addTags([], 'Driver')).toEqual(['driver']);
    expect(addTags(['driver'], ' #DRIVER , Tempo,,  short   game ')).toEqual(['driver', 'tempo', 'short game']);
    expect(addTags(['a', 'b', 'c', 'd'], 'e, f, g')).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(addTags(['a'], ' , #, ')).toEqual(['a']);
  });
});
