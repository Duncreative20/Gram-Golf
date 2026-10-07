# Golf app — nền móng: monorepo, @gr/ds, tracer Onboarding Intro

Ngày: 2026-09-16 · Trạng thái: đã duyệt qua brainstorming + grilling · Sub-project 1/N

## 1. Mục tiêu

Dựng nền để mọi màn sau chỉ còn "lắp token + component": (1) package design system `@gr/ds` sinh từ Figma, dùng lại được cho app khác; (2) app Expo iOS-first; (3) một màn tracer chạy trên iPhone chứng minh pipeline Figma → token → component → screen.

Ngoài scope: navigation thật, backend/auth, Android, EAS/dev build, Code Connect, i18n, các màn khác.

## 2. Quyết định đã chốt

| # | Quyết định | Lý do |
|---|---|---|
| D1 | Expo SDK 57 + Expo Router, TS strict, chạy **Expo Go** (chưa Apple Developer). Dev build khi có native module đầu tiên. | Expo Go App Store = SDK 57; máy Windows không Xcode |
| D2 | Monorepo pnpm workspaces, **1 package DS** `@gr/ds` + `apps/golf`. Không turbo. | Grow app #2 chỉ thêm `apps/x`; tách tokens/ui khi có app thứ hai thật |
| D3 | Token nguồn = **DTCG JSON dump từ Figma qua `use_figma`** (Plugin API, có collection/mode/alias), commit vào git. Không plugin, không REST (Enterprise). | Plan Pro; MCP đọc đủ 11 collection, 2 264 var |
| D4 | **Style Dictionary v5** sinh TS từ DTCG. 1 platform. | Chuẩn ngành; thêm CSS/Swift sau không đụng nguồn |
| D5 | Lớp tiêu thụ RN = theme object + `useTheme()` + StyleSheet. Không NativeWind/Unistyles. | 0 dep; giữ nguyên tên semantic; agent ít sai |
| D6 | **Key token = đúng tên Figma** (`'Color/Content/Neutral/Strongest'`), string literal union. Không camelCase. Text style cũng theo tên Figma (`variant="Body/Base/DemiBold"`). | Tra ngược Figma 1:1 |
| D7 | Primitive (Global Colors, Global Dimensions) sinh vào `primitives.ts` riêng, **không** export qua `theme`. | Ngăn dùng `GR-Light/Red/5` thay semantic |
| D8 | Dark mode bật ngay, `scheme="auto"` (357/397 semantic var khác Light/Dark — đo 2026-09-16). | |
| D9 | Emphasis mặc định `neutral`; Typography mode `Base 14`; Breakpoint mode `Mobile`. | Khớp Homepage hiện tại |
| D10 | Font MiSans Latin static `.ttf` (Regular/Medium/Demibold…), `fontFamily` theo file, không dùng VF. | RN không set weight số 330/380/450 lên VF |
| D11 | Ảnh Intro export từ Figma qua `download_assets`; text tiếng Việt hardcode. | |
| D12 | Git remote GitHub private `golf-relax-app`. iPhone cùng Wi-Fi, Metro LAN; fallback `--tunnel`. | |

## 3. Cấu trúc repo

```
Mobile App - Test/                 git root
  package.json                     pnpm workspaces: packages/*, apps/*
  pnpm-workspace.yaml
  tsconfig.base.json
  CLAUDE.md                        luật: dùng @gr/ds, 0 literal màu/spacing/font trong app
  packages/ds/                     @gr/ds
    package.json                   "build:tokens", "test", "typecheck"
    tokens/
      figma/*.dtcg.json            dump: 1 file / (collection, mode) + styles.dtcg.json
      build.mjs                    Style Dictionary → src/generated/
    src/
      generated/                   theme.light.ts, theme.dark.ts, component.{neutral,brand}.{light,dark}.ts (4 file: component alias sang semantic nên phụ thuộc scheme),
                                   typography.base14.ts, spacing.ts, radius.ts, size.ts, weight.ts,
                                   textStyles.ts, effects.ts, primitives.ts, keys.ts (union types)
      theme/                       ThemeProvider.tsx, useTheme.ts, types.ts, fonts.ts
      ui/                          Text.tsx, Button.tsx, Screen.tsx
      index.ts
    assets/fonts/                  MiSansLatin-*.ttf
  apps/golf/
    app.json, package.json, metro.config.js (monorepo), tsconfig.json
    app/_layout.tsx                ThemeProvider + useFonts + SplashScreen
    app/index.tsx                  redirect → /intro
    app/(onboarding)/intro.tsx     tracer
    assets/images/                 ảnh export từ Figma
  docs/ds/research/, docs/ds/superpowers/specs/, docs/ds/superpowers/plans/
```

