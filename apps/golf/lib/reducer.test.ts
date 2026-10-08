import { describe, expect, it } from 'vitest';
import { reduce } from './reducer';
import { seedState, NOW } from './mock';
import { canViewPrivate, validateInvite, activeCoaches, feed, roster, clubById, clubsOf, pendingInvites, discover } from './selectors';

const s0 = () => seedState();

describe('kết nối HLV', () => {
  it('accept mã hợp lệ tạo kết nối active, đánh dấu mã đã dùng, báo HLV', () => {
    const s = reduce(s0(), { type: 'acceptInvite', code: 'TUAN24', playerId: 'p-huy', at: NOW, id: 'cx-1', notificationId: 'n-x' });
    const c = s.connections.find((x) => x.id === 'cx-1')!;
    expect(c).toMatchObject({ coachId: 'c-tuan', playerId: 'p-huy', status: 'active', isPrimary: true });
    expect(s.invites.find((i) => i.code === 'TUAN24')!.usedBy).toBe('p-huy');
    expect(s.notifications.some((n) => n.userId === 'c-tuan' && n.type === 'invite_accepted')).toBe(true);
  });
  it('mã không hợp lệ → state không đổi', () => {
    for (const code of ['NOPE', 'HAEXP1', 'USED01']) {
      const before = s0();
      expect(validateInvite(before, code, NOW)).not.toBe('ok');
      expect(reduce(before, { type: 'acceptInvite', code, playerId: 'p-huy', at: NOW, id: 'cx', notificationId: 'n' })).toBe(before);
    }
    expect(validateInvite(s0(), 'HAEXP1', NOW)).toBe('expired');
    expect(validateInvite(s0(), 'USED01', NOW)).toBe('used');
    expect(validateInvite(s0(), 'NOPE', NOW)).toBe('not_found');
    expect(validateInvite(s0(), 'tuan24', NOW)).toBe('ok'); // không phân biệt hoa thường
  });
  it('đã kết nối với HLV này hoặc không phải player → state không đổi, mã không bị tiêu', () => {
    const before = s0();
    expect(validateInvite(before, 'TUAN24', NOW, 'p-minh')).toBe('already_connected');
    expect(validateInvite(before, 'TUAN24', NOW, 'p-huy')).toBe('ok');
    expect(reduce(before, { type: 'acceptInvite', code: 'TUAN24', playerId: 'p-minh', at: NOW, id: 'cx', notificationId: 'n' })).toBe(before);
    expect(reduce(before, { type: 'acceptInvite', code: 'TUAN24', playerId: 'c-ha', at: NOW, id: 'cx', notificationId: 'n' })).toBe(before);
    expect(roster(before, 'c-tuan').map((p) => p.id)).toEqual(['p-minh', 'p-lan']);
  });
  it('player đã có HLV chính → kết nối mới không là chính', () => {
    const s = reduce(s0(), { type: 'acceptInvite', code: 'TUAN24', playerId: 'p-khoa', at: NOW, id: 'cx-2', notificationId: 'n' });
    expect(s.connections.find((x) => x.id === 'cx-2')!.isPrimary).toBe(false);
  });
  it('huỷ kết nối → HLV mất quyền ngay; HLV còn lại không tự thành chính', () => {
    const before = s0();
    const primary = before.connections.find((c) => c.coachId === 'c-tuan' && c.playerId === 'p-minh')!;
    expect(canViewPrivate(before, 'c-tuan', 'p-minh')).toBe(true);
    const s = reduce(before, { type: 'revokeConnection', id: primary.id, at: NOW });
    expect(canViewPrivate(s, 'c-tuan', 'p-minh')).toBe(false);
    expect(activeCoaches(s, 'p-minh').map((c) => [c.coach.id, c.connection.isPrimary])).toEqual([['c-ha', false]]);
    expect(roster(s, 'c-tuan').map((p) => p.id)).not.toContain('p-minh');
  });
  it('lời mời đang chờ chỉ gồm mã còn hiệu lực của đúng HLV; thu hồi → rời danh sách, nhập mã báo "revoked", không tạo kết nối', () => {
    expect(pendingInvites(s0(), 'c-tuan', NOW).map((i) => i.code)).toEqual(['TUAN24']); // USED01 đã dùng
    expect(pendingInvites(s0(), 'c-ha', NOW)).toEqual([]); // HAEXP1 hết hạn
    const s = reduce(s0(), { type: 'revokeInvite', code: 'TUAN24' });
    expect(pendingInvites(s, 'c-tuan', NOW)).toEqual([]);
    expect(validateInvite(s, 'TUAN24', NOW, 'p-huy')).toBe('revoked');
    expect(reduce(s, { type: 'acceptInvite', code: 'TUAN24', playerId: 'p-huy', at: NOW, id: 'cx', notificationId: 'n' })).toBe(s);
  });
  it('setPrimaryCoach chỉ để đúng 1 HLV chính', () => {
    const s = s0();
    const ha = s.connections.find((c) => c.coachId === 'c-ha' && c.playerId === 'p-minh')!;
    const s2 = reduce(s, { type: 'setPrimaryCoach', connectionId: ha.id });
    expect(activeCoaches(s2, 'p-minh').filter((c) => c.connection.isPrimary).map((c) => c.coach.id)).toEqual(['c-ha']);
  });
});

