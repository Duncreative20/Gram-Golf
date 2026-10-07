# GramGolf UI full — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng toàn bộ màn UI mobile-first của GramGolf (2 vai trò Người chơi / HLV) trên Expo + `@gr/ds`, click-through end-to-end bằng dữ liệu mock trong bộ nhớ, brand teal/navy.

**Architecture:** App Expo Router ở `apps/golf`. Logic thuần (kiểu dữ liệu, reducer, selector, đơn vị, validate, parser CSV, giả lập job) nằm ở `apps/golf/lib/*.ts` không import React Native, có test vitest. UI chỉ là màn Expo Router ghép component `@gr/ds`; component dùng chung của app ở `apps/golf/components/`. State = 1 React context + reducer thuần.

**Tech Stack:** Expo SDK 57, Expo Router 57, React 19, React Native 0.86, react-native-web 0.21, react-native-svg 15, `@gr/ds` (workspace), vitest 3, pnpm 10.

**Spec:** `docs/superpowers/specs/2026-10-07-gramgolf-ui-design.md` (quyết định D1–D13, danh mục màn §4, tiêu chí nghiệm thu §6).
Nguồn phụ: `docs/product/handoff-2026-08-15.md`, `docs/product/tech-stack-review-2026-08-15.md`.
**API DS đã kiểm chứng:** `docs/ds/API-CHEATSHEET.md` — ĐỌC TRƯỚC khi dùng bất kỳ component DS nào; ví dụ dùng thật ở `apps/golf/app/(dev)/ds/*.tsx`.

## Global Constraints

- Ngôn ngữ UI: **tiếng Việt** có dấu. Tên brand: **GramGolf**.
- Luật DS (`CLAUDE.md` gốc repo): trong `apps/golf/app/**` và `apps/golf/components/**` **cấm** literal hex, `fontSize:`, `padding*:`/`margin*:`/`gap:` bằng số. Mọi màu/spacing/radius/size/font qua `useTheme()` (`t.color('Color/...')`, `t.space('Spacing/...')`, `t.layout('Margin-...')`, `t.radius('Corner-Radius/...')`, `t.size(...)`, `t.primitive('gr-dm-NN')` cho kích thước không có token) hoặc component `@gr/ds`. Text luôn qua `<Text variant="...">` của DS. Kiểm: `pnpm check:literals`.
- Key token = **đúng tên Figma**, không tự đặt tên. Không import `packages/ds/src/generated/primitives*` từ app.
- A11y: nút icon có `accessibilityLabel`; state control qua component DS (không viết `accessibilityState=` tay); ô nhập có label.
- **Ponytail (luật code tối giản, `.claude/settings.json`)**: trước khi viết code, dừng ở bậc đầu tiên đúng: cần làm không? → có sẵn trong repo/DS chưa? → stdlib? → nền tảng (RN/Expo)? → dependency đã cài? → một dòng được không? → mới viết tối thiểu. Không abstraction chưa ai yêu cầu, **không thêm dependency** (trừ `vitest` devDep cho app ở Task 2), không boilerplate, ít file nhất. Component app chỉ tách ra `components/` khi dùng ở ≥2 màn. Cắt góc có chủ đích → comment `// ponytail: <giới hạn> — <đường nâng cấp>`.
- Không lazy về: a11y, validate input người dùng, trạng thái lỗi/thử lại, phân quyền xem dữ liệu (D6).
- Mọi thời điểm mock lấy từ `NOW` (`apps/golf/lib/mock.ts`), không dùng `Date.now()` trong lib để test xác định.
- Đơn vị lưu chuẩn: mph, rpm, độ, mét, kg (D9). Hiển thị theo `prefs.units`.
- Mỗi task kết thúc: `pnpm typecheck && pnpm test && pnpm check:literals` xanh, rồi commit (message tiếng Việt, kết bằng dòng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`). **Không push** (repo GitHub đang public, DS là code private).
- Kiểm tra trực quan (từ Task 3 trở đi thêm `?as=<userId>` vào route để đăng nhập nhanh): chạy web `pnpm -F golf exec expo start --web --port 8081` (nền; xong task thì tắt), chụp `CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/shot-web.mjs "<route>" light <out.png> 390 844` và `dark`. Đọc ảnh để tự kiểm. Ảnh lưu `docs/screens/<task>/<tên>-<light|dark>.png`.

## Review Focus

1. **Follow ≠ quyền xem dữ liệu riêng** — người follow (không có kết nối active) mở `students/[id]` hoặc dữ liệu thông số/swing/bộ gậy của người khác phải bị chặn (màn "Không có quyền xem"). Test: `canViewPrivate` ở Task 2; màn `students/[id]` dùng nó ở Task 11.
2. **Mã mời sai/hết hạn/đã dùng/đã thu hồi** — nhập mã phải báo lỗi đúng loại, không tạo kết nối. Test: `validateInvite` + reducer `acceptInvite` bỏ qua mã không hợp lệ (Task 2).
3. **Huỷ kết nối** — HLV mất quyền xem ngay; HLV chính bị huỷ thì HLV active còn lại (nếu có) không tự thành chính. Test reducer `revokeConnection` (Task 2).
4. **Số liệu ngoài khoảng / ô trống / dấu phẩy thập phân kiểu Việt ("1,48")** ở form nhập tay, review OCR và CSV — phải báo lỗi theo trường, không lưu. Test: `parseNumberVN`, `validateSwingMetrics`, `parseLaunchMonitorCsv` dòng lỗi (Task 2).
5. **Chặn người dùng** — người bị chặn biến khỏi feed, khám phá, và quan hệ follow hai chiều bị gỡ. Test reducer `block` + selector `feed` (Task 2).

---

## Cấu trúc file (khoá trước khi chia task)

```
apps/golf/
  app.json                      name GramGolf, slug gramgolf, scheme gramgolf (Task 1)
  package.json                  + script test, devDep vitest (Task 2)
  vitest.config.ts              (Task 2)
  lib/
    domain.ts                   kiểu dữ liệu + hằng (CLUB_TYPES…)            Task 2
    mock.ts                     NOW, seed state                              Task 2
    reducer.ts                  Action, reduce()                             Task 2
    selectors.ts                selector thuần + canViewPrivate              Task 2
    format.ts                   đơn vị, số VN, ngày giờ                      Task 2
    validation.ts               khoảng hợp lệ + validate*                    Task 2
    csv.ts                      parseLaunchMonitorCsv                        Task 2
    simulate.ts                 mockAnalysis, mockOcr, mock files            Task 2
    store.tsx                   StoreProvider, useStore (React)              Task 2
    ids.ts                      newId()                                      Task 2
    demo.ts                     (có sẵn — gallery DS)
    *.test.ts                   test cạnh file                               Task 2
  components/
    Logo.tsx                    logo SVG GramGolf                            Task 1
    AppTabBar.tsx               BottomNavigation cho expo-router Tabs        Task 3
    TabHeader.tsx               header màn tab: logo/tiêu đề + chuông + avatar Task 3
    StackHeader.tsx             TopNavigation có nút back chuẩn              Task 3
    charts/TrendChart.tsx       line chart SVG                               Task 5
    charts/ConcentricRings.tsx  vòng tròn lồng nhau SVG                      Task 5
    StatTile.tsx                ô chỉ số                                      Task 5
    SwingMetricsForm.tsx        form 6 chỉ số swing (manual + OCR review)    Task 6
    ClubPicker.tsx              chọn gậy (manual, swing upload)              Task 6
    PostItem.tsx                PostCard + map dữ liệu                       Task 12
    NoAccess.tsx                màn không có quyền                           Task 11
  app/
    _layout.tsx                 fonts + ThemeProvider + StoreProvider + Stack  Task 3
    index.tsx                   redirect theo session                         Task 3
    (auth)/_layout.tsx welcome login register forgot-password verify-otp onboarding  Task 4
    (player)/_layout.tsx home metrics swings community coach                 Task 3 (+ màn ở 5,6,9,10,12)
    (coach)/_layout.tsx roster community inbox me                           Task 3 (+ màn ở 11,12,13)
    metrics/  add manual import-csv import-photo scan-qr [id]               Task 6–7
    clubs/    index new [id] [id]/edit                                       Task 8
    swings/   new [id]                                                       Task 9
    connect/  accept invite                                                  Task 10
    coaches/[id]  students/[id]                                              Task 10–11
    community/compose  posts/[id]  users/[id]  people                        Task 12
    notifications  profile  settings/{index,account,password,privacy,notifications,units,dev}  Task 3, 13
    (dev)/ds/*                  (có sẵn)
packages/ds/                    rebrand token (Task 1)
package.json (root)             check:literals thêm apps/golf/components (Task 3)
docs/ds/API-CHEATSHEET.md       (đã có trước Task 1)
docs/screens/                   ảnh nghiệm thu (Task 14)
```

---

### Task 1: Rebrand DS sang GramGolf (teal/navy) + Logo + app.json

**Files:**
- Modify: nguồn token Brand của DS theo `docs/ds/REBRAND.md` (báo cáo phân tích theme — đọc trước; nêu chính xác file DTCG/compact cần sửa và test bị ảnh hưởng)
- Regenerate: `packages/ds/src/generated/*` qua `pnpm -F @gr/ds build:tokens`
- Modify: `packages/ds/src/audit/contrast.test.ts` (chỉ nếu ngưỡng tham chiếu màu cũ — giữ nguyên tiêu chí WCAG)
- Create: `apps/golf/components/Logo.tsx`
- Modify: `apps/golf/app.json`
- Modify: `docs/ds/figma-debt.md` (thêm dòng F-mới: "Brand teal GramGolf chưa có trong Figma")

**Interfaces:**
- Produces: thang `Brand/1..12` + `Brand-Alpha/1..12` (light & dark) là teal, step 9 ≈ `#14BE96`; `Neutral/12` light ≈ navy `#0B2230` nếu báo cáo khuyến nghị tint navy. Mọi key token giữ nguyên tên.
- Produces: `export function Logo(props: { size?: number; variant?: 'mark' | 'full'; tone?: 'brand' | 'onBrand' }): JSX.Element` — `mark` = biểu tượng chevron + G; `full` = biểu tượng + chữ "GramGolf" (dùng `<Text variant>` DS, không vẽ chữ bằng SVG). `tone='onBrand'` vẽ trắng/`On-Accent` cho nền teal. Màu lấy từ token (`Color/Content/Accent/...`, `Color/Content/Neutral/Strongest`), `size` mặc định `t.primitive('gr-dm-48')`.

- [ ] **Step 1:** Đọc `docs/ds/REBRAND.md`. Sinh thang teal 12 bước (light + dark, solid + alpha) theo cách báo cáo chỉ định (giữ step 9 = `#14BE96`; light 1–2 gần trắng ngả teal, 11–12 teal đậm/navy-teal; dark là bản đảo tương ứng kiểu Radix). Ghi thang vào đúng file nguồn (KHÔNG sửa tay `src/generated/*`).
- [ ] **Step 2:** `pnpm -F @gr/ds build:tokens`. Kiểm `git diff --stat packages/ds/src/generated` chỉ đổi giá trị màu GR/Brand (và Neutral nếu tint).
- [ ] **Step 3:** `pnpm -F @gr/ds test`. Nếu `contrast.test.ts` fail ở cặp nền Brand/chữ: chỉnh **token foreground on-brand** theo khuyến nghị báo cáo (vd chữ trên nền Brand/9 dùng navy thay trắng) — không hạ ngưỡng WCAG. `figmaParity.test.ts` so khoá token (không so giá trị) → phải vẫn xanh; nếu so giá trị, cập nhật dump tương ứng và ghi nợ Figma.
- [ ] **Step 4:** Viết `Logo.tsx` bằng `react-native-svg` (`Svg`, `Path`): 3 chevron xếp chồng hướng lên (mũi nhọn trên), chevron dưới cùng uốn thành chữ G (nét ngang vào trong ở góc phải dưới), stroke đều, viewBox `0 0 64 72`. Path tham khảo (stroke, `strokeWidth=6`, `fill="none"`, `strokeLinejoin="miter"`):
  ```
  M8 30 L32 6 L56 30
  M8 44 L32 20 L56 44
  M44 46 L32 34 L8 58 L18 68 L46 68 L56 58 L56 52 L38 52
  ```
  Chỉnh tay cho cân rồi chụp kiểm (Step 6). Ghi đầu file: `// Dựng lại từ ảnh logo 07/10/2026 — thay bằng SVG gốc khi có (NỢ BRAND).`
- [ ] **Step 5:** `app.json`: `"name": "GramGolf"`, `"slug": "gramgolf"`, `"scheme": "gramgolf"`, thêm `"splash": { "backgroundColor": "#0B2230" }` (app.json không thuộc phạm vi luật literal).
- [ ] **Step 6:** Kiểm trực quan: chạy web, chụp `/(dev)/ds/button` và `/(dev)/ds/tab` light+dark → nút Primary teal, chữ trên nút đọc rõ. Tạm thêm Logo vào cuối `apps/golf/app/(dev)/ds/index.tsx` (mục "Brand") để chụp; giữ lại mục này.
- [ ] **Step 7:** `pnpm typecheck && pnpm test && pnpm check:literals` → xanh. Commit `feat(brand): rebrand DS sang GramGolf teal/navy + Logo`.

---

### Task 2: Nền dữ liệu — domain, reducer, selector, format, validate, CSV, giả lập (TDD)

**Files:**
- Modify: `apps/golf/package.json` (script `"test": "vitest run"`, devDependency `"vitest": "^3.2.0"`)
- Create: `apps/golf/vitest.config.ts`
- Create: `apps/golf/lib/{domain,ids,mock,reducer,selectors,format,validation,csv,simulate}.ts`, `apps/golf/lib/store.tsx`
- Test: `apps/golf/lib/{reducer,selectors,format,validation,csv,simulate}.test.ts`

**Interfaces:**
- Produces (dùng ở mọi task sau): mọi export trong các file dưới đây, đúng tên/kiểu.

- [ ] **Step 1: Cấu hình test**

`apps/golf/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['lib/**/*.test.ts'] } });
```
`apps/golf/package.json`: thêm `"test": "vitest run"` vào `scripts`, `"vitest": "^3.2.0"` vào `devDependencies`. Chạy `pnpm install`.

- [ ] **Step 2: `lib/domain.ts`** (chỉ kiểu + hằng, không logic)

```ts
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
export type InviteCheck = 'ok' | 'not_found' | 'expired' | 'used' | 'revoked';

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
```

- [ ] **Step 3: `lib/ids.ts`**
```ts
let n = 0;
// ponytail: id cục bộ theo bộ đếm — đủ cho mock trong bộ nhớ; backend thật dùng UUID.
export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(n++).toString(36)}`;
```

