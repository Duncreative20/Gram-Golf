import { describe, expect, it } from 'vitest';
import { formatDistance, formatSpeed, formatTempo, formatDate, relativeTime, parseNumberVN, mToYd, ydToM, initials, statDelta, formatValue, vnDay, withVnDay } from './format';

describe('format', () => {
  it('đổi mét ↔ yard', () => {
    expect(mToYd(100)).toBeCloseTo(109.36, 2);
    expect(ydToM(109.36)).toBeCloseTo(100, 1);
  });
  it('hiển thị khoảng cách theo đơn vị', () => {
    expect(formatDistance(230, 'metric')).toBe('230 m');
    expect(formatDistance(230, 'imperial')).toBe('252 yd');
  });
  it('tốc độ, tempo', () => {
    expect(formatSpeed(104.6)).toBe('105 mph');
    expect(formatTempo(3.04)).toBe('3,0 : 1');
  });
  it('ngày kiểu VN và thời gian tương đối', () => {
    expect(formatDate('2026-10-05T09:00:00Z')).toBe('05/10/2026');
    const now = '2026-10-07T08:00:00Z';
    expect(relativeTime('2026-10-07T07:59:30Z', now)).toBe('Vừa xong');
    expect(relativeTime('2026-10-07T06:00:00Z', now)).toBe('2 giờ trước');
    expect(relativeTime('2026-10-04T08:00:00Z', now)).toBe('3 ngày trước');
    expect(relativeTime('2026-09-01T08:00:00Z', now)).toBe('01/09/2026');
  });
  it('ngày hiển thị theo giờ Việt Nam (UTC+7 cố định), qua nửa đêm VN là sang ngày mới', () => {
    expect(formatDate('2026-09-30T23:30:00Z')).toBe('01/10/2026');
    expect(formatDate('2026-10-05T16:59:59Z')).toBe('05/10/2026');
    expect(formatDate('2026-10-05T17:00:00Z')).toBe('06/10/2026');
    expect(formatDate('2026-12-31T17:00:00Z')).toBe('01/01/2027');
    expect(relativeTime('2026-09-30T23:30:00Z', '2026-10-08T00:00:00Z')).toBe('01/10/2026');
  });
  it('chênh lệch chỉ số: làm tròn trước khi xét dấu, tăng = tốt', () => {
    expect(statDelta(97.2 - 96.1, 0, 'mph')).toEqual({ text: '+1 mph', good: true });
    expect(statDelta(1.44 - 1.45, 2)).toEqual({ text: '-0,01', good: false });
    expect(statDelta(-0.004, 2)).toEqual({ text: '0,00', good: true });
    expect(statDelta(mToYd(198) - mToYd(193), 0, 'yd')).toEqual({ text: '+5 yd', good: true });
  });
  it('số kèm đơn vị kiểu VN: cách trước đơn vị chữ, liền với ° và /x, không digits thì giữ nguyên số', () => {
    expect(formatValue(104.2, 'mph', 0)).toBe('104 mph');
    expect(formatValue(104.2, 'mph')).toBe('104,2 mph');
    expect(formatValue(12.36, '°', 1)).toBe('12,4°');
    expect(formatValue(7, '/10')).toBe('7/10');
    expect(formatValue(1.456, '', 2)).toBe('1,46');
    expect(formatValue(1.56)).toBe('1,56');
    expect(formatValue(-10, '°')).toBe('-10°');
  });
  it('ngày cho DatePicker (ngày local) = ngày lịch VN của mốc ISO', () => {
    const d = vnDay('2026-09-30T23:30:00Z'); // 06:30 ngày 01/10 giờ VN
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 9, 1, 0]);
  });
  it('đổi ngày (lịch VN) theo ngày chọn trên DatePicker, giữ nguyên giờ trong ngày', () => {
    expect(withVnDay('2026-10-07T08:00:00Z', new Date(2026, 9, 5))).toBe('2026-10-05T08:00:00.000Z');
    expect(withVnDay('2026-09-30T23:30:00Z', new Date(2026, 8, 15))).toBe('2026-09-14T23:30:00.000Z'); // 06:30 VN ngày 15/09
    expect(formatDate(withVnDay('2026-10-07T08:00:00Z', vnDay('2026-10-01T03:00:00Z')))).toBe('01/10/2026');
  });
  it('đọc số kiểu VN', () => {
    expect(parseNumberVN('1,48')).toBe(1.48);
    expect(parseNumberVN(' 2.650 ')).toBe(2.65);
    expect(parseNumberVN('')).toBeNull();
    expect(parseNumberVN('abc')).toBeNull();
  });
  it('chữ tắt avatar = chữ đầu 2 từ cuối của tên', () => {
    expect(initials('Nguyễn Minh Anh')).toBe('MA');
    expect(initials('HLV Đỗ Minh Tuấn')).toBe('MT');
    expect(initials('  lan ')).toBe('L');
  });
  it('chữ tắt an toàn với tên rỗng / toàn khoảng trắng', () => {
    expect(initials('')).toBe('');
    expect(initials('   ')).toBe('');
  });
});
