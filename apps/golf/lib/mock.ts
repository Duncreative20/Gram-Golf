import type { AppState, Club, MetricSession, Preferences, Profile, Swing } from './domain';
import { mockAnalysis } from './simulate';

export const NOW = '2026-10-07T08:00:00Z';

export const DEFAULT_PREFS: Preferences = {
  units: 'metric', publicClubs: false, publicSwings: false, quietHours: false,
  notify: { coach_note: true, follow: true, like: true, comment: true, invite_accepted: true, analysis_done: true, connect_request: true, swing_uploaded: true },
};

const profiles = (): Profile[] => [
  { id: 'p-minh', role: 'player', name: 'Nguyễn Minh Anh', email: 'minhanh@gramgolf.vn', phone: '0912 345 678', createdAt: '2026-06-02T03:00:00Z', bio: 'Tập driver mỗi tuần, mục tiêu xuống handicap 10.', handicap: 14, homeClub: 'Sân tập Mỹ Đình' },
  { id: 'p-lan', role: 'player', name: 'Trần Thu Lan', email: 'thulan@gramgolf.vn', phone: '0983 210 456', createdAt: '2026-07-11T02:30:00Z', handicap: 22, homeClub: 'Sân tập Ciputra' },
  { id: 'p-khoa', role: 'player', name: 'Lê Đăng Khoa', email: 'dangkhoa@gramgolf.vn', phone: '0907 654 321', createdAt: '2026-05-20T09:00:00Z', bio: 'Thích chơi sân Long Biên cuối tuần.', handicap: 8, homeClub: 'Sân Long Biên' },
  { id: 'p-huy', role: 'player', name: 'Phạm Quốc Huy', email: 'quochuy@gramgolf.vn', phone: '0938 112 233', createdAt: '2026-09-29T11:00:00Z', handicap: 28 },
  { id: 'c-tuan', role: 'coach', name: 'HLV Đỗ Minh Tuấn', email: 'tuan.coach@gramgolf.vn', phone: '0904 888 999', createdAt: '2026-03-01T02:00:00Z', bio: 'Chuyên swing cơ bản và tempo cho người mới.', academy: 'GramGolf Academy Hà Nội', yearsExperience: 12, rating: 4.9, ratePerHourVnd: 450000, verified: true },
  { id: 'c-ha', role: 'coach', name: 'HLV Vũ Thanh Hà', email: 'ha.coach@gramgolf.vn', phone: '0909 777 555', createdAt: '2026-04-15T02:00:00Z', bio: 'Short game và thể lực golf.', academy: 'Saigon Golf Lab', yearsExperience: 8, rating: 4.7, ratePerHourVnd: 400000, verified: true },
];

const clubs = (): Club[] => [
  { id: 'cl-driver', playerId: 'p-minh', type: 'Driver', brand: 'TaylorMade', model: 'Qi10', shaftBrand: 'Fujikura Ventus Blue 6', shaftFlex: 'Stiff', shaftWeightG: 63, loftDeg: 10.5, lieDeg: 56 },
  { id: 'cl-wood3', playerId: 'p-minh', type: 'Gỗ 3', brand: 'TaylorMade', model: 'Qi10', shaftBrand: 'Fujikura Ventus Blue 7', shaftFlex: 'Stiff', shaftWeightG: 73, loftDeg: 15, lieDeg: 56.5 },
  { id: 'cl-hybrid4', playerId: 'p-minh', type: 'Hybrid 4', brand: 'Titleist', model: 'TSR2', shaftBrand: 'Mitsubishi Tensei AV Blue', shaftFlex: 'Stiff', shaftWeightG: 80, loftDeg: 21, lieDeg: 58 },
  { id: 'cl-iron5', playerId: 'p-minh', type: 'Sắt 5', brand: 'Mizuno', model: 'JPX923 Forged', shaftBrand: 'Nippon N.S. Pro Modus3 105', shaftFlex: 'Stiff', shaftWeightG: 106, loftDeg: 25, lieDeg: 61 },
  { id: 'cl-iron7', playerId: 'p-minh', type: 'Sắt 7', brand: 'Mizuno', model: 'JPX923 Forged', shaftBrand: 'Nippon N.S. Pro Modus3 105', shaftFlex: 'Stiff', shaftWeightG: 106, loftDeg: 31, lieDeg: 62 },
  { id: 'cl-pw', playerId: 'p-minh', type: 'PW', brand: 'Mizuno', model: 'JPX923 Forged', shaftBrand: 'Nippon N.S. Pro Modus3 105', shaftFlex: 'Stiff', shaftWeightG: 106, loftDeg: 45, lieDeg: 63.5 },
  { id: 'cl-sw', playerId: 'p-minh', type: 'SW', brand: 'Titleist', model: 'Vokey SM10', shaftBrand: 'True Temper Dynamic Gold S200', shaftFlex: 'Stiff', shaftWeightG: 129, loftDeg: 56, lieDeg: 64, bounceDeg: 12 },
  { id: 'cl-putter', playerId: 'p-minh', type: 'Putter', brand: 'Scotty Cameron', model: 'Super Select Newport 2', shaftBrand: 'Scotty Cameron Stepped', shaftFlex: 'Stiff', loftDeg: 3.5, lieDeg: 70 },
];