- [ ] **Step 4: Viết test thất bại cho format + validation** — `lib/format.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { formatDistance, formatSpeed, formatTempo, formatDate, relativeTime, parseNumberVN, mToYd, ydToM } from './format';

describe('format', () => {
  it('đổi mét ↔ yard', () => {
    expect(mToYd(100)).toBeCloseTo(109.36, 2);
    expect(ydToM(109.36)).toBeCloseTo(100, 1);
  });
  it('hiển thị khoảng cách theo đơn vị', () => {
    expect(formatDistance(230, 'metric')).toBe('230 m');
    expect(formatDistance(230, 'imperial')).toBe('252 yd');
  });
  it('tốc độ, tempo', () => {
    expect(formatSpeed(104.6)).toBe('105 mph');
    expect(formatTempo(3.04)).toBe('3,0 : 1');
  });
  it('ngày kiểu VN và thời gian tương đối', () => {
    expect(formatDate('2026-10-05T09:00:00Z')).toBe('05/10/2026');
    const now = '2026-10-07T08:00:00Z';
    expect(relativeTime('2026-10-07T07:59:30Z', now)).toBe('Vừa xong');
    expect(relativeTime('2026-10-07T06:00:00Z', now)).toBe('2 giờ trước');
    expect(relativeTime('2026-10-04T08:00:00Z', now)).toBe('3 ngày trước');
    expect(relativeTime('2026-09-01T08:00:00Z', now)).toBe('01/09/2026');
  });
  it('đọc số kiểu VN', () => {
    expect(parseNumberVN('1,48')).toBe(1.48);
    expect(parseNumberVN(' 2.650 ')).toBe(2.65);
    expect(parseNumberVN('')).toBeNull();
    expect(parseNumberVN('abc')).toBeNull();
  });
});
```
`lib/validation.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { validateSwingMetrics, validateFitnessMetrics, validateClub, SWING_FIELDS } from './validation';

describe('validation', () => {
  it('chấp nhận bộ số hợp lệ', () => {
    const r = validateSwingMetrics({ clubSpeedMph: '104', ballSpeedMph: '152', smash: '1,46', spinRpm: '2650', launchDeg: '12,5', carryM: '228' });
    expect(r.errors).toEqual({});
    expect(r.value).toEqual({ clubSpeedMph: 104, ballSpeedMph: 152, smash: 1.46, spinRpm: 2650, launchDeg: 12.5, carryM: 228 });
  });
  it('báo lỗi theo trường: trống, ngoài khoảng, không phải số', () => {
    const r = validateSwingMetrics({ clubSpeedMph: '', ballSpeedMph: '400', smash: 'x', spinRpm: '2650', launchDeg: '12', carryM: '228' });
    expect(r.value).toBeNull();
    expect(Object.keys(r.errors).sort()).toEqual(['ballSpeedMph', 'clubSpeedMph', 'smash']);
    expect(r.errors.ballSpeedMph).toMatch(/50.*220/);
  });
  it('mỗi trường có nhãn và đơn vị', () => {
    expect(SWING_FIELDS.map((f) => f.key)).toEqual(['clubSpeedMph', 'ballSpeedMph', 'smash', 'spinRpm', 'launchDeg', 'carryM']);
    expect(SWING_FIELDS.every((f) => f.label && f.min < f.max)).toBe(true);
  });
  it('thể lực và gậy', () => {
    expect(validateFitnessMetrics({ weightKg: '72', flexibility: '7', gripStrengthKg: '45', verticalJumpCm: '48' }).value).not.toBeNull();
    expect(validateFitnessMetrics({ weightKg: '72', flexibility: '11', gripStrengthKg: '45', verticalJumpCm: '48' }).errors.flexibility).toBeTruthy();
    expect(validateClub({ brand: '', model: 'Qi10', shaftBrand: 'Fujikura', loftDeg: '10,5', lieDeg: '56', shaftWeightG: '', bounceDeg: '' }).errors.brand).toBeTruthy();
  });
});
```

- [ ] **Step 5:** `pnpm -F golf test` → FAIL (module chưa có).

- [ ] **Step 6: Cài `lib/format.ts`**
```ts
import type { Units } from './domain';

export const mToYd = (m: number) => m * 1.0936133;
export const ydToM = (yd: number) => yd / 1.0936133;
const vn = (n: number, digits = 0) => n.toFixed(digits).replace('.', ',');

export const formatDistance = (m: number, units: Units) => (units === 'imperial' ? `${Math.round(mToYd(m))} yd` : `${Math.round(m)} m`);
export const formatSpeed = (mph: number) => `${Math.round(mph)} mph`;
export const formatTempo = (ratio: number) => `${vn(ratio, 1)} : 1`;
export const formatNumber = (n: number, digits = 0) => vn(n, digits);

const pad = (n: number) => String(n).padStart(2, '0');
export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
};
export const relativeTime = (iso: string, now: string) => {
  const s = (Date.parse(now) - Date.parse(iso)) / 1000;
  if (s < 60) return 'Vừa xong';
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} ngày trước`;
  return formatDate(iso);
};
/** "1,48" | "2.650" | " 12 " → số; trống/không hợp lệ → null. Dấu chấm và phẩy đều là thập phân (không có phân cách nghìn). */
export const parseNumberVN = (raw: string): number | null => {
  const s = raw.trim().replace(',', '.');
  if (s === '' || !/^-?\d+(\.\d+)?$/.test(s)) return null;
  return Number(s);
};
```

- [ ] **Step 7: Cài `lib/validation.ts`**
```ts
import type { FitnessMetrics, SwingMetrics } from './domain';
import { parseNumberVN } from './format';

