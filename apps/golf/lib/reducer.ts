import type { AppNotification, AppState, Club, CoachConnection, CoachInvite, CoachNote, Comment, ID, ISO, JobStatus, MetricSession, NotificationType, Post, Preferences, Profile, Report, Role, Swing, SwingAnalysis, UploadStatus } from './domain';
import { canViewPrivate, clubLinkCount, isBlocked, openConnection, profileById, validateInvite } from './selectors';
import { noteMarks } from './format';
import { DEFAULT_PREFS, seedState } from './mock';

export type Action =
  | { type: 'signIn'; userId: ID } | { type: 'signOut' }
  | { type: 'register'; profile: Profile }
  | { type: 'updateProfile'; id: ID; patch: Partial<Profile> }
  | { type: 'setPrefs'; userId: ID; patch: Partial<Preferences> }
  | { type: 'addSession'; session: MetricSession } | { type: 'addSessions'; sessions: MetricSession[] }
  | { type: 'deleteSession'; id: ID }
  | { type: 'upsertClub'; club: Club } | { type: 'archiveClub'; id: ID; at: ISO }
  | { type: 'addSwing'; swing: Swing }
  | { type: 'uploadUpdate'; id: ID; status: UploadStatus; progress: number; at: ISO; notificationId: ID }
  | { type: 'jobUpdate'; id: ID; status: JobStatus; progress: number; analysis?: SwingAnalysis; at: ISO; notificationId: ID }
  | { type: 'deleteSwing'; id: ID }
  | { type: 'addNote'; note: CoachNote; notificationId: ID }
  | { type: 'createInvite'; invite: CoachInvite } | { type: 'revokeInvite'; code: string }
  | { type: 'acceptInvite'; code: string; playerId: ID; at: ISO; id: ID; notificationId: ID }
  | { type: 'revokeConnection'; id: ID; at: ISO }
  | { type: 'setPrimaryCoach'; connectionId: ID }
  | { type: 'toggleFollow'; followerId: ID; followedId: ID; at: ISO; notificationId: ID }
  | { type: 'addPost'; post: Post } | { type: 'deletePost'; id: ID }
  | { type: 'toggleLike'; userId: ID; postId: ID; at: ISO; notificationId: ID }
  | { type: 'addComment'; comment: Comment; notificationId: ID }
  | { type: 'block'; blockerId: ID; blockedId: ID } | { type: 'unblock'; blockerId: ID; blockedId: ID }
  | { type: 'report'; report: Report }
  | { type: 'markRead'; userId: ID; at: ISO; ids?: ID[] }
  | { type: 'updateSession'; session: MetricSession; at: ISO }
  | { type: 'unarchiveClub'; id: ID } | { type: 'deleteClub'; id: ID }
  | { type: 'editNote'; id: ID; coachId: ID; text: string; at: ISO } | { type: 'deleteNote'; id: ID; coachId: ID }
  | { type: 'requestConnection'; id: ID; coachId: ID; playerId: ID; by: Role; at: ISO; notificationId: ID }
  | { type: 'respondConnection'; id: ID; accept: boolean; at: ISO; notificationId: ID }
  | { type: 'setSimulateFailure'; on: boolean }
  | { type: 'reset' };

const notify = (s: AppState, n: { id: ID; userId: ID; type: NotificationType; actorId?: ID; refId?: ID; createdAt: ISO }): AppNotification[] =>
  n.userId === n.actorId ? s.notifications : [n, ...s.notifications];
/** Mốc ghi chú gõ tay ("[9 s]") quá độ dài video → cuối video. */
const clampAt = (sec: number | undefined, sw: Swing) => (sec === undefined ? sec : Math.min(sec, sw.durationSec));