const swing = (id: string, capturedAt: string, clubId: string, source: MetricSession['source'], v: [number, number, number, number, number, number]): MetricSession => ({
  id, playerId: 'p-minh', capturedAt, source, vendor: source === 'manual' ? undefined : 'trackman', clubId, kind: 'swing',
  swing: { clubSpeedMph: v[0], ballSpeedMph: v[1], smash: v[2], spinRpm: v[3], launchDeg: v[4], carryM: v[5] },
});

const sessions = (): MetricSession[] => [
  // 6 phiên Driver trong 6 tuần, tốc độ đầu gậy tăng 98 → 104 mph
  swing('ss-d1', '2026-08-26T10:00:00Z', 'cl-driver', 'manual', [98.0, 142.1, 1.45, 2950, 13.2, 214]),
  swing('ss-d2', '2026-09-02T10:00:00Z', 'cl-driver', 'csv', [99.4, 144.6, 1.45, 2880, 12.9, 217]),
  swing('ss-d3', '2026-09-09T10:00:00Z', 'cl-driver', 'photo', [100.6, 146.5, 1.46, 2810, 12.7, 220]),
  swing('ss-d4', '2026-09-16T10:00:00Z', 'cl-driver', 'csv', [101.8, 148.6, 1.46, 2740, 12.5, 223]),
  swing('ss-d5', '2026-09-23T10:00:00Z', 'cl-driver', 'manual', [103.0, 150.4, 1.46, 2700, 12.4, 226]),
  swing('ss-d6', '2026-09-30T10:00:00Z', 'cl-driver', 'csv', [104.2, 152.1, 1.46, 2650, 12.4, 229]),
  swing('ss-i1', '2026-09-12T10:00:00Z', 'cl-iron7', 'manual', [83.5, 113.6, 1.36, 6900, 18.1, 141]),
  swing('ss-i2', '2026-10-03T10:00:00Z', 'cl-iron7', 'photo', [84.6, 115.1, 1.36, 6750, 17.6, 145]),
  // ss-w0 → ss-w1: phiên mới nhất (Gỗ 3) có phiên trước cùng gậy để Tổng quan hiện chênh lệch (smash giảm, còn lại tăng)
  swing('ss-w0', '2026-09-19T10:00:00Z', 'cl-wood3', 'csv', [96.1, 138.9, 1.45, 3750, 12.3, 193]),
  swing('ss-w1', '2026-10-05T10:00:00Z', 'cl-wood3', 'manual', [97.2, 140.0, 1.44, 3600, 11.8, 198]),
  { id: 'ss-f1', playerId: 'p-minh', capturedAt: '2026-09-05T01:00:00Z', source: 'manual', kind: 'fitness', fitness: { weightKg: 73.5, flexibility: 6, gripStrengthKg: 43, verticalJumpCm: 46 } },
  { id: 'ss-f2', playerId: 'p-minh', capturedAt: '2026-10-04T01:00:00Z', source: 'manual', kind: 'fitness', fitness: { weightKg: 72.0, flexibility: 7, gripStrengthKg: 45, verticalJumpCm: 48 } },
];

const analyzed = (fileName: string, durationSec: number) => {
  const r = mockAnalysis(fileName, durationSec);
  return { job: { status: r.status, progress: 1 }, analysis: r.analysis };
};
const swings = (): Swing[] => [
  { id: 'sw-minh-1', playerId: 'p-minh', clubId: 'cl-driver', capturedAt: '2026-10-05T09:30:00Z', fileName: 'driver_face_on_60fps.mp4', durationSec: 4.2, cameraView: 'face-on', upload: { status: 'done', progress: 1 }, ...analyzed('driver_face_on_60fps.mp4', 4.2) },
  { id: 'sw-minh-2', playerId: 'p-minh', clubId: 'cl-iron7', capturedAt: '2026-09-28T09:30:00Z', fileName: 'sat7_dtl_sang_som.mp4', durationSec: 3.8, cameraView: 'down-the-line', upload: { status: 'done', progress: 1 }, ...analyzed('sat7_dtl_sang_som.mp4', 3.8) },
  { id: 'sw-minh-3', playerId: 'p-minh', clubId: 'cl-wood3', capturedAt: '2026-10-06T10:15:00Z', fileName: 'go3_face_on_chieu.mp4', durationSec: 3.9, cameraView: 'face-on', upload: { status: 'done', progress: 1 }, job: { status: 'none', progress: 0 } },
  { id: 'sw-lan-1', playerId: 'p-lan', capturedAt: '2026-10-06T07:45:00Z', fileName: 'lan_driver_face_on.mp4', durationSec: 4.0, cameraView: 'face-on', upload: { status: 'done', progress: 1 }, ...analyzed('lan_driver_face_on.mp4', 4.0) },
];