## 4. Pipeline token

### 4.1 Dump (Figma → DTCG JSON)

- Script `use_figma` (Plugin API, read-only) chạy theo collection, mỗi call ≤ 2 collection để không quá size:
  - `getLocalVariableCollectionsAsync()` + `getLocalVariablesAsync()`.
  - Với mỗi (collection, mode): 1 file `tokens/figma/<collection-slug>.<mode-slug>.dtcg.json`.
  - Giá trị: COLOR → `{ "$type": "color", "$value": "#rrggbb" | "#rrggbbaa" }`; FLOAT → `dimension`/`number`; STRING → `fontFamily`/`string`.
  - Alias → `"$value": "{<collection-slug>.<Figma/Path>}"` (DTCG reference; slash trong tên giữ nguyên, group lồng theo `/`).
  - `$extensions.figma`: `{ id, collection, mode, scopes }`.
- Text styles (42): `getLocalTextStylesAsync()` → `styles.dtcg.json` nhóm `typography`, mỗi style `$type: "typography"`, `$value` gồm `fontFamily, fontWeight, fontSize, lineHeight, letterSpacing` — giá trị đã **resolve** ở mode Base 14 (bound variable → đọc `boundVariables` và resolve), giữ thêm `$extensions.figma.boundVariables` để tra.
- Effect styles (16): `effects.dtcg.json`, `$type: "shadow"` (mảng), blur → `$extensions.figma.blur`.
- Paint styles (22): bỏ qua (đã có variable tương ứng; ghi vào README của package).
- Kết quả gộp bởi `tokens/build.mjs`, không cần bước gộp thủ công.
- Tài liệu chạy lại: `packages/ds/tokens/README.md` chứa nguyên văn script `use_figma` để phiên sau paste.

### 4.2 Build (DTCG → TS)

- Style Dictionary v5, `build.mjs` đăng ký:
  - Source theo bộ: `{semantic light}`, `{semantic dark}`, `{component neutral}`, `{component brand}`, mỗi bộ kèm primitives + spacing/radius/size/typography config để resolve alias; output từng file trong `src/generated/`.
  - Format tùy biến: object phẳng `{ '<Figma/Path>': value } as const` + export type union key (`keys.ts`).
  - Alias resolve hết (không còn `{ref}`), giữ hex 8 ký tự khi có alpha.
- `primitives.ts` tách riêng, không re-export từ `src/index.ts`.
- Lệnh: `pnpm -F @gr/ds build:tokens`. Output commit vào git (diff nhìn được, app không cần chạy build).

### 4.3 Grow app #2

Thêm mode brand mới ở collection "Base Colors" trong Figma → dump ra `base-colors.<brand>.dtcg.json` → build thêm bộ theme cho brand → app #2 bọc `<ThemeProvider brand="x">`. Không sửa `src/theme`, `src/ui`.

## 5. Theme + UI (`packages/ds/src`)

```ts
type Scheme = 'light' | 'dark'; type Emphasis = 'neutral' | 'brand'; type Brand = 'gr';
<ThemeProvider scheme="auto" | Scheme, emphasis = 'neutral', brand = 'gr'>
const t = useTheme();
t.scheme                                   // resolved 'light' | 'dark'
t.color('Color/Content/Neutral/Strongest') // semantic theo scheme
t.component('Button-Primary/Background/Default') // theo emphasis
t.space('Spacing/Gap/Medium'); t.radius('Corner-Radius/Base'); t.size('Button/Size/Large')
t.text('Body/Base/DemiBold')               // { fontFamily, fontSize, lineHeight, letterSpacing }
t.shadow('Shadow/Bottom/Level-1')          // RN shadow props (iOS) + elevation
```
- `scheme="auto"` = `useColorScheme()`; mỗi getter là lookup object, sai key = lỗi compile.
- `fonts.ts`: map weight Figma → file (`Regular→MiSansLatin-Regular`, `Medium→-Medium`, `Demibold→-Demibold`, …); `export const fontAssets` cho `useFonts`.
- UI:
  - `Text` props: `variant` (tên text style), `color` (key semantic, mặc định `Color/Content/Neutral/Strongest`), còn lại = `TextProps` RN.
  - `Button` props: `variant: 'primary'|'accent'|'tertiary'`, `size: 'xs'|'s'|'m'|'l'`, `label`, `onPress`, `disabled`. Map: nền/chữ/viền từ `Button-<Variant>/…` (pressed → `…/Pressed`), cao từ `Button/Size/*`, padding/gap từ `Button/Spacing/<Size>/*`, radius `Corner-Radius/Action/*`, label style `Button-Label/*`.
  - `Screen` props: `background` (key, mặc định `Color/Background/Canvas/Alt`), `edges` SafeArea; bọc `SafeAreaView` + `StatusBar` theo scheme.