export function reduce(s: AppState, a: Action): AppState {
  switch (a.type) {
    case 'signIn': return { ...s, sessionUserId: a.userId };
    case 'signOut': return { ...s, sessionUserId: null };
    case 'register': return { ...s, profiles: [...s.profiles, a.profile], prefs: { ...s.prefs, [a.profile.id]: DEFAULT_PREFS }, sessionUserId: a.profile.id };
    case 'updateProfile': return { ...s, profiles: s.profiles.map((p) => (p.id === a.id ? { ...p, ...a.patch } : p)) };
    case 'setPrefs': return { ...s, prefs: { ...s.prefs, [a.userId]: { ...(s.prefs[a.userId] ?? DEFAULT_PREFS), ...a.patch } } };
    case 'addSession': return { ...s, sessions: [a.session, ...s.sessions] };
    case 'addSessions': return { ...s, sessions: [...a.sessions, ...s.sessions] };
    case 'deleteSession': return { ...s, sessions: s.sessions.filter((x) => x.id !== a.id) };
    case 'upsertClub': return { ...s, clubs: s.clubs.some((c) => c.id === a.club.id) ? s.clubs.map((c) => (c.id === a.club.id ? a.club : c)) : [...s.clubs, a.club] };
    case 'archiveClub': return { ...s, clubs: s.clubs.map((c) => (c.id === a.id ? { ...c, archivedAt: a.at } : c)) };
    case 'addSwing': return { ...s, swings: [a.swing, ...s.swings] };
    case 'uploadUpdate': {
      const sw = s.swings.find((w) => w.id === a.id);
      if (!sw) return s;
      const swings = s.swings.map((w) => (w === sw ? { ...w, upload: { status: a.status, progress: a.progress } } : w));
      // Tải lên xong lần đầu → báo mọi HLV đang kết nối active (chính + phụ); nhịp giữa chừng / gửi lại "done" không báo
      if (a.status !== 'done' || sw.upload.status === 'done') return { ...s, swings };
      const fresh = s.connections
        .filter((c) => c.playerId === sw.playerId && c.status === 'active')
        .map((c, i): AppNotification => ({ id: `${a.notificationId}-${i}`, userId: c.coachId, type: 'swing_uploaded', actorId: sw.playerId, refId: sw.id, createdAt: a.at }));
      return { ...s, swings, notifications: [...fresh, ...s.notifications] };
    }
    case 'jobUpdate': {
      const sw = s.swings.find((w) => w.id === a.id);
      if (!sw) return s;
      const swings = s.swings.map((w) => (w.id === a.id ? { ...w, job: { status: a.status, progress: a.progress }, analysis: a.analysis ?? w.analysis } : w));
      // báo 1 lần khi job vừa xong — 2 màn cùng swing cùng chạy job (nhận trạng thái cuối 2 lần) không báo lặp, như uploadUpdate
      const final = (st: JobStatus) => st === 'succeeded' || st === 'needs_review';
      const done = final(a.status) && !final(sw.job.status);
      return { ...s, swings, notifications: done ? notify(s, { id: a.notificationId, userId: sw.playerId, type: 'analysis_done', refId: sw.id, createdAt: a.at }) : s.notifications };
    }
    // thông báo trỏ tới swing/bài đã xoá cũng bỏ (tiền tố id sw-/post-/cn- không trùng nhau)
    case 'deleteSwing': return { ...s, swings: s.swings.filter((w) => w.id !== a.id), notes: s.notes.filter((n) => n.swingId !== a.id), notifications: s.notifications.filter((n) => n.refId !== a.id) };
    case 'addNote': {
      const sw = s.swings.find((w) => w.id === a.note.swingId);
      // Quyền ghi như editNote/deleteNote (mô phỏng RLS): chỉ HLV còn kết nối active với chủ swing
      if (!sw || profileById(s, a.note.coachId)?.role !== 'coach' || !canViewPrivate(s, a.note.coachId, sw.playerId)) return s;
      return { ...s, notes: [...s.notes, { ...a.note, atSec: clampAt(a.note.atSec, sw) }], notifications: notify(s, { id: a.notificationId, userId: sw.playerId, type: 'coach_note', actorId: a.note.coachId, refId: sw.id, createdAt: a.note.createdAt }) };
    }
    case 'createInvite': return { ...s, invites: [a.invite, ...s.invites] };
    case 'revokeInvite': return { ...s, invites: s.invites.map((i) => (i.code === a.code ? { ...i, revoked: true } : i)) };
    case 'acceptInvite': {
      if (validateInvite(s, a.code, a.at, a.playerId) !== 'ok' || s.profiles.find((p) => p.id === a.playerId)?.role !== 'player') return s;
      const inv = s.invites.find((i) => i.code.toUpperCase() === a.code.trim().toUpperCase())!;
      const hasPrimary = s.connections.some((c) => c.playerId === a.playerId && c.status === 'active' && c.isPrimary);
      const conn = { id: a.id, coachId: inv.coachId, playerId: a.playerId, status: 'active' as const, isPrimary: !hasPrimary, invitedAt: inv.createdAt, acceptedAt: a.at };
      return {
        ...s,
        // lời mời/yêu cầu đang chờ của đúng cặp này tự đóng — một cặp chỉ có 1 kết nối mở
        connections: [...s.connections.map((c) => (c.coachId === inv.coachId && c.playerId === a.playerId && c.status === 'pending' ? { ...c, status: 'revoked' as const, revokedAt: a.at } : c)), conn],
        invites: s.invites.map((i) => (i === inv ? { ...i, usedBy: a.playerId } : i)),
        notifications: notify(s, { id: a.notificationId, userId: inv.coachId, type: 'invite_accepted', actorId: a.playerId, refId: a.id, createdAt: a.at }),
      };
    }
    case 'revokeConnection': return { ...s, connections: s.connections.map((c) => (c.id === a.id ? { ...c, status: 'revoked', isPrimary: false, revokedAt: a.at } : c)) };
    case 'setPrimaryCoach': {
      const target = s.connections.find((c) => c.id === a.connectionId);
      if (!target || target.status !== 'active') return s;
      return { ...s, connections: s.connections.map((c) => (c.playerId === target.playerId && c.status === 'active' ? { ...c, isPrimary: c.id === target.id } : c)) };
    }
    case 'toggleFollow': {
      // chặn (một trong hai chiều) = không theo dõi được nhau (block đã gỡ follow hai chiều)
      if (a.followerId === a.followedId || isBlocked(s, a.followerId, a.followedId)) return s;
      const on = s.follows.some((f) => f.followerId === a.followerId && f.followedId === a.followedId);
      return on
        ? { ...s, follows: s.follows.filter((f) => !(f.followerId === a.followerId && f.followedId === a.followedId)) }
        : { ...s, follows: [...s.follows, { followerId: a.followerId, followedId: a.followedId }], notifications: notify(s, { id: a.notificationId, userId: a.followedId, type: 'follow', actorId: a.followerId, createdAt: a.at }) };
    }
    case 'addPost': return { ...s, posts: [a.post, ...s.posts] };
    case 'deletePost': return { ...s, posts: s.posts.filter((p) => p.id !== a.id), likes: s.likes.filter((l) => l.postId !== a.id), comments: s.comments.filter((c) => c.postId !== a.id), notifications: s.notifications.filter((n) => n.refId !== a.id) };
    case 'toggleLike': {
      const on = s.likes.some((l) => l.userId === a.userId && l.postId === a.postId);
      if (on) return { ...s, likes: s.likes.filter((l) => !(l.userId === a.userId && l.postId === a.postId)) };
      const post = s.posts.find((p) => p.id === a.postId);
      // thích lại sau khi bỏ thích không báo lần 2
      const notified = s.notifications.some((n) => n.type === 'like' && n.actorId === a.userId && n.refId === a.postId);
      return { ...s, likes: [...s.likes, { userId: a.userId, postId: a.postId }], notifications: post && !notified ? notify(s, { id: a.notificationId, userId: post.authorId, type: 'like', actorId: a.userId, refId: a.postId, createdAt: a.at }) : s.notifications };
    }
    case 'addComment': {
      const post = s.posts.find((p) => p.id === a.comment.postId);
      return { ...s, comments: [...s.comments, a.comment], notifications: post ? notify(s, { id: a.notificationId, userId: post.authorId, type: 'comment', actorId: a.comment.authorId, refId: post.id, createdAt: a.comment.createdAt }) : s.notifications };
    }
    case 'block': return {
      ...s,
      blocks: [...s.blocks, { blockerId: a.blockerId, blockedId: a.blockedId }],
      follows: s.follows.filter((f) => !((f.followerId === a.blockerId && f.followedId === a.blockedId) || (f.followerId === a.blockedId && f.followedId === a.blockerId))),
    };
    // chỉ gỡ chiều mình chặn; follow đã gỡ lúc chặn không tự quay lại
    case 'unblock': return { ...s, blocks: s.blocks.filter((b) => !(b.blockerId === a.blockerId && b.blockedId === a.blockedId)) };
    case 'report': return { ...s, reports: [...s.reports, a.report] };
    case 'markRead': return { ...s, notifications: s.notifications.map((n) => (n.userId === a.userId && !n.readAt && (!a.ids || a.ids.includes(n.id)) ? { ...n, readAt: a.at } : n)) };
    case 'updateSession': {
      const old = s.sessions.find((x) => x.id === a.session.id);
      if (!old || old.playerId !== a.session.playerId || old.kind !== a.session.kind) return s;
      return { ...s, sessions: s.sessions.map((x) => (x === old ? { ...a.session, editedAt: a.at } : x)) };
    }
    case 'unarchiveClub': return { ...s, clubs: s.clubs.map((c) => (c.id === a.id ? { ...c, archivedAt: undefined } : c)) };
    case 'deleteClub': return clubLinkCount(s, a.id) > 0 ? s : { ...s, clubs: s.clubs.filter((c) => c.id !== a.id) };
    case 'editNote':
    case 'deleteNote': {
      const n = s.notes.find((x) => x.id === a.id);
      const sw = n && s.swings.find((w) => w.id === n.swingId);
      // Quyền ghi (mô phỏng RLS): chỉ HLV viết ghi chú, khi vẫn còn kết nối active với chủ swing
      if (!n || !sw || n.coachId !== a.coachId || !canViewPrivate(s, a.coachId, sw.playerId)) return s;
      if (a.type === 'deleteNote') return { ...s, notes: s.notes.filter((x) => x !== n) };
      const text = a.text.trim();
      if (!text || text === n.text) return s; // lưu mà không đổi chữ → không gắn "đã sửa"
      return { ...s, notes: s.notes.map((x) => (x === n ? { ...x, text, atSec: clampAt(noteMarks(text)[0] ?? x.atSec, sw), editedAt: a.at } : x)) };
    }
    case 'requestConnection': {
      const roleOf = (id: ID) => s.profiles.find((p) => p.id === id)?.role;
      if (roleOf(a.coachId) !== 'coach' || roleOf(a.playerId) !== 'player' || openConnection(s, a.coachId, a.playerId) || isBlocked(s, a.coachId, a.playerId)) return s;
      const conn: CoachConnection = { id: a.id, coachId: a.coachId, playerId: a.playerId, status: 'pending', isPrimary: false, requestedBy: a.by, invitedAt: a.at };
      const [from, to] = a.by === 'coach' ? ([a.coachId, a.playerId] as const) : ([a.playerId, a.coachId] as const);
      return { ...s, connections: [...s.connections, conn], notifications: notify(s, { id: a.notificationId, userId: to, type: 'connect_request', actorId: from, refId: a.id, createdAt: a.at }) };
    }
    case 'respondConnection': {
      const c = s.connections.find((x) => x.id === a.id);
      if (!c || c.status !== 'pending' || isBlocked(s, c.coachId, c.playerId)) return s;
      if (!a.accept) return { ...s, connections: s.connections.map((x) => (x === c ? { ...x, status: 'declined', declinedAt: a.at } : x)) };
      // D5 xét lúc kích hoạt: người chơi chưa có HLV chính → kết nối này là chính; có rồi → phụ
      const hasPrimary = s.connections.some((x) => x.playerId === c.playerId && x.status === 'active' && x.isPrimary);
      const [requester, responder] = c.requestedBy === 'player' ? ([c.playerId, c.coachId] as const) : ([c.coachId, c.playerId] as const);
      return {
        ...s,
        connections: s.connections.map((x) => (x === c ? { ...x, status: 'active', isPrimary: !hasPrimary, acceptedAt: a.at } : x)),
        notifications: notify(s, { id: a.notificationId, userId: requester, type: 'invite_accepted', actorId: responder, refId: c.id, createdAt: a.at }),
      };
    }
    case 'setSimulateFailure': return { ...s, simulateFailure: a.on };
    case 'reset': return { ...seedState(), sessionUserId: s.sessionUserId, simulateFailure: s.simulateFailure };
  }
}
