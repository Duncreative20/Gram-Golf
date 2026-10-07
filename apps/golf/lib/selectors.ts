import { CLUB_GROUPS, type AppState, type Club, type CoachConnection, type CoachNote, type ID, type ISO, type InviteCheck, type MetricSession, type Post, type Preferences, type Profile, type Swing } from './domain';
import { DEFAULT_PREFS } from './mock';

export const profileById = (s: AppState, id: ID) => s.profiles.find((p) => p.id === id);
export const me = (s: AppState) => (s.sessionUserId ? profileById(s, s.sessionUserId) : undefined);
export const prefsOf = (s: AppState, id: ID): Preferences => s.prefs[id] ?? DEFAULT_PREFS;

/** Ma trận RLS (tech review §6.2): dữ liệu riêng chỉ chủ sở hữu + HLV có kết nối active. Follow KHÔNG mở. */
export const canViewPrivate = (s: AppState, viewerId: ID, playerId: ID) =>
  viewerId === playerId || s.connections.some((c) => c.coachId === viewerId && c.playerId === playerId && c.status === 'active');

export const validateInvite = (s: AppState, code: string, now: ISO, playerId?: ID): InviteCheck => {
  const inv = s.invites.find((i) => i.code.toUpperCase() === code.trim().toUpperCase());
  if (!inv) return 'not_found';
  if (inv.revoked) return 'revoked';
  if (inv.usedBy) return 'used';
  if (Date.parse(inv.expiresAt) <= Date.parse(now)) return 'expired';
  if (playerId && s.connections.some((c) => c.coachId === inv.coachId && c.playerId === playerId && c.status === 'active')) return 'already_connected';
  return 'ok';
};
export const pendingInvites = (s: AppState, coachId: ID, now: ISO) => s.invites.filter((i) => i.coachId === coachId && validateInvite(s, i.code, now) === 'ok');

export const activeCoaches = (s: AppState, playerId: ID): { coach: Profile; connection: CoachConnection }[] =>
  s.connections
    .filter((c) => c.playerId === playerId && c.status === 'active')
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
    .map((connection) => ({ coach: profileById(s, connection.coachId)!, connection }));
export const primaryCoach = (s: AppState, playerId: ID) => activeCoaches(s, playerId).find((c) => c.connection.isPrimary)?.coach;
export const roster = (s: AppState, coachId: ID): Profile[] =>
  s.connections.filter((c) => c.coachId === coachId && c.status === 'active').map((c) => profileById(s, c.playerId)!);

const byDateDesc = <T extends { capturedAt?: ISO; createdAt?: ISO }>(a: T, b: T) => Date.parse(b.capturedAt ?? b.createdAt!) - Date.parse(a.capturedAt ?? a.createdAt!);
export const sessionsOf = (s: AppState, playerId: ID, kind?: MetricSession['kind']) =>
  s.sessions.filter((x) => x.playerId === playerId && (!kind || x.kind === kind)).sort(byDateDesc);
export const latestSwing = (s: AppState, playerId: ID) => sessionsOf(s, playerId, 'swing')[0] as Extract<MetricSession, { kind: 'swing' }> | undefined;
export const latestFitness = (s: AppState, playerId: ID) => sessionsOf(s, playerId, 'fitness')[0] as Extract<MetricSession, { kind: 'fitness' }> | undefined;
/** Phiên swing liền trước `x` của cùng người chơi, cùng gậy — để tính chênh lệch ở ô chỉ số. Không gậy / không có → undefined. */
export const previousSwing = (s: AppState, x: Pick<MetricSession, 'playerId' | 'clubId' | 'capturedAt'>) =>
  x.clubId
    ? (sessionsOf(s, x.playerId, 'swing') as Extract<MetricSession, { kind: 'swing' }>[]).find((y) => y.clubId === x.clubId && Date.parse(y.capturedAt) < Date.parse(x.capturedAt))
    : undefined;
export const speedTrend = (s: AppState, playerId: ID, n = 5) =>
  (sessionsOf(s, playerId, 'swing') as Extract<MetricSession, { kind: 'swing' }>[])
    .filter((x) => clubById(s, x.clubId)?.type === 'Driver').slice(0, n).reverse()
    .map((x) => ({ date: x.capturedAt, clubSpeedMph: x.swing.clubSpeedMph, ballSpeedMph: x.swing.ballSpeedMph }));
