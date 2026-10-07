import type { AppNotification, AppState, Club, CoachInvite, CoachNote, Comment, ID, ISO, JobStatus, MetricSession, NotificationType, Post, Preferences, Profile, Report, Swing, SwingAnalysis, UploadStatus } from './domain';
import { validateInvite } from './selectors';
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
  | { type: 'uploadUpdate'; id: ID; status: UploadStatus; progress: number }
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
  | { type: 'block'; blockerId: ID; blockedId: ID }
  | { type: 'report'; report: Report }
  | { type: 'markRead'; userId: ID; at: ISO; ids?: ID[] }
  | { type: 'reset' };

const notify = (s: AppState, n: { id: ID; userId: ID; type: NotificationType; actorId?: ID; refId?: ID; createdAt: ISO }): AppNotification[] =>
  n.userId === n.actorId ? s.notifications : [n, ...s.notifications];

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
    case 'uploadUpdate': return { ...s, swings: s.swings.map((w) => (w.id === a.id ? { ...w, upload: { status: a.status, progress: a.progress } } : w)) };
    case 'jobUpdate': {
      const sw = s.swings.find((w) => w.id === a.id);
      if (!sw) return s;
      const swings = s.swings.map((w) => (w.id === a.id ? { ...w, job: { status: a.status, progress: a.progress }, analysis: a.analysis ?? w.analysis } : w));
      const done = a.status === 'succeeded' || a.status === 'needs_review';
      return { ...s, swings, notifications: done ? notify(s, { id: a.notificationId, userId: sw.playerId, type: 'analysis_done', refId: sw.id, createdAt: a.at }) : s.notifications };
    }
    case 'deleteSwing': return { ...s, swings: s.swings.filter((w) => w.id !== a.id), notes: s.notes.filter((n) => n.swingId !== a.id) };
    case 'addNote': {
      const sw = s.swings.find((w) => w.id === a.note.swingId);
      if (!sw) return s;
      return { ...s, notes: [...s.notes, a.note], notifications: notify(s, { id: a.notificationId, userId: sw.playerId, type: 'coach_note', actorId: a.note.coachId, refId: sw.id, createdAt: a.note.createdAt }) };
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
        connections: [...s.connections, conn],
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
      if (a.followerId === a.followedId) return s;
      const on = s.follows.some((f) => f.followerId === a.followerId && f.followedId === a.followedId);
      return on
        ? { ...s, follows: s.follows.filter((f) => !(f.followerId === a.followerId && f.followedId === a.followedId)) }
        : { ...s, follows: [...s.follows, { followerId: a.followerId, followedId: a.followedId }], notifications: notify(s, { id: a.notificationId, userId: a.followedId, type: 'follow', actorId: a.followerId, createdAt: a.at }) };
    }
    case 'addPost': return { ...s, posts: [a.post, ...s.posts] };
    case 'deletePost': return { ...s, posts: s.posts.filter((p) => p.id !== a.id), likes: s.likes.filter((l) => l.postId !== a.id), comments: s.comments.filter((c) => c.postId !== a.id) };
    case 'toggleLike': {
      const on = s.likes.some((l) => l.userId === a.userId && l.postId === a.postId);
      if (on) return { ...s, likes: s.likes.filter((l) => !(l.userId === a.userId && l.postId === a.postId)) };
      const post = s.posts.find((p) => p.id === a.postId);
      return { ...s, likes: [...s.likes, { userId: a.userId, postId: a.postId }], notifications: post ? notify(s, { id: a.notificationId, userId: post.authorId, type: 'like', actorId: a.userId, refId: a.postId, createdAt: a.at }) : s.notifications };
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
    case 'report': return { ...s, reports: [...s.reports, a.report] };
    case 'markRead': return { ...s, notifications: s.notifications.map((n) => (n.userId === a.userId && !n.readAt && (!a.ids || a.ids.includes(n.id)) ? { ...n, readAt: a.at } : n)) };
    case 'reset': return { ...seedState(), sessionUserId: s.sessionUserId };
  }
}
