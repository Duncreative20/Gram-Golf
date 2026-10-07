import { describe, expect, it } from 'vitest';
import { formatDistance, formatSpeed, formatTempo, formatDate, relativeTime, parseNumberVN, mToYd, ydToM } from './format';

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
  it('đọc số kiểu VN', () => {
    expect(parseNumberVN('1,48')).toBe(1.48);
    expect(parseNumberVN(' 2.650 ')).toBe(2.65);
    expect(parseNumberVN('')).toBeNull();
    expect(parseNumberVN('abc')).toBeNull();
  });
});
