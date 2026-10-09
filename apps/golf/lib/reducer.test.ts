import { describe, expect, it } from 'vitest';
import { reduce } from './reducer';
import { seedState, NOW } from './mock';
import type { AppState, MetricSession, UploadStatus } from './domain';
import { canViewPrivate, validateInvite, activeCoaches, feed, roster, clubById, clubsOf, pendingInvites, discover, connectionRequests, archivedClubsOf, clubLinkCount } from './selectors';

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
  it('hai bên đã chặn nhau (chiều nào cũng vậy) → nhập mã báo "not_found", không tạo kết nối, mã không bị tiêu', () => {
    for (const [blockerId, blockedId] of [['c-tuan', 'p-huy'], ['p-huy', 'c-tuan']]) {
      const before = reduce(s0(), { type: 'block', blockerId, blockedId });
      expect(validateInvite(before, 'TUAN24', NOW, 'p-huy')).toBe('not_found');
      expect(reduce(before, { type: 'acceptInvite', code: 'TUAN24', playerId: 'p-huy', at: NOW, id: 'cx', notificationId: 'n' })).toBe(before);
      expect(before.invites.find((i) => i.code === 'TUAN24')!.usedBy).toBeUndefined();
    }
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
  it('thích → bỏ thích → thích lại: tác giả nhận đúng 1 thông báo like', () => {
    const like = (s: AppState, nid: string) => reduce(s, { type: 'toggleLike', userId: 'p-huy', postId: 'post-1', at: NOW, notificationId: nid });
    const s = like(like(like(s0(), 'n-1'), 'n-2'), 'n-3');
    expect(s.notifications.filter((n) => n.type === 'like' && n.actorId === 'p-huy' && n.refId === 'post-1').map((n) => n.id)).toEqual(['n-1']);
  });
  it('xoá bài: mất lượt thích, bình luận và thông báo trỏ tới bài', () => {
    const before = s0();
    const s = reduce(before, { type: 'deletePost', id: 'post-4' });
    expect(s.posts.some((p) => p.id === 'post-4')).toBe(false);
    expect(s.likes).toEqual(before.likes.filter((l) => l.postId !== 'post-4'));
    expect(s.likes).toHaveLength(before.likes.length - 2);
    expect(s.comments.map((c) => c.id)).toEqual(['cm-1', 'cm-4']);
    expect(s.notifications.map((n) => n.id)).toEqual(before.notifications.filter((n) => n.id !== 'nt-3').map((n) => n.id)); // nt-3: like post-4
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
    const up = reduce(s0(), { type: 'uploadUpdate', id: sw.id, status: 'uploading', progress: 0.45, at: NOW, notificationId: 'n-u' });
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
  it('xoá swing xoá thông báo trỏ tới nó (chạm thông báo không mở "Không tìm thấy")', () => {
    const before = s0();
    const s = reduce(before, { type: 'deleteSwing', id: 'sw-minh-1' });
    expect(s.notifications.map((n) => n.id)).toEqual(before.notifications.filter((n) => n.refId !== 'sw-minh-1').map((n) => n.id));
    expect(s.notifications).toHaveLength(before.notifications.length - 2); // nt-1 coach_note, nt-4 analysis_done
  });
  it('job xong báo analysis_done 1 lần dù nhận trạng thái cuối 2 lần (2 màn cùng swing cùng chạy job)', () => {
    const sw = s0().swings.find((x) => x.job.status === 'none')!;
    const analysis = s0().swings.find((x) => x.analysis)!.analysis;
    const done = (s: AppState, nid: string) => reduce(s, { type: 'jobUpdate', id: sw.id, status: 'succeeded', progress: 1, analysis, at: NOW, notificationId: nid });
    const s = done(done(s0(), 'n-1'), 'n-2');
    expect(s.notifications.filter((n) => n.type === 'analysis_done' && n.refId === sw.id).map((n) => n.id)).toEqual(['n-1']);
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

describe('lời mời / yêu cầu kết nối 2 chiều (D5 xét lúc kích hoạt)', () => {
  const req = (s: AppState, coachId: string, playerId: string, by: 'coach' | 'player', id = 'rq-1') =>
    reduce(s, { type: 'requestConnection', id, coachId, playerId, by, at: NOW, notificationId: `n-${id}` });
  it('HLV mời người chơi cụ thể → kết nối chờ (chưa có quyền xem), người chơi nhận connect_request', () => {
    const s = req(s0(), 'c-tuan', 'p-huy', 'coach');
    expect(s.connections.find((c) => c.id === 'rq-1')).toMatchObject({ status: 'pending', requestedBy: 'coach', isPrimary: false, invitedAt: NOW });
    expect(s.notifications.find((n) => n.id === 'n-rq-1')).toMatchObject({ userId: 'p-huy', type: 'connect_request', actorId: 'c-tuan', refId: 'rq-1' });
    expect(canViewPrivate(s, 'c-tuan', 'p-huy')).toBe(false);
    expect(connectionRequests(s, 'p-huy').incoming.map((c) => c.id)).toEqual(['rq-1']);
    expect(connectionRequests(s, 'c-tuan').outgoing.map((c) => c.id)).toEqual(['rq-1']);
  });
  it('người chơi gửi yêu cầu tới HLV → HLV nhận connect_request; dữ liệu mẫu có sẵn yêu cầu p-huy → c-ha', () => {
    const s = req(s0(), 'c-tuan', 'p-huy', 'player');
    expect(s.notifications.find((n) => n.id === 'n-rq-1')).toMatchObject({ userId: 'c-tuan', type: 'connect_request', actorId: 'p-huy' });
    expect(connectionRequests(s0(), 'c-ha').incoming.map((c) => c.id)).toEqual(['cn-ha-huy']);
  });
  it('không tạo kết nối mở thứ 2 cho cùng cặp; sai vai trò hoặc hai bên đã chặn nhau → không đổi', () => {
    const b = s0();
    expect(req(b, 'c-tuan', 'p-minh', 'player')).toBe(b); // đã active
    expect(req(b, 'c-ha', 'p-huy', 'coach')).toBe(b); // đã có yêu cầu chờ theo chiều ngược lại
    expect(req(b, 'p-minh', 'p-huy', 'coach')).toBe(b); // coachId không phải HLV
    expect(req(b, 'c-tuan', 'c-ha', 'coach')).toBe(b); // playerId không phải người chơi
    const blocked = reduce(b, { type: 'block', blockerId: 'p-huy', blockedId: 'c-tuan' });
    expect(req(blocked, 'c-tuan', 'p-huy', 'coach')).toBe(blocked);
  });
  it('chấp nhận → active; chính/phụ theo D5 lúc chấp nhận; bên gửi nhận invite_accepted', () => {
    const s = req(s0(), 'c-tuan', 'p-huy', 'coach');
    const ok = reduce(s, { type: 'respondConnection', id: 'rq-1', accept: true, at: NOW, notificationId: 'n-ok' });
    expect(ok.connections.find((c) => c.id === 'rq-1')).toMatchObject({ status: 'active', isPrimary: true, acceptedAt: NOW });
    expect(ok.notifications.find((n) => n.id === 'n-ok')).toMatchObject({ userId: 'c-tuan', type: 'invite_accepted', actorId: 'p-huy', refId: 'rq-1' });
    expect(roster(ok, 'c-tuan').map((p) => p.id)).toContain('p-huy');
    // p-khoa đã có HLV chính c-ha → HLV Tuấn duyệt yêu cầu của Khoa thì thành HLV phụ; Khoa (bên gửi) nhận thông báo
    const k = reduce(req(s0(), 'c-tuan', 'p-khoa', 'player'), { type: 'respondConnection', id: 'rq-1', accept: true, at: NOW, notificationId: 'n-k' });
    expect(k.connections.find((c) => c.id === 'rq-1')!.isPrimary).toBe(false);
    expect(k.notifications.find((n) => n.id === 'n-k')).toMatchObject({ userId: 'p-khoa', type: 'invite_accepted', actorId: 'c-tuan' });
  });
  it('có HLV chính SAU lúc gửi yêu cầu → chấp nhận thành HLV phụ (D5 xét lúc kích hoạt)', () => {
    let s = req(s0(), 'c-tuan', 'p-huy', 'coach');
    s = reduce(s, { type: 'createInvite', invite: { code: 'HAOK22', coachId: 'c-ha', createdAt: NOW, expiresAt: '2026-10-14T08:00:00Z' } });
    s = reduce(s, { type: 'acceptInvite', code: 'HAOK22', playerId: 'p-huy', at: NOW, id: 'cx-ha', notificationId: 'n-ha' });
    s = reduce(s, { type: 'respondConnection', id: 'rq-1', accept: true, at: NOW, notificationId: 'n-ok' });
    expect(activeCoaches(s, 'p-huy').map((c) => [c.coach.id, c.connection.isPrimary])).toEqual([['c-ha', true], ['c-tuan', false]]);
  });
  it('nhập mã của HLV đang có lời mời/yêu cầu chờ → chỉ 1 kết nối active, lời mời chờ tự đóng, trả lời sau đó không đổi gì', () => {
    let s = req(s0(), 'c-tuan', 'p-huy', 'coach');
    s = reduce(s, { type: 'acceptInvite', code: 'TUAN24', playerId: 'p-huy', at: NOW, id: 'cx-1', notificationId: 'n-x' });
    expect(s.connections.filter((c) => c.coachId === 'c-tuan' && c.playerId === 'p-huy' && c.status === 'active')).toHaveLength(1);
    expect(s.connections.find((c) => c.id === 'rq-1')).toMatchObject({ status: 'revoked', revokedAt: NOW });
    expect(reduce(s, { type: 'respondConnection', id: 'rq-1', accept: true, at: NOW, notificationId: 'n' })).toBe(s);
    expect(roster(s, 'c-tuan').filter((p) => p.id === 'p-huy')).toHaveLength(1);
  });
  it('từ chối → declined, không thông báo, không mở quyền; gửi lại được sau khi bị từ chối', () => {
    const s = req(s0(), 'c-tuan', 'p-huy', 'coach');
    const no = reduce(s, { type: 'respondConnection', id: 'rq-1', accept: false, at: NOW, notificationId: 'n-no' });
    expect(no.connections.find((c) => c.id === 'rq-1')).toMatchObject({ status: 'declined', declinedAt: NOW });
    expect(no.notifications).toBe(s.notifications);
    expect(canViewPrivate(no, 'c-tuan', 'p-huy')).toBe(false);
    expect(req(no, 'c-tuan', 'p-huy', 'coach', 'rq-2').connections.find((c) => c.id === 'rq-2')!.status).toBe('pending');
  });
  it('chặn sau khi đã gửi yêu cầu → trả lời (chấp nhận hay từ chối) không đổi gì', () => {
    for (const [blockerId, blockedId] of [['c-tuan', 'p-huy'], ['p-huy', 'c-tuan']]) {
      const s = reduce(req(s0(), 'c-tuan', 'p-huy', 'coach'), { type: 'block', blockerId, blockedId });
      expect(reduce(s, { type: 'respondConnection', id: 'rq-1', accept: true, at: NOW, notificationId: 'n' })).toBe(s);
      expect(reduce(s, { type: 'respondConnection', id: 'rq-1', accept: false, at: NOW, notificationId: 'n' })).toBe(s);
    }
  });
  it('chặn đóng lời mời/yêu cầu đang chờ của cặp (cả 2 chiều chặn); bỏ chặn không hiện lại, gửi mới vẫn được', () => {
    for (const [blockerId, blockedId] of [['c-tuan', 'p-huy'], ['p-huy', 'c-tuan']]) {
      const blocked = reduce(req(s0(), 'c-tuan', 'p-huy', 'coach'), { type: 'block', blockerId, blockedId });
      expect(blocked.connections.find((c) => c.id === 'rq-1')!.status).toBe('revoked');
      expect(blocked.connections.find((c) => c.id === 'cn-ha-huy')!.status).toBe('pending'); // cặp khác giữ nguyên
      const s = reduce(blocked, { type: 'unblock', blockerId, blockedId });
      expect(connectionRequests(s, 'p-huy').incoming).toEqual([]);
      expect(connectionRequests(s, 'c-tuan').outgoing).toEqual([]);
      expect(reduce(s, { type: 'respondConnection', id: 'rq-1', accept: true, at: NOW, notificationId: 'n' })).toBe(s);
      expect(req(s, 'c-tuan', 'p-huy', 'coach', 'rq-2').connections.find((c) => c.id === 'rq-2')!.status).toBe('pending');
    }
  });
  it('huỷ lời mời/yêu cầu đang chờ bằng revokeConnection; trả lời kết nối không còn chờ → không đổi', () => {
    const s = reduce(req(s0(), 'c-tuan', 'p-huy', 'coach'), { type: 'revokeConnection', id: 'rq-1', at: NOW });
    expect(connectionRequests(s, 'p-huy').incoming).toEqual([]);
    expect(reduce(s, { type: 'respondConnection', id: 'rq-1', accept: true, at: NOW, notificationId: 'n' })).toBe(s);
    const b = s0();
    expect(reduce(b, { type: 'respondConnection', id: 'cn-tuan-minh', accept: false, at: NOW, notificationId: 'n' })).toBe(b);
  });
});

describe('thông báo HLV khi học viên tải swing mới lên xong', () => {
  const add = (s: AppState, playerId: string) =>
    reduce(s, { type: 'addSwing', swing: { id: 'sw-new', playerId, capturedAt: NOW, fileName: 'driver_face_on_60fps.mp4', durationSec: 4.2, cameraView: 'face-on', upload: { status: 'uploading', progress: 0 }, job: { status: 'none', progress: 0 } } });
  const up = (s: AppState, status: UploadStatus, progress: number, nid = 'n-up') => reduce(s, { type: 'uploadUpdate', id: 'sw-new', status, progress, at: NOW, notificationId: nid });
  const uploaded = (s: AppState) => s.notifications.filter((n) => n.type === 'swing_uploaded');
  it('nhịp tải giữa chừng không báo; xong → mỗi HLV active (chính + phụ) đúng 1 thông báo', () => {
    const mid = up(add(s0(), 'p-minh'), 'uploading', 0.5);
    expect(uploaded(mid)).toEqual([]);
    const done = up(mid, 'done', 1);
    expect(uploaded(done).map((n) => [n.userId, n.actorId, n.refId]).sort()).toEqual([['c-ha', 'p-minh', 'sw-new'], ['c-tuan', 'p-minh', 'sw-new']]);
    expect(uploaded(done).map((n) => n.id).sort()).toEqual(['n-up-0', 'n-up-1']);
  });
  it('báo 1 lần mỗi swing (gửi lại "done" không báo lặp; lỗi mạng rồi thử lại vẫn 1 lần); HLV đã huỷ hoặc đang chờ không nhận', () => {
    const twice = up(up(add(s0(), 'p-lan'), 'done', 1), 'done', 1, 'n-up2');
    expect(uploaded(twice).map((n) => n.userId)).toEqual(['c-tuan']); // c-ha với p-lan đã revoked
    const retried = up(up(up(add(s0(), 'p-minh'), 'failed', 0.6), 'uploading', 0.6), 'done', 1);
    expect(uploaded(retried)).toHaveLength(2);
    expect(uploaded(up(add(s0(), 'p-huy'), 'done', 1))).toEqual([]); // p-huy chỉ có yêu cầu chờ với c-ha
  });
});

describe('sửa / xoá ghi chú HLV (chỉ tác giả còn kết nối active)', () => {
  it('tác giả sửa: đổi nội dung (bỏ khoảng trắng hai đầu), gắn editedAt, mốc theo "[x,y s]" đầu tiên nếu có', () => {
    const s = reduce(s0(), { type: 'editNote', id: 'note-1', coachId: 'c-tuan', text: ' Vai mở sớm [1,4 s] ', at: NOW });
    expect(s.notes.find((n) => n.id === 'note-1')).toMatchObject({ text: 'Vai mở sớm [1,4 s]', atSec: 1.4, editedAt: NOW });
    const noMark = reduce(s0(), { type: 'editNote', id: 'note-1', coachId: 'c-tuan', text: 'Giữ lưng thêm một nhịp', at: NOW });
    expect(noMark.notes.find((n) => n.id === 'note-1')!.atSec).toBe(1.32); // không có mốc → giữ mốc cũ
  });
  it('không phải tác giả, nội dung rỗng, hoặc HLV đã bị huỷ kết nối → không đổi', () => {
    const b = s0();
    expect(reduce(b, { type: 'editNote', id: 'note-1', coachId: 'c-ha', text: 'Sửa ghi chú người khác', at: NOW })).toBe(b); // c-ha active với p-minh nhưng không phải tác giả
    expect(reduce(b, { type: 'deleteNote', id: 'note-1', coachId: 'c-ha' })).toBe(b);
    expect(reduce(b, { type: 'editNote', id: 'note-1', coachId: 'c-tuan', text: '   ', at: NOW })).toBe(b);
    const revoked = reduce(b, { type: 'revokeConnection', id: 'cn-tuan-minh', at: NOW });
    expect(reduce(revoked, { type: 'editNote', id: 'note-1', coachId: 'c-tuan', text: 'Sau khi huỷ', at: NOW })).toBe(revoked);
    expect(reduce(revoked, { type: 'deleteNote', id: 'note-1', coachId: 'c-tuan' })).toBe(revoked);
  });
  it('lưu mà không đổi chữ (chỉ thêm khoảng trắng hai đầu) → không đổi, không gắn "đã sửa"', () => {
    const b = s0();
    const text = b.notes.find((n) => n.id === 'note-1')!.text;
    expect(reduce(b, { type: 'editNote', id: 'note-1', coachId: 'c-tuan', text: ` ${text} `, at: NOW })).toBe(b);
  });
  it('mốc quá độ dài video kẹp về cuối video (sw-minh-1 dài 4,2 s)', () => {
    const e = reduce(s0(), { type: 'editNote', id: 'note-1', coachId: 'c-tuan', text: 'Xem lại [99 s]', at: NOW });
    expect(e.notes.find((n) => n.id === 'note-1')!.atSec).toBe(4.2);
    const a = reduce(s0(), { type: 'addNote', note: { id: 'note-x', swingId: 'sw-minh-1', coachId: 'c-tuan', atSec: 9, text: '[9 s] Xem lại', createdAt: NOW }, notificationId: 'n' });
    expect(a.notes.find((n) => n.id === 'note-x')!.atSec).toBe(4.2);
  });
  it('thêm ghi chú: chỉ HLV còn kết nối active — người chơi tự ghi chú, HLV đã bị huỷ kết nối → không đổi, không thông báo', () => {
    const add = (s: AppState, coachId: string) =>
      reduce(s, { type: 'addNote', note: { id: 'note-x', swingId: 'sw-minh-1', coachId, atSec: 1, text: 'Ghi chú', createdAt: NOW }, notificationId: 'n-x' });
    const b = s0();
    expect(add(b, 'p-minh')).toBe(b);
    const revoked = reduce(b, { type: 'revokeConnection', id: 'cn-tuan-minh', at: NOW });
    expect(add(revoked, 'c-tuan')).toBe(revoked);
    expect(add(b, 'c-ha').notes.some((n) => n.id === 'note-x')).toBe(true); // HLV phụ active vẫn ghi được
  });
  it('tác giả xoá: chỉ ghi chú đó mất', () => {
    expect(reduce(s0(), { type: 'deleteNote', id: 'note-2', coachId: 'c-tuan' }).notes.map((n) => n.id)).toEqual(['note-1', 'note-3']);
  });
});

describe('sửa phiên số liệu', () => {
  it('thay đúng phiên tại chỗ, gắn editedAt', () => {
    const b = s0();
    const old = b.sessions.find((x) => x.id === 'ss-d5') as Extract<MetricSession, { kind: 'swing' }>;
    const s = reduce(b, { type: 'updateSession', session: { ...old, swing: { ...old.swing, carryM: 230 } }, at: NOW });
    expect(s.sessions).toHaveLength(b.sessions.length);
    expect(s.sessions.findIndex((x) => x.id === 'ss-d5')).toBe(b.sessions.indexOf(old));
    expect(s.sessions.find((x) => x.id === 'ss-d5')).toMatchObject({ editedAt: NOW, swing: { carryM: 230 } });
  });
  it('phiên không tồn tại, đổi chủ hoặc đổi loại → không đổi', () => {
    const b = s0();
    const old = b.sessions.find((x) => x.id === 'ss-d5')!;
    expect(reduce(b, { type: 'updateSession', session: { ...old, id: 'ss-nope' }, at: NOW })).toBe(b);
    expect(reduce(b, { type: 'updateSession', session: { ...old, playerId: 'p-lan' }, at: NOW })).toBe(b);
    const asFitness: MetricSession = { id: 'ss-d5', playerId: 'p-minh', capturedAt: NOW, source: 'manual', kind: 'fitness', fitness: { weightKg: 70, flexibility: 5, gripStrengthKg: 40, verticalJumpCm: 40 } };
    expect(reduce(b, { type: 'updateSession', session: asFitness, at: NOW })).toBe(b);
  });
});

describe('gậy: khôi phục, xoá khi chưa gắn dữ liệu', () => {
  it('lưu trữ rồi khôi phục → về danh sách đang dùng, rời danh sách lưu trữ', () => {
    const a = reduce(s0(), { type: 'archiveClub', id: 'cl-pw', at: NOW });
    expect(archivedClubsOf(a, 'p-minh').map((c) => c.id)).toEqual(['cl-pw']);
    const r = reduce(a, { type: 'unarchiveClub', id: 'cl-pw' });
    expect(clubsOf(r, 'p-minh').map((c) => c.id)).toContain('cl-pw');
    expect(archivedClubsOf(r, 'p-minh')).toEqual([]);
    expect(clubById(r, 'cl-pw')?.archivedAt).toBeUndefined();
  });
  it('xoá gậy chưa gắn phiên/swing nào; gậy đã gắn → không xoá (chỉ lưu trữ được, giữ lịch sử)', () => {
    const b = s0();
    expect(clubLinkCount(b, 'cl-pw')).toBe(0);
    expect(clubLinkCount(b, 'cl-driver')).toBe(7); // 6 phiên + sw-minh-1
    expect(reduce(b, { type: 'deleteClub', id: 'cl-pw' }).clubs.some((c) => c.id === 'cl-pw')).toBe(false);
    expect(reduce(b, { type: 'deleteClub', id: 'cl-driver' })).toBe(b);
  });
});

describe('dev: giả lập lỗi lưu/xoá', () => {
  it('bật/tắt cờ; đặt lại dữ liệu mẫu giữ nguyên cờ; dữ liệu mẫu mặc định tắt', () => {
    expect(s0().simulateFailure).toBe(false);
    const on = reduce(s0(), { type: 'setSimulateFailure', on: true });
    expect(on.simulateFailure).toBe(true);
    expect(reduce(on, { type: 'reset' }).simulateFailure).toBe(true);
    expect(reduce(on, { type: 'setSimulateFailure', on: false }).simulateFailure).toBe(false);
  });
});