describe('quyền xem', () => {
  it('follow không mở dữ liệu riêng; chính mình luôn xem được', () => {
    const s = s0();
    expect(s.follows.some((f) => f.followerId === 'p-khoa' && f.followedId === 'p-minh')).toBe(true);
    expect(canViewPrivate(s, 'p-khoa', 'p-minh')).toBe(false);
    expect(canViewPrivate(s, 'p-minh', 'p-minh')).toBe(true);
    expect(canViewPrivate(s, 'c-ha', 'p-lan')).toBe(false); // kết nối đã revoked
  });
});

describe('xã hội', () => {
  it('toggleFollow bật/tắt, không tự follow', () => {
    const s = reduce(s0(), { type: 'toggleFollow', followerId: 'p-huy', followedId: 'c-tuan', at: NOW, notificationId: 'n' });
    expect(s.follows).toContainEqual({ followerId: 'p-huy', followedId: 'c-tuan' });
    const s2 = reduce(s, { type: 'toggleFollow', followerId: 'p-huy', followedId: 'c-tuan', at: NOW, notificationId: 'n2' });
    expect(s2.follows).not.toContainEqual({ followerId: 'p-huy', followedId: 'c-tuan' });
    const s3 = reduce(s0(), { type: 'toggleFollow', followerId: 'p-huy', followedId: 'p-huy', at: NOW, notificationId: 'n' });
    expect(s3.follows.some((f) => f.followerId === 'p-huy' && f.followedId === 'p-huy')).toBe(false);
  });
  it('chặn: gỡ follow 2 chiều, ẩn khỏi feed', () => {
    const before = s0();
    expect(feed(before, 'p-minh').some((p) => p.authorId === 'p-khoa')).toBe(true);
    const s = reduce(before, { type: 'block', blockerId: 'p-minh', blockedId: 'p-khoa' });
    expect(s.follows.some((f) => [f.followerId, f.followedId].sort().join() === ['p-khoa', 'p-minh'].sort().join())).toBe(false);
    expect(feed(s, 'p-minh').some((p) => p.authorId === 'p-khoa')).toBe(false);
    expect(feed(s, 'p-khoa').some((p) => p.authorId === 'p-minh')).toBe(false);
    expect(discover(s, 'p-minh', '').some((p) => p.id === 'p-khoa')).toBe(false);
    expect(discover(s, 'p-khoa', '').some((p) => p.id === 'p-minh')).toBe(false);
  });
  it('toggleFollow không có tác dụng khi một trong hai đã chặn người kia (cả hai chiều, không gửi thông báo)', () => {
    const s = reduce(s0(), { type: 'block', blockerId: 'p-minh', blockedId: 'p-huy' });
    for (const [followerId, followedId] of [['p-huy', 'p-minh'], ['p-minh', 'p-huy']] as const) {
      expect(reduce(s, { type: 'toggleFollow', followerId, followedId, at: NOW, notificationId: 'n' })).toBe(s);
    }
  });
  it('bỏ chặn: chỉ gỡ đúng chiều mình chặn, không khôi phục follow; người kia hiện lại ở khám phá', () => {
    const blocked = reduce(s0(), { type: 'block', blockerId: 'p-minh', blockedId: 'p-khoa' });
    const s = reduce(blocked, { type: 'unblock', blockerId: 'p-minh', blockedId: 'p-khoa' });
    expect(s.blocks).toEqual([]);
    expect(discover(s, 'p-minh', '').some((p) => p.id === 'p-khoa')).toBe(true);
    expect(s.follows).toEqual(blocked.follows);
    // hai chiều cùng chặn → bỏ chặn của mình vẫn còn chặn của người kia
    const both = reduce(blocked, { type: 'block', blockerId: 'p-khoa', blockedId: 'p-minh' });
    expect(reduce(both, { type: 'unblock', blockerId: 'p-minh', blockedId: 'p-khoa' }).blocks).toEqual([{ blockerId: 'p-khoa', blockedId: 'p-minh' }]);
  });
  it('toggleLike idempotent theo cặp', () => {
    const post = s0().posts[0]!;
    const s = reduce(s0(), { type: 'toggleLike', userId: 'p-huy', postId: post.id, at: NOW, notificationId: 'n' });
    const s2 = reduce(s, { type: 'toggleLike', userId: 'p-huy', postId: post.id, at: NOW, notificationId: 'n2' });
    expect(s.likes.filter((l) => l.userId === 'p-huy' && l.postId === post.id).length).toBe(1);
    expect(s2.likes.some((l) => l.userId === 'p-huy' && l.postId === post.id)).toBe(false);
  });
});

