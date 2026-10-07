export type ID = string;
export type ISO = string; // ISO-8601 UTC
export type Role = 'player' | 'coach';

export interface Profile {
  id: ID; role: Role; name: string; email: string; phone: string; createdAt: ISO;
  avatarUrl?: string; bio?: string;
  handicap?: number; homeClub?: string;                       // player
  academy?: string; yearsExperience?: number; rating?: number; // coach
  ratePerHourVnd?: number; verified?: boolean;                 // coach
}

export type ConnectionStatus = 'pending' | 'active' | 'revoked';
export interface CoachConnection {
  id: ID; coachId: ID; playerId: ID; status: ConnectionStatus; isPrimary: boolean;
  invitedAt: ISO; acceptedAt?: ISO; revokedAt?: ISO;
}
export interface CoachInvite { code: string; coachId: ID; createdAt: ISO; expiresAt: ISO; usedBy?: ID; revoked?: boolean }
export type InviteCheck = 'ok' | 'not_found' | 'expired' | 'used' | 'revoked' | 'already_connected';

export type MetricSource = 'manual' | 'csv' | 'photo' | 'qr';
export type Vendor = 'trackman' | 'foresight';
export interface SwingMetrics { clubSpeedMph: number; ballSpeedMph: number; smash: number; spinRpm: number; launchDeg: number; carryM: number }
export interface FitnessMetrics { weightKg: number; flexibility: number; gripStrengthKg: number; verticalJumpCm: number }
interface SessionBase { id: ID; playerId: ID; capturedAt: ISO; source: MetricSource; vendor?: Vendor; clubId?: ID; note?: string }
export type MetricSession =
  | (SessionBase & { kind: 'swing'; swing: SwingMetrics })
  | (SessionBase & { kind: 'fitness'; fitness: FitnessMetrics });

export const CLUB_TYPES = [
  'Driver', 'Gỗ 3', 'Gỗ 5', 'Hybrid 3', 'Hybrid 4',
  'Sắt 4', 'Sắt 5', 'Sắt 6', 'Sắt 7', 'Sắt 8', 'Sắt 9',
  'PW', 'GW', 'SW', 'LW', 'Putter',
] as const;
export type ClubType = (typeof CLUB_TYPES)[number] | 'Tuỳ chỉnh';
export const CLUB_GROUPS: { label: string; types: readonly ClubType[] }[] = [
  { label: 'Gỗ', types: ['Driver', 'Gỗ 3', 'Gỗ 5'] },
  { label: 'Hybrid', types: ['Hybrid 3', 'Hybrid 4'] },
  { label: 'Sắt', types: ['Sắt 4', 'Sắt 5', 'Sắt 6', 'Sắt 7', 'Sắt 8', 'Sắt 9'] },
  { label: 'Wedge', types: ['PW', 'GW', 'SW', 'LW'] },
  { label: 'Putter', types: ['Putter'] },
  { label: 'Khác', types: ['Tuỳ chỉnh'] },
];
export const SHAFT_FLEXES = ['Ladies', 'Senior', 'Regular', 'Stiff', 'X-Stiff'] as const;
export type ShaftFlex = (typeof SHAFT_FLEXES)[number];
export interface Club {
  id: ID; playerId: ID; type: ClubType; customName?: string; brand: string; model: string;
  shaftBrand: string; shaftFlex: ShaftFlex; shaftWeightG?: number; loftDeg: number; lieDeg: number; bounceDeg?: number;
  archivedAt?: ISO;
}

export type CameraView = 'face-on' | 'down-the-line';
export type UploadStatus = 'uploading' | 'paused' | 'failed' | 'done';
export type JobStatus = 'none' | 'queued' | 'processing' | 'succeeded' | 'failed' | 'needs_review';
export interface SwingTip { text: string; startSec: number; endSec: number }
export interface SwingAnalysis {
  tempoRatio: number; backswingMs: number; downswingMs: number; plane: string;
  confidence: number; fps: number; phases: { address: number; top: number; impact: number; finish: number };
  tips: SwingTip[]; modelVersion: string;
}
export interface Swing {
  id: ID; playerId: ID; clubId?: ID; capturedAt: ISO; fileName: string; durationSec: number; cameraView: CameraView;
  upload: { status: UploadStatus; progress: number };   // progress 0..1
  job: { status: JobStatus; progress: number };
  analysis?: SwingAnalysis;
}
export interface CoachNote { id: ID; swingId: ID; coachId: ID; atSec?: number; text: string; createdAt: ISO }

export interface Follow { followerId: ID; followedId: ID }
export interface Post { id: ID; authorId: ID; createdAt: ISO; title: string; content: string; tags: string[]; swingId?: ID }
export interface Like { userId: ID; postId: ID }
export interface Comment { id: ID; postId: ID; authorId: ID; text: string; createdAt: ISO }
export interface Block { blockerId: ID; blockedId: ID }
export interface Report { id: ID; reporterId: ID; targetUserId?: ID; postId?: ID; reason: string; createdAt: ISO }

export type NotificationType = 'coach_note' | 'follow' | 'like' | 'comment' | 'invite_accepted' | 'analysis_done';
export interface AppNotification { id: ID; userId: ID; type: NotificationType; actorId?: ID; refId?: ID; createdAt: ISO; readAt?: ISO }

export type Units = 'metric' | 'imperial';
export interface Preferences {
  units: Units; publicClubs: boolean; publicSwings: boolean; quietHours: boolean;
  notify: Record<NotificationType, boolean>;
}

export interface AppState {
  sessionUserId: ID | null;
  profiles: Profile[]; connections: CoachConnection[]; invites: CoachInvite[];
  sessions: MetricSession[]; clubs: Club[]; swings: Swing[]; notes: CoachNote[];
  follows: Follow[]; posts: Post[]; likes: Like[]; comments: Comment[]; blocks: Block[]; reports: Report[];
  notifications: AppNotification[]; prefs: Record<ID, Preferences>;
}