export interface FieldSpec<K extends string> { key: K; label: string; unit: string; min: number; max: number; digits: number }
export const SWING_FIELDS: FieldSpec<keyof SwingMetrics>[] = [
  { key: 'clubSpeedMph', label: 'Tốc độ đầu gậy', unit: 'mph', min: 40, max: 150, digits: 0 },
  { key: 'ballSpeedMph', label: 'Tốc độ bóng', unit: 'mph', min: 50, max: 220, digits: 0 },
  { key: 'smash', label: 'Smash factor', unit: '', min: 1, max: 1.56, digits: 2 },
  { key: 'spinRpm', label: 'Spin', unit: 'rpm', min: 500, max: 12000, digits: 0 },
  { key: 'launchDeg', label: 'Góc bắn', unit: '°', min: -10, max: 45, digits: 1 },
  { key: 'carryM', label: 'Carry', unit: 'm', min: 10, max: 350, digits: 0 },
];
export const FITNESS_FIELDS: FieldSpec<keyof FitnessMetrics>[] = [
  { key: 'weightKg', label: 'Cân nặng', unit: 'kg', min: 30, max: 200, digits: 1 },
  { key: 'flexibility', label: 'Độ dẻo', unit: '/10', min: 0, max: 10, digits: 0 },
  { key: 'gripStrengthKg', label: 'Lực nắm', unit: 'kg', min: 5, max: 100, digits: 0 },
  { key: 'verticalJumpCm', label: 'Bật cao', unit: 'cm', min: 5, max: 120, digits: 0 },
];

export type Raw<K extends string> = Record<K, string>;
export interface Validated<T> { value: T | null; errors: Partial<Record<keyof T, string>> }

function validateFields<K extends string>(specs: FieldSpec<K>[], raw: Raw<K>): Validated<Record<K, number>> {
  const errors: Partial<Record<K, string>> = {};
  const out = {} as Record<K, number>;
  for (const f of specs) {
    const n = parseNumberVN(raw[f.key] ?? '');
    if (n === null) errors[f.key] = raw[f.key]?.trim() ? 'Không phải số' : 'Bắt buộc';
    else if (n < f.min || n > f.max) errors[f.key] = `Trong khoảng ${f.min}–${f.max}${f.unit ? ' ' + f.unit : ''}`;
    else out[f.key] = n;
  }
  return { value: Object.keys(errors).length ? null : out, errors };
}
export const validateSwingMetrics = (raw: Raw<keyof SwingMetrics>) => validateFields(SWING_FIELDS, raw) as Validated<SwingMetrics>;
export const validateFitnessMetrics = (raw: Raw<keyof FitnessMetrics>) => validateFields(FITNESS_FIELDS, raw) as Validated<FitnessMetrics>;

export interface ClubRaw { brand: string; model: string; shaftBrand: string; loftDeg: string; lieDeg: string; shaftWeightG: string; bounceDeg: string }
export function validateClub(raw: ClubRaw) {
  const errors: Partial<Record<keyof ClubRaw, string>> = {};
  for (const k of ['brand', 'model', 'shaftBrand'] as const) if (!raw[k].trim()) errors[k] = 'Bắt buộc';
  const num = (k: keyof ClubRaw, min: number, max: number, optional: boolean) => {
    if (optional && !raw[k].trim()) return undefined;
    const n = parseNumberVN(raw[k]);
    if (n === null || n < min || n > max) { errors[k] = `Trong khoảng ${min}–${max}`; return undefined; }
    return n;
  };
  const loftDeg = num('loftDeg', 0, 64, false);
  const lieDeg = num('lieDeg', 45, 80, false);
  const shaftWeightG = num('shaftWeightG', 30, 150, true);
  const bounceDeg = num('bounceDeg', 0, 20, true);
  return { errors, value: Object.keys(errors).length ? null : { brand: raw.brand.trim(), model: raw.model.trim(), shaftBrand: raw.shaftBrand.trim(), loftDeg: loftDeg!, lieDeg: lieDeg!, shaftWeightG, bounceDeg } };
}
```

- [ ] **Step 8:** `pnpm -F golf test` → format + validation PASS.

- [ ] **Step 9: Test thất bại cho CSV** — `lib/csv.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { parseLaunchMonitorCsv } from './csv';
import { SAMPLE_FILES } from './simulate';

describe('parseLaunchMonitorCsv', () => {
  it('nhận diện TrackMan, đổi yard → mét, giữ dòng lỗi', () => {
    const r = parseLaunchMonitorCsv(SAMPLE_FILES.find((f) => f.vendor === 'trackman')!.content);
    expect(r.vendor).toBe('trackman');
    expect(r.rows.length).toBe(5);
    const ok = r.rows.filter((x) => x.value);
    expect(ok.length).toBe(4);
    expect(ok[0]!.value!.carryM).toBeCloseTo(ydToMRound(250), 0);
    expect(r.rows.find((x) => !x.value)!.errors.length).toBeGreaterThan(0);
  });
  it('nhận diện Foresight (mét sẵn)', () => {
    const r = parseLaunchMonitorCsv(SAMPLE_FILES.find((f) => f.vendor === 'foresight')!.content);
    expect(r.vendor).toBe('foresight');
    expect(r.rows.every((x) => x.value)).toBe(true);
  });
  it('file lạ → vendor null, không dòng', () => {
    expect(parseLaunchMonitorCsv('a,b\n1,2')).toEqual({ vendor: null, rows: [] });
  });
});
const ydToMRound = (yd: number) => Math.round(yd / 1.0936133);
```

- [ ] **Step 10: Cài `lib/simulate.ts`** (file mẫu + giả lập)
```ts
import type { CameraView, SwingAnalysis, SwingMetrics, Vendor } from './domain';

export const SAMPLE_FILES: { name: string; vendor: Vendor; content: string }[] = [
  {
    name: 'TrackMan_Session_2026-10-05.csv', vendor: 'trackman',
    content: [
      'Club,Club Speed [mph],Ball Speed [mph],Smash Factor,Spin Rate [rpm],Launch Angle [deg],Carry [yds]',
      'Driver,104.2,152.1,1.46,2650,12.4,250',
      'Driver,105.0,154.0,1.47,2510,11.9,255',
      'Driver,103.1,149.8,1.45,2790,13.1,246',
      'Driver,,150.2,1.46,2600,12.2,248',
      'Driver,106.4,156.3,1.47,2480,12.0,259',
    ].join('\n'),
  },
  {
    name: 'FSX_Export_7i.csv', vendor: 'foresight',
    content: [
      'Club;ClubSpeed (mph);BallSpeed (mph);Smash;BackSpin (rpm);VLA (deg);Carry (m)',
      '7 Iron;84.0;114.5;1.36;6820;17.8;148',
      '7 Iron;85.2;116.0;1.36;6650;17.2;151',
      '7 Iron;83.6;113.1;1.35;6990;18.4;145',
    ].join('\n'),
  },
];

export const SAMPLE_VIDEOS: { fileName: string; durationSec: number; cameraView: CameraView; failAt?: number; quality: 'good' | 'low' }[] = [
  { fileName: 'driver_face_on_60fps.mp4', durationSec: 4.2, cameraView: 'face-on', quality: 'good' },
  { fileName: 'sat7_dtl_sang_som.mp4', durationSec: 3.8, cameraView: 'down-the-line', quality: 'good' },
  { fileName: 'wedge_mang_yeu.mp4', durationSec: 3.1, cameraView: 'face-on', failAt: 0.6, quality: 'good' },
  { fileName: 'driver_nguoc_sang.mp4', durationSec: 4.0, cameraView: 'face-on', quality: 'low' },
];

/** Kết quả phân tích giả lập, xác định theo tên file (không ngẫu nhiên → test được). */
export function mockAnalysis(fileName: string, durationSec: number): { status: 'succeeded' | 'needs_review'; analysis: SwingAnalysis } {
  const low = SAMPLE_VIDEOS.find((v) => v.fileName === fileName)?.quality === 'low';
  const address = 0.4, top = address + 0.92, impact = top + 0.3, finish = Math.min(durationSec - 0.2, impact + 1.1);
  return {
    status: low ? 'needs_review' : 'succeeded',
    analysis: {
      tempoRatio: Math.round(((top - address) / (impact - top)) * 10) / 10,
      backswingMs: Math.round((top - address) * 1000), downswingMs: Math.round((impact - top) * 1000),
      plane: low ? 'Không đủ rõ để ước lượng mặt phẳng swing' : 'Hơi dốc ở đầu downswing (over the top nhẹ)',
      confidence: low ? 0.41 : 0.78, fps: 60,
      phases: { address, top, impact, finish },
      tips: low ? [] : [
        { text: 'Giữ góc cổ tay lâu hơn ở đầu downswing', startSec: top, endSec: top + 0.2 },
        { text: 'Hông xoay sớm hơn vai khi bắt đầu downswing', startSec: top + 0.05, endSec: impact },
        { text: 'Trọng tâm dồn về chân trước tốt ở impact', startSec: impact - 0.05, endSec: impact + 0.1 },
      ],
      modelVersion: 'pose-mock-0.1',
    },
  };
}

export interface OcrField { key: keyof SwingMetrics; raw: string; confidence: number }
/** OCR giả lập: trả từng trường + độ tin cậy; spin cố ý thấp để màn review có trường cần sửa. */
export function mockOcr(vendor: Vendor): OcrField[] {
  const v = vendor === 'trackman'
    ? { clubSpeedMph: '104,8', ballSpeedMph: '153,2', smash: '1,46', spinRpm: '2B10', launchDeg: '12,1', carryM: '231' }
    : { clubSpeedMph: '84,9', ballSpeedMph: '115,6', smash: '1,36', spinRpm: '6B40', launchDeg: '17,5', carryM: '149' };
  return (Object.keys(v) as (keyof SwingMetrics)[]).map((key) => ({ key, raw: v[key], confidence: key === 'spinRpm' ? 0.62 : 0.97 }));
}
export const LOW_CONFIDENCE = 0.8;
```

- [ ] **Step 11: Cài `lib/csv.ts`**
```ts
import type { SwingMetrics, Vendor } from './domain';
import { ydToM } from './format';
import { validateSwingMetrics } from './validation';