export const carryByClub = (s: AppState, playerId: ID, n = 3) => {
  const acc = new Map<ID, number[]>();
  for (const x of sessionsOf(s, playerId, 'swing') as Extract<MetricSession, { kind: 'swing' }>[]) if (x.clubId) acc.set(x.clubId, [...(acc.get(x.clubId) ?? []), x.swing.carryM]);
  return [...acc].map(([clubId, v]) => ({ club: clubById(s, clubId)!, carryM: v.reduce((a, b) => a + b, 0) / v.length }))
    .filter((x) => x.club).sort((a, b) => b.carryM - a.carryM).slice(0, n);
};

export const clubById = (s: AppState, id?: ID): Club | undefined => (id ? s.clubs.find((c) => c.id === id) : undefined);
export const clubsOf = (s: AppState, playerId: ID) => s.clubs.filter((c) => c.playerId === playerId && !c.archivedAt);
export const clubLabel = (c: Club) => (c.type === 'Tuỳ chỉnh' ? c.customName ?? 'Gậy tuỳ chỉnh' : c.type);
/** Gậy theo nhóm `CLUB_GROUPS` (bỏ nhóm trống); trong nhóm theo thứ tự loại (Driver → Gỗ 3 → Gỗ 5), cùng loại theo thứ tự thêm. */
export const groupClubs = (clubs: Club[]) =>
  CLUB_GROUPS.map((g) => ({ label: g.label, clubs: g.types.flatMap((type) => clubs.filter((c) => c.type === type)) })).filter((g) => g.clubs.length > 0);

export const swingsOf = (s: AppState, playerId: ID): Swing[] => s.swings.filter((w) => w.playerId === playerId).sort(byDateDesc);
export const notesFor = (s: AppState, swingId: ID) => s.notes.filter((n) => n.swingId === swingId).sort((a, b) => (a.atSec ?? 0) - (b.atSec ?? 0));
/** Ghi chú HLV mới nhất trên các swing của chính người chơi (mục "Ghi chú mới từ HLV" ở Tổng quan). */
export const latestNote = (s: AppState, playerId: ID): CoachNote | undefined => swingsOf(s, playerId).flatMap((w) => notesFor(s, w.id)).sort(byDateDesc)[0];
/** Swing chờ HLV `coachId` phản hồi: đã có kết quả phân tích và chính HLV đó chưa ghi chú (ghi chú của HLV khác không tính). */
export const awaitsFeedback = (s: AppState, w: Swing, coachId: ID) => !!w.analysis && !s.notes.some((n) => n.swingId === w.id && n.coachId === coachId);
export const needsFeedback = (s: AppState, coachId: ID) => roster(s, coachId).filter((p) => swingsOf(s, p.id).some((w) => awaitsFeedback(s, w, coachId)));

const isBlocked = (s: AppState, a: ID, b: ID) => s.blocks.some((x) => (x.blockerId === a && x.blockedId === b) || (x.blockerId === b && x.blockedId === a));
export const isFollowing = (s: AppState, a: ID, b: ID) => s.follows.some((f) => f.followerId === a && f.followedId === b);
export const followerCount = (s: AppState, id: ID) => s.follows.filter((f) => f.followedId === id).length;
export const followingCount = (s: AppState, id: ID) => s.follows.filter((f) => f.followerId === id).length;
export const feed = (s: AppState, userId: ID): Post[] =>
  s.posts.filter((p) => (p.authorId === userId || isFollowing(s, userId, p.authorId)) && !isBlocked(s, userId, p.authorId)).sort(byDateDesc);
export const postsBy = (s: AppState, authorId: ID) => s.posts.filter((p) => p.authorId === authorId).sort(byDateDesc);
export const likeCount = (s: AppState, postId: ID) => s.likes.filter((l) => l.postId === postId).length;
export const likedBy = (s: AppState, userId: ID, postId: ID) => s.likes.some((l) => l.userId === userId && l.postId === postId);
export const commentsOf = (s: AppState, postId: ID) => s.comments.filter((c) => c.postId === postId).sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
export const fold = (x: string) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase();
export const discover = (s: AppState, userId: ID, query: string) =>
  s.profiles.filter((p) => p.id !== userId && !isBlocked(s, userId, p.id) && fold(p.name).includes(fold(query.trim())));

export const notificationsOf = (s: AppState, userId: ID) => s.notifications.filter((n) => n.userId === userId).sort(byDateDesc);
export const unreadCount = (s: AppState, userId: ID) => s.notifications.filter((n) => n.userId === userId && !n.readAt).length;
