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

**Đọc trước:** `docs/ds/REBRAND.md` (phân tích đã kiểm chứng trên bản sao DS). Bản thử nghiệm sẵn ở `docs/ds/rebrand-prototype/`.

**Files:**
- Create: `packages/ds/tokens/brand/{gramgolf.dtcg.json,gramgolf.semantic.light.dtcg.json,gramgolf.semantic.dark.dtcg.json}` (chép từ `docs/ds/rebrand-prototype/`)
- Modify: `packages/ds/tokens/build.mjs` (theo `docs/ds/rebrand-prototype/build.mjs.proposed`: thêm 2 file brand vào `COLORS(scheme)`, lọc nguồn bằng `existsSync`)
- Modify: `packages/ds/tokens/README.md` (mục "Lớp override brand GramGolf": file nào, vì sao không sửa `figma/`/`compact/`)
- Regenerate: `packages/ds/src/generated/*` (`pnpm -F @gr/ds build:tokens`)
- Modify: `packages/ds/src/audit/contrast.test.ts` (lặp `emphasis: ['neutral','brand']` — theo `contrast.test.ts.proposed`; cặp thấp còn lại vào `KNOWN_DESIGN` KÈM lý do, hoặc sửa token)
- Modify: `packages/ds/src/theme/createTheme.test.ts` (assert brand step 9 = `'#14be96'`)
- Modify: `packages/ds/src/theme/createTheme.ts` (bỏ `DARK_FIXUP` cho `'Color/Content/On-Accent/Default'` + comment liên quan; `packages/ds/src/ui/DockIcon/dockIconStyles.ts:26` comment)
- Modify: `packages/ds/src/ui/BottomNavigation/bottomNavigationStyles.ts` (nhãn mục chọn `Accent-Solid` dùng `Color/Content/On-Accent/Default` thay `Content/Inverse/Strongest`)
- Modify: `apps/golf/app/_layout.tsx` (`<ThemeProvider scheme="auto" emphasis="brand">`), `packages/ds/.storybook/preview.tsx` (emphasis brand mặc định; nếu dễ, thêm toolbar Neutral/Brand)
- Create: `apps/golf/components/Logo.tsx`
- Modify: `apps/golf/app.json`, `apps/golf/app/(dev)/ds/index.tsx` (mục Brand hiển thị Logo)
- Modify: `docs/ds/figma-debt.md` (dòng mới: "Brand GramGolf teal là override code-side `tokens/brand/` — Figma vẫn GR xanh cũ")

**Interfaces:**
- Produces: thang `GR`/`GR-Alpha` (light+dark) = teal, step 9 `#14be96`; `On-Brand` = navy `#0b2230` (light Pressed = trắng trên step 11 `#03755b`); `Color/Content/Accent/Light` → Brand 11. Tên token KHÔNG đổi. App chạy `emphasis="brand"` → Button Primary teal chữ navy.
- Quyết định: **không** tint Neutral sang navy ở đợt này (REBRAND §4 — chi phí cao, nửa vời); navy xuất hiện qua On-Brand, splash, chữ logo.
- Produces: `export function Logo(props: { size?: number; variant?: 'mark' | 'full'; tone?: 'brand' | 'onBrand' }): JSX.Element` — `mark` = biểu tượng; `full` = biểu tượng + chữ "GramGolf" (`<Text variant>` DS, màu `Color/Content/Neutral/Strongest`, không vẽ chữ bằng SVG). `tone='brand'`: stroke `Color/Background/Accent/Solid/Default` (teal); `tone='onBrand'`: stroke `Color/Content/On-Accent/Default`. `size` mặc định `t.primitive('gr-dm-48')`.

- [ ] **Step 1:** Chép 3 file brand vào `packages/ds/tokens/brand/`; sửa `build.mjs` như bản proposed (đọc diff kỹ — chỉ 3 dòng đổi). `pnpm -F @gr/ds build:tokens`. Kiểm `git diff --stat packages/ds/src/generated` chỉ đổi giá trị màu, `keys.ts` không đổi.
- [ ] **Step 2:** Áp `contrast.test.ts.proposed` (vòng `emphasis`). Chạy `pnpm -F @gr/ds test` → ghi lại các cặp fail. Sửa theo REBRAND §2: BottomNav label → On-Accent; bỏ DARK_FIXUP On-Accent; cập nhật `createTheme.test.ts`. Cặp còn lại (PageIndicator/Progress/Toggle — thành phần hình khối, không phải chữ) → thêm vào `KNOWN_DESIGN` với comment lý do + mã nợ `F-brand-*` trong `figma-debt.md`. KHÔNG hạ ngưỡng WCAG chữ.
- [ ] **Step 3:** `_layout.tsx` + storybook preview: `emphasis="brand"`.
- [ ] **Step 4:** Viết `Logo.tsx` bằng `react-native-svg` (`Svg`, `Path`, `fill="none"`, `strokeLinejoin="miter"`, stroke đều): 3 chevron xếp chồng hướng lên; chevron dưới uốn thành chữ G (nét ngang vào trong ở bên phải dưới). viewBox `0 0 64 72`, path khởi điểm:
  ```
  M8 30 L32 6 L56 30
  M8 44 L32 20 L56 44
  M44 46 L32 34 L8 58 L18 68 L46 68 L56 58 L56 52 L38 52
  ```
  `strokeWidth` = `size/10` làm tròn. Chỉnh tay cho cân, so với ảnh logo (chevron dày đều, khoảng trống giữa các tầng bằng nhau). Ghi đầu file: `// Dựng lại từ ảnh logo 07/10/2026 — thay bằng SVG gốc khi có (NỢ BRAND).`
- [ ] **Step 5:** `app.json`: `"name": "GramGolf"`, `"slug": "gramgolf"`, `"scheme": "gramgolf"`, `"splash": { "backgroundColor": "#0B2230" }`, `web.name` nếu có. Gallery index: thêm mục "Brand · Logo" hiển thị `Logo` 3 kiểu (mark, full, onBrand trên nền teal).
- [ ] **Step 6:** Kiểm trực quan: chụp `/(dev)/ds/button`, `/(dev)/ds/toggle`, `/(dev)/ds/bottomnav`, `/(dev)/ds` (logo) light + dark → Primary teal chữ navy đọc rõ, không còn xanh lá cũ. Lưu `docs/screens/task1/`.
- [ ] **Step 7:** `pnpm typecheck && pnpm test && pnpm check:literals` → xanh. Commit `feat(brand): rebrand DS sang GramGolf teal/navy (lớp override), emphasis brand, Logo`.

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

---

# GramGolf Phase 2 — MVP theo luồng chức năng (Task 15–30)


Nối tiếp `docs/superpowers/plans/2026-10-07-gramgolf-ui.md` (Task 1–14, đã commit hết — HEAD ebb90f4). Mọi neo (`file:dòng`, tên hàm, chữ
trên màn, chữ trong `steps.json`) đã soát lại với code ở HEAD ebb90f4 (bản làm mới 08/10). Quyết định chủ dự án
08/10/2026 (`progress.md`): spec + plan 07/10 **thắng mọi mâu thuẫn** với MVP issue #1 ("Vì đang cần mobile first"); Phase 2 chỉ làm hạng mục
MVP **bổ sung**, tổ chức **theo luồng chức năng F1–F13** để chủ dự án kiểm từng luồng. Bản này thay đề xuất W1–W3 (web/desktop) trong
`mvp-web-arch.md` — không làm.

Chủ dự án 08/10/2026 ("Mở dạng storybook được không", "Có đẩy UI app sang Storybook được luôn không"): màn thật của app nằm trong một
**Storybook thứ hai** (`storybook-app/`, cổng 6007), xếp theo cùng 13 luồng. Task 15 đưa `storybook-app/` (đang dựng cách ly, loại khỏi git) vào
repo và vào gate; mọi task luồng cập nhật story của luồng mình, và **ảnh storyboard sinh từ story**. Lượt đi CDP với `?as=` + đổi tài khoản vẫn giữ:
chỉ nó chứng minh bàn giao giữa màn và giữa hai vai trò chạy thật.

## Review Focus (Phase 2)

Năm đầu vào / điều kiện dễ làm hỏng app nhất mà luồng mới đưa vào; mỗi dòng có test ghim nó ở task sở hữu code:

1. **Cùng một cặp HLV–học viên đi qua hai kênh** (HLV gửi lời mời trong app *và* học viên nhập mã của chính HLV đó; hoặc hai bên cùng gửi
   cho nhau) → phải còn **đúng 1** kết nối active, lời mời/yêu cầu đang chờ của cặp đó tự đóng; HLV chính/phụ xét **lúc kích hoạt** (D5), không
   phải lúc gửi. Test (Task 16, `lib/reducer.test.ts`): "không tạo kết nối mở thứ 2 cho cùng cặp…", "nhập mã của HLV đang có lời mời/yêu cầu
   chờ → chỉ 1 kết nối active…", "có HLV chính SAU lúc gửi yêu cầu → chấp nhận thành HLV phụ…". Kiểm trên UI: Task 17 bước `23-hai-hlv`.
2. **Quyền ghi khi đã mất quyền xem** — HLV đã bị huỷ kết nối, hoặc HLV khác (kể cả HLV phụ đang active), sửa/xoá ghi chú không phải của mình →
   state không đổi, UI không hiện nút. Test (Task 16): "không phải tác giả, nội dung rỗng, hoặc HLV đã bị huỷ kết nối → không đổi". Kiểm trên UI:
   Task 18 bước `13-ha-xem-ghi-chu` (HLV Hà thấy ghi chú của HLV Tuấn, không có Sửa/Xoá).
3. **Thông báo "học viên đăng swing mới" lặp hoặc gửi nhầm người** — nhịp tải giữa chừng, gửi lại trạng thái `done`, lỗi mạng rồi thử lại,
   HLV đã huỷ / mới đang chờ kết nối. Phải: báo **một lần** mỗi swing, đúng các HLV **active** (chính + phụ). Test (Task 16): hai test trong
   `describe('thông báo HLV khi học viên tải swing mới lên xong')`.
4. **Sửa phiên ở đơn vị yard + số kiểu VN** — mở form sửa rồi lưu nguyên không được làm trôi số (carry lệch < 0,05 m); nhập sai báo lỗi theo
   trường và phiên giữ nguyên; đổi chủ / đổi loại phiên bị chặn. Test (Task 16): `lib/validation.test.ts` › "sửa phiên: giá trị form từ phiên
   đã lưu", `lib/reducer.test.ts` › "sửa phiên số liệu". Kiểm trên UI: Task 20 bước `08-sua-loi`, `09-sau-sua`.
5. **Xoá gậy còn gắn phiên/swing** — phải bị từ chối (chỉ lưu trữ được, giữ lịch sử); gậy lưu trữ khôi phục được và phiên/swing cũ vẫn đọc
   được gậy. Test (Task 16): "xoá gậy chưa gắn phiên/swing nào; gậy đã gắn → không xoá", "lưu trữ rồi khôi phục…". Kiểm trên UI: Task 21 bước
   `14-driver-khong-xoa`.

Thêm cho hạ tầng story (Task 15): **trạng thái tạm thời trong ảnh** — skeleton / spinner / toast tắt theo giờ, nên story chụp được nhờ `appStory({ hold })`
kéo dài `DELAYS` (`lib/simulate.ts`). `appStory` đặt lại **toàn bộ** `DELAYS` về mặc định ở mỗi story, nên `hold` của story trước không rò sang story
sau. Kiểm: Task 15 Step 11 (ảnh `f13--…` có skeleton / toast; ảnh story khác không có).

## Luồng (Flows) → task → mục MVP

Mã mục MVP `Mx.y` = nhóm x, checkbox thứ y trong `mvp-issue-1.md` (bảng đầy đủ ở mục kế tiếp).

| Luồng | Task | Nội dung kiểm | Mục MVP phủ |
|---|---|---|---|
| Storybook app (hạ tầng) | 15 | `storybook-app/` vào repo + gate (typecheck, check:literals); story màn thật theo 13 luồng; chụp ảnh tất định 390×844 | — (R9) |
| F4 Kết nối HLV–học viên | 17 | mã mời (tạo/chia sẻ/thu hồi, 5 lỗi), lời mời 2 chiều (HLV mời → học viên Chấp nhận/Từ chối; học viên gửi yêu cầu → HLV Duyệt/Từ chối), HLV chính/phụ, huỷ kết nối 2 phía → 403 | M3.7, M3.8, M4.2, M5.6, M6.6 (phần không mâu thuẫn), M6.7 (403) |
| F8 HLV review swing | 18 | thông báo swing mới → Cần phản hồi → Chưa review → workspace (tua mốc, chèn mốc, viết/sửa/xoá ghi chú) → học viên đọc, tua → Đã review | M3.4, M4.4, M4.5, M4.7, M5.4, M5.5 (xoá Note) |
| F7 Swing của người chơi | 19 | hướng dẫn → chọn video + gậy + góc + ngày → popup file lỗi → tải (tạm dừng, lỗi mạng, thử lại) → phân tích (đang chạy / xong / cần xem lại) → lưới/danh sách, lọc/sắp xếp theo ngày → xoá | M3.2, M3.3, M5.1 (phần không mâu thuẫn), M5.5 (xoá video), M6.5 |
| F5 Số liệu | 20 | nhập tay (lỗi theo trường) / CSV / ảnh OCR / QR → danh sách → chi tiết → sửa → xoá → Tổng quan; m ↔ yd | M3.1, M3.6, M5.2, M5.5 (xoá metrics), M6.4 |
| F6 Bộ gậy | 21 | thêm (16 loại + tuỳ chỉnh) → sửa → lưu trữ / khôi phục (Đang dùng / Lưu trữ) → xoá; gậy mới có trong chọn gậy, chọn sẵn khi quay lại form | M3.5, M5.3, M5.5 (xoá gậy) |
| F9 HLV xem học viên | 22 | roster (tìm, lọc) → chi tiết 5 tab chỉ đọc → 403 / 404 | M4.1, M4.3, M6.7 |
| F1 Người chơi mới | 23 | chào → đăng ký → OTP → onboarding → Tổng quan trống → số liệu đầu tiên (thêm gậy giữa chừng) → Tổng quan có dữ liệu | M1.1, M2.2, M2.5 (tên), M3.1, M6.1 |
| F2 HLV mới | 24 | đăng ký HLV → OTP → onboarding + giới thiệu nghề nghiệp → Học viên trống → mã mời đầu tiên | M2.2, M2.5 (bio HLV), M4.6 |
| F3 Tài khoản | 25 | đăng nhập sai/đúng → quên mật khẩu → link → đặt lại → đăng nhập lại; đổi mật khẩu; đăng xuất | M2.1, M2.3, M2.4, M3.9 (đăng xuất) |
| F10 Cộng đồng | 26 | bảng tin → bình luận → ai đã thích → đăng bài (tag, đính kèm swing) → khám phá + theo dõi → hồ sơ → chặn / báo cáo | ngoài MVP (giữ theo R4) |
| F11 Thông báo | 27 | mỗi loại thông báo → đúng màn → đã đọc; đánh dấu tất cả; số trên chuông | M3.10, M4.7 |
| F12 Hồ sơ & cài đặt | 28 | hồ sơ, tài khoản (ảnh, tên, bio, handicap/học viện), mật khẩu, quyền riêng tư + bỏ chặn, thông báo, đơn vị, xoá tài khoản | M1.3, M3.9, M4.6 |
| F13 Trạng thái xuyên suốt | 29 | empty state, skeleton, spinner khi lưu, toast thành công/thất bại, 404, 403 | M6.1, M6.2, M6.3, M6.7 |
| Tổng kết | 30 | `docs/flows/README.md`, Dev › "Kiểm tra theo luồng", `docs/product/mvp-checklist.md`, chạy lại cả 13 luồng | mọi mục |

## Phủ MVP issue #1: 38 mục → trạng thái → task

Trạng thái: **xong** (Task 1–14 đã commit, HEAD ebb90f4) · **bổ sung** (Phase 2 làm) · **mâu thuẫn** (không làm — bảng sau).
Phần lib của hạng mục bổ sung nằm ở Task 16; task luồng ở cột cuối là task **sở hữu** hạng mục (dựng UI + đi luồng chứng minh).

| Mã | Mục MVP (rút gọn) | Trạng thái | Task sở hữu |
|---|---|---|---|
| M1.1 | Khung Mobile — Bottom Navigation | xong (Task 3) | kiểm ở 23, 24 |
| M1.2 | Khung Web/Desktop — Sidebar | **mâu thuẫn (a)** | — |
| M1.3 | Header: Back, Tiêu đề, Avatar nhỏ, Icon thông báo | xong (Task 3; Task 13 ảnh avatar; Task 14 vùng chạm avatar ≥ 44 px — `hitSlop` ở `TabHeader.tsx`) | kiểm ở 28 |
| M2.1 | Đăng nhập Email/Password | xong (Task 4) | kiểm ở 25 |
| M2.2 | Đăng ký + chọn vai trò | xong (Task 4) | kiểm ở 23, 24 |
| M2.3 | Quên mật khẩu (nhập email nhận link) | xong (Task 4) + bổ sung: chữ "link", nút mở link mô phỏng | 25 |
| M2.4 | Đặt lại mật khẩu (từ link) | **bổ sung** | 16 → 25 |
| M2.5 | Onboarding: Avatar bắt buộc, Tên, Bio HLV | Tên: xong (Task 4, bắt buộc ở đăng ký) · Avatar bắt buộc: **mâu thuẫn (c)** · Bio HLV: **bổ sung** | 16 → 24 |
| M3.1 | Dashboard: thẻ chỉ số buổi gần nhất, xu hướng 5 buổi (Recharts) | xong (Task 5) · Recharts: **mâu thuẫn (e)** · "buổi" = phiên: 1 dòng CSV = 1 phiên (plan Task 7), nên 5 buổi gần nhất có thể là nhiều cú cùng ngày — giới hạn theo plan | kiểm ở 20, 23 |
| M3.2 | My Swings: Lưới/Danh sách, lọc/sắp xếp theo ngày | **bổ sung** | 16 → 19 |
| M3.3 | Chi tiết Swing: player tuỳ chỉnh, thông số gậy/ngày | xong (Task 9) + bổ sung: mục "Gậy" có thông số + link | 19 |
| M3.4 | Đọc phản hồi: Coach Note, chạm mốc để tua | xong (Task 9) + bổ sung: chip "Tua tới …" cho mốc chèn trong ghi chú | 18 |
| M3.5 | My Clubs: Active / Archived | **bổ sung** (danh sách lưu trữ + khôi phục) | 16 → 21 |
| M3.6 | Lịch sử luyện tập (các buổi đã nhập) | xong (Task 6, tab Thông số; mỗi dòng là 1 phiên — plan Task 7) | kiểm ở 20 |
| M3.7 | Quản lý kết nối HLV: HLV hiện tại, Huỷ kết nối | xong (Task 10) | kiểm ở 17 |
| M3.8 | Duyệt lời mời: Chấp nhận/Từ chối yêu cầu từ HLV | **bổ sung** | 16 → 17 |
| M3.9 | Hồ sơ & Cài đặt: Profile, gạt đơn vị Mét/Imperial, Đăng xuất | xong (Task 3; Task 13: đơn vị bằng `RadioRow` Mét / Yard ở `settings/units.tsx`, coi là xong "gạt đơn vị") · hệ Imperial đầy đủ: **mâu thuẫn (h)** | kiểm ở 25, 28 |
| M3.10 | Trung tâm thông báo (chạm → đúng Swing) | xong (Task 13: `components/NotificationsScreen.tsx` — chạm → `markRead` + mở swing / hồ sơ / bài / học viên) | kiểm ở 27 |
| M4.1 | Roster: học viên active | xong (Task 11, 7cd1a10) | kiểm ở 22 |
| M4.2 | Lời mời đang chờ: Duyệt/Từ chối học viên, Tạo/Copy mã | Tạo/Copy mã: xong (Task 10, 11) · Duyệt/Từ chối: **bổ sung** | 16 → 17 |
| M4.3 | Tổng quan học viên (chỉ đọc) | xong (Task 11) | kiểm ở 22 |
| M4.4 | Video học viên: "Đã review" / "Chưa review" | **bổ sung** | 16 → 18 |
| M4.5 | Review Workspace: player, form note, nút chèn Timestamp | xong (Task 9) + nút chèn mốc: **bổ sung** | 16 → 18 |
| M4.6 | Hồ sơ HLV: cập nhật profile, Bio | xong (Task 11 `me`, Task 13 `settings/account`) · **bổ sung**: bio HLV bắt buộc 20–300 ký tự ở onboarding + Tài khoản (16 → 24), đổi ảnh đại diện ở Tài khoản (28) | bio → 24 · ảnh đại diện → 28 |
| M4.7 | Thông báo HLV: học viên nhận lời, học viên vừa upload swing | nhận lời: xong (Task 10, 13) · swing mới: **bổ sung** | 16 → 18 |
| M5.1 | Upload video: chọn file → progress → form Gậy & Ngày | xong (Task 9) · ô Ngày: **bổ sung** · thứ tự bước: **mâu thuẫn (d)** | 19 |
| M5.2 | Form thêm/sửa Metrics (Distance, Club/Ball Speed, Direction…) | thêm: xong (Task 6) · sửa: **bổ sung** · Direction: **không làm (không gọn)** | 16 → 20 |
| M5.3 | Form thêm/sửa Gậy (Tên, Loại) | xong (Task 8) | kiểm ở 21 |
| M5.4 | Form sửa Coach Note | **bổ sung** | 16 → 18 |
| M5.5 | Popup xác nhận xoá: video, gậy, metrics, Note | video, metrics: xong (Task 9, 6) · gậy, Note: **bổ sung** | xoá gậy → 21 · xoá Note → 18 |
| M5.6 | Popup hành động nhạy cảm: huỷ kết nối học viên/HLV | phía người chơi: xong (Task 10) · phía HLV: **bổ sung** | 17 |
| M6.1 | Empty states (Video, Gậy, Học viên, Metrics) | xong (Task 6/8/9/11; Task 14 rà) | kiểm ở 29 |
| M6.2 | Loading: Skeleton khi tải trang, Spinner khi gửi form | Skeleton Tổng quan + Bảng tin: xong (Task 14, viết inline ở `(player)/home.tsx`, `components/CommunityScreen.tsx`) · màn còn lại + spinner: **bổ sung** | 16 → 29 |
| M6.3 | Toasts: "Lưu thành công", "Xóa thất bại" | thành công: xong (Task 6–10) · thất bại + Thử lại: **bổ sung** · "góc màn hình" trên desktop: **mâu thuẫn (a)** | 16 → 29 |
| M6.4 | Lỗi form validation | xong (Task 4, 6–10) | kiểm ở 20, 23, 25 |
| M6.5 | Popup lỗi Media/Upload (quá dung lượng, không phải video) | **bổ sung** | 16 → 19 |
| M6.6 | Popup lỗi mã mời (sai, hết hạn, xung đột HLV active khác) | sai/hết hạn/đã dùng/đã thu hồi: xong (Task 10, báo inline) · dạng popup: **mâu thuẫn (f)** · xung đột: **mâu thuẫn (b)** | kiểm ở 17 |
| M6.7 | Trang lỗi 404, 403 | 403: xong (Task 11) + nút Quay lại: **bổ sung** · 404: **bổ sung** | 29 |

Kiểm đếm: 38 mục; mỗi hạng mục **bổ sung** có đúng một task luồng sở hữu.

## Không làm — mâu thuẫn plan 07/10

| # | Mục MVP | Mâu thuẫn với | Một dòng lý do |
|---|---|---|---|
| (a) | M1.2 Sidebar Web/Desktop; tiêu đề nhóm 5 "Modals trên Web"; M6.3 toast "góc màn hình" trên desktop | Spec D2 | App mobile-first trên Expo Go; web chỉ để chụp/kiểm tra, mọi màn thiết kế ở 390×844. |
| (b) | M6.6 "xung đột do Player đã có HLV active khác" | Spec D5, plan Task 10 | Nhiều HLV active + 1 HLV chính: HLV mới thành HLV phụ khi đã có HLV chính; giữ nguyên `isPrimary`, `setPrimaryCoach`, mục "HLV khác". |
| (c) | M2.5 "Bắt buộc cập nhật Avatar" | Plan Task 4 Step 5 | Ảnh đại diện tuỳ chọn (cho dùng chữ tắt); Tên đã bắt buộc ở bước đăng ký. |
| (d) | M5.1 thứ tự "Chọn file → Progress → Form chọn Gậy & Ngày" | Plan Task 9 Step 2 | Chọn video + gậy + góc quay (+ ngày, Task 19) trước, rồi mới tải lên. |
| (e) | M3.1 "Recharts" | Spec D11 | Biểu đồ tự vẽ bằng `react-native-svg`; Recharts không chạy trên React Native. |
| (f) | M6.6 lỗi mã mời dạng **popup** | Plan Task 10 Step 2 | Lỗi hiện inline (`AlertMessage`, role alert) dưới ô mã. |
| (g) | — | — | Bỏ khỏi bảng: M3.9 "gạt đơn vị" coi là **xong** bằng `RadioRow` Mét / Yard (plan Task 13 Step 6), không phải mâu thuẫn. |
| (h) | M3.9 hệ "Mét/Imperial" đầy đủ (cả tốc độ km/h) | Spec D9 | Lưu chuẩn mph, rpm, độ, mét, kg; người dùng chỉ chọn hiển thị khoảng cách mét/yard. |
| (i) | Tiêu đề nhóm 5 "Bottom Sheets trên Mobile" cho form nhập liệu | Plan Task 6/8/9 (cấu trúc file) | Form nhập liệu là màn stack toàn màn hình; chỉ `metrics/add` là sheet. |

(a)–(f) là ruling R1. (h) và (i) là ruling chủ dự án 08/10 (`progress.md`): **không làm** — (h) spec D9 lưu chuẩn mph/mét, chỉ khoảng cách đổi
m ↔ yd; (i) form nhập liệu giữ màn stack toàn màn hình như plan Task 6/8/9.

**Không làm — không gọn (điều kiện R2):** "Direction / Hướng–Lệch" trong M5.2. `SwingMetrics` là bản ghi 6 trường bắt buộc, dùng làm
`Record<keyof SwingMetrics, …>` trong bảng cột CSV của cả TrackMan lẫn Foresight, OCR giả lập, ô nhập, bản xem trước CSV và màn chi tiết. Thêm
một trường **có dấu** (trái/phải), **tuỳ chọn**, đổi m ↔ yd như carry, thì phải sửa khoảng 8 file và cả seed. Ngoài ra file CSV mẫu không có
cột lệch hướng, mà Tổng quan cũng không dùng số này.

---

**Goal:** Đóng mọi hạng mục MVP bổ sung và nối đủ màn để 13 luồng chức năng F1–F13 chạy liền mạch trên điện thoại (390×844). Không màn tạm, không
ngõ cụt, không mất dữ liệu giữa màn hay giữa hai vai trò. Mỗi luồng có storyboard ảnh và tài liệu để chủ dự án tự kiểm.

**Architecture:**
- Storybook app (task 15): `storybook-app/` = Storybook thứ hai (cổng 6007) vẽ **màn thật** `apps/golf/app/**` theo luồng
  (`flows/Fxx-*.stories.tsx`, title `Luồng/Fxx · …`, meta `id: 'fxx'`); `appStory({ as, params, setup, tabs, hold })` dựng store mẫu đã đăng nhập.
  Không phải package workspace (không `pnpm install`, không đổi lockfile): typecheck bằng `tsc -p storybook-app`, gate gốc gọi kèm.
- Logic mới (kết nối 2 chiều, thông báo swing mới, sửa/xoá ghi chú, sửa phiên, khôi phục/xoá gậy, kiểm file video, token đặt lại mật khẩu,
  cờ giả lập lỗi) là hàm thuần trong `apps/golf/lib/*`, viết theo TDD ở **một** task (16).
- Mỗi task luồng (17–29):
  - viết kịch bản `docs/flows/<Fxx>/steps.json` **trước**, làm "test đỏ";
  - dựng hoặc sửa màn;
  - cập nhật story của luồng: mỗi bước `shot` = 1 story, cộng story cho mọi màn/trạng thái mới và trạng thái khó tới;
  - storyboard `docs/flows/<Fxx>/*.png` sinh **từ story** bằng `scripts/shot-storybook.mjs` (390×844, sáng + tối);
  - chạy `scripts/flow-web.mjs`, script bấm như người dùng trên web 390×844 (Chrome headless + CDP; bước chéo vai trò đổi tài khoản qua
    Cài đặt › Dev trong cùng phiên bộ nhớ). Script chứng minh bàn giao giữa màn / vai trò, kiểm mỗi bước `shot` có story + ảnh, rồi ghi bảng
    bước vào `docs/flows/<Fxx>.md`.
- Task 30 chạy lại cả 13 kịch bản + sinh lại storyboard từ story để kiểm hồi quy, rồi viết chỉ mục và checklist MVP.

**Tech Stack:** Expo SDK 57, Expo Router 57 (typedRoutes), React 19, React Native 0.86, react-native-web 0.21, `@gr/ds`, vitest 3, Node 24
(WebSocket + fetch có sẵn, cho script CDP), Chrome headless, Storybook 10.6 `@storybook/react-native-web-vite` (đã cài ở `packages/ds`, hoist ra
`node_modules` gốc vì `.npmrc` `node-linker=hoisted`). Không thêm dependency.

**Spec:** `docs/superpowers/specs/2026-10-07-gramgolf-ui-design.md` (D1–D13 giữ nguyên). Phạm vi MVP: `.superpowers/sdd/2026-10-07-gramgolf-ui/mvp-issue-1.md`.
Ruling: `.superpowers/sdd/2026-10-07-gramgolf-ui/progress.md`. Đối chiếu gap: `mvp-gap-S1..S6.md` cùng thư mục.

## Global Constraints

Chép nguyên văn từ `global.md` (áp cho mọi task Phase 2):

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

Bổ sung cho Phase 2:

- **Mobile-first, 390×844.** Không có layout web/desktop: không breakpoint, không sidebar, không modal giữa màn.
- **Không đổi quyết định 07/10:**
  - giữ `isPrimary`, `setPrimaryCoach`, mục "HLV khác";
  - lỗi mã mời vẫn inline;
  - giữ thứ tự bước đăng swing của Task 9;
  - avatar vẫn tuỳ chọn;
  - giữ biểu đồ SVG.
- **Storyboard thay cho `docs/screens/<task>/`, sinh từ story (R9):**
  - ảnh là `docs/flows/<Fxx>/<story-id>.light.png` + `.dark.png` (tên do `shot-storybook.mjs` đặt), **mọi** story của luồng, cả sáng lẫn tối,
    khung cố định 390×844;
  - story của bước `shot` `"<nn>-<slug>"` có id `fxx--b-<nn>-<slug>` (quy tắc export ở "Cách chạy một task luồng"), nên ảnh của bước đó là
    `docs/flows/<Fxx>/fxx--b-<nn>-<slug>.light.png`;
  - lệnh chụp (Storybook app 6007 đang chạy):
    `SB_URL=http://localhost:6007 CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/shot-storybook.mjs docs/flows/<Fxx> '^fxx--' 390 844`.
    `CHROME` luôn phải đặt: mặc định trong script là đường Windows.
  - bước `shot` của `flow-web.mjs` chỉ là **điểm kiểm**: ảnh CDP ghi vào `$TMPDIR/flow-<Fxx>/` để tự soát, không vào `docs/`.
- **Server nền và cách tắt** (chủ dự án đang chạy Storybook DS 6006 và Expo 8090 — không được giết):
  - Metro web của agent: `pnpm -F golf exec expo start --web --port 8081`, tắt bằng `pkill -f "expo start"`. Lệnh này an toàn: preview 8090 của chủ
    dự án khởi bằng `node …/expo/bin/cli start`, không khớp mẫu — giữ bất biến này, không khởi Expo kiểu khác.
  - Storybook app: `pnpm storybook:app --no-open` (cổng 6007), tắt bằng `lsof -ti tcp:6007 | xargs kill`. **Không** dùng `pkill -f storybook`.
- **Thêm route mới** (Task 25 `reset-password`, Task 29 `+not-found`): khởi động Metro trước khi chạy `pnpm typecheck`. Metro sinh lại
  `apps/golf/.expo/types/router.d.ts`; thiếu bước này thì typedRoutes báo route chưa có.
- **File phản hồi chung:** `SavedToast` và `AlertMessage` nằm ở `apps/golf/components/Feedback.tsx` (Task 13, f054af6); `SessionDateField`,
  `backToMetrics` ở `components/SessionEntry.tsx`; `KeyboardAvoid` (bọc ScrollView + footer cố định) ở `components/KeyboardAvoid.tsx` (Task 14).
- **Đọc file thật trước khi sửa.** Neo trong plan (số dòng, đoạn code cũ) đã soát với HEAD ebb90f4; task trước trong Phase 2 có thể đã đổi đoạn neo — giữ thay đổi đó, chèn
  phần mới cạnh nó. Chữ hoặc cấu trúc khác plan thì làm theo màn thật, không đổi ý của bước, ghi chỗ lệch vào báo cáo task.
- **Giây hiển thị kiểu `1,3 s`** (`formatSec`, có khoảng trắng — Task 14): mọi chữ trong `steps.json` / story có mốc thời gian viết `1,3 s`.
- **Ngõ cụt tìm thấy khi đi luồng:**
  - Sửa tối thiểu ngay trong task, ghi vào mục "Đã sửa trong lượt đi" của `<Fxx>.md`.
  - Nếu cần màn mới hoặc mâu thuẫn plan 07/10 thì không sửa: ghi vào "Đã biết / chưa làm" và báo controller.

## Cách chạy một task luồng (áp cho Task 17–29)

1. Đọc mọi file sẽ sửa (bản hiện tại — đã gồm thay đổi của các task Phase 2 trước), cùng `storybook-app/flows/Fxx-*.stories.tsx` của luồng, `storybook-app/README.md` và các dòng của
   task trong `storybook-app/issues/*.md`.
2. Viết `docs/flows/<Fxx>/steps.json` đúng như trong task. Tạo `docs/flows/<Fxx>.md` từ khung của task, có sẵn 2 dấu
   `<!-- steps:start -->` / `<!-- steps:end -->`.
3. Khởi động ở nền Metro web (`pnpm -F golf exec expo start --web --port 8081`) và Storybook app (`pnpm storybook:app --no-open`). Chạy
   `CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/flow-web.mjs docs/flows/<Fxx>/steps.json`.
   - Kết quả mong đợi: **FAIL** ở bước đầu tiên chạm UI mới của task (đây là "test đỏ"). Script kiểm story/ảnh **sau** khi đi hết các bước, nên
     lần chạy này đỏ vì UI chứ không vì thiếu story.
   - Nếu FAIL ở chữ của màn có sẵn thì sửa chữ trong JSON theo màn thật rồi chạy lại.
4. Làm các bước code của task.
5. **Story của luồng** (bước "Story" của task) — sửa `storybook-app/flows/Fxx-<slug>.stories.tsx` (tên file và meta `title: 'Luồng/Fxx · …'`,
   `id: 'fxx'` giữ như Task 15 dựng):
   - **Mỗi bước `shot` `"<nn>-<slug>"` của `steps.json` ↔ đúng 1 story:**
     - export = `B` + `<nn>` + slug viết PascalCase; hai cụm số đứng liền thì nối bằng `_`. Ví dụ: `24-hoc-vien-huy` → `B24HocVienHuy`,
       `02-16-loai` → `B02_16Loai`, `13-404-hoc-vien` → `B13_404HocVien`. Storybook sinh id `fxx--b-<nn>-<slug>` (đã thử với
       `storyNameFromExport` + `toId` của storybook 10.6 cài ở repo);
     - `name: '<nn> · <cột "do" rút gọn>'`;
     - `render`: màn của route ở bước đó (import default từ `../../apps/golf/app/...`);
     - `appStory({ as, params, tabs, setup, hold })`: `as` = tài khoản ở bước đó; `tabs` khi màn thuộc nhóm tab; `setup` = action reducer tương
       ứng mọi thao tác **ghi dữ liệu** ở các bước trước (id cố định, vd `rq-tuan-huy`; thời điểm `NOW` — `import { NOW } from
       '../../apps/golf/lib/mock'`, hiện chỉ F08 import sẵn, F12 import `DEFAULT_PREFS` từ cùng file thì gộp); `play` = thao tác
       trong cùng bước, ngay trước `shot` (mở Dialog/sheet, gõ, bấm). Gõ bằng `typeIn` của `lib/appStory.tsx` (không `userEvent.type` — không tới
       `onChangeText`); Dialog / sheet là Modal nằm ngoài canvas → tìm bằng `screen.find*`. Chữ sinh ngẫu nhiên ở lượt CDP (mã mời `${code}`) dùng
       giá trị cố định.
   - **Story có sẵn từ Task 15:** story trùng màn + trạng thái với một bước → đổi thành story của bước đó (đổi export + `name`). Story còn lại giữ
     làm **biến thể** `'<nn><a|b|…> · <bước> — <trạng thái>'` của bước gần nhất; export tự do nhưng **không** bắt đầu bằng `B` + chữ số.
   - **Màn / trạng thái MỚI** task thêm: mỗi cái 1 story (danh sách ở bước Story của task). **Trạng thái khó tới:** đang tải (`hold: ['firstLoad']`),
     đang lưu (`hold: ['save']` + `play` bấm Lưu), toast (`hold: ['toast']` / `['toastError']`), lỗi validate (`play` bấm Lưu khi trống), rỗng,
     403, 404 — làm thành biến thể nếu màn của task có trạng thái đó.
   - Comment đầu file (danh sách bước, ✓, "Chưa có") cập nhật theo file.
   - `storybook-app/README.md`: bảng "Phủ route" — thay mọi id cũ của luồng (đổi export → đổi id) bằng id mới, thêm id story mới; xoá dòng của
     luồng khỏi mục "Chưa có (Phase 2)". `storybook-app/issues/*.md`: mọi dòng có cột Task = task này đã sửa ở bước code của task (bảng phân loại
     ở Task 15 Step 12) → đổi cột Trạng thái thành `đã sửa (Task NN)`. Id cũ còn được `GROUPS` của story mục lục F13 (`MucLuc`) trỏ tới: Task 29 sửa
     một lần cho cả 13 luồng.
   - `pnpm typecheck` (đã gồm `tsc -p storybook-app`) → xanh.
6. **Storyboard từ story:**
   ```bash
   rm -f docs/flows/<Fxx>/*.png
   SB_URL=http://localhost:6007 CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
     node scripts/shot-storybook.mjs docs/flows/<Fxx> '^fxx--' 390 844
   ```
   Mong đợi: mỗi story 2 dòng `ok … 390x844`, không dòng `ERROR`.
7. Chạy lại `flow-web.mjs` → `PASS <Fxx>: … bước, … bước chụp, … story biến thể`. Script FAIL nếu bước `shot` nào thiếu story `fxx--b-<shot>`
   trong `http://localhost:6007/index.json` hoặc thiếu ảnh sáng/tối của story đó. Số "story biến thể" ghi trong Expected của từng task tính theo bản
   dựng `storybook-app/` ngày 08/10; bản dựng có thêm / bớt story thì số đổi theo — điều phải đúng là: mỗi bước chụp có story, mọi story có 2 ảnh,
   không biến thể nào trùng hẳn một bước.
8. Đọc **từng** ảnh trong `docs/flows/<Fxx>/` (sáng + tối) và ảnh điểm kiểm `$TMPDIR/flow-<Fxx>/`. Sửa chữ tràn, màu sai ở chế độ tối, phần tử
   chồng nhau, ảnh story khác màn thật ở cùng bước; rồi chạy lại 6–7. Có sửa ngõ cụt nào thì thay dòng "Không có." trong mục "Đã sửa trong lượt
   đi" của `<Fxx>.md` bằng danh sách: màn · triệu chứng · cách sửa.
9. `pnpm typecheck && pnpm test && pnpm check:literals` → xanh. Tắt server: `pkill -f "expo start"; lsof -ti tcp:6007 | xargs kill`. Commit
   (kèm `storybook-app/flows/Fxx-*.stories.tsx`, `storybook-app/README.md`, `storybook-app/issues/*.md` nếu đổi).

## Cấu trúc file Phase 2 (khoá trước khi chia task)

```
apps/golf/lib/
  domain.ts          + ConnectionStatus 'declined'; CoachConnection.requestedBy/declinedAt; SessionBase.editedAt;
                       CoachNote.editedAt; NotificationType 'connect_request' | 'swing_uploaded'; AppState.simulateFailure   Task 16
  mock.ts            DEFAULT_PREFS 2 loại mới; seed 1 yêu cầu chờ p-huy → c-ha (+ thông báo nt-6); simulateFailure       Task 16
  reducer.ts         requestConnection, respondConnection, editNote, deleteNote, updateSession, unarchiveClub, deleteClub,
                       setSimulateFailure; uploadUpdate báo HLV; acceptInvite đóng lời mời chờ cùng cặp; reset giữ cờ dev     Task 16
  selectors.ts       openConnection, connectionRequests, findPlayers, swingsByReview, filterSwings, archivedClubsOf,
                       clubLinkCount (isBlocked đã export từ Task 12)                                                        Task 16
                     notificationsOf / unreadCount bỏ thông báo của người đã chặn (hai chiều)                                Task 27
  format.ts          markText, insertMark, noteMarks, formatSize                                                            Task 16
  validation.ts      PASSWORD_RULE, validateNewPassword, BIO_MIN + validateBio (BIO_MAX = 300 có sẵn từ Task 13),
                       validateAccount: bio HLV bắt buộc; videoFileError (MAX_VIDEO_MB), swingRaw, fitnessRaw               Task 16
  simulate.ts        DELAYS (độ trễ trạng thái tạm thời, giữ được trong story)                                              Task 15
                     + SAMPLE_VIDEOS sizeMb/mimeType + 2 file lỗi; RESET_TOKENS, resetTokenStatus; SAMPLE_AVATARS,
                       nextSampleAvatar (chuyển từ onboarding)                                                               Task 16
                     + DELAYS.save, DELAYS.toastError                                                                        Task 29
  *.test.ts          test cho mọi mục trên                                                                                  Task 16, 27
apps/golf/components/
  Feedback.tsx       (Task 13 tạo) SavedToast đọc DELAYS.toast (15); + type/action, useSimulatedWrite, SavingRow (29)
  useOnLeave.ts      mới: xoá SAU khi màn rời stack (gom mẫu deleteOnLeave của Task 14)                                    Task 21 (26 dùng)
  ListSkeleton.tsx   mới: useFirstLoad, ListSkeleton; Tổng quan + bảng tin (Task 14 viết inline) chuyển sang useFirstLoad     Task 29
  SwingUpload.tsx    uploadUpdate mang at + notificationId                                                                   Task 16
  ClubPicker.tsx     gậy vừa thêm từ "Thêm gậy mới" được chọn sẵn                                                           Task 21
  SwingCard.tsx      export swingStatus (ô lưới dùng lại)                                                                    Task 19
  NoAccess.tsx       nút "Quay lại"                                                                                          Task 29
  TabHeader.tsx      prop `bell` (tab Thông báo của HLV không có chuông)                                                      Task 27
  NotificationsScreen.tsx (Task 13) + câu/đích 2 loại mới (16), đích theo vai trò (17), câu bình luận + rỗng theo vai trò (27),
                       skeleton (29)
  charts/TrendChart.tsx, charts/ConcentricRings.tsx   dưới 2 buổi → chữ thay biểu đồ; 1 gậy → chỉ chú giải                 Task 20
  PostItem.tsx       PostsSection (gom 3 bản chép), nhãn a11y thân bài, bỏ nhãn "Đã sao chép" kẹt; People.tsx "Handicap"     Task 26
  CommunityScreen.tsx, ../app/(player)/home.tsx   400 ms → DELAYS.firstLoad (15) → useFirstLoad (29)
apps/golf/app/
  (auth)/reset-password.tsx  mới                                                                                             Task 25
  +not-found.tsx             mới                                                                                             Task 29
  (auth)/forgot-password.tsx, (auth)/login.tsx, settings/password.tsx (guard đăng nhập, placeholder bằng chữ)                Task 25
  (auth)/onboarding.tsx      ảnh mẫu từ lib (16); bước giới thiệu nghề nghiệp + câu dẫn ảnh theo vai trò (24)
  connect/invite.tsx, (player)/coach.tsx, coaches/[id].tsx, (coach)/roster.tsx, students/[id].tsx                            Task 17
  swings/[id].tsx (18, 19), students/[id].tsx (18 tab Swing, 22 chữ tab Tổng quan), (player)/swings.tsx (19), swings/new.tsx (19)
  metrics/manual.tsx, metrics/[id].tsx                                                                                       Task 20
  clubs/index.tsx, clubs/[id]/index.tsx, (player)/metrics.tsx; metrics/[id].tsx + swings/[id].tsx dùng useOnLeave             Task 21
  posts/[id].tsx (useOnLeave), community/compose.tsx; coaches/[id].tsx, users/[id].tsx, (coach)/me.tsx dùng PostsSection      Task 26
  settings/account.tsx (24 trợ giúp bio HLV, 28 ảnh + đơn giá có dấu chấm), settings/privacy.tsx (28 Dialog xoá),
  settings/dev.tsx (29 cờ lỗi, 30 Kiểm tra theo luồng), settings/notifications.tsx (16)
  metrics/import-photo.tsx   thời gian "Đang đọc…" = DELAYS.ocr                                                          Task 15
packages/ds/src/ui/          Comment (⋯ / Thêm ảnh / Thêm địa điểm chỉ khi có handler), Avatar (nameInitials) + PostCard /
                             Social / Comment dùng chữ tắt 2 chữ như app                                                     Task 15
docs/ds/figma-debt.md        F56 (viền Toggle tắt / Radio chưa chọn < 3:1 — giữ token Figma, ghi nợ)                           Task 15
scripts/flow-web.mjs        đi luồng bằng CDP, kiểm bàn giao + story/ảnh của từng bước chụp, ghi bảng bước                     Task 17
scripts/shot-storybook.mjs  tham số H (khung cố định W×H), chờ story vẽ + play xong, timeout + khởi động lại Chrome, log lỗi   Task 15
package.json (gốc)          storybook:app; typecheck gồm tsc -p storybook-app; check:literals gồm storybook-app                  Task 15
.gitignore                  storybook-app/__shots__/                                                                          Task 15
storybook-app/               (có sẵn từ 08/10, đang git-exclude — Task 15 commit)
  .storybook/{main.ts,preview.tsx,shot.css}   có sẵn, giữ nguyên                                                              —
  stubs/expo-router.tsx      có sẵn, giữ nguyên                                                                               —
  lib/appStory.tsx           có sẵn + `hold`, `typeIn`                                                                         Task 15
  tsconfig.json              mới: typecheck riêng (không phải package workspace)                                              Task 15
  flows/F01…F13-*.stories.tsx   225 story có sẵn (+2 story `hold` ở Task 15) → task luồng của Fxx (mỗi bước + trạng thái mới)  Task 15, 17–29
  README.md                  chạy, viết story, "Phủ route", "Chưa có (Phase 2)", "Lỗi màn hình đã thấy"                        Task 15, 17–30
  issues/*.md                issues.md, A–E.md, verify.md → cột Task / Trạng thái theo bảng phân loại Task 15                  Task 15, 17–29
docs/flows/<F01..F13>.md + docs/flows/<F01..F13>/{steps.json, <story-id>.<light|dark>.png}                                     Task 17–29
docs/flows/README.md, docs/product/mvp-checklist.md; README.md, CLAUDE.md (gốc)                                                Task 30
```

---

### Task 15: Storybook app — màn thật theo luồng ở cổng 6007, đưa vào repo và gate; phân loại lỗi màn, sửa lỗi DS dùng chung

`storybook-app/` được dựng cách ly song song Task 12–14 (ruling `progress.md` 08/10: "loại khỏi git qua `.git/info/exclude`… Sau Task 14: bỏ
exclude, commit, gộp vào gate"). **Hiện trạng (soát 08/10, HEAD ebb90f4):**
- đã có, giữ nguyên: `.storybook/{main.ts,preview.tsx,shot.css}` (`shot.css` đã có luật đặt Modal trong khung 844 khi chụp viewport cao),
  `stubs/expo-router.tsx` (đã ghép params của href object vào đường dẫn), `lib/appStory.tsx` (`as`, `params`, `setup`, `tabs`), `README.md`
  (Chạy · Viết một story luồng · Quy tắc đặt tên · Chụp ảnh · Luồng · Phủ route 45/45 · Chưa có (Phase 2) · Lỗi màn hình đã thấy · Giới hạn),
  `issues/{issues,A,B,C,D,E,verify}.md`, 13 file `flows/F01…F13-*.stories.tsx` (225 story), `__shots__/{A,B,C,D,E,all,infra}`, cache Vite
  `node_modules/.vite`. Story gõ chữ bằng `fireEvent.change` / `fireEvent.input` (helper riêng từng file: `fill`, `typeIn`, `typeCode`, `typeNote`);
  F05 vá hẹn giờ OCR bằng `ocrTimer` (`setTimeout` 1500 ms), F07 vá nhịp mô phỏng bằng decorator `ticks(n)`.
- chưa có: `storybook-app/tsconfig.json`, `hold` / `typeIn` trong `appStory`, `DELAYS`, khung chụp cố định trong `scripts/shot-storybook.mjs`, script
  `storybook:app`, gate. Bản script chụp cứng hoá của lượt rà (timeout từng story, khởi động lại Chrome khi treo, log `console.error`) nằm ngoài
  repo ở `.superpowers/sdd/2026-10-07-gramgolf-ui/tools/shot.mjs` — bản gốc `scripts/shot-storybook.mjs` treo khi chụp cả 225 story; Step 8 gộp vào.
- tsconfig ở Step 7 đã thử bằng một tsconfig tạm ngoài repo (cùng nội dung, đường dẫn tuyệt đối): 17 file (13 luồng + `.storybook` + `lib` +
  `stubs`), 0 lỗi; bỏ `DOM.Iterable` thì `TS2345` ở `.storybook/main.ts` (`new URL(…)`). Grep `check:literals` trên 4 thư mục con: không dòng nào.

**Quy tắc của task:** file đã có thì giữ, chỉ sửa đúng chỗ bước ghi. Task dựng hạ tầng, phân loại mọi lỗi màn / minor để lại (Step 12) và sửa
ngay phần DS / dùng chung (Step 13); lỗi của từng màn do task luồng sở hữu sửa (đã viết thành bước code trong task đó).

**Files:**
- Modify: `.git/info/exclude` (xoá 2 dòng `storybook-app`), `.gitignore`, `package.json` (gốc), `scripts/shot-storybook.mjs`
- Modify: `apps/golf/lib/simulate.ts` (`DELAYS`), `apps/golf/components/Feedback.tsx` (`SavedToast` đọc `DELAYS.toast`),
  `apps/golf/app/metrics/import-photo.tsx` (`DELAYS.ocr`), `apps/golf/app/(player)/home.tsx` + `apps/golf/components/CommunityScreen.tsx`
  (`DELAYS.firstLoad`)
- Create: `storybook-app/tsconfig.json`
- Modify: `storybook-app/lib/appStory.tsx` (thêm `hold`, `typeIn`), `storybook-app/flows/F13-trang-thai.stories.tsx` (2 story kiểm `hold`),
  `storybook-app/README.md` (Step 10), `storybook-app/issues/*.md` (Step 12)
- Modify (Step 13): `packages/ds/src/ui/Comment/Comment.tsx`, `packages/ds/src/ui/Avatar/Avatar.tsx`, `packages/ds/src/ui/PostCard/PostCard.tsx`,
  `packages/ds/src/ui/Social/Social.tsx`, `docs/ds/API-CHEATSHEET.md`, `docs/ds/figma-debt.md`
- Giữ nguyên: `storybook-app/.storybook/*`, `storybook-app/stubs/expo-router.tsx`, 13 file story (trừ F13 ở Step 9)

**Interfaces:**
- Consumes: `StoreProvider`, `useStore` (`lib/store.tsx` — không nhận state ban đầu, nên `appStory` dùng component cổng `Seed`), `Action`
  (`lib/reducer.ts`), `seedState`/`NOW` (`lib/mock.ts`), `AppTabBar`, preview DS `packages/ds/.storybook/preview.tsx`.
- Produces (task 16–30 dùng đúng tên):
  - `appStory({ as?, params?, setup?, tabs?, hold? }) → { decorators, parameters }`;
    `hold?: (keyof typeof DELAYS)[]` — khoá liệt kê thành vô hạn trong story đó, mọi khoá khác về mặc định;
    `typeIn(el: HTMLElement, value: string): Promise<void>` — gõ vào ô nhập trong `play`.
  - `DELAYS` (`apps/golf/lib/simulate.ts`): `{ firstLoad: 400, toast: 1200, ocr: 1500 }`, object sửa được, mọi nơi đọc lúc chạy.
    Task 29 thêm `save: 600`, `toastError: 4000`.
  - `node scripts/shot-storybook.mjs <outDir> [filter] [W=390] [H]` — có `H` thì khung cố định W×H; chờ story vẽ + `play` xong mới chụp; mỗi lần
    chụp tối đa 60 s, treo thì khởi động lại Chrome và thử lại 1 lần; dòng log kèm exception / `console.error` của trang.
  - Script gốc: `pnpm storybook:app` (cổng 6007); `pnpm typecheck` gồm `tsc -p storybook-app --noEmit`; `pnpm check:literals` gồm
    `storybook-app/{.storybook,stubs,lib,flows}`.
  - DS: `nameInitials(name)` (`packages/ds/src/ui/Avatar/Avatar.tsx`) — chữ tắt 2 chữ như `initials()` của app; `CommentItem` chỉ vẽ "⋯" khi có
    `onMore`, `CommentComposer` chỉ vẽ "Thêm ảnh" / "Thêm địa điểm" khi có handler.
  - Story: file `storybook-app/flows/Fxx-<slug>.stories.tsx`, meta `title: 'Luồng/Fxx · <tên>'`, `id: 'fxx'` → id `fxx--<export viết kebab>`
    (chỉ ASCII, lọc bằng `'^fxx--'`). Tên 13 file: `F01-nguoi-choi-moi`, `F02-hlv-moi`, `F03-tai-khoan`, `F04-ket-noi-hlv`, `F05-so-lieu`,
    `F06-bo-gay`, `F07-swing`, `F08-hlv-review-swing`, `F09-hlv-xem-hoc-vien`, `F10-cong-dong`, `F11-thong-bao`, `F12-ho-so-cai-dat`, `F13-trang-thai`.

- [ ] **Step 1: Đọc hiện trạng**

```bash
cd "/Users/duncreative/Coding Agent/Gram-Golf"
ls -la storybook-app storybook-app/.storybook storybook-app/flows storybook-app/lib storybook-app/stubs storybook-app/issues
cat .git/info/exclude
grep -rn "setTimeout" apps/golf/app apps/golf/components
```
Mong đợi (HEAD ebb90f4): đủ các file ở "Hiện trạng"; `.git/info/exclude` có dòng comment `# Storybook màn app — …` và dòng `storybook-app/`;
`setTimeout` ở `(player)/home.tsx` (400), `components/CommunityScreen.tsx` (400), `components/Feedback.tsx` (1200), `metrics/import-photo.tsx` (1500),
`metrics/scan-qr.tsx` (1000, "đang liên kết phiên"), `(auth)/verify-otp.tsx` (1000, đếm ngược), `swings/[id].tsx` (`ANALYSIS_QUEUE_MS`). Khác thì
ghi vào báo cáo; mọi bước dưới so với bản đang có.

- [ ] **Step 2: Bỏ loại trừ git, chặn file sinh ra**

```bash
sed -i '' '/Storybook màn app/d; /^storybook-app\/$/d' .git/info/exclude
printf 'storybook-app/__shots__/\n' >> .gitignore
git status --short --untracked-files=all storybook-app | grep -c "node_modules\|__shots__"
```
Mong đợi: `0` (`node_modules/` của `.gitignore` gốc đã chặn cache Vite `storybook-app/node_modules/.vite`); `git status --short` có `?? storybook-app/`.

- [ ] **Step 3: Cấu hình Storybook — có sẵn, chỉ kiểm**

`storybook-app/.storybook/main.ts` (react-native-web-vite, alias `@gr/ds` → `packages/ds/src`, `^expo-router$` → stub, `__DEV__ = true`, cache
`storybook-app/node_modules/.vite`), `preview.tsx` (dùng lại preview DS, `layout: 'fullscreen'`, sắp `Luồng`), `shot.css` (chỉ tác dụng khi viewport
cao ≥ 1500 px — chụp không có `H`; với `H = 844` màn giữ đúng bố cục điện thoại): giữ nguyên, không viết lại. Chỉ sửa comment dòng 5 của `main.ts`
thành `// Chạy từ gốc repo: pnpm storybook:app --no-open (cổng 6007)` sau Step 7.

- [ ] **Step 4: Stub `expo-router` — có sẵn, chỉ kiểm phủ**

```bash
grep -rhoE "router\.[a-zA-Z]+|use(Local|Global)SearchParams|<Redirect|<Link|<Stack" apps/golf/app apps/golf/components | sort | uniq -c
```
Mong đợi (HEAD ebb90f4): `router.push`, `router.replace`, `router.back`, `router.canGoBack`, `router.dismissTo`, `router.dismissAll`,
`router.canDismiss`, `useLocalSearchParams`, `useGlobalSearchParams`, `<Redirect`, `<Link`, `<Stack` — đều có trong `stubs/expo-router.tsx`.
Task sau gọi API router chưa có trong stub → thêm một dòng `log('<tên>')` vào `router` của stub.

- [ ] **Step 5: `DELAYS` — trạng thái tạm thời giữ được khi chụp**

Skeleton 400 ms, toast 1,2 s và "Đang đọc…" 1,5 s tắt trước khi `shot-storybook` kịp chụp, nên story "đang tải / toast" ra ảnh nội dung thường
(Task 14 review #5: F01/F03/F05/F10/F13 vẽ Tổng quan / bảng tin có skeleton 400 ms). Độ trễ gom vào một object đọc lúc chạy; story kéo dài bằng
`appStory({ hold })` (Step 6). Thêm vào cuối `apps/golf/lib/simulate.ts`:
```ts
/** Độ trễ giả lập (ms) của trạng thái tạm thời. Màn đọc lúc chạy (không chép ra hằng riêng) để Storybook app (`appStory({ hold })`) kéo dài
 *  được khi chụp ảnh. firstLoad = skeleton lần đầu mở màn; toast = toast thành công tự đóng; ocr = "Đang đọc…" khi nhập ảnh. */
export const DELAYS = { firstLoad: 400, toast: 1200, ocr: 1500 };
```
Dùng ở 4 file:
1. `apps/golf/components/Feedback.tsx`: thêm `import { DELAYS } from '../lib/simulate';`; dòng 20 `const timer = setTimeout(onDone, 1200);` →
   `const timer = setTimeout(onDone, DELAYS.toast);`; JSDoc dòng 15 "sau 1,2 s gọi `onDone`" → "sau `DELAYS.toast` (1,2 s) gọi `onDone`".
2. `apps/golf/app/metrics/import-photo.tsx`: thêm `DELAYS` vào import sẵn có từ `'../../lib/simulate'`; dòng 46 `}, 1500);` → `}, DELAYS.ocr);`.
   Story F05 `ocrTimer` (vá `setTimeout` có `ms === 1500`) vẫn chạy vì `DELAYS.ocr` mặc định 1500; Task 20 thay `ocrTimer('never')` bằng `hold: ['ocr']`.
3. `apps/golf/app/(player)/home.tsx`: thêm `import { DELAYS } from '../../lib/simulate';`; dòng 36 `setTimeout(() => setLoading(false), 400)` →
   `setTimeout(() => setLoading(false), DELAYS.firstLoad)`.
4. `apps/golf/components/CommunityScreen.tsx`: thêm `import { DELAYS } from '../lib/simulate';`; dòng 23 như mục 3.

Run: `pnpm -F golf test` → PASS như trước (golf 100, không đổi hành vi, không cần test mới: chỉ là hằng số).

- [ ] **Step 6: `appStory` — thêm `hold`, `typeIn`**

Thay toàn bộ `storybook-app/lib/appStory.tsx` (= bản đang có + các dòng có `hold` / `DELAYS` / `typeIn`):
```tsx
// appStory() — helper DUY NHẤT cho story màn app: dựng store mẫu (seedState), đăng nhập `as`, chạy `setup` MỘT lần trước khi vẽ màn,
// cấp params route qua stub expo-router, (tuỳ chọn) vẽ AppTabBar thật dưới màn, và giữ trạng thái tạm thời (`hold`) để ảnh chụp tất định.
import { useEffect, useState, type PropsWithChildren } from 'react';
import { View } from 'react-native';
import type { Decorator } from '@storybook/react-native-web-vite';
import { action } from 'storybook/actions';
import { fireEvent } from 'storybook/test';
import { StoreProvider, useStore } from '../../apps/golf/lib/store';
import type { Action } from '../../apps/golf/lib/reducer';
import type { AppState, ID } from '../../apps/golf/lib/domain';
import { DELAYS } from '../../apps/golf/lib/simulate';
import { AppTabBar } from '../../apps/golf/components/AppTabBar';
import { ParamsContext } from '../stubs/expo-router';

type Setup = Action[] | ((dispatch: (a: Action) => void, state: AppState) => void | Action[]);
export type AppStoryOptions = {
  /** Id người dùng mẫu (lib/mock.ts): p-minh, p-lan, p-khoa, p-huy, c-tuan, c-ha. Bỏ trống = chưa đăng nhập. */
  as?: ID;
  /** Params route, vd `{ id: 'sw-minh-1' }` cho swings/[id]. */
  params?: Record<string, string>;
  /** Action dựng trạng thái sau khi đăng nhập (mảng, hoặc hàm nhận dispatch + state seed và trả mảng). */
  setup?: Setup;
  /** Màn thuộc nhóm tab → vẽ thanh tab thật, `active` = tên route tab (home, metrics, roster…). */
  tabs?: { role: 'player' | 'coach'; active: string };
  /** Giữ trạng thái tạm thời để ảnh tất định: khoá `DELAYS` (apps/golf/lib/simulate.ts) liệt kê ở đây thành vô hạn trong story này —
   *  'firstLoad' giữ skeleton, 'toast' giữ toast thành công, 'ocr' giữ "Đang đọc…"; Task 29 thêm 'save' (spinner) và 'toastError'. */
  hold?: (keyof typeof DELAYS)[];
};

// Chép từ apps/golf/app/(player|coach)/_layout.tsx (Tabs.Screen name + title) — layout đổi tab thì sửa ở đây.
const TABS = {
  player: { home: 'Tổng quan', metrics: 'Thông số', swings: 'Swing', community: 'Cộng đồng', coach: 'HLV' },
  coach: { roster: 'Học viên', community: 'Cộng đồng', inbox: 'Thông báo', me: 'Hồ sơ' },
} as const;

const DEFAULT_DELAYS = { ...DELAYS };
const FOREVER = 2_147_483_647; // setTimeout tối đa (~24,8 ngày)

/** Gõ vào ô nhập trong `play`: setter gốc + sự kiện input. `userEvent.type` KHÔNG tới `onChangeText` của TextInput react-native-web 0.21 + React 19
 *  (chữ có trong DOM nhưng state React rỗng — issues/A.md, E.md), nên story không dùng `userEvent.type` cho ô nhập. */
export const typeIn = async (el: HTMLElement, value: string) => void (await fireEvent.input(el, { target: { value } }));

// Cổng nạp state: StoreProvider không nhận state ban đầu (lib/store.tsx) → dispatch signIn + setup một lần rồi mới vẽ màn.
function Seed({ as, setup, children }: PropsWithChildren<Pick<AppStoryOptions, 'as' | 'setup'>>) {
  const { state, dispatch } = useStore();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (as) dispatch({ type: 'signIn', userId: as });
    const actions = typeof setup === 'function' ? setup(dispatch, state) : setup;
    actions?.forEach(dispatch);
    setReady(true);
  }, []); // một lần — như DevQuickLogin của app
  return ready ? children : null;
}

function TabBar({ role, active }: NonNullable<AppStoryOptions['tabs']>) {
  const routes = Object.entries(TABS[role]).map(([name, title]) => ({ key: name, name, title }));
  const index = routes.findIndex((r) => r.name === active);
  const props = {
    state: { index, routes },
    descriptors: Object.fromEntries(routes.map((r) => [r.key, { options: { title: r.title } }])),
    navigation: { navigate: action('tab.navigate') },
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  };
  return <AppTabBar {...(props as unknown as Parameters<typeof AppTabBar>[0])} />;
}

export function appStory({ as, params = {}, setup, tabs, hold = [] }: AppStoryOptions = {}) {
  const decorator: Decorator = (Story) => {
    // ponytail: sửa object dùng chung lúc vẽ — mỗi story đặt lại TOÀN BỘ về mặc định trước nên `hold` không rò sang story sau;
    // cần vẽ nhiều story cùng lúc trong một trang thì chuyển DELAYS vào context.
    Object.assign(DELAYS, DEFAULT_DELAYS, Object.fromEntries(hold.map((k) => [k, FOREVER])));
    return (
      <StoreProvider>
        <ParamsContext.Provider value={params}>
          <Seed as={as} setup={setup}>
            <View style={{ flex: 1 }}>
              <View style={{ flex: 1 }}>
                <Story />
              </View>
              {tabs && <TabBar {...tabs} />}
            </View>
          </Seed>
        </ParamsContext.Provider>
      </StoreProvider>
    );
  };
  return { decorators: [decorator], parameters: { layout: 'fullscreen' } };
}
```
`Seed` vẽ màn sau một khung trống, nên `play` luôn tìm phần tử bằng `find*` (không `get*`). Helper gõ riêng của từng file story (`fill`,
`typeIn`, `typeCode`, `typeNote`) giữ nguyên; story mới dùng `typeIn` của `appStory`.

- [ ] **Step 7: Typecheck + check:literals phủ `storybook-app/**`; script chạy**

`storybook-app` **không** thành package workspace (cách đó cần `pnpm install` và đổi lockfile): typecheck bằng tsconfig riêng, script gốc gọi kèm.
Tạo `storybook-app/tsconfig.json`:
```json
{
  "extends": "../apps/golf/tsconfig.json",
  "compilerOptions": { "lib": ["ESNext", "DOM", "DOM.Iterable"] },
  "include": [".storybook/*.ts", ".storybook/*.tsx", "**/*.ts", "**/*.tsx", "../apps/golf/.expo/types/**/*.ts", "../apps/golf/expo-env.d.ts"],
  "exclude": ["node_modules", "__shots__"]
}
```
- `extends` app: cùng `strict`, `paths` `@gr/ds`, `expo/tsconfig.base`; `.expo/types` giữ kiểu typedRoutes của màn app như khi app tự typecheck.
- `DOM.Iterable`: thiếu thì `TS2345` ở `.storybook/main.ts` (`new URL(…)` không khớp kiểu `URL` của Node); story cũng duyệt `NodeList` (`for…of`).
- `.storybook/*` phải ghi riêng: `**` của `tsc` bỏ thư mục bắt đầu bằng dấu chấm.

`package.json` gốc — `scripts` thành (giữ `test`):
```json
    "typecheck": "pnpm -r typecheck && tsc -p storybook-app --noEmit",
    "storybook:app": "storybook dev -c storybook-app/.storybook -p 6007",
    "check:literals": "grep -rEn \"#[0-9a-fA-F]{6}|fontSize:\\s*[1-9]|(padding|margin)[A-Za-z]*:\\s*[1-9]|gap:\\s*[1-9]\" apps/golf/app apps/golf/components packages/ds/src/ui packages/ds/src/stories packages/ds/.storybook packages/ds/src/icons/Icon.tsx storybook-app/.storybook storybook-app/stubs storybook-app/lib storybook-app/flows && exit 1 || echo OK"
```
`check:literals` liệt kê 4 thư mục con thay vì cả `storybook-app`: grep cả thư mục sẽ quét cache Vite `storybook-app/node_modules/.vite` (code
thư viện có mã màu hex) và báo sai. `storybook` / `tsc` chạy được từ gốc vì `node_modules/.bin/storybook` và `node_modules/.bin/tsc` đã có (hoist,
`typescript` là devDependency gốc).

Run: `pnpm typecheck` → xanh (dòng cuối là `tsc -p storybook-app` không in gì). `pnpm check:literals` → `OK`.

- [ ] **Step 8: `scripts/shot-storybook.mjs` — khung 390×844 cố định, chờ `play` xong, không treo**

Ba lỗi của bản cũ với màn app: (1) viewport cao 3000 rồi đo chiều cao nội dung, nên màn full màn (`Screen` flex:1, preview `layout: 'fullscreen'`)
ra ảnh cao ~3000 px, thanh tab nằm ở đáy 3000 px, Dialog / sheet rơi ra ngoài ảnh (issues/B, C, D, E) hoặc thừa dải 32 px (`verify.md`); (2) chỉ
chờ "có chữ" + 1,2 s, nên story có `play` (gõ, bấm, mở Dialog) có thể bị chụp trước khi `play` xong; (3) một story treo là cả lượt treo (lượt rà
225 story phải dùng bản cứng hoá ở `tools/shot.mjs`). Thay toàn bộ file (gộp bản cứng hoá: timeout + khởi động lại Chrome + log lỗi trang):
```js
// Chụp MỌI story của một Storybook (sáng + tối) bằng Chrome headless + CDP.
// Storybook phải đang chạy: DS `pnpm -F @gr/ds storybook` (6006, mặc định) hoặc màn app `pnpm storybook:app --no-open` (SB_URL=http://localhost:6007).
// Dùng: node scripts/shot-storybook.mjs <outDir> [filter-regex] [W=390] [H]
//   không có H: ảnh cao theo nội dung (tối đa 20000) — story DS;
//   có H (vd 844): khung cố định W×H như màn điện thoại — storyboard màn app (390×844).
// Chờ story vẽ + play xong (phase của StoryRender) rồi mới chụp. Mỗi lần chụp tối đa 60 s: treo thì khởi động lại Chrome, thử lại 1 lần.
// Ảnh: <outDir>/<story-id>.<light|dark>.png. Log: ok|ERROR <id> <scheme> <W>x<h> [lỗi story] [| exception / console.error của trang].
// Máy Mac phải đặt CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome".
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
const [outDir = 'sb-shots', filter = '.', W = '390', FIXED] = process.argv.slice(2);
const SB = process.env.SB_URL ?? 'http://localhost:6006';
const CHROME = process.env.CHROME ?? 'C:/Users/Duncr/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe';
mkdirSync(outDir, { recursive: true });
const index = await (await fetch(`${SB}/index.json`)).json();
const ids = Object.values(index.entries).filter((e) => e.type === 'story' && new RegExp(filter).test(e.id)).map((e) => e.id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let chrome, ws, seq = 0, pending = new Map(), errs = [];
const send = (method, params = {}) => new Promise((r) => { pending.set(++seq, r); ws.send(JSON.stringify({ id: seq, method, params })); });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true })).result?.value;
async function start() {
  const port = 9222 + Math.floor(Math.random() * 500);
  chrome = spawn(CHROME, ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--window-size=${W},900`, 'about:blank'], { stdio: 'ignore' });
  let targets;
  for (let i = 0; i < 50 && !targets; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`, { signal: AbortSignal.timeout(2000) })).json(); } catch { await sleep(200); } }
  const page = targets.find((t) => t.type === 'page' && t.url === 'about:blank') ?? targets.find((t) => t.type === 'page');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  pending = new Map();
  await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m.error); pending.delete(m.id); }
    else if (m.method === 'Runtime.exceptionThrown') errs.push('EXC ' + (m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text).split('\n')[0]);
    else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errs.push('ERR ' + m.params.args.map((a) => a.value ?? a.description).join(' ').split('\n')[0]);
  };
  await send('Page.enable');
  await send('Runtime.enable');
}
const stop = () => { try { ws.close(); } catch {} try { chrome.kill('SIGKILL'); } catch {} };
process.on('exit', stop);
process.on('uncaughtException', (e) => { console.error('LỖI', e); stop(); process.exit(1); });
const MEASURE = `(()=>{const r=document.getElementById('storybook-root');const c=document.getElementById('sb-content')||r.firstElementChild;let h=c?c.getBoundingClientRect().bottom+window.scrollY:0;for(const el of r.querySelectorAll('*')){const cs=getComputedStyle(el);if(!(cs.overflowY==='auto'||cs.overflowY==='scroll'))continue;const b=el.getBoundingClientRect();if(el.scrollHeight>el.clientHeight+2&&b.bottom>=window.innerHeight-2)h=Math.max(h,b.top+window.scrollY+el.scrollHeight)}return Math.ceil(h)})()`;
// Sẵn sàng = có chữ VÀ StoryRender đã vẽ + chạy xong play (phase storybook 10.6: … playing → played → completing → completed → afterEach).
const READY = `(()=>{const n=document.body?document.body.innerText.trim().length:0;const p=window.__STORYBOOK_PREVIEW__?.currentRender?.phase;return n>3&&['completed','afterEach','finished','errored','aborted'].includes(p)})()`;
// Không có H: viewport cao để ScrollView (flex:1) trải hết nội dung rồi clip theo chiều cao thật. Có H: đúng khung điện thoại.
const H = FIXED ? +FIXED : 3000;
async function shoot(sid, scheme) {
  errs = [];
  await send('Emulation.setDeviceMetricsOverride', { width: +W, height: H, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: `${SB}/iframe.html?id=${sid}&viewMode=story&globals=theme:${scheme}` });
  let ready = false;
  for (let i = 0; i < 60 && !ready; i++) { await sleep(500); ready = !!(await evaluate(READY)); }
  await sleep(600); // Dialog / sheet / toast mờ dần vào
  const err = await evaluate('document.body.classList.contains("sb-show-errordisplay") ? (document.querySelector("#error-message")?.innerText || "error") : ""');
  let h = H;
  if (!FIXED) {
    h = Math.min(20000, Math.max(200, ((await evaluate(MEASURE)) ?? 800) + 32));
    if (h > H) { await send('Emulation.setDeviceMetricsOverride', { width: +W, height: h, deviceScaleFactor: 1, mobile: true }); await sleep(600); h = Math.min(20000, Math.max(200, ((await evaluate(MEASURE)) ?? 800) + 32)); }
  }
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !FIXED, clip: { x: 0, y: 0, width: +W, height: h, scale: 1 } });
  writeFileSync(`${outDir}/${sid}.${scheme}.png`, Buffer.from(shot.data, 'base64'));
  const page = [...new Set(errs)].filter((x) => !/shadow\*/.test(x)); // cảnh báo "shadow*" của DS: không phải lỗi màn
  console.log(err || !ready ? 'ERROR' : 'ok', sid, scheme, `${W}x${h}`, err ? err.slice(0, 200) : ready ? '' : 'story chưa vẽ xong sau 30 s', page.length ? `| ${page.join(' | ').slice(0, 400)}` : '');
}
await start();
for (const sid of ids) {
  for (const scheme of ['light', 'dark']) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const r = await Promise.race([shoot(sid, scheme).then(() => 'done'), sleep(60000).then(() => 'timeout')]);
      if (r === 'done') break;
      console.log('TIMEOUT', sid, scheme, `lần ${attempt}`);
      stop();
      await sleep(500);
      await start();
    }
  }
}
stop();
process.exit(0);
```
Kiểm không hồi quy Storybook DS (6006 do chủ dự án đang chạy, chỉ đọc):
`CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/shot-storybook.mjs "$TMPDIR/sb-ds" '^controls-button--' 390`
→ mọi dòng `ok`, ảnh cao theo nội dung như trước. Xoá `$TMPDIR/sb-ds`.

- [ ] **Step 9: 2 story kiểm `hold` ở F13**

`ls storybook-app/flows` phải có đủ 13 tên ở mục Interfaces (bản dựng 08/10 đã đủ — thiếu thì dừng, báo controller). Thêm vào **cuối**
`storybook-app/flows/F13-trang-thai.stories.tsx` 2 story (số 90/91 để không đụng số bản dựng; Task 29 đánh lại số theo `steps.json` F13). File đã
import `Home` từ `../../apps/golf/app/(player)/home` và `appStory` — chỉ thêm import còn thiếu:
```tsx
import { userEvent } from 'storybook/test';
import MetricsManual from '../../apps/golf/app/metrics/manual';
import { appStory, typeIn } from '../lib/appStory'; // thay dòng import appStory sẵn có

export const DangTaiTongQuan: Story = {
  name: '90 · Đang tải — Tổng quan (giữ skeleton)',
  render: () => <Home />,
  ...appStory({ as: 'p-minh', tabs: { role: 'player', active: 'home' }, hold: ['firstLoad'] }),
};

export const ToastDaLuu: Story = {
  name: '91 · Toast — đã lưu phiên thể lực (giữ toast)',
  render: () => <MetricsManual />,
  ...appStory({ as: 'p-minh', params: { kind: 'fitness' }, hold: ['toast'] }),
  play: async ({ canvas }) => {
    for (const [label, value] of [['Cân nặng (kg)', '72,5'], ['Độ dẻo (/10)', '7'], ['Lực nắm (kg)', '45'], ['Bật cao (cm)', '48']] as const) {
      await typeIn(await canvas.findByLabelText(label), value);
    }
    await userEvent.click(await canvas.findByRole('button', { name: 'Lưu' }));
  },
};
```
Comment đầu file: thêm 2 dòng `✓ 90 · …`, `✓ 91 · …` vào danh sách bước.

- [ ] **Step 10: `storybook-app/README.md` — chạy, chụp, `hold`, đặt tên, "Chưa có (Phase 2)"**

Giữ các mục đã có; sửa đúng 5 chỗ:
1. Mục **Chạy**: thay khối lệnh (đang là `node_modules/.bin/storybook dev …` + `nohup`) bằng
```sh
pnpm storybook:app --no-open          # cổng 6007; chủ dự án chạy Storybook DS ở 6006, không trùng
lsof -ti tcp:6007 | xargs kill        # tắt — KHÔNG dùng pkill -f storybook (giết luôn Storybook DS 6006)
```
2. Mục **Chụp ảnh**: thay khối lệnh và đoạn dưới nó bằng
```sh
SB_URL=http://localhost:6007 CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node scripts/shot-storybook.mjs storybook-app/__shots__/f04 '^f04--' 390 844
```
   và: "Ra `<outDir>/<story-id>.<light|dark>.png`, khung cố định 390×844 (tham số cuối) — Dialog / sheet nằm trong khung. Bỏ tham số cuối thì ảnh
   cao theo nội dung (tối thiểu 844, `shot.css`). Story treo quá 60 s → script khởi động lại Chrome, thử lại 1 lần (dòng `TIMEOUT`); lỗi trang
   (exception, `console.error`) in sau dấu `|`. Storyboard của luồng chụp thẳng vào `docs/flows/Fxx/` (xem `docs/flows/README.md`)."
3. Bảng option của `appStory`: thêm dòng
   `| hold | (keyof typeof DELAYS)[] | giữ trạng thái tạm thời để chụp: 'firstLoad' (skeleton), 'toast', 'ocr' ("Đang đọc…"); Task 29 thêm 'save' (spinner), 'toastError'. Story khác luôn về độ trễ mặc định |`
   và dưới bảng: "`typeIn(el, value)` (cùng file): gõ vào ô nhập trong `play`."
4. Mục **Giới hạn**, gạch đầu dòng "Gõ chữ vào ô nhập": thêm cuối câu "Story mới dùng `typeIn` của `lib/appStory.tsx`." Mục **Quy tắc đặt tên**:
   thêm dòng "Story của bước `shot` `"<nn>-<slug>"` trong `docs/flows/Fxx/steps.json`: export `B<nn><SlugPascal>` (hai cụm số liền nhau nối bằng
   `_`), id `fxx--b-<nn>-<slug>`; biến thể `'<nn><a|b…> · …'` không đặt export bắt đầu bằng `B` + số."
5. Mục **Chưa có (Phase 2)**: thay câu dẫn + bảng (đang là `Luồng | Bước | Ghi chú`, lẫn cả bước không có task) bằng bảng dưới. Bước không có
   task Phase 2 (F07 quay video trong app, F08 vẽ trên khung hình, F10 sửa bài / xoá-sửa bình luận / ảnh trong bài / gửi qua ShareSheet thật / bỏ chặn
   ở hồ sơ, F11 push thật, F12 đổi email / OTP khi sửa SĐT / Dev ở bản release, F13 mất mạng – lỗi máy chủ thật / guard ở `_layout`) chuyển vào
   mục "Đã biết / chưa làm" của `docs/flows/F<nn>.md` (khung của các task luồng đã ghi sẵn).
```markdown
## Chưa có (Phase 2)

Bước của luồng cần màn Phase 2 — task luồng xoá dòng của mình khi story đã có. Bước ngoài Phase 2: mục "Đã biết / chưa làm" của `docs/flows/F<nn>.md`.

| Luồng | Bước chưa có màn | Task |
| --- | --- | --- |
| F02 | Onboarding HLV: bước "Giới thiệu nghề nghiệp" (bắt buộc, 20–300 ký tự) | 24 |
| F03 | Đặt lại mật khẩu từ link (hợp lệ / hết hạn / sai); "Mở link (thử)" ở quên mật khẩu; đăng nhập sau khi đặt lại | 25 |
| F04 | Lời mời 2 chiều: HLV mời học viên cụ thể → học viên Chấp nhận / Từ chối; học viên gửi yêu cầu từ hồ sơ HLV → HLV Duyệt / Từ chối; HLV huỷ kết nối → 403 ngay | 17 |
| F05 | Sửa phiên (swing, thể lực, theo yard); dòng "Đã sửa" | 20 |
| F06 | Đang dùng / Lưu trữ; khôi phục; xoá gậy chưa gắn dữ liệu | 21 |
| F07 | Danh sách / Lưới, lọc + sắp xếp theo ngày; ô Ngày khi đăng; popup file quá dung lượng / không phải video; mục Gậy có thông số | 19 |
| F08 | Thông báo "học viên đăng swing mới"; Chưa review / Đã review; Chèn mốc; sửa / xoá ghi chú; chip "Tua tới" | 18 |
| F11 | Thông báo `connect_request`, `swing_uploaded` | 27 |
| F12 | Đổi ảnh đại diện ở Tài khoản; Dev › "Kiểm tra theo luồng" | 28, 30 |
| F13 | 404; 403 có Quay lại; skeleton các màn danh sách; spinner khi lưu/xoá; toast thất bại + Thử lại; Dev › "Giả lập lỗi khi lưu/xoá" | 29 |
```
Bảng **Phủ route** (45/45 đã điền) giữ nguyên; task luồng thay id khi đổi export. Mục **Lỗi màn hình đã thấy**: thêm 2 cột `Task` và `Trạng thái`
theo bảng phân loại ở Step 12.

- [ ] **Step 11: Chụp toàn bộ story một lần, đọc từng ảnh**

Storybook app 6007 đang chạy thì dùng luôn (`curl -sf http://localhost:6007/index.json` trả JSON); chưa chạy thì chạy nền (công cụ chạy nền của agent,
không chặn phiên): `pnpm storybook:app --no-open > .superpowers/sdd/2026-10-07-gramgolf-ui/logs/storybook-app.log 2>&1`, chờ tới khi `curl` trả JSON
(lần dựng đầu ~20 s). Rồi:
```bash
SB_URL=http://localhost:6007 CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node scripts/shot-storybook.mjs storybook-app/__shots__/all '^f[0-9]{2}--' 390 844 | tee "$TMPDIR/sb-app-all.log"
grep -c '^ok' "$TMPDIR/sb-app-all.log"; grep -E '^(ERROR|TIMEOUT)| \| ' "$TMPDIR/sb-app-all.log"
```
Mong đợi: số dòng `ok` = 2 × số story `^f[0-9]{2}--` trong `index.json` (227 story sau Step 9 → 454); không dòng `ERROR` / `TIMEOUT` / lỗi trang sau
`|`. Đọc **mọi** ảnh (sáng + tối) trong `storybook-app/__shots__/all/`. Kiểm riêng:
- `f13--dang-tai-tong-quan.*` có skeleton, `f13--toast-da-luu.*` có toast "Đã lưu" — `hold` chạy; Dialog / BottomSheet nằm trong khung 390×844
  (vd `f04--hlv-thu-hoi-dialog`, `f06--them-gay-chon-loai`, `f10--chan-dialog`);
- story có `play` gõ chữ: ô có chữ **và** không báo "Bắt buộc" (vd `f01--dang-ky-trung-tai-khoan`, `f05--nhap-tay-loi`, `f10--dang-bai-hop-le`);
- story khác cùng màn (vd `f05--tong-quan`, `f10--bang-tin`) **không** có skeleton — `hold` không rò, story chờ hết 400 ms;
- ảnh đúng 390×844, thanh tab ở đáy khung, không ảnh trống.
Lỗi màn mới thấy (chữ tràn, màu sai ở tối, phần tử chồng nhau, guard `↪ Chuyển hướng tới …` ở story lẽ ra vẽ màn): ghi 1 dòng vào
`storybook-app/issues/issues.md` (story id · `file:dòng` · hiện tượng) và vào bảng Step 12 với task sở hữu theo bảng file → task. Story vẽ sai do
story (sai `as`, thiếu `params`/`setup`): sửa story ngay. Mục "Hạ tầng Storybook" của `issues/A.md`…`E.md` (gõ chữ, modal ra ngoài ảnh, toast tự
tắt, HMR) đã xử lý ở Step 6 / 8 / 9: ghi "đã xử lý (Task 15)" vào từng dòng.

- [ ] **Step 12: Phân loại lỗi màn + minor để lại → task sở hữu**

Nguồn: `storybook-app/README.md` › "Lỗi màn hình đã thấy" (= `issues/A`–`E.md` + `verify.md`), minor để lại của Task 12–14 (`progress.md`, chi tiết
ở `task-1{2,3,4}-review.md`) và concern / cannot-verify của `task-1{2,3,4}-report.md`. Luật: lỗi thật và chữ sai → sửa (bước code nằm sẵn trong task
sở hữu, cột "Bước"); thuần đẹp hơn → danh sách "Không làm" dưới, mỗi mục một dòng lý do. Ghi đúng bảng này vào cuối `storybook-app/issues/issues.md`
(mục mới `## Phân loại Phase 2`), thêm cột `Task` / `Trạng thái` (`chờ Task NN` hoặc `đã sửa (Task 15)`) vào bảng "Lỗi màn hình đã thấy" của README
và bảng "Lỗi / xấu" của `issues/A`–`E.md`, `verify.md`.

| # | Nguồn | Lỗi | Task | Bước |
|---|---|---|---|---|
| 1 | README · `f01--tong-quan-co-du-lieu` | `charts/ConcentricRings.tsx:17-21`: 1 gậy → vẽ một đĩa đặc to | 20 | Step 4b |
| 2 | README · `f01--tong-quan-co-du-lieu` | "Xu hướng … (Driver, 1 buổi)" vẽ biểu đồ một điểm (`charts/TrendChart.tsx`, dùng ở `(player)/home.tsx:173`, `students/[id].tsx:90`) | 20 | Step 4b |
| 3 | README · `f10--chi-tiet-bai` | DS `Comment/Comment.tsx:70`: "⋯" của bình luận của mình bấm không làm gì | 15 | Step 13 |
| 4 | README · `f10--tra-loi-binh-luan` | DS `Comment/Comment.tsx:155-156`: "Thêm ảnh" / "Thêm địa điểm" không có handler | 15 | Step 13 |
| 5 | README · `f11--tab-hlv` + report Task 13 | `NotificationsScreen.tsx:101`: tab Thông báo của HLV vẫn có chuông mở chính màn đó | 27 | Step 3 |
| 6 | README · `f04--ho-so-hlv`, `f10--*` | DS `PostCard.tsx:56`, `Social.tsx:91`, `Comment.tsx:57`: chữ tắt `name.slice(0, 1)` → mọi HLV hiện "H" | 15 | Step 13 |
| 7 | README · `f02--onboarding-anh` | `(auth)/onboarding.tsx:32`: HLV vẫn đọc "Giúp HLV và bạn bè nhận ra bạn." | 24 | Step 3 |
| 8 | README · `f11--danh-sach` | `NotificationsScreen.tsx:19`: "… đã bình luận" thiếu tân ngữ | 27 | Step 3 |
| 9 | README · `f11--tab-hlv-rong` + review Task 13 #3 | `NotificationsScreen.tsx:124`: rỗng của HLV nói "Ghi chú của HLV…" | 27 | Step 3 |
| 10 | README · `f12--tai-khoan-hlv` + review Task 13 #4 | `settings/account.tsx:26`: đơn giá điền sẵn "450000", placeholder "450.000" | 28 | Step 3 |
| 11 | README · `f12--mat-khau` | `settings/password.tsx:13,15`: placeholder "••••••••" ở ô trống trông như đã có mật khẩu | 25 | Step 5 |
| 12 | `verify.md` · `f10--kham-pha` | `components/People.tsx:66`: "hcp 14", màn khác "Handicap 14" | 26 | Step 1b |
| 13 | `verify.md` · `f09--tong-quan-rong` | `students/[id].tsx:72`: "chưa có phiên swing nào" dễ lẫn với video swing | 22 | Step 1b |
| 14 | README · `f06--them-gay-chon-loai` + review Task 14 #3 | Viền Radio chưa chọn (`Checkbox/Border/Default`) và Toggle tắt (`Color/Border/Neutral/Pale/Default`) < 3:1 trên nền sáng — token Figma | 15 | Step 13 (nợ Figma F56, giữ token) |
| 15 | review Task 12 #1 | Khối "Bài đăng" chép y hệt ở `coaches/[id].tsx:60`, `users/[id].tsx:85`, `(coach)/me.tsx:35` | 26 | Step 1b |
| 16 | review Task 12 #3 | `PostItem.tsx:83`: nhãn Chia sẻ kẹt "Đã sao chép" mãi sau một lần gửi | 26 | Step 1b |
| 17 | review Task 12 #5 | `PostItem.tsx` thân bài (Pressable) không có nhãn / gợi ý a11y | 26 | Step 1b |
| 18 | review Task 12 #7 | Link giả `https://gramgolf.app/p/<id>` (`PostItem.tsx:13`) và `/i/<code>` (`connect/invite.tsx:14`) thiếu comment `ponytail:` | 26, 17 | 26 Step 1b · 17 Step 4 |
| 19 | review Task 12 #8 | `posts/[id].tsx:195`: xoá bài gọi `back()` rồi `dispatch` cùng nhịp → màn đang rời nháy "Không tìm thấy" | 26 | Step 1b |
| 20 | review Task 13 #1 | `settings/password.tsx`: thiếu guard `if (!me) return <Redirect href="/" />` (mở được khi đã đăng xuất) | 25 | Step 5 |
| 21 | review Task 13 #2 | `settings/privacy.tsx:39,86-92`: Dialog xoá tài khoản trống chữ khi mờ dần lúc đóng | 28 | Step 4 |
| 22 | review Task 13 #5 + report Task 13 | Thông báo của người đã chặn vẫn hiện và vẫn tính vào số trên chuông | 27 | Step 3 |
| 23 | review Task 14 #1 | `CLAUDE.md:24` nói tải lần đầu có "lỗi + thử lại" — skeleton không có nhánh lỗi | 30 | Step 5 |
| 24 | review Task 14 #2 | Mẫu `deleteOnLeave` chép ở `metrics/[id].tsx:18-25`, `swings/[id].tsx:179-186`; xoá gậy (Task 21) là nơi thứ 3 | 21 | Step 5 |
| 25 | review Task 14 #5 | Story F01/F03/F05/F10/F13 vẽ Tổng quan / bảng tin có skeleton 400 ms | 15 | Step 5, 6 (`DELAYS` + `hold`; story dùng `find*`) |
| 26 | issues A–E "Hạ tầng" + `verify.md` | `userEvent.type` không tới `onChangeText`; Modal ra ngoài ảnh / thừa 32 px; toast tự tắt; script chụp treo | 15 | Step 6, 8, 9 |
| 27 | review Task 14 cannot-verify + report Task 14 | Bàn phím iOS/Android (`KeyboardAvoid`), `resetTo` và xoá-khi-rời trên native chỉ kiểm trên web | 30 | Step 3 (mục "Kiểm trên điện thoại") |

**Không làm (nice-to-have):**
- `(auth)/register.tsx:85` nút "Tiếp" ở bước gửi OTP — chữ không sai (bước kế là xác minh OTP).
- `charts/ConcentricRings.tsx:6,25` vòng ngoài / ô chú giải `Support/Brand/Soft` mờ ở chế độ tối — chú giải có tên gậy + số, màu chỉ phụ; đổi thang
  màu chart tối cần thiết kế.
- DS `TextArea` nhãn to hơn `TextField` — đúng Figma (`TextArea.tsx` ghi "label Body/XSmall/Regular … khác Text-Field").
- DS `ListItem` `selected` đổi padding (`listItemStyles.ts:22`, avatar lệch ở Dev) — theo variant Figma; chỉ màn Dev.
- DS chip "Trả lời …" gap nhỏ (`commentStyles.ts:54`) — token Figma `Badge/Spacing/Small/Gap`.
- `PostItem` gọi `discover()` + dựng `ShareSheet` ở mỗi hàng (review Task 12 #2) — 6 bài mẫu, không đo được chậm.
- `FollowCounts` / tiêu đề `LikesSheet` đếm cả người bị chặn trong khi danh sách ẩn họ (review Task 12 #4) — chỉ lệch khi người xem đã chặn một
  người trong danh sách; ẩn là có chủ đích.
- Hồ sơ bị chặn vẫn hiện "Handicap · CLB" (review Task 12 #6) — thông tin công khai.
- DS `Chip` không nhận `accessibilityLabel` (report Task 12) — trợ giúp của ô tag đã nói "chạm tag để bỏ".
- `BottomSheet` primary / `ShareSheet` "Gửi (N)" màu khác nút app (review Task 12 #10) — DS dùng `level` theo Figma Share-Sheet; đổi là quyết
  định Figma, chủ dự án xem ảnh `f04--hlv-chia-se-ma` rồi quyết.
- Đơn giá vượt 10.000.000 báo "Số tiền không hợp lệ" (review Task 13 #4, nửa sau) — trợ giúp ô đã ghi "Tối đa 10.000.000 đ".
- 14 chỗ chép prop avatar ảnh / chữ tắt (review Task 13 #6) — refactor không đổi hành vi.
- `target()` / `SENTENCE` của `NotificationsScreen` chưa có unit test (review Task 13 #7) — lượt đi F4 / F8 / F11 bấm từng loại thông báo.
- Nút hiện/ẩn mật khẩu lặp ở 3 ô `settings/password` (review Task 13 #8) — review chấp nhận.
- `ShareSheet` chọn người nhận nhưng "Gửi (N)" chép cùng một lời nhắn (review Task 14 #4) — có `ponytail:`; mời người cụ thể trong app là mục
  "Mời học viên cụ thể" (Task 17).
- Công khai bộ gậy / swing và tắt từng loại thông báo chưa có hiệu lực thấy được (report Task 13) — mock không có push, không có màn xem dữ liệu
  công khai.

Kiểm đếm: 27 dòng → Task 15 (6: #3, #4, #6, #14, #25, #26), 17 (1, chung #18), 20 (2), 21 (1), 22 (1), 24 (1), 25 (2), 26 (6, gồm #18), 27 (4),
28 (2), 30 (2); 16 mục không làm.

- [ ] **Step 13: Sửa lỗi DS dùng chung (bảng Step 12 #3, #4, #6, #14)**

Không đổi token / style nên `figmaParity.test.ts` không đổi; không mục nào khác Figma (Figma không vẽ trạng thái "không có handler" và không quy
định cách lấy chữ tắt) nên không cần `// NỢ FIGMA`.

1. `packages/ds/src/ui/Avatar/Avatar.tsx` — thêm trên `export function Avatar`:
```tsx
/** Chữ tắt từ tên: chữ đầu của 2 từ cuối, in hoa ("HLV Đỗ Minh Tuấn" → "MT") — cùng luật `initials()` của app (apps/golf/lib/format.ts). */
export const nameInitials = (name: string) => name.split(/\s+/).filter(Boolean).slice(-2).map((w) => w.charAt(0).toUpperCase()).join('');
```
2. Đổi import `import { Avatar } from '../Avatar/Avatar';` thành `import { Avatar, nameInitials } from '../Avatar/Avatar';` ở 3 file, rồi:
   - `packages/ds/src/ui/PostCard/PostCard.tsx:56`: `initials={user.name.slice(0, 1)}` → `initials={nameInitials(user.name)}`;
   - `packages/ds/src/ui/Social/Social.tsx:91`: `initials={u.name.slice(0, 1)}` → `initials={nameInitials(u.name)}`;
   - `packages/ds/src/ui/Comment/Comment.tsx:57`: `initials={comment.user.name.slice(0, 1)}` → `initials={nameInitials(comment.user.name)}`.
3. `packages/ds/src/ui/Comment/Comment.tsx:70` (`CommentItem`) — "⋯" chỉ khi có `onMore`:
```tsx
          {onMore ? <SocialAction size="Small" type="More-item" onPress={() => onMore(comment)} accessibilityLabel="Thêm" /> : null}
```
4. `packages/ds/src/ui/Comment/Comment.tsx:155-156` (`CommentComposer`, khối `expanded`) — nút chỉ khi có handler:
```tsx
            {onAddMedia ? <IconButton type="Flat" level="Secondary" size="XSmall" icon="image-solid" accessibilityLabel="Thêm ảnh" onPress={onAddMedia} /> : null}
            {onAddLocation ? <IconButton type="Flat" level="Secondary" size="XSmall" icon="marker-pin-02-line" accessibilityLabel="Thêm địa điểm" onPress={onAddLocation} /> : null}
```
5. `docs/ds/API-CHEATSHEET.md`: mục `Avatar` thêm "`nameInitials(name)` (cùng file): chữ tắt 2 chữ — Identity / ShareSheet / CommentItem dùng";
   mục Comment (hoặc ghi chú chung) thêm "`CommentItem` không có `onMore` → không vẽ ⋯; `CommentComposer` không có `onAddMedia` / `onAddLocation` →
   không vẽ nút tương ứng".
6. `docs/ds/figma-debt.md`: thêm dòng vào cùng bảng với F54 (token dưới mức tương phản, code giữ token Figma):
```markdown
| F56 | Viền control chưa chọn trên nền sáng: Toggle tắt `Color/Border/Neutral/Pale/Default` (`toggleStyles.ts:34`), Radio / PopoverItem chưa chọn `Checkbox/Border/Default` (`popoverItemStyles.ts:48`) | viền gần như không thấy (non-text < 3:1, WCAG 1.4.11) — `docs/screens/chung/settings-privacy-light.png`, story `f06--them-gay-chon-loai` | giữ token Figma, ghi nợ | Đậm viền control chưa chọn ≥ 3:1 trên `Surface/Default` |
```
Run: `pnpm -F @gr/ds test` → PASS (115). Chụp lại `f10--chi-tiet-bai`, `f10--tra-loi-binh-luan`, `f04--ho-so-hlv`
(lệnh Step 11 với outDir `storybook-app/__shots__/ds-fix`, lọc `'^(f10--chi-tiet-bai|f10--tra-loi-binh-luan|f04--ho-so-hlv)$'`), đọc ảnh:
không "⋯" ở bình luận của mình, ô bình luận mở rộng chỉ còn nút Gửi, avatar HLV "MT". Gallery DS `(dev)/ds/comment.tsx` không truyền `onMore` thì
cũng hết "⋯" — đúng ý (không có thao tác thì không có nút). Cột Trạng thái của #3, #4, #6, #14, #25, #26: `đã sửa (Task 15)`.

- [ ] **Step 14: Gates, tắt Storybook**

Run: `pnpm typecheck && pnpm test && pnpm check:literals`
Expected: `apps/golf Done`, `packages/ds Done`, `tsc -p storybook-app` không in gì; test ds 115 + golf 100; `OK`.
Tắt Storybook app nếu task tự khởi động (`lsof -ti tcp:6007 | xargs kill`); 6007 đã chạy từ trước thì để nguyên.

- [ ] **Step 15: Commit**

```bash
git add .gitignore package.json scripts/shot-storybook.mjs storybook-app apps/golf/lib/simulate.ts apps/golf/components/Feedback.tsx apps/golf/components/CommunityScreen.tsx apps/golf/app/metrics/import-photo.tsx "apps/golf/app/(player)/home.tsx"
git add packages/ds/src/ui/Avatar/Avatar.tsx packages/ds/src/ui/PostCard/PostCard.tsx packages/ds/src/ui/Social/Social.tsx packages/ds/src/ui/Comment/Comment.tsx docs/ds/API-CHEATSHEET.md docs/ds/figma-debt.md
git status --short | grep -E "node_modules|__shots__"   # mong đợi: không in dòng nào
git commit -m "$(cat <<'EOF'
feat(storybook-app): màn app theo luồng ở Storybook 6007, appStory giữ trạng thái tạm thời, ảnh 390×844; gộp vào typecheck + check:literals; DS bỏ nút chết ở bình luận, chữ tắt 2 chữ

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 16: Nền dữ liệu Phase 2 — kết nối 2 chiều, thông báo swing mới, sửa/xoá ghi chú, sửa phiên, khôi phục/xoá gậy, kiểm file video, đặt lại mật khẩu (TDD)

**Files:**
- Modify: `apps/golf/lib/{domain,mock,reducer,selectors,format,validation,simulate}.ts`
- Test: `apps/golf/lib/{reducer,selectors,validation,format,simulate}.test.ts`
- Modify (giữ typecheck xanh sau khi đổi kiểu): `apps/golf/components/SwingUpload.tsx`, `apps/golf/app/(auth)/onboarding.tsx`,
  `apps/golf/components/NotificationsScreen.tsx` và `apps/golf/app/settings/notifications.tsx` (cả hai do Task 13 dựng)
- Không cần sửa story: `grep -rn "uploadUpdate\|SAMPLE_VIDEOS\|SAMPLE_AVATARS" storybook-app` không có chỗ nào (soát 08/10); `f12--cai-dat-thong-bao-hlv`
  trải `...DEFAULT_PREFS.notify` nên tự có 2 loại mới

**Interfaces:**
- Consumes: mọi export hiện có của `lib/` (Task 2, 10–14): `reduce`, `Action`, `canViewPrivate`, `validateInvite`, `isBlocked` (đã export, Task 12),
  `swingsOf`, `fold`, `byDateDesc` (nội bộ), `notify` (nội bộ), `parseNumberVN`, `formatSec` ("1,3 s"), `formatValue`, `mToYd`, `SWING_FIELDS`,
  `FITNESS_FIELDS`, `BIO_MAX` (= 300, Task 13), `passwordError` (nội bộ `validation.ts`), `validateAccount`.
- Produces (task sau dùng đúng tên/kiểu):
  - Action mới:
    - `{ type: 'requestConnection'; id: ID; coachId: ID; playerId: ID; by: Role; at: ISO; notificationId: ID }`
    - `{ type: 'respondConnection'; id: ID; accept: boolean; at: ISO; notificationId: ID }`
    - `{ type: 'editNote'; id: ID; coachId: ID; text: string; at: ISO }`, `{ type: 'deleteNote'; id: ID; coachId: ID }`
    - `{ type: 'updateSession'; session: MetricSession; at: ISO }`
    - `{ type: 'unarchiveClub'; id: ID }`, `{ type: 'deleteClub'; id: ID }`
    - `{ type: 'setSimulateFailure'; on: boolean }`
  - Action đổi: `uploadUpdate` thêm bắt buộc `at: ISO; notificationId: ID`. Khi sang `done` lần đầu, mỗi HLV active nhận 1 thông báo
    `swing_uploaded`, id thông báo là `${notificationId}-${i}`.
  - Selector:
    - `openConnection(s, coachId, playerId): CoachConnection | undefined`
    - `connectionRequests(s, userId): { incoming: CoachConnection[]; outgoing: CoachConnection[] }`
    - `findPlayers(s, coachId, query): Profile[]`
    - `swingsByReview(s, playerId, coachId): { unreviewed: Swing[]; reviewed: Swing[] }`
    - `type SwingPeriod = 'all' | '7d' | '30d'`
    - `filterSwings(swings: Swing[], period: SwingPeriod, order: 'newest' | 'oldest', now: ISO): Swing[]`
    - `archivedClubsOf(s, playerId): Club[]`, `clubLinkCount(s, clubId): number`
  - format: `markText(sec)` → `"[1,3 s]"`, `insertMark(text, sec)`, `noteMarks(text): number[]` (đọc cả `[1,3 s]` lẫn `[1,3s]`), `formatSize(mb)`.
  - validation:
    - `PASSWORD_RULE`, `validateNewPassword(password, confirm): { password?: string; confirm?: string }`
    - `BIO_MIN = 20` (cùng `BIO_MAX = 300` có sẵn), `validateBio(raw): string | undefined`; `validateAccount('coach', …)` báo lỗi bio bằng
      `validateBio` (HLV bắt buộc 20–300 ký tự), người chơi giữ luật cũ (tuỳ chọn, ≤ 300)
    - `MAX_VIDEO_MB = 300`, `type VideoFileError = 'not_video' | 'too_large'`,
      `videoFileError(f: { mimeType: string; sizeMb: number }): VideoFileError | undefined`
    - `swingRaw(m: SwingMetrics, units: Units): Raw<keyof SwingMetrics>`, `fitnessRaw(m: FitnessMetrics): Raw<keyof FitnessMetrics>`
  - simulate:
    - `SAMPLE_VIDEOS[i].sizeMb: number`, `SAMPLE_VIDEOS[i].mimeType: string`
    - `RESET_TOKENS = { ok: 'GG-RESET-OK', expired: 'GG-RESET-EXPIRED' }`,
      `resetTokenStatus(token?: string): 'ok' | 'expired' | 'invalid'`
    - `SAMPLE_AVATARS: string[]`, `nextSampleAvatar(current?: string): string`
    - (độ trễ lưu/xoá giả lập **không** thêm ở đây: Task 29 thêm `DELAYS.save` vào object `DELAYS` của Task 15)
  - Kiểu:
    - `ConnectionStatus` có thêm `'declined'`
    - `CoachConnection` có thêm `requestedBy?: Role`, `declinedAt?: ISO`
    - `CoachNote.editedAt?: ISO`, `MetricSession.editedAt?: ISO`
    - `NotificationType` có thêm `'connect_request' | 'swing_uploaded'`
    - `AppState.simulateFailure: boolean`
  - Seed:
    - kết nối chờ `cn-ha-huy`: coach c-ha, player p-huy, `requestedBy: 'player'`, invitedAt `2026-10-07T03:00:00Z`;
    - thông báo `nt-6`: gửi c-ha, loại `connect_request`, actor p-huy, refId `cn-ha-huy`.

- [ ] **Step 1: Đọc lib hiện tại**

Đọc `apps/golf/lib/{domain,reducer,selectors,mock,format,validation,simulate}.ts` và file test cạnh chúng (HEAD ebb90f4: Task 12 thêm `isBlocked`
export, `commentsOf(s, postId, viewerId)`, chặn follow khi đã chặn; Task 13 thêm `unblock`, `validateAccount`, `validatePasswordChange`, `BIO_MAX`;
Task 14 sửa `carryByClub`, `formatSec` "1,3 s", thêm `analysisFailAt` + `pw_may_chu_ban.mp4`, `SAMPLE_PHOTOS` / `readPhoto` / `ocrEdit`). Chạy
`pnpm -F golf test` → ghi số test trước khi sửa (HEAD ebb90f4: golf 100).

- [ ] **Step 2: Test đỏ — reducer**

Thêm import ở đầu `apps/golf/lib/reducer.test.ts` (gộp với import đang có):
```ts
import type { AppState, MetricSession, UploadStatus } from './domain';
import { canViewPrivate, validateInvite, activeCoaches, feed, roster, clubById, clubsOf, pendingInvites, discover, connectionRequests, archivedClubsOf, clubLinkCount } from './selectors';
```
Sửa test có sẵn "tiến độ tải lên / job nằm trong store…" (`reducer.test.ts:133`) để khớp kiểu mới của `uploadUpdate`:
```ts
    const up = reduce(s0(), { type: 'uploadUpdate', id: sw.id, status: 'uploading', progress: 0.45, at: NOW, notificationId: 'n-u' });
```
Thêm vào cuối file:
```ts
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
```

- [ ] **Step 3: Test đỏ — selectors**

`apps/golf/lib/selectors.test.ts`: thêm `openConnection, connectionRequests, findPlayers, swingsByReview, filterSwings, swingsOf` vào import từ
`./selectors`, rồi thêm vào cuối file:
```ts
describe('selectors Phase 2', () => {
  const s = seedState();
  it('kết nối mở của cặp = chờ hoặc active; đã huỷ / đã từ chối không tính', () => {
    expect(openConnection(s, 'c-tuan', 'p-minh')?.id).toBe('cn-tuan-minh');
    expect(openConnection(s, 'c-ha', 'p-huy')?.status).toBe('pending');
    expect(openConnection(s, 'c-ha', 'p-lan')).toBeUndefined(); // revoked
  });
  it('lời mời/yêu cầu đang chờ: incoming/outgoing theo người gửi; cặp đã chặn nhau bị ẩn', () => {
    expect(connectionRequests(s, 'c-ha')).toMatchObject({ incoming: [{ id: 'cn-ha-huy' }], outgoing: [] });
    expect(connectionRequests(s, 'p-huy')).toMatchObject({ incoming: [], outgoing: [{ id: 'cn-ha-huy' }] });
    expect(connectionRequests({ ...s, blocks: [{ blockerId: 'c-ha', blockedId: 'p-huy' }] }, 'c-ha').incoming).toEqual([]);
  });
  it('HLV tìm người chơi để mời: tên không dấu, email, SĐT (từ 3 chữ số); bỏ người đã kết nối / đang chờ; ô trống → []', () => {
    expect(findPlayers(s, 'c-tuan', '  ')).toEqual([]);
    expect(findPlayers(s, 'c-tuan', 'khoa').map((p) => p.id)).toEqual(['p-khoa']);
    expect(findPlayers(s, 'c-tuan', 'quochuy@').map((p) => p.id)).toEqual(['p-huy']);
    expect(findPlayers(s, 'c-tuan', '0938 112').map((p) => p.id)).toEqual(['p-huy']);
    expect(findPlayers(s, 'c-tuan', '09')).toEqual([]); // dưới 3 chữ số không tìm theo SĐT
    expect(findPlayers(s, 'c-tuan', 'minh')).toEqual([]); // đã kết nối với c-tuan; HLV không bao giờ có trong kết quả
    expect(findPlayers(s, 'c-ha', 'huy')).toEqual([]); // đang chờ với c-ha
    expect(findPlayers(s, 'c-ha', 'lan').map((p) => p.id)).toEqual(['p-lan']); // kết nối cũ đã huỷ → mời lại được
  });
  it('Đã review / Chưa review theo đúng HLV đang xem; chưa phân tích vẫn là chưa review', () => {
    const tuan = swingsByReview(s, 'p-minh', 'c-tuan');
    expect(tuan.unreviewed.map((w) => w.id)).toEqual(['sw-minh-3']);
    expect(tuan.reviewed.map((w) => w.id)).toEqual(['sw-minh-1', 'sw-minh-2']);
    const ha = swingsByReview(s, 'p-minh', 'c-ha');
    expect(ha.reviewed).toEqual([]);
    expect(ha.unreviewed.map((w) => w.id)).toEqual(['sw-minh-3', 'sw-minh-1', 'sw-minh-2']);
  });
  it('lọc swing theo khoảng ngày (tính cả mốc biên) và sắp mới/cũ, không đổi mảng gốc', () => {
    const w = swingsOf(s, 'p-minh');
    expect(filterSwings(w, 'all', 'newest', NOW).map((x) => x.id)).toEqual(['sw-minh-3', 'sw-minh-1', 'sw-minh-2']);
    expect(filterSwings(w, 'all', 'oldest', NOW).map((x) => x.id)).toEqual(['sw-minh-2', 'sw-minh-1', 'sw-minh-3']);
    expect(filterSwings(w, '7d', 'newest', NOW).map((x) => x.id)).toEqual(['sw-minh-3', 'sw-minh-1']);
    expect(filterSwings(w, '30d', 'newest', NOW)).toHaveLength(3);
    const edge = [{ ...w[0]!, id: 'edge', capturedAt: '2026-09-30T08:00:00Z' }]; // đúng NOW − 7 ngày
    expect(filterSwings(edge, '7d', 'newest', NOW).map((x) => x.id)).toEqual(['edge']);
    expect(w.map((x) => x.id)).toEqual(['sw-minh-3', 'sw-minh-1', 'sw-minh-2']);
  });
});
```

- [ ] **Step 4: Test đỏ — validation**

`apps/golf/lib/validation.test.ts`: thêm `validateNewPassword, PASSWORD_RULE, validateBio, BIO_MAX, videoFileError, MAX_VIDEO_MB, swingRaw, fitnessRaw`
vào import từ `./validation` và `import { SAMPLE_VIDEOS } from './simulate';`. Trong `describe('validateAccount')` (dòng 152–177), HLV giờ bắt buộc
giới thiệu 20–300 ký tự: đổi fixture `coach` và giá trị mong đợi của test "coach hợp lệ":
```ts
  const coach = { ...player, bio: ' Chuyên swing cơ bản và tempo cho người mới. ', handicap: '', academy: ' GramGolf Academy ', yearsExperience: '12', ratePerHourVnd: '450.000' };
```
```ts
    expect(validateAccount('coach', coach, others).value).toEqual({
      name: 'Nguyễn Minh Anh', phone: '0912345678', bio: 'Chuyên swing cơ bản và tempo cho người mới.', academy: 'GramGolf Academy', yearsExperience: 12, ratePerHourVnd: 450000,
    });
```
Rồi thêm vào cuối file:
```ts
describe('mật khẩu mới, giới thiệu HLV, file video', () => {
  it('mật khẩu mới: bắt buộc, cùng luật đăng ký, nhập lại phải khớp', () => {
    expect(validateNewPassword('', '')).toEqual({ password: 'Bắt buộc', confirm: 'Bắt buộc' });
    expect(validateNewPassword('golfgolf', 'golfgolf')).toEqual({ password: PASSWORD_RULE });
    expect(validateNewPassword('golf2026', 'golf2025')).toEqual({ confirm: 'Mật khẩu nhập lại không khớp' });
    expect(validateNewPassword('golf2026', 'golf2026')).toEqual({});
    const reg = validateRegistration('player', { name: 'A', email: 'a@b.vn', phone: '0912345678', password: 'golfgolf', handicap: '1', academy: '', yearsExperience: '' }, []);
    expect(reg.errors.password).toBe(PASSWORD_RULE);
  });
  it('giới thiệu HLV: bắt buộc, 20–300 ký tự tính sau khi bỏ khoảng trắng hai đầu', () => {
    expect(validateBio('   ')).toBe('Bắt buộc');
    expect(validateBio('Dạy swing')).toBe('Tối thiểu 20 ký tự');
    expect(validateBio('  Chuyên tempo cho người mới chơi  ')).toBeUndefined();
    expect(validateBio('a'.repeat(BIO_MAX + 1))).toBe('Tối đa 300 ký tự');
  });
  it('Tài khoản: HLV báo lỗi giới thiệu theo validateBio; người chơi để trống vẫn hợp lệ', () => {
    const raw = { name: 'HLV Đỗ Minh Tuấn', phone: '0904888999', bio: 'Ngắn quá', handicap: '', homeClub: '', academy: 'GramGolf Academy', yearsExperience: '12', ratePerHourVnd: '' };
    expect(validateAccount('coach', raw, []).errors).toEqual({ bio: 'Tối thiểu 20 ký tự' });
    expect(validateAccount('coach', { ...raw, bio: ' ' }, []).errors).toEqual({ bio: 'Bắt buộc' });
    expect(validateAccount('player', { ...raw, bio: '', handicap: '14' }, []).errors).toEqual({});
  });
  it('file video: không phải video xét trước, rồi dung lượng; danh sách mẫu có đủ 2 nhánh lỗi', () => {
    expect(videoFileError({ mimeType: 'image/jpeg', sizeMb: 9999 })).toBe('not_video');
    expect(videoFileError({ mimeType: 'video/mp4', sizeMb: MAX_VIDEO_MB + 1 })).toBe('too_large');
    expect(videoFileError({ mimeType: 'video/quicktime', sizeMb: MAX_VIDEO_MB })).toBeUndefined();
    expect(SAMPLE_VIDEOS.filter((v) => videoFileError(v)).map((v) => [v.fileName, videoFileError(v)])).toEqual([
      ['swing_4k_120fps_dai.mov', 'too_large'],
      ['anh_tu_the_chuan_bi.jpg', 'not_video'],
    ]); // 5 video mẫu có sẵn (gồm pw_may_chu_ban.mp4 của Task 14) đều hợp lệ
  });
});

describe('sửa phiên: giá trị form từ phiên đã lưu', () => {
  const sw = { clubSpeedMph: 104.2, ballSpeedMph: 152.1, smash: 1.46, spinRpm: 2650, launchDeg: 12.4, carryM: 229 };
  it('metric: số kiểu VN giữ nguyên chữ số; mở form rồi lưu nguyên → y hệt', () => {
    expect(swingRaw(sw, 'metric')).toEqual({ clubSpeedMph: '104,2', ballSpeedMph: '152,1', smash: '1,46', spinRpm: '2650', launchDeg: '12,4', carryM: '229' });
    expect(validateSwingMetrics(swingRaw(sw, 'metric'), 'metric').value).toEqual(sw);
  });
  it('imperial: carry hiện yard 1 chữ số; lưu lại về mét lệch dưới 0,05 m', () => {
    expect(swingRaw(sw, 'imperial').carryM).toBe('250,4');
    expect(validateSwingMetrics(swingRaw(sw, 'imperial'), 'imperial').value!.carryM).toBeCloseTo(229, 1);
  });
  it('thể lực: mở form rồi lưu nguyên → y hệt', () => {
    const f = { weightKg: 72.5, flexibility: 7, gripStrengthKg: 45, verticalJumpCm: 48 };
    expect(validateFitnessMetrics(fitnessRaw(f)).value).toEqual(f);
  });
});
```

- [ ] **Step 5: Test đỏ — format, simulate**

`apps/golf/lib/format.test.ts`: thêm `insertMark, noteMarks, formatSize` vào import, thêm vào cuối file:
```ts
describe('mốc trong ghi chú HLV, dung lượng file', () => {
  it('chèn "[1,3 s]" (dạng formatSec) vào cuối nội dung, cách chữ trước 1 khoảng trắng; đọc lại các mốc theo thứ tự (gõ tay "[1,6s]" cũng nhận)', () => {
    expect(insertMark('', 1.32)).toBe('[1,3 s] ');
    expect(insertMark('Vai mở sớm', 1.3)).toBe('Vai mở sớm [1,3 s] ');
    expect(insertMark('Vai mở sớm ', 1.3)).toBe('Vai mở sớm [1,3 s] ');
    expect(noteMarks('Đỉnh [1,3 s] rồi chạm bóng [1,6s].')).toEqual([1.3, 1.6]);
    expect(noteMarks('Không có mốc, 1,3 s không ngoặc, [abc]')).toEqual([]);
    expect(noteMarks(insertMark('x', 0))).toEqual([0]);
  });
  it('dung lượng: MB (dưới 10 MB có 1 chữ số), từ 1000 MB đổi GB', () => {
    expect(formatSize(38)).toBe('38 MB');
    expect(formatSize(2.4)).toBe('2,4 MB');
    expect(formatSize(1500)).toBe('1,5 GB');
  });
});
```
`apps/golf/lib/simulate.test.ts`: thêm `RESET_TOKENS, resetTokenStatus, SAMPLE_AVATARS, nextSampleAvatar` vào import, thêm vào cuối file:
```ts
describe('link đặt lại mật khẩu, ảnh đại diện mẫu', () => {
  it('token trong link: hợp lệ / hết hạn / thiếu hoặc lạ (phân biệt hoa thường như token thật)', () => {
    expect(resetTokenStatus(RESET_TOKENS.ok)).toBe('ok');
    expect(resetTokenStatus(RESET_TOKENS.expired)).toBe('expired');
    expect(resetTokenStatus(undefined)).toBe('invalid');
    expect(resetTokenStatus('gg-reset-ok')).toBe('invalid');
  });
  it('ảnh mẫu xoay vòng; chưa có ảnh hoặc ảnh lạ → ảnh đầu', () => {
    expect(nextSampleAvatar()).toBe(SAMPLE_AVATARS[0]);
    expect(nextSampleAvatar(SAMPLE_AVATARS[0])).toBe(SAMPLE_AVATARS[1]);
    expect(nextSampleAvatar(SAMPLE_AVATARS[SAMPLE_AVATARS.length - 1])).toBe(SAMPLE_AVATARS[0]);
    expect(nextSampleAvatar('https://example.com/a.png')).toBe(SAMPLE_AVATARS[0]);
  });
});
```

- [ ] **Step 6: Chạy để thấy đỏ**

Run: `pnpm -F golf test`
Expected: FAIL, gồm 3 loại lỗi:
- hàm mới chưa có: `TypeError: (0 , connectionRequests) is not a function`, `insertMark is not a function`, `resetTokenStatus is not a function`;
- action mới: `switch` của `reduce` không có `case` nên trả `undefined`. Vì vậy cả test `toMatchObject` lẫn test `toBe(b)` đều đỏ
  (`Cannot read properties of undefined`);
- `simulateFailure` chưa có trong seed.

Ghi số test đỏ vào báo cáo.

- [ ] **Step 7: `lib/domain.ts`**

Thay các khai báo sau (giữ nguyên phần còn lại):
```ts
export type ConnectionStatus = 'pending' | 'active' | 'revoked' | 'declined';
export interface CoachConnection {
  id: ID; coachId: ID; playerId: ID; status: ConnectionStatus; isPrimary: boolean;
  invitedAt: ISO; acceptedAt?: ISO; revokedAt?: ISO;
  /** Lời mời / yêu cầu gửi trong app: ai gửi. Không có = kết nối qua mã mời (active ngay — D5). */
  requestedBy?: Role; declinedAt?: ISO;
}
```
```ts
interface SessionBase { id: ID; playerId: ID; capturedAt: ISO; source: MetricSource; vendor?: Vendor; clubId?: ID; note?: string; editedAt?: ISO }
```
```ts
export interface CoachNote { id: ID; swingId: ID; coachId: ID; atSec?: number; text: string; createdAt: ISO; editedAt?: ISO }
```
```ts
export type NotificationType = 'coach_note' | 'follow' | 'like' | 'comment' | 'invite_accepted' | 'analysis_done' | 'connect_request' | 'swing_uploaded';
```
Trong `AppState`, thêm sau `prefs`:
```ts
  /** Dev: mọi lưu/xoá có độ trễ giả lập đều thất bại để xem toast lỗi (Cài đặt › Dev). Không phải dữ liệu người dùng. */
  simulateFailure: boolean;
```

- [ ] **Step 8: `lib/mock.ts`**

`DEFAULT_PREFS.notify` thêm 2 loại:
```ts
  notify: { coach_note: true, follow: true, like: true, comment: true, invite_accepted: true, analysis_done: true, connect_request: true, swing_uploaded: true },
```
Trong `seedState()`:
- thêm vào cuối mảng `connections`:
```ts
      // yêu cầu kết nối do người chơi gửi, đang chờ HLV Hà duyệt (tab Học viên › Lời mời của c-ha có sẵn dữ liệu)
      { id: 'cn-ha-huy', coachId: 'c-ha', playerId: 'p-huy', status: 'pending', isPrimary: false, requestedBy: 'player', invitedAt: '2026-10-07T03:00:00Z' },
```
- thêm vào cuối mảng `notifications`:
```ts
      { id: 'nt-6', userId: 'c-ha', type: 'connect_request', actorId: 'p-huy', refId: 'cn-ha-huy', createdAt: '2026-10-07T03:00:00Z' },
```
- thêm sau `prefs: …`:
```ts
    simulateFailure: false,
```

- [ ] **Step 9: `lib/format.ts`**

Thêm sau `parseNumberVN`:
```ts
/** Mốc chèn vào ghi chú HLV: "[1,3 s]" (cùng dạng formatSec). */
export const markText = (sec: number) => `[${formatSec(sec)}]`;
/** Nút "Chèn mốc" ở ô ghi chú: thêm mốc vào cuối nội dung đang soạn, cách chữ trước 1 khoảng trắng, chừa khoảng trắng để gõ tiếp. */
export const insertMark = (text: string, sec: number) => `${text}${text && !/\s$/.test(text) ? ' ' : ''}${markText(sec)} `;
/** Các mốc "[1,3 s]" (hoặc gõ tay "[1,3s]") trong ghi chú (giây), theo thứ tự xuất hiện; chữ khác dạng ("1,3 s" không ngoặc, "[abc]") bỏ qua. */
export const noteMarks = (text: string) => [...text.matchAll(/\[(\d+(?:[.,]\d{1,2})?) ?s\]/g)].map((m) => parseNumberVN(m[1]!)!);
/** Dung lượng file kiểu VN: "38 MB", "2,4 MB" (dưới 10 MB có 1 chữ số), từ 1000 MB → "1,5 GB". */
export const formatSize = (mb: number) => (mb >= 1000 ? `${vn(mb / 1000, 1)} GB` : `${vn(mb, mb < 10 ? 1 : 0)} MB`);
```

- [ ] **Step 10: `lib/validation.ts`**

Dòng 115 (`passwordError`, Task 13 dùng chung cho đăng ký và đổi mật khẩu) dùng hằng mới — thay bằng:
```ts
export const PASSWORD_RULE = 'Tối thiểu 8 ký tự, có ít nhất 1 chữ số';
const passwordError = (pw: string) => (!pw ? 'Bắt buộc' : pw.length < 8 || !/\d/.test(pw) ? PASSWORD_RULE : undefined);
```
Ngay dưới `export const BIO_MAX = 300;` (dòng 159) thêm:
```ts
export const BIO_MIN = 20;
/** Giới thiệu nghề nghiệp của HLV (bước onboarding, Tài khoản): bắt buộc, 20–300 ký tự tính sau khi bỏ khoảng trắng hai đầu. */
export const validateBio = (raw: string): string | undefined => {
  const n = raw.trim().length;
  if (!n) return 'Bắt buộc';
  if (n < BIO_MIN) return `Tối thiểu ${BIO_MIN} ký tự`;
  if (n > BIO_MAX) return `Tối đa ${BIO_MAX} ký tự`;
  return undefined;
};
```
Trong `validateAccount` (dòng 171), thay dòng
```ts
    bio: bio.length > BIO_MAX ? `Tối đa ${BIO_MAX} ký tự` : undefined,
```
bằng:
```ts
    // HLV: giới thiệu bắt buộc (MVP §2 "Bio nghề nghiệp"); người chơi: tuỳ chọn, tối đa BIO_MAX
    bio: role === 'coach' ? validateBio(raw.bio) : bio.length > BIO_MAX ? `Tối đa ${BIO_MAX} ký tự` : undefined,
```
Thêm vào cuối file:
```ts
/** Mật khẩu mới + nhập lại (đặt lại mật khẩu từ link): cùng luật với đăng ký và đổi mật khẩu (`passwordError`). */
export const validateNewPassword = (password: string, confirm: string): { password?: string; confirm?: string } =>
  onlyErrors({
    password: passwordError(password),
    confirm: !confirm ? 'Bắt buộc' : confirm !== password ? 'Mật khẩu nhập lại không khớp' : undefined,
  });

// ponytail: giới hạn tạm 300 MB cho video swing (vài giây 1080p 60 fps ≈ 20–60 MB) — chủ dự án chốt số khi có upload thật.
export const MAX_VIDEO_MB = 300;
export type VideoFileError = 'not_video' | 'too_large';
/** File chọn ở bước "Chọn video": không phải video (theo MIME) xét trước, rồi dung lượng. Hợp lệ → undefined. */
export const videoFileError = (f: { mimeType: string; sizeMb: number }): VideoFileError | undefined =>
  !f.mimeType.startsWith('video/') ? 'not_video' : f.sizeMb > MAX_VIDEO_MB ? 'too_large' : undefined;

/** Giá trị form sửa phiên swing từ số đã lưu (mét, D9): số kiểu VN giữ nguyên chữ số; carry theo đơn vị hiển thị — imperial đổi sang yard
 *  1 chữ số thập phân để lưu lại không trôi quá 0,05 m. Lưu bằng `validateSwingMetrics(raw, units)`. */
export const swingRaw = (m: SwingMetrics, units: Units): Raw<keyof SwingMetrics> =>
  Object.fromEntries(
    SWING_FIELDS.map((f) => [f.key, formatValue(f.key === 'carryM' && units === 'imperial' ? Math.round(mToYd(m.carryM) * 10) / 10 : m[f.key])]),
  ) as Raw<keyof SwingMetrics>;
/** Giá trị form sửa phiên thể lực. */
export const fitnessRaw = (m: FitnessMetrics): Raw<keyof FitnessMetrics> =>
  Object.fromEntries(FITNESS_FIELDS.map((f) => [f.key, formatValue(m[f.key])])) as Raw<keyof FitnessMetrics>;
```
(`onlyErrors`, `formatValue`, `mToYd`, `SwingMetrics`, `FitnessMetrics`, `Units` đã có trong file / import của file.)

- [ ] **Step 11: `lib/simulate.ts`**

Thay khai báo `SAMPLE_VIDEOS` (dòng 33–41; Task 14 đã thêm `analysisFailAt` và `pw_may_chu_ban.mp4`). Thêm `sizeMb`/`mimeType` cho **mọi** mục
và 2 file lỗi:
```ts
/** Video mẫu cho màn đăng swing. `failAt` = tải lên lỗi tại mốc đó; `analysisFailAt` = job phân tích lỗi tại mốc đó (máy chủ bận);
 *  thử lại chạy tiếp từ mốc lỗi nên lần sau thành công. `quality: 'low'` → kết quả needs_review. `sizeMb` / `mimeType` → kiểm file khi chọn. */
export const SAMPLE_VIDEOS: { fileName: string; durationSec: number; cameraView: CameraView; failAt?: number; analysisFailAt?: number; quality: 'good' | 'low'; sizeMb: number; mimeType: string }[] = [
  { fileName: 'driver_face_on_60fps.mp4', durationSec: 4.2, cameraView: 'face-on', quality: 'good', sizeMb: 38, mimeType: 'video/mp4' },
  { fileName: 'sat7_dtl_sang_som.mp4', durationSec: 3.8, cameraView: 'down-the-line', quality: 'good', sizeMb: 31, mimeType: 'video/mp4' },
  { fileName: 'wedge_mang_yeu.mp4', durationSec: 3.1, cameraView: 'face-on', failAt: 0.6, quality: 'good', sizeMb: 24, mimeType: 'video/mp4' },
  { fileName: 'driver_nguoc_sang.mp4', durationSec: 4.0, cameraView: 'face-on', quality: 'low', sizeMb: 35, mimeType: 'video/mp4' },
  { fileName: 'pw_may_chu_ban.mp4', durationSec: 3.4, cameraView: 'down-the-line', analysisFailAt: 0.5, quality: 'good', sizeMb: 27, mimeType: 'video/mp4' },
  // 2 file lỗi để popup MVP §6 đi tới được (cùng cách file CSV mẫu thứ 3): quá dung lượng, không phải video
  { fileName: 'swing_4k_120fps_dai.mov', durationSec: 95, cameraView: 'face-on', quality: 'good', sizeMb: 1500, mimeType: 'video/quicktime' },
  { fileName: 'anh_tu_the_chuan_bi.jpg', durationSec: 0, cameraView: 'face-on', quality: 'good', sizeMb: 2.4, mimeType: 'image/jpeg' },
];
```
Thêm vào cuối file:
```ts
/** Link đặt lại mật khẩu (mô phỏng email): token trong link → trạng thái. Bản thật: server kiểm token dùng 1 lần, hết hạn sau 30 phút. */
export const RESET_TOKENS = { ok: 'GG-RESET-OK', expired: 'GG-RESET-EXPIRED' } as const;
export const resetTokenStatus = (token?: string): 'ok' | 'expired' | 'invalid' =>
  token === RESET_TOKENS.ok ? 'ok' : token === RESET_TOKENS.expired ? 'expired' : 'invalid';

// ponytail: ảnh mẫu thay cho thư viện ảnh/camera — bản thật dùng expo-image-picker + upload.
export const SAMPLE_AVATARS = [12, 33, 47, 59].map((n) => `https://i.pravatar.cc/300?img=${n}`);
/** Ảnh mẫu kế tiếp cho nút "Chọn ảnh" / "Đổi ảnh" (onboarding, Tài khoản): xoay vòng; chưa có ảnh hoặc ảnh lạ → ảnh đầu. */
export const nextSampleAvatar = (current?: string) => SAMPLE_AVATARS[(SAMPLE_AVATARS.indexOf(current ?? '') + 1) % SAMPLE_AVATARS.length]!;

```

- [ ] **Step 12: `lib/selectors.ts`**

`isBlocked` đã export (Task 12). Thêm vào **cuối** file (mọi hàm dùng ở đây đã khai báo phía trên):
```ts
// ── Phase 2 ──────────────────────────────────────────────────────────────────────────────────
/** Kết nối đang mở (chờ trả lời hoặc active) của cặp HLV–người chơi. Một cặp có tối đa 1 kết nối mở. */
export const openConnection = (s: AppState, coachId: ID, playerId: ID) =>
  s.connections.find((c) => c.coachId === coachId && c.playerId === playerId && (c.status === 'pending' || c.status === 'active'));
/** Lời mời / yêu cầu kết nối đang chờ của `userId` (HLV hoặc người chơi), mới → cũ: `incoming` = bên kia gửi, chờ mình trả lời;
 *  `outgoing` = mình gửi, chờ bên kia. Cặp đã chặn nhau bị ẩn. */
export const connectionRequests = (s: AppState, userId: ID) => {
  const open = s.connections
    .filter((c) => c.status === 'pending' && (c.coachId === userId || c.playerId === userId) && !isBlocked(s, c.coachId, c.playerId))
    .sort((a, b) => Date.parse(b.invitedAt) - Date.parse(a.invitedAt));
  const sentByMe = (c: CoachConnection) => (c.requestedBy === 'player' ? c.playerId : c.coachId) === userId;
  return { incoming: open.filter((c) => !sentByMe(c)), outgoing: open.filter(sentByMe) };
};
/** HLV tìm người chơi để gửi lời mời: khớp tên (không dấu), email, hoặc SĐT (từ 3 chữ số); bỏ người đã có kết nối mở với HLV này
 *  và cặp đã chặn nhau. Ô trống → []. */
export const findPlayers = (s: AppState, coachId: ID, query: string): Profile[] => {
  const q = query.trim();
  if (!q) return [];
  const digits = q.replace(/\D/g, '');
  return s.profiles.filter(
    (p) =>
      p.role === 'player' &&
      !openConnection(s, coachId, p.id) &&
      !isBlocked(s, coachId, p.id) &&
      (fold(p.name).includes(fold(q)) || p.email.toLowerCase().includes(q.toLowerCase()) || (digits.length >= 3 && p.phone.replace(/\D/g, '').includes(digits))),
  );
};
/** Swing của học viên theo HLV `coachId` (MVP "Đã review / Chưa review"): đã review = chính HLV đó có ghi chú; còn lại — kể cả chưa phân tích,
 *  đang tải lên — là chưa review. Mới → cũ. Khác `awaitsFeedback` (roster "Cần phản hồi" chỉ xét swing đã phân tích — plan Task 2). */
export const swingsByReview = (s: AppState, playerId: ID, coachId: ID) => {
  const reviewed = (w: Swing) => s.notes.some((n) => n.swingId === w.id && n.coachId === coachId);
  const all = swingsOf(s, playerId);
  return { unreviewed: all.filter((w) => !reviewed(w)), reviewed: all.filter(reviewed) };
};
export type SwingPeriod = 'all' | '7d' | '30d';
const PERIOD_DAYS = { '7d': 7, '30d': 30 } as const;
/** Lọc swing theo khoảng ngày tính lùi từ `now` (đúng mốc `now − n ngày` vẫn tính), sắp theo ngày quay mới → cũ hoặc cũ → mới. Không đổi mảng gốc. */
export const filterSwings = (swings: Swing[], period: SwingPeriod, order: 'newest' | 'oldest', now: ISO) => {
  const from = period === 'all' ? -Infinity : Date.parse(now) - PERIOD_DAYS[period] * 86400000;
  const kept = swings.filter((w) => Date.parse(w.capturedAt) >= from).sort(byDateDesc);
  return order === 'newest' ? kept : kept.reverse();
};
/** Gậy đã lưu trữ của người chơi, lưu trữ gần nhất trước. */
export const archivedClubsOf = (s: AppState, playerId: ID) =>
  s.clubs.filter((c) => c.playerId === playerId && c.archivedAt).sort((a, b) => Date.parse(b.archivedAt!) - Date.parse(a.archivedAt!));
/** Số phiên + swing đang gắn gậy. > 0 → chỉ lưu trữ được, không xoá (tech review: lưu trữ thay vì xoá khi đã liên kết). */
export const clubLinkCount = (s: AppState, clubId: ID) =>
  s.sessions.filter((x) => x.clubId === clubId).length + s.swings.filter((w) => w.clubId === clubId).length;
```

- [ ] **Step 13: `lib/reducer.ts`**

Import (gộp với import có sẵn):
```ts
import type { AppNotification, AppState, Club, CoachConnection, CoachInvite, CoachNote, Comment, ID, ISO, JobStatus, MetricSession, NotificationType, Post, Preferences, Profile, Report, Role, Swing, SwingAnalysis, UploadStatus } from './domain';
import { canViewPrivate, clubLinkCount, isBlocked, openConnection, validateInvite } from './selectors';
import { noteMarks } from './format';
```
Trong `Action`: thay dòng `uploadUpdate` và thêm các action mới (trước `| { type: 'reset' }`):
```ts
  | { type: 'uploadUpdate'; id: ID; status: UploadStatus; progress: number; at: ISO; notificationId: ID }
```
```ts
  | { type: 'updateSession'; session: MetricSession; at: ISO }
  | { type: 'unarchiveClub'; id: ID } | { type: 'deleteClub'; id: ID }
  | { type: 'editNote'; id: ID; coachId: ID; text: string; at: ISO } | { type: 'deleteNote'; id: ID; coachId: ID }
  | { type: 'requestConnection'; id: ID; coachId: ID; playerId: ID; by: Role; at: ISO; notificationId: ID }
  | { type: 'respondConnection'; id: ID; accept: boolean; at: ISO; notificationId: ID }
  | { type: 'setSimulateFailure'; on: boolean }
```
Thay `case 'uploadUpdate'`:
```ts
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
```
Trong `case 'acceptInvite'`, đổi dòng `connections` của object trả về:
```ts
        // lời mời/yêu cầu đang chờ của đúng cặp này tự đóng — một cặp chỉ có 1 kết nối mở
        connections: [...s.connections.map((c) => (c.coachId === inv.coachId && c.playerId === a.playerId && c.status === 'pending' ? { ...c, status: 'revoked' as const, revokedAt: a.at } : c)), conn],
```
Thay `case 'reset'`:
```ts
    case 'reset': return { ...seedState(), sessionUserId: s.sessionUserId, simulateFailure: s.simulateFailure };
```
Thêm trước `case 'reset'`:
```ts
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
      if (!text) return s;
      return { ...s, notes: s.notes.map((x) => (x === n ? { ...x, text, atSec: noteMarks(text)[0] ?? x.atSec, editedAt: a.at } : x)) };
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
      if (!c || c.status !== 'pending') return s;
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
```

- [ ] **Step 14: Chạy test → xanh**

Run: `pnpm -F golf test`
Expected: PASS toàn bộ — golf 134 (100 cũ + 34 mới: reducer 18, selectors 5, validation 7, format 2, simulate 2). Nếu test seed cũ đỏ (vd đếm
thông báo của c-ha) → đọc lại: seed thêm `nt-6` và `cn-ha-huy` là có chủ đích; chỉ sửa test khi nó đếm toàn bộ thông báo/kết nối, ghi vào báo cáo.
(`unreadCount(s, 'p-minh')` = 2 ở `selectors.test.ts:37` không đổi: `nt-6` gửi c-ha.)

- [ ] **Step 15: Giữ typecheck xanh ở chỗ dùng kiểu đã đổi**

1. `apps/golf/components/SwingUpload.tsx`. Thêm import `NOW` từ `'../lib/mock'` và `newId` từ `'../lib/ids'`, rồi thay hàm `set` (dòng 22):
```ts
  const set = (next: UploadStatus, p: number) => dispatch({ type: 'uploadUpdate', id: swing.id, status: next, progress: p, at: NOW, notificationId: newId('nt') });
```
2. `apps/golf/app/(auth)/onboarding.tsx`. Ảnh mẫu giờ lấy từ lib (Task 28 dùng chung ở màn Tài khoản):
   - xoá dòng 10–11 (comment `// ponytail: ảnh mẫu…` và hằng `SAMPLE_AVATARS`);
   - thêm `import { nextSampleAvatar } from '../../lib/simulate';`;
   - thay `pickAvatar` (dòng 25–28):
```ts
  const pickAvatar = () => dispatch({ type: 'updateProfile', id: me.id, patch: { avatarUrl: nextSampleAvatar(me.avatarUrl) } });
```
3. `apps/golf/components/NotificationsScreen.tsx` — `SENTENCE` là `Record<NotificationType, string>` nên phải có đủ 8 khoá. Thay khối `SENTENCE`
   (dòng 14–22) và thêm 2 nhánh vào `switch` của `target` (dòng 25–38); Task 17 Step 9 đổi tiếp câu / đích theo vai trò người nhận:
```tsx
/** Câu theo loại, đứng sau tên người gửi; `analysis_done` là thông báo hệ thống (không có người gửi) nên là cả câu. */
const SENTENCE: Record<NotificationType, string> = {
  coach_note: 'đã ghi chú swing của bạn',
  follow: 'đã theo dõi bạn',
  like: 'đã thích bài viết của bạn',
  comment: 'đã bình luận',
  invite_accepted: 'đã chấp nhận lời mời',
  analysis_done: 'Phân tích swing đã xong',
  connect_request: 'mời bạn kết nối',
  swing_uploaded: 'vừa tải lên swing mới',
};
```
```tsx
    case 'swing_uploaded':
      return n.refId ? `/swings/${n.refId}` : undefined;
    case 'connect_request':
      return '/(player)/coach';
```
   (`swing_uploaded` dùng chung nhánh với `coach_note` / `analysis_done` cũng được: thêm `case 'swing_uploaded':` ngay trên `case 'coach_note':`.)
   Hàng thông báo đã vẽ avatar người gửi cho mọi loại có `actorId` — 2 loại mới đều có `actorId`, không cần icon riêng.
4. `apps/golf/app/settings/notifications.tsx` — mảng `TYPES` (dòng 10–18) có `roles`; người chơi giờ cũng nhận `invite_accepted` (HLV duyệt yêu
   cầu của mình). Thay comment + mảng:
```tsx
/** Nhãn 8 loại thông báo; `roles` = vai trò nhận được loại đó (HLV không nhận ghi chú/phân tích, người chơi không nhận "học viên đăng swing mới"). */
const TYPES: { type: NotificationType; label: string; roles: Role[] }[] = [
  { type: 'coach_note', label: 'Ghi chú của HLV', roles: ['player'] },
  { type: 'analysis_done', label: 'Phân tích swing xong', roles: ['player'] },
  { type: 'swing_uploaded', label: 'Học viên đăng swing mới', roles: ['coach'] },
  { type: 'connect_request', label: 'Lời mời và yêu cầu kết nối', roles: ['player', 'coach'] },
  { type: 'invite_accepted', label: 'Kết nối được chấp nhận', roles: ['player', 'coach'] },
  { type: 'follow', label: 'Người theo dõi mới', roles: ['player', 'coach'] },
  { type: 'like', label: 'Lượt thích bài viết', roles: ['player', 'coach'] },
  { type: 'comment', label: 'Bình luận bài viết', roles: ['player', 'coach'] },
];
```
   Người chơi thấy 7 công tắc, HLV 6 (ruling Task 13 R-a: chỉ loại vai trò đó nhận được).
5. Story app: không story nào dùng `uploadUpdate` / `SAMPLE_VIDEOS` / `SAMPLE_AVATARS` (soát 08/10). Run: `pnpm typecheck`. Mong đợi: xanh. Lỗi còn
   có thể gặp:
   - `Property 'connect_request' is missing…`: một `Record<NotificationType, …>` khác chưa thêm → thêm 2 khoá;
   - thiếu `at` / `notificationId` ở một chỗ dispatch `uploadUpdate` khác → thêm `at: NOW, notificationId: newId('nt')` (story: id cố định
     `'nt-<id swing>'`, không `newId` — ảnh phải tất định);
   - lỗi trong `storybook-app/**` → sửa story (không sửa màn app cho vừa story).

- [ ] **Step 16: Gates**

Run: `pnpm typecheck && pnpm test && pnpm check:literals`
Expected: `apps/golf Done`, `tsc -p storybook-app` không in gì, ds 115 + golf 134 passed, `OK`.

- [ ] **Step 17: Commit**

```bash
git add apps/golf/lib apps/golf/components/SwingUpload.tsx apps/golf/components/NotificationsScreen.tsx apps/golf/app/settings/notifications.tsx "apps/golf/app/(auth)/onboarding.tsx"
git add -u apps/golf storybook-app
git commit -m "$(cat <<'EOF'
feat(lib): kết nối 2 chiều, báo HLV khi có swing mới, sửa/xoá ghi chú, sửa phiên, khôi phục/xoá gậy, kiểm file video, link đặt lại mật khẩu

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 17: F4 Kết nối HLV–học viên — lời mời 2 chiều, HLV huỷ kết nối, script đi luồng

**Files:**
- Create: `scripts/flow-web.mjs`. Script đi luồng dùng cho mọi task 17–30.
- Create: `docs/flows/F04.md`, `docs/flows/F04/steps.json`, `docs/flows/F04/<story-id>.<light|dark>.png` (sinh từ story)
- Modify: `storybook-app/flows/F04-ket-noi-hlv.stories.tsx`, `storybook-app/README.md`, `storybook-app/issues/*.md`
- Modify:
  - `apps/golf/app/connect/invite.tsx`: mục "Mời học viên cụ thể"; comment `ponytail:` cho link mời giả (phân loại Task 15 #18)
  - `apps/golf/app/(player)/coach.tsx`: mục "Lời mời từ HLV", "Yêu cầu đã gửi"
  - `apps/golf/app/coaches/[id].tsx`: nút "Gửi yêu cầu kết nối" và các trạng thái chờ
  - `apps/golf/app/(coach)/roster.tsx` (Task 11 dựng): "Yêu cầu từ học viên", "Lời mời đã gửi", mở mục Lời mời từ thông báo
  - `apps/golf/app/students/[id].tsx` (Task 11 dựng): HLV huỷ kết nối, Dialog cảnh báo, ra 403 ngay
  - `apps/golf/components/NotificationsScreen.tsx` (Task 13 dựng): đích và câu chữ theo vai trò

**Interfaces:**
- Consumes (Task 16):
  - action: `requestConnection`, `respondConnection`, `revokeConnection`
  - selector: `connectionRequests`, `openConnection`, `findPlayers`, `isBlocked`, `activeCoaches`, `profileById`
  - lib khác: `newId`, `NOW`, `relativeTime`, `initials`, `formatValue`
  - component: `SavedToast` (`components/Feedback`), `Section`, `NoAccess`
- Consumes (Task 15): `appStory({ as, params, setup, tabs, hold })`, `scripts/shot-storybook.mjs … 390 844`, Storybook app 6007, quy tắc story id
  `fxx--b-<nn>-<slug>` ("Cách chạy một task luồng" bước 5).
- Produces:
  - `scripts/flow-web.mjs`: một tham số là đường dẫn `steps.json`. Định dạng bước ghi ở đầu file script. Đi luồng bằng CDP (điểm kiểm), rồi
    kiểm mỗi bước `shot` có story `fxx--b-<shot>` trong `index.json` của Storybook app + ảnh sáng/tối trong `docs/flows/<Fxx>/`, ghi bảng bước
    (ảnh = ảnh story) và bảng story biến thể vào `docs/flows/<Fxx>.md`. `"storyboard": false` trong `steps.json` bỏ phần kiểm story (chỉ dùng
    cho kịch bản thử script).
  - Route `/(coach)/roster` nhận `?seg=loi-moi&from=<id>` (mở thẳng mục Lời mời).
  - Nhãn a11y cố định (các kịch bản sau bấm theo nhãn):
    - người chơi: `Chấp nhận lời mời của <HLV>`, `Từ chối lời mời của <HLV>`, `Huỷ yêu cầu kết nối với <HLV>`
    - HLV: `Duyệt yêu cầu của <học viên>`, `Từ chối yêu cầu của <học viên>`, `Huỷ lời mời gửi <học viên>`, `Gửi lời mời kết nối tới <học viên>`
    - `Huỷ kết nối với <học viên>`: nút trên header `students/[id]`

- [ ] **Step 1: `scripts/flow-web.mjs`**

```js
// Đi hết một luồng chức năng trên web (react-native-web) bằng Chrome headless + CDP: bấm như người dùng, kiểm chữ mong đợi — chứng minh bàn
// giao giữa màn và giữa 2 vai trò. Bước "shot" là ĐIỂM KIỂM: ảnh CDP vào $TMPDIR/flow-<Fxx>/ để tự soát. Storyboard thật sinh từ story
// (scripts/shot-storybook.mjs → docs/flows/<Fxx>/<story-id>.<light|dark>.png); cuối lượt script kiểm mỗi bước "shot" "<nn>-<slug>" có story
// "<fxx>--b-<nn>-<slug>" + đủ 2 ảnh, rồi ghi bảng bước + bảng story biến thể vào docs/flows/<Fxx>.md (giữa 2 dấu steps:start/end).
// Dùng: CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/flow-web.mjs docs/flows/F04/steps.json
// Cần Metro web: pnpm -F golf exec expo start --web --port 8081 (cổng khác → METRO_URL=http://localhost:<cổng>) và Storybook app:
// pnpm storybook:app --no-open (cổng khác → SB_URL). "storyboard": false trong steps.json bỏ phần kiểm story (kịch bản thử script).
// Dữ liệu mock sống trong MỘT lần tải trang: chỉ `start` và bước `open` tải URL (kèm ?as=<id> để đăng nhập nhanh); mọi bước khác bấm trong app;
// đổi tài khoản bằng bước `switch` (Hồ sơ của tôi → Cài đặt → Dev → tên hồ sơ) để dữ liệu giữa 2 vai trò không mất.
// Bước (mỗi bước đúng 1 khoá chính):
//   { "click": "<chữ hoặc aria-label>", "role"?: "tab|button|…", "nth"?: 0, "contains"?: true, "settle"?: ms }
//       bấm phần tử nhìn thấy, không bị Dialog/BottomSheet che; contains = khớp một phần (chữ hoặc aria-label)
//   { "type": "<chữ>", "into": "<aria-label | placeholder>" ("^…" = bắt đầu bằng), "append"?: true }   xoá ô rồi gõ (append: gõ tiếp)
//   { "key": "Enter" } · { "wait": ms } · { "back": true } · { "expect": "<chữ>", "timeout"?: ms } · { "expectNot": "<chữ>" }
//   { "switch": "<tên hồ sơ>" } · { "open": "<route>", "account"?: "<nhãn>" } · { "read": "<regex>", "as": "<biến>" } → "${biến}" ở bước sau
//   { "shot": "<nn>-<tên>", "do": "<thao tác>", "see": "<kết quả mong đợi>", "settle"?: ms }   (nn hai chữ số, tên chữ thường không dấu)
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const file = process.argv[2];
if (!file) {
  console.log('Dùng: node scripts/flow-web.mjs docs/flows/<Fxx>/steps.json');
  process.exit(1);
}
const spec = JSON.parse(readFileSync(file, 'utf8'));
const outDir = dirname(file);
const mdPath = join(dirname(outDir), `${spec.flow}.md`);
const BASE = process.env.METRO_URL ?? 'http://localhost:8081';
const SB = process.env.SB_URL ?? 'http://localhost:6007';
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const checkDir = join(tmpdir(), `flow-${spec.flow}`); // ảnh điểm kiểm CDP — không vào docs/
mkdirSync(checkDir, { recursive: true });
const sid = (shot) => `${spec.flow.toLowerCase()}--b-${shot}`; // story của bước shot (export B<nn><Slug>, xem plan "Cách chạy một task luồng")
const W = 390;
const H = 844;
const port = 9222 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--window-size=${W},${H}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 50 && !targets; i++) {
  try {
    targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  } catch {
    await sleep(200);
  }
}
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let seq = 0;
const pending = new Map();
const crashes = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.method === 'Runtime.exceptionThrown') crashes.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m.result ?? m.error);
    pending.delete(m.id);
  }
};
const send = (method, params = {}) => new Promise((r) => { pending.set(++seq, r); ws.send(JSON.stringify({ id: seq, method, params })); });
const inPage = async (fn, ...args) => (await send('Runtime.evaluate', { expression: `(${fn})(...${JSON.stringify(args)})`, returnByValue: true })).result?.value;
const media = (scheme) => send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
const quit = (code) => {
  ws.close();
  chrome.kill();
  process.exit(code);
};
async function waitFor(probe, message, timeout = 6000) {
  for (let t = 0; t <= timeout; t += 250) {
    const v = await probe();
    if (v) return v;
    await sleep(250);
  }
  throw new Error(message);
}

// ── chạy trong trang ──
// Phần tử nhìn thấy, không bị lớp khác che, khớp chữ (đúng, hoặc chứa nếu contains) hoặc aria-label; role → leo lên [role=…] gần nhất.
function FIND(q, role, nth, contains) {
  const xp = contains ? `//*[contains(normalize-space(.), ${JSON.stringify(q)})]` : `//*[normalize-space(text())=${JSON.stringify(q)}]`;
  const it = document.evaluate(xp, document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  const byText = [];
  for (let i = 0; i < it.snapshotLength; i++) byText.push(it.snapshotItem(i));
  const hits = contains ? byText.filter((el) => !byText.some((o) => o !== el && el.contains(o))) : byText; // contains: chỉ giữ phần tử sâu nhất
  document.querySelectorAll('[aria-label]').forEach((el) => {
    const a = el.getAttribute('aria-label');
    if (contains ? a.includes(q) : a === q) hits.push(el);
  });
  const shown = hits
    .map((el) => (role ? el.closest(`[role="${role}"]`) : el))
    .filter((el, i, all) => el && all.indexOf(el) === i)
    .filter((el) => {
      if (!el.checkVisibility()) return false;
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!top && (top === el || el.contains(top) || top.contains(el));
    });
  const el = shown[nth ?? 0];
  if (!el) return null;
  el.scrollIntoView({ block: 'center' });
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
// Ô nhập theo aria-label hoặc placeholder ("^…" = bắt đầu bằng): focus, xoá giá trị kiểu React nhận được (trừ khi append).
function FOCUS(label, append) {
  const match = (v) => (label.startsWith('^') ? (v ?? '').startsWith(label.slice(1)) : v === label);
  const el = [...document.querySelectorAll('input,textarea')].find((x) => x.checkVisibility() && (match(x.getAttribute('aria-label')) || match(x.getAttribute('placeholder'))));
  if (!el) return false;
  el.scrollIntoView({ block: 'center' });
  el.focus();
  if (append) el.setSelectionRange(el.value.length, el.value.length);
  else {
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, '');
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
  return true;
}
function HAS(q) {
  return document.body.innerText.includes(q) || [...document.querySelectorAll('[aria-label]')].some((el) => el.checkVisibility() && el.getAttribute('aria-label').includes(q));
}
function READ(re) {
  const r = new RegExp(re);
  const it = document.evaluate('//*[text()]', document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  for (let i = 0; i < it.snapshotLength; i++) {
    const el = it.snapshotItem(i);
    if (el.checkVisibility() && r.test(el.textContent.trim())) return el.textContent.trim();
  }
  return null;
}

// ── chạy ở Node ──
async function click(q, opt = {}) {
  const p = await waitFor(() => inPage(FIND, q, opt.role ?? null, opt.nth ?? 0, !!opt.contains), `không thấy "${q}"${opt.role ? ` (role ${opt.role})` : ''}`);
  for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: p.x, y: p.y, button: 'left', clickCount: 1 });
}
const visibleNow = (q) => inPage(FIND, q, null, 0, false);
async function switchTo(name) {
  for (let i = 0; ; i++) {
    if (await visibleNow('Dùng tài khoản mẫu')) {
      await click('Dùng tài khoản mẫu');
      break;
    }
    if (await visibleNow('Hồ sơ của tôi')) {
      await click('Hồ sơ của tôi');
      await sleep(700);
      await click('Cài đặt', { role: 'button' });
      await sleep(700);
      await click('Dev');
      break;
    }
    if (i > 6 || !(await visibleNow('Quay lại'))) throw new Error('không có đường tới Cài đặt › Dev từ màn này');
    await click('Quay lại');
    await sleep(700);
  }
  await sleep(700);
  await click(name);
  await sleep(1500);
}
async function open(route) {
  await send('Page.navigate', { url: `${BASE}${route}` });
  await waitFor(() => inPage(() => (document.body?.innerText.trim().length ?? 0) > 10), `trang ${route} không vẽ chữ`, 150000);
  await sleep(1000);
}
async function capture(name) {
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(checkDir, `${name}.png`), Buffer.from(data, 'base64'));
}

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
await media('light');
const vars = {};
const fill = (v) => (typeof v === 'string' ? v.replace(/\$\{(\w+)\}/g, (_, k) => vars[k] ?? `\${${k}}`) : v);
let account = spec.account ?? '—';
const rows = [];
await open(spec.start);
for (const [i, raw] of spec.steps.entries()) {
  const s = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, fill(v)]));
  try {
    if ('click' in s) {
      await click(s.click, s);
      await sleep(s.settle ?? 700);
    } else if ('type' in s) {
      await waitFor(() => inPage(FOCUS, s.into, !!s.append), `không thấy ô "${s.into}"`);
      if (s.type) await send('Input.insertText', { text: s.type });
      await sleep(300);
    } else if ('key' in s) {
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: s.key, code: s.key, windowsVirtualKeyCode: s.key === 'Enter' ? 13 : 0, ...(s.key === 'Enter' ? { text: '\r' } : {}) });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: s.key, code: s.key, windowsVirtualKeyCode: s.key === 'Enter' ? 13 : 0 });
      await sleep(500);
    } else if ('expect' in s) await waitFor(() => inPage(HAS, s.expect), `không thấy chữ "${s.expect}"`, s.timeout ?? 6000);
    else if ('expectNot' in s) {
      await sleep(600);
      if (await inPage(HAS, s.expectNot)) throw new Error(`vẫn còn chữ "${s.expectNot}"`);
    } else if ('wait' in s) await sleep(s.wait);
    else if ('back' in s) {
      await click('Quay lại');
      await sleep(800);
    } else if ('switch' in s) {
      await switchTo(s.switch);
      account = s.switch;
    } else if ('open' in s) {
      await open(s.open);
      if (s.account) account = s.account;
    } else if ('read' in s) vars[s.as] = await waitFor(() => inPage(READ, s.read), `không đọc được chữ khớp /${s.read}/`);
    else if ('shot' in s) {
      if (!/^\d\d-[a-z0-9-]+$/.test(s.shot)) throw new Error(`tên shot "${s.shot}" phải là <nn>-<chữ thường không dấu>`);
      await sleep(s.settle ?? 400);
      await capture(s.shot);
      const route = await inPage(() => location.pathname + location.search);
      const img = `[sáng](${spec.flow}/${sid(s.shot)}.light.png) · [tối](${spec.flow}/${sid(s.shot)}.dark.png)`;
      rows.push({ shot: s.shot, row: `| ${s.shot.slice(0, 2)} | ${account} | \`${route}\` | ${s.do} | ${s.see} | ${img} |` });
    } else throw new Error('bước không có khoá hợp lệ');
    console.log(`✓ ${i + 1} ${JSON.stringify(raw)}`);
  } catch (err) {
    const failShot = join(tmpdir(), `${spec.flow}-FAIL.png`);
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(failShot, Buffer.from(data, 'base64'));
    console.log(`✗ ${i + 1} ${JSON.stringify(raw)} — ${err.message}\n  ảnh lúc lỗi: ${failShot}`);
    quit(1);
  }
}
if (crashes.length) {
  console.log(`✗ lỗi runtime trong trang:\n${crashes.join('\n')}`);
  quit(1);
}
// Storyboard: mỗi bước shot ↔ story fxx--b-<shot> + 2 ảnh; story còn lại của luồng = biến thể (trạng thái khó tới), liệt kê riêng.
let extra = [];
if (spec.storyboard !== false) {
  let entries;
  try {
    entries = Object.values((await (await fetch(`${SB}/index.json`)).json()).entries).filter((e) => e.type === 'story' && e.id.startsWith(`${spec.flow.toLowerCase()}--`));
  } catch {
    console.log(`✗ không đọc được ${SB}/index.json — chạy pnpm storybook:app --no-open`);
    quit(1);
  }
  const has = (id) => ['light', 'dark'].every((m) => existsSync(join(outDir, `${id}.${m}.png`)));
  const missing = rows.filter((r) => !entries.some((e) => e.id === sid(r.shot)) || !has(sid(r.shot))).map((r) => sid(r.shot));
  if (missing.length) {
    console.log(`✗ thiếu story hoặc ảnh storyboard: ${missing.join(', ')}\n  viết story (export B<nn><Slug>) rồi chạy shot-storybook.mjs ${outDir} '^${spec.flow.toLowerCase()}--' 390 844`);
    quit(1);
  }
  extra = entries.filter((e) => !rows.some((r) => sid(r.shot) === e.id));
  const noImg = extra.filter((e) => !has(e.id)).map((e) => e.id);
  if (noImg.length) {
    console.log(`✗ story chưa có ảnh: ${noImg.join(', ')} — chạy lại shot-storybook.mjs`);
    quit(1);
  }
}
const START = '<!-- steps:start -->';
const END = '<!-- steps:end -->';
const table = [
  '| # | Tài khoản | Màn (route) | Thao tác | Kết quả mong đợi | Ảnh (story) |',
  '|---|---|---|---|---|---|',
  ...rows.map((r) => r.row),
  ...(extra.length
    ? ['', '**Trạng thái khác (story biến thể, xem ở Storybook app › `Luồng/' + spec.flow + '`):**', '', '| Story | Ảnh |', '|---|---|', ...extra.map((e) => `| ${e.name} | [sáng](${spec.flow}/${e.id}.light.png) · [tối](${spec.flow}/${e.id}.dark.png) |`)]
    : []),
].join('\n');
const md = existsSync(mdPath) ? readFileSync(mdPath, 'utf8') : `# ${spec.flow} — ${spec.title}\n`;
writeFileSync(mdPath, md.includes(START) ? md.replace(new RegExp(`${START}[\\s\\S]*?${END}`), `${START}\n${table}\n${END}`) : `${md}\n${START}\n${table}\n${END}\n`);
console.log(`PASS ${spec.flow}: ${spec.steps.length} bước, ${rows.length} bước chụp, ${extra.length} story biến thể → ${mdPath}`);
quit(0);
```

Kiểm nhanh script trên màn có sẵn trước khi dùng làm "test". Tạo file tạm **ngoài repo**: `$TMPDIR/flow-smoke/steps.json`, script sẽ ghi
`$TMPDIR/flow-smoke.md`. Nội dung:
```json
{ "flow": "flow-smoke", "title": "smoke", "account": "Nguyễn Minh Anh", "start": "/(player)/coach?as=p-minh", "storyboard": false,
  "steps": [{ "expect": "HLV chính" }, { "click": "Thông số", "role": "tab" }, { "expect": "Thông số" }, { "shot": "01-smoke", "do": "x", "see": "y" }] }
```
Run: `CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/flow-web.mjs "$TMPDIR/flow-smoke/steps.json"`
Expected: `PASS flow-smoke: 4 bước, 1 bước chụp, 0 story biến thể`; ảnh điểm kiểm `$TMPDIR/flow-flow-smoke/01-smoke.png` là tab Thông số.
Thử nhánh kiểm story: bỏ dòng `"storyboard": false`, chạy lại khi Storybook app đang chạy → `✗ thiếu story hoặc ảnh storyboard: flow-smoke--b-01-smoke`.
Xoá `$TMPDIR/flow-smoke`, `$TMPDIR/flow-flow-smoke`, `$TMPDIR/flow-smoke.md` sau đó.

- [ ] **Step 2: Kịch bản F4 — `docs/flows/F04/steps.json`**

```json
{
  "flow": "F04",
  "title": "Kết nối HLV – học viên",
  "account": "HLV Đỗ Minh Tuấn",
  "start": "/(coach)/roster?as=c-tuan",
  "steps": [
    { "expect": "Cần phản hồi" },
    { "shot": "01-roster", "do": "HLV Tuấn mở tab Học viên", "see": "Hero HLV; lọc Tất cả / Cần phản hồi / Lời mời; Nguyễn Minh Anh, Trần Thu Lan" },
    { "click": "Lời mời", "role": "tab" },
    { "expect": "TUAN24" },
    { "shot": "02-loi-moi", "do": "Chạm Lời mời", "see": "Mã mời đang chờ TUAN24 + nút Mời học viên" },
    { "click": "Mời học viên" },
    { "click": "Tạo mã mời" },
    { "read": "^[A-HJ-NP-Z2-9]{6}$", "as": "code" },
    { "shot": "03-tao-ma", "do": "Mời học viên → Tạo mã mời", "see": "Mã mới ${code}, link gramgolf.app/i/${code}, hạn 7 ngày; Chia sẻ / Sao chép" },
    { "click": "Thu hồi mã TUAN24" },
    { "expect": "Thu hồi mã TUAN24?" },
    { "click": "Thu hồi" },
    { "type": "huy", "into": "Tên, email hoặc số điện thoại" },
    { "expect": "Phạm Quốc Huy" },
    { "shot": "04-tim-hoc-vien", "do": "Thu hồi TUAN24; gõ “huy” ở Mời học viên cụ thể", "see": "TUAN24 rời danh sách chờ; kết quả Phạm Quốc Huy + Gửi lời mời" },
    { "click": "Gửi lời mời kết nối tới Phạm Quốc Huy" },
    { "expect": "Đã gửi lời mời tới Phạm Quốc Huy" },
    { "shot": "05-da-gui-loi-moi", "do": "Gửi lời mời", "see": "Toast Đã gửi lời mời tới Phạm Quốc Huy; Huy rời kết quả tìm" },
    { "switch": "Phạm Quốc Huy" },
    { "click": "Thông báo, 1 chưa đọc" },
    { "expect": "mời bạn kết nối" },
    { "shot": "06-thong-bao-loi-moi", "do": "Đổi sang Phạm Quốc Huy → chuông", "see": "Mới: HLV Đỗ Minh Tuấn mời bạn kết nối" },
    { "click": "mời bạn kết nối", "contains": true },
    { "expect": "Lời mời từ HLV" },
    { "shot": "07-tab-hlv-loi-moi", "do": "Chạm thông báo", "see": "Tab HLV: Lời mời từ HLV (Tuấn, nhận lời → HLV chính); Yêu cầu đã gửi (HLV Hà, dữ liệu mẫu)" },
    { "click": "Chấp nhận lời mời của HLV Đỗ Minh Tuấn" },
    { "expect": "Đã kết nối với HLV Đỗ Minh Tuấn" },
    { "shot": "08-da-ket-noi", "do": "Chấp nhận", "see": "Toast Đã kết nối — HLV chính; Tuấn ở mục HLV chính" },
    { "switch": "HLV Đỗ Minh Tuấn" },
    { "click": "Thông báo", "role": "tab" },
    { "expect": "Phạm Quốc Huy" },
    { "shot": "09-hlv-nhan-thong-bao", "do": "Đổi sang HLV Tuấn → tab Thông báo", "see": "Mới: Phạm Quốc Huy đã chấp nhận lời mời" },
    { "click": "Phạm Quốc Huy đã chấp nhận lời mời", "contains": true },
    { "expect": "Thể lực" },
    { "shot": "10-chi-tiet-hoc-vien", "do": "Chạm thông báo", "see": "Chi tiết học viên Phạm Quốc Huy, 5 tab, nút Huỷ kết nối trên header" },
    { "switch": "Lê Đăng Khoa" },
    { "click": "Cộng đồng", "role": "tab" },
    { "click": "Khám phá", "role": "tab" },
    { "type": "tuấn", "into": "^Tìm" },
    { "click": "HLV Đỗ Minh Tuấn" },
    { "expect": "Gửi yêu cầu kết nối" },
    { "shot": "11-ho-so-hlv", "do": "Đổi sang Lê Đăng Khoa → Cộng đồng → Khám phá → HLV Tuấn", "see": "Hồ sơ HLV + Gửi yêu cầu kết nối; chú thích: HLV duyệt thì thành HLV phụ (Khoa đã có HLV chính)" },
    { "click": "Gửi yêu cầu kết nối" },
    { "expect": "chờ HLV duyệt" },
    { "shot": "12-da-gui-yeu-cau", "do": "Gửi yêu cầu kết nối", "see": "Đã gửi yêu cầu kết nối — chờ HLV duyệt; nút Huỷ yêu cầu" },
    { "switch": "HLV Đỗ Minh Tuấn" },
    { "click": "Lời mời", "role": "tab" },
    { "expect": "Yêu cầu từ học viên" },
    { "shot": "13-hlv-duyet", "do": "Đổi sang HLV Tuấn → Học viên → Lời mời", "see": "Yêu cầu từ học viên: Lê Đăng Khoa (bạn sẽ là HLV phụ) — Duyệt / Từ chối; Mã mời đang chờ ${code}" },
    { "click": "Duyệt yêu cầu của Lê Đăng Khoa" },
    { "expect": "Đã duyệt Lê Đăng Khoa" },
    { "click": "Tất cả", "role": "tab" },
    { "expect": "Lê Đăng Khoa" },
    { "shot": "14-roster-co-khoa", "do": "Duyệt → Tất cả", "see": "Roster có thêm Phạm Quốc Huy và Lê Đăng Khoa" },
    { "switch": "Lê Đăng Khoa" },
    { "click": "HLV", "role": "tab" },
    { "expect": "HLV khác" },
    { "click": "Đặt HLV Đỗ Minh Tuấn làm HLV chính" },
    { "expect": "Đã đặt HLV Đỗ Minh Tuấn làm HLV chính" },
    { "shot": "15-doi-hlv-chinh", "do": "Đổi sang Khoa → tab HLV → Đặt Tuấn làm HLV chính", "see": "Tuấn lên HLV chính, Hà xuống HLV khác" },
    { "click": "Nhập mã mời" },
    { "type": "ABCDEF", "into": "Mã mời" },
    { "click": "Kiểm tra" },
    { "expect": "Mã không tồn tại" },
    { "shot": "16-ma-sai", "do": "Nhập mã mời ABCDEF → Kiểm tra", "see": "Mã không tồn tại, ô đỏ, không tạo kết nối" },
    { "type": "HAEXP1", "into": "Mã mời" },
    { "click": "Kiểm tra" },
    { "expect": "Mã đã hết hạn" },
    { "shot": "17-ma-het-han", "do": "Nhập HAEXP1", "see": "Mã đã hết hạn — xin HLV mã mới" },
    { "type": "USED01", "into": "Mã mời" },
    { "click": "Kiểm tra" },
    { "expect": "Mã đã được sử dụng" },
    { "shot": "18-ma-da-dung", "do": "Nhập USED01", "see": "Mã đã được sử dụng" },
    { "type": "TUAN24", "into": "Mã mời" },
    { "click": "Kiểm tra" },
    { "expect": "Mã đã bị thu hồi" },
    { "shot": "19-ma-thu-hoi", "do": "Nhập TUAN24 (HLV đã thu hồi ở bước 04)", "see": "Mã đã bị thu hồi" },
    { "type": "${code}", "into": "Mã mời" },
    { "click": "Kiểm tra" },
    { "expect": "Bạn đã kết nối với HLV này" },
    { "shot": "20-da-ket-noi-ma", "do": "Nhập mã ${code} của HLV Tuấn", "see": "Bạn đã kết nối với HLV này (Info, ô không đỏ)" },
    { "switch": "HLV Vũ Thanh Hà" },
    { "click": "Lời mời", "role": "tab" },
    { "expect": "Phạm Quốc Huy" },
    { "shot": "21-ha-yeu-cau-mau", "do": "Đổi sang HLV Hà → Học viên → Lời mời", "see": "Yêu cầu từ học viên: Phạm Quốc Huy (dữ liệu mẫu)" },
    { "click": "Mời học viên" },
    { "click": "Tạo mã mời" },
    { "read": "^[A-HJ-NP-Z2-9]{6}$", "as": "codeHa" },
    { "switch": "Phạm Quốc Huy" },
    { "click": "HLV", "role": "tab" },
    { "click": "Nhập mã mời" },
    { "type": "${codeHa}", "into": "Mã mời" },
    { "click": "Kiểm tra" },
    { "expect": "HLV phụ" },
    { "shot": "22-xem-truoc-hlv-phu", "do": "Đổi sang Huy → Nhập mã ${codeHa} của HLV Hà", "see": "Xem trước HLV Hà — Huy đã có HLV chính nên HLV Hà là HLV phụ" },
    { "click": "Chấp nhận kết nối" },
    { "expect": "HLV khác" },
    { "expectNot": "Yêu cầu đã gửi" },
    { "shot": "23-hai-hlv", "do": "Chấp nhận kết nối", "see": "Tuấn chính, Hà ở HLV khác; yêu cầu cũ tới Hà tự đóng (hết mục Yêu cầu đã gửi)" },
    { "switch": "HLV Vũ Thanh Hà" },
    { "click": "Thông báo", "role": "tab" },
    { "expect": "Phạm Quốc Huy đã chấp nhận lời mời" },
    { "shot": "24-ha-nhan-thong-bao", "do": "Đổi sang HLV Hà → tab Thông báo", "see": "Mới: Phạm Quốc Huy đã chấp nhận lời mời (nhập mã của Hà)" },
    { "click": "Học viên", "role": "tab" },
    { "click": "Tất cả", "role": "tab" },
    { "expect": "Phạm Quốc Huy" },
    { "shot": "25-ha-roster-co-huy", "do": "Tab Học viên → Tất cả", "see": "Roster của Hà có Phạm Quốc Huy (Hà là HLV phụ của Huy)" },
    { "switch": "Phạm Quốc Huy" },
    { "click": "HLV", "role": "tab" },
    { "click": "Huỷ kết nối với HLV Vũ Thanh Hà" },
    { "click": "Huỷ kết nối" },
    { "expect": "Đã huỷ kết nối với HLV Vũ Thanh Hà" },
    { "shot": "26-hoc-vien-huy", "do": "Đổi lại Huy → tab HLV → Huỷ kết nối với Hà → xác nhận", "see": "Hà rời danh sách; toast Đã huỷ kết nối" },
    { "switch": "HLV Vũ Thanh Hà" },
    { "expect": "Nguyễn Minh Anh" },
    { "expectNot": "Phạm Quốc Huy" },
    { "shot": "27-ha-roster-mat-huy", "do": "Đổi sang HLV Hà", "see": "Roster của Hà không còn Phạm Quốc Huy — học viên huỷ là HLV mất học viên ngay" },
    { "click": "Thông báo", "role": "tab" },
    { "click": "Phạm Quốc Huy đã chấp nhận lời mời", "contains": true },
    { "expect": "Không có quyền xem" },
    { "shot": "28-ha-mat-quyen-403", "do": "Chạm lại thông báo cũ của Huy", "see": "403 Không có quyền xem — kết nối với học viên này đã bị huỷ" },
    { "switch": "HLV Đỗ Minh Tuấn" },
    { "click": "Phạm Quốc Huy" },
    { "click": "Huỷ kết nối với Phạm Quốc Huy" },
    { "expect": "Huỷ kết nối với Phạm Quốc Huy?" },
    { "shot": "29-hlv-huy-ket-noi", "do": "Đổi sang HLV Tuấn → học viên Huy → nút Huỷ kết nối trên header", "see": "Dialog: mất quyền xem thông số, swing, bộ gậy, thể lực ngay; ghi chú đã gửi vẫn giữ" },
    { "click": "Huỷ kết nối" },
    { "expect": "Không có quyền xem" },
    { "shot": "30-mat-quyen-403", "do": "Xác nhận Huỷ kết nối", "see": "Ngay trên màn: 403 Không có quyền xem — kết nối đã bị huỷ" },
    { "back": true },
    { "expectNot": "Phạm Quốc Huy" },
    { "shot": "31-roster-sau-huy", "do": "Quay lại", "see": "Roster không còn Phạm Quốc Huy" }
  ]
}
```
Tạo `docs/flows/F04.md`:
```markdown
# F4 — Kết nối HLV – học viên

**Tài khoản (đổi ở Hồ sơ › Cài đặt › Dev):** HLV Đỗ Minh Tuấn (`c-tuan`), Phạm Quốc Huy (`p-huy`), Lê Đăng Khoa (`p-khoa`, đã có HLV chính Hà), HLV Vũ Thanh Hà (`c-ha`).
**Bắt đầu:** web `/(coach)/roster?as=c-tuan` · Expo Go: Hồ sơ › Cài đặt › Dev › Kiểm tra theo luồng › F4 · Storybook app (`pnpm storybook:app`,
cổng 6007): sidebar `Luồng/F04 · Kết nối HLV–học viên`, story `nn · …` = bước `nn` dưới đây.
**Chạy lại cả luồng:** `node scripts/flow-web.mjs docs/flows/F04/steps.json` (Metro web + Storybook app đang chạy). Ảnh bước = ảnh story.
**Mã thử:** TUAN24 (còn hạn, bước 04 thu hồi), HAEXP1 (hết hạn), USED01 (đã dùng).

## Các bước
<!-- steps:start -->
<!-- steps:end -->

## Đã sửa trong lượt đi
- Không có.

## Đã biết / chưa làm
- Mã mời vẫn kết nối ngay khi học viên nhập đúng (D5) — không qua bước HLV duyệt; HLV duyệt/từ chối chỉ áp cho yêu cầu học viên gửi trong app.
- Một cặp HLV–học viên chỉ có tối đa 1 kết nối mở (chờ hoặc active); nhập mã của HLV đang mời mình → lời mời chờ tự đóng.
- Từ chối không gửi thông báo cho bên gửi (lời mời chỉ biến khỏi danh sách chờ của họ); HLV huỷ kết nối không báo cho học viên.
- "Gửi" trong ShareSheet của màn Mời học viên vẫn chỉ sao chép/giả lập (Task 14); mời người cụ thể dùng mục "Mời học viên cụ thể".
  Bước "chia sẻ mã" xem ở story `03a · Tạo mã — chia sẻ (ShareSheet)`; lượt CDP không mở sheet (sheet không có nút đóng có nhãn để bấm ra).
- Tìm học viên theo email/SĐT trên dữ liệu mẫu; bản thật nên tìm khớp chính xác để không lộ danh bạ.
- Lỗi mã mời hiện inline, không phải popup; không có lỗi "xung đột HLV active khác" (mâu thuẫn (b), (f) — plan 07/10 thắng).
```

- [ ] **Step 3: Chạy — thấy đỏ**

Theo "Cách chạy một task luồng" bước 3. Expected: `✗ 13 {"type":"huy","into":"Tên, email hoặc số điện thoại"} — không thấy ô …`.
Chưa có mục "Mời học viên cụ thể" nên đây là test đỏ. Bước 1–12 phải ✓; bước nào trước đó đỏ vì chữ màn Task 11 khác thì sửa JSON.

- [ ] **Step 4: `connect/invite.tsx` — mục "Mời học viên cụ thể"**

Import thêm:
- `Avatar`, `SearchField` từ `@gr/ds`;
- `findPlayers` từ `../../lib/selectors`;
- `newId` từ `../../lib/ids` (cạnh `newInvite`);
- `formatValue`, `initials` từ `../../lib/format`;
- `import type { Profile } from '../../lib/domain';`.

Dòng 14 (`const inviteLink = …`) thêm comment ngay trên (phân loại Task 15 #18):
```tsx
// ponytail: link mời giả (chưa có domain / deep link thật) — có backend thì lấy link từ server, mở app bằng universal link.
```
Thêm state cạnh các `useState` khác (trước `if (me?.role !== 'coach')`, dòng 30):
```tsx
  const [query, setQuery] = useState(''); // ô tìm học viên để gửi lời mời trong app
```
Sau dòng `const pending = …`:
```tsx
  const found = findPlayers(state, me.id, query);
  const sendRequest = (p: Profile) => {
    dispatch({ type: 'requestConnection', id: newId('cn'), coachId: me.id, playerId: p.id, by: 'coach', at: NOW, notificationId: newId('nt') });
    notify(`Đã gửi lời mời tới ${p.name}`);
  };
```
Chèn giữa khối thẻ mã (View đầu tiên trong ScrollView) và `<Section title="Lời mời đang chờ" …>`:
```tsx
        <Section title="Mời học viên cụ thể" caption="Tìm theo tên, email hoặc số điện thoại — học viên nhận lời mời ở tab HLV và chọn Chấp nhận / Từ chối">
          <View style={{ paddingHorizontal: t.layout('Margin-Small'), paddingBottom: t.space('Spacing/Padding/XSmall') }}>
            <SearchField placeholder="Tên, email hoặc số điện thoại" value={query} onChangeText={setQuery} />
          </View>
          {query.trim() !== '' &&
            (found.length ? (
              found.map((p) => (
                <ListItem
                  key={p.id}
                  title={p.name}
                  caption={[p.handicap !== undefined && `Handicap ${formatValue(p.handicap)}`, p.homeClub].filter(Boolean).join(' · ') || p.email}
                  leading={
                    <View aria-hidden>
                      <Avatar size="Medium" theme={p.avatarUrl ? 'Photo' : 'Accent'} source={p.avatarUrl ? { uri: p.avatarUrl } : undefined} initials={initials(p.name)} />
                    </View>
                  }
                  trailing={<Button level="Secondary" size="Small" text="Gửi lời mời" accessibilityLabel={`Gửi lời mời kết nối tới ${p.name}`} onPress={() => sendRequest(p)} />}
                  trailingInteractive
                />
              ))
            ) : (
              <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light" style={{ paddingHorizontal: t.layout('Margin-Small') }}>
                Không có người chơi phù hợp — hoặc người đó đã kết nối / đang chờ trả lời lời mời của bạn.
              </Text>
            ))}
        </Section>
```

- [ ] **Step 5: `(player)/coach.tsx` — lời mời từ HLV, yêu cầu đã gửi**

Import thêm:
- `connectionRequests`, `profileById` từ `../../lib/selectors`;
- `relativeTime` từ `../../lib/format`;
- `newId` từ `../../lib/ids`.

Sau dòng `const chevron = …` (dòng 44; `primary`, `notify`, `pad` đã khai báo phía trên; `Avatar`, `ListItem`, `Button`, `initials`, `Section`,
kiểu `CoachConnection` / `Profile` đã import):
```tsx
  const { incoming, outgoing } = connectionRequests(state, me.id);
  const avatar = (p: Profile) => (
    <View aria-hidden>
      <Avatar size="Medium" theme={p.avatarUrl ? 'Photo' : 'Accent'} source={p.avatarUrl ? { uri: p.avatarUrl } : undefined} initials={initials(p.name)} />
    </View>
  );
  // D5 khi kích hoạt: chưa có HLV chính → lời mời nhận lời thành HLV chính, có rồi → HLV phụ (reducer quyết, chữ ở đây chỉ báo trước)
  const becomes = primary ? 'HLV phụ' : 'HLV chính';
  const respond = (c: CoachConnection, accept: boolean) => {
    const name = profileById(state, c.coachId)?.name ?? 'HLV';
    dispatch({ type: 'respondConnection', id: c.id, accept, at: NOW, notificationId: newId('nt') });
    notify(accept ? `Đã kết nối với ${name} — ${becomes}` : `Đã từ chối lời mời của ${name}`);
  };
  const requestRow = (c: CoachConnection, kind: 'incoming' | 'outgoing') => {
    const coach = profileById(state, c.coachId)!;
    const when = relativeTime(c.invitedAt, NOW).toLowerCase();
    return (
      <View key={c.id}>
        <ListItem
          title={coach.name}
          caption={kind === 'incoming' ? `Mời bạn kết nối · ${when} · nhận lời → ${becomes}` : `Bạn gửi yêu cầu · ${when} · chờ HLV duyệt`}
          leading={avatar(coach)}
          trailing={chevron}
          onPress={() => router.push(`/coaches/${coach.id}`)}
        />
        <View style={{ ...pad, flexDirection: 'row', flexWrap: 'wrap', gap: t.space('Spacing/Gap/XSmall'), paddingBottom: t.space('Spacing/Padding/XSmall') }}>
          {kind === 'incoming' ? (
            <>
              <Button size="Small" leadingIcon="user-check-line" text="Chấp nhận" accessibilityLabel={`Chấp nhận lời mời của ${coach.name}`} onPress={() => respond(c, true)} />
              <Button level="Tertiary" size="Small" text="Từ chối" accessibilityLabel={`Từ chối lời mời của ${coach.name}`} onPress={() => respond(c, false)} />
            </>
          ) : (
            <Button
              level="Tertiary"
              size="Small"
              text="Huỷ yêu cầu"
              accessibilityLabel={`Huỷ yêu cầu kết nối với ${coach.name}`}
              onPress={() => {
                dispatch({ type: 'revokeConnection', id: c.id, at: NOW });
                notify(`Đã huỷ yêu cầu gửi ${coach.name}`);
              }}
            />
          )}
        </View>
      </View>
    );
  };
```
Trong `ScrollView`, chèn **trước** `{coaches.length === 0 ? (`:
```tsx
        {incoming.length > 0 && (
          <Section title="Lời mời từ HLV" caption="Nhận lời thì HLV xem được thông số, swing, bộ gậy và thể lực của bạn">
            {incoming.map((c) => requestRow(c, 'incoming'))}
          </Section>
        )}
        {outgoing.length > 0 && (
          <Section title="Yêu cầu đã gửi" caption="Chờ HLV duyệt">
            {outgoing.map((c) => requestRow(c, 'outgoing'))}
          </Section>
        )}
```
Mục "HLV khác" giữ **nguyên** (R1(b): không đụng `isPrimary` / `setPrimaryCoach` / "HLV khác"). Người chơi chưa có HLV thì không còn ngõ cụt:
- `EmptyState` thêm `secondaryText="Tìm HLV"` và `onSecondary={() => router.push('/(player)/community')}`.
- Dưới nút "Nhập mã mời" (nhánh đã có HLV), thêm:
```tsx
          <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light" style={pad}>
            Hoặc tìm HLV ở Cộng đồng › Khám phá rồi gửi yêu cầu kết nối từ hồ sơ HLV.
          </Text>
```

- [ ] **Step 6: `coaches/[id].tsx` — gửi yêu cầu, trả lời lời mời ngay trên hồ sơ HLV**

Import thêm (file hiện chỉ import `EmptyState, Screen, Tag, Text, useTheme` từ DS, `activeCoaches, isBlocked, postsBy, profileById` từ selectors):
- `Button`, `InlineMessage` từ `@gr/ds`;
- `openConnection` từ `../../lib/selectors` (gộp vào import có `isBlocked`);
- `NOW` từ `../../lib/mock`, `newId` từ `../../lib/ids`.

Đổi `const { state, me } = useStore();` thành `const { state, dispatch, me } = useStore();`.

Sau dòng `const posts = …`:
```tsx
  // Người chơi tự tìm HLV: gửi yêu cầu (HLV duyệt ở tab Học viên › Lời mời); HLV đang mời mình → trả lời luôn ở đây
  const canRequest = me.role === 'player' && !myCoach && !isBlocked(state, me.id, coach.id);
  const conn = canRequest ? openConnection(state, coach.id, me.id) : undefined; // chỉ có thể là kết nối đang chờ
  const hasPrimary = activeCoaches(state, me.id).some((c) => c.connection.isPrimary);
  const request = () => dispatch({ type: 'requestConnection', id: newId('cn'), coachId: coach.id, playerId: me.id, by: 'player', at: NOW, notificationId: newId('nt') });
  const respond = (accept: boolean) => conn && dispatch({ type: 'respondConnection', id: conn.id, accept, at: NOW, notificationId: newId('nt') });
```
Chèn ngay sau `View` hàng "người theo dõi + Theo dõi" (dòng 50–55, trong fragment của nhánh không bị chặn, vẫn trong `View` có lề):
```tsx
          {canRequest &&
            (conn?.requestedBy === 'player' ? (
              <View style={{ gap: t.space('Spacing/Gap/XSmall') }}>
                <InlineMessage theme="Info" text="Đã gửi yêu cầu kết nối — chờ HLV duyệt." />
                <Button level="Tertiary" size="Medium (Base)" text="Huỷ yêu cầu" accessibilityLabel={`Huỷ yêu cầu kết nối với ${coach.name}`} onPress={() => dispatch({ type: 'revokeConnection', id: conn.id, at: NOW })} />
              </View>
            ) : conn ? (
              <View style={{ gap: t.space('Spacing/Gap/XSmall') }}>
                <InlineMessage theme="Info" text={`${coach.name} mời bạn kết nối — nhận lời thì là ${hasPrimary ? 'HLV phụ' : 'HLV chính'} của bạn.`} />
                <View style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/Small') }}>
                  <View style={{ flex: 1 }}>
                    <Button size="Medium (Base)" leadingIcon="user-check-line" text="Chấp nhận" accessibilityLabel={`Chấp nhận lời mời của ${coach.name}`} onPress={() => respond(true)} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button level="Tertiary" size="Medium (Base)" text="Từ chối" accessibilityLabel={`Từ chối lời mời của ${coach.name}`} onPress={() => respond(false)} />
                  </View>
                </View>
              </View>
            ) : (
              <View style={{ gap: t.space('Spacing/Gap/XSmall') }}>
                <Button size="Medium (Base)" leadingIcon="user-plus-line" text="Gửi yêu cầu kết nối" onPress={request} />
                <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">
                  {hasPrimary ? 'Bạn đã có HLV chính — HLV này duyệt thì thành HLV phụ.' : 'HLV duyệt thì đây là HLV chính của bạn.'}
                </Text>
              </View>
            ))}
```

- [ ] **Step 7: `(coach)/roster.tsx` — yêu cầu từ học viên, lời mời đã gửi, mở từ thông báo**

File hiện tại: HEAD ebb90f4, 167 dòng (Task 11). Lấy thêm `dispatch` từ `useStore()` (dòng 16). Import thêm:
- `useEffect` từ `react`, `useLocalSearchParams` từ `expo-router`;
- `connectionRequests`, `profileById` từ `../../lib/selectors`;
- `import type { CoachConnection, Profile } from '../../lib/domain';`;
- `newId` từ `../../lib/ids`;
- `Section` từ `../../components/Section`, `SavedToast` từ `../../components/Feedback`.

Thay dòng `const [seg, setSeg] = useState(0);` bằng:
```tsx
  const { seg: segParam, from } = useLocalSearchParams<{ seg?: string; from?: string }>();
  const [seg, setSeg] = useState(segParam === 'loi-moi' ? 2 : 0);
  const [toast, setToast] = useState<{ key: number; title: string }>();
  // Mở từ thông báo "… muốn kết nối với bạn" → mục Lời mời (tab đã mở sẵn thì useState không chạy lại; `from` đổi theo từng thông báo)
  useEffect(() => {
    if (segParam === 'loi-moi') setSeg(2);
  }, [segParam, from]);
```
Sau dòng `const invites = …`:
```tsx
  const { incoming, outgoing } = connectionRequests(state, me.id);
  const waitingCount = invites.length + incoming.length + outgoing.length;
  const notify = (title: string) => setToast((prev) => ({ key: (prev?.key ?? 0) + 1, title }));
  const respond = (c: CoachConnection, p: Profile, accept: boolean) => {
    dispatch({ type: 'respondConnection', id: c.id, accept, at: NOW, notificationId: newId('nt') });
    notify(accept ? `Đã duyệt ${p.name}` : `Đã từ chối yêu cầu của ${p.name}`);
  };
  const requestRow = (c: CoachConnection, kind: 'incoming' | 'outgoing') => {
    const p = profileById(state, c.playerId)!;
    const when = relativeTime(c.invitedAt, NOW).toLowerCase();
    const becomes = state.connections.some((x) => x.playerId === p.id && x.status === 'active' && x.isPrimary) ? 'bạn sẽ là HLV phụ' : 'bạn sẽ là HLV chính';
    return (
      <View key={c.id}>
        <ListItem
          title={p.name}
          caption={kind === 'incoming' ? `Muốn kết nối · ${when} · ${becomes}` : `Bạn mời · ${when} · chờ học viên trả lời`}
          leading={
            <View aria-hidden>
              <Avatar size="Medium" theme={p.avatarUrl ? 'Photo' : 'Accent'} source={p.avatarUrl ? { uri: p.avatarUrl } : undefined} initials={initials(p.name)} />
            </View>
          }
          trailing={chevron}
          onPress={() => router.push(`/users/${p.id}`)}
        />
        <View style={{ ...pad, flexDirection: 'row', flexWrap: 'wrap', gap: t.space('Spacing/Gap/XSmall'), paddingBottom: t.space('Spacing/Padding/XSmall') }}>
          {kind === 'incoming' ? (
            <>
              <Button size="Small" leadingIcon="user-check-line" text="Duyệt" accessibilityLabel={`Duyệt yêu cầu của ${p.name}`} onPress={() => respond(c, p, true)} />
              <Button level="Tertiary" size="Small" text="Từ chối" accessibilityLabel={`Từ chối yêu cầu của ${p.name}`} onPress={() => respond(c, p, false)} />
            </>
          ) : (
            <Button
              level="Tertiary"
              size="Small"
              text="Huỷ lời mời"
              accessibilityLabel={`Huỷ lời mời gửi ${p.name}`}
              onPress={() => {
                dispatch({ type: 'revokeConnection', id: c.id, at: NOW });
                notify(`Đã huỷ lời mời gửi ${p.name}`);
              }}
            />
          )}
        </View>
      </View>
    );
  };
```
Mục `Segmented` "Lời mời": `badge: waitingCount ? String(waitingCount) : undefined`. Thay toàn bộ nhánh `seg === 2 ? (…)` bằng:
```tsx
        {seg === 2 ? (
          <View style={{ gap: t.space('Spacing/Gap/Medium') }}>
            {incoming.length > 0 && (
              <Section title="Yêu cầu từ học viên" caption="Duyệt thì bạn xem được dữ liệu và ghi chú swing cho học viên">
                {incoming.map((c) => requestRow(c, 'incoming'))}
              </Section>
            )}
            {outgoing.length > 0 && (
              <Section title="Lời mời đã gửi" caption="Chờ học viên chấp nhận ở tab HLV">
                {outgoing.map((c) => requestRow(c, 'outgoing'))}
              </Section>
            )}
            <Section title="Mã mời đang chờ" caption={invites.length ? 'Mã còn hạn, chưa có học viên dùng — chạm để sao chép hoặc chia sẻ lại' : undefined}>
              {invites.length
                ? invites.map((i) => (
                    <ListItem
                      key={i.code}
                      title={i.code}
                      caption={`${timeLeft(i.expiresAt, NOW)} · tạo ${formatDate(i.createdAt)}`}
                      accessibilityLabel={`Mã mời ${i.code.split('').join(' ')}, ${timeLeft(i.expiresAt, NOW).toLowerCase()}, tạo ${formatDate(i.createdAt)}`}
                      leading={<Icon name="ticket-01-line" size={t.size('Element-Size/Popular/Base')} color="Color/Content/Neutral/Base" />}
                      trailing={chevron}
                      onPress={() => router.push({ pathname: '/connect/invite', params: { code: i.code } })}
                    />
                  ))
                : note('Chưa có mã mời nào đang chờ.')}
            </Section>
            <View style={pad}>
              <Button size="Medium (Base)" leadingIcon="user-plus-line" text="Mời học viên" onPress={invite} />
            </View>
          </View>
        ) : students.length === 0 ? (
```
(phần còn lại của chuỗi điều kiện giữ nguyên). Trước `</Screen>`:
```tsx
      {toast && <SavedToast key={toast.key} title={toast.title} onDone={() => setToast(undefined)} />}
```

- [ ] **Step 8: `students/[id].tsx` — HLV huỷ kết nối, ra 403 ngay**

Lấy thêm `dispatch` từ `useStore()`. Import thêm:
- `Dialog` từ `@gr/ds`;
- `openConnection` từ `../../lib/selectors`;
- `NOW` từ `../../lib/mock`.

Câu 403 chỉ nói "đã bị huỷ" khi kết nối **từng active**: Phase 2 cũng dùng `revoked` cho lời mời / yêu cầu bị huỷ hoặc tự đóng khi nhập mã, nên
một cặp chưa từng kết nối không được thấy câu đó. Ở cổng quyền (`students/[id].tsx`, dòng `const revoked = …`):
```tsx
    const revoked = state.connections.some((c) => c.coachId === me.id && c.playerId === id && c.status === 'revoked' && c.acceptedAt);
```

Thêm cạnh `const [tab, setTab] = useState(0);`, trước mọi `return`:
```tsx
  const [confirmRevoke, setConfirmRevoke] = useState(false);
```
Sau dòng `const units = …`:
```tsx
  // HLV đang có kết nối active (đã qua cổng canViewPrivate) được tự huỷ kết nối — MVP §5 "Hủy kết nối học viên/HLV"
  const connection = me.role === 'coach' ? openConnection(state, me.id, student.id) : undefined;
```
Ở `StackHeader` của nhánh có quyền, thêm:
```tsx
        actions={connection ? [{ icon: 'user-minus-line', accessibilityLabel: `Huỷ kết nối với ${student.name}`, onPress: () => setConfirmRevoke(true) }] : undefined}
```
Trước `</Screen>` của nhánh có quyền:
```tsx
      <Dialog
        visible={confirmRevoke}
        onRequestClose={() => setConfirmRevoke(false)}
        theme="Warning"
        title={`Huỷ kết nối với ${student.name}?`}
        body="Bạn sẽ mất quyền xem thông số, swing, bộ gậy và thể lực của học viên ngay lập tức. Ghi chú đã gửi vẫn được giữ."
        primaryText="Huỷ kết nối"
        destructive
        onPrimary={() => {
          setConfirmRevoke(false);
          // vẽ lại ngay → nhánh NoAccess "Kết nối … đã bị huỷ" (403) — đúng điều HLV vừa được cảnh báo
          if (connection) dispatch({ type: 'revokeConnection', id: connection.id, at: NOW });
        }}
        secondaryText="Giữ kết nối"
      />
```

- [ ] **Step 9: `NotificationsScreen.tsx` — câu và đích theo vai trò người nhận**

`connect_request` và `invite_accepted` đọc khác nhau giữa người chơi và HLV; Task 13 chỉ có `invite_accepted` gửi HLV (chạm → `/students/<actorId>`),
nên `invite_accepted` gửi người chơi (HLV duyệt yêu cầu) đang mở nhầm `/students/<id HLV>`. Import kiểu: `import type { AppNotification,
NotificationType, Profile, Role } from '../lib/domain';`. Ngay dưới `SENTENCE`:
```tsx
/** Câu cho người nhận vai `role`: HLV nhận "muốn kết nối", người chơi nhận "HLV đã duyệt yêu cầu" (cùng loại, khác chiều). */
const sentenceFor = (n: AppNotification, role?: Role) =>
  n.type === 'connect_request' && role === 'coach' ? 'muốn kết nối với bạn'
  : n.type === 'invite_accepted' && role === 'player' ? 'đã duyệt yêu cầu kết nối của bạn'
  : SENTENCE[n.type];
```
Thay hàm `target` (bản sau Task 16 Step 15):
```tsx
/** Chạm thông báo → swing / hồ sơ người theo dõi / bài viết / học viên / tab HLV / mục Lời mời; thiếu id → chỉ đánh dấu đã đọc. */
function target(n: AppNotification, actor: Profile | undefined, role?: Role): Href | undefined {
  switch (n.type) {
    case 'swing_uploaded':
    case 'coach_note':
    case 'analysis_done':
      return n.refId ? `/swings/${n.refId}` : undefined;
    case 'like':
    case 'comment':
      return n.refId ? `/posts/${n.refId}` : undefined;
    case 'follow':
      return actor ? profileHref(actor) : undefined;
    case 'invite_accepted':
      // HLV: học viên vừa nhận lời → chi tiết học viên; người chơi: HLV vừa duyệt yêu cầu của mình → tab HLV
      return role === 'player' ? '/(player)/coach' : n.actorId ? `/students/${n.actorId}` : undefined;
    case 'connect_request':
      // `from` đổi theo từng thông báo → roster mở lại mục Lời mời kể cả khi tab đã mở sẵn
      return role === 'coach' ? { pathname: '/(coach)/roster', params: { seg: 'loi-moi', from: n.id } } : '/(player)/coach';
  }
}
```
Trong `NotificationRow` (dòng 42, 45, 50) thay 3 dòng:
```tsx
  const { state, dispatch, me } = useStore();
```
```tsx
  const sentence = name ? `${name} ${sentenceFor(n, me?.role)}` : sentenceFor(n, me?.role);
```
```tsx
    const href = target(n, actor, me?.role);
```

- [ ] **Step 10: Story F4 — `storybook-app/flows/F04-ket-noi-hlv.stories.tsx`**

Theo "Cách chạy một task luồng" bước 5. Đầu file (sau import) khai báo các action dựng trạng thái, dùng lại ở nhiều story (id / mã cố định):
```tsx
import { NOW } from '../../apps/golf/lib/mock';

const EXP = '2026-10-14T08:00:00Z';
const INV_TUAN = { type: 'createInvite', invite: { code: 'TUAN77', coachId: 'c-tuan', createdAt: NOW, expiresAt: EXP } } as const; // thay ${code} của lượt CDP
const REVOKE_TUAN24 = { type: 'revokeInvite', code: 'TUAN24' } as const;
const REQ_TUAN_HUY = { type: 'requestConnection', id: 'rq-tuan-huy', coachId: 'c-tuan', playerId: 'p-huy', by: 'coach', at: NOW, notificationId: 'nt-rq-tuan-huy' } as const;
const ACC_TUAN_HUY = { type: 'respondConnection', id: 'rq-tuan-huy', accept: true, at: NOW, notificationId: 'nt-acc-tuan-huy' } as const;
const REQ_KHOA = { type: 'requestConnection', id: 'rq-tuan-khoa', coachId: 'c-tuan', playerId: 'p-khoa', by: 'player', at: NOW, notificationId: 'nt-rq-tuan-khoa' } as const;
const ACC_KHOA = { type: 'respondConnection', id: 'rq-tuan-khoa', accept: true, at: NOW, notificationId: 'nt-acc-tuan-khoa' } as const;
const PRIMARY_KHOA = { type: 'setPrimaryCoach', connectionId: 'rq-tuan-khoa' } as const;
const INV_HA = { type: 'createInvite', invite: { code: 'HAMR27', coachId: 'c-ha', createdAt: NOW, expiresAt: EXP } } as const;
const HUY_NHAP_MA_HA = { type: 'acceptInvite', code: 'HAMR27', playerId: 'p-huy', at: NOW, id: 'cx-ha-huy', notificationId: 'nt-cx-ha-huy' } as const;
const HUY_HUY_HA = { type: 'revokeConnection', id: 'cx-ha-huy', at: NOW } as const;
const TUAN_HUY_HUY = { type: 'revokeConnection', id: 'rq-tuan-huy', at: NOW } as const;
const HUY_HAI_HLV = [REQ_TUAN_HUY, ACC_TUAN_HUY, INV_HA, HUY_NHAP_MA_HA]; // trạng thái sau bước 23
```
**Story theo bước** (export theo quy tắc `B<nn><Slug>`; `tabs` = thanh tab của nhóm; `play` bấm theo nhãn a11y ở mục Interfaces; Dialog tìm bằng
`screen.findByRole('button', { name: … })`):

| nn | Màn (`render`) | `appStory` | `play` |
|---|---|---|---|
| 01 | `(coach)/roster` | `as: 'c-tuan'`, tabs roster | — |
| 02 | `(coach)/roster` | `as: 'c-tuan'`, tabs roster, `params: { seg: 'loi-moi' }` | — |
| 03 | `connect/invite` | `as: 'c-tuan'`, `params: { code: 'TUAN77' }`, `setup: [INV_TUAN]` | — |
| 04 | `connect/invite` | như 03 + `REVOKE_TUAN24` | gõ `huy` vào `Tên, email hoặc số điện thoại` |
| 05 | `connect/invite` | như 04, `hold: ['toast']` | gõ `huy` → `Gửi lời mời kết nối tới Phạm Quốc Huy` |
| 06 | `notifications` | `as: 'p-huy'`, `setup: [REQ_TUAN_HUY]` | — |
| 07 | `(player)/coach` | `as: 'p-huy'`, tabs coach, `setup: [REQ_TUAN_HUY]` | — |
| 08 | `(player)/coach` | như 07, `hold: ['toast']` | `Chấp nhận lời mời của HLV Đỗ Minh Tuấn` |
| 09 | `(coach)/inbox` | `as: 'c-tuan'`, tabs inbox, `setup: [REQ_TUAN_HUY, ACC_TUAN_HUY]` | — |
| 10 | `students/[id]` | `as: 'c-tuan'`, `params: { id: 'p-huy' }`, `setup: [REQ_TUAN_HUY, ACC_TUAN_HUY]` | — |
| 11 | `coaches/[id]` | `as: 'p-khoa'`, `params: { id: 'c-tuan' }` | — |
| 12 | `coaches/[id]` | như 11 + `setup: [REQ_KHOA]` | — |
| 13 | `(coach)/roster` | `as: 'c-tuan'`, tabs roster, `params: { seg: 'loi-moi' }`, `setup: [INV_TUAN, REVOKE_TUAN24, REQ_TUAN_HUY, ACC_TUAN_HUY, REQ_KHOA]` | — |
| 14 | `(coach)/roster` | như 13 (bỏ `params`) + `ACC_KHOA` | — |
| 15 | `(player)/coach` | `as: 'p-khoa'`, tabs coach, `setup: [REQ_KHOA, ACC_KHOA]`, `hold: ['toast']` | `Đặt HLV Đỗ Minh Tuấn làm HLV chính` |
| 16–19 | `connect/accept` | `as: 'p-khoa'`, `setup: [REQ_KHOA, ACC_KHOA, PRIMARY_KHOA]` (19 thêm `REVOKE_TUAN24`) | gõ `ABCDEF` / `HAEXP1` / `USED01` / `TUAN24` vào `Mã mời` → `Kiểm tra` |
| 20 | `connect/accept` | như 16 + `INV_TUAN` | gõ `TUAN77` → `Kiểm tra` |
| 21 | `(coach)/roster` | `as: 'c-ha'`, tabs roster, `params: { seg: 'loi-moi' }` | — |
| 22 | `connect/accept` | `as: 'p-huy'`, `setup: [REQ_TUAN_HUY, ACC_TUAN_HUY, INV_HA]` | gõ `HAMR27` → `Kiểm tra` |
| 23 | `(player)/coach` | `as: 'p-huy'`, tabs coach, `setup: HUY_HAI_HLV` | — |
| 24 | `(coach)/inbox` | `as: 'c-ha'`, tabs inbox, `setup: HUY_HAI_HLV` | — |
| 25 | `(coach)/roster` | `as: 'c-ha'`, tabs roster, `setup: HUY_HAI_HLV` | — |
| 26 | `(player)/coach` | `as: 'p-huy'`, tabs coach, `setup: HUY_HAI_HLV`, `hold: ['toast']` | `Huỷ kết nối với HLV Vũ Thanh Hà` → Dialog `Huỷ kết nối` |
| 27 | `(coach)/roster` | `as: 'c-ha'`, tabs roster, `setup: [...HUY_HAI_HLV, HUY_HUY_HA]` | — |
| 28 | `students/[id]` | `as: 'c-ha'`, `params: { id: 'p-huy' }`, `setup: [...HUY_HAI_HLV, HUY_HUY_HA]` | — |
| 29 | `students/[id]` | `as: 'c-tuan'`, `params: { id: 'p-huy' }`, `setup: [REQ_TUAN_HUY, ACC_TUAN_HUY]` | `Huỷ kết nối với Phạm Quốc Huy` |
| 30 | `students/[id]` | như 29 + `TUAN_HUY_HUY`, không `play` | — |
| 31 | `(coach)/roster` | `as: 'c-tuan'`, tabs roster, `setup: [REQ_TUAN_HUY, ACC_TUAN_HUY, TUAN_HUY_HUY]` | — |

**Biến thể** (story bản dựng Task 15 đổi `name`, giữ export; dòng "mới" là story thêm):

| Biến thể | Nguồn |
|---|---|
| `03a · Tạo mã — chia sẻ (ShareSheet)` | bản dựng `HlvChiaSeMa` |
| `03b · Mời học viên — HLV chưa có mã nào` | bản dựng `HlvChuaCoLoiMoi` |
| `03c · Thu hồi mã — dialog xác nhận` | bản dựng `HlvThuHoiDialog` (bản dựng `HlvDaThuHoi` bỏ: trùng bước 04) |
| `04a · Mời học viên cụ thể — không có kết quả` | mới: như 04, gõ `zzz` |
| `07a · Tab HLV — chưa có HLV (Tìm HLV)` | bản dựng `TabHlvChuaKetNoi` |
| `07b · Tab HLV — đã từ chối lời mời` | mới: như 07, `hold: ['toast']`, bấm `Từ chối lời mời của HLV Đỗ Minh Tuấn` |
| `11a · Hồ sơ HLV — HLV của bạn` | bản dựng `HoSoHlv` |
| `11b · Hồ sơ HLV — HLV đang mời bạn (Chấp nhận / Từ chối)` | mới: `as: 'p-huy'`, `params: { id: 'c-tuan' }`, `setup: [REQ_TUAN_HUY]` |
| `11c · Hồ sơ HLV — không tìm thấy` | bản dựng `HoSoHlvKhongCo` |
| `13a · Lời mời — HLV đã mời, chờ học viên (Huỷ lời mời)` | mới: `as: 'c-tuan'`, `params: { seg: 'loi-moi' }`, `setup: [REQ_TUAN_HUY]` |
| `13b · Lời mời — trống` | mới: `as: 'c-tuan'`, `params: { seg: 'loi-moi' }`, `setup: [REVOKE_TUAN24]` |
| `15a · Tab HLV — HLV chính + HLV khác (dữ liệu mẫu)` | bản dựng `TabHlv` |
| `16a · Nhập mã — để trống` | bản dựng `NhapMaDeTrong` |
| `22a · Xem trước — sẽ là HLV chính` | bản dựng `XemTruocHlvChinh` |
| `23a · Chấp nhận kết nối — toast` | bản dựng `ChapNhanKetNoi`, thêm `hold: ['toast']` |
| `26a · Huỷ kết nối — dialog` | bản dựng `HuyKetNoiDialog` |
| `26b · Đã huỷ HLV chính` | bản dựng `DaHuyHlvChinh` |

Story bản dựng còn lại (`HlvTaoMa`, `HocVienNhapMa`, `NhapMaSai`, `NhapMaHetHan`, `NhapMaDaDung`, `NhapMaDaThuHoi`, `NhapMaDaKetNoi`, `XemTruocHlvPhu`,
`DatLamHlvChinh`, `HlvDaThuHoi`) **xoá**: đã có story bước 03, 16–20, 22, 15, 04 thay. README: điền id F04 cho `connect/invite`, `connect/accept`,
`(player)/coach`, `coaches/[id]`, `(coach)/roster`, `(coach)/inbox`, `notifications`, `students/[id]` ở "Phủ route"; xoá dòng F04 ở "Chưa có (Phase 2)".
`pnpm typecheck` → xanh.

- [ ] **Step 11: Storyboard từ story → chạy lại luồng → xanh; đọc ảnh**

```bash
rm -f docs/flows/F04/*.png
SB_URL=http://localhost:6007 CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node scripts/shot-storybook.mjs docs/flows/F04 '^f04--' 390 844
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/flow-web.mjs docs/flows/F04/steps.json
```
Expected: shot-storybook mọi dòng `ok` (31 story bước + 17 biến thể = 96 ảnh); `PASS F04: 132 bước, 31 bước chụp, 17 story biến thể →
docs/flows/F04.md`; bảng 31 dòng + bảng biến thể nằm giữa 2 dấu. Đọc mọi ảnh trong `docs/flows/F04/` (sáng + tối) và 31 ảnh điểm kiểm
`$TMPDIR/flow-F04/`:
- hàng nút Chấp nhận/Từ chối không tràn ở 390 px;
- caption "nhận lời → HLV chính" không bị cắt;
- màn 403 ở chế độ tối dễ đọc;
- ảnh story bước nn và ảnh điểm kiểm nn cùng màn, cùng trạng thái (khác mỗi mã mời `TUAN77` / mã ngẫu nhiên).

- [ ] **Step 12: Gates**

Run: `pnpm typecheck && pnpm test && pnpm check:literals` → xanh. `pkill -f "expo start"; lsof -ti tcp:6007 | xargs kill`.

- [ ] **Step 13: Commit**

```bash
git add scripts/flow-web.mjs docs/flows/F04.md docs/flows/F04 apps/golf/app/connect/invite.tsx "apps/golf/app/(player)/coach.tsx" "apps/golf/app/coaches/[id].tsx" "apps/golf/app/(coach)/roster.tsx" "apps/golf/app/students/[id].tsx" apps/golf/components/NotificationsScreen.tsx
git add storybook-app/flows/F04-ket-noi-hlv.stories.tsx storybook-app/README.md storybook-app/issues
git commit -m "$(cat <<'EOF'
feat(connect): lời mời 2 chiều (HLV mời / học viên gửi yêu cầu), HLV huỷ kết nối, script đi luồng + storyboard F4

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 18: F8 HLV review swing — Đã review / Chưa review, chèn mốc thời gian, sửa / xoá ghi chú

**Files:**
- Modify: `apps/golf/app/swings/[id].tsx` (workspace: chèn mốc, chip tua theo mốc trong ghi chú, sửa/xoá ghi chú của chính HLV)
- Modify: `apps/golf/app/students/[id].tsx` (tab Swing: Segmented "Chưa review / Đã review" cho HLV)
- Create: `docs/flows/F08.md`, `docs/flows/F08/steps.json`, `docs/flows/F08/<story-id>.<light|dark>.png` (sinh từ story)
- Modify: `storybook-app/flows/F08-hlv-review-swing.stories.tsx`, `storybook-app/README.md`, `storybook-app/issues/*.md`

**Interfaces:**
- Consumes (Task 16):
  - action: `editNote`, `deleteNote`
  - lib: `insertMark(text, sec)`, `noteMarks(text)`, `swingsByReview(s, playerId, coachId)`
  - thông báo `swing_uploaded` (câu + đích đã thêm ở Task 16 Step 15)
- Consumes (Task 17): `scripts/flow-web.mjs`. Consumes (Task 15): `appStory`, `shot-storybook.mjs`, Storybook app 6007.
- Produces (kịch bản sau bấm theo các nhãn này):
  - chip `Chèn mốc <x,x s>`, chip `Tua tới <x,x s>`;
  - nút `Sửa` / `Xoá` dưới ghi chú của chính HLV, nhãn a11y `Sửa ghi chú <Tại …>` / `Xoá ghi chú <Tại …>`;
  - ô ghi chú có placeholder `Sửa ghi chú` khi đang sửa;
  - Segmented `Chưa review` / `Đã review`.

- [ ] **Step 1: Kịch bản — `docs/flows/F08/steps.json`**

```json
{
  "flow": "F08",
  "title": "HLV review swing",
  "account": "Nguyễn Minh Anh",
  "start": "/(player)/swings?as=p-minh",
  "steps": [
    { "click": "Đăng swing" },
    { "click": "Tiếp tục" },
    { "click": "Gậy, chưa chọn" },
    { "click": "Driver" },
    { "click": "Tải lên" },
    { "expect": "Đã tải lên", "timeout": 8000 },
    { "shot": "01-tai-xong", "do": "Minh Anh: Đăng swing → Tiếp tục → video mẫu đầu tiên + gậy Driver → Tải lên", "see": "Đã tải lên 100%; Phân tích ngay / Để sau" },
    { "click": "Phân tích ngay" },
    { "expect": "Gợi ý theo mốc", "timeout": 10000 },
    { "shot": "02-phan-tich-xong", "do": "Phân tích ngay", "see": "Tempo, mặt phẳng swing, 3 gợi ý theo mốc; Chưa có ghi chú từ HLV" },
    { "switch": "HLV Đỗ Minh Tuấn" },
    { "click": "Thông báo", "role": "tab" },
    { "expect": "vừa tải lên swing mới" },
    { "shot": "03-thong-bao-swing-moi", "do": "Đổi sang HLV Tuấn → tab Thông báo", "see": "Mới: Nguyễn Minh Anh vừa tải lên swing mới" },
    { "click": "vừa tải lên swing mới", "contains": true },
    { "expect": "Chèn mốc 0,0 s" },
    { "back": true },
    { "click": "Học viên", "role": "tab" },
    { "click": "Cần phản hồi", "role": "tab" },
    { "expect": "Nguyễn Minh Anh" },
    { "shot": "04-can-phan-hoi", "do": "Chạm thông báo (mở đúng swing) → Quay lại → tab Học viên → Cần phản hồi", "see": "Nguyễn Minh Anh (swing mới đã phân tích, chưa ghi chú) + Trần Thu Lan" },
    { "click": "Nguyễn Minh Anh" },
    { "click": "Swing", "role": "tab" },
    { "expect": "Chưa review" },
    { "shot": "05-swing-chua-review", "do": "Chạm Nguyễn Minh Anh → tab Swing", "see": "Chưa review (2): swing Driver vừa đăng + Gỗ 3 · Đã review (2)" },
    { "click": "Driver", "nth": 0 },
    { "expect": "Chèn mốc 0,0 s" },
    { "shot": "06-workspace", "do": "Chạm swing Driver mới", "see": "Workspace: video 9:16, 4 mốc, gợi ý; chip Chèn mốc 0,0 s + ô ghi chú" },
    { "click": "Đỉnh, 1,3 s" },
    { "click": "Chèn mốc 1,3 s" },
    { "type": "Vai mở sớm ở đầu downswing", "into": "^Ghi chú tại", "append": true },
    { "shot": "07-chen-moc", "do": "Chạm mốc Đỉnh → Chèn mốc 1,3 s → gõ nhận xét", "see": "Ô ghi chú: [1,3 s] Vai mở sớm ở đầu downswing; trợ giúp Ghi chú tại 1,3 s" },
    { "click": "Gửi" },
    { "expect": "Đã gửi ghi chú tại 1,3 s" },
    { "shot": "08-da-gui", "do": "Gửi", "see": "Ghi chú Tại 1,3 s có chip Tua tới 1,3 s, nút Sửa / Xoá; chấm vàng trên timeline" },
    { "click": "Chạm bóng, 1,6 s" },
    { "type": "Tay dẫn trước bóng tốt", "into": "^Ghi chú tại" },
    { "click": "Gửi" },
    { "expect": "Đã gửi ghi chú tại 1,6 s" },
    { "click": "Sửa", "nth": 0 },
    { "expect": "Đang sửa ghi chú" },
    { "type": "[1,3 s] Vai mở sớm — giữ lưng quay về mục tiêu thêm một nhịp", "into": "Sửa ghi chú" },
    { "shot": "09-dang-sua", "do": "Gửi ghi chú thứ hai (1,6 s) → Sửa ghi chú thứ nhất", "see": "Đang sửa ghi chú tại 1,3 s + Huỷ sửa; ô điền nội dung mới" },
    { "click": "Gửi" },
    { "expect": "đã sửa" },
    { "click": "Xoá", "nth": 1 },
    { "expect": "Xoá ghi chú này?" },
    { "shot": "10-xoa-ghi-chu", "do": "Lưu sửa → Xoá ghi chú thứ hai", "see": "Ghi chú 1 có “đã sửa”; Dialog Xoá ghi chú này?" },
    { "click": "Xoá" },
    { "expectNot": "Tay dẫn trước bóng tốt" },
    { "shot": "11-sau-xoa", "do": "Xác nhận Xoá", "see": "Còn 1 ghi chú (đã sửa); trợ giúp Đã xoá ghi chú" },
    { "switch": "HLV Vũ Thanh Hà" },
    { "click": "Nguyễn Minh Anh" },
    { "click": "Swing", "role": "tab" },
    { "expect": "Chưa review" },
    { "shot": "12-ha-chua-review", "do": "Đổi sang HLV Hà (HLV phụ của Minh Anh) → Nguyễn Minh Anh → tab Swing", "see": "Chưa review (4) / Đã review (0) — ghi chú của Tuấn không tính cho Hà" },
    { "click": "Driver", "nth": 0 },
    { "expect": "đã sửa" },
    { "expectNot": "Sửa ghi chú" },
    { "shot": "13-ha-xem-ghi-chu", "do": "Mở swing Driver mới", "see": "Hà thấy ghi chú của Tuấn nhưng không có nút Sửa / Xoá (chỉ tác giả)" },
    { "switch": "Nguyễn Minh Anh" },
    { "click": "Thông báo, ", "contains": true },
    { "expect": "đã ghi chú swing của bạn" },
    { "shot": "14-hoc-vien-nhan-thong-bao", "do": "Đổi sang Minh Anh → chuông", "see": "Mới: HLV Đỗ Minh Tuấn đã ghi chú swing của bạn; Phân tích swing đã xong" },
    { "click": "đã ghi chú swing của bạn", "contains": true, "nth": 0 },
    { "expect": "Ghi chú HLV" },
    { "click": "Tua tới 1,3 s" },
    { "expect": "1,3 s / 4,2 s" },
    { "shot": "15-tua-theo-moc", "do": "Chạm thông báo → chip Tua tới 1,3 s", "see": "Swing Driver hôm nay, video tua tới 1,3 s / 4,2 s; ghi chú (đã sửa)" },
    { "switch": "HLV Đỗ Minh Tuấn" },
    { "click": "Nguyễn Minh Anh" },
    { "click": "Swing", "role": "tab" },
    { "click": "Đã review", "role": "tab" },
    { "expect": "Driver" },
    { "shot": "16-da-review", "do": "Đổi sang HLV Tuấn → Minh Anh → Swing → Đã review", "see": "3 swing Tuấn đã ghi chú, có swing Driver mới" },
    { "click": "Chưa review", "role": "tab" },
    { "expect": "Gỗ 3" },
    { "shot": "17-chua-review", "do": "Chưa review", "see": "Còn swing Gỗ 3 (chưa phân tích) — vẫn là chưa review" }
  ]
}
```
Tạo `docs/flows/F08.md`:
```markdown
# F8 — HLV review swing

**Tài khoản:** Nguyễn Minh Anh (`p-minh`, có HLV chính Tuấn + HLV phụ Hà), HLV Đỗ Minh Tuấn (`c-tuan`), HLV Vũ Thanh Hà (`c-ha`).
**Bắt đầu:** web `/(player)/swings?as=p-minh` · Expo Go: Dev › Kiểm tra theo luồng › F8 · Storybook app: `Luồng/F08 · HLV review swing`.
**Chạy lại:** `node scripts/flow-web.mjs docs/flows/F08/steps.json` (Metro web + Storybook app đang chạy).

## Các bước
<!-- steps:start -->
<!-- steps:end -->

## Đã sửa trong lượt đi
- Không có.

## Đã biết / chưa làm
- "Đã review" tính theo chính HLV đang xem; "Cần phản hồi" ở roster chỉ xét swing đã phân tích (plan Task 2) nên swing chưa phân tích nằm ở "Chưa review" mà không lên "Cần phản hồi".
- Sửa ghi chú không gửi lại thông báo; xoá ghi chú không thu hồi thông báo đã gửi (chạm vẫn mở đúng swing).
- Video là khung giả lập (spec §1): tua tới mốc là đặt vị trí, chưa có khung hình thật.
- Phân tích chỉ chạy khi màn swing đang mở (ponytail Task 9) — người chơi phải ở màn swing ~3 giây sau "Phân tích ngay".
- Thẻ "Ghi chú mới từ HLV" ở Tổng quan mở đúng swing nhưng chưa tự tua tới mốc của ghi chú (gap S3 §4) — học viên bấm chip "Tua tới …" trong swing.
```

- [ ] **Step 2: Chạy — thấy đỏ**

Expected: `✗ 16 {"expect":"Chèn mốc 0,0 s"} — không thấy chữ "Chèn mốc 0,0 s"`. Bước 1–15 phải ✓ (bước 13–15 dựa vào thông báo `swing_uploaded`
của Task 16: câu "… vừa tải lên swing mới", chạm → `/swings/<id>`). Đỏ sớm hơn → sửa theo Task 16 Step 15, không sửa chữ JSON.

- [ ] **Step 3: `swings/[id].tsx` — trạng thái + gửi / sửa ghi chú**

Import thêm:
- `Chip`, `InlineMessage` từ `@gr/ds`;
- `insertMark`, `noteMarks` từ `../../lib/format`.

Trong `SwingView`, thêm cạnh các `useState`:
```tsx
  const [editing, setEditing] = useState<CoachNote>(); // ghi chú của chính HLV đang sửa trong ô dưới cùng
  const [deleting, setDeleting] = useState<CoachNote>(); // giữ ghi chú để Dialog không trống khi mờ dần
  const [confirmNoteDelete, setConfirmNoteDelete] = useState(false);
```
Thay hàm `sendNote` (dòng 237–244):
```tsx
  const sendNote = (text: string) => {
    const body = text.trim();
    if (!body) return setNoteError('Nhập nội dung ghi chú');
    if (editing) {
      dispatch({ type: 'editNote', id: editing.id, coachId: me.id, text: body, at: NOW });
      setEditing(undefined);
      setNote('');
      setSent('Đã lưu ghi chú');
      return;
    }
    // mốc của ghi chú = mốc đầu tiên HLV chèn vào nội dung; không chèn → vị trí đang phát (như Task 9)
    const atSec = noteMarks(body)[0] ?? Math.round(positionSec * 100) / 100;
    dispatch({ type: 'addNote', note: { id: newId('note'), swingId: swing.id, coachId: me.id, atSec, text: body, createdAt: NOW }, notificationId: newId('nt') });
    setNote('');
    setSent(`Đã gửi ghi chú tại ${formatSec(atSec)}`);
  };
  const startEdit = (n: CoachNote) => {
    setEditing(n);
    setNote(n.text);
    setNoteError(undefined);
    setSent(undefined);
  };
  const askDeleteNote = (n: CoachNote) => {
    setDeleting(n);
    setConfirmNoteDelete(true);
  };
```

- [ ] **Step 4: `swings/[id].tsx` — mỗi ghi chú: chip tua theo mốc, Sửa / Xoá cho tác giả**

Trong `<Section title="Ghi chú HLV">` (dòng 370–391), thay thân `notes.map((n) => { … })` bằng:
```tsx
                  ? notes.map((n) => {
                      const author = profileById(state, n.coachId)?.name ?? 'HLV';
                      const when = [n.atSec !== undefined && `Tại ${formatSec(n.atSec)}`, relativeTime(n.createdAt, NOW), n.editedAt && 'đã sửa'].filter(Boolean).join(' · ');
                      const marks = noteMarks(n.text);
                      const mine = coach && n.coachId === me.id; // chỉ tác giả sửa/xoá — reducer cũng chặn người khác và HLV đã mất kết nối
                      return (
                        <View key={n.id}>
                          <SeekRow sec={n.atSec} onSeek={seek} label={`${author}, ${when}: ${n.text}`}>
                            <Avatar size="Small" theme="Accent" initials={initials(author)} />
                            <View style={{ flex: 1, gap: t.space('Spacing/Gap/3XSmall') }}>
                              <Text variant="Body/Base/DemiBold" numberOfLines={1}>{author}</Text>
                              <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">{when}</Text>
                              <Text variant="Body/Base/Regular">{n.text}</Text>
                            </View>
                          </SeekRow>
                          {/* hàng nút nằm ngoài SeekRow: không lồng nút trong nút (web) */}
                          {(marks.length > 0 || mine) && (
                            <View style={[pad, { flexDirection: 'row', flexWrap: 'wrap', gap: t.space('Spacing/Gap/XSmall'), paddingBottom: t.space('Spacing/Padding/XSmall') }]}>
                              {marks.map((m, i) => (
                                <Chip key={`${m}-${i}`} size="XSmall" icon="play-circle-line" text={`Tua tới ${formatSec(m)}`} onPress={() => seek(m)} />
                              ))}
                              {mine && (
                                <>
                                  <Button level="Tertiary" size="XSmall" leadingIcon="edit-02-line" text="Sửa" accessibilityLabel={`Sửa ghi chú ${when}`} onPress={() => startEdit(n)} />
                                  <Button level="Tertiary" size="XSmall" leadingIcon="trash-line" text="Xoá" accessibilityLabel={`Xoá ghi chú ${when}`} onPress={() => askDeleteNote(n)} />
                                </>
                              )}
                            </View>
                          )}
                        </View>
                      );
                    })
```

- [ ] **Step 5: `swings/[id].tsx` — ô ghi chú: Chèn mốc, chế độ sửa, Dialog xoá**

Thay khối `{coach && uploaded && ( … )}` (ô `MessageInput` dưới cùng, dòng 402–421, nằm trong `<KeyboardAvoid>` — giữ `KeyboardAvoid`) bằng:
```tsx
        {coach && uploaded && (
          <>
            <Divider />
            <View style={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/XSmall') }}>
              {editing && (
                <InlineMessage
                  theme="Info"
                  text={`Đang sửa ghi chú${editing.atSec !== undefined ? ` tại ${formatSec(editing.atSec)}` : ''}`}
                  actionText="Huỷ sửa"
                  onAction={() => {
                    setEditing(undefined);
                    setNote('');
                  }}
                />
              )}
              <View style={{ flexDirection: 'row' }}>
                {/* MVP "Nút chèn Timestamp": chèn vị trí đang phát vào nội dung, chạm được để tua ở chip dưới ghi chú */}
                <Chip
                  size="Small"
                  icon="clock-line"
                  text={`Chèn mốc ${formatSec(positionSec)}`}
                  onPress={() => {
                    setNote((v) => insertMark(v, positionSec));
                    setNoteError(undefined);
                    setSent(undefined);
                  }}
                />
              </View>
              <MessageInput
                placeholder={editing ? 'Sửa ghi chú' : `Ghi chú tại ${formatSec(positionSec)}`}
                value={note}
                onChangeText={(v) => {
                  setNote(v);
                  setNoteError(undefined);
                  setSent(undefined);
                }}
                onSend={sendNote}
                maxLength={500}
                error={noteError}
                helpText={sent ?? (note && !editing ? `Ghi chú tại ${formatSec(noteMarks(note)[0] ?? positionSec)}` : undefined)}
              />
            </View>
          </>
        )}
```
Thêm sau Dialog "Xoá swing này?" (dòng 423–442):
```tsx
      <Dialog
        visible={confirmNoteDelete}
        onRequestClose={() => setConfirmNoteDelete(false)}
        theme="Warning"
        title="Xoá ghi chú này?"
        body="Học viên sẽ không còn thấy ghi chú này. Không khôi phục được."
        primaryText="Xoá"
        destructive
        onPrimary={() => {
          setConfirmNoteDelete(false);
          if (!deleting) return;
          dispatch({ type: 'deleteNote', id: deleting.id, coachId: me.id });
          if (editing?.id === deleting.id) {
            setEditing(undefined);
            setNote('');
          }
          setSent('Đã xoá ghi chú');
        }}
        secondaryText="Huỷ"
      />
```
Chữ khi chưa có ghi chú (nhánh `coach`, dòng 388) đổi thành: `'Chưa có ghi chú. Tua tới mốc cần nhận xét, bấm Chèn mốc rồi viết ghi chú ở dưới.'`

- [ ] **Step 6: `students/[id].tsx` — Chưa review / Đã review**

Import thêm `Segmented` từ `@gr/ds` và `swingsByReview` từ `../../lib/selectors`. Thêm cạnh `const [tab, setTab] = useState(0);` (dòng 29,
trước mọi `return`):
```tsx
  const [review, setReview] = useState(0); // tab Swing của HLV: 0 Chưa review, 1 Đã review
```
Thay hàm `swingList` (dòng 117–129):
```tsx
  const swingList = () => {
    if (!swings.length) return empty('Học viên chưa đăng swing nào.');
    if (me.role !== 'coach') {
      return (
        <View style={[pad, { gap: t.space('Spacing/Gap/Small') }]}>
          {swings.map((w) => (
            <SwingCard key={w.id} swing={w} />
          ))}
        </View>
      );
    }
    // MVP "Đã review / Chưa review": theo ghi chú của chính HLV đang xem (swingsByReview)
    const groups = swingsByReview(state, student.id, me.id);
    const list = review === 0 ? groups.unreviewed : groups.reviewed;
    return (
      <View style={[pad, { gap: t.space('Spacing/Gap/Small') }]}>
        <Segmented
          items={[
            { label: 'Chưa review', badge: String(groups.unreviewed.length) },
            { label: 'Đã review', badge: String(groups.reviewed.length) },
          ]}
          selectedIndex={review}
          onChange={setReview}
        />
        <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light">Chạm một swing để xem phân tích, chèn mốc và ghi chú.</Text>
        {list.length ? (
          list.map((w) => <SwingCard key={w.id} swing={w} awaitingFeedback={awaiting.includes(w)} />)
        ) : (
          <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light">
            {review === 0 ? 'Không còn swing nào chờ bạn review.' : 'Bạn chưa ghi chú swing nào của học viên này.'}
          </Text>
        )}
      </View>
    );
  };
```

- [ ] **Step 7: Story F8 — `storybook-app/flows/F08-hlv-review-swing.stories.tsx`**

Theo "Cách chạy một task luồng" bước 5. Giữ helper bản dựng `click`, `typeNote` (gõ ô ghi chú bằng `fireEvent.input` — `userEvent.type` không cập
nhật state của `MessageInput` trong Chrome headless). Khai báo trạng thái dùng chung:
```tsx
import { mockAnalysis } from '../../apps/golf/lib/simulate';

const SW = 'sw-moi';
const MOI = [
  { type: 'addSwing', swing: { id: SW, playerId: 'p-minh', clubId: 'cl-driver', capturedAt: NOW, fileName: 'driver_face_on_60fps.mp4', durationSec: 4.2, cameraView: 'face-on', upload: { status: 'uploading', progress: 0 }, job: { status: 'none', progress: 0 } } },
  { type: 'uploadUpdate', id: SW, status: 'done', progress: 1, at: NOW, notificationId: 'nt-up-moi' }, // báo HLV Tuấn + Hà (swing_uploaded)
  { type: 'jobUpdate', id: SW, status: 'succeeded', progress: 1, analysis: mockAnalysis('driver_face_on_60fps.mp4', 4.2).analysis, at: NOW, notificationId: 'nt-an-moi' },
] as const;
const NOTE_1 = { type: 'addNote', note: { id: 'note-moi-1', swingId: SW, coachId: 'c-tuan', atSec: 1.3, text: '[1,3 s] Vai mở sớm ở đầu downswing', createdAt: NOW }, notificationId: 'nt-note-moi-1' } as const;
const NOTE_2 = { type: 'addNote', note: { id: 'note-moi-2', swingId: SW, coachId: 'c-tuan', atSec: 1.6, text: 'Tay dẫn trước bóng tốt', createdAt: NOW }, notificationId: 'nt-note-moi-2' } as const;
const EDIT_1 = { type: 'editNote', id: 'note-moi-1', coachId: 'c-tuan', text: '[1,3 s] Vai mở sớm — giữ lưng quay về mục tiêu thêm một nhịp', at: NOW } as const;
const DEL_2 = { type: 'deleteNote', id: 'note-moi-2', coachId: 'c-tuan' } as const;
const DA_REVIEW = [...MOI, NOTE_1, EDIT_1]; // trạng thái sau bước 11
```
**Story theo bước:**

| nn | Màn | `appStory` | `play` |
|---|---|---|---|
| 01 | `swings/new` | `as: 'p-minh'` | `Tiếp tục` → `Gậy, chưa chọn` → `Driver` → `Tải lên` → chờ nút `Phân tích ngay` (`findByRole`, timeout 8000) |
| 02 | `swings/[id]` | `as: 'p-minh'`, `params: { id: SW }`, `setup: [...MOI]` | — |
| 03 | `(coach)/inbox` | `as: 'c-tuan'`, tabs inbox, `setup: [...MOI]` | — |
| 04 | `(coach)/roster` | `as: 'c-tuan'`, tabs roster, `setup: [...MOI]` | bấm tab `Cần phản hồi` |
| 05 | `students/[id]` | `as: 'c-tuan'`, `params: { id: 'p-minh' }`, `setup: [...MOI]` | bấm tab `Swing` |
| 06 | `swings/[id]` | `as: 'c-tuan'`, `params: { id: SW }`, `setup: [...MOI]` | — |
| 07 | như 06 | như 06 | `Đỉnh, 1,3 s` → `Chèn mốc 1,3 s` → `typeNote` nối thêm ` Vai mở sớm ở đầu downswing` |
| 08 | như 06 | như 06 | như 07 → `Gửi` |
| 09 | như 06 | `setup: [...MOI, NOTE_1, NOTE_2]` | nút đầu tiên tên bắt đầu `Sửa ghi chú` → `typeIn(await canvas.findByPlaceholderText('Sửa ghi chú'), <nội dung sửa>)` (`typeNote` tìm placeholder `^Ghi chú tại`, không có khi đang sửa) |
| 10 | như 06 | `setup: [...MOI, NOTE_1, NOTE_2, EDIT_1]` | nút tên bắt đầu `Xoá ghi chú Tại 1,6 s` → chờ Dialog `Xoá ghi chú này?` |
| 11 | như 06 | `setup: [...MOI, NOTE_1, NOTE_2, EDIT_1, DEL_2]` | — |
| 12 | `students/[id]` | `as: 'c-ha'`, `params: { id: 'p-minh' }`, `setup: DA_REVIEW` | bấm tab `Swing` |
| 13 | `swings/[id]` | `as: 'c-ha'`, `params: { id: SW }`, `setup: DA_REVIEW` | — |
| 14 | `notifications` | `as: 'p-minh'`, `setup: DA_REVIEW` | — |
| 15 | `swings/[id]` | `as: 'p-minh'`, `params: { id: SW }`, `setup: DA_REVIEW` | `Tua tới 1,3 s` |
| 16 | `students/[id]` | `as: 'c-tuan'`, `params: { id: 'p-minh' }`, `setup: DA_REVIEW` | tab `Swing` → `Đã review` |
| 17 | như 16 | như 16 | tab `Swing` |

Bản dựng: `01 · Học viên — lọc "Cần phản hồi"` → bước 04; `02 · Chi tiết học viên — tab Swing` → 05; `03 · Swing của học viên — ô ghi chú theo
mốc` → 06; `04 · Đã gửi ghi chú` → 08; `05 · Học viên xem ghi chú — bấm mốc` → 15 (đổi export + `name`, thay `setup` theo bảng).
**Biến thể:** `06a · Workspace — swing chưa có ghi chú nào` (bản dựng 03a), `07a · Tua tới mốc Chạm bóng rồi viết` (bản dựng 03b),
`08a · Lỗi — ghi chú trống` (bản dựng 03c), `13a · HLV đã huỷ kết nối — 403` (bản dựng 04a), mới `16a · Đã review — rỗng (HLV phụ chưa ghi chú)`
(`as: 'c-ha'`, `params: { id: 'p-minh' }`, tab `Swing` → `Đã review`). README: id F08 cho `swings/[id]`, `students/[id]`, `(coach)/inbox`,
`notifications`, `swings/new`; xoá dòng F08 ở "Chưa có (Phase 2)". `pnpm typecheck` → xanh.

- [ ] **Step 8: Storyboard từ story → chạy lại luồng → xanh; đọc ảnh**

```bash
rm -f docs/flows/F08/*.png
SB_URL=http://localhost:6007 CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node scripts/shot-storybook.mjs docs/flows/F08 '^f08--' 390 844
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/flow-web.mjs docs/flows/F08/steps.json
```
Expected: mọi dòng `ok` (17 + 5 story = 44 ảnh); `PASS F08: 78 bước, 17 bước chụp, 5 story biến thể`. Đọc mọi ảnh (sáng + tối) và ảnh điểm kiểm:
- chip "Chèn mốc …" và ô ghi chú vừa 390 px khi bàn phím chưa mở;
- hàng "Tua tới · Sửa · Xoá" không chồng lên chữ ghi chú;
- InlineMessage "Đang sửa" dễ đọc ở chế độ tối;
- bước 05: Segmented "Chưa review (2) / Đã review (2)" có badge.

- [ ] **Step 9: Gates**

Run: `pnpm typecheck && pnpm test && pnpm check:literals` → xanh. `pkill -f "expo start"; lsof -ti tcp:6007 | xargs kill`.

- [ ] **Step 10: Commit**

```bash
git add "apps/golf/app/swings/[id].tsx" "apps/golf/app/students/[id].tsx" docs/flows/F08.md docs/flows/F08
git add storybook-app/flows/F08-hlv-review-swing.stories.tsx storybook-app/README.md storybook-app/issues
git commit -m "$(cat <<'EOF'
feat(review): chèn mốc thời gian vào ghi chú, sửa/xoá ghi chú của HLV, swing Đã review / Chưa review + storyboard F8

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 19: F7 Swing của người chơi — lưới/danh sách, lọc/sắp xếp theo ngày, ngày quay, popup file lỗi, thông số gậy

**Files:**
- Modify: `apps/golf/app/(player)/swings.tsx` (Task 11 đã chuyển sang `SwingCard`): Danh sách / Lưới, lọc 7/30 ngày, sắp xếp
- Modify: `apps/golf/components/SwingCard.tsx`: export `swingStatus`
- Modify: `apps/golf/app/swings/new.tsx`: ô Ngày, kiểm file (popup), chú thích dung lượng
- Modify: `apps/golf/app/swings/[id].tsx`: mục "Gậy" có thông số + link chi tiết gậy
- Create: `docs/flows/F07.md`, `docs/flows/F07/steps.json`, `docs/flows/F07/<story-id>.<light|dark>.png` (sinh từ story)
- Modify: `storybook-app/flows/F07-swing.stories.tsx`, `storybook-app/README.md`, `storybook-app/issues/*.md`

**Interfaces:**
- Consumes:
  - Task 16: `filterSwings`, `SwingPeriod`, `videoFileError`, `MAX_VIDEO_MB`, `formatSize`, `SAMPLE_VIDEOS[i].sizeMb/mimeType`
  - có sẵn: `SessionDateField({ value, onChange })` (`components/SessionEntry.tsx`, Task 13 giữ ở đó); video mẫu `pw_may_chu_ban.mp4` (Task 14:
    job phân tích lỗi ở 50 % lần đầu, Thử lại chạy tiếp → xong)
  - Task 15: `appStory`, `shot-storybook.mjs`, Storybook app 6007; Task 17: `scripts/flow-web.mjs`
- Produces:
  - `swingStatus(w: Swing): { text: string; theme: BadgeTheme }` (export từ `SwingCard.tsx`)
  - nhãn: Segmented `Danh sách` / `Lưới`; chip `Tất cả`, `7 ngày`, `30 ngày`, `Mới nhất trước` ⇄ `Cũ nhất trước`
  - popup: `Video quá dung lượng` / `File không phải video` + nút `Chọn video khác`

- [ ] **Step 1: Kịch bản — `docs/flows/F07/steps.json`**

```json
{
  "flow": "F07",
  "title": "Swing của người chơi",
  "account": "Nguyễn Minh Anh",
  "start": "/(player)/swings?as=p-minh",
  "steps": [
    { "expect": "Danh sách" },
    { "shot": "01-danh-sach", "do": "Minh Anh mở tab Swing", "see": "Danh sách / Lưới; chip Tất cả · 7 ngày · 30 ngày; Mới nhất trước; 3 swing mới → cũ" },
    { "click": "Lưới", "role": "tab" },
    { "shot": "02-luoi", "do": "Chọn Lưới", "see": "Lưới 2 cột: thumbnail, gậy, ngày, trạng thái" },
    { "click": "7 ngày" },
    { "expectNot": "Sắt 7" },
    { "click": "Mới nhất trước" },
    { "expect": "Cũ nhất trước" },
    { "shot": "03-loc-sap-xep", "do": "Lọc 7 ngày → đổi sắp xếp", "see": "Còn 2 swing (Driver 05/10, Gỗ 3 06/10), cũ → mới; Sắt 7 (28/09) bị lọc" },
    { "click": "Tất cả" },
    { "click": "Danh sách", "role": "tab" },
    { "click": "Đăng swing" },
    { "expect": "Hướng dẫn quay" },
    { "shot": "04-huong-dan", "do": "Đăng swing", "see": "Bước 1: 60 fps, toàn thân + đầu gậy, góc quay, tránh ngược sáng" },
    { "click": "Tiếp tục" },
    { "click": "swing_4k_120fps_dai.mov" },
    { "expect": "Video quá dung lượng" },
    { "shot": "05-qua-dung-luong", "do": "Chọn swing_4k_120fps_dai.mov", "see": "Popup: nặng 1,5 GB — tối đa 300 MB; Chọn video khác" },
    { "click": "Chọn video khác" },
    { "click": "anh_tu_the_chuan_bi.jpg" },
    { "expect": "File không phải video" },
    { "shot": "06-khong-phai-video", "do": "Chọn anh_tu_the_chuan_bi.jpg", "see": "Popup: là ảnh, chọn video .mp4/.mov" },
    { "click": "Chọn video khác" },
    { "click": "wedge_mang_yeu.mp4" },
    { "click": "Gậy, chưa chọn" },
    { "click": "SW" },
    { "click": "Ngày, 07/10/2026" },
    { "click": ", 5 tháng 10", "contains": true },
    { "expect": "Ngày, 05/10/2026" },
    { "shot": "07-chon-video-gay-ngay", "do": "Chọn wedge_mang_yeu.mp4, gậy SW, ngày 05/10", "see": "Video đã chọn (24 MB · 3,1 s), Gậy SW, Ngày 05/10/2026, góc Face-on" },
    { "click": "Tải lên", "settle": 200 },
    { "click": "Tạm dừng" },
    { "expect": "Đã tạm dừng ở" },
    { "shot": "08-tam-dung", "do": "Tải lên → Tạm dừng", "see": "Đã tạm dừng ở …% + Tiếp tục" },
    { "click": "Tiếp tục" },
    { "expect": "Lỗi tải lên ở 60%", "timeout": 8000 },
    { "shot": "09-loi-mang", "do": "Tiếp tục", "see": "Lỗi tải lên ở 60% + Mất kết nối… + Thử lại" },
    { "click": "Thử lại" },
    { "expect": "Đã tải lên", "timeout": 8000 },
    { "click": "Phân tích ngay" },
    { "expect": "Đang phân tích" },
    { "shot": "10-dang-phan-tich", "do": "Thử lại → Phân tích ngay", "see": "Đang phân tích… thường mất dưới 1 phút" },
    { "expect": "Gợi ý theo mốc", "timeout": 10000 },
    { "shot": "11-phan-tich-xong", "do": "Chờ ~3 giây", "see": "Tempo, mặt phẳng, độ tin cậy, gợi ý theo mốc; mục Gậy: SW · Titleist Vokey SM10, loft 56°" },
    { "click": "Giữ góc cổ tay lâu hơn ở đầu downswing", "contains": true },
    { "expect": "1,3 s / 3,1 s" },
    { "shot": "12-tua-theo-tip", "do": "Chạm gợi ý đầu tiên", "see": "Video tua tới 1,3 s" },
    { "click": "SW · Titleist Vokey SM10", "contains": true },
    { "expect": "Swing gần đây dùng gậy này" },
    { "shot": "13-gay-cua-swing", "do": "Chạm mục Gậy", "see": "Chi tiết gậy SW; swing vừa đăng (05/10) ở Swing gần đây" },
    { "back": true },
    { "click": "Xoá swing" },
    { "expect": "Xoá swing này?" },
    { "shot": "14-xoa-swing", "do": "Quay lại → nút thùng rác trên header", "see": "Dialog Xoá swing này? (video + kết quả phân tích)" },
    { "click": "Xoá" },
    { "expectNot": "SW" },
    { "shot": "15-sau-xoa", "do": "Xoá", "see": "Về danh sách, swing SW không còn" },
    { "click": "Đăng swing" },
    { "click": "Tiếp tục" },
    { "click": "driver_nguoc_sang.mp4" },
    { "click": "Gậy, chưa chọn" },
    { "click": "Driver" },
    { "click": "Tải lên" },
    { "expect": "Đã tải lên", "timeout": 8000 },
    { "click": "Phân tích ngay" },
    { "expect": "Video chưa đủ rõ", "timeout": 10000 },
    { "shot": "16-can-xem-lai", "do": "Đăng driver_nguoc_sang.mp4 → Phân tích ngay", "see": "Cần xem lại: Video chưa đủ rõ — thử quay lại theo hướng dẫn; nút Quay lại hướng dẫn" },
    { "back": true },
    { "click": "Đăng swing" },
    { "click": "Tiếp tục" },
    { "click": "pw_may_chu_ban.mp4" },
    { "click": "Gậy, chưa chọn" },
    { "click": "PW" },
    { "click": "Tải lên" },
    { "expect": "Đã tải lên", "timeout": 8000 },
    { "click": "Phân tích ngay" },
    { "expect": "Phân tích chưa thành công", "timeout": 10000 },
    { "shot": "17-phan-tich-loi", "do": "Quay lại → đăng pw_may_chu_ban.mp4 (gậy PW) → Phân tích ngay", "see": "Phân tích chưa thành công. Video vẫn được giữ — thử lại sau ít phút; nút Thử lại" },
    { "click": "Thử lại" },
    { "expect": "Gợi ý theo mốc", "timeout": 10000 }
  ]
}
```
Nhánh phân tích lỗi dùng video mẫu `pw_may_chu_ban.mp4` của Task 14 (`analysisFailAt: 0.5`); 2 bước cuối chứng minh Thử lại chạy tiếp từ 50 % rồi xong
(không chụp — trạng thái "đã phân tích" đã có ở bước 11).

Tạo `docs/flows/F07.md`:
```markdown
# F7 — Swing của người chơi

**Tài khoản:** Nguyễn Minh Anh (`p-minh`). **Bắt đầu:** web `/(player)/swings?as=p-minh` · Expo Go: Dev › Kiểm tra theo luồng › F7 ·
Storybook app: `Luồng/F07 · Swing của người chơi`.
**Chạy lại:** `node scripts/flow-web.mjs docs/flows/F07/steps.json` (Metro web + Storybook app đang chạy).
**Video mẫu:** driver_face_on_60fps.mp4 (tốt) · sat7_dtl_sang_som.mp4 · wedge_mang_yeu.mp4 (mất mạng ở 60%) · driver_nguoc_sang.mp4 (cần xem lại) · pw_may_chu_ban.mp4 (máy chủ bận: phân tích lỗi ở 50 %, Thử lại chạy tiếp) · swing_4k_120fps_dai.mov (1,5 GB — quá dung lượng) · anh_tu_the_chuan_bi.jpg (không phải video).

## Các bước
<!-- steps:start -->
<!-- steps:end -->

## Đã sửa trong lượt đi
- Không có.

## Đã biết / chưa làm
- Thứ tự bước giữ plan Task 9: chọn video + gậy + góc quay + ngày rồi mới tải lên (MVP "chọn file → progress → form" — mâu thuẫn (d), không làm).
- Chọn video là danh sách mẫu (chưa mở thư viện); giới hạn 300 MB là số tạm, chủ dự án chốt khi có upload thật.
- Lọc theo khoảng 7 / 30 ngày tính tới hôm nay; chưa chọn khoảng ngày tuỳ ý.
- Phân tích và tải lên chỉ chạy khi màn đang mở (ponytail Task 9); rời màn thì dừng, mở lại chạy tiếp.
- Thanh tiến độ của player chỉ để nhìn: chưa tua tự do (kéo / tua từng khung); tua được tới 4 mốc, gợi ý và ghi chú (gap S3 §3). Video thật cần
  `expo-video` — dependency mới, chờ chủ dự án duyệt.
```

- [ ] **Step 2: Chạy — thấy đỏ**

Expected: `✗ 1 {"expect":"Danh sách"} — không thấy chữ "Danh sách"`.

- [ ] **Step 3: `components/SwingCard.tsx` — export trạng thái**

Đổi `const statusOf = …` thành `export const swingStatus = …` (giữ thân hàm), và trong `SwingCard` đổi `statusOf(w)` thành `swingStatus(w)`.

- [ ] **Step 4: `(player)/swings.tsx` — Danh sách / Lưới, lọc, sắp xếp**

File hiện tại (49 dòng, không đổi từ Task 11 — `git log -- "apps/golf/app/(player)/swings.tsx"` dừng ở 7cd1a10). Thay toàn bộ file:
```tsx
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Badge, Button, Card, Chip, EmptyState, Icon, Screen, Segmented, Text, useTheme } from '@gr/ds';
import type { Swing } from '../../lib/domain';
import { NOW } from '../../lib/mock';
import { useStore } from '../../lib/store';
import { clubById, clubLabel, filterSwings, swingsOf, type SwingPeriod } from '../../lib/selectors';
import { formatDate } from '../../lib/format';
import { TabHeader } from '../../components/TabHeader';
import { SwingCard, swingStatus } from '../../components/SwingCard';

const VIEWS = [
  { label: 'Danh sách', icon: 'menu-01-line' as const },
  { label: 'Lưới', icon: 'dots-grid-line' as const },
];
const PERIODS: { key: SwingPeriod; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: '7d', label: '7 ngày' },
  { key: '30d', label: '30 ngày' },
];

/** Ô lưới (chỉ màn này dùng): thumbnail dọc, gậy, ngày, trạng thái; chạm → chi tiết swing. */
function SwingTile({ swing: w }: { swing: Swing }) {
  const t = useTheme();
  const { state } = useStore();
  const club = clubById(state, w.clubId);
  const status = swingStatus(w);
  return (
    <Card theme="Border" spacing="Small" style={{ flex: 1, gap: t.space('Spacing/Gap/2XSmall') }} onPress={() => router.push(`/swings/${w.id}`)}>
      <View
        aria-hidden
        style={{
          width: '100%',
          aspectRatio: 3 / 4,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: t.radius('Corner-Radius/Small'),
          backgroundColor: t.color('Color/Background/Black-Overlay/Pressed'),
        }}
      >
        <Icon name="play-solid" size={t.size('Element-Size/Popular/Medium')} color="Color/Content/On-Dark-Overlay/Strongest" />
      </View>
      <Text variant="Body/Small/DemiBold" numberOfLines={1}>{club ? clubLabel(club) : 'Chưa gắn gậy'}</Text>
      <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">{formatDate(w.capturedAt)}</Text>
      <View style={{ flexDirection: 'row' }}>
        <Badge text={status.text} theme={status.theme} />
      </View>
    </Card>
  );
}

/** Tab Swing: Danh sách / Lưới, lọc theo khoảng ngày (7 / 30 ngày tới hôm nay), sắp xếp theo ngày quay (MVP "My Swings"). */
export default function PlayerSwings() {
  const t = useTheme();
  const { state, me } = useStore();
  const [view, setView] = useState(0);
  const [period, setPeriod] = useState<SwingPeriod>('all');
  const [order, setOrder] = useState<'newest' | 'oldest'>('newest');
  if (!me) return <Redirect href="/" />;
  const all = swingsOf(state, me.id);
  const swings = filterSwings(all, period, order, NOW);
  const post = () => router.push('/swings/new');
  const margin = t.layout('Margin-Small');
  return (
    <Screen edges={['top']}>
      <TabHeader title="Swing" />
      {all.length > 0 ? (
        <>
          <View style={{ paddingHorizontal: margin, paddingBottom: t.space('Spacing/Padding/XSmall'), gap: t.space('Spacing/Gap/Small') }}>
            <Segmented size="Small" items={VIEWS} selectedIndex={view} onChange={setView} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space('Spacing/Gap/XSmall') }}>
              {PERIODS.map((p) => (
                <Chip key={p.key} text={p.label} icon={p.key === 'all' ? undefined : 'calendar-line'} select={period === p.key} onPress={() => setPeriod(p.key)} />
              ))}
              <Chip text={order === 'newest' ? 'Mới nhất trước' : 'Cũ nhất trước'} icon="switch-vertical-01-line" onPress={() => setOrder(order === 'newest' ? 'oldest' : 'newest')} />
            </View>
          </View>
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: margin,
              paddingTop: t.space('Spacing/Padding/XSmall'),
              // chừa chỗ cho nút nổi "Đăng swing"
              paddingBottom: t.size('Button/Size/Medium') + 2 * margin,
              gap: t.space('Spacing/Gap/Small'),
            }}
          >
            {swings.length === 0 ? (
              <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light">
                {`Không có swing nào trong ${PERIODS.find((p) => p.key === period)!.label} qua.`}
              </Text>
            ) : view === 0 ? (
              swings.map((w) => <SwingCard key={w.id} swing={w} />)
            ) : (
              // lưới 2 cột như ClubGrid: hàng lẻ thêm ô trống để ô cuối giữ nửa chiều ngang
              Array.from({ length: Math.ceil(swings.length / 2) }, (_, i) => swings.slice(i * 2, i * 2 + 2)).map((row, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: t.layout('Gutter') }}>
                  {row.map((w) => (
                    <SwingTile key={w.id} swing={w} />
                  ))}
                  {row.length === 1 && <View style={{ flex: 1 }} />}
                </View>
              ))
            )}
          </ScrollView>
          <View style={{ position: 'absolute', right: margin, bottom: margin }}>
            <Button size="Medium (Base)" leadingIcon="video-recorder-line" text="Đăng swing" onPress={post} />
          </View>
        </>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', padding: margin }}>
          <EmptyState
            icon="video-recorder-line"
            title="Chưa có swing nào"
            caption="Quay video swing theo hướng dẫn rồi đăng lên để nhận phân tích ước lượng và ghi chú từ HLV."
            primaryText="Đăng swing"
            onPrimary={post}
          />
        </View>
      )}
    </Screen>
  );
}
```

- [ ] **Step 5: `swings/new.tsx` — ô Ngày, popup file lỗi**

Import thêm:
- `Dialog` từ `@gr/ds`;
- `formatDate`, `formatSize` từ `../../lib/format`;
- `MAX_VIDEO_MB`, `videoFileError` từ `../../lib/validation`;
- `import { SessionDateField } from '../../components/SessionEntry';`.

Thêm state cạnh các `useState` (trước `if (me?.role !== 'player')`):
```tsx
  const [capturedAt, setCapturedAt] = useState(NOW); // MVP: chọn ngày quay; mặc định hôm nay, không chọn được ngày sau hôm nay
  const [rejected, setRejected] = useState<(typeof SAMPLE_VIDEOS)[number]>(); // file vừa bị từ chối (giữ để Dialog không trống khi mờ dần)
  const [rejectOpen, setRejectOpen] = useState(false);
```
Trong `upload` (dòng 47), đổi `capturedAt: NOW` thành `capturedAt`. Trong `SAMPLE_VIDEOS.map` (dòng 130–142), thay `caption` và `onPress` của `ListItem`:
```tsx
                  caption={`${formatSize(v.sizeMb)} · ${v.mimeType.startsWith('video/') ? `${formatSec(v.durationSec)} · ${CAMERA_VIEW_LABELS[v.cameraView]}` : 'Ảnh'}`}
                  selected={i === videoIndex}
                  onPress={() => {
                    // MVP §6 popup lỗi file: file quá dung lượng / không phải video bị từ chối, giữ video đang chọn
                    if (videoFileError(v)) {
                      setRejected(v);
                      setRejectOpen(true);
                      return;
                    }
                    setVideoIndex(i);
                    setView(v.cameraView); // góc quay mặc định theo video, vẫn sửa được bên dưới
                  }}
```
Ngay sau `<ClubPicker … />` ở bước "Chọn video" (dòng 145):
```tsx
          <SessionDateField value={capturedAt} onChange={setCapturedAt} />
```
Thẻ tóm tắt ở bước "Tải lên" (dòng 166): đổi dòng chú thích thành
`{[club && clubLabel(club), CAMERA_VIEW_LABELS[view], formatDate(capturedAt), formatSec(video.durationSec)].filter(Boolean).join(' · ')}`.
Trước `</Screen>`:
```tsx
      <Dialog
        visible={rejectOpen}
        onRequestClose={() => setRejectOpen(false)}
        theme="Negative"
        title={rejected && videoFileError(rejected) === 'too_large' ? 'Video quá dung lượng' : 'File không phải video'}
        body={
          !rejected
            ? ''
            : videoFileError(rejected) === 'too_large'
              ? `${rejected.fileName} nặng ${formatSize(rejected.sizeMb)} — tối đa ${MAX_VIDEO_MB} MB. Cắt ngắn đoạn swing hoặc quay ở 1080p rồi chọn lại.`
              : `${rejected.fileName} là ảnh, không phân tích swing được. Chọn một video (.mp4, .mov).`
        }
        primaryText="Chọn video khác"
        onPrimary={() => setRejectOpen(false)}
      />
```

- [ ] **Step 6: `swings/[id].tsx` — mục "Gậy"**

Import thêm `ListItem` từ `@gr/ds` và `formatValue` từ `../../lib/format` (`Icon`, `router`, `clubLabel` đã có). Trong `SwingView`, đặt ngay **trước**
`<Section title="Phân tích">` (dòng 369):
```tsx
              {club && (
                <Section title="Gậy">
                  {/* MVP "hiển thị thông số gậy": loft, lie, cán, flex; chạm → chi tiết gậy (đã qua cổng quyền nên HLV cũng xem được) */}
                  <ListItem
                    title={`${clubLabel(club)} · ${club.brand} ${club.model}`}
                    caption={[`Loft ${formatValue(club.loftDeg, '°')}`, `Lie ${formatValue(club.lieDeg, '°')}`, club.shaftBrand, club.shaftFlex].join(' · ')}
                    trailing={<Icon name="chevron-right-line-medium" size={t.size('Element-Size/Popular/Base')} color="Color/Content/Neutral/Light" />}
                    onPress={() => router.push(`/clubs/${club.id}`)}
                  />
                </Section>
              )}
```

- [ ] **Step 7: Story F7 — `storybook-app/flows/F07-swing.stories.tsx`**

Theo "Cách chạy một task luồng" bước 5. Giữ fixture bản dựng (`base`, `done`, `SWINGS`, `addSwings`, helper `click`). Thêm swing SW đã phân
tích của bước 11–14:
```tsx
const SW_PHAN_TICH = { type: 'addSwing', swing: { ...base, id: 'sw-sw', clubId: 'cl-sw', capturedAt: '2026-10-05T08:00:00Z', fileName: 'wedge_mang_yeu.mp4', durationSec: 3.1, upload: done, job: { status: 'succeeded', progress: 1 }, analysis: mockAnalysis('wedge_mang_yeu.mp4', 3.1).analysis } } as const;
```
**Story theo bước:**

| nn | Màn | `appStory` | `play` |
|---|---|---|---|
| 01 | `(player)/swings` | `as: 'p-minh'`, tabs swings | — |
| 02 | như 01 | như 01 | bấm tab `Lưới` |
| 03 | như 01 | như 01 | `Lưới` → `7 ngày` → `Mới nhất trước` |
| 04 | `swings/new` | `as: 'p-minh'` | — (bản dựng `03 · Đăng swing — hướng dẫn quay`) |
| 05 | `swings/new` | `as: 'p-minh'` | `Tiếp tục` → `swing_4k_120fps_dai.mov` → chờ Dialog `Video quá dung lượng` |
| 06 | `swings/new` | `as: 'p-minh'` | `Tiếp tục` → `anh_tu_the_chuan_bi.jpg` → chờ Dialog `File không phải video` |
| 07 | `swings/new` | `as: 'p-minh'` | `Tiếp tục` → `wedge_mang_yeu.mp4` → `Gậy, chưa chọn` → `SW` → `Ngày, 07/10/2026` → ô có `, 5 tháng 10` |
| 08 | bản dựng `05a · Tạm dừng tải lên` | giữ | giữ |
| 09 | bản dựng `05b · Lỗi tải lên (mất mạng ở 60 %)` | giữ | giữ |
| 10 | bản dựng `08 · Chi tiết — đang phân tích (40 %)` | giữ | — |
| 11 | `swings/[id]` | `as: 'p-minh'`, `params: { id: 'sw-sw' }`, `setup: [SW_PHAN_TICH]` | — |
| 12 | như 11 | như 11 | bấm gợi ý chứa `Giữ góc cổ tay lâu hơn ở đầu downswing` |
| 13 | `clubs/[id]/index` | `as: 'p-minh'`, `params: { id: 'cl-sw' }`, `setup: [SW_PHAN_TICH]` | — |
| 14 | như 11 | như 11 | `Xoá swing` → chờ Dialog `Xoá swing này?` |
| 15 | `(player)/swings` | `as: 'p-minh'`, tabs swings | — |
| 16 | bản dựng `10 · Chi tiết — cần xem lại` | giữ | — |
| 17 | bản dựng `11 · Chi tiết — lỗi phân tích` | giữ | — |

**Biến thể** (bản dựng đổi `name`): `01a · Danh sách — đủ trạng thái` (bản dựng 01), `01b · Danh sách rỗng` (02), `03a · Lọc 7 ngày — không có
swing` (mới: `setup: [{ type: 'deleteSwing', id: 'sw-minh-3' }, { type: 'deleteSwing', id: 'sw-minh-1' }]`, bấm `7 ngày`), `07a · Chọn gậy — sheet`
(04a), `07b · Lỗi — chưa chọn gậy` (04b), `08a · Đang tải lên (45 %)` (05), `08b · Chi tiết — video tải dở` (06), `09a · Thử lại → tải xong` (05c),
`10a · Chi tiết — chưa phân tích` (07), `15a · Mở swing đã xoá — không tìm thấy` (12a). Bản dựng `04 · Chọn video, gậy, góc quay`, `09 · …đã phân
tích`, `09a · Bấm gợi ý`, `12 · Dialog xoá swing` xoá (bước 07, 11, 12, 14 thay). README: id F07 cho `(player)/swings`, `swings/new`, `swings/[id]`,
`clubs/[id]/index`; xoá dòng F07 ở "Chưa có (Phase 2)". `pnpm typecheck` → xanh.

- [ ] **Step 8: Storyboard từ story → chạy lại luồng → xanh; đọc ảnh**

```bash
rm -f docs/flows/F07/*.png
SB_URL=http://localhost:6007 CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node scripts/shot-storybook.mjs docs/flows/F07 '^f07--' 390 844
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/flow-web.mjs docs/flows/F07/steps.json
```
Expected: mọi dòng `ok` (17 + 10 story = 54 ảnh); `PASS F07: 80 bước, 17 bước chụp, 10 story biến thể`.
Đọc mọi ảnh (sáng + tối) và ảnh điểm kiểm:
- chip lọc xuống dòng gọn ở 390 px;
- ô lưới không méo;
- chữ Dialog không bị cắt;
- chú thích "1,5 GB · 95,0 s · Face-on" hiện đúng; ảnh JPG hiện "2,4 MB · Ảnh".

- [ ] **Step 9: Gates**

Run: `pnpm typecheck && pnpm test && pnpm check:literals` → xanh. `pkill -f "expo start"; lsof -ti tcp:6007 | xargs kill`.

- [ ] **Step 10: Commit**

```bash
git add "apps/golf/app/(player)/swings.tsx" apps/golf/components/SwingCard.tsx apps/golf/app/swings/new.tsx "apps/golf/app/swings/[id].tsx" docs/flows/F07.md docs/flows/F07
git add storybook-app/flows/F07-swing.stories.tsx storybook-app/README.md storybook-app/issues
git commit -m "$(cat <<'EOF'
feat(swings): lưới/danh sách, lọc và sắp xếp theo ngày, chọn ngày quay, popup file quá dung lượng/không phải video, thông số gậy + storyboard F7

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 20: F5 Số liệu — sửa phiên đã lưu, đi hết nhập tay / CSV / OCR / QR → Tổng quan

**Files:**
- Modify: `apps/golf/app/metrics/manual.tsx` (chế độ sửa `?id=`)
- Modify: `apps/golf/app/metrics/[id].tsx` (nút "Sửa phiên", dòng "Đã sửa")
- Modify: `apps/golf/components/charts/TrendChart.tsx`, `apps/golf/components/charts/ConcentricRings.tsx` (phân loại Task 15 #1, #2)
- Create: `docs/flows/F05.md`, `docs/flows/F05/steps.json`, `docs/flows/F05/<story-id>.<light|dark>.png` (sinh từ story)
- Modify: `storybook-app/flows/F05-so-lieu.stories.tsx`, `storybook-app/README.md`, `storybook-app/issues/*.md`

**Interfaces:**
- Consumes (Task 16): action `updateSession`, `swingRaw(m, units)`, `fitnessRaw(m)`, `MetricSession.editedAt`.
- Consumes (Task 15): `appStory` (`hold: ['ocr']`, `['toast']`), `shot-storybook.mjs`; (Task 17): `scripts/flow-web.mjs`.
- Màn Task 14 (0eca209): nhập ảnh có danh sách ảnh mẫu `SAMPLE_PHOTOS` (`ket_qua_may_do.jpg` đọc được, `chup_nghieng_bi_loa.jpg` không đọc được),
  nút `Đọc số liệu`, nhánh lỗi `Không đọc được số liệu` + `Chọn ảnh khác` (thử lại); quét QR có trạng thái "đang liên kết phiên" 1 s trước "Đã liên
  kết phiên TrackMan #A1F3"; form nhập tay bọc `KeyboardAvoid`, lưu xong `backToMetrics`.
- Produces:
  - route `/metrics/manual?id=<sessionId>` = sửa phiên của chính mình;
  - phiên không có hoặc của người khác → chuyển `/metrics/[id]`, nơi màn chi tiết xử lý 404/403.

- [ ] **Step 1: Kịch bản — `docs/flows/F05/steps.json`**

```json
{
  "flow": "F05",
  "title": "Số liệu",
  "account": "Nguyễn Minh Anh",
  "start": "/(player)/home?as=p-minh",
  "steps": [
    { "expect": "Chỉ số swing gần nhất" },
    { "shot": "01-tong-quan-truoc", "do": "Minh Anh mở Tổng quan", "see": "4 chỉ số phiên Gỗ 3 05/10 (chênh lệch so với 19/09), xu hướng Driver 5 buổi, carry 3 gậy" },
    { "click": "Thông số", "role": "tab" },
    { "shot": "02-lich-su", "do": "Tab Thông số", "see": "Lịch sử phiên swing mới → cũ: ngày · gậy, tốc độ · carry, Tag nguồn" },
    { "click": "Nhập số liệu" },
    { "expect": "Chọn nguồn dữ liệu" },
    { "shot": "03-chon-nguon", "do": "Nút +", "see": "Nhập tay · Nhập file CSV · Ảnh chụp màn hình · Quét QR (Thử nghiệm)" },
    { "click": "Nhập tay" },
    { "click": "Lưu" },
    { "expect": "Chưa lưu: 7 trường cần sửa." },
    { "shot": "04-loi-truong", "do": "Nhập tay → Lưu khi để trống", "see": "Gậy + 6 ô báo Bắt buộc; Chưa lưu: 7 trường cần sửa." },
    { "click": "Gậy, chưa chọn" },
    { "click": "Sắt 7" },
    { "type": "85", "into": "Tốc độ đầu gậy (mph)" },
    { "type": "116", "into": "Tốc độ bóng (mph)" },
    { "type": "1,36", "into": "Smash factor" },
    { "type": "6700", "into": "Spin (rpm)" },
    { "type": "17,5", "into": "Góc bắn (°)" },
    { "type": "400", "into": "Carry (m)" },
    { "click": "Lưu" },
    { "expect": "Trong khoảng 10–350 m" },
    { "shot": "05-ngoai-khoang", "do": "Sắt 7 + 6 chỉ số (smash 1,36 kiểu VN), Carry 400 → Lưu", "see": "Carry báo Trong khoảng 10–350 m; chưa lưu" },
    { "type": "150", "into": "Carry (m)" },
    { "click": "Lưu" },
    { "expect": "07/10/2026 · Sắt 7" },
    { "shot": "06-da-luu", "do": "Carry 150 → Lưu", "see": "Về Thông số: dòng 07/10/2026 · Sắt 7 · 85 mph · 150 m đầu danh sách" },
    { "click": "07/10/2026 · Sắt 7" },
    { "expect": "Xoá phiên" },
    { "shot": "07-chi-tiet", "do": "Chạm phiên vừa lưu", "see": "Chi tiết: 6 chỉ số, Nguồn Nhập tay; Sửa phiên / Xoá phiên" },
    { "click": "Sửa phiên" },
    { "type": "152", "into": "Carry (m)" },
    { "type": "abc", "into": "Spin (rpm)" },
    { "click": "Lưu" },
    { "expect": "Không phải số" },
    { "shot": "08-sua-loi", "do": "Sửa phiên: Carry 152, Spin “abc” → Lưu", "see": "Form điền sẵn (gậy Sắt 7, ngày, 1,36); Spin báo Không phải số; phiên chưa đổi" },
    { "type": "6650", "into": "Spin (rpm)" },
    { "click": "Lưu" },
    { "expect": "152 m" },
    { "expect": "Đã sửa" },
    { "shot": "09-sau-sua", "do": "Spin 6650 → Lưu", "see": "Chi tiết: Carry 152 m, Spin 6650 rpm, dòng Đã sửa 07/10/2026" },
    { "back": true },
    { "click": "Thể lực", "role": "tab" },
    { "expect": "04/10/2026" },
    { "shot": "10-the-luc", "do": "Quay lại → segment Thể lực", "see": "Lịch sử phiên thể lực: 04/10/2026, 05/09/2026 — cân nặng, độ dẻo, lực nắm, bật cao" },
    { "click": "04/10/2026" },
    { "expect": "Phiên thể lực" },
    { "click": "Sửa phiên" },
    { "type": "71,5", "into": "Cân nặng (kg)" },
    { "click": "Lưu" },
    { "expect": "71,5 kg" },
    { "expect": "Đã sửa" },
    { "shot": "11-the-luc-sau-sua", "do": "Mở phiên 04/10 → Sửa phiên → Cân nặng 71,5 → Lưu", "see": "Phiên thể lực: Cân nặng 71,5 kg, dòng Đã sửa 07/10/2026" },
    { "back": true },
    { "click": "Swing", "role": "tab" },
    { "click": "Nhập số liệu" },
    { "click": "Nhập file CSV" },
    { "click": "TrackMan_Session_2026-10-05.csv" },
    { "expect": "4 dòng hợp lệ · 1 dòng lỗi (bỏ qua)" },
    { "shot": "12-csv-xem-truoc", "do": "+ → Nhập file CSV → file TrackMan", "see": "Hãng TrackMan; 4 dòng hợp lệ · 1 dòng lỗi (Tốc độ đầu gậy: Bắt buộc)" },
    { "click": "Tiếp tục" },
    { "expect": "Cột Club trong file: Driver" },
    { "click": "Nhập 4 phiên" },
    { "expect": "Đã nhập 4 phiên" },
    { "shot": "13-csv-da-nhap", "do": "Tiếp tục → Nhập 4 phiên (gậy Driver gợi ý từ cột Club)", "see": "Toast Đã nhập 4 phiên · TrackMan · ngày 07/10/2026" },
    { "click": "Nhập số liệu" },
    { "click": "Ảnh chụp màn hình" },
    { "click": "chup_nghieng_bi_loa.jpg" },
    { "click": "Đọc số liệu" },
    { "expect": "Đang đọc" },
    { "shot": "14-ocr-dang-doc", "do": "+ → Ảnh chụp màn hình → ảnh mẫu chup_nghieng_bi_loa.jpg → Đọc số liệu", "see": "Đang đọc… + Huỷ" },
    { "expect": "Không đọc được số liệu", "timeout": 6000 },
    { "shot": "15-ocr-loi", "do": "Chờ 1,5 giây", "see": "Không đọc được số liệu — ảnh mờ hoặc bị loá; nút Chọn ảnh khác" },
    { "click": "Chọn ảnh khác" },
    { "click": "ket_qua_may_do.jpg" },
    { "click": "Đọc số liệu" },
    { "expect": "trường độ tin cậy thấp", "timeout": 6000 },
    { "shot": "16-ocr-kiem-tra", "do": "Chọn ảnh khác → ket_qua_may_do.jpg → Đọc số liệu (thử lại)", "see": "Điền sẵn 6 chỉ số; Spin “2B10” cảnh báo độ tin cậy thấp + lỗi Không phải số" },
    { "type": "2610", "into": "Spin (rpm)" },
    { "click": "Gậy, chưa chọn" },
    { "click": "Driver" },
    { "click": "Lưu" },
    { "expect": "Đã lưu" },
    { "click": "Nhập số liệu" },
    { "click": "Quét QR" },
    { "click": "Mô phỏng quét thành công" },
    { "expect": "Đã liên kết phiên TrackMan #A1F3" },
    { "shot": "17-qr", "do": "+ → Quét QR (Thử nghiệm) → Mô phỏng quét thành công", "see": "Đã liên kết phiên TrackMan #A1F3 + Nhập dữ liệu phiên" },
    { "click": "Nhập dữ liệu phiên" },
    { "expect": "4 dòng hợp lệ" },
    { "back": true },
    { "click": "Hồ sơ của tôi" },
    { "click": "Cài đặt", "role": "button" },
    { "click": "Đơn vị đo" },
    { "click": "Yard" },
    { "back": true },
    { "back": true },
    { "back": true },
    { "expect": "yd" },
    { "shot": "18-yard-lich-su", "do": "Nhập dữ liệu phiên → xem trước → quay lại; Hồ sơ › Cài đặt › Đơn vị đo › Yard → quay lại Thông số", "see": "Carry hiện yard (vd 07/10 Sắt 7: 166 yd)" },
    { "click": "07/10/2026 · Sắt 7" },
    { "click": "Xoá phiên" },
    { "expect": "Xoá phiên này?" },
    { "click": "Xoá" },
    { "expectNot": "07/10/2026 · Sắt 7" },
    { "shot": "19-sau-xoa", "do": "Mở phiên Sắt 7 → Xoá phiên → Xoá", "see": "Về danh sách, phiên Sắt 7 không còn" },
    { "click": "Tổng quan", "role": "tab" },
    { "expect": "yd" },
    { "shot": "20-tong-quan-sau", "do": "Tab Tổng quan", "see": "Chỉ số mới nhất = phiên Driver hôm nay (ảnh OCR), chênh lệch so với 30/09, carry theo yard, xu hướng Driver cập nhật" }
  ]
}
```
Tạo `docs/flows/F05.md`:
```markdown
# F5 — Số liệu

**Tài khoản:** Nguyễn Minh Anh (`p-minh`). **Bắt đầu:** web `/(player)/home?as=p-minh` · Expo Go: Dev › Kiểm tra theo luồng › F5 ·
Storybook app: `Luồng/F05 · Số liệu`.
**Chạy lại:** `node scripts/flow-web.mjs docs/flows/F05/steps.json` (Metro web + Storybook app đang chạy). **Ảnh mẫu (nhập ảnh):**
ket_qua_may_do.jpg (đọc được), chup_nghieng_bi_loa.jpg (không đọc được → Chọn ảnh khác). **File mẫu:** TrackMan_Session_2026-10-05.csv (4 dòng hợp lệ + 1 dòng lỗi), FSX_Export_7i.csv (Foresight), Ghi_chep_tu_nhap.csv (không nhận diện).

## Các bước
<!-- steps:start -->
<!-- steps:end -->

## Đã sửa trong lượt đi
- Không có.

## Đã biết / chưa làm
- 1 dòng CSV = 1 phiên (plan Task 7): sau khi nhập file, "5 buổi" ở biểu đồ có thể là nhiều cú cùng ngày.
- "Direction / Hướng–Lệch" không làm — không vừa bộ 6 trường bắt buộc của CSV/OCR/form (xem bảng "Không làm" trong plan Phase 2).
- Sửa phiên nhập từ CSV/ảnh thay giá trị đang lưu; "Dữ liệu gốc" hiện số hiện tại kèm dòng "Đã sửa" (bản mock không giữ bản gốc).
- Tốc độ luôn mph; chỉ khoảng cách đổi m ↔ yd (D9 — hệ Imperial đầy đủ không làm).
- Sửa phiên khi đang xem yard: carry điền sẵn làm tròn 0,1 yd; với carry sát biên (vd 10 m → "10,9" yd, dưới mức tối thiểu 11 yd) lưu lại báo
  lỗi ô Carry dù không sửa ô đó — hiếm, ghi nhận, chưa sửa (sửa: kẹp giá trị vào khoảng ở `swingRaw`).
```

- [ ] **Step 2: Chạy — thấy đỏ**

Expected: `✗ 30 {"click":"Sửa phiên"} — không thấy "Sửa phiên"`. Bước 1–29 ✓, đây là phần đã có từ Task 6/7.

- [ ] **Step 3: `metrics/manual.tsx` — chế độ sửa**

Thay toàn bộ file (bản hiện tại 84 dòng: `KeyboardAvoid`, `backToMetrics` của Task 13/14 giữ nguyên). Nhập mới giữ nguyên hành vi; `?id=` mở
chế độ sửa:
```tsx
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { Button, Divider, Screen, Segmented, useTheme } from '@gr/ds';
import type { FitnessMetrics, ID, MetricSession, SwingMetrics } from '../../lib/domain';
import { NOW } from '../../lib/mock';
import { newId } from '../../lib/ids';
import { useStore } from '../../lib/store';
import { prefsOf } from '../../lib/selectors';
import { formatDate } from '../../lib/format';
import { FITNESS_FIELDS, fitnessRaw, swingRaw, validateFitnessMetrics, validateSwingMetrics, type Raw } from '../../lib/validation';
import { StackHeader } from '../../components/StackHeader';
import { ClubPicker } from '../../components/ClubPicker';
import { MetricFields, SwingMetricsForm } from '../../components/SwingMetricsForm';
import { AlertMessage, SavedToast } from '../../components/Feedback';
import { backToMetrics, SessionDateField } from '../../components/SessionEntry';
import { KeyboardAvoid } from '../../components/KeyboardAvoid';

const KINDS = [{ label: 'Swing' }, { label: 'Thể lực' }];
const EMPTY_SWING: Raw<keyof SwingMetrics> = { clubSpeedMph: '', ballSpeedMph: '', smash: '', spinRpm: '', launchDeg: '', carryM: '' };
const EMPTY_FITNESS: Raw<keyof FitnessMetrics> = { weightKg: '', flexibility: '', gripStrengthKg: '', verticalJumpCm: '' };

/** Nhập tay một phiên. `?id=<phiên>` = sửa phiên đã lưu (MVP "Form Thêm/Chỉnh sửa Metrics"): điền sẵn theo đơn vị hiển thị
 *  (carry yard khi imperial — swingRaw), khoá loại phiên, lưu bằng updateSession (giữ nguồn/hãng, gắn editedAt). */
export default function MetricsManual() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  const { kind, id } = useLocalSearchParams<{ kind?: string; id?: string }>();
  const editing = id ? state.sessions.find((x) => x.id === id) : undefined;
  const units = me ? prefsOf(state, me.id).units : 'metric';
  const [tab, setTab] = useState(editing ? (editing.kind === 'fitness' ? 1 : 0) : kind === 'fitness' ? 1 : 0);
  const [capturedAt, setCapturedAt] = useState(editing?.capturedAt ?? NOW);
  const [clubId, setClubId] = useState<ID | undefined>(editing?.clubId);
  const [swing, setSwing] = useState(() => (editing?.kind === 'swing' ? swingRaw(editing.swing, units) : EMPTY_SWING));
  const [fitness, setFitness] = useState(() => (editing?.kind === 'fitness' ? fitnessRaw(editing.fitness) : EMPTY_FITNESS));
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState<string>(); // chú thích Toast, chốt lúc lưu
  if (me?.role !== 'player') return <Redirect href="/" />;
  // phiên không có / của người khác → màn chi tiết xử lý 404 / 403 (cùng cách clubs/[id]/edit)
  if (id && (!editing || editing.playerId !== me.id)) return <Redirect href={{ pathname: '/metrics/[id]', params: { id } }} />;
  const isSwing = tab === 0;
  const swingResult = validateSwingMetrics(swing, units);
  const fitnessResult = validateFitnessMetrics(fitness);
  const invalid = isSwing ? Object.keys(swingResult.errors).length + (clubId ? 0 : 1) : Object.keys(fitnessResult.errors).length;
  const save = () => {
    setSubmitted(true);
    const base = editing ?? { id: newId('ss'), playerId: me.id, source: 'manual' as const };
    let session: MetricSession;
    if (isSwing) {
      if (!swingResult.value || !clubId) return;
      session = { ...base, capturedAt, kind: 'swing', clubId, swing: swingResult.value };
    } else {
      if (!fitnessResult.value) return;
      session = { ...base, capturedAt, kind: 'fitness', fitness: fitnessResult.value };
    }
    dispatch(editing ? { type: 'updateSession', session, at: NOW } : { type: 'addSession', session });
    setSaved(`Phiên ${isSwing ? 'swing' : 'thể lực'} ngày ${formatDate(capturedAt)}`);
  };
  return (
    <Screen>
      <StackHeader title={editing ? 'Sửa phiên' : 'Nhập tay'} />
      <KeyboardAvoid>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
          {!editing && (
            <Segmented
              items={KINDS}
              selectedIndex={tab}
              onChange={(i) => {
                setTab(i);
                setSubmitted(false);
              }}
            />
          )}
          <SessionDateField value={capturedAt} onChange={setCapturedAt} />
          {isSwing ? (
            <>
              <ClubPicker playerId={me.id} value={clubId} onChange={setClubId} error={submitted && !clubId ? 'Bắt buộc' : undefined} />
              <SwingMetricsForm values={swing} onChange={setSwing} errors={submitted ? swingResult.errors : {}} />
            </>
          ) : (
            <MetricFields fields={FITNESS_FIELDS} values={fitness} onChange={setFitness} errors={submitted ? fitnessResult.errors : {}} />
          )}
        </ScrollView>
        <Divider />
        <View style={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Small') }}>
          {submitted && invalid > 0 && <AlertMessage theme="Negative" text={`Chưa lưu: ${invalid} trường cần sửa.`} />}
          <Button text="Lưu" disabled={!!saved} onPress={save} />
        </View>
      </KeyboardAvoid>
      {saved && <SavedToast title={editing ? 'Đã lưu thay đổi' : 'Đã lưu'} caption={saved} onDone={backToMetrics} />}
    </Screen>
  );
}
```
Sửa xong quay lại màn trước (chi tiết phiên) nhờ `backToMetrics` (`router.back()` khi có lịch sử).

- [ ] **Step 4: `metrics/[id].tsx` — nút Sửa phiên, dòng Đã sửa**

Trong mảng `info` (dòng 45–49), thêm cuối:
```tsx
    ...(session.editedAt ? [{ label: 'Đã sửa', value: formatDate(session.editedAt) }] : []),
```
Thay khối nút của chủ phiên (`session.playerId === me.id`, dòng 85–89) bằng:
```tsx
        {session.playerId === me.id && (
          <View style={{ paddingHorizontal: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Small') }}>
            <Button level="Secondary" size="Medium (Base)" leadingIcon="edit-02-line" text="Sửa phiên" onPress={() => router.push({ pathname: '/metrics/manual', params: { id: session.id } })} />
            <Button level="Danger Subtle" size="Medium (Base)" leadingIcon="trash-line" text="Xoá phiên" onPress={() => setConfirmDelete(true)} />
          </View>
        )}
```
(Dialog xoá và cách xoá "rời màn rồi mới xoá" của Task 14 giữ nguyên.)

- [ ] **Step 4b: Biểu đồ dưới 2 buổi / 1 gậy (phân loại Task 15 #1, #2)**

Sửa ở component (một chỗ cho cả Tổng quan và tab Tổng quan của chi tiết học viên):
1. `apps/golf/components/charts/TrendChart.tsx`: dòng `if (!data.length) return null;` (sau `useState`) thành
```tsx
  // 1 buổi chưa phải xu hướng: chữ thay biểu đồ một điểm (caller tự xử lý 0 buổi)
  if (data.length < 2) return <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light">Cần ít nhất 2 buổi để thấy xu hướng.</Text>;
```
2. `apps/golf/components/charts/ConcentricRings.tsx`: 1 gậy → vòng tròn duy nhất thành một đĩa đặc to; bọc `<Svg>…</Svg>` (dòng 17–21) bằng
   `{rings.length > 1 && ( … )}` — 1 gậy chỉ còn hàng chú giải (tên gậy + carry).
Kiểm: story `f01--tong-quan-co-du-lieu` (người chơi mới, 1 buổi Driver) chụp lại 390 844 → khung xu hướng hiện câu "Cần ít nhất 2 buổi…", mục
Carry theo gậy chỉ có hàng "Driver · 195 m"; `f05--tong-quan` không đổi.

- [ ] **Step 5: Story F5 — `storybook-app/flows/F05-so-lieu.stories.tsx`**

Theo "Cách chạy một task luồng" bước 5. Trạng thái dùng chung:
```tsx
const SAT7 = { type: 'addSession', session: { id: 'ss-sb-sat7', playerId: 'p-minh', capturedAt: NOW, source: 'manual', clubId: 'cl-iron7', kind: 'swing', swing: { clubSpeedMph: 85, ballSpeedMph: 116, smash: 1.36, spinRpm: 6700, launchDeg: 17.5, carryM: 150 } } } as const;
const SAT7_SUA = { type: 'updateSession', session: { ...SAT7.session, swing: { ...SAT7.session.swing, carryM: 152, spinRpm: 6650 } }, at: NOW } as const;
const THE_LUC_SUA = { type: 'updateSession', session: { id: 'ss-f2', playerId: 'p-minh', capturedAt: '2026-10-04T01:00:00Z', source: 'manual', kind: 'fitness', fitness: { weightKg: 71.5, flexibility: 7, gripStrengthKg: 45, verticalJumpCm: 48 } }, at: NOW } as const;
const OCR = { type: 'addSession', session: { id: 'ss-sb-ocr', playerId: 'p-minh', capturedAt: NOW, source: 'photo', vendor: 'trackman', clubId: 'cl-driver', kind: 'swing', swing: { clubSpeedMph: 104.8, ballSpeedMph: 153.2, smash: 1.46, spinRpm: 2610, launchDeg: 12.1, carryM: 231 } } } as const;
const YARD = { type: 'setPrefs', userId: 'p-minh', patch: { units: 'imperial' } } as const;
```
**Story theo bước** (`tabs` khi màn thuộc nhóm tab):

| nn | Màn | `appStory` | `play` |
|---|---|---|---|
| 01 | `(player)/home` | `as: 'p-minh'`, tabs home | — (bản dựng `08 · Tổng quan`) |
| 02 | `(player)/metrics` | `as: 'p-minh'`, tabs metrics | — (bản dựng `06 · Danh sách Swing`) |
| 03 | `metrics/add` | `as: 'p-minh'` | — (bản dựng `01 · Chọn nguồn`) |
| 04 | `metrics/manual` | `as: 'p-minh'` | `Lưu` (bản dựng `02a`) |
| 05 | `metrics/manual` | `as: 'p-minh'` | `Gậy, chưa chọn` → `Sắt 7` → gõ 85 / 116 / 1,36 / 6700 / 17,5 / 400 vào 6 ô → `Lưu` |
| 06 | `(player)/metrics` | `as: 'p-minh'`, tabs metrics, `setup: [SAT7]` | — |
| 07 | `metrics/[id]` | `as: 'p-minh'`, `params: { id: 'ss-sb-sat7' }`, `setup: [SAT7]` | — |
| 08 | `metrics/manual` | `as: 'p-minh'`, `params: { id: 'ss-sb-sat7' }`, `setup: [SAT7]` | gõ `152` vào `Carry (m)`, `abc` vào `Spin (rpm)` → `Lưu` |
| 09 | `metrics/[id]` | như 07 + `SAT7_SUA` | — |
| 10 | `(player)/metrics` | `as: 'p-minh'`, tabs metrics, `setup: [SAT7, SAT7_SUA]` | bấm tab `Thể lực` (bản dựng `06a`) |
| 11 | `metrics/[id]` | `as: 'p-minh'`, `params: { id: 'ss-f2' }`, `setup: [THE_LUC_SUA]` | — |
| 12 | `metrics/import-csv` | `as: 'p-minh'` | chọn `TrackMan_Session_2026-10-05.csv` (bản dựng `03a`) |
| 13 | `metrics/import-csv` | `as: 'p-minh'`, `hold: ['toast']` | như 12 → `Tiếp tục` → `Nhập 4 phiên` (bản dựng `03d`) |
| 14 | `metrics/import-photo` | `as: 'p-minh'`, `hold: ['ocr']` | `chup_nghieng_bi_loa.jpg` → `Đọc số liệu` (bản dựng `04a`: bỏ `beforeEach: ocrTimer('never')`, thay bằng `hold: ['ocr']`) |
| 15 | `metrics/import-photo` | `as: 'p-minh'` | — (bản dựng `04c · Ảnh — không đọc được (ảnh mờ)`) |
| 16 | `metrics/import-photo` | `as: 'p-minh'` | `ket_qua_may_do.jpg` → `Đọc số liệu` → chờ `trường độ tin cậy thấp` (bản dựng `04b`) |
| 17 | `metrics/scan-qr` | `as: 'p-minh'` | `Mô phỏng quét thành công` (bản dựng `05a`) |
| 18 | `(player)/metrics` | `as: 'p-minh'`, tabs metrics, `setup: [SAT7, SAT7_SUA, YARD]` | — |
| 19 | `(player)/metrics` | như 18 + `{ type: 'deleteSession', id: 'ss-sb-sat7' }` | — |
| 20 | `(player)/home` | `as: 'p-minh'`, tabs home, `setup: [OCR, YARD]` | — |

**Biến thể** (bản dựng đổi `name`): `02a · Danh sách rỗng` (06b), `03a · Nhập tay — swing trống` (02), `04a · Nhập tay — thể lực` (02c),
`04b · Nhập tay — carry theo yard` (02d), `06a · Nhập tay — đang lưu toast` (02b, thêm `hold: ['toast']`), `07a · Chi tiết — dialog xoá phiên` (07b),
`07b · Chi tiết — HLV xem (chỉ đọc)` (07c), `07c · Chi tiết — 403` (07d), `07d · Chi tiết — không tìm thấy` (07e), mới `08a · Sửa phiên — theo yard`
(`setup: [SAT7, YARD]`, `params: { id: 'ss-sb-sat7' }`: ô `Carry (yd)` điền sẵn theo yard), mới `11a · Sửa phiên thể lực — điền sẵn` (`metrics/manual`,
`params: { id: 'ss-f2' }`), `12a · CSV — chọn file` (03), `12b · CSV — file lạ` (03b), `13a · CSV — xác nhận gậy và ngày` (03c), `13b · CSV — xác nhận
thiếu gậy` (03e), `14a · Ảnh — chọn hãng` (04), `17a · QR — khung quét` (05). Bản dựng `07 · Chi tiết phiên swing`, `07a · Chi tiết phiên thể lực`
xoá (bước 07, 11 thay). README: id F05 cho `(player)/home`, `(player)/metrics`, mọi `metrics/*`; xoá dòng F05 ở "Chưa có (Phase 2)".
`pnpm typecheck` → xanh.

- [ ] **Step 6: Storyboard từ story → chạy lại luồng → xanh; đọc ảnh**

```bash
rm -f docs/flows/F05/*.png
SB_URL=http://localhost:6007 CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node scripts/shot-storybook.mjs docs/flows/F05 '^f05--' 390 844
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/flow-web.mjs docs/flows/F05/steps.json
```
Expected: mọi dòng `ok`; `PASS F05: 108 bước, 20 bước chụp, 17 story biến thể`. Mở `docs/flows/F05/f05--b-08-sua-loi.light.png`, kiểm 3 điểm:
- Carry điền sẵn kiểu VN, smash hiện "1,36";
- `f05--…08a…` (sửa phiên theo yard): carry hiện yard 1 chữ số. Kiểm tay thêm: mở phiên Sắt 7 → Sửa phiên → Carry "166,2" → Lưu → chi tiết vẫn 152 m;
- `f05--b-11-the-luc-sau-sua` có Cân nặng 71,5 kg + dòng Đã sửa; `11a` có 4 ô thể lực điền sẵn.
Đọc mọi ảnh còn lại (sáng + tối) và ảnh điểm kiểm `$TMPDIR/flow-F05/`.

- [ ] **Step 7: Gates**

Run: `pnpm typecheck && pnpm test && pnpm check:literals` → xanh. `pkill -f "expo start"; lsof -ti tcp:6007 | xargs kill`.

- [ ] **Step 8: Commit**

```bash
git add apps/golf/app/metrics/manual.tsx "apps/golf/app/metrics/[id].tsx" apps/golf/components/charts docs/flows/F05.md docs/flows/F05
git add storybook-app/flows/F05-so-lieu.stories.tsx storybook-app/README.md storybook-app/issues
git commit -m "$(cat <<'EOF'
feat(metrics): sửa phiên đã lưu (điền sẵn theo đơn vị, giữ nguồn), dòng Đã sửa, biểu đồ dưới 2 buổi / 1 gậy + storyboard F5

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 21: F6 Bộ gậy — Đang dùng / Lưu trữ, khôi phục, xoá gậy chưa gắn dữ liệu, chọn sẵn gậy vừa thêm

**Files:**
- Modify:
  - `apps/golf/app/clubs/index.tsx`: Segmented "Đang dùng / Lưu trữ", `?view=archived`
  - `apps/golf/app/clubs/[id]/index.tsx`: Khôi phục gậy, Xoá gậy + Dialog
  - `apps/golf/app/(player)/metrics.tsx`: lối vào "Gậy đã lưu trữ"
  - `apps/golf/components/ClubPicker.tsx`: chọn sẵn gậy vừa thêm
  - `apps/golf/app/metrics/[id].tsx`, `apps/golf/app/swings/[id].tsx`: mẫu `deleteOnLeave` của Task 14 → `useOnLeave`
- Create: `apps/golf/components/useOnLeave.ts` (xoá sau khi rời màn — dùng ở 3 màn, Task 26 dùng thêm ở `posts/[id]`)
- Create: `docs/flows/F06.md`, `docs/flows/F06/steps.json`, `docs/flows/F06/<story-id>.<light|dark>.png` (sinh từ story)
- Modify: `storybook-app/flows/F06-bo-gay.stories.tsx`, `storybook-app/README.md`, `storybook-app/issues/*.md`

**Interfaces:**
- Consumes (Task 16): action `unarchiveClub`, `deleteClub`; selector `archivedClubsOf`, `clubLinkCount`.
- Produces: `useOnLeave(fn): () => void` (`components/useOnLeave.ts`) — gọi hàm trả về rồi rời màn, `fn` chạy lúc màn unmount (Task 26, 29 dùng).
- Consumes (Task 15): `appStory`, `shot-storybook.mjs`; (Task 17): `scripts/flow-web.mjs`.
- Produces:
  - route `/clubs?view=archived` mở thẳng mục Lưu trữ;
  - `ClubPicker` giữ chữ ký cũ `({ playerId, value?, onChange, error? })`. Thêm hành vi: bấm "Thêm gậy mới", lưu gậy, quay lại form thì
    `onChange(<id gậy mới>)` được gọi đúng 1 lần.

- [ ] **Step 1: Kịch bản — `docs/flows/F06/steps.json`**

```json
{
  "flow": "F06",
  "title": "Bộ gậy",
  "account": "Nguyễn Minh Anh",
  "start": "/(player)/metrics?as=p-minh",
  "steps": [
    { "click": "Bộ gậy", "role": "tab" },
    { "expect": "Wedge" },
    { "shot": "01-bo-gay", "do": "Tab Thông số → Bộ gậy", "see": "8 gậy theo nhóm Gỗ / Hybrid / Sắt / Wedge / Putter, lưới 2 cột" },
    { "click": "Thêm gậy" },
    { "click": "Loại gậy, chưa chọn" },
    { "expect": "Tuỳ chỉnh" },
    { "shot": "02-16-loai", "do": "Nút + → Loại gậy", "see": "Sheet 16 loại theo nhóm + Tuỳ chỉnh" },
    { "click": "Tuỳ chỉnh" },
    { "type": "Chipper 37°", "into": "Tên gậy" },
    { "type": "Cleveland", "into": "Hãng" },
    { "type": "Smart Sole 4", "into": "Model" },
    { "type": "True Temper", "into": "Hãng cán" },
    { "type": "37", "into": "Loft (°)" },
    { "type": "62", "into": "Lie (°)" },
    { "shot": "03-form-tuy-chinh", "do": "Chọn Tuỳ chỉnh, điền tên + thông số", "see": "Ô Tên gậy hiện khi chọn Tuỳ chỉnh; loft 37°, lie 62°" },
    { "click": "Lưu" },
    { "expect": "Chipper 37°" },
    { "shot": "04-them-xong", "do": "Lưu", "see": "Nhóm Khác có Chipper 37°" },
    { "click": "Swing", "role": "tab" },
    { "click": "Nhập số liệu" },
    { "click": "Nhập tay" },
    { "click": "Gậy, chưa chọn" },
    { "expect": "Chipper 37°" },
    { "shot": "05-gay-moi-trong-picker", "do": "Swing → + → Nhập tay → Gậy", "see": "Sheet chọn gậy có Chipper 37° (nhóm Khác) + Thêm gậy mới" },
    { "click": "Thêm gậy mới" },
    { "click": "Loại gậy, chưa chọn" },
    { "click": "Hybrid 3" },
    { "type": "Ping", "into": "Hãng" },
    { "type": "G430", "into": "Model" },
    { "type": "Alta CB", "into": "Hãng cán" },
    { "type": "59", "into": "Lie (°)" },
    { "click": "Lưu" },
    { "expect": "Gậy, Hybrid 3 · Ping G430" },
    { "shot": "06-chon-san-gay-moi", "do": "Thêm gậy mới → Hybrid 3 (loft gợi ý 19°) → Lưu", "see": "Quay lại form nhập tay, gậy Hybrid 3 · Ping G430 đã được chọn sẵn" },
    { "back": true },
    { "click": "Swing", "role": "tab", "nth": 1 },
    { "click": "Đăng swing" },
    { "click": "Tiếp tục" },
    { "click": "Gậy, chưa chọn" },
    { "expect": "Chipper 37°" },
    { "expect": "Hybrid 3" },
    { "shot": "07-gay-moi-o-dang-swing", "do": "Bỏ form → tab Swing (thanh tab dưới) → Đăng swing → Tiếp tục → Gậy", "see": "Sheet chọn gậy của Đăng swing có Chipper 37° và Hybrid 3 vừa thêm" },
    { "click": "Chipper 37°", "contains": true },
    { "back": true },
    { "click": "Thông số", "role": "tab" },
    { "click": "Bộ gậy", "role": "tab" },
    { "click": "Chipper 37°" },
    { "click": "Sửa gậy" },
    { "type": "Smart Sole 4 C", "into": "Model" },
    { "click": "Lưu" },
    { "expect": "Cleveland Smart Sole 4 C" },
    { "expect": "Xoá gậy" },
    { "shot": "08-sua-xong", "do": "Bỏ form → Bộ gậy → Chipper → Sửa gậy → Model → Lưu", "see": "Chi tiết: Cleveland Smart Sole 4 C; Lưu trữ gậy + Xoá gậy (chưa gắn phiên/swing)" },
    { "click": "Lưu trữ gậy" },
    { "click": "Lưu trữ" },
    { "expect": "Gậy đã lưu trữ" },
    { "shot": "09-sau-luu-tru", "do": "Lưu trữ gậy → Lưu trữ", "see": "Chipper rời lưới; dòng Gậy đã lưu trữ (1 gậy)" },
    { "click": "Gậy đã lưu trữ" },
    { "expect": "Chipper 37°" },
    { "shot": "10-luu-tru", "do": "Chạm Gậy đã lưu trữ", "see": "Bộ gậy › Lưu trữ (1): Chipper 37°" },
    { "click": "Chipper 37°" },
    { "expect": "Khôi phục gậy" },
    { "shot": "11-gay-luu-tru", "do": "Chạm Chipper", "see": "Đã lưu trữ ngày 07/10/2026; Khôi phục gậy / Xoá gậy; không có nút Sửa" },
    { "click": "Khôi phục gậy" },
    { "expect": "Đã khôi phục" },
    { "click": "Xoá gậy" },
    { "expect": "Xoá gậy này?" },
    { "shot": "12-xoa-gay", "do": "Khôi phục gậy → Xoá gậy", "see": "Dialog Xoá gậy này? — chưa gắn phiên/swing, không khôi phục được" },
    { "click": "Xoá" },
    { "expectNot": "Chipper 37°" },
    { "shot": "13-sau-xoa", "do": "Xoá", "see": "Về Bộ gậy › Lưu trữ: Chưa lưu trữ gậy nào; Chipper không còn ở đâu" },
    { "click": "Đang dùng", "role": "tab" },
    { "click": "Driver" },
    { "expect": "đã gắn với 7 phiên/swing" },
    { "expectNot": "Xoá gậy" },
    { "shot": "14-driver-khong-xoa", "do": "Đang dùng → Driver", "see": "Driver gắn 7 phiên/swing: chỉ có Lưu trữ gậy, không có Xoá gậy" }
  ]
}
```
Tạo `docs/flows/F06.md`:
```markdown
# F6 — Bộ gậy

**Tài khoản:** Nguyễn Minh Anh (`p-minh`, 8 gậy). **Bắt đầu:** web `/(player)/metrics?as=p-minh` · Expo Go: Dev › Kiểm tra theo luồng › F6 ·
Storybook app: `Luồng/F06 · Bộ gậy`.
**Chạy lại:** `node scripts/flow-web.mjs docs/flows/F06/steps.json` (Metro web + Storybook app đang chạy).

## Các bước
<!-- steps:start -->
<!-- steps:end -->

## Đã sửa trong lượt đi
- Không có.

## Đã biết / chưa làm
- Xoá chỉ được khi gậy chưa gắn phiên/swing nào (tech review: lưu trữ thay vì xoá để giữ lịch sử); gậy đã gắn chỉ lưu trữ / khôi phục.
- HLV xem bộ gậy học viên (chỉ đọc) chỉ thấy gậy đang dùng.
- Gậy thường lấy tên theo loại; chỉ gậy "Tuỳ chỉnh" có tên riêng (spec §4 clubs/new).
```

- [ ] **Step 2: Chạy — thấy đỏ**

Expected: `✗ 33 {"expect":"Gậy, Hybrid 3 · Ping G430"}` (gậy mới chưa được chọn sẵn). Bước 1–32 ✓.

- [ ] **Step 3: `components/ClubPicker.tsx` — chọn sẵn gậy vừa thêm**

Đổi import React thành `import { useEffect, useRef, useState } from 'react';`. Trong `ClubPicker`, sau `const groups = …`:
```tsx
  const before = useRef<Set<ID> | undefined>(undefined); // gậy đã có lúc bấm "Thêm gậy mới"
  // quay lại form sau khi thêm gậy → chọn sẵn gậy vừa thêm (hand-off: không bắt mở lại danh sách)
  useEffect(() => {
    const fresh = before.current && clubs.find((c) => !before.current!.has(c.id));
    if (!fresh) return;
    before.current = undefined;
    onChange(fresh.id);
  }, [clubs.length]);
```
`onPress` của `PopoverItem` "Thêm gậy mới":
```tsx
            onPress={() => {
              before.current = new Set(clubs.map((c) => c.id));
              setOpen(false);
              router.push('/clubs/new');
            }}
```

- [ ] **Step 4: `clubs/index.tsx` — Đang dùng / Lưu trữ**

Import thêm:
- `useState` từ `react`;
- `Segmented` từ `@gr/ds`;
- `archivedClubsOf` từ `../../lib/selectors`.

Trong `Clubs`, ngay sau `useLocalSearchParams` (đổi thành `const { playerId, view } = useLocalSearchParams<{ playerId?: string; view?: string }>();`):
```tsx
  const [seg, setSeg] = useState(view === 'archived' ? 1 : 0); // MVP "My Clubs — Active / Archived"
```
Thay đoạn từ `const canEdit = …` tới hết `return (…)`:
```tsx
  const canEdit = ownerId === me.id && me.role === 'player';
  const ownerName = profileById(state, ownerId)?.name ?? 'Học viên';
  const active = clubsOf(state, ownerId);
  const archived = canEdit ? archivedClubsOf(state, ownerId) : []; // HLV xem chỉ đọc: chỉ gậy đang dùng
  const archivedView = canEdit && seg === 1;
  const clubs = archivedView ? archived : active;
  const add = () => router.push('/clubs/new');
  const margin = t.layout('Margin-Small');
  return (
    <Screen>
      <StackHeader title="Bộ gậy" subtitle={canEdit ? `${active.length} gậy đang dùng` : `${ownerName} · ${active.length} gậy`} />
      {canEdit && (
        <View style={{ paddingHorizontal: margin, paddingBottom: t.space('Spacing/Padding/Small') }}>
          <Segmented
            items={[
              { label: 'Đang dùng', badge: String(active.length) },
              { label: 'Lưu trữ', badge: String(archived.length) },
            ]}
            selectedIndex={seg}
            onChange={setSeg}
          />
        </View>
      )}
      {clubs.length ? (
        <>
          {/* chừa chỗ cho nút "+" nổi (chỉ mục Đang dùng) */}
          <ScrollView contentContainerStyle={{ padding: margin, paddingBottom: canEdit && !archivedView ? t.size('Button/Size/Large') + 2 * margin : margin }}>
            <ClubGrid clubs={clubs} />
          </ScrollView>
          {canEdit && !archivedView && (
            <View style={{ position: 'absolute', right: margin, bottom: margin }}>
              <IconButton icon="plus-line" accessibilityLabel="Thêm gậy" onPress={add} />
            </View>
          )}
        </>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', padding: margin }}>
          {archivedView ? (
            <EmptyState icon="archive-line" title="Chưa lưu trữ gậy nào" caption="Gậy lưu trữ ẩn khỏi danh sách chọn gậy nhưng giữ nguyên lịch sử phiên và swing." />
          ) : canEdit ? (
            <EmptyState icon="flag-01-line" title="Chưa có gậy nào" caption="Thêm gậy để gắn với từng phiên số liệu và video swing." primaryText="Thêm gậy" onPrimary={add} />
          ) : (
            <EmptyState icon="flag-01-line" title="Chưa có gậy nào" caption={`${ownerName} chưa thêm gậy vào bộ gậy.`} />
          )}
        </View>
      )}
    </Screen>
  );
```

- [ ] **Step 5: `components/useOnLeave.ts` (mới) + `clubs/[id]/index.tsx` — Khôi phục, Xoá**

Xoá gậy là chỗ thứ 3 cần "xoá SAU khi màn rời stack" (Task 14 chép tay mẫu `deleteOnLeave` ở `metrics/[id].tsx:18-25` và `swings/[id].tsx:179-186`;
review Task 14 #2: chỗ thứ 3 thì gom thành hook — phân loại Task 15 #24). Tạo `apps/golf/components/useOnLeave.ts`:
```ts
import { useEffect, useRef } from 'react';

/** Chạy `fn` khi màn rời stack (unmount), chỉ khi đã gọi hàm trả về. Dùng để xoá dữ liệu SAU khi rời màn — xoá trước khi quay lại thì màn
 *  đang rời nháy "Không tìm thấy …". Ví dụ: `const deleteOnLeave = useOnLeave(() => dispatch(…)); … deleteOnLeave(); back();` */
export function useOnLeave(fn: () => void) {
  const armed = useRef(false);
  useEffect(
    () => () => {
      if (armed.current) fn();
    },
    [], // fn chỉ đọc id cố định của màn (param / prop) → closure lần đầu là đủ
  );
  return () => {
    armed.current = true;
  };
}
```
Chuyển 2 chỗ của Task 14 sang hook (hành vi giữ nguyên):
1. `apps/golf/app/metrics/[id].tsx`: dòng 1 `import { useEffect, useRef, useState } from 'react';` → `import { useState } from 'react';`; thêm
   `import { useOnLeave } from '../../components/useOnLeave';`; dòng 18–25 thành
```tsx
  // Xoá sau khi màn đã rời (unmount) — xoá trước khi quay lại thì màn đang rời nháy "Không tìm thấy phiên".
  const deleteOnLeave = useOnLeave(() => dispatch({ type: 'deleteSession', id: id! }));
```
   trong `onPrimary` của Dialog "Xoá phiên này?": `deleteOnLeave.current = true;` → `deleteOnLeave();`.
2. `apps/golf/app/swings/[id].tsx`: dòng 1 bỏ `useRef` khỏi import (chỉ `deleteOnLeave` dùng); thêm `import { useOnLeave } from '../../components/useOnLeave';`;
   dòng 179–186 thành
```tsx
  // Xoá sau khi màn đã rời (unmount) — xoá trước khi quay lại thì màn đang rời nháy "Không tìm thấy swing".
  const deleteOnLeave = useOnLeave(() => dispatch({ type: 'deleteSwing', id: swing.id }));
```
   trong `onPrimary` của Dialog "Xoá swing này?": `deleteOnLeave.current = true;` → `deleteOnLeave();`.

`clubs/[id]/index.tsx` — import thêm `clubLinkCount` từ `../../../lib/selectors`, `SavedToast` từ `../../../components/Feedback`, `useOnLeave` từ
`../../../components/useOnLeave`. Thêm cạnh `const [confirmArchive, …]` (dòng 22), trước `if (!me) return`:
```tsx
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<string>();
  const deleteOnLeave = useOnLeave(() => dispatch({ type: 'deleteClub', id })); // xoá SAU khi rời màn — không nháy "Không tìm thấy gậy"
```

Đổi `const linked = swings.length + sessions.length;` (dòng 45) thành `const linked = clubLinkCount(state, club.id);`. Thay khối
`{canEdit && (… "Lưu trữ gậy" …)}` (dòng 124–128) bằng:
```tsx
        {own && (
          <View style={{ paddingHorizontal: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Small') }}>
            {club.archivedAt ? (
              <Button
                level="Secondary"
                size="Medium (Base)"
                leadingIcon="refresh-ccw-01-line"
                text="Khôi phục gậy"
                onPress={() => {
                  dispatch({ type: 'unarchiveClub', id: club.id });
                  setToast('Đã khôi phục — gậy về danh sách Đang dùng');
                }}
              />
            ) : (
              <Button level="Danger Subtle" size="Medium (Base)" leadingIcon="archive-line" text="Lưu trữ gậy" onPress={() => setConfirmArchive(true)} />
            )}
            {linked === 0 ? (
              <Button level="Danger Subtle" size="Medium (Base)" leadingIcon="trash-line" text="Xoá gậy" onPress={() => setConfirmDelete(true)} />
            ) : (
              <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">
                {`Gậy đã gắn với ${linked} phiên/swing nên chỉ lưu trữ được — không xoá để giữ lịch sử.`}
              </Text>
            )}
          </View>
        )}
```
InlineMessage của gậy đã lưu trữ (dòng 73) đổi chữ thành:
`Đã lưu trữ ngày ${formatDate(club.archivedAt)} — gậy ẩn khỏi danh sách và chọn gậy, dữ liệu cũ giữ nguyên. Khôi phục để dùng lại.`

Thêm sau Dialog lưu trữ (dòng 130–144):
```tsx
      <Dialog
        visible={confirmDelete}
        onRequestClose={() => setConfirmDelete(false)}
        theme="Warning"
        title="Xoá gậy này?"
        body="Gậy chưa gắn với phiên hay swing nào. Xoá xong không khôi phục được."
        primaryText="Xoá"
        destructive
        onPrimary={() => {
          setConfirmDelete(false);
          deleteOnLeave();
          back();
        }}
        secondaryText="Huỷ"
      />
      {toast && <SavedToast title={toast} onDone={() => setToast(undefined)} />}
```

- [ ] **Step 6: `(player)/metrics.tsx` — lối vào gậy đã lưu trữ**

Import thêm:
- `Icon`, `ListItem` từ `@gr/ds`;
- `archivedClubsOf` từ `../../lib/selectors`.

Sau `const clubs = clubsOf(state, me.id);`:
```tsx
  const archived = archivedClubsOf(state, me.id);
  const openArchived = () => router.push({ pathname: '/clubs', params: { view: 'archived' } });
```
Trong nhánh có dữ liệu, thay `{seg === 2 ? (<View …><ClubGrid clubs={clubs} /></View>) : rows}` bằng:
```tsx
            {seg === 2 ? (
              <>
                {archived.length > 0 && (
                  <ListItem
                    title="Gậy đã lưu trữ"
                    caption={`${archived.length} gậy — khôi phục hoặc xoá`}
                    leading={<Icon name="archive-line" size={t.size('Element-Size/Popular/Base')} color="Color/Content/Neutral/Base" />}
                    trailing={<Icon name="chevron-right-line-medium" size={t.size('Element-Size/Popular/Base')} color="Color/Content/Neutral/Light" />}
                    onPress={openArchived}
                  />
                )}
                <View style={{ paddingHorizontal: t.layout('Margin-Small') }}>
                  <ClubGrid clubs={clubs} />
                </View>
              </>
            ) : (
              rows
            )}
```
Ở `EmptyState` của nhánh trống, thêm nối gậy lưu trữ, để bộ gậy toàn gậy lưu trữ không thành ngõ cụt:
```tsx
            {...(seg === 2 && archived.length > 0 ? { secondaryText: 'Gậy đã lưu trữ', onSecondary: openArchived } : {})}
```

- [ ] **Step 7: Story F6 — `storybook-app/flows/F06-bo-gay.stories.tsx`**

Theo "Cách chạy một task luồng" bước 5. Trạng thái dùng chung:
```tsx
const CHIPPER = { type: 'upsertClub', club: { id: 'cl-sb-chipper', playerId: 'p-minh', type: 'Tuỳ chỉnh', customName: 'Chipper 37°', brand: 'Cleveland', model: 'Smart Sole 4', shaftBrand: 'True Temper', shaftFlex: 'Regular', loftDeg: 37, lieDeg: 62 } } as const;
const CHIPPER_SUA = { type: 'upsertClub', club: { ...CHIPPER.club, model: 'Smart Sole 4 C' } } as const;
const HYBRID3 = { type: 'upsertClub', club: { id: 'cl-sb-hybrid3', playerId: 'p-minh', type: 'Hybrid 3', brand: 'Ping', model: 'G430', shaftBrand: 'Alta CB', shaftFlex: 'Regular', loftDeg: 19, lieDeg: 59 } } as const;
const LUU_TRU = { type: 'archiveClub', id: 'cl-sb-chipper', at: NOW } as const;
```
(`shaftFlex` lấy một giá trị có trong `SHAFT_FLEXES` của `lib/domain.ts`; form mặc định thế nào thì story dùng đúng giá trị đó.)

| nn | Màn | `appStory` | `play` |
|---|---|---|---|
| 01 | `(player)/metrics` | `as: 'p-minh'`, tabs metrics | tab `Bộ gậy` (bản dựng `01b`) |
| 02 | `clubs/new` | `as: 'p-minh'` | `Loại gậy, chưa chọn` (bản dựng `02b`) |
| 03 | `clubs/new` | `as: 'p-minh'` | `Loại gậy, chưa chọn` → `Tuỳ chỉnh` → gõ tên / hãng / model / hãng cán / loft 37 / lie 62 như `steps.json` (bản dựng `02d` + ô) |
| 04 | `(player)/metrics` | `as: 'p-minh'`, tabs metrics, `setup: [CHIPPER]` | tab `Bộ gậy` |
| 05 | `metrics/manual` | `as: 'p-minh'`, `setup: [CHIPPER]` | `Gậy, chưa chọn` |
| 06 | `metrics/manual` | `as: 'p-minh'`, `setup: [CHIPPER, HYBRID3]` | `Gậy, chưa chọn` → `Hybrid 3` (ảnh của trạng thái "đã chọn"; hành vi chọn sẵn sau khi thêm gậy do lượt CDP chứng minh) |
| 07 | `swings/new` | `as: 'p-minh'`, `setup: [CHIPPER, HYBRID3]` | `Tiếp tục` → `Gậy, chưa chọn` |
| 08 | `clubs/[id]/index` | `as: 'p-minh'`, `params: { id: 'cl-sb-chipper' }`, `setup: [CHIPPER, CHIPPER_SUA]` | — |
| 09 | `(player)/metrics` | `as: 'p-minh'`, tabs metrics, `setup: [CHIPPER, CHIPPER_SUA, LUU_TRU]` | tab `Bộ gậy` |
| 10 | `clubs/index` | `as: 'p-minh'`, `params: { view: 'archived' }`, `setup: [CHIPPER, CHIPPER_SUA, LUU_TRU]` | — |
| 11 | `clubs/[id]/index` | như 08 + `LUU_TRU` | — |
| 12 | `clubs/[id]/index` | như 08 | `Xoá gậy` → chờ Dialog `Xoá gậy này?` |
| 13 | `clubs/index` | `as: 'p-minh'`, `params: { view: 'archived' }` | — |
| 14 | `clubs/[id]/index` | `as: 'p-minh'`, `params: { id: 'cl-driver' }` | — (bản dựng `03 · Chi tiết gậy`) |

**Biến thể** (bản dựng đổi `name`): `01a · Danh sách theo nhóm (màn Bộ gậy)` (01), `01b · Bộ gậy rỗng` (01a), `02a · Thêm gậy — form trống` (02),
`03a · Thêm gậy — lỗi validate` (02a), `03b · Thêm gậy — wedge có bounce` (02c), `08a · Sửa gậy` (04), `08b · Dialog lưu trữ gậy` (05),
`11a · Sửa gậy đã lưu trữ — về chi tiết` (04a), mới `11b · Đã khôi phục — toast` (như 11, `hold: ['toast']`, bấm `Khôi phục gậy`),
`14a · HLV xem bộ gậy học viên` (06), `14b · HLV xem chi tiết gậy` (06a), `14c · Không quyền — bộ gậy (403)` (07), `14d · Không quyền — chi tiết gậy (403)`
(07a), `14e · Không tìm thấy gậy` (07b). Bản dựng `05a · Gậy đã lưu trữ` xoá (bước 11 thay). README: id F06 cho `clubs/index`, `clubs/new`,
`clubs/[id]/index`, `clubs/[id]/edit`, `(player)/metrics`; xoá dòng F06 ở "Chưa có (Phase 2)". `pnpm typecheck` → xanh.

- [ ] **Step 8: Storyboard từ story → chạy lại luồng → xanh; đọc ảnh**

```bash
rm -f docs/flows/F06/*.png
SB_URL=http://localhost:6007 CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node scripts/shot-storybook.mjs docs/flows/F06 '^f06--' 390 844
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/flow-web.mjs docs/flows/F06/steps.json
```
Expected: mọi dòng `ok`; `PASS F06: 76 bước, 14 bước chụp, 14 story biến thể`. Đọc mọi ảnh (sáng + tối) và ảnh điểm kiểm:
- Segmented có badge đếm;
- dòng "Gậy đã lưu trữ" nằm trên lưới, không chồng nút "+";
- caption "đã gắn với 7 phiên/swing" xuống dòng gọn;
- bước 07: sheet chọn gậy của Đăng swing có Chipper 37° và Hybrid 3.

- [ ] **Step 9: Gates**

Run: `pnpm typecheck && pnpm test && pnpm check:literals` → xanh. `pkill -f "expo start"; lsof -ti tcp:6007 | xargs kill`.

- [ ] **Step 10: Commit**

```bash
git add apps/golf/app/clubs "apps/golf/app/(player)/metrics.tsx" "apps/golf/app/metrics/[id].tsx" "apps/golf/app/swings/[id].tsx" apps/golf/components/ClubPicker.tsx apps/golf/components/useOnLeave.ts docs/flows/F06.md docs/flows/F06
git add storybook-app/flows/F06-bo-gay.stories.tsx storybook-app/README.md storybook-app/issues
git commit -m "$(cat <<'EOF'
feat(clubs): Đang dùng / Lưu trữ, khôi phục, xoá gậy chưa gắn dữ liệu, chọn sẵn gậy vừa thêm + storyboard F6

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 22: F9 HLV xem học viên — đi luồng roster → chi tiết 5 tab chỉ đọc → 403 / 404

Màn của luồng này do Task 11 dựng; Task 17/18 đã bổ sung. Task này đi luồng, sửa ngõ cụt nếu có, rồi lưu storyboard.

**Files:**
- Create: `docs/flows/F09.md`, `docs/flows/F09/steps.json`, `docs/flows/F09/<story-id>.<light|dark>.png` (sinh từ story)
- Modify: `storybook-app/flows/F09-hlv-xem-hoc-vien.stories.tsx`, `storybook-app/README.md`, `storybook-app/issues/*.md`
- Modify: `apps/golf/app/students/[id].tsx` (chữ rỗng của tab Tổng quan / Thông số — phân loại Task 15 #13)
- Modify (chỉ khi lượt đi gặp ngõ cụt): file màn liên quan, ghi vào "Đã sửa trong lượt đi"

**Interfaces:** Consumes `scripts/flow-web.mjs` (Task 17), `appStory` + `shot-storybook.mjs` (Task 15); màn `(coach)/roster`, `students/[id]` (Task 11, 17, 18), `metrics/[id]`, `clubs/[id]` (chỉ đọc với HLV).

- [ ] **Step 1: Kịch bản — `docs/flows/F09/steps.json`**

```json
{
  "flow": "F09",
  "title": "HLV xem học viên",
  "account": "HLV Đỗ Minh Tuấn",
  "start": "/(coach)/roster?as=c-tuan",
  "steps": [
    { "type": "lan", "into": "Tìm học viên" },
    { "expect": "Trần Thu Lan" },
    { "expectNot": "Nguyễn Minh Anh" },
    { "shot": "01-tim", "do": "HLV Tuấn → Học viên → gõ “lan”", "see": "Chỉ còn Trần Thu Lan (tìm không dấu)" },
    { "type": "", "into": "Tìm học viên" },
    { "click": "Cần phản hồi", "role": "tab" },
    { "expect": "Trần Thu Lan" },
    { "shot": "02-can-phan-hoi", "do": "Xoá ô tìm → Cần phản hồi", "see": "Trần Thu Lan + Badge Cần phản hồi (swing đã phân tích, Tuấn chưa ghi chú)" },
    { "click": "Tất cả", "role": "tab" },
    { "click": "Nguyễn Minh Anh" },
    { "expect": "Chỉ số swing gần nhất" },
    { "shot": "03-tong-quan", "do": "Tất cả → Nguyễn Minh Anh", "see": "Tab Tổng quan: 4 chỉ số + xu hướng Driver; header có nút Huỷ kết nối" },
    { "click": "Thông số", "role": "tab" },
    { "expect": "05/10/2026 · Gỗ 3" },
    { "shot": "04-thong-so", "do": "Tab Thông số", "see": "Danh sách phiên swing của học viên" },
    { "click": "05/10/2026 · Gỗ 3" },
    { "expect": "Phiên swing" },
    { "expectNot": "Xoá phiên" },
    { "expectNot": "Sửa phiên" },
    { "shot": "05-phien-chi-doc", "do": "Chạm phiên Gỗ 3", "see": "Chi tiết phiên chỉ đọc: không có Sửa / Xoá" },
    { "back": true },
    { "click": "Swing", "role": "tab" },
    { "expect": "Chưa review" },
    { "shot": "06-swing", "do": "Tab Swing", "see": "Chưa review (1) / Đã review (2)" },
    { "click": "Bộ gậy", "role": "tab" },
    { "expect": "Wedge" },
    { "shot": "07-bo-gay", "do": "Tab Bộ gậy", "see": "Lưới gậy đang dùng, chỉ đọc" },
    { "click": "Driver" },
    { "expect": "Swing gần đây dùng gậy này" },
    { "expectNot": "Lưu trữ gậy" },
    { "expectNot": "Xoá gậy" },
    { "shot": "08-gay-chi-doc", "do": "Chạm Driver", "see": "Chi tiết gậy chỉ đọc: không có Sửa / Lưu trữ / Xoá" },
    { "back": true },
    { "click": "Thể lực", "role": "tab" },
    { "expect": "Thể lực gần nhất" },
    { "shot": "09-the-luc", "do": "Tab Thể lực", "see": "4 chỉ số thể lực gần nhất + lịch sử 2 phiên" },
    { "open": "/students/p-minh?as=p-khoa", "account": "Lê Đăng Khoa (chỉ theo dõi Minh Anh)" },
    { "expect": "Không có quyền xem" },
    { "shot": "10-403-nguoi-theo-doi", "do": "Mở thẳng link /students/p-minh khi là người theo dõi", "see": "403: Không có quyền xem — chỉ HLV đã kết nối" },
    { "open": "/students/p-lan?as=c-ha", "account": "HLV Vũ Thanh Hà (đã huỷ với Lan)" },
    { "expect": "đã bị huỷ" },
    { "shot": "11-403-da-huy", "do": "HLV Hà mở link /students/p-lan (kết nối cũ đã huỷ)", "see": "403: kết nối với học viên này đã bị huỷ" },
    { "open": "/swings/sw-minh-1?as=p-khoa", "account": "Lê Đăng Khoa" },
    { "expect": "Không có quyền xem" },
    { "shot": "12-403-swing", "do": "Người theo dõi mở link swing của Minh Anh", "see": "403 ở chi tiết swing" },
    { "open": "/students/khong-co?as=c-tuan", "account": "HLV Đỗ Minh Tuấn" },
    { "expect": "Không tìm thấy học viên" },
    { "shot": "13-404-hoc-vien", "do": "Mở link học viên không tồn tại", "see": "Không tìm thấy học viên + Quay lại" }
  ]
}
```
Tạo `docs/flows/F09.md`:
```markdown
# F9 — HLV xem học viên

**Tài khoản:** HLV Đỗ Minh Tuấn (`c-tuan`); bước 403 mở thẳng link với Lê Đăng Khoa (`p-khoa`) và HLV Vũ Thanh Hà (`c-ha`).
**Bắt đầu:** web `/(coach)/roster?as=c-tuan` · Expo Go: Dev › Kiểm tra theo luồng › F9 · Storybook app: `Luồng/F09 · HLV xem học viên`.
**Chạy lại:** `node scripts/flow-web.mjs docs/flows/F09/steps.json` (Metro web + Storybook app đang chạy).

## Các bước
<!-- steps:start -->
<!-- steps:end -->

## Đã sửa trong lượt đi
- Không có.

## Đã biết / chưa làm
- 403 chỉ tới được bằng link: UI không hiện lối vào dữ liệu riêng cho người không có quyền (follow không mở quyền — D6).
- Mỗi lần mở thẳng link (bước 10–13) là một lần tải trang mới: dữ liệu mẫu nạp lại từ đầu.
```

- [ ] **Step 1b: `students/[id].tsx` — chữ rỗng "phiên swing" dễ lẫn với video swing (phân loại Task 15 #13)**

Tab Tổng quan (dòng 72) và tab Thông số (dòng 107) cùng câu `empty('Học viên chưa có phiên swing nào.')` trong khi tab Swing có thể có video. Đổi
cả hai thành:
```tsx
    if (!latest) return empty('Học viên chưa có phiên số liệu swing nào (nhập tay, CSV, ảnh). Video swing ở tab Swing.');
```
```tsx
    if (!sessions.length) return empty('Học viên chưa có phiên số liệu swing nào (nhập tay, CSV, ảnh). Video swing ở tab Swing.');
```

- [ ] **Step 2: Chạy lượt đi**

Chạy `flow-web.mjs` (Metro web + Storybook app đang chạy). Lượt đi phải qua hết 48 bước; lần đầu chỉ được đỏ ở dòng cuối
`✗ thiếu story hoặc ảnh storyboard: f09--b-01-tim, …` (Step 3 làm). FAIL ở một bước thì đó là ngõ cụt hoặc chữ lệch:
- chữ lệch (màn Task 11): sửa JSON;
- ngõ cụt thật (bấm không tới màn mong đợi, màn tạm, lỗi runtime): sửa tối thiểu ở màn đó, ghi vào `F09.md` › "Đã sửa trong lượt đi", chạy lại.

- [ ] **Step 3: Story F9 — `storybook-app/flows/F09-hlv-xem-hoc-vien.stories.tsx`**

Theo "Cách chạy một task luồng" bước 5.

| nn | Màn | `appStory` | `play` |
|---|---|---|---|
| 01 | `(coach)/roster` | `as: 'c-tuan'`, tabs roster | `typeIn` ô `Tìm học viên` = `lan` (bản dựng `01a · Tìm học viên`) |
| 02 | `(coach)/roster` | như 01 | tab `Cần phản hồi` (bản dựng `02`) |
| 03 | `students/[id]` | `as: 'c-tuan'`, `params: { id: 'p-minh' }` | — (bản dựng `05`) |
| 04 | như 03 | như 03 | tab `Thông số` (bản dựng `06`) |
| 05 | `metrics/[id]` | `as: 'c-tuan'`, `params: { id: 'ss-w1' }` (phiên Gỗ 3 05/10) | — |
| 06 | như 03 | như 03 | tab `Swing` (bản dựng `07`) |
| 07 | như 03 | như 03 | tab `Bộ gậy` (bản dựng `08`) |
| 08 | `clubs/[id]/index` | `as: 'c-tuan'`, `params: { id: 'cl-driver' }` | — |
| 09 | như 03 | như 03 | tab `Thể lực` (bản dựng `09`) |
| 10 | `students/[id]` | `as: 'p-khoa'`, `params: { id: 'p-minh' }` | — (bản dựng `10a`) |
| 11 | `students/[id]` | `as: 'c-ha'`, `params: { id: 'p-lan' }` | — (bản dựng `10`) |
| 12 | `swings/[id]` | `as: 'p-khoa'`, `params: { id: 'sw-minh-1' }` | — |
| 13 | `students/[id]` | `as: 'c-tuan'`, `params: { id: 'khong-co' }` | — (bản dựng `10b`) |

**Biến thể** (bản dựng đổi `name`): `01a · Danh sách học viên` (01), `01b · Tìm — không thấy` (01b), `02a · Cần phản hồi — rỗng` (02a),
`02b · Lọc Lời mời` (03), `02c · Lời mời — rỗng` (03a), `02d · Chưa có học viên` (04), `03a · Tổng quan — học viên chưa có dữ liệu` (05a),
`06a · Tab Swing — swing cần phản hồi` (07a). README: id F09 cho `(coach)/roster`, `students/[id]`; `pnpm typecheck` → xanh.

- [ ] **Step 4: Storyboard từ story → chạy lại luồng → xanh**

```bash
rm -f docs/flows/F09/*.png
SB_URL=http://localhost:6007 CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node scripts/shot-storybook.mjs docs/flows/F09 '^f09--' 390 844
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/flow-web.mjs docs/flows/F09/steps.json
```
Expected: mọi dòng `ok`; `PASS F09: 48 bước, 13 bước chụp, 8 story biến thể`.

- [ ] **Step 5: Đọc ảnh**

Đọc mọi ảnh `docs/flows/F09/` (sáng + tối) và ảnh điểm kiểm: TabBar 5 tab cuộn ngang không cắt nhãn; màn 403 ở chế độ tối đọc rõ; ảnh bước 05, 08
không có nút Sửa / Xoá / Lưu trữ.

- [ ] **Step 6: Gates + commit**

Run: `pnpm typecheck && pnpm test && pnpm check:literals` → xanh. `pkill -f "expo start"; lsof -ti tcp:6007 | xargs kill`.
```bash
git add docs/flows/F09.md docs/flows/F09 storybook-app/flows/F09-hlv-xem-hoc-vien.stories.tsx storybook-app/README.md storybook-app/issues
git add -u apps/golf
git commit -m "$(cat <<'EOF'
docs(flows): F9 HLV xem học viên — storyboard roster → chi tiết 5 tab chỉ đọc → 403/404; chữ rỗng tab Tổng quan rõ số liệu / video

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 23: F1 Người chơi mới — đi luồng đăng ký → onboarding → số liệu đầu tiên

**Files:**
- Create: `docs/flows/F01.md`, `docs/flows/F01/steps.json`, `docs/flows/F01/<story-id>.<light|dark>.png` (sinh từ story)
- Modify: `storybook-app/flows/F01-nguoi-choi-moi.stories.tsx`, `storybook-app/README.md`, `storybook-app/issues/*.md`
- Modify (chỉ khi gặp ngõ cụt): màn liên quan, ghi vào "Đã sửa trong lượt đi"

**Interfaces:** Consumes `scripts/flow-web.mjs` (Task 17), `appStory` + `shot-storybook.mjs` (Task 15); `ClubPicker` chọn sẵn gậy vừa thêm (Task 21);
`TrendChart` / `ConcentricRings` dưới 2 buổi / 1 gậy (Task 20 Step 4b) — Tổng quan của người chơi mới (bước 10).

- [ ] **Step 1: Kịch bản — `docs/flows/F01/steps.json`**

```json
{
  "flow": "F01",
  "title": "Người chơi mới",
  "account": "(chưa đăng nhập)",
  "start": "/",
  "steps": [
    { "expect": "Tạo tài khoản" },
    { "shot": "01-chao", "do": "Mở app lần đầu", "see": "Logo GramGolf, tagline, Tạo tài khoản / Đăng nhập" },
    { "click": "Tạo tài khoản" },
    { "click": "Người chơi" },
    { "shot": "02-chon-vai-tro", "do": "Tạo tài khoản → chọn Người chơi", "see": "B1 Vai trò: thẻ Người chơi được chọn, nút Tiếp bật" },
    { "click": "Tiếp" },
    { "click": "Tiếp" },
    { "expect": "Bắt buộc" },
    { "shot": "03-loi-form", "do": "Tiếp → Tiếp khi để trống", "see": "B2: lỗi đỏ từng ô (Bắt buộc)" },
    { "type": "Lê Văn Hải", "into": "Họ tên" },
    { "type": "hai.le@vidu.vn", "into": "Email" },
    { "type": "0911222333", "into": "Số điện thoại" },
    { "type": "golf2026", "into": "Mật khẩu" },
    { "type": "24,5", "into": "Handicap" },
    { "click": "Tiếp" },
    { "expect": "Nhập mã 6 số" },
    { "shot": "04-otp", "do": "Điền họ tên, email, SĐT, mật khẩu, handicap 24,5 → Tiếp", "see": "Xác minh số điện thoại: OtpField 6 ô, Mã thử 123456, Gửi lại mã sau … s" },
    { "type": "123456", "into": "OTP" },
    { "expect": "Ảnh đại diện" },
    { "click": "Chọn ảnh" },
    { "shot": "05-anh-dai-dien", "do": "Nhập 123456", "see": "Onboarding 1/3: Chọn ảnh → ảnh mẫu; Dùng chữ tắt (ảnh tuỳ chọn)" },
    { "click": "Tiếp" },
    { "click": "Mét" },
    { "click": "Tiếp" },
    { "expect": "Bạn có mã mời từ HLV?" },
    { "shot": "06-ma-moi", "do": "Tiếp → Mét → Tiếp", "see": "Onboarding 3/3: Nhập mã / Để sau" },
    { "click": "Để sau" },
    { "expect": "Chưa có số liệu" },
    { "shot": "07-tong-quan-trong", "do": "Để sau", "see": "Tổng quan trống: Chưa có HLV chính; Chưa có số liệu + Nhập số liệu đầu tiên" },
    { "click": "Nhập số liệu đầu tiên" },
    { "click": "Nhập tay" },
    { "click": "Gậy, chưa chọn" },
    { "expect": "Thêm gậy mới" },
    { "shot": "08-chua-co-gay", "do": "Nhập số liệu đầu tiên → Nhập tay → Gậy", "see": "Sheet chọn gậy trống, chỉ có Thêm gậy mới" },
    { "click": "Thêm gậy mới" },
    { "click": "Loại gậy, chưa chọn" },
    { "click": "Driver" },
    { "type": "Callaway", "into": "Hãng" },
    { "type": "Paradym", "into": "Model" },
    { "type": "Project X", "into": "Hãng cán" },
    { "type": "58", "into": "Lie (°)" },
    { "click": "Lưu" },
    { "expect": "Gậy, Driver · Callaway Paradym" },
    { "shot": "09-gay-chon-san", "do": "Thêm gậy mới: Driver (loft gợi ý 10,5°), Callaway Paradym → Lưu", "see": "Quay lại form, gậy vừa thêm đã được chọn sẵn" },
    { "type": "95", "into": "Tốc độ đầu gậy (mph)" },
    { "type": "135", "into": "Tốc độ bóng (mph)" },
    { "type": "1,42", "into": "Smash factor" },
    { "type": "3100", "into": "Spin (rpm)" },
    { "type": "13", "into": "Góc bắn (°)" },
    { "type": "195", "into": "Carry (m)" },
    { "click": "Lưu" },
    { "expect": "Chỉ số swing gần nhất", "timeout": 8000 },
    { "shot": "10-tong-quan-co-du-lieu", "do": "Điền 6 chỉ số → Lưu", "see": "Tổng quan: 95 mph · 135 mph · 1,42 · 195 m; xu hướng Driver: Cần ít nhất 2 buổi để thấy xu hướng; Carry theo gậy: Driver 195 m (không vẽ vòng)" }
  ]
}
```
Tạo `docs/flows/F01.md`:
```markdown
# F1 — Người chơi mới

**Tài khoản:** tạo mới trong luồng (Lê Văn Hải, hai.le@vidu.vn, 0911 222 333). **Bắt đầu:** web `/` (chưa đăng nhập) · Expo Go: Dev › Kiểm tra theo luồng › F1 (tự đăng xuất)
· Storybook app: `Luồng/F01 · Người chơi mới`.
**Chạy lại:** `node scripts/flow-web.mjs docs/flows/F01/steps.json` (Metro web + Storybook app đang chạy). **Mã OTP thử:** 123456.

## Các bước
<!-- steps:start -->
<!-- steps:end -->

## Đã sửa trong lượt đi
- Không có.

## Đã biết / chưa làm
- Ảnh đại diện tuỳ chọn, có thể dùng chữ tắt (plan Task 4) — MVP "bắt buộc Avatar" không làm (mâu thuẫn (c)); Tên bắt buộc ở bước đăng ký.
- Auth là mock: mật khẩu không lưu; đăng nhập lại nhận mật khẩu bất kỳ ≥ 6 ký tự.
- Thoát app giữa onboarding rồi mở lại → vào thẳng Tổng quan (không có cổng onboarding).
- Tài khoản mới chỉ sống trong phiên (dữ liệu trong bộ nhớ); tải lại trang / reload Expo là mất.
```

- [ ] **Step 1b: Sửa minor Task 12 (phân loại Task 15 #12, #15–#19)**

1. `apps/golf/components/PostItem.tsx`:
   - trên dòng 13 (`const postLink = …`) thêm
     `// ponytail: link bài giả (chưa có domain / deep link thật) — có backend thì lấy link chia sẻ từ server, mở app bằng universal link.`;
   - bỏ state `sent` (dòng 25) và dòng `setSent(true);` trong `onSend`; nút Chia sẻ (dòng 83) thành
     `<SocialAction type="Share" accessibilityLabel="Chia sẻ" onPress={() => setSharing(true)} />` (nhãn "Đã sao chép" kẹt mãi sau lần gửi
     đầu; `announceForAccessibility` đã báo);
   - thân bài rút gọn (dòng 56) thành
     `<Pressable accessibilityRole="button" accessibilityLabel={post.title} accessibilityHint="Mở bài viết" onPress={onOpen} style={[pad, { gap: t.space('Spacing/Gap/2XSmall') }]}>`
     (trình đọc màn hình đọc tiêu đề thay cho cả 4 dòng nội dung);
   - thêm cuối file (import thêm `postsBy` từ `'../lib/selectors'`, `Section` từ `'./Section'`, `type ID` từ `'../lib/domain'` cạnh `Post`):
```tsx
/** Mục "Bài đăng" của một người (hồ sơ HLV, hồ sơ người dùng, tab Hồ sơ của HLV): bài mới → cũ, chạm → chi tiết bài. */
export function PostsSection({ authorId }: { authorId: ID }) {
  const t = useTheme();
  const { state } = useStore();
  const posts = postsBy(state, authorId);
  return (
    <Section title="Bài đăng" caption={posts.length ? `${posts.length} bài` : undefined}>
      {posts.length ? (
        <View style={{ gap: t.space('Spacing/Gap/Small') }}>
          {posts.map((p) => (
            <PostItem key={p.id} post={p} onOpen={() => router.push(`/posts/${p.id}`)} />
          ))}
        </View>
      ) : (
        <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light" style={{ paddingHorizontal: t.layout('Margin-Small') }}>
          Chưa có bài đăng.
        </Text>
      )}
    </Section>
  );
}
```
2. Dùng `PostsSection` thay 3 bản chép (bỏ `const posts = postsBy(…)` và import `postsBy` / `Section` / `PostItem` thành thừa ở mỗi file):
   - `apps/golf/app/coaches/[id].tsx` dòng 59–73 → `{!blocked && <PostsSection authorId={coach.id} />}`;
   - `apps/golf/app/users/[id].tsx` khối `{!blocked && (<Section title="Bài đăng" …> … </Section>)}` (dòng 84–98) → `{!blocked && <PostsSection authorId={user.id} />}`;
   - `apps/golf/app/(coach)/me.tsx` dòng 35–47 → `<PostsSection authorId={me.id} />`.
3. `apps/golf/components/People.tsx:66`: `` `hcp ${formatValue(p.handicap)}` `` → `` `Handicap ${formatValue(p.handicap)}` `` (cùng chữ với hồ sơ, roster,
   chi tiết học viên); JSDoc dòng 60 `"hcp 14"` → `"Handicap 14"`.
4. `apps/golf/app/posts/[id].tsx` — xoá bài: đang `back()` rồi `dispatch` cùng nhịp (dòng 192–197) → màn đang rời nháy "Không tìm thấy bài viết".
   Import `useOnLeave` từ `'../../components/useOnLeave'`; thêm trước `if (!me)` (dòng 39):
```tsx
  const deleteOnLeave = useOnLeave(() => dispatch({ type: 'deletePost', id })); // xoá SAU khi rời màn
```
   `onPrimary` của Dialog "Xoá bài viết?" thành `setConfirmDelete(false); deleteOnLeave(); back();`.
Run: `pnpm typecheck` → xanh. Story `f10--kham-pha`, `f10--ho-so-nguoi-dung`, `f12--ho-so-hlv-tab` chụp lại không đổi bố cục (chữ "Handicap 14").

- [ ] **Step 2: Chạy lượt đi**

Như Task 22 Step 2: lượt đi qua hết 53 bước, lần đầu chỉ đỏ ở dòng `✗ thiếu story …`.

- [ ] **Step 3: Story F1 — `storybook-app/flows/F01-nguoi-choi-moi.stories.tsx`**

Theo "Cách chạy một task luồng" bước 5. Đổi hằng `draft` của bản dựng thành người của `steps.json`
(`{ role: 'player', name: 'Lê Văn Hải', email: 'hai.le@vidu.vn', phone: '0911222333', handicap: 24.5 }`) và `DRIVER` thành gậy của bước 09
(Driver · Callaway Paradym, cán Project X, loft 10,5, lie 58) để ảnh story khớp lượt đi.

| nn | Story | Thay đổi |
|---|---|---|
| 01 | bản dựng `01 · Màn chào` | đổi export → `B01Chao` |
| 02 | bản dựng `02 · Đăng ký — chọn vai Người chơi` | `B02ChonVaiTro` |
| 03 | bản dựng `03a · Đăng ký — lỗi bỏ trống` | `B03LoiForm` |
| 04 | bản dựng `04 · Xác minh OTP` | `B04Otp` |
| 05 | bản dựng `05 · Onboarding — ảnh đại diện` | `B05AnhDaiDien`, thêm `play` bấm `Chọn ảnh` |
| 06 | bản dựng `05b · Onboarding — mã mời từ HLV` | `B06MaMoi` |
| 07 | bản dựng `06 · Tổng quan trống` | `B07TongQuanTrong` |
| 08 | bản dựng `08 · Nhập tay — chưa có gậy` | `B08ChuaCoGay`, thêm `play` bấm `Gậy, chưa chọn` |
| 09 | mới: `metrics/manual`, `setup: withDriver` | `B09GayChonSan`, `play` `Gậy, chưa chọn` → `Driver` (ảnh trạng thái đã chọn; hành vi chọn sẵn do lượt CDP chứng minh) |
| 10 | bản dựng `09 · Tổng quan có dữ liệu` | `B10TongQuanCoDuLieu` |

**Biến thể** (đổi `name`): `03a · Đăng ký — thông tin hợp lệ` (03), `03b · Đăng ký — email / SĐT đã có` (03b), `04a · OTP — sai mã` (04a),
`04b · OTP — thiếu thông tin đăng ký` (04b), `05a · Onboarding — đơn vị đo` (05a), `07a · Chọn nguồn số liệu` (07), `09a · Nhập tay — lỗi` (08a),
`09b · Nhập tay — đã lưu` (08b, thêm `hold: ['toast']`). README: id F01 cho `index`, `(auth)/welcome`, `(auth)/register`, `(auth)/verify-otp`,
`(auth)/onboarding`. `pnpm typecheck` → xanh.

- [ ] **Step 4: Storyboard từ story → chạy lại luồng → đọc ảnh, gates, commit**

```bash
rm -f docs/flows/F01/*.png
SB_URL=http://localhost:6007 CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node scripts/shot-storybook.mjs docs/flows/F01 '^f01--' 390 844
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/flow-web.mjs docs/flows/F01/steps.json
```
Expected: mọi dòng `ok`; `PASS F01: 53 bước, 10 bước chụp, 8 story biến thể`. Đọc mọi ảnh (sáng + tối) và ảnh điểm kiểm. Run:
`pnpm typecheck && pnpm test && pnpm check:literals` → xanh. `pkill -f "expo start"; lsof -ti tcp:6007 | xargs kill`.
```bash
git add docs/flows/F01.md docs/flows/F01 storybook-app/flows/F01-nguoi-choi-moi.stories.tsx storybook-app/README.md storybook-app/issues
git add -u apps/golf
git commit -m "$(cat <<'EOF'
docs(flows): F1 người chơi mới — storyboard đăng ký → onboarding → số liệu đầu tiên

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 24: F2 HLV mới — bước "Giới thiệu nghề nghiệp" ở onboarding, cùng luật ở Tài khoản

**Files:**
- Modify:
  - `apps/golf/app/(auth)/onboarding.tsx`: bước bio cho HLV, bắt buộc; câu dẫn bước ảnh theo vai trò (phân loại Task 15 #7)
  - `apps/golf/app/settings/account.tsx` (Task 13 dựng): gợi ý + giới hạn bio theo vai trò (lỗi bio HLV đã ở `validateAccount` — Task 16)
- Create: `docs/flows/F02.md`, `docs/flows/F02/steps.json`, `docs/flows/F02/<story-id>.<light|dark>.png` (sinh từ story)
- Modify: `storybook-app/flows/F02-hlv-moi.stories.tsx`, `storybook-app/README.md`, `storybook-app/issues/*.md`

**Interfaces:**
- Consumes (Task 16): `validateBio`, `BIO_MIN`, `BIO_MAX` (= 300), `validateAccount` (HLV: lỗi bio theo `validateBio`); action `updateProfile`.
- Consumes (Task 15): `appStory`, `typeIn`, `shot-storybook.mjs`; (Task 17): `scripts/flow-web.mjs`.
- Produces: onboarding của HLV có 4 bước: Ảnh đại diện → Đơn vị đo → Giới thiệu nghề nghiệp → Mời học viên đầu tiên. Người chơi giữ 3 bước.

- [ ] **Step 1: Kịch bản — `docs/flows/F02/steps.json`**

```json
{
  "flow": "F02",
  "title": "HLV mới",
  "account": "(chưa đăng nhập)",
  "start": "/",
  "steps": [
    { "click": "Tạo tài khoản" },
    { "click": "Huấn luyện viên" },
    { "click": "Tiếp" },
    { "type": "Ngô Bảo Châu", "into": "Họ tên" },
    { "type": "chau.coach@vidu.vn", "into": "Email" },
    { "type": "0977111222", "into": "Số điện thoại" },
    { "type": "coach2026", "into": "Mật khẩu" },
    { "type": "Học viện Golf Sông Hồng", "into": "Học viện / CLB" },
    { "type": "6", "into": "Số năm kinh nghiệm" },
    { "shot": "01-dang-ky-hlv", "do": "Tạo tài khoản → Huấn luyện viên → Tiếp → điền form", "see": "B2 của HLV: Học viện / CLB + Số năm kinh nghiệm" },
    { "click": "Tiếp" },
    { "type": "123456", "into": "OTP" },
    { "expect": "Ảnh đại diện" },
    { "click": "Tiếp" },
    { "click": "Tiếp" },
    { "expect": "Giới thiệu nghề nghiệp" },
    { "click": "Tiếp" },
    { "expect": "Bắt buộc" },
    { "shot": "02-bio-bat-buoc", "do": "OTP 123456 → Tiếp (bỏ ảnh) → Tiếp (Mét) → Tiếp khi để trống", "see": "Bước 3/4 Giới thiệu nghề nghiệp: Bắt buộc, vẫn ở bước này" },
    { "type": "Dạy swing", "into": "Giới thiệu" },
    { "click": "Tiếp" },
    { "expect": "Tối thiểu 20 ký tự" },
    { "shot": "03-bio-ngan", "do": "Gõ “Dạy swing” → Tiếp", "see": "Tối thiểu 20 ký tự; đếm 9/300" },
    { "type": "6 năm dạy swing cơ bản và tempo cho người mới, mỗi tuần 2 buổi ở sân Sông Hồng.", "into": "Giới thiệu" },
    { "shot": "04-bio-hop-le", "do": "Gõ giới thiệu đầy đủ", "see": "Không lỗi; đếm ký tự" },
    { "click": "Tiếp" },
    { "expect": "Mời học viên đầu tiên" },
    { "click": "Để sau" },
    { "expect": "Chưa có học viên" },
    { "shot": "05-hoc-vien-trong", "do": "Tiếp → Để sau", "see": "Tab Học viên trống: Chưa có học viên + Mời học viên" },
    { "click": "Mời học viên" },
    { "click": "Tạo mã mời" },
    { "read": "^[A-HJ-NP-Z2-9]{6}$", "as": "code" },
    { "shot": "06-ma-moi-dau-tien", "do": "Mời học viên → Tạo mã mời", "see": "Mã ${code}, hạn 7 ngày; Chia sẻ / Sao chép; mục Mời học viên cụ thể" },
    { "back": true },
    { "click": "Hồ sơ", "role": "tab" },
    { "expect": "6 năm dạy swing cơ bản" },
    { "shot": "07-ho-so-hlv", "do": "Quay lại → tab Hồ sơ", "see": "Hồ sơ HLV: học viện, 6 năm, giới thiệu vừa nhập" }
  ]
}
```
Tạo `docs/flows/F02.md`:
```markdown
# F2 — HLV mới

**Tài khoản:** tạo mới (Ngô Bảo Châu, chau.coach@vidu.vn). **Bắt đầu:** web `/` · Expo Go: Dev › Kiểm tra theo luồng › F2 · Storybook app:
`Luồng/F02 · HLV mới`.
**Chạy lại:** `node scripts/flow-web.mjs docs/flows/F02/steps.json` (Metro web + Storybook app đang chạy). **Mã OTP thử:** 123456.

## Các bước
<!-- steps:start -->
<!-- steps:end -->

## Đã sửa trong lượt đi
- Không có.

## Đã biết / chưa làm
- Giới thiệu nghề nghiệp bắt buộc ở onboarding (20–300 ký tự); sửa sau ở Hồ sơ › Chỉnh sửa hồ sơ với cùng luật.
- HLV mới chưa có đánh giá / học phí → các mục đó ẩn ở hồ sơ công khai.
- Ảnh đại diện tuỳ chọn (plan Task 4); auth mock như F1.
```

- [ ] **Step 2: Chạy — thấy đỏ**

Expected: `✗ 16 {"expect":"Giới thiệu nghề nghiệp"}`. Lúc này bước sau "Đơn vị đo" vẫn là "Mời học viên đầu tiên".

- [ ] **Step 3: `(auth)/onboarding.tsx` — bước giới thiệu nghề nghiệp, câu dẫn ảnh theo vai trò**

Bản sau Task 16 (`pickAvatar` dùng `nextSampleAvatar`, không còn `SAMPLE_AVATARS` trong file). Import: dòng 1 → `import { useState, type ReactNode }
from 'react';`; thêm `TextArea` vào import `@gr/ds`; thêm `import { BIO_MAX, BIO_MIN, validateBio } from '../../lib/validation';`.

Thêm state ngay sau `const [step, setStep] = useState(0);` (trước `if (!me)`):
```tsx
  const [bio, setBio] = useState('');
  const [bioTried, setBioTried] = useState(false); // chỉ báo lỗi sau lần bấm Tiếp đầu tiên ở bước này
```
Thay toàn bộ khai báo `const pages = [ … ];` bằng (bước "Ảnh đại diện" đổi câu dẫn theo vai trò — phân loại Task 15 #7; "Đơn vị đo" và bước cuối giữ
nguyên chữ; bước mới chỉ có ở HLV):
```tsx
  const bioError = validateBio(bio);
  const pages: { title: string; caption: string; body: ReactNode; next?: () => boolean }[] = [
    {
      title: 'Ảnh đại diện',
      caption: me.role === 'coach' ? 'Giúp học viên và bạn bè nhận ra bạn.' : 'Giúp HLV và bạn bè nhận ra bạn.',
      body: (
        <View style={{ alignItems: 'center', gap: t.space('Spacing/Gap/Medium') }}>
          <Avatar size="3XLarge" theme={me.avatarUrl ? 'Photo' : 'Accent'} source={me.avatarUrl ? { uri: me.avatarUrl } : undefined} initials={initials(me.name)} accessibilityLabel={`Ảnh đại diện ${me.name}`} />
          <View style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/Small') }}>
            <Button level="Secondary" size="Medium (Base)" leadingIcon="image-plus-line" text={me.avatarUrl ? 'Đổi ảnh' : 'Chọn ảnh'} onPress={pickAvatar} />
            {me.avatarUrl && <Button level="Tertiary" size="Medium (Base)" text="Dùng chữ tắt" onPress={() => dispatch({ type: 'updateProfile', id: me.id, patch: { avatarUrl: undefined } })} />}
          </View>
        </View>
      ),
    },
    {
      title: 'Đơn vị đo',
      caption: 'Đổi lại bất cứ lúc nào trong Cài đặt.',
      body: (
        <View accessibilityRole="radiogroup" accessibilityLabel="Đơn vị đo">
          {UNITS.map((u) => (
            <RadioRow key={u.value} label={u.label} caption={u.caption} select={units === u.value} onPress={() => dispatch({ type: 'setPrefs', userId: me.id, patch: { units: u.value } })} />
          ))}
        </View>
      ),
    },
    ...(me.role === 'coach'
      ? [
          {
            title: 'Giới thiệu nghề nghiệp',
            caption: 'Học viên đọc phần này ở hồ sơ HLV của bạn trước khi kết nối.',
            body: (
              <TextArea
                label="Giới thiệu"
                placeholder="VD: 8 năm dạy swing cơ bản và tempo cho người mới, chuyên short game."
                value={bio}
                onChangeText={setBio}
                maxLength={BIO_MAX}
                error={bioTried ? bioError : undefined}
                helpText={`${bio.trim().length}/${BIO_MAX} ký tự · tối thiểu ${BIO_MIN}`}
              />
            ),
            // MVP §2 "với HLV cần thêm Bio nghề nghiệp": bắt buộc — hợp lệ mới lưu vào hồ sơ và sang bước sau
            next: () => {
              setBioTried(true);
              if (bioError) return false;
              dispatch({ type: 'updateProfile', id: me.id, patch: { bio: bio.trim() } });
              return true;
            },
          },
        ]
      : []),
    me.role === 'player'
      ? {
          title: 'Bạn có mã mời từ HLV?',
          caption: 'Nhập mã để kết nối — HLV sẽ xem được thông số, swing và bộ gậy của bạn.',
          body: <Button level="Secondary" leadingIcon="key-line" text="Nhập mã" onPress={() => finish('/connect/accept')} />,
        }
      : {
          title: 'Mời học viên đầu tiên',
          caption: 'Tạo mã mời có hạn 7 ngày và gửi cho học viên.',
          body: <Button level="Secondary" leadingIcon="user-plus-line" text="Tạo mã mời" onPress={() => finish('/connect/invite')} />,
        },
  ];
```
Nút bên phải ở chân màn (dòng 86) thay bằng:
```tsx
            <Button
              level={last ? 'Tertiary' : 'Primary'}
              text={last ? 'Để sau' : 'Tiếp'}
              onPress={() => {
                if (page.next && !page.next()) return;
                if (last) finish();
                else setStep(step + 1);
              }}
            />
```
`PageIndicator count={pages.length}` tự thành 4 chấm cho HLV.

- [ ] **Step 4: `settings/account.tsx` — cùng luật bio ở Tài khoản**

Lỗi bio của HLV đã đi qua `validateAccount` (Task 16 Step 10: HLV → `validateBio`), nên màn chỉ đổi gợi ý + giới hạn gõ. Import: dòng 7 thêm
`BIO_MIN` (`import { BIO_MAX, BIO_MIN, RATE_MAX_VND, validateAccount, type AccountRaw } from '../../lib/validation';`). Thay `<TextArea … />` (dòng 53–60):
```tsx
          <TextArea
            label="Giới thiệu"
            placeholder={me.role === 'coach' ? 'VD: 8 năm dạy swing cơ bản và tempo cho người mới, chuyên short game.' : 'Vài dòng về lối chơi, mục tiêu của bạn'}
            // HLV: bắt buộc 20–300 ký tự như bước onboarding; người chơi: tuỳ chọn
            helpText={me.role === 'coach' ? `${raw.bio.trim().length}/${BIO_MAX} ký tự · tối thiểu ${BIO_MIN}` : `Tuỳ chọn, tối đa ${BIO_MAX} ký tự`}
            maxLength={BIO_MAX}
            value={raw.bio}
            onChangeText={(bio) => setRaw((r) => ({ ...r, bio }))}
            error={errors.bio}
          />
```

- [ ] **Step 5: Story F2 — `storybook-app/flows/F02-hlv-moi.stories.tsx`**

Theo "Cách chạy một task luồng" bước 5. Đổi hằng `draft` của bản dựng thành người của `steps.json` (`{ role: 'coach', name: 'Ngô Bảo Châu',
email: 'chau.coach@vidu.vn', phone: '0977111222', academy: 'Học viện Golf Sông Hồng', yearsExperience: 6 }`). `BIO` = câu giới thiệu đầy đủ ở
`steps.json`.

| nn | Story | `appStory` / `play` |
|---|---|---|
| 01 | bản dựng `03 · Đăng ký — thông tin HLV hợp lệ` → `B01DangKyHlv` | giữ |
| 02 | mới `B02BioBatBuoc`: `(auth)/onboarding` | `setup` đăng ký `draft` như bản dựng `05`; `play` `Tiếp` × 3 (ảnh → đơn vị → bio trống) |
| 03 | mới `B03BioNgan` | như 02 nhưng `Tiếp` × 2 → `typeIn` ô `Giới thiệu` = `Dạy swing` → `Tiếp` |
| 04 | mới `B04BioHopLe` | `Tiếp` × 2 → `typeIn` ô `Giới thiệu` = `BIO` |
| 05 | bản dựng `06 · Học viên trống` → `B05HocVienTrong` | giữ |
| 06 | bản dựng `08 · Mời học viên — đã tạo mã` → `B06MaMoiDauTien` | giữ |
| 07 | mới `B07HoSoHlv`: `(coach)/me` | `setup` đăng ký `draft` + `{ type: 'updateProfile', id: <id của draft>, patch: { bio: BIO } }`, tabs me |

**Biến thể** (đổi `name`): `01a · Màn chào` (01), `01b · Đăng ký — chọn vai Huấn luyện viên` (02), `01c · Đăng ký — lỗi thông tin HLV` (03a),
`01d · Xác minh OTP` (04), `02a · Onboarding — ảnh đại diện` (05), `04a · Onboarding — mời học viên đầu tiên (bước 4/4)` (05a, `Tiếp` × 3 sau khi
`typeIn` bio hợp lệ), `05a · Học viên trống — mục Lời mời` (06a), `06a · Mời học viên — chưa có mã` (07), `06b · Học viên — lời mời đang chờ` (08a),
mới `07a · Tài khoản HLV — giới thiệu quá ngắn` (`settings/account`, `as: 'c-tuan'`, `typeIn` `Giới thiệu` = `Ngắn quá` → `Lưu`). README: id F02 cho
`(auth)/onboarding`, `(coach)/me`, `settings/account`; xoá dòng F02 ở "Chưa có (Phase 2)". `pnpm typecheck` → xanh.

- [ ] **Step 6: Storyboard từ story → chạy lại luồng → xanh; đọc ảnh**

```bash
rm -f docs/flows/F02/*.png
SB_URL=http://localhost:6007 CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node scripts/shot-storybook.mjs docs/flows/F02 '^f02--' 390 844
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/flow-web.mjs docs/flows/F02/steps.json
```
Expected: mọi dòng `ok`; `PASS F02: 38 bước, 7 bước chụp, 10 story biến thể`. Ảnh bước `02`–`04`:
- PageIndicator có 4 chấm;
- TextArea không bị bàn phím che (web không có bàn phím; Expo Go kiểm ở Task 30).

Kiểm tay thêm: đăng nhập `?as=c-tuan` → Hồ sơ › Chỉnh sửa hồ sơ → xoá bio → Lưu → báo "Bắt buộc".

- [ ] **Step 7: Gates + commit**

Run: `pnpm typecheck && pnpm test && pnpm check:literals` → xanh. `pkill -f "expo start"; lsof -ti tcp:6007 | xargs kill`.
```bash
git add "apps/golf/app/(auth)/onboarding.tsx" apps/golf/app/settings/account.tsx docs/flows/F02.md docs/flows/F02
git add storybook-app/flows/F02-hlv-moi.stories.tsx storybook-app/README.md storybook-app/issues
git commit -m "$(cat <<'EOF'
feat(onboarding): HLV nhập giới thiệu nghề nghiệp (bắt buộc, 20–300 ký tự), cùng luật ở Tài khoản, câu dẫn ảnh theo vai trò + storyboard F2

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 25: F3 Tài khoản — đặt lại mật khẩu từ link, chữ "link" ở quên mật khẩu, chặn chưa đăng nhập ở đổi mật khẩu

**Files:**
- Create: `apps/golf/app/(auth)/reset-password.tsx`
- Modify:
  - `apps/golf/app/(auth)/forgot-password.tsx`: chữ "link", nút mở link mô phỏng (dev)
  - `apps/golf/app/(auth)/login.tsx`: thông báo sau khi đặt lại
  - `apps/golf/app/settings/password.tsx` (Task 13 dựng — đã dùng chung luật mật khẩu với đăng ký qua `validatePasswordChange`): guard chưa đăng
    nhập, placeholder bằng chữ (phân loại Task 15 #11, #20)
- Create: `docs/flows/F03.md`, `docs/flows/F03/steps.json`, `docs/flows/F03/<story-id>.<light|dark>.png` (sinh từ story)
- Modify: `storybook-app/flows/F03-tai-khoan.stories.tsx`, `storybook-app/README.md`, `storybook-app/issues/*.md`

**Interfaces:**
- Consumes (Task 16): `resetTokenStatus`, `RESET_TOKENS`, `validateNewPassword` (cùng `passwordError` với đăng ký / đổi mật khẩu).
- Consumes (Task 15): `appStory`, `typeIn`, `shot-storybook.mjs`; (Task 17): `scripts/flow-web.mjs`.
- Produces:
  - route `/(auth)/reset-password?token=<token>` (URL web `/reset-password`, deep link `gramgolf://reset-password?token=…`);
  - `/(auth)/login?reset=1` hiện thông báo đã đặt lại.

- [ ] **Step 1: Kịch bản — `docs/flows/F03/steps.json`**

```json
{
  "flow": "F03",
  "title": "Tài khoản",
  "account": "(chưa đăng nhập)",
  "start": "/",
  "steps": [
    { "click": "Đăng nhập", "role": "button" },
    { "type": "khongco@vidu.vn", "into": "Email hoặc số điện thoại" },
    { "type": "123456", "into": "Mật khẩu" },
    { "click": "Đăng nhập", "role": "button" },
    { "expect": "Email/SĐT hoặc mật khẩu không đúng" },
    { "shot": "01-dang-nhap-sai", "do": "Đăng nhập với email chưa có tài khoản", "see": "Email/SĐT hoặc mật khẩu không đúng" },
    { "click": "Quên mật khẩu?" },
    { "type": "minhanh@", "into": "Email" },
    { "click": "Gửi link" },
    { "expect": "Email không hợp lệ" },
    { "shot": "02-quen-mk-loi", "do": "Quên mật khẩu? → email sai dạng → Gửi link", "see": "Email không hợp lệ" },
    { "type": "minhanh@gramgolf.vn", "into": "Email" },
    { "click": "Gửi link" },
    { "expect": "Đã gửi link đặt lại mật khẩu" },
    { "shot": "03-da-gui-link", "do": "Email đúng → Gửi link", "see": "Kiểm tra hộp thư: đã gửi link (hiệu lực 30 phút); Về đăng nhập; Mở link (thử) — chỉ bản dev" },
    { "click": "Mở link (thử)" },
    { "expect": "Đặt mật khẩu mới cho tài khoản của bạn" },
    { "type": "golfmoi", "into": "Mật khẩu mới" },
    { "type": "golfmoi1", "into": "Nhập lại mật khẩu mới" },
    { "click": "Đặt lại mật khẩu", "role": "button" },
    { "expect": "Tối thiểu 8 ký tự" },
    { "shot": "04-dat-lai-loi", "do": "Mở link → mật khẩu “golfmoi” (thiếu số) → Đặt lại", "see": "Mật khẩu mới: Tối thiểu 8 ký tự, có ít nhất 1 chữ số; Nhập lại: không khớp" },
    { "type": "golfmoi2026", "into": "Mật khẩu mới" },
    { "type": "golfmoi2026", "into": "Nhập lại mật khẩu mới" },
    { "click": "Đặt lại mật khẩu", "role": "button" },
    { "expect": "Đã đặt lại mật khẩu" },
    { "shot": "05-ve-dang-nhap", "do": "Mật khẩu hợp lệ 2 lần → Đặt lại", "see": "Màn Đăng nhập + thông báo Đã đặt lại mật khẩu" },
    { "type": "minhanh@gramgolf.vn", "into": "Email hoặc số điện thoại" },
    { "type": "golfmoi2026", "into": "Mật khẩu" },
    { "click": "Đăng nhập", "role": "button" },
    { "expect": "Chỉ số swing gần nhất" },
    { "shot": "06-vao-app", "do": "Đăng nhập Minh Anh với mật khẩu mới", "see": "Vào Tổng quan" },
    { "click": "Hồ sơ của tôi" },
    { "click": "Cài đặt", "role": "button" },
    { "click": "Mật khẩu" },
    { "type": "golfmoi2026", "into": "Mật khẩu hiện tại" },
    { "type": "golf2027", "into": "Mật khẩu mới" },
    { "type": "golf2028", "into": "Nhập lại mật khẩu mới" },
    { "click": "Đổi mật khẩu", "role": "button" },
    { "expect": "Mật khẩu nhập lại không khớp" },
    { "shot": "07-doi-mk-loi", "do": "Hồ sơ › Cài đặt › Mật khẩu: nhập lại khác", "see": "Mật khẩu nhập lại không khớp" },
    { "type": "golf2027", "into": "Nhập lại mật khẩu mới" },
    { "click": "Đổi mật khẩu", "role": "button" },
    { "expect": "Đã đổi mật khẩu" },
    { "shot": "08-doi-mk-xong", "do": "Sửa ô nhập lại → Đổi mật khẩu", "see": "Toast Đã đổi mật khẩu" },
    { "back": true },
    { "back": true },
    { "click": "Đăng xuất", "role": "button" },
    { "expect": "Đăng xuất?" },
    { "shot": "09-dang-xuat", "do": "Quay lại Hồ sơ → Đăng xuất", "see": "Dialog Đăng xuất? — Bạn sẽ cần đăng nhập lại" },
    { "click": "Đăng xuất", "role": "button" },
    { "expect": "Tạo tài khoản" },
    { "shot": "10-ve-chao", "do": "Xác nhận", "see": "Về màn chào" },
    { "open": "/reset-password?token=GG-RESET-EXPIRED", "account": "(chưa đăng nhập, mở link trong email)" },
    { "expect": "Link đã hết hạn" },
    { "shot": "11-link-het-han", "do": "Mở link đặt lại đã hết hạn", "see": "Link đã hết hạn + Gửi lại link" },
    { "open": "/reset-password", "account": "(chưa đăng nhập, link thiếu token)" },
    { "expect": "Link không hợp lệ" },
    { "shot": "12-link-sai", "do": "Mở link thiếu token", "see": "Link không hợp lệ + Gửi lại link" }
  ]
}
```
Tạo `docs/flows/F03.md`:
```markdown
# F3 — Tài khoản

**Tài khoản:** Nguyễn Minh Anh (minhanh@gramgolf.vn). **Bắt đầu:** web `/` (chưa đăng nhập) · Expo Go: Dev › Kiểm tra theo luồng › F3 ·
Storybook app: `Luồng/F03 · Tài khoản`.
**Chạy lại:** `node scripts/flow-web.mjs docs/flows/F03/steps.json` (Metro web + Storybook app đang chạy).
**Link đặt lại (mô phỏng):** nút "Mở link (thử)" sau khi gửi (bản dev), hoặc deep link `gramgolf://reset-password?token=GG-RESET-OK`; `GG-RESET-EXPIRED` = hết hạn; thiếu/sai token = không hợp lệ.

## Các bước
<!-- steps:start -->
<!-- steps:end -->

## Đã sửa trong lượt đi
- Không có.

## Đã biết / chưa làm
- Auth mock: mật khẩu không lưu — đặt lại / đổi mật khẩu chỉ kiểm định dạng; đăng nhập nhận mật khẩu bất kỳ ≥ 6 ký tự (plan Task 4).
- Token mô phỏng không bị vô hiệu sau khi dùng; bản thật: token 1 lần, hết hạn 30 phút, server kiểm.
- Màn quên mật khẩu luôn báo đã gửi (không tiết lộ email nào có tài khoản).
```

- [ ] **Step 2: Chạy — thấy đỏ**

Expected: `✗ 9 {"click":"Gửi link"}`. Nút hiện vẫn là "Gửi hướng dẫn".

- [ ] **Step 3: `(auth)/reset-password.tsx` (mới)**

```tsx
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, EmptyState, Screen, Text, TextField, useTheme } from '@gr/ds';
import { resetTokenStatus } from '../../lib/simulate';
import { validateNewPassword } from '../../lib/validation';
import { StackHeader } from '../../components/StackHeader';

/** Đặt lại mật khẩu từ link trong email (mô phỏng): `?token=` hợp lệ → nhập mật khẩu mới 2 lần → Đăng nhập (kèm thông báo).
 *  Link hết hạn / thiếu / sai → xin link mới. Deep link: gramgolf://reset-password?token=… */
export default function ResetPassword() {
  const t = useTheme();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const status = resetTokenStatus(token);
  const errors = submitted ? validateNewPassword(password, confirm) : {};
  const save = () => {
    setSubmitted(true);
    if (Object.keys(validateNewPassword(password, confirm)).length) return;
    // ponytail: bản mock không lưu mật khẩu (đăng nhập nhận mọi mật khẩu ≥ 6 ký tự) — backend thật đổi mật khẩu + vô hiệu token.
    router.replace({ pathname: '/(auth)/login', params: { reset: '1' } });
  };
  if (status !== 'ok') {
    const expired = status === 'expired';
    return (
      <Screen>
        <StackHeader title="Đặt lại mật khẩu" />
        <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
          <EmptyState
            icon="link-broken-01-line"
            title={expired ? 'Link đã hết hạn' : 'Link không hợp lệ'}
            caption={expired ? 'Link đặt lại mật khẩu chỉ dùng được trong 30 phút. Gửi lại link mới để tiếp tục.' : 'Link bị thiếu hoặc sai. Mở link mới nhất trong email, hoặc gửi lại link.'}
            primaryText="Gửi lại link"
            onPrimary={() => router.replace('/(auth)/forgot-password')}
          />
        </View>
      </Screen>
    );
  }
  return (
    <Screen>
      <StackHeader title="Đặt lại mật khẩu" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Medium') }}>
        <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Base">Đặt mật khẩu mới cho tài khoản của bạn.</Text>
        <TextField
          label="Mật khẩu mới"
          placeholder="Tối thiểu 8 ký tự, có chữ số"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          leadingIcon="lock-01-line"
          secureTextEntry={!show}
          autoComplete="new-password"
          trailingIcon={show ? 'eye-off-line' : 'eye-line'}
          trailingAccessibilityLabel={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          onTrailingPress={() => setShow((s) => !s)}
        />
        <TextField
          label="Nhập lại mật khẩu mới"
          placeholder="Nhập lại mật khẩu mới"
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
          leadingIcon="lock-01-line"
          secureTextEntry={!show}
          autoComplete="new-password"
          onSubmitEditing={save}
        />
        <Button text="Đặt lại mật khẩu" onPress={save} />
      </ScrollView>
    </Screen>
  );
}
```
Không bọc `KeyboardAvoid`: nút nằm trong `ScrollView` như `login.tsx` (Task 14 chỉ bọc form có footer cố định).

- [ ] **Step 4: `forgot-password.tsx`, `login.tsx`**

`forgot-password.tsx`:
- Thêm `import { RESET_TOKENS } from '../../lib/simulate';`.
- Câu dẫn (dòng 26): `Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu.`
- Nút (dòng 30): `text="Gửi link"`.
- `EmptyState` của màn đã gửi (dòng 21) đổi thành:
```tsx
          <EmptyState
            icon="mail-01-line"
            title="Kiểm tra hộp thư"
            caption={`Đã gửi link đặt lại mật khẩu tới ${value}. Link có hiệu lực 30 phút.`}
            primaryText="Về đăng nhập"
            onPrimary={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/login'))}
            // bản dev: mô phỏng bấm link trong email (như "Mã thử: 123456" ở OTP)
            {...(__DEV__ ? { secondaryText: 'Mở link (thử)', onSecondary: () => router.push({ pathname: '/(auth)/reset-password', params: { token: RESET_TOKENS.ok } }) } : {})}
          />
```
`login.tsx`:
- Đọc tham số: `const { reset } = useLocalSearchParams<{ reset?: string }>();` đặt sau `const [failed, setFailed] = useState(false);` (dòng 15);
  import `useLocalSearchParams` cạnh `router` từ `expo-router` (`InlineMessage` đã import).
- Đặt ngay trên `{failed && …}` (dòng 31):
```tsx
        {reset === '1' && !failed && <InlineMessage theme="Positive" text="Đã đặt lại mật khẩu. Đăng nhập bằng mật khẩu mới." />}
```

- [ ] **Step 5: `settings/password.tsx` — chặn chưa đăng nhập, placeholder bằng chữ (phân loại Task 15 #11, #20)**

Luật mật khẩu, nhãn 3 ô ("Mật khẩu hiện tại" / "Mật khẩu mới" / "Nhập lại mật khẩu mới"), nút "Đổi mật khẩu", lỗi theo trường và Toast "Đã đổi mật
khẩu" Task 13 đã làm (`validatePasswordChange` dùng `passwordError` chung với đăng ký) — giữ nguyên. Sửa 2 lỗi:
1. Màn duy nhất trong `settings/*` mở được khi đã đăng xuất (deep link). Dòng 3 → `import { Redirect, router } from 'expo-router';`, thêm
   `import { useStore } from '../../lib/store';`; trong component thêm `const { me } = useStore();` ở đầu và ngay sau `const [done, setDone] = useState(false);`
   (dòng 24, sau mọi hook):
```tsx
  if (!me) return <Redirect href="/" />;
```
2. Placeholder "••••••••" ở ô trống trông như đã có mật khẩu (nhất là theme tối). `FIELDS` (dòng 13, 15):
```tsx
  { key: 'current', label: 'Mật khẩu hiện tại', placeholder: 'Nhập mật khẩu đang dùng', autoComplete: 'current-password' },
```
```tsx
  { key: 'confirm', label: 'Nhập lại mật khẩu mới', placeholder: 'Nhập lại mật khẩu mới', autoComplete: 'new-password' },
```
Kiểm: web `/settings/password` (không `?as=`) → chuyển về màn chào.

- [ ] **Step 6: Story F3 — `storybook-app/flows/F03-tai-khoan.stories.tsx`**

Theo "Cách chạy một task luồng" bước 5. Màn mới `reset-password` import từ `../../apps/golf/app/(auth)/reset-password`.

| nn | Story | `appStory` / `play` |
|---|---|---|
| 01 | bản dựng `01b · Đăng nhập — sai tài khoản / mật khẩu` → `B01DangNhapSai` | giữ |
| 02 | bản dựng `03a · Quên mật khẩu — email không hợp lệ` → `B02QuenMkLoi` | giữ (nút giờ là `Gửi link`) |
| 03 | bản dựng `03b · Quên mật khẩu — đã gửi hướng dẫn` → `B03DaGuiLink` | bấm `Gửi link` thay `Gửi hướng dẫn`; ảnh có `Mở link (thử)` |
| 04 | mới `B04DatLaiLoi`: `(auth)/reset-password` | `params: { token: 'GG-RESET-OK' }`; `typeIn` `Mật khẩu mới` = `golfmoi`, `Nhập lại mật khẩu mới` = `golfmoi1` → `Đặt lại mật khẩu` |
| 05 | mới `B05VeDangNhap`: `(auth)/login` | `params: { reset: '1' }` |
| 06 | bản dựng `02 · Đăng nhập xong — điểm vào app (người chơi)` → `B06VaoApp` | giữ |
| 07 | bản dựng `05a · Đổi mật khẩu — lỗi` → `B07DoiMkLoi` | `typeIn` 3 ô như `steps.json` (nhập lại `golf2028`) → `Đổi mật khẩu` |
| 08 | bản dựng `05b · Đổi mật khẩu — đã đổi` → `B08DoiMkXong` | thêm `hold: ['toast']` |
| 09 | bản dựng `06a · Hồ sơ — dialog đăng xuất` → `B09DangXuat` | giữ |
| 10 | bản dựng `07 · Đã đăng xuất — điểm vào app` → `B10VeChao` | giữ (không `as`) |
| 11 | mới `B11LinkHetHan`: `(auth)/reset-password` | `params: { token: 'GG-RESET-EXPIRED' }` |
| 12 | mới `B12LinkSai`: `(auth)/reset-password` | không `params` |

**Biến thể** (đổi `name`): `01a · Đăng nhập — điền đúng` (01), `01b · Đăng nhập — bỏ trống` (01a), `02a · Quên mật khẩu` (03),
mới `04a · Đặt lại mật khẩu — form trống` (`params: { token: 'GG-RESET-OK' }`), mới `04b · Đặt lại mật khẩu — bỏ trống` (như 04a, bấm
`Đặt lại mật khẩu`), `06a · Đăng nhập xong — HLV` (02a), `07a · Cài đặt (lối vào Mật khẩu)` (04), `07b · Đổi mật khẩu — form` (05), `09a · Hồ sơ` (06).
README: id F03 cho `(auth)/login`, `(auth)/forgot-password`, `(auth)/reset-password` (route mới — thêm dòng vào bảng "Phủ route"),
`settings/password`, `profile`; xoá dòng F03 ở "Chưa có (Phase 2)". `pnpm typecheck` → xanh (Step 7 khởi động lại Metro trước để có kiểu route mới).

- [ ] **Step 7: Khởi động lại Metro (route mới), storyboard từ story, chạy lại → xanh**

`pkill -f "expo start"`, chạy lại Metro web để sinh `.expo/types/router.d.ts` có `/(auth)/reset-password`, rồi:
```bash
rm -f docs/flows/F03/*.png
SB_URL=http://localhost:6007 CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node scripts/shot-storybook.mjs docs/flows/F03 '^f03--' 390 844
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/flow-web.mjs docs/flows/F03/steps.json
```
Expected: mọi dòng `ok`; `PASS F03: 59 bước, 12 bước chụp, 9 story biến thể`.

- [ ] **Step 8: Đọc ảnh, gates, commit**

Đọc mọi ảnh (sáng + tối) và ảnh điểm kiểm (2 nút ở EmptyState "Kiểm tra hộp thư" không tràn; 3 trạng thái link: hợp lệ / hết hạn / sai).
Run: `pnpm typecheck && pnpm test && pnpm check:literals` → xanh. `pkill -f "expo start"; lsof -ti tcp:6007 | xargs kill`.
```bash
git add "apps/golf/app/(auth)/reset-password.tsx" "apps/golf/app/(auth)/forgot-password.tsx" "apps/golf/app/(auth)/login.tsx" apps/golf/app/settings/password.tsx docs/flows/F03.md docs/flows/F03
git add storybook-app/flows/F03-tai-khoan.stories.tsx storybook-app/README.md storybook-app/issues
git commit -m "$(cat <<'EOF'
feat(auth): đặt lại mật khẩu từ link (mô phỏng, hết hạn/sai link), quên mật khẩu gửi link, đổi mật khẩu chặn chưa đăng nhập + storyboard F3

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 26: F10 Cộng đồng — đi luồng bảng tin → bình luận → đăng bài → khám phá → chặn / báo cáo

Cộng đồng là tính năng ngoài MVP, giữ nguyên theo R4. Màn do Task 12 dựng. Task này đi luồng, sửa các minor Task 12 đã phân loại (Task 15 Step 12
#12, #15–#19), sửa ngõ cụt nếu có, rồi lưu storyboard.

**Files:**
- Create: `docs/flows/F10.md`, `docs/flows/F10/steps.json`, `docs/flows/F10/<story-id>.<light|dark>.png` (sinh từ story)
- Modify: `storybook-app/flows/F10-cong-dong.stories.tsx`, `storybook-app/README.md`, `storybook-app/issues/*.md`
- Modify (Step 1b): `apps/golf/components/PostItem.tsx` (`PostsSection`, nhãn a11y thân bài, bỏ nhãn "Đã sao chép" kẹt, comment `ponytail:` link giả),
  `apps/golf/app/coaches/[id].tsx`, `apps/golf/app/users/[id].tsx`, `apps/golf/app/(coach)/me.tsx` (dùng `PostsSection`), `apps/golf/components/People.tsx`
  ("Handicap"), `apps/golf/app/posts/[id].tsx` (xoá bài qua `useOnLeave`)
- Modify (chỉ khi gặp ngõ cụt): màn Task 12, ghi vào "Đã sửa trong lượt đi"

**Interfaces:** Consumes `scripts/flow-web.mjs` (Task 17), `appStory` + `typeIn` + `shot-storybook.mjs` (Task 15), `useOnLeave` (Task 21); màn
`CommunityScreen`, `community/compose`, `posts/[id]`, `users/[id]` (Task 12). Produces `PostsSection({ authorId })` (`components/PostItem.tsx`).

- [ ] **Step 1: Kịch bản — `docs/flows/F10/steps.json`**

Thích / bỏ thích ở bài HLV Tuấn: nút `SocialAction` có nhãn a11y `Thích, <n> lượt thích` (`components/PostItem.tsx:78`); Minh Anh đã thích bài này
trong dữ liệu mẫu (2 lượt). Chữ của màn Task 12 trong kịch bản đã đối chiếu với HEAD ebb90f4: ô tìm "Tìm người chơi, HLV", nút header "Chặn <tên>" /
"Báo cáo bài viết", Dialog chặn "Hai bạn sẽ không thấy bài của nhau…" + nút "Chặn", "Ai đã thích" → sheet tiêu đề "<n> lượt thích" + nút "Đóng",
ô bình luận placeholder "Viết bình luận…" + nút "Gửi", ô tag "VD: driver, tempo", ô "Đính kèm swing, …", lý do "Spam", nút "Gửi báo cáo".
```json
{
  "flow": "F10",
  "title": "Cộng đồng",
  "account": "Nguyễn Minh Anh",
  "start": "/(player)/community?as=p-minh",
  "steps": [
    { "expect": "3 bài tập giữ tempo 3:1 cho driver" },
    { "shot": "01-bang-tin", "do": "Minh Anh mở Cộng đồng", "see": "Bảng tin: bài HLV Tuấn, HLV Hà, Lê Đăng Khoa và của mình, mới → cũ; badge HLV" },
    { "click": "3 bài tập giữ tempo 3:1 cho driver" },
    { "expect": "Em tập metronome 2 tuần" },
    { "click": "Thích, 2 lượt thích" },
    { "expect": "Thích, 1 lượt thích" },
    { "click": "Thích, 1 lượt thích" },
    { "expect": "Thích, 2 lượt thích" },
    { "type": "Cảm ơn thầy, em sẽ thử 70 nhịp.", "into": "Viết bình luận…" },
    { "click": "Gửi" },
    { "expect": "Cảm ơn thầy, em sẽ thử 70 nhịp." },
    { "shot": "02-binh-luan", "do": "Mở bài HLV Tuấn → viết bình luận → Gửi", "see": "Bình luận mới cuối danh sách" },
    { "click": "Ai đã thích" },
    { "expect": "2 lượt thích" },
    { "shot": "03-ai-da-thich", "do": "Ai đã thích", "see": "Sheet 2 lượt thích: Nguyễn Minh Anh, Trần Thu Lan" },
    { "click": "Đóng" },
    { "back": true },
    { "click": "Đăng bài" },
    { "type": "Buổi tập driver sáng nay", "into": "Tiêu đề" },
    { "type": "Giữ tempo 3:1 theo bài của HLV Tuấn, tốc độ đầu gậy ổn định 104 mph.", "into": "Nội dung" },
    { "type": "driver,", "into": "VD: driver, tempo" },
    { "type": "tempo,", "into": "VD: driver, tempo" },
    { "click": "Đính kèm swing, không đính kèm" },
    { "click": "Driver · 05/10/2026" },
    { "shot": "04-soan-bai", "do": "Đăng bài: tiêu đề, nội dung, tag driver + tempo, đính kèm swing Driver", "see": "Form hợp lệ, đếm ký tự, Chip driver · tempo, swing đính kèm" },
    { "click": "Đăng", "role": "button" },
    { "expect": "Buổi tập driver sáng nay" },
    { "shot": "05-bai-moi", "do": "Đăng", "see": "Về bảng tin, bài mới ở đầu + toast" },
    { "click": "Khám phá", "role": "tab" },
    { "type": "lan", "into": "^Tìm" },
    { "click": "Theo dõi", "role": "button" },
    { "expect": "Đang theo dõi" },
    { "shot": "06-kham-pha", "do": "Khám phá → “lan” → Theo dõi", "see": "Trần Thu Lan: Đang theo dõi" },
    { "click": "Trần Thu Lan" },
    { "expect": "Buổi đầu tập sắt 7" },
    { "expectNot": "Bộ gậy" },
    { "shot": "07-ho-so-nguoi-choi", "do": "Mở hồ sơ Lan", "see": "Hồ sơ công khai: theo dõi, bài đăng; không có thông số / swing / bộ gậy (follow ≠ quyền xem)" },
    { "back": true },
    { "type": "khoa", "into": "^Tìm" },
    { "click": "Lê Đăng Khoa" },
    { "click": "Chặn Lê Đăng Khoa" },
    { "expect": "không thấy bài của nhau" },
    { "shot": "08-chan", "do": "Khám phá → Lê Đăng Khoa → nút Chặn trên header", "see": "Dialog: hai bạn sẽ không thấy bài của nhau và bỏ theo dõi lẫn nhau" },
    { "click": "Chặn", "role": "button" },
    { "click": "Bảng tin", "role": "tab" },
    { "expectNot": "Vòng 76 ở sân Long Biên" },
    { "shot": "09-sau-chan", "do": "Chặn → Bảng tin", "see": "Bài của Khoa biến khỏi bảng tin" },
    { "click": "Wedge 50 mét: kiểm soát bằng độ dài backswing" },
    { "click": "Báo cáo bài viết" },
    { "click": "Spam" },
    { "click": "Gửi báo cáo" },
    { "expect": "Đã gửi báo cáo" },
    { "shot": "10-bao-cao", "do": "Mở bài HLV Hà → nút Báo cáo bài viết → Spam → Gửi báo cáo", "see": "Sheet lý do → Gửi báo cáo → toast Đã gửi báo cáo" }
  ]
}
```
Tạo `docs/flows/F10.md`:
```markdown
# F10 — Cộng đồng

**Tài khoản:** Nguyễn Minh Anh (`p-minh`). **Bắt đầu:** web `/(player)/community?as=p-minh` · Expo Go: Dev › Kiểm tra theo luồng › F10 ·
Storybook app: `Luồng/F10 · Cộng đồng`.
**Chạy lại:** `node scripts/flow-web.mjs docs/flows/F10/steps.json` (Metro web + Storybook app đang chạy).

## Các bước
<!-- steps:start -->
<!-- steps:end -->

## Đã sửa trong lượt đi
- Không có.

## Đã biết / chưa làm
- Cộng đồng ngoài phạm vi MVP issue #1 — giữ nguyên tính năng đã làm (R4), chỉ đi luồng kiểm ngõ cụt.
- Bỏ chặn (Cài đặt › Quyền riêng tư — F12) không khôi phục theo dõi đã gỡ.
- Chặn / báo cáo là nút trên header (không qua menu BottomSheet) — tránh lỗi iOS mở Dialog khi sheet đang đóng (ruling Task 9/10).
- Chưa có (ngoài MVP, ghi từ `storybook-app/issues/E.md`): sửa bài viết; xoá / sửa bình luận của mình; ảnh / video trong bài; gửi bài qua ShareSheet
  thành tin nhắn thật; bỏ chặn ngay ở hồ sơ người dùng (chỉ ở Cài đặt › Quyền riêng tư).
```

- [ ] **Step 2: Chạy lượt đi**

Như Task 22 Step 2: lượt đi qua hết 53 bước, lần đầu chỉ đỏ ở dòng `✗ thiếu story …`.

- [ ] **Step 3: Story F10 — `storybook-app/flows/F10-cong-dong.stories.tsx`**

Theo "Cách chạy một task luồng" bước 5. Giữ helper `typeIn` của file (bản dựng).

| nn | Story | Thay đổi |
|---|---|---|
| 01 | bản dựng `01 · Bảng tin` | → `B01BangTin` |
| 02 | bản dựng `04c · Đã gửi bình luận` | → `B02BinhLuan` (nội dung bình luận theo `steps.json`) |
| 03 | bản dựng `04d · Ai đã thích` | → `B03AiDaThich` |
| 04 | bản dựng `03b · Đăng bài — hợp lệ` | → `B04SoanBai`; `play` thêm tag `driver`, `tempo` và chọn swing `Driver · 05/10/2026` như `steps.json` |
| 05 | bản dựng `03d · Đăng bài — đã đăng` | → `B05BaiMoi`, thêm `hold: ['toast']` |
| 06 | bản dựng `02a · Khám phá — tìm không dấu` | → `B06KhamPha`; `play` thêm bấm `Theo dõi` (ra `Đang theo dõi`) |
| 07 | bản dựng `05 · Hồ sơ người dùng` | → `B07HoSoNguoiChoi`, `params: { id: 'p-lan' }` |
| 08 | bản dựng `06 · Chặn — dialog` | → `B08Chan` (chặn Lê Đăng Khoa) |
| 09 | bản dựng `06c · Bảng tin sau khi chặn` | → `B09SauChan` |
| 10 | bản dựng `07 · Báo cáo bài viết` | → `B10BaoCao`; `play` thêm chọn `Spam` → `Gửi báo cáo`, `hold: ['toast']` |

**Biến thể** (chỉ đổi `name`): `01a` ← 01a (rỗng), `01b` ← 01b (bảng tin HLV), `02a` ← 04 (chi tiết bài + bình luận), `02b` ← 04a (bài của mình),
`02c` ← 04b (trả lời bình luận), `02d` ← 04e (xoá bài — dialog), `02e` ← 04f (swing đính kèm — có quyền), `02f` ← 04g (swing đính kèm — riêng tư),
`02g` ← 04h (không tìm thấy bài), `04a` ← 03 (form trống), `04b` ← 03a (lỗi bắt buộc), `04c` ← 03c (chọn swing đính kèm), `06a` ← 02 (khám phá),
`06b` ← 02b (không tìm thấy), `07a` ← 05a (hồ sơ học viên khi HLV xem), `07b` ← 05b (hồ sơ không tìm thấy), `07c` ← 08 (người theo dõi),
`07d` ← 08a (đang theo dõi), `07e` ← 08b (danh sách rỗng), `08a` ← 05c (hồ sơ HLV — bị chặn), `08b` ← 06a (đã chặn — hồ sơ), `08c` ← 06b (bị chặn —
hồ sơ), `08d` ← 08c (danh sách của người đã chặn), `09a` ← 04i (bài của người đã chặn), `10a` ← 07a (báo cáo — chưa chọn lý do), `10b` ← 07b (báo cáo
người dùng). README: id F10 cho `(player)/community`, `(coach)/community`, `community/compose`, `posts/[id]`, `users/[id]`, `people`. `pnpm typecheck` → xanh.

- [ ] **Step 4: Storyboard từ story → chạy lại luồng → đọc ảnh, gates, commit**

```bash
rm -f docs/flows/F10/*.png
SB_URL=http://localhost:6007 CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node scripts/shot-storybook.mjs docs/flows/F10 '^f10--' 390 844
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/flow-web.mjs docs/flows/F10/steps.json
```
Expected: mọi dòng `ok`; `PASS F10: 53 bước, 10 bước chụp, 26 story biến thể`. Đọc mọi ảnh (sáng + tối) và ảnh điểm kiểm. Run:
`pnpm typecheck && pnpm test && pnpm check:literals` → xanh. `pkill -f "expo start"; lsof -ti tcp:6007 | xargs kill`.
```bash
git add docs/flows/F10.md docs/flows/F10 storybook-app/flows/F10-cong-dong.stories.tsx storybook-app/README.md storybook-app/issues
git add -u apps/golf   # PostItem, People, posts/[id], coaches/[id], users/[id], (coach)/me
git commit -m "$(cat <<'EOF'
fix(community): PostsSection dùng chung, xoá bài sau khi rời màn, a11y thân bài, "Handicap" ở danh sách người + storyboard F10

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 27: F11 Thông báo — mỗi loại → đúng màn → đã đọc; đánh dấu tất cả; số trên chuông

Màn do Task 13 dựng. 2 loại mới (`connect_request`, `swing_uploaded`) đã có từ Task 16/17; luồng của chúng đã đi ở F4/F8. Task này sửa 4 lỗi đã phân
loại (Task 15 Step 12 #5, #8, #9, #22) rồi đi luồng.

**Files:**
- Create: `docs/flows/F11.md`, `docs/flows/F11/steps.json`, `docs/flows/F11/<story-id>.<light|dark>.png` (sinh từ story)
- Modify: `storybook-app/flows/F11-thong-bao.stories.tsx`, `storybook-app/README.md`, `storybook-app/issues/*.md`
- Modify (Step 3): `apps/golf/components/NotificationsScreen.tsx` (câu bình luận, rỗng theo vai trò, không chuông ở tab), `apps/golf/components/TabHeader.tsx`
  (prop `bell`), `apps/golf/lib/selectors.ts` + `apps/golf/lib/selectors.test.ts` (bỏ thông báo của người đã chặn)
- Modify (chỉ khi gặp ngõ cụt): màn đích, ghi vào "Đã sửa trong lượt đi"

**Interfaces:** Consumes `scripts/flow-web.mjs` (Task 17), `appStory` + `shot-storybook.mjs` (Task 15); đích chạm của từng loại:

| Loại | Người nhận | Chạm → |
|---|---|---|
| `coach_note`, `analysis_done`, `swing_uploaded` | người chơi / HLV | `/swings/<refId>` |
| `follow` | người được theo dõi | hồ sơ người theo dõi |
| `like`, `comment` | tác giả bài | `/posts/<refId>` |
| `invite_accepted` | HLV | `/students/<playerId>` |
| `invite_accepted` | người chơi | `/(player)/coach` |
| `connect_request` | người chơi | `/(player)/coach` |
| `connect_request` | HLV | `/(coach)/roster?seg=loi-moi` |

- [ ] **Step 1: Kịch bản — `docs/flows/F11/steps.json`**

```json
{
  "flow": "F11",
  "title": "Thông báo",
  "account": "Nguyễn Minh Anh",
  "start": "/(player)/home?as=p-minh",
  "steps": [
    { "click": "Thông báo, 2 chưa đọc" },
    { "expect": "đã ghi chú swing của bạn" },
    { "shot": "01-trung-tam", "do": "Minh Anh chạm chuông (2 chưa đọc)", "see": "Mới: HLV Tuấn ghi chú swing, Khoa theo dõi bạn; Trước đó: HLV Tuấn thích bài, Phân tích swing đã xong" },
    { "click": "đã ghi chú swing của bạn", "contains": true },
    { "expect": "Ghi chú HLV" },
    { "shot": "02-ghi-chu-den-swing", "do": "Chạm thông báo ghi chú", "see": "Mở đúng swing Driver 05/10, mục Ghi chú HLV" },
    { "back": true },
    { "shot": "03-da-doc", "do": "Quay lại", "see": "Thông báo ghi chú đã đọc (hết chấm), còn 1 chưa đọc" },
    { "click": "đã theo dõi bạn", "contains": true },
    { "expect": "Lê Đăng Khoa" },
    { "shot": "04-theo-doi-den-ho-so", "do": "Chạm thông báo theo dõi", "see": "Hồ sơ Lê Đăng Khoa" },
    { "back": true },
    { "click": "đã thích bài viết của bạn", "contains": true },
    { "expect": "Lần đầu chạm 104 mph" },
    { "shot": "05-thich-den-bai", "do": "Chạm thông báo thích", "see": "Bài “Lần đầu chạm 104 mph…”" },
    { "back": true },
    { "click": "Phân tích swing đã xong", "contains": true },
    { "expect": "Gợi ý theo mốc" },
    { "back": true },
    { "back": true },
    { "expectNot": "chưa đọc" },
    { "shot": "06-chuong-het-so", "do": "Chạm Phân tích swing đã xong → quay về Tổng quan", "see": "Chuông không còn số" },
    { "switch": "Lê Đăng Khoa" },
    { "click": "Cộng đồng", "role": "tab" },
    { "click": "Lần đầu chạm 104 mph tốc độ đầu gậy!" },
    { "type": "Đỉnh quá, chúc mừng Minh Anh!", "into": "Viết bình luận…" },
    { "click": "Gửi" },
    { "switch": "Nguyễn Minh Anh" },
    { "click": "Thông báo, 1 chưa đọc" },
    { "expect": "đã bình luận" },
    { "shot": "07-binh-luan-moi", "do": "Khoa bình luận bài của Minh Anh → đổi lại Minh Anh → chuông", "see": "Mới: Lê Đăng Khoa đã bình luận" },
    { "click": "Đánh dấu đã đọc tất cả" },
    { "shot": "08-doc-tat-ca", "do": "Đánh dấu đã đọc tất cả", "see": "Không còn mục Mới / chấm chưa đọc" },
    { "click": "đã bình luận", "contains": true },
    { "expect": "Đỉnh quá, chúc mừng Minh Anh!" },
    { "shot": "09-binh-luan-den-bai", "do": "Chạm thông báo bình luận", "see": "Bài 104 mph có bình luận mới của Khoa" },
    { "switch": "HLV Đỗ Minh Tuấn" },
    { "click": "Thông báo", "role": "tab" },
    { "expect": "đã chấp nhận lời mời" },
    { "shot": "10-hop-thu-hlv", "do": "Đổi sang HLV Tuấn → tab Thông báo", "see": "Trần Thu Lan đã chấp nhận lời mời" },
    { "click": "đã chấp nhận lời mời", "contains": true },
    { "expect": "Thể lực" },
    { "shot": "11-chap-nhan-den-hoc-vien", "do": "Chạm thông báo", "see": "Chi tiết học viên Trần Thu Lan" },
    { "switch": "HLV Vũ Thanh Hà" },
    { "click": "Thông báo", "role": "tab" },
    { "click": "muốn kết nối với bạn", "contains": true },
    { "expect": "Yêu cầu từ học viên" },
    { "shot": "12-yeu-cau-den-loi-moi", "do": "Đổi sang HLV Hà → Thông báo → Phạm Quốc Huy muốn kết nối", "see": "Học viên › Lời mời mở sẵn: Yêu cầu từ học viên Phạm Quốc Huy" }
  ]
}
```
Tạo `docs/flows/F11.md`:
```markdown
# F11 — Thông báo

**Tài khoản:** Nguyễn Minh Anh (`p-minh`, 2 chưa đọc), Lê Đăng Khoa (`p-khoa`), HLV Đỗ Minh Tuấn (`c-tuan`), HLV Vũ Thanh Hà (`c-ha`).
**Bắt đầu:** web `/(player)/home?as=p-minh` · Expo Go: Dev › Kiểm tra theo luồng › F11 · Storybook app: `Luồng/F11 · Thông báo`.
**Chạy lại:** `node scripts/flow-web.mjs docs/flows/F11/steps.json` (Metro web + Storybook app đang chạy).
**Loại còn lại (đã đi ở luồng khác):** `connect_request` gửi người chơi + `invite_accepted` gửi người chơi → [F4](F04.md) bước 06–08; `invite_accepted`
gửi HLV khi học viên nhập mã → [F4](F04.md) bước 24, 28; `swing_uploaded` (chạm → đúng swing) → [F8](F08.md) bước 03.

## Các bước
<!-- steps:start -->
<!-- steps:end -->

## Đã sửa trong lượt đi
- Không có.

## Đã biết / chưa làm
- Chưa có push thật; "Giờ yên lặng" và bật/tắt từng loại chỉ lưu tuỳ chọn (spec §1: ngoài phạm vi push).
- Thông báo trỏ tới swing/bài đã xoá → mở màn "Không tìm thấy …" có nút Quay lại.
```

- [ ] **Step 2: Chạy lượt đi**

Như Task 22 Step 2: lượt đi qua hết 48 bước, lần đầu chỉ đỏ ở dòng `✗ thiếu story …`. Nhãn chuông `Thông báo, 2 chưa đọc` (bước 1) dựa trên
số chưa đọc của Minh Anh trong dữ liệu mẫu (`nt-1`, `nt-2`; `nt-6` của Task 16 gửi HLV Hà).

- [ ] **Step 3: Sửa trung tâm thông báo (phân loại Task 15 #5, #8, #9, #22)**

1. `apps/golf/components/TabHeader.tsx` — tab Thông báo của HLV dùng `TabHeader`, chuông (kèm số) mở `/notifications` = chính màn đang xem. Thêm prop:
   chữ ký `export function TabHeader({ title, bell = true }: { title?: string; bell?: boolean })` và bọc `<View>` của chuông (dòng 27–41) bằng
   `{bell && ( … )}`. `apps/golf/components/NotificationsScreen.tsx` dòng 101: `<TabHeader title="Thông báo" />` → `<TabHeader title="Thông báo" bell={false} />`.
2. `NotificationsScreen.tsx` `SENTENCE.comment` (dòng 19): `'đã bình luận'` → `'đã bình luận bài viết của bạn'` (cùng kiểu "đã thích bài viết của bạn").
3. `NotificationsScreen.tsx` rỗng (dòng 124): câu viết cho người chơi hiện cả ở tab của HLV. Thay `caption="…"` bằng
```tsx
            caption={
              me.role === 'coach'
                ? 'Học viên nhận lời mời, yêu cầu kết nối, swing mới của học viên, người theo dõi mới, lượt thích và bình luận sẽ hiện ở đây.'
                : 'Ghi chú của HLV, kết quả phân tích swing, lời mời kết nối, người theo dõi mới, lượt thích và bình luận sẽ hiện ở đây.'
            }
```
4. Thông báo của người đã chặn / bị chặn vẫn hiện và vẫn tính vào số trên chuông (chạm "theo dõi bạn" → hồ sơ báo đã chặn). Cùng luật bảng tin /
   bình luận (`isBlocked`), sửa ở selector để danh sách và số trên chuông khớp nhau. Test đỏ trước — thêm vào cuối `apps/golf/lib/selectors.test.ts`
   (thêm `notificationsOf` vào import từ `./selectors`):
```ts
describe('thông báo và chặn', () => {
  it('thông báo do người đã chặn / bị chặn gây ra không hiện, không tính vào số chưa đọc; thông báo hệ thống vẫn hiện', () => {
    const s = { ...seedState(), blocks: [{ blockerId: 'p-minh', blockedId: 'p-khoa' }] };
    expect(notificationsOf(s, 'p-minh').map((n) => n.id)).toEqual(['nt-1', 'nt-3', 'nt-4']); // mới → cũ, bỏ nt-2 (Khoa theo dõi)
    expect(unreadCount(s, 'p-minh')).toBe(1);
  });
});
```
   `pnpm -F golf test` → đỏ (`nt-2` còn, số 2). `apps/golf/lib/selectors.ts` dòng 84–85 thành (thêm `type AppNotification` vào import từ `./domain`):
```ts
/** Thông báo của `userId` hiện được: bỏ thông báo do người đã chặn / bị chặn với `userId` gây ra (cùng luật bảng tin, bình luận). */
const visibleTo = (s: AppState, userId: ID) => (n: AppNotification) => n.userId === userId && !(n.actorId && isBlocked(s, userId, n.actorId));
export const notificationsOf = (s: AppState, userId: ID) => s.notifications.filter(visibleTo(s, userId)).sort(byDateDesc);
export const unreadCount = (s: AppState, userId: ID) => s.notifications.filter((n) => visibleTo(s, userId)(n) && !n.readAt).length;
```
   `pnpm -F golf test` → xanh (golf 135).

- [ ] **Step 4: Story F11 — `storybook-app/flows/F11-thong-bao.stories.tsx`**

Theo "Cách chạy một task luồng" bước 5. `READ_ALL = { type: 'markRead', userId: 'p-minh', at: NOW } as const`;
`CM_KHOA = { type: 'addComment', comment: { id: 'cm-sb-khoa', postId: 'post-4', authorId: 'p-khoa', text: 'Đỉnh quá, chúc mừng Minh Anh!', createdAt: NOW }, notificationId: 'nt-cm-khoa' } as const`.

| nn | Màn | `appStory` |
|---|---|---|
| 01 | `notifications` | `as: 'p-minh'` (bản dựng `01 · Danh sách — Mới / Trước đó`) |
| 02 | `swings/[id]` | `as: 'p-minh'`, `params: { id: 'sw-minh-1' }` |
| 03 | `notifications` | `as: 'p-minh'`, `setup: [{ type: 'markRead', userId: 'p-minh', at: NOW, ids: ['nt-1'] }]` |
| 04 | `users/[id]` | `as: 'p-minh'`, `params: { id: 'p-khoa' }` |
| 05 | `posts/[id]` | `as: 'p-minh'`, `params: { id: 'post-4' }` |
| 06 | `(player)/home` | `as: 'p-minh'`, tabs home, `setup: [READ_ALL]` |
| 07 | `notifications` | `as: 'p-minh'`, `setup: [READ_ALL, CM_KHOA]` |
| 08 | `notifications` | `as: 'p-minh'`, `setup: [READ_ALL, CM_KHOA, READ_ALL]` |
| 09 | `posts/[id]` | `as: 'p-minh'`, `params: { id: 'post-4' }`, `setup: [CM_KHOA]` |
| 10 | `(coach)/inbox` | `as: 'c-tuan'`, tabs inbox (bản dựng `03 · Tab Thông báo của HLV`) |
| 11 | `students/[id]` | `as: 'c-tuan'`, `params: { id: 'p-lan' }` |
| 12 | `(coach)/roster` | `as: 'c-ha'`, tabs roster, `params: { seg: 'loi-moi', from: 'nt-6' }` |

**Biến thể:** `01a · Rỗng` (bản dựng `02`), `10a · Tab Thông báo HLV — rỗng` (bản dựng `03a`; ảnh: không chuông trên header, câu rỗng của HLV). Bản dựng
`01a · đã đọc tất cả` xoá (bước 08 thay).
README: id F11 cho `notifications`, `(coach)/inbox`; xoá dòng F11 ở "Chưa có (Phase 2)". `pnpm typecheck` → xanh.

- [ ] **Step 5: Storyboard từ story → chạy lại luồng → đọc ảnh, gates, commit**

```bash
rm -f docs/flows/F11/*.png
SB_URL=http://localhost:6007 CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node scripts/shot-storybook.mjs docs/flows/F11 '^f11--' 390 844
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/flow-web.mjs docs/flows/F11/steps.json
```
Expected: mọi dòng `ok`; `PASS F11: 48 bước, 12 bước chụp, 2 story biến thể`. Đọc mọi ảnh (sáng + tối) và ảnh điểm kiểm. Run:
`pnpm typecheck && pnpm test && pnpm check:literals` → xanh. `pkill -f "expo start"; lsof -ti tcp:6007 | xargs kill`.
```bash
git add docs/flows/F11.md docs/flows/F11 storybook-app/flows/F11-thong-bao.stories.tsx storybook-app/README.md storybook-app/issues
git add -u apps/golf   # NotificationsScreen, TabHeader, selectors (+ test)
git commit -m "$(cat <<'EOF'
fix(notifications): bỏ thông báo của người đã chặn, câu bình luận đủ ý, rỗng theo vai trò, tab HLV không chuông + storyboard F11

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 28: F12 Hồ sơ & cài đặt — đổi ảnh đại diện ở Tài khoản, đơn giá có dấu chấm, Dialog xoá tài khoản không trống chữ

**Files:**
- Modify:
  - `apps/golf/app/settings/account.tsx` (Task 13 dựng): ảnh đại diện Chọn ảnh / Đổi ảnh / Dùng chữ tắt; đơn giá điền sẵn "450.000" (phân loại Task 15 #10)
  - `apps/golf/app/settings/privacy.tsx` (Task 13 dựng): Dialog xoá tài khoản giữ chữ khi mờ dần (phân loại Task 15 #21)
  - (vùng chạm avatar header ≥ 44 px: Task 14 đã làm — `hitSlop` ở `TabHeader.tsx:44`, không sửa)
- Create: `docs/flows/F12.md`, `docs/flows/F12/steps.json`, `docs/flows/F12/<story-id>.<light|dark>.png` (sinh từ story)
- Modify: `storybook-app/flows/F12-ho-so-cai-dat.stories.tsx`, `storybook-app/README.md`, `storybook-app/issues/*.md`

**Interfaces:** Consumes `nextSampleAvatar` (Task 16), action `updateProfile`; Task 13 đã cho `TabHeader` và `profile` hiện `avatarUrl`;
`appStory` + `shot-storybook.mjs` (Task 15); `scripts/flow-web.mjs` (Task 17).

- [ ] **Step 1: Kịch bản — `docs/flows/F12/steps.json`**

Chữ của màn Task 12–13 trong kịch bản đã đối chiếu với HEAD ebb90f4: nhãn ô "Họ tên", "Handicap", "CLB / sân tập (tuỳ chọn)" (khớp "^CLB"),
"Giới thiệu"; công tắc "Công khai bộ gậy"; "Người đã chặn", "Bỏ chặn", "Xoá tài khoản"; toast "Đã lưu hồ sơ" (khớp "Đã lưu"); Cài đặt › Thông báo của
người chơi (sau Task 16) có 7 công tắc, gồm "Lời mời và yêu cầu kết nối"; nút header "Chặn <tên>", Dialog nút "Chặn".
```json
{
  "flow": "F12",
  "title": "Hồ sơ & cài đặt",
  "account": "Nguyễn Minh Anh",
  "start": "/(player)/home?as=p-minh",
  "steps": [
    { "click": "Hồ sơ của tôi" },
    { "expect": "Chỉnh sửa hồ sơ" },
    { "shot": "01-ho-so", "do": "Minh Anh chạm avatar trên header", "see": "Hồ sơ: chữ tắt MA, Handicap 14 · Sân tập Mỹ Đình, theo dõi; Chỉnh sửa hồ sơ / Cài đặt / Đăng xuất" },
    { "click": "Chỉnh sửa hồ sơ" },
    { "click": "Chọn ảnh" },
    { "type": "Nguyễn Thị Minh Anh", "into": "Họ tên" },
    { "type": "13,5", "into": "Handicap" },
    { "type": "Sân tập Hồ Tây", "into": "^CLB" },
    { "shot": "02-sua-tai-khoan", "do": "Chỉnh sửa hồ sơ → Chọn ảnh → họ tên mới → handicap 13,5 → CLB mới", "see": "Ảnh mẫu, Đổi ảnh / Dùng chữ tắt; Họ tên Nguyễn Thị Minh Anh; Handicap 13,5; CLB Sân tập Hồ Tây" },
    { "click": "Lưu", "role": "button" },
    { "expect": "Đã lưu" },
    { "back": true },
    { "expect": "Handicap 13,5" },
    { "expect": "Nguyễn Thị Minh Anh" },
    { "shot": "03-ho-so-sau-sua", "do": "Lưu → quay lại Hồ sơ", "see": "Ảnh mới; Nguyễn Thị Minh Anh; Handicap 13,5 · Sân tập Hồ Tây" },
    { "click": "Cài đặt", "role": "button" },
    { "shot": "04-cai-dat", "do": "Cài đặt", "see": "Tài khoản · Mật khẩu · Quyền riêng tư · Thông báo · Đơn vị đo · Dev" },
    { "click": "Quyền riêng tư" },
    { "click": "Công khai bộ gậy" },
    { "shot": "05-quyen-rieng-tu", "do": "Quyền riêng tư → bật Công khai bộ gậy", "see": "Công tắc bật; chú thích mặc định chỉ bạn và HLV xem; Người đã chặn; Xoá tài khoản" },
    { "back": true },
    { "click": "Thông báo" },
    { "expect": "Lời mời và yêu cầu kết nối" },
    { "shot": "06-cai-dat-thong-bao", "do": "Thông báo", "see": "7 loại thông báo của người chơi (có Lời mời và yêu cầu kết nối, Kết nối được chấp nhận) + Giờ yên lặng" },
    { "back": true },
    { "click": "Đơn vị đo" },
    { "click": "Yard" },
    { "shot": "07-don-vi", "do": "Đơn vị đo → Yard", "see": "Yard được chọn; ví dụ Carry 228 m ↔ 249 yd" },
    { "back": true },
    { "back": true },
    { "back": true },
    { "expect": "yd" },
    { "shot": "08-tong-quan-yard", "do": "Quay về Tổng quan", "see": "Carry theo yard; avatar header là ảnh mới" },
    { "click": "Cộng đồng", "role": "tab" },
    { "click": "Khám phá", "role": "tab" },
    { "type": "khoa", "into": "^Tìm" },
    { "click": "Lê Đăng Khoa" },
    { "click": "Chặn Lê Đăng Khoa" },
    { "click": "Chặn", "role": "button" },
    { "click": "Hồ sơ của tôi" },
    { "click": "Cài đặt", "role": "button" },
    { "click": "Quyền riêng tư" },
    { "expect": "Lê Đăng Khoa" },
    { "shot": "09-nguoi-da-chan", "do": "Chặn Lê Đăng Khoa ở Cộng đồng → Cài đặt › Quyền riêng tư", "see": "Người đã chặn: Lê Đăng Khoa + Bỏ chặn" },
    { "click": "Bỏ chặn" },
    { "expectNot": "Bỏ chặn" },
    { "shot": "10-bo-chan", "do": "Bỏ chặn", "see": "Danh sách người đã chặn trống" },
    { "switch": "HLV Đỗ Minh Tuấn" },
    { "click": "Hồ sơ", "role": "tab" },
    { "click": "Chỉnh sửa hồ sơ" },
    { "type": "Ngắn quá", "into": "Giới thiệu" },
    { "click": "Lưu", "role": "button" },
    { "expect": "Tối thiểu 20 ký tự" },
    { "shot": "11-bio-hlv-loi", "do": "Đổi sang HLV Tuấn → Hồ sơ → Chỉnh sửa hồ sơ → giới thiệu quá ngắn → Lưu", "see": "Giới thiệu: Tối thiểu 20 ký tự" },
    { "type": "12 năm dạy swing cơ bản, tempo và short game cho người mới.", "into": "Giới thiệu" },
    { "click": "Lưu", "role": "button" },
    { "expect": "Đã lưu" },
    { "back": true },
    { "expect": "12 năm dạy swing cơ bản" },
    { "shot": "12-ho-so-hlv-moi", "do": "Giới thiệu hợp lệ → Lưu → quay lại", "see": "Tab Hồ sơ hiện giới thiệu mới" },
    { "switch": "Nguyễn Thị Minh Anh" },
    { "click": "Hồ sơ của tôi" },
    { "click": "Cài đặt", "role": "button" },
    { "click": "Quyền riêng tư" },
    { "click": "Xoá tài khoản" },
    { "expect": "Xoá tài khoản?" },
    { "shot": "13-xoa-tai-khoan", "do": "Đổi lại Minh Anh → Quyền riêng tư → Xoá tài khoản", "see": "Dialog bước 1: Xoá tài khoản? — hồ sơ, thông số, swing, bộ gậy, bài đăng, kết nối HLV bị xoá vĩnh viễn" },
    { "click": "Tiếp tục", "role": "button" },
    { "expect": "Xác nhận lần cuối" },
    { "click": "Xoá vĩnh viễn", "role": "button" },
    { "expect": "Tạo tài khoản" },
    { "shot": "14-sau-xoa", "do": "Tiếp tục → Xoá vĩnh viễn", "see": "Đăng xuất, về màn chào" }
  ]
}
```
Dialog xoá tài khoản 2 bước theo `apps/golf/app/settings/privacy.tsx` (Task 13, commit 087dca1): `Xoá tài khoản?` → `Tiếp tục` → `Xác nhận lần cuối` →
`Xoá vĩnh viễn` → đăng xuất về màn chào. Bước đổi họ tên làm tên hồ sơ thành "Nguyễn Thị Minh Anh", nên bước `switch` về Minh Anh dùng tên mới.

Tạo `docs/flows/F12.md`:
```markdown
# F12 — Hồ sơ & cài đặt

**Tài khoản:** Nguyễn Minh Anh (`p-minh`; luồng đổi họ tên thành "Nguyễn Thị Minh Anh"), HLV Đỗ Minh Tuấn (`c-tuan`). **Bắt đầu:** web
`/(player)/home?as=p-minh` · Expo Go: Dev › Kiểm tra theo luồng › F12 · Storybook app: `Luồng/F12 · Hồ sơ & cài đặt`.
**Chạy lại:** `node scripts/flow-web.mjs docs/flows/F12/steps.json` (Metro web + Storybook app đang chạy).

## Các bước
<!-- steps:start -->
<!-- steps:end -->

## Đã sửa trong lượt đi
- Không có.

## Đã biết / chưa làm
- Ảnh đại diện chọn từ ảnh mẫu (chưa mở thư viện ảnh / camera — chưa thêm dependency).
- Đơn vị: RadioRow Mét / Yard (plan Task 13 — coi là xong "gạt đơn vị"); hệ Imperial đầy đủ không làm (mâu thuẫn (h)).
- Chưa có (từ `storybook-app/issues/E.md`): đổi email / xác thực lại SĐT bằng OTP khi sửa tài khoản.
- Xoá tài khoản (mock) = đăng xuất; dữ liệu mẫu còn trong phiên.
```

- [ ] **Step 2: Chạy — thấy đỏ**

Expected: `✗ 5 {"click":"Chọn ảnh"}`. Màn Tài khoản của Task 13 chưa có ô ảnh.

- [ ] **Step 3: `settings/account.tsx` — ảnh đại diện, đơn giá có dấu chấm**

Bản sau Task 24 (gợi ý bio theo vai trò). Import thêm `Avatar` vào import `@gr/ds`; `import { nextSampleAvatar } from '../../lib/simulate';`; thêm
`initials` vào import `formatValue, formatVnd` từ `'../../lib/format'`.
1. Đơn giá điền sẵn đang là "450000" trong khi placeholder / trợ giúp viết "450.000" (phân loại Task 15 #10). Dòng 26 thành
```tsx
    ratePerHourVnd: me?.ratePerHourVnd === undefined ? '' : formatVnd(me.ratePerHourVnd).replace(' đ', ''), // "450.000" — validateAccount bỏ dấu chấm khi lưu
```
2. Thêm state sau `const [saved, setSaved] = useState(false);` (dòng 29, trước `if (!me)`):
```tsx
  const [avatarUrl, setAvatarUrl] = useState(me?.avatarUrl); // lưu cùng các trường khác khi bấm Lưu
```
3. Đầu nội dung `ScrollView`, ngay trước `{field('name', …)}` (dòng 51):
```tsx
          <View style={{ alignItems: 'center', gap: t.space('Spacing/Gap/Small') }}>
            <Avatar size="2XLarge" theme={avatarUrl ? 'Photo' : 'Accent'} source={avatarUrl ? { uri: avatarUrl } : undefined} initials={initials(me.name)} accessibilityLabel={`Ảnh đại diện ${me.name}`} />
            <View style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/Small') }}>
              {/* ponytail: ảnh mẫu thay thư viện ảnh/camera (như onboarding) — bản thật dùng expo-image-picker + upload */}
              <Button level="Secondary" size="Medium (Base)" leadingIcon="image-plus-line" text={avatarUrl ? 'Đổi ảnh' : 'Chọn ảnh'} onPress={() => setAvatarUrl(nextSampleAvatar(avatarUrl))} />
              {avatarUrl && <Button level="Tertiary" size="Medium (Base)" text="Dùng chữ tắt" onPress={() => setAvatarUrl(undefined)} />}
            </View>
          </View>
```
4. Trong `save` (dòng 40): `dispatch({ type: 'updateProfile', id: me.id, patch: result.value });` → `dispatch({ type: 'updateProfile', id: me.id, patch: { ...result.value, avatarUrl } });`.

- [ ] **Step 4: `settings/privacy.tsx` — Dialog xoá tài khoản không trống chữ khi đóng (phân loại Task 15 #21)**

`step = DELETE_STEPS[deleteStep]` (dòng 39) thành `undefined` ngay khi đóng (`deleteStep = -1`), nên Dialog mờ dần với tiêu đề / nút rỗng. Dòng 39:
```tsx
  const step = DELETE_STEPS[Math.max(deleteStep, 0)]!; // đóng (-1) vẫn giữ chữ bước đầu trong lúc Dialog mờ dần
```
Trong `<Dialog …>` (dòng 86–102): `visible={!!step}` → `visible={deleteStep >= 0}`; `title={step?.title ?? ''}` → `title={step.title}`;
`body={step?.body}` → `body={step.body}`; `primaryText={step?.primaryText ?? ''}` → `primaryText={step.primaryText}`.

- [ ] **Step 5: Story F12 — `storybook-app/flows/F12-ho-so-cai-dat.stories.tsx`**

Theo "Cách chạy một task luồng" bước 5. `MINH_SUA = { type: 'updateProfile', id: 'p-minh', patch: { name: 'Nguyễn Thị Minh Anh', handicap: 13.5,
homeClub: 'Sân tập Hồ Tây', avatarUrl: SAMPLE_AVATARS[0] } } as const` (`SAMPLE_AVATARS` từ `lib/simulate`); `YARD` như F5;
`CHAN_KHOA = { type: 'block', blockerId: 'p-minh', blockedId: 'p-khoa' } as const`;
`BIO_TUAN = { type: 'updateProfile', id: 'c-tuan', patch: { bio: '12 năm dạy swing cơ bản, tempo và short game cho người mới.' } } as const`.

| nn | Màn | `appStory` / `play` |
|---|---|---|
| 01 | `profile` | `as: 'p-minh'` (bản dựng `01 · Hồ sơ người chơi`) |
| 02 | `settings/account` | `as: 'p-minh'`; `play` `Chọn ảnh` → `typeIn` `Họ tên`, `Handicap`, `CLB / sân tập (tuỳ chọn)` như `steps.json` (bản dựng `04` + play) |
| 03 | `profile` | `as: 'p-minh'`, `setup: [MINH_SUA]` |
| 04 | `settings/index` | `as: 'p-minh'` (bản dựng `03 · Cài đặt`) |
| 05 | `settings/privacy` | `as: 'p-minh'`, `setup: [{ type: 'setPrefs', userId: 'p-minh', patch: { publicClubs: true } }]` |
| 06 | `settings/notifications` | `as: 'p-minh'` (bản dựng `07`) |
| 07 | `settings/units` | `as: 'p-minh'`, `setup: [YARD]` (bản dựng `08a`) |
| 08 | `(player)/home` | `as: 'p-minh'`, tabs home, `setup: [MINH_SUA, YARD]` |
| 09 | `settings/privacy` | `as: 'p-minh'`, `setup: [CHAN_KHOA]` |
| 10 | `settings/privacy` | như 09, `hold: ['toast']`; `play` `Bỏ chặn` |
| 11 | `settings/account` | `as: 'c-tuan'`; `play` `typeIn` `Giới thiệu` = `Ngắn quá` → `Lưu` |
| 12 | `(coach)/me` | `as: 'c-tuan'`, tabs me, `setup: [BIO_TUAN]` (bản dựng `02 · Hồ sơ HLV — tab Hồ sơ` + setup) |
| 13 | `settings/privacy` | `as: 'p-minh'`; `play` `Xoá tài khoản` → chờ Dialog `Xoá tài khoản?` (bản dựng `06b`) |
| 14 | `(auth)/welcome` | không `as` |

**Biến thể** (đổi `name`): `02a · Tài khoản — HLV` (04a), `02b · Tài khoản — lỗi` (04b), `02c · Tài khoản — đã lưu` (04c, thêm `hold: ['toast']`),
`04a · Mật khẩu` (05), `04b · Dev` (09), `04c · Dev — đặt lại dữ liệu mẫu` (09a), `05a · Quyền riêng tư — HLV` (06d), `06a · Cài đặt thông báo — HLV`
(07a), `07a · Đơn vị đo — mét` (08), `12a · Hồ sơ HLV — màn hồ sơ` (02a), `13a · Xoá tài khoản — xác nhận lần cuối` (06c). Bản dựng `06 · Quyền riêng tư`,
`06a · đã chặn, công khai bộ gậy` xoá (bước 05, 09 thay). README: id F12 cho `profile`, `settings/*` (trừ `password`), `(coach)/me`; xoá dòng "Đổi
ảnh đại diện" của F12 ở "Chưa có (Phase 2)" (dòng Dev › "Kiểm tra theo luồng" để Task 30 xoá). `pnpm typecheck` → xanh.

- [ ] **Step 6: Storyboard từ story → chạy lại luồng → xanh; đọc ảnh**

```bash
rm -f docs/flows/F12/*.png
SB_URL=http://localhost:6007 CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node scripts/shot-storybook.mjs docs/flows/F12 '^f12--' 390 844
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/flow-web.mjs docs/flows/F12/steps.json
```
Expected: mọi dòng `ok`; `PASS F12: 72 bước, 14 bước chụp, 11 story biến thể`. Đọc mọi ảnh (sáng + tối) và ảnh điểm kiểm:
- avatar ảnh ở header và hồ sơ;
- 7 công tắc thông báo của người chơi không tràn; `f12--…` Tài khoản HLV điền sẵn đơn giá "450.000";
- Dialog xoá tài khoản đọc rõ ở chế độ tối.

- [ ] **Step 7: Gates + commit**

Run: `pnpm typecheck && pnpm test && pnpm check:literals` → xanh. `pkill -f "expo start"; lsof -ti tcp:6007 | xargs kill`.
```bash
git add apps/golf/app/settings/account.tsx apps/golf/app/settings/privacy.tsx docs/flows/F12.md docs/flows/F12
git add storybook-app/flows/F12-ho-so-cai-dat.stories.tsx storybook-app/README.md storybook-app/issues
git commit -m "$(cat <<'EOF'
feat(settings): đổi ảnh đại diện ở Tài khoản, đơn giá có dấu chấm, Dialog xoá tài khoản không trống chữ + storyboard F12

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 29: F13 Trạng thái xuyên suốt — 404, 403 có nút, skeleton các màn danh sách, spinner khi lưu/xoá, toast thất bại + Thử lại

**Files:**
- Create:
  - `apps/golf/app/+not-found.tsx`
  - `apps/golf/components/ListSkeleton.tsx` (`useFirstLoad`, `ListSkeleton` — Task 14 viết skeleton inline ở 2 màn, chưa có cơ chế dùng chung)
  - `docs/flows/F13.md`, `docs/flows/F13/steps.json`, `docs/flows/F13/<story-id>.<light|dark>.png` (sinh từ story)
- Modify:
  - `apps/golf/lib/simulate.ts`: thêm `save: 600`, `toastError: 4000` vào `DELAYS` (Task 15)
  - `storybook-app/flows/F13-trang-thai.stories.tsx`, `storybook-app/README.md`, `storybook-app/issues/*.md`
  - `apps/golf/components/Feedback.tsx`: `SavedToast` có loại Negative + nút, `useSimulatedWrite`, `SavingRow`
  - `apps/golf/components/NoAccess.tsx`: nút "Quay lại"
  - `apps/golf/app/settings/dev.tsx`: công tắc "Giả lập lỗi khi lưu/xoá"
  - lưu có độ trễ: `apps/golf/app/metrics/manual.tsx`, `apps/golf/app/clubs/new.tsx` (`ClubForm`), `apps/golf/app/settings/account.tsx`, `apps/golf/app/community/compose.tsx`
  - xoá có độ trễ: `apps/golf/app/metrics/[id].tsx`, `apps/golf/app/swings/[id].tsx` (swing + ghi chú), `apps/golf/app/clubs/[id]/index.tsx`
  - skeleton: `apps/golf/app/(player)/swings.tsx`, `apps/golf/app/(player)/metrics.tsx`, `apps/golf/app/(coach)/roster.tsx`, `apps/golf/app/students/[id].tsx`,
    `apps/golf/components/NotificationsScreen.tsx`, `apps/golf/app/clubs/index.tsx`; Tổng quan + bảng tin của Task 14 chuyển sang `useFirstLoad`:
    `apps/golf/app/(player)/home.tsx`, `apps/golf/components/CommunityScreen.tsx`

**Interfaces:**
- Consumes (Task 16): `AppState.simulateFailure`, action `setSimulateFailure`.
- Consumes (Task 15): `DELAYS` (task này thêm khoá `save`, `toastError`), `appStory({ hold })`, `typeIn`, `shot-storybook.mjs`; (Task 17): `flow-web.mjs`;
  (Task 21): `useOnLeave` — các nút xoá đã "xoá sau khi rời màn" qua `deleteOnLeave()`.
- Produces:
  - `SavedToast({ title, caption?, onDone, type?: 'Positive' | 'Negative', actionText?, onAction? })`
  - `useSimulatedWrite(): { busy: boolean; run(done: () => void, fail: () => void): void }`
  - `SavingRow({ text?: string })`
  - `useFirstLoad(key: string): boolean`, `ListSkeleton({ rows?: number })`
  - `NoAccess({ reason? })`: có thêm nút Quay lại, chữ ký giữ nguyên

- [ ] **Step 1: Kịch bản — `docs/flows/F13/steps.json`**

```json
{
  "flow": "F13",
  "title": "Trạng thái xuyên suốt",
  "account": "Nguyễn Minh Anh",
  "start": "/trang-khong-co?as=p-minh",
  "steps": [
    { "expect": "Không tìm thấy trang" },
    { "shot": "01-404", "do": "Mở link không có màn (/trang-khong-co)", "see": "404 tiếng Việt: Không tìm thấy trang + Về trang chủ" },
    { "click": "Về trang chủ" },
    { "expect": "Chỉ số swing gần nhất" },
    { "click": "Swing", "role": "tab", "settle": 50 },
    { "shot": "02-skeleton-swing", "settle": 0, "do": "Về trang chủ → tab Swing (lần đầu mở trong phiên)", "see": "Khung xương danh sách trong 0,4 giây đầu" },
    { "expect": "Đăng swing" },
    { "click": "Thông số", "role": "tab", "settle": 50 },
    { "shot": "03-skeleton-thong-so", "settle": 0, "do": "Tab Thông số (lần đầu mở)", "see": "Khung xương danh sách" },
    { "open": "/(player)/swings?as=p-huy", "account": "Phạm Quốc Huy (chưa có dữ liệu)" },
    { "expect": "Chưa có swing nào", "timeout": 8000 },
    { "shot": "04-trong-swing", "do": "Phạm Quốc Huy mở tab Swing", "see": "Empty state: Chưa có swing nào + Đăng swing" },
    { "click": "Thông số", "role": "tab" },
    { "expect": "Chưa có phiên swing" },
    { "shot": "05-trong-thong-so", "do": "Tab Thông số", "see": "Empty state + Nhập số liệu" },
    { "click": "Bộ gậy", "role": "tab" },
    { "expect": "Chưa có gậy nào" },
    { "shot": "06-trong-bo-gay", "do": "Segment Bộ gậy", "see": "Empty state + Thêm gậy" },
    { "open": "/(player)/metrics?as=p-minh", "account": "Nguyễn Minh Anh" },
    { "click": "Hồ sơ của tôi" },
    { "click": "Cài đặt", "role": "button" },
    { "click": "Dev" },
    { "click": "Giả lập lỗi khi lưu/xoá" },
    { "shot": "07-bat-gia-lap-loi", "do": "Hồ sơ › Cài đặt › Dev → bật Giả lập lỗi khi lưu/xoá", "see": "Công tắc bật, chú thích giải thích" },
    { "back": true },
    { "back": true },
    { "back": true },
    { "click": "Nhập số liệu" },
    { "click": "Nhập tay" },
    { "click": "Gậy, chưa chọn" },
    { "click": "Sắt 7" },
    { "type": "85", "into": "Tốc độ đầu gậy (mph)" },
    { "type": "116", "into": "Tốc độ bóng (mph)" },
    { "type": "1,36", "into": "Smash factor" },
    { "type": "6700", "into": "Spin (rpm)" },
    { "type": "17,5", "into": "Góc bắn (°)" },
    { "type": "150", "into": "Carry (m)" },
    { "click": "Lưu", "settle": 100 },
    { "shot": "08-dang-luu", "settle": 0, "do": "Nhập tay đủ 6 chỉ số → Lưu", "see": "Spinner Đang lưu…, nút Lưu khoá" },
    { "expect": "Lưu thất bại" },
    { "shot": "09-luu-that-bai", "do": "Chờ 0,6 giây", "see": "Toast lỗi Lưu thất bại + Thử lại; form giữ nguyên" },
    { "back": true },
    { "click": "05/10/2026 · Gỗ 3" },
    { "click": "Xoá phiên" },
    { "click": "Xoá" },
    { "expect": "Xoá thất bại" },
    { "shot": "10-xoa-that-bai", "do": "Bỏ form → phiên Gỗ 3 05/10 → Xoá phiên → Xoá", "see": "Toast Xoá thất bại + Thử lại; phiên vẫn còn" },
    { "back": true },
    { "click": "Hồ sơ của tôi" },
    { "click": "Cài đặt", "role": "button" },
    { "click": "Dev" },
    { "click": "Giả lập lỗi khi lưu/xoá" },
    { "back": true },
    { "back": true },
    { "back": true },
    { "click": "05/10/2026 · Gỗ 3" },
    { "click": "Xoá phiên" },
    { "click": "Xoá", "settle": 100 },
    { "shot": "11-dang-xoa", "settle": 0, "do": "Tắt giả lập → xoá lại phiên Gỗ 3", "see": "Spinner Đang xoá…, nút xoá khoá" },
    { "expectNot": "05/10/2026 · Gỗ 3" },
    { "shot": "12-xoa-thanh-cong", "do": "Chờ 0,6 giây", "see": "Về danh sách, phiên Gỗ 3 05/10 không còn" },
    { "open": "/students/p-minh?as=p-khoa", "account": "Lê Đăng Khoa (người theo dõi)" },
    { "expect": "Không có quyền xem" },
    { "shot": "13-403", "do": "Người theo dõi mở link dữ liệu học viên", "see": "403 Không có quyền xem + nút Quay lại" },
    { "click": "Quay lại" },
    { "expect": "Chưa có số liệu" },
    { "shot": "14-quay-lai-tu-403", "do": "Chạm Quay lại (mở thẳng link, không có lịch sử)", "see": "Về Tổng quan của Khoa" }
  ]
}
```
Tạo `docs/flows/F13.md`:
```markdown
# F13 — Trạng thái xuyên suốt

**Tài khoản:** Nguyễn Minh Anh (`p-minh`), Phạm Quốc Huy (`p-huy`, chưa có dữ liệu), Lê Đăng Khoa (`p-khoa`).
**Bắt đầu:** web `/trang-khong-co?as=p-minh` · Expo Go: Dev › Kiểm tra theo luồng › F13 (rồi bật "Giả lập lỗi khi lưu/xoá" ở Dev) · Storybook app:
`Luồng/F13 · Trạng thái xuyên suốt` — trạng thái tạm thời (skeleton, spinner, toast) xem ở đây, story giữ chúng đứng yên (`hold`).
**Chạy lại:** `node scripts/flow-web.mjs docs/flows/F13/steps.json` (Metro web + Storybook app đang chạy). Ảnh bước 02, 03, 08, 11 lấy từ story
`hold`; lượt CDP chỉ kiểm bấm tới được (ảnh điểm kiểm của các bước đó có thể đã qua trạng thái tạm thời).
**Trạng thái ở luồng khác:** lỗi form theo trường → F5 04–05, F1 03, F3 04; empty state Học viên → F2 05; toast thành công → F4 05, F5 13; 403 sau huỷ
kết nối → F4 28, 30.

## Các bước
<!-- steps:start -->
<!-- steps:end -->

## Đã sửa trong lượt đi
- Không có.

## Đã biết / chưa làm
- Dữ liệu mock có sẵn trong bộ nhớ: skeleton là giả lập 0,4 giây ở lần đầu mở mỗi màn trong phiên.
- Spinner + độ trễ 0,6 giây có ở 4 form (nhập tay / sửa phiên, gậy, tài khoản, đăng bài) và 4 nút xoá (phiên, swing, ghi chú, gậy); thao tác khác lưu tức thì.
- "Giả lập lỗi khi lưu/xoá" chỉ có ở bản dev; toast lỗi giữ 4 giây, một toast một lúc, ở đáy màn (MVP "góc màn hình" trên desktop — mâu thuẫn (a)).
- Empty state dùng icon DS làm minh hoạ (spec §4 "EmptyState của DS"), chưa có hình vẽ riêng.
```

- [ ] **Step 2: Chạy — thấy đỏ**

Expected: `✗ 1 {"expect":"Không tìm thấy trang"}`. Expo Router đang hiện màn mặc định "Unmatched Route" tiếng Anh.

- [ ] **Step 3: `app/+not-found.tsx` (mới)**

```tsx
import { View } from 'react-native';
import { router } from 'expo-router';
import { EmptyState, Screen, useTheme } from '@gr/ds';
import { StackHeader } from '../components/StackHeader';

/** 404 cho mọi URL / deep link không có màn (thay màn "Unmatched Route" tiếng Anh của Expo Router). "/" tự chia theo vai trò. */
export default function NotFound() {
  const t = useTheme();
  return (
    <Screen>
      <StackHeader title="Không tìm thấy" />
      <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
        <EmptyState
          icon="file-search-line"
          title="Không tìm thấy trang"
          caption="Đường dẫn này không tồn tại hoặc đã bị đổi. Về trang chủ để tiếp tục."
          primaryText="Về trang chủ"
          onPrimary={() => router.replace('/')}
        />
      </View>
    </Screen>
  );
}
```

- [ ] **Step 4: `components/NoAccess.tsx` — nút Quay lại**

```tsx
import { router } from 'expo-router';
import { EmptyState } from '@gr/ds';

const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

/** 403 — chặn xem dữ liệu riêng (D6): chỉ chủ dữ liệu và HLV có kết nối active xem được, theo dõi KHÔNG mở. Có nút Quay lại như màn 404 theo đối tượng.
 *  `reason` thay câu giải thích mặc định. */
export function NoAccess({ reason = 'Chỉ HLV đã kết nối mới xem được dữ liệu này.' }: { reason?: string }) {
  return <EmptyState icon="lock-01-line" title="Không có quyền xem" caption={reason} primaryText="Quay lại" onPrimary={back} />;
}
```

- [ ] **Step 5: `components/Feedback.tsx` — toast lỗi, lưu/xoá giả lập, spinner**

Trước hết thêm 2 khoá vào `DELAYS` (`apps/golf/lib/simulate.ts`, Task 15) — thành `{ firstLoad: 400, save: 600, toast: 1200, toastError: 4000, ocr: 1500 }`
(sửa JSDoc: "save = lưu/xoá giả lập có spinner; toastError = toast thất bại"), và thêm `'save'`, `'toastError'` vào chú thích `hold` của
`storybook-app/lib/appStory.tsx` + README.

`SavedToast` (bản Task 13, đã đọc `DELAYS.toast` từ Task 15): thêm 3 prop tuỳ chọn `type`, `actionText`, `onAction` và truyền xuống `<Toast>`. Thời
gian hiện là `DELAYS.toastError` (4 s) khi `type === 'Negative'`, `DELAYS.toast` (1,2 s) cho thành công. Bản đầy đủ để đối chiếu:
```tsx
/** Toast kết quả ở đáy màn (MVP "Toasts": "Lưu thành công", "Xóa thất bại"…). Thành công tự đóng sau 1,2 s; thất bại (`type="Negative"`)
 *  giữ 4 s và có nút `actionText` (vd "Thử lại"). Hết giờ → `onDone`. */
export function SavedToast({ title, caption, onDone, type = 'Positive', actionText, onAction }: {
  title: string; caption?: string; onDone: () => void; type?: 'Positive' | 'Negative'; actionText?: string; onAction?: () => void;
}) {
  const t = useTheme();
  useEffect(() => {
    const timer = setTimeout(onDone, type === 'Negative' ? DELAYS.toastError : DELAYS.toast);
    return () => clearTimeout(timer);
  }, []); // hẹn giờ một lần khi hiện; toast mới → đổi `key`
  return (
    <View style={{ position: 'absolute', left: t.layout('Margin-Small'), right: t.layout('Margin-Small'), bottom: t.layout('Margin-Small') }}>
      <Toast type={type} title={title} caption={caption} actionText={actionText} onAction={onAction} />
    </View>
  );
}
```
Thêm vào cuối file. Import: dòng 2 → `import { useEffect, useRef, useState } from 'react';`; dòng 3 → `import { ActivityIndicator, View } from 'react-native';`;
thêm `Text` vào import `@gr/ds` (dòng 4); thêm `import { useStore } from '../lib/store';` (`DELAYS` đã import từ `'../lib/simulate'` ở Task 15).
```tsx
/** Lưu/xoá giả lập có độ trễ: `busy` trong DELAYS.save (nút khoá + SavingRow), rồi gọi `done()` — hoặc `fail()` (không ghi gì) khi bật
 *  Cài đặt › Dev › "Giả lập lỗi khi lưu/xoá". Rời màn khi đang chờ → huỷ như request bị huỷ. */
export function useSimulatedWrite() {
  const { state } = useStore();
  const [busy, setBusy] = useState(false);
  const failing = useRef(state.simulateFailure);
  failing.current = state.simulateFailure;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const run = (done: () => void, fail: () => void) => {
    setBusy(true);
    timer.current = setTimeout(() => {
      setBusy(false);
      (failing.current ? fail : done)();
    }, DELAYS.save);
  };
  return { busy, run };
}

/** Spinner + chữ khi đang gửi (MVP "Spinner khi gửi form"); trình đọc màn hình đọc ngay. */
export function SavingRow({ text = 'Đang lưu…' }: { text?: string }) {
  const t = useTheme();
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.space('Spacing/Gap/XSmall') }}>
      <ActivityIndicator color={t.color('Color/Content/Accent/Base')} accessibilityLabel={text} />
      <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Base">{text}</Text>
    </View>
  );
}
```

- [ ] **Step 6: `settings/dev.tsx` — công tắc giả lập lỗi**

Import thêm `ToggleRow` vào import `@gr/ds` (dòng 4); `state`, `dispatch` đã lấy từ `useStore()` (dòng 18). Chèn trước khối `section('Dữ liệu')`
(dòng 52):
```tsx
        <View style={{ gap: t.space('Spacing/Gap/XSmall') }}>
          {section('Giả lập')}
          <View style={{ paddingHorizontal: t.layout('Margin-Small') }}>
            <ToggleRow
              label="Giả lập lỗi khi lưu/xoá"
              caption="Lưu số liệu, gậy, tài khoản, bài viết và các nút xoá sẽ thất bại sau 0,6 giây — để xem toast lỗi và Thử lại"
              select={state.simulateFailure}
              onChange={(on) => dispatch({ type: 'setSimulateFailure', on })}
            />
          </View>
        </View>
```

- [ ] **Step 7: Lưu có độ trễ + toast lỗi ở 4 form**

Mỗi màn dưới đây:
- gọi `useSimulatedWrite()` và thêm state `failed` **trước mọi `return` sớm**;
- import `SavingRow`, `useSimulatedWrite` từ `components/Feedback` (đường dẫn tương đối như import `SavedToast` sẵn có).

1. `metrics/manual.tsx` (bản Task 20):
```tsx
  const { busy, run } = useSimulatedWrite();
  const [failed, setFailed] = useState(false);
```
Trong `save`, giữ phần dựng `session` (và các `return` khi chưa hợp lệ), thay 2 dòng cuối bằng:
```tsx
    run(
      () => {
        dispatch(editing ? { type: 'updateSession', session, at: NOW } : { type: 'addSession', session });
        setSaved(`Phiên ${isSwing ? 'swing' : 'thể lực'} ngày ${formatDate(capturedAt)}`);
      },
      () => setFailed(true),
    );
```
Chân form: `{busy && <SavingRow />}` đặt trên nút; nút `disabled={!!saved || busy}`. Trước `</Screen>`:
```tsx
      {failed && (
        <SavedToast
          type="Negative"
          title="Lưu thất bại"
          caption="Mất kết nối — số liệu chưa được lưu, form giữ nguyên."
          actionText="Thử lại"
          onAction={() => {
            setFailed(false);
            save();
          }}
          onDone={() => setFailed(false)}
        />
      )}
```
2. `clubs/new.tsx` (`ClubForm`): import `SavedToast, SavingRow, useSimulatedWrite` cạnh `AlertMessage` từ `'../../components/Feedback'`; thêm sau
   `const [done, setDone] = useState(false);` (dòng 27):
```tsx
  const { busy, run } = useSimulatedWrite();
  const [failed, setFailed] = useState(false);
```
   Thay `save` (dòng 38–43):
```tsx
  const save = () => {
    setSubmitted(true);
    if (!result.value || !me) return;
    const club = { ...initial, id, playerId: initial?.playerId ?? me.id, ...result.value };
    run(
      () => {
        setDone(true);
        onSubmit(club);
      },
      () => setFailed(true),
    );
  };
```
   Chân form (dòng 92–95): thêm `{busy && <SavingRow />}` trên nút; nút `disabled={done || busy}`. Cuối fragment (sau `</BottomSheet>`):
```tsx
      {failed && (
        <SavedToast
          type="Negative"
          title="Lưu thất bại"
          caption="Mất kết nối — gậy chưa được lưu, form giữ nguyên."
          actionText="Thử lại"
          onAction={() => {
            setFailed(false);
            save();
          }}
          onDone={() => setFailed(false)}
        />
      )}
```
3. `settings/account.tsx` (bản sau Task 24, 28): import `SavingRow, useSimulatedWrite` cạnh `AlertMessage, SavedToast`; thêm sau
   `const [avatarUrl, setAvatarUrl] = useState(me?.avatarUrl);` (trước `if (!me)`):
```tsx
  const { busy, run } = useSimulatedWrite();
  const [failed, setFailed] = useState(false);
```
   Thay `save`:
```tsx
  const save = () => {
    setSubmitted(true);
    if (!result.value) return;
    const patch = { ...result.value, avatarUrl };
    run(
      () => {
        dispatch({ type: 'updateProfile', id: me.id, patch });
        setSaved(true);
      },
      () => setFailed(true),
    );
  };
```
   Chân form: `{busy && <SavingRow />}` trên nút; nút `disabled={saved || busy}`. Trước `</Screen>`: toast lỗi như mục 2, `caption="Mất kết nối — thông
   tin tài khoản chưa được lưu."`.
4. `community/compose.tsx`: import `SavingRow, useSimulatedWrite` cạnh `SavedToast`; thêm sau `const [posted, setPosted] = useState(false);` (dòng 27,
   trước `if (!me)`):
```tsx
  const { busy, run } = useSimulatedWrite();
  const [failed, setFailed] = useState(false);
```
   Thay `submit` (dòng 44–50):
```tsx
  const submit = () => {
    setSubmitted(true);
    if (!result.value) return;
    // tag còn trong ô (chưa Enter / dấu phẩy) vẫn được tính
    const post = { id: newId('post'), authorId: me.id, createdAt: NOW, ...result.value, tags: addTags(tags, tagInput), swingId };
    run(
      () => {
        setPosted(true);
        dispatch({ type: 'addPost', post });
      },
      () => setFailed(true),
    );
  };
```
   Ngay trên nút "Đăng" (dòng 98): `{busy && <SavingRow text="Đang đăng…" />}`; nút `disabled={posted || busy}`. Trước `</Screen>`: toast lỗi như mục 2,
   `title="Đăng bài thất bại"`, `caption="Mất kết nối — bài chưa được đăng, nội dung giữ nguyên."`, Thử lại gọi `submit()`.

- [ ] **Step 8: Xoá có độ trễ + toast "Xoá thất bại" ở 4 nút xoá**

Quy tắc chung: thân xoá hiện có (sau Task 21: `deleteOnLeave(); back();` — xoá thật chạy khi màn rời stack) chuyển nguyên vào hàm `done` của
`run`. Dialog chỉ còn: đóng Dialog + gọi hàm xoá. Thất bại thì màn đứng yên (không rời, không xoá) và hiện toast. Mỗi màn import
`SavedToast, SavingRow, useSimulatedWrite` từ `components/Feedback` (đường dẫn tương đối như các import `components/*` sẵn có của file).

1. `metrics/[id].tsx` — thêm sau `const deleteOnLeave = useOnLeave(…)` (trước `if (!me)`):
```tsx
  const { busy, run } = useSimulatedWrite();
  const [failed, setFailed] = useState(false);
```
   Sau `const club = …`:
```tsx
  const remove = () =>
    run(
      () => {
        deleteOnLeave(); // xoá khi màn đã rời (Task 21)
        back();
      },
      () => setFailed(true),
    );
```
   - Dialog "Xoá phiên này?": `onPrimary={() => { setConfirmDelete(false); remove(); }}`.
   - Nút: `text={busy ? 'Đang xoá…' : 'Xoá phiên'}`, `disabled={busy}`; thêm `{busy && <SavingRow text="Đang xoá…" />}` ngay dưới nút.
   - Trước `</Screen>`: toast lỗi `type="Negative"`, `title="Xoá thất bại"`, `caption="Mất kết nối — phiên vẫn còn."`, `actionText="Thử lại"`,
     `onAction={() => { setFailed(false); remove(); }}`, `onDone={() => setFailed(false)}`.
2. `swings/[id].tsx` (trong `SwingView`, sau `const deleteOnLeave = useOnLeave(…)`), dùng 1 state lỗi cho 2 loại xoá:
```tsx
  const { busy, run } = useSimulatedWrite();
  const [failed, setFailed] = useState<{ title: string; caption: string; retry: () => void }>();
```
   Sau `const seek = …`:
```tsx
  const removeSwing = () =>
    run(
      () => {
        deleteOnLeave(); // xoá khi màn đã rời (Task 21)
        if (router.canGoBack()) router.back();
        else router.replace('/(player)/swings');
      },
      () => setFailed({ title: 'Xoá thất bại', caption: 'Mất kết nối — swing vẫn còn.', retry: removeSwing }),
    );
  const removeNote = (n: CoachNote) =>
    run(
      () => {
        dispatch({ type: 'deleteNote', id: n.id, coachId: me.id });
        if (editing?.id === n.id) {
          setEditing(undefined);
          setNote('');
        }
        setSent('Đã xoá ghi chú');
      },
      () => setFailed({ title: 'Xoá thất bại', caption: 'Mất kết nối — ghi chú vẫn còn.', retry: () => removeNote(n) }),
    );
```
   - Dialog "Xoá swing này?": `onPrimary={() => { setConfirmDelete(false); removeSwing(); }}`.
   - Dialog "Xoá ghi chú này?" (Task 18): `onPrimary={() => { setConfirmNoteDelete(false); if (deleting) removeNote(deleting); }}`.
   - Ngay dưới `StackHeader`: `{busy && <SavingRow text="Đang xoá…" />}`.
   - Trước `</Screen>`:
```tsx
      {failed && (
        <SavedToast
          type="Negative"
          title={failed.title}
          caption={failed.caption}
          actionText="Thử lại"
          onAction={() => {
            const retry = failed.retry;
            setFailed(undefined);
            retry();
          }}
          onDone={() => setFailed(undefined)}
        />
      )}
```
3. `clubs/[id]/index.tsx` (bản sau Task 21):
   - thêm `const { busy, run } = useSimulatedWrite();` và `const [failed, setFailed] = useState(false);` cạnh `const deleteOnLeave = useOnLeave(…)`
     (trước `if (!me)`);
   - sau `const back = …`: `const removeClub = () => run(() => { deleteOnLeave(); back(); }, () => setFailed(true));`;
   - Dialog "Xoá gậy này?": `onPrimary={() => { setConfirmDelete(false); removeClub(); }}`;
   - nút "Xoá gậy": `disabled={busy}`, ngay dưới nút `{busy && <SavingRow text="Đang xoá…" />}`;
   - toast lỗi như mục 1, `caption="Mất kết nối — gậy vẫn còn."`, Thử lại gọi `removeClub()`.

- [ ] **Step 9: Skeleton ở các màn danh sách**

Task 14 viết skeleton inline ở 2 màn (`(player)/home.tsx` dòng 33–37, `components/CommunityScreen.tsx` dòng 20–25: `useState(true)` + `setTimeout`
`DELAYS.firstLoad` từ Task 15), chưa có cơ chế dùng chung. Với 6 màn mới thì gom: tạo `apps/golf/components/ListSkeleton.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Skeleton, SkeletonText, useTheme } from '@gr/ds';
import { DELAYS } from '../lib/simulate';

const seen = new Set<string>();
/** Giả lập lần tải đầu của màn `key` trong phiên (dữ liệu mock có sẵn nên không có pha tải thật): true trong DELAYS.firstLoad đầu, các lần mở sau false.
 *  ponytail: bộ nhớ "đã tải" theo phiên JS — backend thật dùng trạng thái isLoading của truy vấn. */
export function useFirstLoad(key: string) {
  const [loading, setLoading] = useState(() => !seen.has(key));
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      seen.add(key);
      setLoading(false);
    }, DELAYS.firstLoad);
    return () => clearTimeout(timer);
  }, []);
  return loading;
}

/** Khung xương danh sách: `rows` hàng (ô tròn + 2 dòng chữ). DS ẩn sẵn với trình đọc màn hình. */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  const t = useTheme();
  return (
    <View style={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/Small') }}>
          <Skeleton shape="Round" size="Medium - 40px" />
          <View style={{ flex: 1 }}>
            <SkeletonText lines={2} />
          </View>
        </View>
      ))}
    </View>
  );
}
```
Chuyển 2 chỗ của Task 14 sang hook (giữ nguyên giao diện khung xương riêng của chúng):
- `apps/golf/app/(player)/home.tsx`: dòng 33–37 (`const [loading, setLoading] = useState(true); useEffect(…)`) → `const loading = useFirstLoad('home');`;
  dòng 1 → `import type { PropsWithChildren } from 'react';`; bỏ import `DELAYS` (Task 15); thêm `import { useFirstLoad } from '../../components/ListSkeleton';`.
- `apps/golf/components/CommunityScreen.tsx`: dòng 20–25 → `const loading = useFirstLoad('feed');`; dòng 1 → `import { useState } from 'react';`;
  bỏ import `DELAYS`; thêm `import { useFirstLoad } from './ListSkeleton';`.

Áp vào 6 màn. `const loading = useFirstLoad('<khoá>');` đặt trước mọi `return` sớm; import `{ ListSkeleton, useFirstLoad }` từ
`components/ListSkeleton` (đường dẫn tương đối). Vị trí `loading ? <ListSkeleton /> : …` trong JSX:

| Màn | Khoá | Vị trí |
|---|---|---|
| `(player)/swings.tsx` (bản Task 19) | `'swings'` | `{all.length > 0 ? (` → `{loading ? <ListSkeleton /> : all.length > 0 ? (` |
| `(player)/metrics.tsx` (bản Task 21) | `'metrics'` | `{(seg === 2 ? clubs.length : rows.length) > 0 ? (` → `{loading ? <ListSkeleton /> : (seg === 2 ? clubs.length : rows.length) > 0 ? (` |
| `(coach)/roster.tsx` (bản Task 17) | `'roster'` | trong `ScrollView`, dưới ô tìm: `{seg === 2 ? (` → `{loading ? <ListSkeleton /> : seg === 2 ? (` (giữ hero + Segmented) |
| `students/[id].tsx` | `` `student-${id}` `` | `ScrollView` nội dung tab: `{TABS[tab].render()}` → `{loading ? <ListSkeleton /> : TABS[tab].render()}` |
| `components/NotificationsScreen.tsx` | `'notifications'` | `{all.length ? (` → `{loading ? <ListSkeleton /> : all.length ? (` (giữ header) |
| `clubs/index.tsx` (bản Task 21) | `'clubs'` | `{clubs.length ? (` → `{loading ? <ListSkeleton /> : clubs.length ? (` (giữ Segmented) |

- [ ] **Step 10: Story F13 — `storybook-app/flows/F13-trang-thai.stories.tsx`**

Theo "Cách chạy một task luồng" bước 5 — trạng thái tạm thời lấy bằng `hold`, không bằng canh giờ. `FAIL = { type: 'setSimulateFailure', on: true } as const`;
`SAT7_FORM` = `play` điền form nhập tay như bước 08 của `steps.json` (`Gậy, chưa chọn` → `Sắt 7` → `typeIn` 6 ô 85 / 116 / 1,36 / 6700 / 17,5 / 150 → `Lưu`).
`+not-found` import từ `../../apps/golf/app/+not-found`. Story của mọi luồng đã đổi export ở Task 17–28 → sửa `GROUPS` của `MucLuc` (`00 · Mục lục
trạng thái`) theo id mới; kiểm mọi id trong file còn trong `index.json`:
```bash
curl -s http://localhost:6007/index.json > "$TMPDIR/sb-index.json"
grep -oE "'f[0-9]{2}--[a-z0-9-]+'" storybook-app/flows/F13-trang-thai.stories.tsx | tr -d "'" | sort -u | while read id; do
  node -e 'process.exit(require(process.argv[1]).entries[process.argv[2]] ? 0 : 1)' "$TMPDIR/sb-index.json" "$id" || echo "THIẾU $id"; done
```
Mong đợi: không dòng `THIẾU`.

| nn | Màn | `appStory` / `play` |
|---|---|---|
| 01 | `+not-found` | `as: 'p-minh'` |
| 02 | `(player)/swings` | `as: 'p-minh'`, tabs swings, `hold: ['firstLoad']` |
| 03 | `(player)/metrics` | `as: 'p-minh'`, tabs metrics, `hold: ['firstLoad']` |
| 04 | `(player)/swings` | `as: 'p-huy'`, tabs swings |
| 05 | `(player)/metrics` | `as: 'p-huy'`, tabs metrics |
| 06 | `(player)/metrics` | `as: 'p-huy'`, tabs metrics; tab `Bộ gậy` |
| 07 | `settings/dev` | `as: 'p-minh'`, `setup: [FAIL]` |
| 08 | `metrics/manual` | `as: 'p-minh'`, `hold: ['save']`; `SAT7_FORM` |
| 09 | `metrics/manual` | `as: 'p-minh'`, `setup: [FAIL]`, `hold: ['toastError']`; `SAT7_FORM` |
| 10 | `metrics/[id]` | `as: 'p-minh'`, `params: { id: 'ss-w1' }`, `setup: [FAIL]`, `hold: ['toastError']`; `Xoá phiên` → Dialog `Xoá` |
| 11 | `metrics/[id]` | như 10 nhưng không `FAIL`, `hold: ['save']` |
| 12 | `(player)/metrics` | `as: 'p-minh'`, tabs metrics, `setup: [{ type: 'deleteSession', id: 'ss-w1' }]` |
| 13 | `students/[id]` | `as: 'p-khoa'`, `params: { id: 'p-minh' }` |
| 14 | `(player)/home` | `as: 'p-khoa'`, tabs home |

**Biến thể mới** (trạng thái task thêm, 10 story): `02a · Đang tải — Học viên` (`(coach)/roster`, `as: 'c-tuan'`), `02b · Đang tải — chi tiết học viên`
(`students/[id]`, `c-tuan`, `p-minh`), `02c · Đang tải — Thông báo` (`notifications`, `p-minh`), `02d · Đang tải — Bộ gậy` (`clubs/index`, `p-minh`) — cả 4
`hold: ['firstLoad']`; `08a · Đang lưu — thêm gậy` (`clubs/new`), `08b · Đang lưu — tài khoản` (`settings/account`), `08c · Đang đăng bài`
(`community/compose`) — `hold: ['save']`, `play` điền hợp lệ rồi bấm nút lưu; `10a · Xoá swing thất bại` (`swings/[id]`, `sw-minh-2`), `10b · Xoá ghi chú
thất bại` (`swings/[id]`, `sw-minh-1`, `as: 'c-tuan'`), `10c · Xoá gậy thất bại` (`clubs/[id]/index`, `cl-pw`) — `setup: [FAIL]`, `hold: ['toastError']`,
`play` bấm nút xoá → Dialog xác nhận.
**Bản dựng:** `90` (Task 15) → `02e · Đang tải — Tổng quan`, `91` → `12a · Toast thành công — đã lưu phiên thể lực`; `00 · Mục lục trạng thái` giữ số
`00`; 5 story guard chuyển hướng (`01`–`05` bản dựng: chưa đăng nhập, HLV mở màn người chơi, người chơi mở màn HLV, sửa gậy người khác, hồ sơ bằng id
HLV) → `13a`…`13e` (cùng nhóm "không vào được").
README: id F13 cho `+not-found` (route mới — thêm dòng "Phủ route"), `settings/dev`; xoá dòng F13 ở "Chưa có (Phase 2)". `pnpm typecheck` → xanh.

- [ ] **Step 11: Khởi động lại Metro (route `+not-found` mới), storyboard từ story, chạy lại → xanh**

`pkill -f "expo start"` → chạy lại Metro web, rồi:
```bash
rm -f docs/flows/F13/*.png
SB_URL=http://localhost:6007 CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node scripts/shot-storybook.mjs docs/flows/F13 '^f13--' 390 844
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/flow-web.mjs docs/flows/F13/steps.json
```
Expected: mọi dòng `ok`; `PASS F13: 67 bước, 14 bước chụp, 18 story biến thể` (10 mới + `02e`, `12a`, `00`, `13a`–`13e`). Hồi quy F5 + F6 vì lưu/xoá giờ
có độ trễ 0,6 s — chạy lại luồng **và** sinh lại storyboard (story có `play` bấm Lưu giờ qua spinner):
```bash
for f in F05 F06; do
  id=$(echo $f | tr F f)
  rm -f docs/flows/$f/*.png
  SB_URL=http://localhost:6007 CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/shot-storybook.mjs docs/flows/$f "^$id--" 390 844
  CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/flow-web.mjs docs/flows/$f/steps.json
done
```
Expected: cả hai `PASS`.

- [ ] **Step 12: Đọc ảnh, gates, commit**

Đọc mọi ảnh `docs/flows/F13/` (sáng + tối):
- spinner nằm giữa, không đẩy nút ra ngoài màn;
- toast lỗi có nút Thử lại đọc rõ ở chế độ tối;
- skeleton không nháy chữ thật; story không `hold` (vd `f13--b-04-trong-swing`) không có skeleton.

Run: `pnpm typecheck && pnpm test && pnpm check:literals` → xanh. `pkill -f "expo start"; lsof -ti tcp:6007 | xargs kill`.
```bash
git add "apps/golf/app/+not-found.tsx" apps/golf/components apps/golf/lib/simulate.ts docs/flows/F13.md docs/flows/F13 docs/flows/F05 docs/flows/F05.md docs/flows/F06 docs/flows/F06.md
git add storybook-app/flows/F13-trang-thai.stories.tsx storybook-app/lib/appStory.tsx storybook-app/README.md storybook-app/issues
git add -u apps/golf
git commit -m "$(cat <<'EOF'
feat(states): trang 404, 403 có Quay lại, skeleton các màn danh sách, spinner khi lưu/xoá, toast thất bại + Thử lại, giả lập lỗi ở Dev + storyboard F13

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 30: Tổng kết — Dev "Kiểm tra theo luồng", chạy lại 13 luồng, `docs/flows/README.md`, `docs/product/mvp-checklist.md`

**Files:**
- Modify: `apps/golf/app/settings/dev.tsx` (mục "Kiểm tra theo luồng")
- Create: `docs/flows/README.md`, `docs/product/mvp-checklist.md`
- Modify: `README.md` gốc (Task 14 tạo; thêm mục "Kiểm tra theo luồng"), `CLAUDE.md` (mục GramGolf của Task 14: thêm 2 dòng)
- Modify: `storybook-app/flows/F12-ho-so-cai-dat.stories.tsx` (story Dev › Kiểm tra theo luồng), `storybook-app/README.md`
- Modify (chạy lại): `docs/flows/F*.md`, `docs/flows/F*/*.png`

**Interfaces:**
- Consumes: mọi kịch bản `docs/flows/F*/steps.json`; actions `reset`, `setSimulateFailure`, `signIn`, `signOut`; Storybook app (Task 15).
- Produces:
  - Dev › "Kiểm tra theo luồng" có 13 mục. Chạm một mục:
    1. đặt lại dữ liệu mẫu;
    2. tắt giả lập lỗi;
    3. đăng nhập đúng tài khoản của `account` trong `steps.json` của luồng (F1–F3: đăng xuất);
    4. mở đúng màn `start` của `steps.json` (bước 1 của bảng `F<nn>.md`).

- [ ] **Step 1: `settings/dev.tsx` — Kiểm tra theo luồng**

Import thêm (bản sau Task 29):
- `Icon` vào import `@gr/ds` (dòng 4);
- `type Href` vào import `expo-router` (dòng 3: `import { Redirect, router, type Href } from 'expo-router';`);
- `ID` vào import kiểu (dòng 5: `import type { ID, Role } from '../../lib/domain';`). `resetTo` đã import từ `components/StackHeader` (dòng 8).

Thêm trên `export default function DevSettings`:
```tsx
/** Kiểm tra theo luồng (docs/flows/README.md): chạm 1 luồng → đặt lại dữ liệu mẫu, tắt giả lập lỗi, đăng nhập đúng tài khoản, mở bước 1.
 *  Bước chi tiết + ảnh mong đợi ở docs/flows/F<nn>.md. */
const FLOWS: { id: string; title: string; account?: ID; start: Href; hint: string }[] = [
  // start / account = đúng `start` (bỏ ?as=) và tài khoản của docs/flows/F<nn>/steps.json — bước 1 của bảng F<nn>.md
  { id: 'F1', title: 'Người chơi mới', start: '/(auth)/welcome', hint: 'Đăng xuất · màn chào → Tạo tài khoản (Người chơi) · OTP 123456' },
  { id: 'F2', title: 'HLV mới', start: '/(auth)/welcome', hint: 'Đăng xuất · màn chào → Tạo tài khoản (Huấn luyện viên) · OTP 123456' },
  { id: 'F3', title: 'Tài khoản', start: '/(auth)/welcome', hint: 'Đăng xuất · màn chào → Đăng nhập (sai rồi đúng) · Quên mật khẩu' },
  { id: 'F4', title: 'Kết nối HLV – học viên', account: 'c-tuan', start: '/(coach)/roster', hint: 'HLV Đỗ Minh Tuấn · Học viên › Tất cả' },
  { id: 'F5', title: 'Số liệu', account: 'p-minh', start: '/(player)/home', hint: 'Nguyễn Minh Anh · Tổng quan → Thông số' },
  { id: 'F6', title: 'Bộ gậy', account: 'p-minh', start: '/(player)/metrics', hint: 'Nguyễn Minh Anh · Thông số → Bộ gậy' },
  { id: 'F7', title: 'Swing của người chơi', account: 'p-minh', start: '/(player)/swings', hint: 'Nguyễn Minh Anh · Swing' },
  { id: 'F8', title: 'HLV review swing', account: 'p-minh', start: '/(player)/swings', hint: 'Minh Anh đăng swing → đổi sang HLV Tuấn ở Dev' },
  { id: 'F9', title: 'HLV xem học viên', account: 'c-tuan', start: '/(coach)/roster', hint: 'HLV Đỗ Minh Tuấn · Học viên' },
  { id: 'F10', title: 'Cộng đồng', account: 'p-minh', start: '/(player)/community', hint: 'Nguyễn Minh Anh · Cộng đồng' },
  { id: 'F11', title: 'Thông báo', account: 'p-minh', start: '/(player)/home', hint: 'Nguyễn Minh Anh · Tổng quan → chuông (2 chưa đọc)' },
  { id: 'F12', title: 'Hồ sơ & cài đặt', account: 'p-minh', start: '/(player)/home', hint: 'Nguyễn Minh Anh · Tổng quan → avatar góc phải' },
  // typedRoutes không nhận URL không có màn → ép kiểu: đây chính là bước 1 của F13 (màn 404)
  { id: 'F13', title: 'Trạng thái xuyên suốt', account: 'p-minh', start: '/trang-khong-co' as Href, hint: 'Nguyễn Minh Anh · link không tồn tại → 404; bật Giả lập lỗi ở dưới cho bước 07' },
];
```
Trong component, sau `if (!__DEV__) return <Redirect href="/" />;` (dòng 20):
```tsx
  const startFlow = (f: (typeof FLOWS)[number]) => {
    dispatch({ type: 'reset' });
    dispatch({ type: 'setSimulateFailure', on: false });
    dispatch(f.account ? { type: 'signIn', userId: f.account } : { type: 'signOut' });
    resetTo(f.start); // như đổi hồ sơ mẫu (Task 14): Hồ sơ / Cài đặt / Dev của phiên cũ không nằm dưới stack
  };
```
Mục đầu tiên trong `ScrollView` (trên các nhóm hồ sơ):
```tsx
        <View style={{ gap: t.space('Spacing/Gap/XSmall') }}>
          {section('Kiểm tra theo luồng')}
          <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light" style={{ paddingHorizontal: t.layout('Margin-Small') }}>
            Chạm một luồng: đặt lại dữ liệu mẫu, đăng nhập đúng tài khoản và mở bước 1. Bước chi tiết và ảnh mong đợi ở docs/flows.
          </Text>
          <View>
            {FLOWS.map((f) => (
              <ListItem
                key={f.id}
                title={`${f.id} · ${f.title}`}
                caption={f.hint}
                leading={<Icon name="play-circle-line" size={t.size('Element-Size/Popular/Medium')} color="Color/Content/Accent/Base" />}
                onPress={() => startFlow(f)}
              />
            ))}
          </View>
        </View>
```
Đối chiếu tự động: với mỗi `docs/flows/F*/steps.json`, `start` (bỏ `?as=…`) phải bằng `start` của mục cùng luồng, và `?as=` (nếu có) bằng `account`:
```bash
for f in docs/flows/F*/steps.json; do node -e 'const j=require("./"+process.argv[1]);const [r,q]=j.start.split("?as=");console.log(j.flow, r, q??"(đăng xuất)")' "$f"; done
```
So 13 dòng in ra với bảng `FLOWS` (F01 ↔ `F1`…): F1–F3 `start` là `/` → mục dùng `/(auth)/welcome` (`/` của người chưa đăng nhập chuyển về màn chào).

Kiểm nhanh trên web:
1. `/settings/dev?as=p-minh` → chạm "F4 · Kết nối HLV – học viên" → Học viên › **Tất cả** của HLV Tuấn (bước 01 của `F04.md`).
2. Quay lại Dev → "F1 · Người chơi mới" → màn chào. "F3 · Tài khoản" → màn chào.
3. "F13 · Trạng thái xuyên suốt" → màn 404 "Không tìm thấy trang" của Nguyễn Minh Anh.

Story: thêm vào `storybook-app/flows/F12-ho-so-cai-dat.stories.tsx` biến thể `04d · Dev — Kiểm tra theo luồng` (`settings/dev`, `as: 'p-minh'`);
README xoá dòng F12 còn lại ở "Chưa có (Phase 2)". Ảnh màn Dev vào `docs/flows/` cùng lượt chụp F12 ở Step 2.

- [ ] **Step 2: Hồi quy toàn bộ — sinh lại 13 storyboard từ story, chạy lại 13 lượt đi**

Metro web 8081 + Storybook app 6007 chạy nền (Global Constraints). Storyboard trước (code cuối có thể đổi màn của luồng trước), lượt đi sau
(script kiểm ảnh có đủ):
```bash
cd "/Users/duncreative/Coding Agent/Gram-Golf"
export CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" SB_URL=http://localhost:6007
for d in docs/flows/F[0-9][0-9]; do
  f=$(basename "$d"); id=$(echo "$f" | tr F f)
  rm -f "$d"/*.png
  node scripts/shot-storybook.mjs "$d" "^$id--" 390 844 | grep -v '^ok' ; # chỉ in dòng ERROR
done
node scripts/shot-web.mjs "/settings/dev?as=p-minh" light docs/flows/dev-kiem-tra-theo-luong-light.png 390 844
node scripts/shot-web.mjs "/settings/dev?as=p-minh" dark docs/flows/dev-kiem-tra-theo-luong-dark.png 390 844
for f in docs/flows/F*/steps.json; do node scripts/flow-web.mjs "$f" || { echo "DỪNG ở $f"; break; }; done
```
Expected: vòng chụp không in dòng `ERROR`; 13 dòng `PASS F01…F13`, không dòng `DỪNG`. Luồng nào FAIL: đó là hồi quy do task sau làm hỏng → sửa code
(không sửa JSON trừ chữ đổi có chủ đích, ghi lý do), chụp lại + chạy lại luồng đó rồi chạy lại cả vòng.

Kiểm thêm:
```bash
grep -rn "Đang dựng" apps/golf/app apps/golf/components      # Expected: không có dòng nào
# số ảnh storyboard = 2 × số story của 13 luồng trong Storybook app
ls docs/flows/F*/*.png | wc -l
curl -s http://localhost:6007/index.json | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(2*Object.values(JSON.parse(d).entries).filter(e=>e.type==="story"&&/^f\d\d--/.test(e.id)).length))'
# Expected: 2 số bằng nhau (13 luồng có 191 bước chụp cộng các story biến thể)
grep -L "steps:start" docs/flows/F*.md                         # Expected: không in file nào
sed -n '/^## Chưa có (Phase 2)/,/^## [^C]/p' storybook-app/README.md | grep -c '^| F'   # Expected: 0 — mọi bước Phase 2 đã có story
# mọi story id ở README (Phủ route) và mục lục F13 còn trong index.json
curl -s http://localhost:6007/index.json > "$TMPDIR/sb-index.json"
grep -ohE "f[0-9]{2}--[a-z0-9-]+" storybook-app/README.md storybook-app/flows/F13-trang-thai.stories.tsx | sort -u | while read id; do
  node -e 'process.exit(require(process.argv[1]).entries[process.argv[2]] ? 0 : 1)' "$TMPDIR/sb-index.json" "$id" || echo "THIẾU $id"; done
# Expected: không dòng THIẾU
```

- [ ] **Step 3: `docs/flows/README.md`**

```markdown
# Kiểm tra GramGolf theo luồng chức năng

13 luồng F1–F13, kiểm được 3 cách: trên điện thoại (Expo Go), trong **Storybook app** (màn thật, từng bước, cả trạng thái khó bấm tới), và lượt đi
tự động trên web. Mỗi luồng gồm:
- `F<nn>.md`: tài khoản, bảng bước (route · thao tác · kết quả mong đợi · ảnh), bảng "Trạng thái khác" (story biến thể), mục "Đã biết / chưa làm";
- `F<nn>/`: ảnh storyboard 390×844 sáng + tối, **sinh từ story** của Storybook app (`<story-id>.light.png` / `.dark.png`; ảnh của bước `nn` là
  `f<nn>--b-<nn>-<bước>.*.png`), và `steps.json` — kịch bản lượt đi tự động.

| Luồng | Nội dung | Bắt đầu với | Tài liệu |
|---|---|---|---|
| F1 Người chơi mới | chào → đăng ký → OTP → onboarding → Tổng quan trống → số liệu đầu tiên → Tổng quan có dữ liệu | (đăng xuất) | [F01.md](F01.md) |
| F2 HLV mới | đăng ký HLV → OTP → onboarding + giới thiệu nghề nghiệp → Học viên trống → mã mời | (đăng xuất) | [F02.md](F02.md) |
| F3 Tài khoản | đăng nhập sai/đúng → quên mật khẩu → link → đặt lại → đăng nhập lại; đổi mật khẩu; đăng xuất | (đăng xuất) | [F03.md](F03.md) |
| F4 Kết nối HLV–học viên | mã mời (tạo/chia sẻ/thu hồi/5 lỗi) → học viên nhập mã → HLV nhận thông báo + thấy trong roster; lời mời 2 chiều, HLV chính/phụ, huỷ kết nối 2 phía → 403 | HLV Đỗ Minh Tuấn | [F04.md](F04.md) |
| F5 Số liệu | nhập tay / CSV / ảnh (lỗi + thử lại) / QR → lịch sử Swing / Thể lực → chi tiết → sửa → xoá → Tổng quan; m ↔ yd | Nguyễn Minh Anh | [F05.md](F05.md) |
| F6 Bộ gậy | thêm (16 loại + tuỳ chỉnh) → sửa → lưu trữ / khôi phục → xoá; gậy mới trong chọn gậy của số liệu và đăng swing | Nguyễn Minh Anh | [F06.md](F06.md) |
| F7 Swing của người chơi | hướng dẫn → video + gậy + góc + ngày → popup file lỗi → tải (tạm dừng, lỗi mạng) → phân tích → lưới/lọc/sắp xếp → xoá | Nguyễn Minh Anh | [F07.md](F07.md) |
| F8 HLV review swing | thông báo swing mới → Cần phản hồi → học viên → swing Chưa review → workspace (chèn mốc, viết/sửa/xoá ghi chú) → học viên đọc, tua → Đã review | Nguyễn Minh Anh → HLV Tuấn | [F08.md](F08.md) |
| F9 HLV xem học viên | roster (tìm, lọc) → chi tiết 5 tab chỉ đọc → 403 / 404 | HLV Đỗ Minh Tuấn | [F09.md](F09.md) |
| F10 Cộng đồng | bảng tin → thích / bỏ thích → bình luận → ai đã thích → đăng bài → khám phá → chặn / báo cáo | Nguyễn Minh Anh | [F10.md](F10.md) |
| F11 Thông báo | mỗi loại → đúng màn → đã đọc; đánh dấu tất cả; số trên chuông | Nguyễn Minh Anh | [F11.md](F11.md) |
| F12 Hồ sơ & cài đặt | hồ sơ, tài khoản (ảnh, tên, handicap, bio), quyền riêng tư + bỏ chặn, thông báo, đơn vị, xoá tài khoản | Nguyễn Minh Anh | [F12.md](F12.md) |
| F13 Trạng thái | 404, skeleton, empty state, spinner khi lưu/xoá, toast lỗi + Thử lại, 403 | Nguyễn Minh Anh (404) / Phạm Quốc Huy / Lê Đăng Khoa | [F13.md](F13.md) |

## Kiểm trên điện thoại (Expo Go)
1. Máy tính, lần đầu: `pnpm install`. Chạy `pnpm -F golf start` rồi quét QR bằng Expo Go; điện thoại và máy tính cùng Wi-Fi. Không thấy máy thì
   chạy `pnpm -F golf start --tunnel`.
2. Trong app, mở **Kiểm tra theo luồng** bằng một trong hai đường:
   - Chạm avatar góc phải (Hồ sơ của tôi) → Cài đặt → Dev;
   - màn chào → "Dùng tài khoản mẫu" (khi chưa đăng nhập).
3. Chạm luồng cần kiểm. App sẽ đặt lại dữ liệu mẫu, đăng nhập đúng tài khoản và mở đúng màn của bước 1 trong `F<nn>.md`.
4. Làm theo bảng "Các bước" trong `F<nn>.md`, so với ảnh. Bước đổi tài khoản: Hồ sơ → Cài đặt → Dev → chạm tên. Dữ liệu vừa tạo trong phiên
   được giữ.
5. Màn Dev chỉ có ở bản phát triển. Tải lại app (reload) là dữ liệu mẫu nạp lại từ đầu.
6. Chỉ kiểm được trên máy thật (lượt đi web không thay được): bàn phím không che ô / nút ở form có footer cố định (Nhập tay, Thêm gậy, Tài khoản,
   Mật khẩu, Đăng ký — iOS và Android); đổi tài khoản / đăng xuất / xoá tài khoản không để màn cũ dưới stack (vuốt lui); xoá phiên / swing / gậy /
   bài: màn đang rời không nháy "Không tìm thấy…".

## Kiểm trong Storybook app (màn thật theo luồng)
1. Từ gốc repo: `pnpm storybook:app --no-open` → mở http://localhost:6007 (cổng 6006 là Storybook của design system — khác). Tắt:
   `lsof -ti tcp:6007 | xargs kill`.
2. Sidebar **Luồng** → `Luồng/F<nn> · <tên luồng>`. Story `nn · <bước>` = bước `nn` trong bảng của `F<nn>.md`; story `nna · …`, `nnb · …` = trạng
   thái khác của bước đó (lỗi, rỗng, đang tải, 403, 404…). Toolbar: Theme sáng/tối, Viewport (Mobile 390 mặc định).
3. Mỗi story là một màn đã dựng sẵn dữ liệu của bước (đăng nhập đúng tài khoản, các thao tác trước đã làm). Bấm điều hướng trong story **không**
   đổi màn — chỉ ghi vào panel Actions; đi xuyên màn thì dùng Expo Go hoặc lượt đi tự động.
4. Sinh lại storyboard của một luồng sau khi sửa màn (Storybook app đang chạy):
   `SB_URL=http://localhost:6007 CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/shot-storybook.mjs docs/flows/F04 '^f04--' 390 844`
   rồi chạy lượt đi của luồng (mục dưới) để bảng `F04.md` trỏ đúng ảnh.
5. Cách viết story, bảng "Phủ route" (route → story id): `storybook-app/README.md`.

## Kiểm trên web (lượt đi tự động)
Lượt đi bấm như người dùng trên web 390×844, đổi tài khoản qua Cài đặt › Dev trong cùng phiên — chứng minh bàn giao giữa màn và giữa hai vai trò
(điều story không làm được). Ảnh storyboard thì lấy từ story.
1. Chạy nền `pnpm -F golf exec expo start --web --port 8081` và `pnpm storybook:app --no-open`.
2. Một luồng: `CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/flow-web.mjs docs/flows/F04/steps.json`. Kết quả
   `PASS F04: … bước, … bước chụp, … story biến thể`; bảng bước trong `F04.md` được ghi lại. Script cũng FAIL nếu bước chụp nào chưa có story / ảnh.
3. Cả 13 luồng: `for f in docs/flows/F*/steps.json; do node scripts/flow-web.mjs "$f" || break; done`.
4. Lỗi thì script in bước hỏng và đường dẫn ảnh chụp lúc lỗi (thư mục tạm của máy); ảnh điểm kiểm của lượt đi ở `$TMPDIR/flow-F<nn>/`.
5. Mở tay một màn: thêm `?as=<id>` để đăng nhập nhanh (chỉ bản dev), vd `http://localhost:8081/(player)/home?as=p-minh`.

## Tài khoản mẫu
| id | Tên | Vai trò | Dùng để kiểm |
|---|---|---|---|
| p-minh | Nguyễn Minh Anh | Người chơi | đủ dữ liệu (12 phiên, 8 gậy, 3 swing); HLV chính Tuấn + HLV phụ Hà |
| p-lan | Trần Thu Lan | Người chơi | HLV Tuấn; swing chưa có ghi chú → "Cần phản hồi"; kết nối cũ với Hà đã huỷ |
| p-khoa | Lê Đăng Khoa | Người chơi | HLV chính Hà; theo dõi Minh Anh (theo dõi ≠ quyền xem → 403) |
| p-huy | Phạm Quốc Huy | Người chơi | chưa có dữ liệu (empty state); đang chờ HLV Hà duyệt yêu cầu kết nối |
| c-tuan | HLV Đỗ Minh Tuấn | HLV | 2 học viên; mã mời TUAN24 |
| c-ha | HLV Vũ Thanh Hà | HLV | 2 học viên; 1 yêu cầu kết nối chờ duyệt (Huy) |

## Mã và link thử
- OTP: `123456`. Mã mời: `TUAN24` (còn hạn), `HAEXP1` (hết hạn), `USED01` (đã dùng).
- Đăng nhập: email hoặc SĐT của tài khoản mẫu, mật khẩu bất kỳ ≥ 6 ký tự (auth mock).
- Link đặt lại mật khẩu: nút "Mở link (thử)" sau khi gửi, hoặc `gramgolf://reset-password?token=GG-RESET-OK`. `GG-RESET-EXPIRED` là link hết hạn.
- Video mẫu lỗi:
  - `swing_4k_120fps_dai.mov`: quá dung lượng;
  - `anh_tu_the_chuan_bi.jpg`: không phải video;
  - `wedge_mang_yeu.mp4`: mất mạng ở 60%;
  - `driver_nguoc_sang.mp4`: cần xem lại;
  - `pw_may_chu_ban.mp4`: phân tích lỗi ở 50 % (máy chủ bận), Thử lại chạy tiếp.
- Giả lập lỗi khi lưu/xoá: Cài đặt › Dev › công tắc "Giả lập lỗi khi lưu/xoá".

## Phạm vi
- Mobile-first 390×844 (spec D2), không có giao diện web/desktop.
- Đối chiếu từng mục MVP issue #1: [../product/mvp-checklist.md](../product/mvp-checklist.md).
```

- [ ] **Step 4: `docs/product/mvp-checklist.md`**

Đối chiếu lại từng dòng với code cuối. Ảnh nêu trong bảng là ảnh story của bước (`F<nn>/f<nn>--b-<nn>-<bước>.light.png`, có bản `.dark.png` cạnh
bên) và phải có thật (`ls`). Nếu số thứ tự bước đổi do sửa JSON thì sửa đường dẫn cho khớp.
```markdown
# MVP issue #1 — đối chiếu sau Phase 2

Nguồn: https://github.com/Duncreative20/Gram-Golf/issues/1 (38 mục). Quyết định chủ dự án 08/10/2026: spec + plan 07/10 (mobile-first) thắng
mọi mâu thuẫn với MVP; mục mâu thuẫn không làm, có lý do một dòng. Ảnh ở `docs/flows/<Fxx>/` (sinh từ story của Storybook app, sáng + tối);
cách kiểm (Expo Go, Storybook app, lượt đi tự động) ở `docs/flows/README.md`.

| Mã | Mục MVP | Kết quả | Luồng · file · ảnh / lý do |
|---|---|---|---|
| M1.1 | Khung Mobile — Bottom Navigation | Xong | F1, F2 · `apps/golf/components/AppTabBar.tsx`, `app/(player)/_layout.tsx`, `app/(coach)/_layout.tsx` · `F01/f01--b-07-tong-quan-trong.light.png`, `F02/f02--b-05-hoc-vien-trong.light.png` |
| M1.2 | Khung Web/Desktop — Sidebar | Không làm | Mâu thuẫn spec D2: mobile-first, web chỉ để chụp/kiểm tra. |
| M1.3 | Header: Back, Tiêu đề, Avatar nhỏ, Icon thông báo | Xong | F5, F12 · `components/TabHeader.tsx` (tiêu đề + chuông có số + avatar ảnh, vùng chạm ≥ 44 px), `components/StackHeader.tsx` (Back + tiêu đề) · `F05/f05--b-01-tong-quan-truoc.light.png`, `F05/f05--b-07-chi-tiet.light.png` |
| M2.1 | Đăng nhập Email/Password | Xong | F3 · `app/(auth)/login.tsx` · `F03/f03--b-01-dang-nhap-sai.light.png`, `F03/f03--b-06-vao-app.light.png` |
| M2.2 | Đăng ký + chọn vai trò | Xong | F1, F2 · `app/(auth)/register.tsx`, `lib/validation.ts` · `F01/f01--b-02-chon-vai-tro.light.png`, `F02/f02--b-01-dang-ky-hlv.light.png` |
| M2.3 | Quên mật khẩu (nhận link) | Xong | F3 · `app/(auth)/forgot-password.tsx` · `F03/f03--b-03-da-gui-link.light.png` |
| M2.4 | Đặt lại mật khẩu từ link | Xong | F3 · `app/(auth)/reset-password.tsx`, `lib/simulate.ts` (`resetTokenStatus`) · `F03/f03--b-04-dat-lai-loi.light.png`, `F03/f03--b-11-link-het-han.light.png` |
| M2.5 | Onboarding: Avatar bắt buộc, Tên, Bio HLV | Xong một phần | Tên: bắt buộc ở đăng ký (F1). Bio HLV: `app/(auth)/onboarding.tsx` · `F02/f02--b-02-bio-bat-buoc.light.png`. **Avatar bắt buộc: không làm** — mâu thuẫn plan Task 4 (avatar tuỳ chọn, cho dùng chữ tắt). |
| M3.1 | Dashboard: thẻ chỉ số, xu hướng 5 buổi (Recharts) | Xong (trừ Recharts) | F5, F1 · `app/(player)/home.tsx`, `components/charts/TrendChart.tsx` · `F05/f05--b-01-tong-quan-truoc.light.png`, `F05/f05--b-20-tong-quan-sau.light.png`. Recharts: mâu thuẫn spec D11 (biểu đồ SVG tự vẽ, Recharts không chạy trên RN). "Buổi" = phiên: 1 dòng CSV = 1 phiên (plan Task 7), nên 5 buổi gần nhất có thể là nhiều cú cùng ngày. |
| M3.2 | My Swings: Lưới/Danh sách, lọc/sắp xếp theo ngày | Xong | F7 · `app/(player)/swings.tsx`, `lib/selectors.ts` (`filterSwings`) · `F07/f07--b-01-danh-sach.light.png`, `F07/f07--b-02-luoi.light.png`, `F07/f07--b-03-loc-sap-xep.light.png` |
| M3.3 | Chi tiết Swing: player, thông số gậy/ngày | Xong | F7 · `app/swings/[id].tsx` · `F07/f07--b-11-phan-tich-xong.light.png`, `F07/f07--b-13-gay-cua-swing.light.png` |
| M3.4 | Đọc phản hồi: Coach Note, chạm mốc để tua | Xong | F8 · `app/swings/[id].tsx` (SeekRow, chip "Tua tới") · `F08/f08--b-15-tua-theo-moc.light.png` |
| M3.5 | My Clubs: Active / Archived | Xong | F6 · `app/clubs/index.tsx`, `app/clubs/[id]/index.tsx` · `F06/f06--b-10-luu-tru.light.png`, `F06/f06--b-11-gay-luu-tru.light.png` |
| M3.6 | Lịch sử luyện tập | Xong | F5 · `app/(player)/metrics.tsx`, `components/SessionRow.tsx` · `F05/f05--b-02-lich-su.light.png`, `F05/f05--b-10-the-luc.light.png` |
| M3.7 | Quản lý kết nối HLV: HLV hiện tại, Huỷ kết nối | Xong | F4 · `app/(player)/coach.tsx` · `F04/f04--b-15-doi-hlv-chinh.light.png`, `F04/f04--b-26-hoc-vien-huy.light.png`, `F04/f04--b-28-ha-mat-quyen-403.light.png` (HLV mất quyền ngay khi học viên huỷ) |
| M3.8 | Duyệt lời mời: Chấp nhận/Từ chối yêu cầu từ HLV | Xong | F4 · `app/(player)/coach.tsx`, `app/coaches/[id].tsx`, `lib/reducer.ts` (`respondConnection`) · `F04/f04--b-07-tab-hlv-loi-moi.light.png`, `F04/f04--b-08-da-ket-noi.light.png` |
| M3.9 | Hồ sơ & Cài đặt: Profile, gạt đơn vị, Đăng xuất | Xong (đơn vị theo plan) | F12, F3 · `app/profile.tsx`, `app/settings/*` · `F12/f12--b-07-don-vi.light.png`, `F03/f03--b-09-dang-xuat.light.png`. "Nút gạt": dùng RadioRow theo plan Task 13; hệ Imperial đầy đủ: mâu thuẫn D9 (chỉ m/yd). |
| M3.10 | Trung tâm thông báo, chạm → đúng swing | Xong | F11, F8 · `components/NotificationsScreen.tsx` · `F11/f11--b-02-ghi-chu-den-swing.light.png`, `F08/f08--b-15-tua-theo-moc.light.png` |
| M4.1 | Roster: học viên active | Xong | F9 · `app/(coach)/roster.tsx` · `F09/f09--b-01-tim.light.png`, `F09/f09--b-02-can-phan-hoi.light.png` |
| M4.2 | Lời mời đang chờ: Duyệt/Từ chối học viên, Tạo/Copy mã | Xong | F4 · `app/(coach)/roster.tsx`, `app/connect/invite.tsx` · `F04/f04--b-03-tao-ma.light.png`, `F04/f04--b-13-hlv-duyet.light.png`, `F04/f04--b-14-roster-co-khoa.light.png` |
| M4.3 | Tổng quan học viên (chỉ đọc) | Xong | F9 · `app/students/[id].tsx` · `F09/f09--b-03-tong-quan.light.png` … `F09/f09--b-09-the-luc.light.png` |
| M4.4 | Video học viên: Đã review / Chưa review | Xong | F8 · `app/students/[id].tsx`, `lib/selectors.ts` (`swingsByReview`) · `F08/f08--b-05-swing-chua-review.light.png`, `F08/f08--b-16-da-review.light.png`, `F08/f08--b-17-chua-review.light.png` |
| M4.5 | Review Workspace: player, form note, nút chèn Timestamp | Xong | F8 · `app/swings/[id].tsx` · `F08/f08--b-06-workspace.light.png`, `F08/f08--b-07-chen-moc.light.png` |
| M4.6 | Hồ sơ HLV: cập nhật profile, Bio | Xong | F2, F12 · `app/(coach)/me.tsx`, `app/settings/account.tsx` · `F02/f02--b-07-ho-so-hlv.light.png`, `F12/f12--b-12-ho-so-hlv-moi.light.png` |
| M4.7 | Thông báo HLV: học viên nhận lời, vừa upload swing | Xong | F4, F8 · `lib/reducer.ts` (`swing_uploaded`), `components/NotificationsScreen.tsx` · `F04/f04--b-09-hlv-nhan-thong-bao.light.png`, `F04/f04--b-24-ha-nhan-thong-bao.light.png`, `F08/f08--b-03-thong-bao-swing-moi.light.png` |
| M5.1 | Upload video: file → progress → Gậy & Ngày | Xong (thứ tự theo plan) | F7 · `app/swings/new.tsx`, `components/SwingUpload.tsx` · `F07/f07--b-07-chon-video-gay-ngay.light.png`, `F07/f07--b-09-loi-mang.light.png`. Thứ tự "file → progress → form": mâu thuẫn plan Task 9 (chọn gậy + ngày trước khi tải). |
| M5.2 | Form thêm/sửa Metrics (Distance, Club/Ball Speed, Direction…) | Xong (trừ Direction) | F5 · `app/metrics/manual.tsx`, `lib/validation.ts` (`swingRaw`) · `F05/f05--b-04-loi-truong.light.png`, `F05/f05--b-09-sau-sua.light.png`, `F05/f05--b-11-the-luc-sau-sua.light.png`. Direction: không làm — không vừa bộ 6 trường bắt buộc của CSV/OCR/form (trường có dấu, đổi m/yd, file mẫu không có cột). |
| M5.3 | Form thêm/sửa Gậy (Tên, Loại) | Xong | F6 · `app/clubs/new.tsx` (`ClubForm`) · `F06/f06--b-02-16-loai.light.png`, `F06/f06--b-03-form-tuy-chinh.light.png`, `F06/f06--b-08-sua-xong.light.png` |
| M5.4 | Form sửa Coach Note | Xong | F8 · `app/swings/[id].tsx` · `F08/f08--b-09-dang-sua.light.png` |
| M5.5 | Popup xác nhận xoá: video, gậy, metrics, Note | Xong | F7, F6, F5, F8 · `F07/f07--b-14-xoa-swing.light.png`, `F06/f06--b-12-xoa-gay.light.png`, `F05/f05--b-19-sau-xoa.light.png`, `F08/f08--b-10-xoa-ghi-chu.light.png` |
| M5.6 | Popup hành động nhạy cảm: huỷ kết nối học viên/HLV | Xong | F4 · `app/(player)/coach.tsx`, `app/students/[id].tsx` · `F04/f04--b-29-hlv-huy-ket-noi.light.png`, `F04/f04--b-30-mat-quyen-403.light.png` |
| M6.1 | Empty states (Video, Gậy, Học viên, Metrics) | Xong | F13, F1, F2 · `F13/f13--b-04-trong-swing.light.png`, `F13/f13--b-05-trong-thong-so.light.png`, `F13/f13--b-06-trong-bo-gay.light.png`, `F02/f02--b-05-hoc-vien-trong.light.png`. Minh hoạ là icon DS (spec §4). |
| M6.2 | Loading: Skeleton, Spinner khi gửi form | Xong | F13 · `components/ListSkeleton.tsx` (`useFirstLoad`), `components/Feedback.tsx` (`SavingRow`) · `F13/f13--b-02-skeleton-swing.light.png`, `F13/f13--b-08-dang-luu.light.png` |
| M6.3 | Toasts: "Lưu thành công", "Xóa thất bại" | Xong (vị trí theo mobile) | F13, F4 · `components/Feedback.tsx` · `F13/f13--b-09-luu-that-bai.light.png`, `F13/f13--b-10-xoa-that-bai.light.png`, `F04/f04--b-05-da-gui-loi-moi.light.png`. "Góc màn hình" trên desktop: mâu thuẫn D2. |
| M6.4 | Lỗi form validation | Xong | F5, F1, F3 · `lib/validation.ts` · `F05/f05--b-04-loi-truong.light.png`, `F01/f01--b-03-loi-form.light.png`, `F03/f03--b-07-doi-mk-loi.light.png` |
| M6.5 | Popup lỗi Media/Upload | Xong | F7 · `app/swings/new.tsx`, `lib/validation.ts` (`videoFileError`) · `F07/f07--b-05-qua-dung-luong.light.png`, `F07/f07--b-06-khong-phai-video.light.png` |
| M6.6 | Lỗi mã mời: sai, hết hạn, xung đột HLV active khác | Xong một phần | F4 · `app/connect/accept.tsx` · `F04/f04--b-16-ma-sai.light.png` … `F04/f04--b-20-da-ket-noi-ma.light.png`. Dạng popup: mâu thuẫn plan Task 10 (lỗi inline). Xung đột HLV khác: mâu thuẫn D5 (nhiều HLV + 1 HLV chính). |
| M6.7 | Trang lỗi 404, 403 | Xong | F13, F9, F4 · `app/+not-found.tsx`, `components/NoAccess.tsx` · `F13/f13--b-01-404.light.png`, `F13/f13--b-13-403.light.png`, `F09/f09--b-10-403-nguoi-theo-doi.light.png` |

**Tổng:**
- 31 mục **Xong**;
- 5 mục **Xong** với một phần không làm có lý do (M3.1, M3.9, M5.1, M5.2, M6.3);
- 2 mục **Xong một phần** (M2.5, M6.6);
- 1 mục **Không làm** (M1.2).
```
Kiểm đếm trước khi commit: 38 dòng bảng (`grep -c "^| M" docs/product/mvp-checklist.md` → `38`). Mọi đường dẫn ảnh có thật:
```bash
grep -oE "F[0-9]{2}/f[0-9]{2}--b-[a-z0-9-]+\.light\.png" docs/product/mvp-checklist.md | sort -u | while read p; do
  test -f "docs/flows/$p" && test -f "docs/flows/${p%.light.png}.dark.png" || echo "THIẾU $p"; done
```
Expected: không in dòng `THIẾU`.

- [ ] **Step 5: `README.md`, `CLAUDE.md`**

`README.md` (gốc, Task 14 tạo): thêm mục ngắn
```markdown
## Kiểm tra theo luồng
13 luồng chức năng (F1–F13), mỗi luồng có storyboard ảnh, story trong Storybook app và kịch bản chạy tự động: [docs/flows/README.md](docs/flows/README.md).
- Storybook màn app (màn thật theo luồng, cả trạng thái lỗi / rỗng / đang tải): `pnpm storybook:app --no-open` → http://localhost:6007
  (`storybook-app/`; Storybook design system vẫn là `pnpm -F @gr/ds storybook`, cổng 6006).
- Đối chiếu MVP issue #1: [docs/product/mvp-checklist.md](docs/product/mvp-checklist.md).
```
`CLAUDE.md`, mục GramGolf do Task 14 thêm: dòng 24 nói tác vụ giả lập "tải lần đầu … luôn có đang tải + lỗi + thử lại" — khung xương tải lần đầu
không có nhánh lỗi (review Task 14 #1, phân loại Task 15 #23). Thay đầu dòng đó:
```markdown
- Tác vụ giả lập: tải lần đầu → khung xương (`useFirstLoad` + `ListSkeleton`, `components/ListSkeleton.tsx`); tải lên, phân tích, OCR, QR, CSV, lưu / xoá → đang tải + lỗi + thử lại (lưu / xoá: `useSimulatedWrite`, bật lỗi ở Cài đặt › Dev); mẫu gây lỗi ở `lib/simulate.ts`.
```
(phần sau của dòng — `resetTo()`, `KeyboardAvoid` — giữ nguyên, tách thành dòng riêng). Rồi thêm 2 dòng:
```markdown
- Storybook màn app: `storybook-app/` (`pnpm storybook:app --no-open`, cổng 6007; tắt `lsof -ti tcp:6007 | xargs kill`, không `pkill -f storybook`). Story `flows/Fxx-*.stories.tsx` = bước của `docs/flows/Fxx/steps.json` (export `B<nn><Slug>` → id `fxx--b-<nn>-<slug>`), dựng bằng `appStory({ as, params, setup, tabs, hold })`; gõ chữ trong `play` bằng `typeIn`. Sửa màn → sửa story + chụp lại storyboard: `SB_URL=http://localhost:6007 CHROME=… node scripts/shot-storybook.mjs docs/flows/Fxx '^fxx--' 390 844`.
- Đi luồng: `scripts/flow-web.mjs docs/flows/<Fxx>/steps.json` (Metro web + Storybook app đang chạy) — chứng minh bàn giao giữa màn / vai trò, kiểm mỗi bước có story + ảnh; sửa UI xong chạy lại luồng liên quan. Dev › "Kiểm tra theo luồng" cho Expo Go.
```

- [ ] **Step 6: Gates + commit**

Run: `pnpm typecheck && pnpm test && pnpm check:literals` → xanh. `pkill -f "expo start"; lsof -ti tcp:6007 | xargs kill`.
```bash
git add apps/golf/app/settings/dev.tsx docs/flows docs/product/mvp-checklist.md README.md CLAUDE.md
git add storybook-app/flows/F12-ho-so-cai-dat.stories.tsx storybook-app/README.md
git commit -m "$(cat <<'EOF'
docs(mvp): Kiểm tra theo luồng ở Dev, chỉ mục docs/flows, checklist MVP issue #1; chạy lại cả 13 luồng

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

## Self-review (đã chạy)

- **Làm mới 08/10 (HEAD ebb90f4, Task 1–14 đã commit):**
  - mọi bước trước đây viết bằng lời (Task 24 Step 4, Task 25 Step 5, Task 28 Step 3, Task 29 Step 7.3/7.4, "chỗ điền khi chạy" ở Task 15 Step 5,
    Task 19 Step 1, Task 21 Step 5, Task 29 Step 8–9, Task 16 Step 15.3, Task 17 Step 9) đã thành khối code theo file thật;
  - neo (`file:dòng`, tên hàm, import, chữ trên màn, chữ trong `steps.json`) soát với code thật; giây hiển thị `1,3 s` (Task 14) thay mọi `1,3s`;
    `BIO_MAX = 300` của Task 13 dùng lại (bỏ `BIO_MAX = 500` trùng tên); `passwordError` của Task 13 dùng lại cho `validateNewPassword`;
    `SAMPLE_VIDEOS` giữ `pw_may_chu_ban.mp4` + `analysisFailAt` của Task 14;
  - bỏ việc Phase 1 đã làm: chuẩn tên `Feedback.tsx` (Task 13), export `isBlocked` (Task 12), vùng chạm avatar header (Task 14), cùng luật mật khẩu ở
    đổi mật khẩu (Task 13), viết lại cấu hình / stub Storybook app (đã có);
  - Task 15 khớp `storybook-app/` thật (225 story, README có Phủ route 45/45); tsconfig thử bằng bản tạm ngoài repo: 0 lỗi / 17 file; gộp bản cứng
    hoá `tools/shot.mjs` vào `scripts/shot-storybook.mjs`;
  - phân loại (Task 15 Step 12): 27 mục lỗi / minor → bước code ở Task 15 (DS), 17, 20, 21, 22, 24, 25, 26, 27, 28, 30; 16 mục "không làm" có lý do.
- **Phủ MVP (R0, R2):**
  - 38/38 mục có dòng trong bảng phủ; trạng thái theo HEAD ebb90f4.
  - mỗi hạng mục **bổ sung** có đúng 1 task luồng sở hữu: reset-password → 25; bio HLV → 24; lưới/lọc/sắp xếp swing, ngày quay, popup file,
    thông số gậy → 19; Active/Archived + khôi phục + xoá gậy → 21; lời mời 2 chiều + HLV huỷ kết nối → 17; Đã/Chưa review + chèn mốc +
    sửa/xoá ghi chú + thông báo swing mới → 18; sửa phiên (swing + thể lực) → 20; 404 + skeleton + spinner + toast lỗi → 29; đổi ảnh → 28.
    Mục hai phần ghi rõ phần nào → task nào (M4.6 bio → 24, ảnh → 28; M5.5 gậy → 21, Note → 18).
  - mục **mâu thuẫn** (a)–(f), (h), (i) không có task nào, đều nằm trong bảng "Không làm"; (h), (i) là ruling chủ dự án 08/10; (g) bỏ khỏi bảng
    (M3.9 coi là xong bằng RadioRow).
  - Direction có dòng riêng "không gọn".
- **Storybook app (R9):**
  - Task 15 đứng trước task lib; giữ file đã có, chỉ thêm `hold` / `typeIn`, `DELAYS`, `tsconfig.json`, script `storybook:app`, khung chụp cố định;
    README ("Chưa có (Phase 2)" theo task), phân loại `issues/*.md`; bỏ exclude, chụp toàn bộ + đọc ảnh, gate, commit.
  - Gate: `typecheck` = `pnpm -r typecheck && tsc -p storybook-app --noEmit`; `check:literals` thêm 4 thư mục con của `storybook-app` (tránh cache
    Vite). Task 16 không cần sửa story (soát: không story nào dùng `uploadUpdate` / `SAMPLE_VIDEOS` / `SAMPLE_AVATARS`).
  - Hạ tầng: cổng `Seed` (StoreProvider không nhận state); stub phủ mọi API expo-router app dùng (Step 4 in danh sách); `DELAYS` + `hold`;
    `shot-storybook` tham số `H` (390×844, modal nằm trong khung) + chờ phase `completed` (đã đối chiếu tên phase trong storybook 10.6) + timeout /
    khởi động lại Chrome; meta `id: 'fxx'` → id ASCII; mọi lệnh chụp đặt `CHROME`; tắt 6007 bằng `lsof`, không `pkill -f storybook`.
  - Mỗi task luồng 17–29 có bước Story (bảng bước → story, biến thể, README, id Phủ route), storyboard sinh bằng
    `shot-storybook.mjs docs/flows/Fxx '^fxx--' 390 844`; `flow-web.mjs` chỉ còn điểm kiểm + kiểm story/ảnh. Task 29 sửa `GROUPS` mục lục F13,
    Task 30 kiểm mọi id ở README / mục lục còn trong `index.json`.
- **Luồng (R8):**
  - 13 luồng ↔ Task 17–29 theo đúng thứ tự F4, F8, F7, F5, F6, F9, F1, F2, F3, F10, F11, F12, F13 (ruling chủ dự án: giữ F9 trước F3; Task 17 và
    Task 29 không tách — implementer commit theo 2 nhóm, reviewer nhận cả dải);
  - mỗi task có `steps.json` + `F<nn>.md` (tài khoản, bảng bước tự ghi, "Đã biết / chưa làm", mở trong Storybook app);
  - bước chéo vai trò dùng `switch` (Dev) trong cùng phiên.
  - Dev › "Kiểm tra theo luồng": `start` / `account` khớp `start` / `?as=` của từng `steps.json` (lệnh đối chiếu ở Task 30 Step 1); 404 ép `as Href`.
  - Task 30 sinh lại 13 storyboard từ story + chạy lại 13 lượt đi, kiểm không còn "Đang dựng" và "Chưa có (Phase 2)".
- **Placeholder:** không còn `TBD` / "chỗ điền" / `<tên … Task 14>`; mọi `steps.json` parse được, bước chụp đánh số liền 01…nn.
- **Nhất quán tên:** dùng đúng tên Task 15/16/21 ở các task sau:
  - action: `requestConnection` / `respondConnection` / `editNote` / `deleteNote` / `updateSession` / `unarchiveClub` / `deleteClub` / `setSimulateFailure`;
  - selector: `connectionRequests` / `openConnection` / `findPlayers` / `swingsByReview` / `filterSwings` / `archivedClubsOf` / `clubLinkCount`;
  - format, validation: `insertMark` / `noteMarks` / `formatSize` / `swingRaw` / `fitnessRaw` / `validateNewPassword` / `validateBio` / `videoFileError`;
  - simulate: `resetTokenStatus` / `RESET_TOKENS` / `nextSampleAvatar` / `DELAYS` (`firstLoad`, `toast`, `ocr` — Task 15; `save`, `toastError` — Task 29);
  - component / hook: `useOnLeave` (21), `PostsSection` (26), `useFirstLoad` / `ListSkeleton` / `useSimulatedWrite` / `SavingRow` (29), DS `nameInitials` (15);
  - story: `appStory` / `typeIn` / `hold`; nhãn a11y Task 17/18 dùng lại đúng chữ trong `steps.json`.
- **Số bước / bước chụp** (đếm tự động từ các khối JSON): F04 132/31, F08 78/17, F07 80/17, F05 108/20, F06 76/14, F09 48/13, F01 53/10,
  F02 38/7, F03 59/12, F10 53/10, F11 48/12, F12 72/14, F13 67/14 — tổng 191 bước chụp.
- **Số test:** golf 100 (HEAD ebb90f4) → 134 (Task 16) → 135 (Task 27); ds 115.
- **Review Focus:** 5 mục + 1 mục hạ tầng story, mỗi mục chỉ ra test / bước kiểm cụ thể.
- **Ràng buộc (R3, R7):**
  - Không màn/breakpoint web; mọi ảnh 390×844.
  - Mọi khối code dùng token (`t.space`, `t.layout`, `t.size`, `t.color`, `t.radius`), không số spacing/màu literal (cả story / stub).
  - Nút icon có `accessibilityLabel`; control trạng thái qua component DS.
  - Không dependency mới (script CDP dùng Node 24 có sẵn WebSocket/fetch; Storybook đã cài ở `packages/ds`); `storybook-app` không thành package
    workspace, không đổi lockfile.
  - Commit tiếng Việt có `Co-Authored-By`, không push.