export interface CsvRow { line: number; club: string; value: SwingMetrics | null; errors: string[] }
export interface CsvResult { vendor: Vendor | null; rows: CsvRow[] }

const COLS: Record<Vendor, { sep: string; club: string; map: Record<keyof SwingMetrics, string>; carryYards: boolean }> = {
  trackman: { sep: ',', club: 'Club', carryYards: true, map: { clubSpeedMph: 'Club Speed [mph]', ballSpeedMph: 'Ball Speed [mph]', smash: 'Smash Factor', spinRpm: 'Spin Rate [rpm]', launchDeg: 'Launch Angle [deg]', carryM: 'Carry [yds]' } },
  foresight: { sep: ';', club: 'Club', carryYards: false, map: { clubSpeedMph: 'ClubSpeed (mph)', ballSpeedMph: 'BallSpeed (mph)', smash: 'Smash', spinRpm: 'BackSpin (rpm)', launchDeg: 'VLA (deg)', carryM: 'Carry (m)' } },
};

export function parseLaunchMonitorCsv(text: string): CsvResult {
  const lines = text.trim().split(/\r?\n/);
  const head = lines[0] ?? '';
  const vendor = (Object.keys(COLS) as Vendor[]).find((v) => head.split(COLS[v].sep).includes(COLS[v].map.clubSpeedMph)) ?? null;
  if (!vendor) return { vendor: null, rows: [] };
  const spec = COLS[vendor];
  const header = head.split(spec.sep);
  const rows = lines.slice(1).map((ln, i) => {
    const cells = ln.split(spec.sep);
    const get = (col: string) => cells[header.indexOf(col)] ?? '';
    const raw = Object.fromEntries(Object.entries(spec.map).map(([k, col]) => [k, get(col)])) as Record<keyof SwingMetrics, string>;
    if (spec.carryYards && raw.carryM.trim()) raw.carryM = String(Math.round(ydToM(Number(raw.carryM))));
    const r = validateSwingMetrics(raw);
    return { line: i + 2, club: get(spec.club), value: r.value, errors: Object.values(r.errors) as string[] };
  });
  return { vendor, rows };
}
```

- [ ] **Step 12:** `pnpm -F golf test` → csv PASS. Thêm `lib/simulate.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { mockAnalysis, mockOcr, LOW_CONFIDENCE } from './simulate';
describe('simulate', () => {
  it('video tốt → succeeded, tempo ~3:1, tip có mốc', () => {
    const r = mockAnalysis('driver_face_on_60fps.mp4', 4.2);
    expect(r.status).toBe('succeeded');
    expect(r.analysis.tempoRatio).toBeCloseTo(3.1, 1);
    expect(r.analysis.tips.every((t) => t.startSec < t.endSec)).toBe(true);
  });
  it('video kém → needs_review, confidence thấp', () => {
    expect(mockAnalysis('driver_nguoc_sang.mp4', 4).status).toBe('needs_review');
  });
  it('OCR có đúng 1 trường dưới ngưỡng', () => {
    expect(mockOcr('trackman').filter((f) => f.confidence < LOW_CONFIDENCE).map((f) => f.key)).toEqual(['spinRpm']);
  });
});
```

- [ ] **Step 13: `lib/mock.ts`** — `NOW` và state mẫu. Yêu cầu nội dung (viết đầy đủ, dữ liệu tiếng Việt thật):
  - `export const NOW = '2026-10-07T08:00:00Z';`
  - `export const DEFAULT_PREFS: Preferences` = metric, publicClubs false, publicSwings false, quietHours false, notify tất cả true.
  - `export function seedState(): AppState` trả state mới mỗi lần gọi (không dùng chung tham chiếu), `sessionUserId: null`, gồm:
    - Player `p-minh` "Nguyễn Minh Anh" (handicap 14, homeClub "Sân tập Mỹ Đình"), player `p-lan` "Trần Thu Lan" (hcp 22), player `p-khoa` "Lê Đăng Khoa" (hcp 8), player `p-huy` "Phạm Quốc Huy" (hcp 28, chưa có HLV).
    - Coach `c-tuan` "HLV Đỗ Minh Tuấn" (academy "GramGolf Academy Hà Nội", 12 năm, rating 4.9, 450000 đ/giờ, verified), coach `c-ha` "HLV Vũ Thanh Hà" (academy "Saigon Golf Lab", 8 năm, rating 4.7, verified).
    - Connection active primary: c-tuan↔p-minh, c-tuan↔p-lan; active primary c-ha↔p-khoa; active **không primary** c-ha↔p-minh (để có màn nhiều HLV); 1 revoked c-ha↔p-lan.
    - Invite: `TUAN24` (c-tuan, còn hạn tới 2026-10-14), `HAEXP1` (c-ha, hết hạn 2026-10-01), `USED01` (c-tuan, usedBy p-lan).
    - p-minh: 6 phiên swing Driver trong 6 tuần (clubSpeed tăng dần 98→104), 2 phiên Sắt 7, 1 phiên Gỗ 3 (để vòng tròn carry có 3 gậy), 2 phiên thể lực; nguồn đủ loại manual/csv/photo.
    - p-minh: 8 gậy (Driver, Gỗ 3, Hybrid 4, Sắt 5, Sắt 7, PW, SW 56°/bounce 12, Putter) thông số thật (vd Driver TaylorMade Qi10 10,5°, cán Fujikura Ventus Blue 6 Stiff 63 g, lie 56°).
    - p-minh: 3 swing — 1 succeeded có analysis (dùng `mockAnalysis`) + 1 coach note của c-tuan, 1 succeeded có 2 coach note của c-tuan (atSec), 1 `job.status='none'` (chưa phân tích). **Mọi swing đã phân tích của p-minh đều có note c-tuan** (để `needsFeedback(c-tuan)` chỉ ra p-lan). p-lan: 1 swing succeeded **chưa có note** (để roster "Cần phản hồi"). p-khoa: 1 bài đăng (để test chặn/feed).
    - Follows: p-minh follow c-tuan, c-ha, p-khoa; p-khoa follow p-minh; c-tuan follow c-ha.
    - 6 posts (3 của HLV, 3 của player), tag thật ("driver", "tempo", "wedge", "thể lực"…), likes + 4 comments.
    - Notifications cho p-minh: 1 coach_note chưa đọc, 1 follow chưa đọc, 1 like đã đọc, 1 analysis_done đã đọc; cho c-tuan: 1 invite_accepted chưa đọc.
    - prefs: `DEFAULT_PREFS` cho mọi profile.

- [ ] **Step 14: Test thất bại cho reducer + selectors** — `lib/reducer.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { reduce } from './reducer';
import { seedState, NOW } from './mock';
import { canViewPrivate, validateInvite, activeCoaches, feed, roster } from './selectors';

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
});
```
`lib/selectors.test.ts`:
```ts
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
```

- [ ] **Step 15:** `pnpm -F golf test` → FAIL (reducer/selectors chưa có).

- [ ] **Step 16: Cài `lib/reducer.ts`**
```ts
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
      if (validateInvite(s, a.code, a.at) !== 'ok') return s;
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
```

- [ ] **Step 17: Cài `lib/selectors.ts`**
```ts
import type { AppState, Club, CoachConnection, ID, ISO, InviteCheck, MetricSession, Post, Preferences, Profile, Swing } from './domain';
import { DEFAULT_PREFS } from './mock';

export const profileById = (s: AppState, id: ID) => s.profiles.find((p) => p.id === id);
export const me = (s: AppState) => (s.sessionUserId ? profileById(s, s.sessionUserId) : undefined);
export const prefsOf = (s: AppState, id: ID): Preferences => s.prefs[id] ?? DEFAULT_PREFS;

/** Ma trận RLS (tech review §6.2): dữ liệu riêng chỉ chủ sở hữu + HLV có kết nối active. Follow KHÔNG mở. */
export const canViewPrivate = (s: AppState, viewerId: ID, playerId: ID) =>
  viewerId === playerId || s.connections.some((c) => c.coachId === viewerId && c.playerId === playerId && c.status === 'active');

