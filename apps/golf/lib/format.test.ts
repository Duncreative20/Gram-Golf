import { describe, expect, it } from 'vitest';
import { formatDistance, formatSpeed, formatTempo, formatDate, relativeTime, parseNumberVN, mToYd, ydToM, initials, statDelta, formatValue, vnDay, withVnDay, formatSec, timeLeft, formatVnd, parseInviteCode } from './format';

describe('format', () => {
  it('mốc thời gian video: 1 chữ số thập phân kiểu VN + "s" (như "Ghi chú tại 1,3s")', () => {
    expect(formatSec(1.32)).toBe('1,3s');
    expect(formatSec(4.2)).toBe('4,2s');
    expect(formatSec(0)).toBe('0,0s');
    expect(formatSec(0.1 + 0.2)).toBe('0,3s'); // vị trí phát cộng dồn 0,1 s không lộ sai số thực
  });
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
  it('thời gian còn lại tới hạn mã mời: làm tròn xuống, tới đúng mốc là hết hạn', () => {
    const now = '2026-10-07T08:00:00Z';
    expect(timeLeft('2026-10-14T08:00:00Z', now)).toBe('Còn 7 ngày');
    expect(timeLeft('2026-10-14T02:00:00Z', now)).toBe('Còn 6 ngày'); // 6 ngày 18 giờ
    expect(timeLeft('2026-10-08T07:00:00Z', now)).toBe('Còn 23 giờ');
    expect(timeLeft('2026-10-07T08:45:00Z', now)).toBe('Còn 45 phút');
    expect(timeLeft('2026-10-07T08:00:30Z', now)).toBe('Còn 1 phút'); // dưới 1 phút không hiện "Còn 0 phút"
    expect(timeLeft(now, now)).toBe('Hết hạn');
    expect(timeLeft('2026-10-01T02:00:00Z', now)).toBe('Hết hạn');
  });
  it('tiền VND: phân cách nghìn bằng dấu chấm', () => {
    expect(formatVnd(450000)).toBe('450.000 đ');
    expect(formatVnd(1250000)).toBe('1.250.000 đ');
    expect(formatVnd(900)).toBe('900 đ');
    expect(formatVnd(0)).toBe('0 đ');
  });
  it('mã mời người dùng gõ/dán: in hoa, bỏ ký tự lạ, dán link mời cũng lấy được mã, tối đa 6 ký tự', () => {
    expect(parseInviteCode('tuan24')).toBe('TUAN24');
    expect(parseInviteCode(' tu-an 24 ')).toBe('TUAN24');
    expect(parseInviteCode('https://gramgolf.app/i/tuan24')).toBe('TUAN24');
    expect(parseInviteCode('Mã của mình: https://gramgolf.app/i/AB23CD nhé')).toBe('AB23CD');
    expect(parseInviteCode('ABCDEFGH')).toBe('ABCDEF');
    expect(parseInviteCode('')).toBe('');
  });
});
