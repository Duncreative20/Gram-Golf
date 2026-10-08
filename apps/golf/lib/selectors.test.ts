import { describe, expect, it } from 'vitest';
import { seedState, NOW } from './mock';
import type { AppState, Club, ClubType } from './domain';
import { speedTrend, carryByClub, latestSwing, unreadCount, needsFeedback, awaitsFeedback, discover, likeCount, likedBy, clubsOf, previousSwing, latestNote, groupClubs, commentsOf, isBlocked } from './selectors';

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
  it('carry theo gậy: bỏ gậy đã lưu trữ (gậy đã thay không chiếm chỗ của gậy đang dùng)', () => {
    const s2: AppState = { ...s, clubs: s.clubs.map((c) => (c.id === 'cl-driver' ? { ...c, archivedAt: NOW } : c)) };
    expect(carryByClub(s2, 'p-minh').map((c) => c.club.id)).toEqual(['cl-wood3', 'cl-iron7']);
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
  it('HLV: học viên cần phản hồi', () => {
    expect(needsFeedback(s, 'c-tuan').map((p) => p.id)).toEqual(['p-lan']);
    expect(needsFeedback(s, 'c-ha').map((p) => p.id)).toEqual(['p-minh']); // ghi chú của c-tuan không tính cho c-ha; p-khoa chưa có swing
  });
  it('HLV: swing chờ phản hồi = đã có kết quả phân tích và chính HLV đó chưa ghi chú', () => {
    const w = (id: string) => s.swings.find((x) => x.id === id)!;
    expect(awaitsFeedback(s, w('sw-lan-1'), 'c-tuan')).toBe(true);
    expect(awaitsFeedback(s, w('sw-minh-1'), 'c-tuan')).toBe(false); // c-tuan đã ghi chú
    expect(awaitsFeedback(s, w('sw-minh-1'), 'c-ha')).toBe(true); // ghi chú của HLV khác không tính
    expect(awaitsFeedback(s, w('sw-minh-3'), 'c-tuan')).toBe(false); // chưa phân tích
  });
  it('khám phá: không gồm chính mình, lọc tên không dấu', () => {
    expect(discover(s, 'p-minh', '').some((p) => p.id === 'p-minh')).toBe(false);
    expect(discover(s, 'p-minh', 'tuan').map((p) => p.id)).toEqual(['c-tuan']);
  });
  it('bình luận theo thứ tự thời gian; ẩn bình luận của người đã chặn / bị chặn với người xem (hai chiều), người khác vẫn thấy', () => {
    const ids = (st: AppState, post: string, viewer: string) => commentsOf(st, post, viewer).map((c) => c.id);
    expect(ids(s, 'post-4', 'p-minh')).toEqual(['cm-2', 'cm-3']);
    const b: AppState = { ...s, blocks: [{ blockerId: 'p-minh', blockedId: 'p-khoa' }] };
    expect(isBlocked(b, 'p-khoa', 'p-minh')).toBe(true);
    expect(ids(b, 'post-4', 'p-minh')).toEqual(['cm-2']); // p-minh chặn p-khoa → không thấy bình luận của p-khoa
    expect(ids(b, 'post-5', 'p-khoa')).toEqual([]); // p-khoa bị p-minh chặn → cũng không thấy bình luận của p-minh
    expect(ids(b, 'post-4', 'c-tuan')).toEqual(['cm-2', 'cm-3']); // người thứ ba vẫn thấy đủ
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