describe('swing', () => {
  it('ghi chú HLV báo cho học viên', () => {
    const sw = s0().swings.find((x) => x.playerId === 'p-minh')!;
    const s = reduce(s0(), { type: 'addNote', note: { id: 'note-x', swingId: sw.id, coachId: 'c-tuan', atSec: 1.3, text: 'Tốt', createdAt: NOW }, notificationId: 'n-y' });
    expect(s.notes.some((n) => n.id === 'note-x')).toBe(true);
    expect(s.notifications.find((n) => n.id === 'n-y')).toMatchObject({ userId: 'p-minh', type: 'coach_note', refId: sw.id });
  });
  it('job succeeded lưu analysis và báo analysis_done', () => {
    const sw = s0().swings.find((x) => x.job.status === 'none')!;
    const s = reduce(s0(), { type: 'jobUpdate', id: sw.id, status: 'succeeded', progress: 1, analysis: s0().swings.find((x) => x.analysis)!.analysis, at: NOW, notificationId: 'n-z' });
    expect(s.swings.find((x) => x.id === sw.id)!.analysis).toBeDefined();
    expect(s.notifications.some((n) => n.id === 'n-z' && n.type === 'analysis_done')).toBe(true);
  });
  it('tiến độ tải lên / job nằm trong store (danh sách đọc được); job chưa xong không tạo thông báo', () => {
    const sw = s0().swings.find((x) => x.job.status === 'none')!;
    const up = reduce(s0(), { type: 'uploadUpdate', id: sw.id, status: 'uploading', progress: 0.45 });
    expect(up.swings.find((x) => x.id === sw.id)!.upload).toEqual({ status: 'uploading', progress: 0.45 });
    const before = s0();
    const job = reduce(before, { type: 'jobUpdate', id: sw.id, status: 'processing', progress: 0.4, at: NOW, notificationId: 'n-p' });
    expect(job.swings.find((x) => x.id === sw.id)!.job).toEqual({ status: 'processing', progress: 0.4 });
    expect(job.notifications).toBe(before.notifications);
  });
  it('xoá swing xoá luôn ghi chú HLV của nó (lời hứa của Dialog xoá), ghi chú swing khác giữ nguyên', () => {
    const before = s0();
    const s = reduce(before, { type: 'deleteSwing', id: 'sw-minh-2' });
    expect(s.swings.some((w) => w.id === 'sw-minh-2')).toBe(false);
    expect(s.notes.map((n) => n.id)).toEqual(['note-1']);
    expect(before.notes.filter((n) => n.swingId === 'sw-minh-2')).toHaveLength(2);
  });
});

describe('bộ gậy', () => {
  it('upsertClub: id mới thì thêm, id đã có thì thay tại chỗ (sửa gậy không tạo bản sao)', () => {
    const before = s0();
    const driver = before.clubs.find((c) => c.id === 'cl-driver')!;
    const edited = reduce(before, { type: 'upsertClub', club: { ...driver, loftDeg: 9 } });
    expect(edited.clubs).toHaveLength(before.clubs.length);
    expect(edited.clubs.findIndex((c) => c.id === 'cl-driver')).toBe(before.clubs.indexOf(driver));
    expect(clubById(edited, 'cl-driver')?.loftDeg).toBe(9);
    const added = reduce(before, { type: 'upsertClub', club: { ...driver, id: 'cl-new' } });
    expect(added.clubs).toHaveLength(before.clubs.length + 1);
  });
  it('lưu trữ gậy: ẩn khỏi danh sách; phiên/swing cũ vẫn gắn gậy và vẫn đọc được gậy', () => {
    const s = reduce(s0(), { type: 'archiveClub', id: 'cl-driver', at: NOW });
    expect(clubsOf(s, 'p-minh').map((c) => c.id)).not.toContain('cl-driver');
    expect(clubById(s, 'cl-driver')).toMatchObject({ type: 'Driver', archivedAt: NOW });
    expect(s.sessions.filter((x) => x.clubId === 'cl-driver')).toHaveLength(6);
    expect(s.swings.filter((w) => w.clubId === 'cl-driver')).toHaveLength(1);
  });
});
