import { describe, expect, it } from 'vitest';
import { seedState, NOW } from './mock';
import type { Club, ClubType } from './domain';
import { speedTrend, carryByClub, latestSwing, unreadCount, needsFeedback, discover, likeCount, likedBy, clubsOf, previousSwing, latestNote, groupClubs } from './selectors';

describe('selectors', () => {
  const s = seedState();
  it('xu hướng tốc độ: 5 phiên swing gần nhất, cũ → mới', () => {
    const t = speedTrend(s, 'p-minh');
    expect(t.length).toBe(5);
    expect(t.map((x) => x.date)).toEqual([...t.map((x) => x.date)].sort());
  });
  it('carry theo gậy: tối đa 3 gậy, giảm dần', () => {
    const c = carryByClub(s, 'p-minh');
    expect(c.length).toBe(3);
    expect(c[0]!.carryM).toBeGreaterThanOrEqual(c[1]!.carryM);
  });
  it('phiên swing mới nhất', () => { expect(latestSwing(s, 'p-minh')?.kind).toBe('swing'); });
  it('phiên swing liền trước cùng gậy (để tính chênh lệch)', () => {
    const at = (id: string) => s.sessions.find((x) => x.id === id)!;
    expect(previousSwing(s, latestSwing(s, 'p-minh')!)?.id).toBe('ss-w0'); // Gỗ 3: bỏ qua phiên Sắt 7/Driver xen giữa
    expect(previousSwing(s, at('ss-d6'))?.id).toBe('ss-d5');
    expect(previousSwing(s, at('ss-d1'))).toBeUndefined(); // phiên Driver đầu tiên
    expect(previousSwing(s, { ...at('ss-d6'), clubId: undefined })).toBeUndefined();
  });
  it('ghi chú HLV mới nhất trên swing của chính mình', () => {
    expect(latestNote(s, 'p-minh')?.id).toBe('note-1');
    expect(latestNote(s, 'p-huy')).toBeUndefined();
    const s2 = { ...s, notes: [...s.notes, { id: 'note-x', swingId: 'sw-lan-1', coachId: 'c-tuan', text: 'Giữ đầu ổn định.', createdAt: NOW }] };
    expect(latestNote(s2, 'p-minh')?.id).toBe('note-1'); // ghi chú mới hơn trên swing người khác không lọt sang
    expect(latestNote(s2, 'p-lan')?.id).toBe('note-x');
  });
  it('đếm thông báo chưa đọc', () => { expect(unreadCount(s, 'p-minh')).toBe(2); });
  it('HLV: học viên cần phản hồi', () => { expect(needsFeedback(s, 'c-tuan').map((p) => p.id)).toEqual(['p-lan']); });
  it('khám phá: không gồm chính mình, lọc tên không dấu', () => {
    expect(discover(s, 'p-minh', '').some((p) => p.id === 'p-minh')).toBe(false);
    expect(discover(s, 'p-minh', 'tuan').map((p) => p.id)).toEqual(['c-tuan']);
  });
  it('like', () => {
    const p = s.posts[0]!;
    expect(likeCount(s, p.id)).toBe(s.likes.filter((l) => l.postId === p.id).length);
    expect(typeof likedBy(s, 'p-minh', p.id)).toBe('boolean');
  });
  it('gậy đã lưu trữ không hiện', () => {
    expect(clubsOf(s, 'p-minh').every((c) => !c.archivedAt)).toBe(true);
  });
  it('gậy theo nhóm: đúng thứ tự nhóm, trong nhóm theo thứ tự loại (không theo thứ tự thêm), bỏ nhóm trống', () => {
    const club = (id: string, type: ClubType): Club => ({ id, playerId: 'p-x', type, brand: 'B', model: 'M', shaftBrand: 'S', shaftFlex: 'Regular', loftDeg: 20, lieDeg: 60 });
    const groups = groupClubs([club('i7', 'Sắt 7'), club('w3', 'Gỗ 3'), club('sw', 'SW'), club('dr', 'Driver'), club('cu', 'Tuỳ chỉnh'), club('pw', 'PW')]);
    expect(groups.map((g) => [g.label, g.clubs.map((c) => c.id)])).toEqual([
      ['Gỗ', ['dr', 'w3']],
      ['Sắt', ['i7']],
      ['Wedge', ['pw', 'sw']],
      ['Khác', ['cu']],
    ]);
  });
});