export const validateInvite = (s: AppState, code: string, now: ISO): InviteCheck => {
  const inv = s.invites.find((i) => i.code.toUpperCase() === code.trim().toUpperCase());
  if (!inv) return 'not_found';
  if (inv.revoked) return 'revoked';
  if (inv.usedBy) return 'used';
  if (Date.parse(inv.expiresAt) <= Date.parse(now)) return 'expired';
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

export const swingsOf = (s: AppState, playerId: ID): Swing[] => s.swings.filter((w) => w.playerId === playerId).sort(byDateDesc);
export const notesFor = (s: AppState, swingId: ID) => s.notes.filter((n) => n.swingId === swingId).sort((a, b) => (a.atSec ?? 0) - (b.atSec ?? 0));
export const needsFeedback = (s: AppState, coachId: ID) =>
  roster(s, coachId).filter((p) => swingsOf(s, p.id).some((w) => w.analysis && !s.notes.some((n) => n.swingId === w.id && n.coachId === coachId)));

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
export const fold = (x: string) => x.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();
export const discover = (s: AppState, userId: ID, query: string) =>
  s.profiles.filter((p) => p.id !== userId && !isBlocked(s, userId, p.id) && fold(p.name).includes(fold(query.trim())));

export const notificationsOf = (s: AppState, userId: ID) => s.notifications.filter((n) => n.userId === userId).sort(byDateDesc);
export const unreadCount = (s: AppState, userId: ID) => s.notifications.filter((n) => n.userId === userId && !n.readAt).length;
```

- [ ] **Step 18:** `pnpm -F golf test` → tất cả PASS. Nếu test seed (`unreadCount` = 2, `needsFeedback` = ['p-lan'], 5 phiên Driver…) fail → sửa **seed** cho khớp yêu cầu Step 13, không sửa test.

- [ ] **Step 19: `lib/store.tsx`** (React; không test riêng — chỉ nối reducer)
```tsx
import { createContext, useContext, useMemo, useReducer, type PropsWithChildren } from 'react';
import type { AppState } from './domain';
import { reduce, type Action } from './reducer';
import { seedState } from './mock';
import { me as meOf } from './selectors';

const Ctx = createContext<{ state: AppState; dispatch: (a: Action) => void } | null>(null);
export function StoreProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reduce, undefined, seedState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore: bọc app trong <StoreProvider>');
  return { ...v, me: meOf(v.state) };
}
```

- [ ] **Step 20:** `pnpm typecheck && pnpm test && pnpm check:literals` xanh. Commit `feat(app): nền dữ liệu mock — domain, reducer, selector, đơn vị, validate, CSV, giả lập (có test)`.

---

### Task 3: Khung app — layout gốc, điều hướng theo vai trò, tab bar, header, hồ sơ & cài đặt cơ bản

**Files:**
- Modify: `apps/golf/app/_layout.tsx`, `apps/golf/app/index.tsx`
- Create: `apps/golf/app/(player)/_layout.tsx` + `home.tsx metrics.tsx swings.tsx community.tsx coach.tsx`
- Create: `apps/golf/app/(coach)/_layout.tsx` + `roster.tsx community.tsx inbox.tsx me.tsx`
- Create: `apps/golf/components/{AppTabBar,TabHeader,StackHeader}.tsx`
- Create: `apps/golf/app/profile.tsx`, `apps/golf/app/settings/index.tsx`, `apps/golf/app/settings/dev.tsx`
- Modify: root `package.json` script `check:literals` thêm `apps/golf/components`

**Interfaces:**
- Consumes: `StoreProvider`, `useStore`, selectors (Task 2), `Logo` (Task 1).
- Produces:
  - `AppTabBar` — prop là `BottomTabBarProps` của expo-router `Tabs` (`tabBar={(p) => <AppTabBar {...p} />}`); map `state.index` ↔ `BottomNavigation.selectedIndex`, `onChange(i)` → `navigation.navigate(state.routes[i].name)`; icon/nhãn lấy từ `options.title` + bảng `TAB_ICONS: Record<string, { icon: IconName; iconSelected?: IconName }>` trong file. Đặt bar ở đáy, có inset an toàn (`useSafeAreaInsets`).
  - `TabHeader({ title?: string })` — không có `title` → `Logo variant="full"`; phải: IconButton chuông (`accessibilityLabel="Thông báo"`, `Badge` số chưa đọc nếu >0) → `/notifications`; Avatar của `me` → `/profile`.
  - `StackHeader({ title: string; subtitle?: string; actions?: TopNavAction[] })` — `TopNavigation align="Left"` có nút back (`router.back()`, label "Quay lại").
  - Màn tab nào chưa được task sau dựng: render `EmptyState` (icon phù hợp, title = tên tab, caption "Đang dựng") — Task sau **thay thế** nội dung.

- [ ] **Step 1:** `_layout.tsx`: giữ nạp font như cũ, bọc `SafeAreaProvider` (nếu `Screen` cần — xem cheatsheet) → `ThemeProvider scheme="auto"` → `StoreProvider` → `<Stack screenOptions={{ headerShown: false }} />`. **Đăng nhập nhanh cho chụp ảnh (chỉ `__DEV__`):** component con trong `StoreProvider` đọc `useGlobalSearchParams<{ as?: string }>().as`; nếu có và khác `sessionUserId` → `dispatch({ type: 'signIn', userId: as })` (một lần). Nhờ vậy `shot-web.mjs "/(player)/home?as=p-minh"` chụp được màn cần đăng nhập. Ghi cách dùng vào comment đầu file.
- [ ] **Step 2:** `index.tsx`: `const { me } = useStore();` → chưa đăng nhập `<Redirect href="/(auth)/welcome" />` (route sẽ có ở Task 4; tạm thời trỏ `/settings/dev` nếu `(auth)` chưa tồn tại để typedRoutes không lỗi — Task 4 đổi lại), player → `/(player)/home`, coach → `/(coach)/roster`.
- [ ] **Step 3:** `(player)/_layout.tsx` và `(coach)/_layout.tsx` dùng `Tabs` của `expo-router` với `screenOptions={{ headerShown: false }}`, `tabBar` = `AppTabBar`. Thứ tự + nhãn tab đúng spec §3. Guard: nếu `me?.role` không khớp nhóm → `<Redirect href="/" />`.
- [ ] **Step 4:** `AppTabBar`, `TabHeader`, `StackHeader` theo Interfaces. Chọn icon bằng cách tra `ICONS` (`packages/ds/src/icons/generated.ts`) — ví dụ `home-02-line/solid`, `bar-chart-*`, `video-recorder-*`, `users-*`, `user-circle-*`, `bell-*`; tên phải tồn tại (type `IconName` sẽ báo lỗi nếu sai).
- [ ] **Step 5:** `settings/dev.tsx` (D13): danh sách profile mock (ListItem, nhóm Người chơi / HLV) → bấm = `dispatch({ type: 'signIn', userId })` rồi `router.replace('/')`; nút "Đặt lại dữ liệu mẫu" (`reset`, có Dialog xác nhận); link "Gallery DS" → `/(dev)/ds`. Chỉ vào được từ `settings/index` khi `__DEV__`.
- [ ] **Step 6:** `profile.tsx`: Avatar lớn, tên, vai trò, handicap/academy, followers/following, nút "Chỉnh sửa hồ sơ" → `/settings/account`, "Cài đặt" → `/settings`, "Đăng xuất" (Dialog xác nhận → `signOut` → `router.replace('/')`). `settings/index.tsx`: ListItem điều hướng tới account, password, privacy, notifications, units, (dev nếu `__DEV__`). Các màn con chưa có → Task 13 dựng (Expo Router báo route thiếu là chấp nhận được tới Task 13; KHÔNG để link chết sau Task 13).
- [ ] **Step 7:** Root `package.json` `check:literals`: thêm `apps/golf/components` vào danh sách đường dẫn grep.
- [ ] **Step 8:** Chạy web, vào `/settings/dev`, đăng nhập `p-minh` → thấy tab bar 5 tab; đổi `c-tuan` → 4 tab. Chụp 2 ảnh light/dark mỗi vai trò. `pnpm typecheck && pnpm test && pnpm check:literals`. Commit `feat(app): khung điều hướng theo vai trò, tab bar, header, hồ sơ, cài đặt dev`.

---

### Task 4: Xác thực & onboarding

**Files:** Create `apps/golf/app/(auth)/{_layout,welcome,login,register,forgot-password,verify-otp,onboarding}.tsx`; Modify `apps/golf/app/index.tsx` (redirect `/(auth)/welcome`).

**Interfaces:** Consumes `useStore`, `newId`, `NOW`, `parseNumberVN`. Produces route `/(auth)/*`.

Yêu cầu từng màn (spec §4 Auth):
- [ ] **Step 1 welcome:** nền `Color/Background/Accent/...` (teal) hoặc Canvas với `Logo variant="full" tone` phù hợp, tagline "Theo dõi phong độ. Kết nối HLV. Cùng tiến bộ.", 2 nút: "Tạo tài khoản" (Primary) → register, "Đăng nhập" (Secondary/Tertiary) → login. Dev: link nhỏ "Dùng tài khoản mẫu" → `/settings/dev` khi `__DEV__`.
- [ ] **Step 2 login:** TextField email/SĐT + mật khẩu (ẩn/hiện), nút Đăng nhập. Mock: tìm profile theo email (không phân biệt hoa thường) hoặc phone; mật khẩu bất kỳ ≥6 ký tự. Sai → InlineMessage lỗi "Email/SĐT hoặc mật khẩu không đúng". Link "Quên mật khẩu?".
- [ ] **Step 3 register:** B1 chọn vai trò — 2 Card chọn được (RadioRow hoặc Card + Radio), mô tả ngắn; B2 form: Họ tên, Email (regex đơn giản), SĐT (10 số, bắt đầu 0), Mật khẩu (≥8, có số), + player: Handicap (0–54, `parseNumberVN`); coach: Học viện/CLB, Số năm kinh nghiệm (0–60). Hiển thị lỗi theo trường khi bấm Tiếp. Có `Stepper` 2 bước (cheatsheet). Submit → `/(auth)/verify-otp` truyền dữ liệu qua params (JSON) — hoặc giữ trong state màn cha bằng `router.push` params; KHÔNG thêm thư viện.
- [ ] **Step 4 verify-otp:** `OtpField` 6 số; mã đúng mock `123456` (ghi caption "Mã thử: 123456" khi `__DEV__`); sai → lỗi; "Gửi lại mã" disabled đếm ngược 60s. Đúng → `dispatch({ type: 'register', profile: {...id: newId('u'), createdAt: NOW} })` → `/(auth)/onboarding`.
- [ ] **Step 5 onboarding:** 3 bước có `PageIndicator`: (1) ảnh đại diện (Avatar + nút "Chọn ảnh" mock đặt `avatarUrl` từ danh sách ảnh có sẵn hoặc giữ initials), (2) đơn vị đo (RadioRow Mét/Yard → `setPrefs`), (3) player: "Bạn có mã mời từ HLV?" → nút "Nhập mã" → `/connect/accept`, "Để sau"; coach: "Mời học viên đầu tiên" → `/connect/invite`, "Để sau". Xong → `router.replace('/')`.
- [ ] **Step 6 forgot-password:** nhập email → màn xác nhận "Đã gửi hướng dẫn tới …" (mock).
- [ ] **Step 7:** `index.tsx` redirect về `/(auth)/welcome`. Kiểm luồng đăng ký player trên web end-to-end; chụp welcome/login/register B1+B2(lỗi)/otp/onboarding light+dark. Gates xanh. Commit `feat(auth): đăng ký 2 vai trò, OTP, onboarding, đăng nhập`.

---

### Task 5: Player — Tổng quan (home) + biểu đồ

**Files:** Modify `apps/golf/app/(player)/home.tsx`; Create `apps/golf/components/{StatTile,charts/TrendChart,charts/ConcentricRings}.tsx`.

**Interfaces:**
- Produces `StatTile({ label: string; value: string; unit?: string; delta?: { text: string; good: boolean } })` — Card nhỏ.
- Produces `TrendChart({ data: { x: string; y: number }[]; height?: number; accessibilityLabel: string })` — polyline + chấm, trục nhãn ngày `dd/MM` dưới, giá trị điểm cuối đậm; màu `Color/Content/Accent/...` và lưới `Color/Border/Neutral/...`; đo chiều rộng bằng `onLayout`.
- Produces `ConcentricRings({ items: { label: string; value: number; display: string }[]; accessibilityLabel: string })` — tối đa 3 vòng tròn đồng tâm, bán kính tỉ lệ `value / max`, vòng ngoài nhạt nhất (`Brand` bước thấp) → trong cùng đậm nhất; chú thích bên phải.
- Consumes selectors `latestSwing`, `speedTrend`, `carryByClub`, `primaryCoach`, `notesFor`, `followerCount`, `followingCount`, `prefsOf`; `formatDistance`, `formatSpeed`.

- [ ] **Step 1:** Hero Card (nền Accent nhẹ): Avatar, tên, "Handicap 14", HLV chính (tên + link `/coaches/[id]`), followers/following.
- [ ] **Step 2:** "Chỉ số swing gần nhất" — 4 `StatTile`: Tốc độ đầu gậy, Tốc độ bóng, Smash, Carry (theo đơn vị prefs) + delta so với phiên trước (cùng gậy). Ngày + nguồn (Tag "Nhập tay/CSV/Ảnh/QR").
- [ ] **Step 3:** "Xu hướng tốc độ đầu gậy (Driver, 5 buổi)" — `TrendChart`.
- [ ] **Step 4:** "Carry theo gậy" — `ConcentricRings` từ `carryByClub`.
- [ ] **Step 5:** "Ghi chú mới từ HLV" — note mới nhất trên swing của mình → link `/swings/[id]`; không có → ẩn mục.
- [ ] **Step 6:** CTA nổi "Nhập số liệu" → `/metrics/add`. Empty state khi chưa có phiên swing (user mới đăng ký): EmptyState "Chưa có số liệu" + "Nhập số liệu đầu tiên".
- [ ] **Step 7:** Chụp home p-minh light/dark + user mới (đăng ký) light. Gates. Commit `feat(player): màn Tổng quan với chỉ số, xu hướng, vòng carry`.

---

### Task 6: Thông số — danh sách, chi tiết, chọn nguồn, nhập tay

**Files:** Modify `apps/golf/app/(player)/metrics.tsx`; Create `apps/golf/app/metrics/{add,manual,[id]}.tsx`, `apps/golf/components/{SwingMetricsForm,ClubPicker}.tsx`.

**Interfaces:**
- Produces `SwingMetricsForm({ values: Record<keyof SwingMetrics, string>; onChange(next): void; errors: Partial<Record<keyof SwingMetrics, string>>; highlight?: Partial<Record<keyof SwingMetrics, boolean>> })` — 6 TextField số theo `SWING_FIELDS` (nhãn + đơn vị + lỗi; `highlight` = viền/InlineMessage cảnh báo "Độ tin cậy thấp — kiểm tra lại"). Carry nhập theo đơn vị prefs (đổi về mét khi lưu).
- Produces `ClubPicker({ playerId: ID; value?: ID; onChange(id: ID): void })` — SelectField/BottomSheet danh sách `clubsOf` theo nhóm + "Thêm gậy mới" → `/clubs/new`.

- [ ] **Step 1 metrics tab:** `TabHeader title="Thông số"`; `Segmented` Swing / Thể lực / Bộ gậy. Swing & Thể lực: danh sách phiên (ListItem: ngày, gậy, chỉ số chính "105 mph · 228 m", Tag nguồn) → `/metrics/[id]`; Bộ gậy: nhúng nội dung lưới gậy (Task 8 dựng `clubs/index` — ở task này hiển thị danh sách gậy đơn giản + link "Quản lý bộ gậy" → `/clubs`). Nút "+" → `/metrics/add`. Empty state mỗi segment.
- [ ] **Step 2 metrics/add:** màn dạng sheet (BottomSheet hoặc Stack modal `presentation: 'modal'`) 4 lựa chọn ListItem có icon + mô tả: Nhập tay → `manual`; Nhập file CSV (TrackMan/Foresight) → `import-csv`; Ảnh chụp màn hình → `import-photo`; Quét QR (Tag "Thử nghiệm") → `scan-qr`.
- [ ] **Step 3 metrics/manual:** Segmented Swing/Thể lực; ngày (DateField, mặc định NOW); Swing: ClubPicker (bắt buộc) + SwingMetricsForm; Thể lực: 4 field theo `FITNESS_FIELDS`. "Lưu" → validate (`validateSwingMetrics`/`validateFitnessMetrics`), lỗi hiện theo trường; hợp lệ → `addSession` source manual → Toast "Đã lưu" → `router.back()`.
- [ ] **Step 4 metrics/[id]:** toàn bộ chỉ số (FieldGroup/ListItem đọc), gậy, nguồn + hãng, ngày; nếu nguồn csv/photo hiển thị "Dữ liệu gốc" (Accordion, text mock). Chủ sở hữu: nút xoá (Dialog) → `deleteSession`. Người xem khác dùng `canViewPrivate` — không đủ quyền → `NoAccess` (tạo ở Task 11; tạm EmptyState "Không có quyền xem").
- [ ] **Step 5:** Chụp metrics (3 segment), add, manual (lỗi + hợp lệ), detail. Gates. Commit `feat(metrics): danh sách, chi tiết, chọn nguồn, nhập tay có validate`.

---

### Task 7: Nhập CSV, ảnh/OCR, QR

**Files:** Create `apps/golf/app/metrics/{import-csv,import-photo,scan-qr}.tsx`.

**Interfaces:** Consumes `SAMPLE_FILES`, `parseLaunchMonitorCsv`, `mockOcr`, `LOW_CONFIDENCE`, `validateSwingMetrics`, `SwingMetricsForm`, `ClubPicker`.

- [ ] **Step 1 import-csv:** Bước 1 "Chọn file": danh sách `SAMPLE_FILES` (ListItem icon file + tên) — ghi chú "Bản thử: chọn file mẫu" (ponytail: không thêm document picker). Bước 2 "Xem trước": Tag hãng nhận diện; bảng dòng (ListItem mỗi dòng: "Dòng 2 · 104 mph · 228 m" hoặc dòng lỗi với InlineMessage lý do); tổng "4 dòng hợp lệ · 1 dòng lỗi (bỏ qua)". Bước 3 "Xác nhận": ClubPicker (gợi ý theo cột Club), DateField → "Nhập 4 phiên" → `addSessions` source csv vendor → Toast → về metrics. File không nhận diện được → EmptyState lỗi + "Chọn file khác". Dùng `Stepper` 3 bước.
- [ ] **Step 2 import-photo:** Bước 1 chọn hãng (Segmented TrackMan/Foresight) + khung hướng dẫn crop (khung viền nét đứt tỉ lệ 4:3 với nhãn "Đặt bảng số liệu vào khung") + nút "Chọn ảnh" (mock). Bước 2 "Đang đọc…" (ProgressBar/spinner 1,5s, có nút Huỷ). Bước 3 review: `SwingMetricsForm` điền sẵn từ `mockOcr`, `highlight` các trường `confidence < LOW_CONFIDENCE` (spin "2B10" → lỗi "Không phải số" buộc sửa); AlertBanner "1 trường độ tin cậy thấp — kiểm tra trước khi lưu"; ClubPicker; Lưu → `addSession` source photo.
- [ ] **Step 3 scan-qr:** khung camera giả lập (View tỉ lệ vuông nền tối, góc vuông khung ngắm, dòng quét), Tag "Thử nghiệm", text giải thích "QR của sân tập dùng để liên kết phiên — đang chờ xác nhận định dạng với đối tác". Nút "Mô phỏng quét thành công" → InlineMessage "Đã liên kết phiên TrackMan #A1F3" + nút "Nhập dữ liệu phiên" → `import-csv` (file TrackMan chọn sẵn qua param).
- [ ] **Step 4:** Chụp từng bước light (+1 dark mỗi màn). Gates. Commit `feat(metrics): nhập CSV có preview/lỗi dòng, OCR có review độ tin cậy, QR thử nghiệm`.

---

### Task 8: Bộ gậy

**Files:** Create `apps/golf/app/clubs/{index,new,[id]}.tsx`, `apps/golf/app/clubs/[id]/edit.tsx` — **lưu ý Expo Router**: `[id].tsx` và thư mục `[id]/` không cùng tồn tại được → dùng `clubs/[id]/index.tsx` + `clubs/[id]/edit.tsx`. Form dùng chung giữa new và edit đặt trong `clubs/new.tsx` export `ClubForm` (ponytail: không tạo file component riêng cho 2 màn cùng nhóm) và `edit.tsx` import nó.

**Interfaces:** Consumes `CLUB_TYPES`, `CLUB_GROUPS`, `SHAFT_FLEXES`, `validateClub`, `clubsOf`, `clubLabel`, `swingsOf`, `canViewPrivate`. Produces `ClubForm({ initial?: Club; onSubmit(club: Club): void })`.

- [ ] **Step 1 clubs/index:** `StackHeader title="Bộ gậy" subtitle="8 gậy"`; nhóm theo `CLUB_GROUPS` (tiêu đề nhóm + lưới 2 cột Card: tên loại lớn, hãng + model, "10,5° · Stiff"). FAB/nút "Thêm gậy". Empty state. Hỗ trợ param `playerId` (HLV xem — chỉ đọc, ẩn thêm/sửa; kiểm `canViewPrivate`).
- [ ] **Step 2 ClubForm (new):** Loại gậy (SelectField 16 loại + "Tuỳ chỉnh" → hiện TextField tên), Hãng, Model, Hãng cán, Flex (Chip chọn 1 trong 5), Trọng lượng cán (g, tuỳ chọn), Loft, Lie, Bounce (chỉ hiện với Wedge hoặc khi đã có giá trị). Gợi ý loft mặc định theo loại (Driver 10,5 · Gỗ 3 15 · Gỗ 5 18 · Hybrid 3 19 · Hybrid 4 22 · Sắt 4 21 → +3,5°/số · PW 46 · GW 50 · SW 56 · LW 60 · Putter 3) khi người dùng chưa nhập. Validate `validateClub`. Lưu → `upsertClub`.
- [ ] **Step 3 clubs/[id]:** thông số đầy đủ (FieldGroup), "Swing gần đây dùng gậy này" (từ `swingsOf` lọc clubId), "Phiên số liệu gần đây"; nút Sửa → edit; "Lưu trữ gậy" (Dialog: "Gậy đã gắn với N phiên/swing sẽ được ẩn khỏi danh sách, dữ liệu cũ giữ nguyên") → `archiveClub`.
- [ ] **Step 4:** Thay link tạm ở metrics segment Bộ gậy bằng lưới thật (tái dùng phần render của `clubs/index` — export component `ClubGrid` từ `clubs/index.tsx`). Chụp. Gates. Commit `feat(clubs): bộ gậy theo nhóm, thêm/sửa/lưu trữ, HLV xem chỉ đọc`.

---

### Task 9: Swing — danh sách, đăng video, chi tiết & phân tích

**Files:** Modify `apps/golf/app/(player)/swings.tsx`; Create `apps/golf/app/swings/{new,[id]}.tsx`.

**Interfaces:** Consumes `SAMPLE_VIDEOS`, `mockAnalysis`, `swingsOf`, `notesFor`, `clubById`, `ClubPicker`, `newId`, `NOW`, actions `addSwing/uploadUpdate/jobUpdate/addNote/deleteSwing`. Mô phỏng thời gian dùng `setInterval` trong màn (dọn dẹp khi unmount); trạng thái tiến độ nằm trong store để danh sách cũng thấy.

- [ ] **Step 1 swings tab:** `TabHeader title="Swing"`; danh sách Card: khung thumbnail (View tỉ lệ 9:16 thu nhỏ nền tối + icon play), gậy, ngày, góc quay, trạng thái (Badge: "Đang tải 45%", "Tạm dừng", "Lỗi tải lên", "Chưa phân tích", "Đang phân tích", "Đã phân tích", "Cần xem lại"), icon ghi chú HLV nếu có note. Nút "Đăng swing" → `/swings/new`. Empty state.
- [ ] **Step 2 swings/new:** Bước 1 "Hướng dẫn quay" (checklist: 60fps trở lên, toàn thân + đầu gậy, đặt máy face-on hoặc down-the-line, tránh ngược sáng — hình minh hoạ silhouette đơn giản bằng Icon); Bước 2 chọn video (danh sách `SAMPLE_VIDEOS`), ClubPicker, Segmented góc quay (mặc định theo video); Bước 3 tải lên: ProgressBar, nút Tạm dừng/Tiếp tục, khi `failAt` → trạng thái lỗi + "Thử lại" (thử lại thì thành công). Xong → "Phân tích ngay" (đặt job `queued`) hoặc "Để sau" → `/swings/[id]`.
- [ ] **Step 3 swings/[id] — video:** khung video tỉ lệ 9:16 nền tối + `VideoControlOverlay` (cheatsheet) với thời lượng; dưới là **timeline** thanh ngang với 4 mốc address/top/impact/finish (nhãn "Chuẩn bị · Đỉnh · Chạm bóng · Kết thúc") và chấm ghi chú HLV theo `atSec`; chạm mốc = "tua" (state `positionSec`).
- [ ] **Step 4 swings/[id] — phân tích:** theo `job.status`: none → nút "Phân tích swing" + giải thích "Kết quả là ước lượng từ video, không phải đo đạc"; queued/processing → ProgressBar + "Đang phân tích… thường mất dưới 1 phút" (mô phỏng 3s: queued 0,5s → processing tăng dần → `mockAnalysis` → `jobUpdate`); succeeded → tempo (`formatTempo`, backswing/downswing ms), mặt phẳng swing, Tag "Độ tin cậy 78%", "60 fps · Face-on", danh sách tips (mỗi tip có mốc thời gian, chạm = tua); needs_review → AlertBanner "Video chưa đủ rõ — thử quay lại theo hướng dẫn" + nút Quay lại hướng dẫn; failed → lỗi + Thử lại.
- [ ] **Step 5 swings/[id] — ghi chú HLV:** danh sách note (avatar HLV, mốc thời gian, nội dung). Nếu người xem là HLV có kết nối active (`canViewPrivate` && role coach): `MessageInput`/`CommentComposer` "Ghi chú tại 1,3s" (gắn `positionSec` hiện tại) → `addNote`. Người xem không có quyền → NoAccess. Chủ sở hữu: menu xoá swing (Dialog).
- [ ] **Step 6:** Chụp: list, new (3 bước + lỗi tải), detail (none/processing/succeeded/needs_review). Gates. Commit `feat(swings): đăng video có tiến độ/lỗi, phân tích ước lượng theo mốc, ghi chú HLV theo thời gian`.

---

### Task 10: Kết nối HLV – học viên (phía player + tạo mã phía coach)

**Files:** Modify `apps/golf/app/(player)/coach.tsx`; Create `apps/golf/app/connect/{accept,invite}.tsx`, `apps/golf/app/coaches/[id].tsx`.

**Interfaces:** Consumes `activeCoaches`, `validateInvite`, `pendingInvites`, actions `acceptInvite/revokeConnection/setPrimaryCoach/createInvite/revokeInvite`, `ShareSheet` (DS Social).

- [ ] **Step 1 (player)/coach:** `TabHeader title="HLV"`; HLV chính (Card lớn: avatar, tên + badge xác minh, học viện, rating, kinh nghiệm, đơn giá, nút "Xem hồ sơ" → `/coaches/[id]`); "HLV khác" (ListItem, menu: "Đặt làm HLV chính" → `setPrimaryCoach`, "Huỷ kết nối"); Accordion "HLV xem được gì?" (giải thích: thông số, swing, bộ gậy, thể lực — người theo dõi KHÔNG xem được). Nút "Nhập mã mời". Huỷ kết nối: Dialog "HLV sẽ mất quyền xem dữ liệu của bạn ngay lập tức. Lịch sử ghi chú vẫn được giữ." → `revokeConnection`. Empty state khi chưa có HLV: "Chưa kết nối HLV" + "Nhập mã mời".
- [ ] **Step 2 connect/accept:** TextField mã (in hoa, 6 ký tự) hoặc OtpField 6 ô chữ-số nếu DS hỗ trợ ký tự; "Kiểm tra" → `validateInvite`: ok → Card xem trước HLV + "Chấp nhận kết nối" → `acceptInvite` → Toast → về tab HLV; lỗi → InlineMessage theo loại: not_found "Mã không tồn tại", expired "Mã đã hết hạn — xin HLV mã mới", used "Mã đã được sử dụng", revoked "Mã đã bị thu hồi".
- [ ] **Step 3 connect/invite (coach):** nút "Tạo mã mời" → mã 6 ký tự in hoa (A–Z bỏ O/I + 2–9; dùng `Math.random`, ponytail) hạn 7 ngày từ NOW → `createInvite`; Card mã lớn + link `https://gramgolf.app/i/<code>`, nút "Chia sẻ" mở `ShareSheet`, "Sao chép". Danh sách "Lời mời đang chờ" (`pendingInvites`) mỗi mục hạn còn lại + "Thu hồi" (Dialog) → `revokeInvite`.
- [ ] **Step 4 coaches/[id]:** hồ sơ công khai HLV: avatar, tên, badge xác minh, học viện, rating, kinh nghiệm, đơn giá, followers, nút Theo dõi/Đang theo dõi (`toggleFollow`), danh sách bài đăng (dùng `PostItem` nếu đã có — chưa có thì ListItem tiêu đề; Task 12 thay). Nếu người xem là học viên đã kết nối: Tag "HLV của bạn".
- [ ] **Step 5:** Kiểm luồng: c-tuan tạo mã → dev đổi sang p-huy → nhập mã → c-tuan thấy thông báo. Chụp. Gates. Commit `feat(coaching): kết nối HLV qua mã mời, HLV chính/phụ, huỷ kết nối`.

---

### Task 11: Ứng dụng HLV — học viên, chi tiết học viên, hồ sơ

**Files:** Modify `apps/golf/app/(coach)/{roster,me}.tsx`; Create `apps/golf/app/students/[id].tsx`, `apps/golf/components/NoAccess.tsx`.

**Interfaces:** Produces `NoAccess({ reason?: string })` — EmptyState icon khoá, title "Không có quyền xem", caption mặc định "Chỉ HLV đã kết nối mới xem được dữ liệu này." (thay mọi chỗ EmptyState tạm ở Task 6/8/9). Consumes `roster`, `needsFeedback`, `pendingInvites`, `canViewPrivate`, các selector dữ liệu player, `TrendChart`, `StatTile`, `ClubGrid`.

- [ ] **Step 1 roster:** `TabHeader`; hero HLV (avatar, tên, học viện, rating ★, số học viên, followers/following); SearchField (lọc tên không dấu — tái dùng cách `fold` ở selectors: export `fold` từ selectors); Segmented "Tất cả / Cần phản hồi (n) / Lời mời (n)"; ListItem học viên (avatar, tên, hcp, "Swing mới 2 giờ trước", Badge "Cần phản hồi") → `/students/[id]`; tab Lời mời liệt kê pending + nút "Mời học viên" → `/connect/invite`. Empty state "Chưa có học viên" + "Mời học viên".
- [ ] **Step 2 students/[id]:** guard `canViewPrivate(me.id, id)` → `NoAccess`. Header avatar + tên + hcp; `TabBar` (ScrollView ngang) Tổng quan · Thông số · Swing · Bộ gậy · Thể lực: Tổng quan = 4 StatTile + TrendChart; Thông số = danh sách phiên swing (ListItem → `/metrics/[id]`); Swing = danh sách swing (→ `/swings/[id]` nơi HLV ghi chú); Bộ gậy = `ClubGrid` chỉ đọc; Thể lực = phiên thể lực mới nhất + lịch sử.
- [ ] **Step 3 me (coach):** hồ sơ HLV công khai của mình (như `coaches/[id]` nhưng có "Chỉnh sửa hồ sơ" → `/settings/account`, "Cài đặt"), bài đã đăng.
- [ ] **Step 4:** Thay các EmptyState "Không có quyền xem" tạm bằng `NoAccess`. Kiểm: c-ha mở `/students/p-lan` (revoked) → NoAccess. Chụp. Gates. Commit `feat(coach): danh sách học viên, chi tiết học viên 5 tab, chặn truy cập trái quyền`.

---

### Task 12: Cộng đồng — bảng tin, khám phá, đăng bài, chi tiết bài, hồ sơ người dùng

**Files:** Modify `apps/golf/app/(player)/community.tsx`, `apps/golf/app/(coach)/community.tsx` (cả hai chỉ `export { default } from '../community-screen'`? — Expo Router coi mọi file trong `app/` là route; đặt màn dùng chung ở `apps/golf/components/CommunityScreen.tsx` và 2 file tab chỉ re-export); Create `apps/golf/components/{CommunityScreen,PostItem}.tsx`, `apps/golf/app/community/compose.tsx`, `apps/golf/app/posts/[id].tsx`, `apps/golf/app/users/[id].tsx`, `apps/golf/app/people.tsx`.

**Interfaces:** Produces `PostItem({ post: Post; onOpen?(): void })` — dùng `PostCard`/`Identity`/`SocialAction` DS: avatar + tên + Badge "HLV" nếu coach (+ xác minh), thời gian tương đối, tiêu đề, nội dung rút gọn 4 dòng, Tag tags, like (toggle, số), comment (số → mở bài), share (ShareSheet). Consumes `feed`, `discover`, `isFollowing`, `likeCount`, `likedBy`, `commentsOf`, `postsBy`, actions social.

- [ ] **Step 1 CommunityScreen:** `TabHeader title="Cộng đồng"`; `TabBar` Bảng tin / Khám phá. Bảng tin: FlatList `PostItem` từ `feed`; empty "Chưa có bài viết" + "Khám phá người chơi" (chuyển tab). Khám phá: SearchField + danh sách `discover` (Avatar, tên, Badge HLV, "hcp 14" / học viện, nút Theo dõi/Đang theo dõi) → `/users/[id]` (HLV → `/coaches/[id]`). FAB "Đăng bài" → `/community/compose`.
- [ ] **Step 2 community/compose:** Tiêu đề (bắt buộc, ≤120), Nội dung (TextArea, bắt buộc, ≤2000, đếm ký tự), Tag (TextField + Enter/dấu phẩy thêm Chip, tối đa 5, bỏ trùng, chữ thường), "Đính kèm swing" (chọn từ swing của mình — tuỳ chọn); Đăng → `addPost` → về feed + Toast.
- [ ] **Step 3 posts/[id]:** PostItem đầy đủ (không rút gọn) + swing đính kèm (Card → `/swings/[id]` chỉ khi `canViewPrivate`, nếu không ghi "Swing riêng tư"); `CommentThread` + `CommentComposer` (`addComment`); "Ai đã thích" → `LikesSheet`; menu ⋯: tác giả → Xoá (Dialog); người khác → Báo cáo (BottomSheet lý do RadioRow: Spam / Nội dung không phù hợp / Quấy rối / Khác → `report` → Toast "Đã gửi báo cáo").
- [ ] **Step 4 users/[id]:** hồ sơ công khai player: avatar, tên, hcp, CLB, followers/following, nút Theo dõi; bài đăng của họ; **không** hiện thông số/swing/bộ gậy (trừ khi `canViewPrivate` → nút "Xem dữ liệu học viên" → `/students/[id]`). Menu ⋯: Chặn (Dialog "Hai bạn sẽ không thấy bài của nhau và bỏ theo dõi lẫn nhau") → `block` → back; Báo cáo.
- [ ] **Step 5 people:** danh sách followers/following của một user (param `userId`, `tab=followers|following`) — dùng từ profile/users/coaches khi bấm số đếm.
- [ ] **Step 6:** Thay danh sách bài tạm ở `coaches/[id]` và `(coach)/me` bằng `PostItem`. Chụp. Gates. Commit `feat(community): bảng tin, khám phá, đăng bài, bình luận, theo dõi, chặn/báo cáo`.

---

### Task 13: Thông báo & cài đặt chi tiết

**Files:** Create `apps/golf/app/notifications.tsx`, `apps/golf/app/settings/{account,password,privacy,notifications,units}.tsx`; Modify `apps/golf/app/(coach)/inbox.tsx` (re-export màn thông báo qua component dùng chung `components/NotificationsScreen.tsx` như cách Task 12).

**Interfaces:** Consumes `notificationsOf`, `unreadCount`, `relativeTime`, `prefsOf`, actions `markRead/setPrefs/updateProfile`.

- [ ] **Step 1 notifications:** nhóm "Mới" (chưa đọc) / "Trước đó"; mỗi dòng: Avatar actor (hoặc icon hệ thống cho analysis_done), câu theo loại — coach_note "HLV Đỗ Minh Tuấn đã ghi chú swing của bạn", follow "… đã theo dõi bạn", like "… đã thích bài viết của bạn", comment "… đã bình luận", invite_accepted "… đã chấp nhận lời mời", analysis_done "Phân tích swing đã xong" — thời gian tương đối; chấm chưa đọc; chạm → `markRead` id đó + điều hướng (swing / user / post / students). Nút "Đánh dấu đã đọc tất cả". Empty state.
- [ ] **Step 2 settings/account:** sửa tên, SĐT, bio, (player) handicap + CLB, (coach) học viện, kinh nghiệm, đơn giá; validate; Lưu → `updateProfile` + Toast.
- [ ] **Step 3 settings/password:** mật khẩu hiện tại, mới (≥8, có số), nhập lại khớp → Toast "Đã đổi mật khẩu" (mock).
- [ ] **Step 4 settings/privacy:** ToggleRow "Công khai bộ gậy", "Công khai danh sách swing" (caption: "Mặc định chỉ bạn và HLV đã kết nối xem được"); mục "Người đã chặn" (danh sách + Bỏ chặn — thêm action `unblock` vào reducer **có test** nếu làm); "Xoá tài khoản" (Dialog 2 bước, mock → signOut).
- [ ] **Step 5 settings/notifications:** ToggleRow cho 6 loại `NotificationType` (nhãn tiếng Việt) + "Giờ yên lặng (22:00–07:00)".
- [ ] **Step 6 settings/units:** RadioRow Mét / Yard (ví dụ hiển thị "Carry 228 m" ↔ "249 yd").
- [ ] **Step 7:** Rà mọi link trong app: không còn route chết (grep `href=` / `router.push(` so với danh sách file `app/`). Chụp. Gates. Commit `feat(settings): trung tâm thông báo, tài khoản, mật khẩu, quyền riêng tư, thông báo, đơn vị`.

---

### Task 14: Hoàn thiện — trạng thái, a11y, ảnh nghiệm thu, tài liệu

**Files:** Modify các màn còn thiếu trạng thái; Create `docs/screens/**`, `docs/screens/README.md`; Modify `CLAUDE.md` (mục GramGolf), `README.md` (tạo mới ở root).

- [ ] **Step 1 Trạng thái:** rà mọi màn danh sách: có empty state; mọi tác vụ giả lập: có loading + lỗi + thử lại. Thêm skeleton (DS `Skeleton` trong Progress — cheatsheet) cho home/feed khi `useEffect` giả lập tải 400ms lần đầu (ponytail: chỉ 2 màn này).
- [ ] **Step 2 A11y:** grep `IconButton`/`TopNavAction` thiếu `accessibilityLabel`; ảnh trang trí `aria-hidden`; nhãn TextField đủ. Chạy `node scripts/audit-storybook.mjs` không áp dụng (Storybook DS) — thay bằng kiểm tay danh sách trên.
- [ ] **Step 3 Ảnh nghiệm thu:** script `scripts/shot-app.mjs` KHÔNG tạo mới — dùng `scripts/shot-web.mjs` trong vòng lặp shell: với mỗi route ở spec §3 (thêm `?as=p-minh` cho route player, `?as=c-tuan` cho coach — cơ chế có từ Task 3; ghi rõ trong README), chụp light + dark 390×844 vào `docs/screens/<nhóm>/<route>-<scheme>.png`. Đọc lại từng ảnh, sửa lỗi hiển thị (chữ tràn, màu sai trên dark, phần tử chồng nhau).
- [ ] **Step 4 Tài liệu:** `README.md` root: GramGolf là gì, cấu trúc repo, chạy (`pnpm install`, `pnpm -F golf start` → Expo Go; web), tài khoản mẫu, lệnh kiểm (`typecheck/test/check:literals`), link spec/plan/screens. `CLAUDE.md`: thêm mục "GramGolf app" (state ở `lib/`, luật ponytail, quyền xem `canViewPrivate`, không push khi repo public). `docs/screens/README.md`: bảng route → ảnh.
- [ ] **Step 5:** Gates xanh. Commit `chore: trạng thái, a11y, ảnh nghiệm thu toàn bộ màn, README`.

---

## Self-review (đã chạy)

- **Phủ spec:** §3 route ↔ Task 3–13 (welcome…settings/dev đều có task); §4 trạng thái ↔ từng task + Task 14; §6 tiêu chí 1 (gates mỗi task), 2 (Task 14 ảnh), 3 (luồng ở Task 4/6/7/8/9/10/11), 4 (test Task 2 + NoAccess Task 11), 5 (check:literals mở rộng Task 3).
- **Placeholder:** màn tab tạm "Đang dựng" ở Task 3 là trạng thái trung gian có chủ đích, được thay ở task chỉ định; không có TBD trong bước.
- **Nhất quán kiểu:** tên action/selector dùng ở Task 3–13 đều định nghĩa ở Task 2 (`acceptInvite`, `revokeConnection`, `setPrimaryCoach`, `toggleFollow`, `toggleLike`, `addComment`, `block`, `report`, `markRead`, `jobUpdate`, `uploadUpdate`, `addNote`, `addSessions`, `upsertClub`, `archiveClub`; `canViewPrivate`, `validateInvite`, `activeCoaches`, `roster`, `needsFeedback`, `feed`, `discover`, `speedTrend`, `carryByClub`…). `unblock` chỉ thêm ở Task 13 kèm test.
- **Review Focus:** 5 mục đều có test ở Task 2 và chỗ dùng ở UI.