- Không làm thêm component nào ngoài 3 cái này.

## 6. App + tracer

- `create-expo-app` template `blank-typescript` → thêm `expo-router`, `expo-font`, `expo-splash-screen`, `react-native-safe-area-context`. `metro.config.js` theo Expo monorepo docs (`watchFolders` root, `nodeModulesPaths`).
- `_layout.tsx`: `useFonts(fontAssets)` → giữ splash tới khi xong → `<ThemeProvider scheme="auto">` → `<Stack screenOptions={{ headerShown:false }} />`.
- `intro.tsx` = Figma `App / Onboarding / 02-Intro · Booking` (`40013027:105509`): đọc `get_design_context` + `get_screenshot`, dựng bằng `Screen`/`Text`/`Button`/`Image`. Mọi giá trị style qua `useTheme()`.
- Chạy: `pnpm -F golf start` → Expo Go quét QR (cùng Wi-Fi; nếu không thấy → `--tunnel`).
- Cài plugin `expo` cho Claude Code (marketplace official) để phiên sau có MCP screenshot/log.

## 7. Kiểm chứng (definition of done)

1. `pnpm -F @gr/ds build:tokens` idempotent (chạy 2 lần, git diff rỗng); `pnpm -r typecheck` xanh.
2. vitest trong `@gr/ds`:
   - resolve alias: `Color/Content/Neutral/Strongest` light = `#1a1a1a` (giá trị Figma đã đọc 2026-09-16); dark ≠ light.
   - `t.text('Body/Base/DemiBold')` = size 14, lineHeight 18, letterSpacing −0.32, family Demibold.
   - Button primary size l: height 56, nền = `Button-Primary/Background/Default` (neutral).
   - Mọi `$value` trong generated không còn chuỗi `{…}` (alias chưa resolve).
3. `grep -rE '#[0-9a-fA-F]{6}|fontSize:\s*\d|padding\w*:\s*\d' apps/golf/app` = 0 dòng.
4. Expo Go trên iPhone hiển thị Intro; đổi Dark Mode máy → màu đổi; Dũng so với Figma và duyệt.

## 8. Rủi ro đã biết

| Rủi ro | Xử lý |
|---|---|
| `use_figma` output quá lớn (960 var Global Colors) | dump theo collection, ≤ 2 collection/call; nếu vẫn lớn → chia theo prefix nhóm |
| Text style bind variable đa mode → resolve sai mode | resolve rõ ở `Base 14`, test #2 bắt |
| Metro monorepo không resolve `@gr/ds` | theo docs Expo monorepo; test bằng `expo export --platform ios` trước khi lên máy |
| Expo Go không cùng mạng | `--tunnel` |
| Font PostScript name khác tên file trên iOS | `useFonts` đặt key = tên file, dùng key làm `fontFamily` |

## 9. Kết quả (2026-09-16)

