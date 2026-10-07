import { describe, expect, it } from 'vitest';
import { seedState, NOW } from './mock';
import { speedTrend, carryByClub, latestSwing, unreadCount, needsFeedback, discover, likeCount, likedBy, clubsOf } from './selectors';

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
});