/** State mẫu mới tinh mỗi lần gọi (không chia sẻ tham chiếu giữa các lần). */
export function seedState(): AppState {
  const ps = profiles();
  return {
    sessionUserId: null,
    profiles: ps,
    connections: [
      { id: 'cn-tuan-minh', coachId: 'c-tuan', playerId: 'p-minh', status: 'active', isPrimary: true, invitedAt: '2026-06-05T02:00:00Z', acceptedAt: '2026-06-05T03:00:00Z' },
      { id: 'cn-tuan-lan', coachId: 'c-tuan', playerId: 'p-lan', status: 'active', isPrimary: true, invitedAt: '2026-10-05T02:00:00Z', acceptedAt: '2026-10-06T01:00:00Z' },
      { id: 'cn-ha-khoa', coachId: 'c-ha', playerId: 'p-khoa', status: 'active', isPrimary: true, invitedAt: '2026-05-22T02:00:00Z', acceptedAt: '2026-05-22T05:00:00Z' },
      { id: 'cn-ha-minh', coachId: 'c-ha', playerId: 'p-minh', status: 'active', isPrimary: false, invitedAt: '2026-08-20T02:00:00Z', acceptedAt: '2026-08-21T02:00:00Z' },
      { id: 'cn-ha-lan', coachId: 'c-ha', playerId: 'p-lan', status: 'revoked', isPrimary: false, invitedAt: '2026-07-15T02:00:00Z', acceptedAt: '2026-07-15T04:00:00Z', revokedAt: '2026-09-10T02:00:00Z' },
      // yêu cầu kết nối do người chơi gửi, đang chờ HLV Hà duyệt (tab Học viên › Lời mời của c-ha có sẵn dữ liệu)
      { id: 'cn-ha-huy', coachId: 'c-ha', playerId: 'p-huy', status: 'pending', isPrimary: false, requestedBy: 'player', invitedAt: '2026-10-07T03:00:00Z' },
    ],
    invites: [
      { code: 'TUAN24', coachId: 'c-tuan', createdAt: '2026-10-07T02:00:00Z', expiresAt: '2026-10-14T02:00:00Z' },
      { code: 'HAEXP1', coachId: 'c-ha', createdAt: '2026-09-24T02:00:00Z', expiresAt: '2026-10-01T02:00:00Z' },
      { code: 'USED01', coachId: 'c-tuan', createdAt: '2026-10-05T02:00:00Z', expiresAt: '2026-10-12T02:00:00Z', usedBy: 'p-lan' },
    ],
    sessions: sessions(),
    clubs: clubs(),
    swings: swings(),
    notes: [
      { id: 'note-1', swingId: 'sw-minh-1', coachId: 'c-tuan', atSec: 1.32, text: 'Đỉnh backswing đẹp, nhưng đầu downswing vai mở sớm — giữ lưng quay về mục tiêu thêm một nhịp.', createdAt: '2026-10-05T14:00:00Z' },
      { id: 'note-2', swingId: 'sw-minh-2', coachId: 'c-tuan', atSec: 1.3, text: 'Cổ tay trái hơi gập ở đỉnh, mặt gậy dễ mở. Thử giữ cổ tay phẳng.', createdAt: '2026-09-28T15:00:00Z' },
      { id: 'note-3', swingId: 'sw-minh-2', coachId: 'c-tuan', atSec: 1.62, text: 'Impact tốt: tay dẫn trước bóng, trọng tâm đã sang chân trái.', createdAt: '2026-09-28T15:05:00Z' },
    ],
    follows: [
      { followerId: 'p-minh', followedId: 'c-tuan' },
      { followerId: 'p-minh', followedId: 'c-ha' },
      { followerId: 'p-minh', followedId: 'p-khoa' },
      { followerId: 'p-khoa', followedId: 'p-minh' },
      { followerId: 'c-tuan', followedId: 'c-ha' },
    ],
    posts: [
      { id: 'post-1', authorId: 'c-tuan', createdAt: '2026-10-06T12:00:00Z', title: '3 bài tập giữ tempo 3:1 cho driver', content: 'Đếm "một-hai-ba" khi lên gậy và "bốn" khi xuống. Tập với metronome 70 nhịp/phút, mỗi buổi 20 cú, quay video face-on để so tempo.', tags: ['driver', 'tempo'] },
      { id: 'post-2', authorId: 'c-ha', createdAt: '2026-10-04T08:00:00Z', title: 'Wedge 50 mét: kiểm soát bằng độ dài backswing', content: 'Giữ nhịp như nhau, chỉ đổi độ dài backswing: tay ngang hông ≈ 40 m, ngang ngực ≈ 55 m với SW. Ghi lại carry từng cú để có bảng khoảng cách riêng.', tags: ['wedge', 'short game'] },
      { id: 'post-3', authorId: 'c-tuan', createdAt: '2026-09-30T23:30:00Z', title: 'Khởi động 10 phút trước buổi tập', content: 'Xoay hông, mở vai với gậy ngang lưng, 10 cú swing nửa vòng bằng PW. Khởi động đủ giúp giữ tốc độ đầu gậy ổn định và tránh đau lưng.', tags: ['thể lực'] },
      { id: 'post-4', authorId: 'p-minh', createdAt: '2026-10-05T11:00:00Z', title: 'Lần đầu chạm 104 mph tốc độ đầu gậy!', content: 'Sau 6 tuần tập theo giáo án của HLV Tuấn, tốc độ đầu gậy driver lên từ 98 lên 104 mph, carry gần 230 m.', tags: ['driver'] },
      { id: 'post-5', authorId: 'p-khoa', createdAt: '2026-10-03T13:00:00Z', title: 'Vòng 76 ở sân Long Biên', content: 'Gió khá mạnh ở 9 hố sau, chuyển sang đánh sắt 5 thấp bóng thay vì gỗ 3. Putt 29 lần.', tags: ['vòng đấu', 'sắt'] },
      { id: 'post-6', authorId: 'p-lan', createdAt: '2026-10-01T09:00:00Z', title: 'Buổi đầu tập sắt 7', content: 'Học cách giữ trọng tâm ở chân trước khi xuống gậy. Bóng bắt đầu bay thẳng hơn.', tags: ['sắt', 'tempo'] },
    ],
    likes: [
      { userId: 'p-minh', postId: 'post-1' },
      { userId: 'p-lan', postId: 'post-1' },
      { userId: 'p-minh', postId: 'post-2' },
      { userId: 'c-tuan', postId: 'post-4' },
      { userId: 'p-khoa', postId: 'post-4' },
      { userId: 'p-minh', postId: 'post-5' },
    ],
    comments: [
      { id: 'cm-1', postId: 'post-1', authorId: 'p-minh', text: 'Em tập metronome 2 tuần, tempo ổn định hẳn ạ.', createdAt: '2026-10-06T13:10:00Z' },
      { id: 'cm-2', postId: 'post-4', authorId: 'c-tuan', text: 'Rất tốt! Tuần sau mình tập thêm phần giữ góc cổ tay.', createdAt: '2026-10-05T12:00:00Z' },
      { id: 'cm-3', postId: 'post-4', authorId: 'p-khoa', text: 'Chúc mừng Minh Anh, cuối tuần ra sân Long Biên thử nhé!', createdAt: '2026-10-05T13:30:00Z' },
      { id: 'cm-4', postId: 'post-5', authorId: 'p-minh', text: 'Gió vậy mà vẫn 76, đỉnh quá anh.', createdAt: '2026-10-03T15:00:00Z' },
    ],
    blocks: [],
    reports: [],
    notifications: [
      { id: 'nt-1', userId: 'p-minh', type: 'coach_note', actorId: 'c-tuan', refId: 'sw-minh-1', createdAt: '2026-10-05T14:00:00Z' },
      { id: 'nt-2', userId: 'p-minh', type: 'follow', actorId: 'p-khoa', createdAt: '2026-10-04T09:00:00Z' },
      { id: 'nt-3', userId: 'p-minh', type: 'like', actorId: 'c-tuan', refId: 'post-4', createdAt: '2026-10-05T11:30:00Z', readAt: '2026-10-05T12:00:00Z' },
      { id: 'nt-4', userId: 'p-minh', type: 'analysis_done', refId: 'sw-minh-1', createdAt: '2026-10-05T09:32:00Z', readAt: '2026-10-05T09:40:00Z' },
      { id: 'nt-5', userId: 'c-tuan', type: 'invite_accepted', actorId: 'p-lan', refId: 'cn-tuan-lan', createdAt: '2026-10-06T01:00:00Z' },
      { id: 'nt-6', userId: 'c-ha', type: 'connect_request', actorId: 'p-huy', refId: 'cn-ha-huy', createdAt: '2026-10-07T03:00:00Z' },
    ],
    prefs: Object.fromEntries(ps.map((p) => [p.id, { ...DEFAULT_PREFS, notify: { ...DEFAULT_PREFS.notify } }])),
    simulateFailure: false,
  };
}