- Hoàn thành Task 1–7 trên nhánh `feat/foundation`. `pnpm -r typecheck` xanh, 11 test vitest pass, `check:literals` OK, `build:tokens` idempotent, `expo export --platform ios` bundle được.
- **Sai lệch so với thiết kế:**
  - `use_figma` bị server MCP cắt output ở **20 KB/call** → dump theo tuple gọn `[tên, giá trị, type]` phân trang (`tokens/compact/*.json`, 16 file), converter `compact-to-dtcg.mjs` dựng DTCG. Không dump 1 file/(collection, mode) trực tiếp như §4.1.
  - Component colors sinh 4 file (`component.{neutral,brand}.{light,dark}.ts`) vì alias sang semantic phụ thuộc scheme.
  - `fontAssets` tách khỏi `fonts.ts` (require `.ttf` làm vitest gãy).
  - `t.text()`/`t.shadow()` trả interface riêng (`TextProps`, `ShadowStyle`) thay vì `TextStyle`/`ViewStyle` của RN — kiểu RN nội bộ `____ColorValue_Internal` không gán được qua ranh giới package.
  - Button: Figma không có `Button-Primary|Accent/*/Disabled` và `Button-Tertiary/Content/Pressed` → disabled = opacity 0.4, tertiary pressed dùng Content/Default (map tường minh trong `buttonStyles.ts`).
  - Text style `Body/Code/*` dùng IBM Plex Sans → `fontFamily` undefined (font hệ thống); không đóng gói IBM Plex.
- **Phát hiện Figma:** màn `App / Onboarding / 02-Intro · Booking` (và khả năng cả nhóm Onboarding) dùng **bộ style/variable khác** GR_DESIGN-SYSTEM (`Heading/Mobile/H2`, `Body/Mobile/B2`, `bg/brand/default #176b51`, `text/neutral-strong #3d3d3d`, `Elevation/2`). Đã map: H2 24/28 → `Heading/3` (24/30); B2 14/19 → `Body/Base/Regular` (14/18); brand default → `Color/Background/Accent/Solid/Default` (#1b795c); neutral-strong → `Color/Content/Neutral/Base`; neutral-moderate → `Color/Content/Neutral/Light`; padding-top 72 → `Spacing/Gap/Giant` (64). **Cần Dũng quyết:** đồng bộ các màn Onboarding sang variables DS trong Figma, hay chấp nhận map gần đúng.
- Ảnh Intro từ Figma là JPEG 896×1200 (`assets/images/intro-booking.jpg`).
- Còn chờ: xác nhận trực quan trên iPhone (DoD #4) và cài plugin `expo` cho Claude Code (`/plugin install expo@claude-plugins-official`).

## 10. UI 10 màn tag Mobile (2026-09-17, page Design, node 40013027:77446…77681)

Ba route trong `apps/golf/app`, vào từ `/playground`; mọi phần tử là component `@gr/ds` (đợt 1–3), màn tối bọc `ThemeProvider scheme="dark"` vì Figma bind token dark.

| Figma | Route | Ghi chú map |
|---|---|---|
| Mobile Screen Template 77446 / 77479 | `(create-post)/picker` | TabBar Indicator, lưới `MediaItem size=width/3 square`, Segmented Small nổi; đã chọn → dải `Media-Strip` + Badge Inverse + nút "Tiếp tục" (Button Accent Small đặt tuyệt đối vì TopNavigation chỉ nhận icon action) |
| Create-Post/Media-Editor 77521 / 77540 / 77558 | `(create-post)/editor` | ô media 210 (không bind) → `Image-Size/3XLarge + 2XLarge`; 1 media dọc → aspect 9:16; caption = TextInput Body/Base/Regular padding XLarge; hàng tuỳ chọn = `ListItem Grouped` (Figma Popover/Item-Select) + `Checkbox Rounded` / chevron |
| Media-Editor 77577 / 77614 | sheet "Tag bạn bè" trong editor | `BottomSheet` 2 bước: tìm (SearchField + nhóm "Thường được sử dụng"/"A", `ListItem` + `Checkbox Rounded`) → xác nhận (ảnh 1:1 `3XLarge+Small`, `Chip "Tag thêm"`, nút `primary` "Tiếp tục") |
| Mobile Screen Template 77643 / 77660 / 77681 | `/moment`, `/moment?reply=1` | TopNavigation Overlay + subtitle handle; ảnh 3:4 radius Large; Package-card (Figma `Scale/16`, `Scale/8` primitive → `Corner-Radius/Large`, `XSmall`; bg `Inverse/Subtle`); trả lời = `StoryBottomContent scrim={false}`; chia sẻ = `BottomSheet type="Action"` + `ShareActionLabel` ×3 (sheet Figma nền sáng, app render theo theme dark của màn — chờ Dũng duyệt) |

Chưa làm: Status Bar iPhone (hệ thống lo), quyền thư viện ảnh thật (`expo-media-library` cần dev build), "Chỉnh sửa"/"Đính kèm chuyến đi"/"Đang chia sẻ" chỉ là hàng bấm không có màn đích.
