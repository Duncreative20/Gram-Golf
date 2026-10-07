# @gr/ds — Component library từ Figma GR_DESIGN-SYSTEM (đợt 1)

Ngày: 2026-09-16 · Trạng thái: chốt · Nền: spec `2026-09-16-golf-app-foundation-design.md`

## 1. Mục tiêu

Chuyển component local trong file Figma `wES4PDFvfC7546zuPPVhiW` thành React Native component trong `packages/ds`, props khớp 1:1 tên Figma, style 100% qua token đã sinh. Đợt 1 = 18 set mà 10 màn tag "Mobile" đang dùng. UI màn hình build **sau** khi DS xong.

## 2. Phạm vi & luật (chốt với Dũng)

- **Chỉ component local trong file.** Instance trỏ thư viện khác (`mainComponent.remote === true`) không build; Dũng rebind Figma rồi build sau. Nhóm màn `App / …`, Bill-split, Golf-course-detail, Create-a-event, My Trip, Account-page hiện 100% thư viện cũ → ngoài phạm vi.
- Thứ tự: đợt 1 (spec này) → đợt 2 (component còn lại) → đợt 3 (composite Golf Insider) → UI 10 màn Mobile-tag.
- Không dùng package icon/component ngoài. Dep mới duy nhất: `react-native-svg`.

## 3. Quyết định

| # | Quyết định |
|---|---|
| D1 | **Props = tên Figma camelCase, giá trị Figma nguyên văn**: `<Button level="Primary" size="L">`, `<Chip select>`. `State` không là prop (Pressed/Disabled/Focus suy từ Pressable + `disabled`). `.Primitives/*` internal, không export. |
| D2 | **Icon**: export toàn bộ `icon-*-line` / `icon-*-solid` (≈920, 20/24 px) bằng `download_assets` → `packages/ds/assets/icons/*.svg` (commit) → `node icons/build.mjs` sinh `src/icons/generated.ts` (map `name → svg`, màu cứng → `currentColor`) + union `IconName`. `<Icon name size color />` render qua `SvgXml`. Tên = tên Figma bỏ tiền tố `icon-`. |
| D3 | **Button**: 6 set Figma → 2 component. `Button` (`type: "Main" \| "Flat"`, `overlay?: boolean`, `level`, `size`, `leadingIcon?`, `trailingIcon?`, `text`) và `IconButton` (cùng `type/overlay/level/size`, `icon`). `Button` cũ (`variant/size`) xoá; Intro sửa theo. |
| D4 | **Avatar/Single** đợt 1 chỉ `size / shape / status / theme`; Focus/Button/Selected/Background bỏ. |
| D5 | **Bottom-Sheet, Popover** đợt 1 chỉ layout/visual (render trong `Modal` RN, không gesture). |
| D6 | **Mobile/Content-Area, System/Bottom-Indicator** → props của `Screen` hiện có; **Aspect-Ratio** → `View style={{aspectRatio}}`; không component riêng. |
| D7 | Mọi `*Styles.ts` là pure fn `(theme, props) → styles`, nhận `Theme` nên dark mode tự đúng. Test vitest assert đúng **token key** theo variant. |
| D8 | **Gallery** `apps/golf/app/(dev)/ds/<name>.tsx` render đủ variant như page Figma; `(dev)/ds/index.tsx` liệt kê + toggle scheme. Đây là nghiệm thu hình ảnh (Dũng xem Expo Go). Từ 2026-09-24 thêm Storybook 10.6 ở `packages/ds` (`pnpm -F @gr/ds storybook`): `<Name>.stories.tsx` cạnh component (story theo variant, Controls, a11y, toolbar light/dark) + `src/stories/Gallery.stories.tsx` nhúng 28 trang gallery. |
| D9 | `check:literals` mở rộng sang `packages/ds/src/ui/**` và `src/icons/Icon.tsx` (generated.ts miễn). |
| D10 | Token Figma thiếu cho một state (như `Button-Tertiary/Content/Pressed`) → ghi §7 Open, dùng token gần nhất, **không bịa hex**. |
| D11 | Nhánh `feat/ds-batch-1`, 1 commit/component, merge `main` cuối đợt, push Duncreative20. |

## 4. Cấu trúc

```
packages/ds/
  assets/icons/*.svg                 export từ Figma
  icons/build.mjs                    svg → src/icons/generated.ts
  src/icons/{Icon.tsx, generated.ts}
  src/ui/<Name>/<Name>.tsx           RN component
  src/ui/<Name>/<name>Styles.ts      pure fn
  src/ui/<Name>/<name>Styles.test.ts
  src/index.ts                       export public
apps/golf/app/(dev)/ds/index.tsx + <name>.tsx
```

## 5. Đợt 1 — 18 set, thứ tự build

| # | Figma set | Component | Props (Figma) |
|---|---|---|---|
| 1 | Iconography | `Icon` | name, size(20/24), color |
| 2 | Divider | `Divider` | color, direction |
| 3 | Button/Main, Flat, Main-Overlay | `Button` | type, overlay, level, size, text, leadingIcon, trailingIcon, disabled |
| 3 | Button/Icon-Main, Icon-Flat, Icon-Main-Overlay | `IconButton` | type, overlay, level, size, icon, disabled |
| 4 | Badge | `Badge` | text, size, theme, background, leadingIcon, remove |
| 5 | Avatar/Single | `Avatar` | size, shape, status, theme, source |
| 6 | Checkbox/Mark | `Checkbox` | type, select, shape, disabled |
| 7 | Segmented (+Item) | `Segmented` | level, items[{label, icon, badge}], selectedIndex |
| 8 | Tab-Bar (+Tab-Item) | `TabBar` | style, items, selectedIndex, size |
| 9 | Input/Text-Field | `TextField` | label, helpText, size, state(Error), leading, trailing, clear, overlay |
| 10 | Search/Default | `SearchField` | type, size, leading, trailing, clear |
| 11 | Popover/Item-Select | `PopoverItem` | type, select, trailing, caption, icon |
| 12 | Top-Navigations | `TopNavigation` | type, surface, heading, subtitle, leadingAction, trailingActions, divider |
| 13 | Bottom-Navigation Floating (+Items) | `BottomNavigation` | type(Floating/Floating-Glass), items[{label, icon, noti}], selectedIndex, theme |
| 14 | Bottom-Sheet (+Header/Title-Block/Actions) | `BottomSheet` | type, heading, subtitle, actions, systemIndicator, children |
| 15 | Page-Indicator | `PageIndicator` | count(4–8), active, size |
| 16 | Mobile/Content-Area | `Screen` prop | contentArea |
| 17 | Aspect-Ratio | — | dùng `aspectRatio` |
| 18 | System/Bottom-Indicator | `Screen` prop | bottomIndicator |

Mỗi hàng: đọc `get_design_context` set + biến bound → `*Styles.ts` + test → component → gallery → Dũng xem → commit.

## 6. DoD

- Component: `pnpm typecheck`, `pnpm test`, `pnpm check:literals` xanh; gallery hiện đủ variant trên Expo Go.
- Đợt: 18 hàng xong, Intro + playground chạy với `Button` mới, merge `main`, push Duncreative20, memory sync.

## 7. Open (điền khi build) — cập nhật 2026-09-17, đợt 1 xong 18/18

**Icon (cập nhật 2026-09-24):** đã export ĐỦ 1230 icon 20×20 local của page Iconography qua `use_figma exportAsync` theo lô (≈14 icon/call, output MCP cắt ở ~20 KB nên mỗi call trả JSON rút gọn `[name, innerSvg]`, hex/black → `currentColor`, số 2 chữ số thập phân). 4 set màu (`media-file`, `payment`, `social`, `Flag`) cố ý bỏ (icon màu cố định, không đi qua `currentColor`). Không cần PAT/REST. Tên trùng hậu tố ` N` → giữ bản đầu theo thứ tự Figma.

**Đợt 5 (2026-09-24) — Input còn lại + Date-Picker, parity 76 set:** `MessageInput` (+`overlay`; set Figma thứ hai trùng tên `Input/Text-Field` 40012870:36201 thực chất là Message-Input-Overlay → nợ F42), `DateField` (Select-Field + `calendar-line`), `NumberField` Align Left|Center (nút ± trong ô, `numberFieldStyles` cạnh Split), `FieldGroup`, `DatePicker` (Paged|Scroll, single|range, Day/Week-Labels/Month-header/Month-Grid/Dot) + `WheelPicker`/`DateWheel`/`TimeWheel` (fade = svg gradient). Nợ F42–F48 (trục Size dump thêm `sizes2.json`/`datepicker2.json`: Number-Field mọi Size, Day/Month-header Small). **Cố ý không build:** `Keyboard/Default|Numpad` (mock iOS remote), `Cover` (bìa tài liệu), `Fade-overlay` riêng (nằm trong Wheel). Gallery: `(dev)/ds/input3`, `(dev)/ds/datepicker`.

**Token/behaviour đoán hoặc Figma thiếu (dùng token gần nhất, không bịa hex):**
- Shadow: Figma bind effect qua biến màu `Color/Shadow/Neutral/Light`, không lộ tên effect style → Button solid dùng `Shadow/Action/Basic`, Tertiary `Shadow/Action/Tertiary`, Segmented selected `Shadow/Action/Basic`, Search `Effect/Input`, BottomNav `Shadow/Bottom/Level-2|1`, BottomSheet `Shadow/Top/Level-3`.
- Button Icon-Flat: Figma bind icon `gr-dm-28` ở Large (khác Icon-Main = Base 20) → đợt 1 dùng bảng chung Icon-Main. `Liquid Glass` (Icon-Main-Overlay) vẽ như Primary-Overlay, chưa blur.
- Flat/Primary Disabled: Figma giữ nền `Neutral/Flat/Default` (không phải Flat-Disabled) → giữ nguyên.
- Badge `Inverse`, `On-Color`: Figma chỉ có Solid → Subtle dùng lại Solid. Badge Accent Subtle icon: Medium bind `Accent/Base`, XSmall/Small bind `Accent/Light` → lấy Medium.
- Avatar: chỉ đo text style/màu ở Circle; Square dùng chung. Status dot bind `Color/Border/Inverse` stroke 1.
- Segmented: chỉ có `*-Corner-Radius-Medium` → Small dùng chung; key Small `Text-Wrapper-Padding 2` (lỗi tên trong DS, giữ đúng key); icon Small đoán `Element-Size/Popular/Small`. Container Level=Secondary dùng token `Segmented-Item-Primary` (Figma ghép chéo) → giữ.
- Tab Subtle: Figma Select=Yes cao 40 (Button/Size/Small) vs No 48 → giữ 48 cả hai để layout không nhảy.
- TextField: chỉ đo State ở Medium; text style theo size lấy từ State=Default. Search shadow `Effect/Input`.
- BottomNavigation: `Surface/Glass` là màu bán trong suốt, Figma còn blur → chưa blur. Floating-Glass cũng nền `Surface/Glass` (slot Nav-Item 54 % + blur; đợt 1 ghi nhầm `Active/Neutral/Solid` = fill instance con, sửa ở §7d lượt 2). Notification số dùng Badge Red XSmall.
- BottomSheet: scrim Figma bind style cũ `BG/Overlay/dark-strong` → dùng `Color/Background/Overlay`; không gesture kéo (D5). Grabber 40×4 = `gr-dm-40 × gr-dm-4`.
- Screen bottomIndicator: 121×4 → `gr-dm-128 × gr-dm-4`. `Mobile/Content-Area` chỉ là slot Viewport-Width → không thêm prop.
- PageIndicator Small: chiều cao bind `gr-dm-6` → `t.primitive`.
- Hover/Focused: không có trên touch → pressed dùng token Hover/Pressed; Focus ring bỏ.

**Đã thêm ngoài spec:** `t.primitive()` (khi Figma bind thẳng primitive), `t.weight()` (`Emphasis/Border-Weight/Active` cho Tab indicator), `paint()` resolve key semantic + component, `check:literals` cho phép giá trị `0`.

### 7b. Đợt 2 (2026-09-17, 7 cụm A–G, 30 component) — token đoán / Figma thiếu

- **Radio-Mark**: Figma bind `Checkbox/*` (không dùng bộ `Radio-Button/*` dù có) → theo Figma. Disabled Select=Yes bind `Color/Background/Fill/Disabled/Neutral/Solid` không có trong dump → `Color/Background/Solid-Disabled`.
- **Toggle**: radius bind `Segmented/Container|Item-Corner-Radius-Small` không có → `Corner-Radius/Rounded`. Bề rộng bar = 2×dot + 2×padding (khớp 52/44/36). Dot shadow `Shadow/Action/Basic`.
- **ControlRow** dùng chung cho Radio-Button / Checkbox/Text / Toggle: gap Small / XSmall / Medium theo Figma; Toggle `Theme Text-First` = control bên phải.
- **Chip**: 3 set gộp thành prop `variant`. Primary Selected không stroke. Advanced/Number-Only unselected chữ `Chip-Secondary/Content/Default` kể cả Level Primary (Figma vậy). Shadow `Shadow/Action/Tertiary`.
- **Tag** Size Small: Figma chỉ vẽ Medium, token `Tag/Size/Small` có → label đoán `Body/XSmall/Medium`.
- **ListItem**: Contents là slot → title `Body/Base/DemiBold`, caption `Body/XSmall/Regular`. Bỏ chiều cao cứng 72.
- **Card** Spacing=Xsmall không dump được → `Card-padding-xsmall` + `Corner-Radius/Base`. Semi-Pale = Pale bg + Border. Shadow 3 lớp → `Shadow/Bottom/Level-2`.
- **Accordion** Medium không dump được → Padding/Small, `Heading/Subheading`, icon Small, radius Base. Mở/đóng đổi icon chevron-down/up (chưa animate).
- **Inline-Message** content không dump (slot) → `Color/Content/<Status>/Strongest` chữ, `/Light` icon. **Toast** shadow → `Effect/Popover`; title/caption `Body/Base/DemiBold` / `Body/XSmall/Regular`.
- **Tooltip** bỏ mũi tên; Small padding đoán 2XSmall/3XSmall, chữ `Caption/Medium`. **Dialog** Theme chỉ đổi icon đầu; shadow `Effect/Container`; scrim `Color/Background/Overlay`.
- **Progress-Bar** chiều cao thanh không bind → `Element-Size/Popular/4XSmall`. **Skeleton** size "Large - 48px" → `Image-Size/Medium` (tên Figma lệch một bậc); dòng text cao `Spacing/Gap/XSmall`; tĩnh, chưa shimmer.
- **Pagination** Theme=Manually bỏ. Container shadow `Shadow/Action/Tertiary`. **Breadcrumbs** dash = `chevron-right-line-medium` màu Neutral/Light. **Stepper** State=Focused không dump → `Active/Neutral/Solid` + chữ Inverse; line = `Emphasis/Border-Weight/Active`.
- **Text-Area** label `Body/XSmall/Regular` Strongest (khác Text-Field), XLarge không có. **Select-Field** = field chỉ đọc + chevron; picker do app. **OTP** hidden TextInput; shadow `Effect/Input`. **Stepper-Control** shadow bind `Stepper-Control/Shadow/Base` (màu) → `Effect/Input`; XLarge nút Small, Large/Medium XSmall, Small 2XSmall (đoán).
- **Search/Overlay** = prop `overlay` của `SearchField` (`Input-Overlay/*`, chữ On-Dark-Overlay, radius Large; Rounded giữ Input/Rounded).
- **Dock-Icon** Theme On-Color|Emoji|Golden bỏ; Inverse/Pale giữ. **Integration-Connector** badge Connected = check-circle-solid Accent/Base (màu không dump). **Color-Selector** nền = màu dữ liệu (không phải token). **Avatar/Group** overlap 8/4 = `Spacing/Gap/XSmall|2XSmall`, ring = `Surface/Default` weight Active. **Empty-State** illustration slot; mặc định Dock-Icon Pale XLarge.
- Icon thêm: alert-triangle-solid/-line, check-solid, info-octagon-solid, chevron-up-line (58/919).

### 7c. Đợt 3 (2026-09-17, page ❖ Golf Insider, 26 export) — token đoán / Figma thiếu

- Page Golf Insider **local 100%** trừ `Story-Viewer/Bottom-Content` (Keyboard/Key remote, 18 instance) → bỏ keyboard, chỉ build ô reply. Style cũ còn sót: `Label/Mobile/Label 3` → `Caption/Medium`; `Button-Label/XS` → Button size XSmall; `BG/Base` → Surface/Default; `Border-divider/Inverse` → `Color/Border/Inverse`; `Black` (primitive) → `Color/Background/Inverse/Solid/Default`; `Scale/9999` → Rounded.
- **Post-action / Comment-Action** gộp `SocialAction` (size Medium/Small, prop `overlay` cho Story header); More-item khung Medium nhưng icon Base (đúng Figma).
- **Identity** (Avatar + tên + verified + dot + time/location) dùng chung Post header, Story header, Comment header, Likes row. Follow = `Button level="Secondary"` (Accent Subtle + Accent/Base, khớp Figma).
- **Post-Media**: Type Single/Multi gộp theo số ảnh; carousel = ScrollView paging; vị trí pill/dots Figma không đo (absolute) → dots giữa dưới, counter góc trên phải, muted góc dưới phải, domain góc dưới trái. Media-Frame ratio Portrait = 4:5 (390×488), Landscape 16:9. Video-Control-Overlay Loading dùng ActivityIndicator; gradient scrim → phẳng `Color/Background/Overlay`.
- **Post-Caption**: style text không dump (chỉ textRangeFills) → `Body/Small/Regular` Neutral/Base, `@mention`/`#tag` Accent/Base; collapsed = 2 dòng + "xem thêm".
- **Story-Viewer**: Ratio 1.1 hiểu là 1:1; scrim đáy phẳng; prev/next = chạm nửa trái/phải; `topInset/bottomInset` do app truyền (safe-area). Progress-Bar Theme=Overlay lấy token từ Story header (track `White-Overlay/Default`, fill `Active/Overlay/Solid`) — sửa lại đợt 2.
- **Comment-Thread**: Preview = 2 reply + "Xem thêm N trả lời" (Flat XSmall giữa 2 Divider); reply thụt = Image-Size/XSmall + Gap/XSmall (Figma không bind). Divider dùng `Default` (không có `Pale` trong DividerColor).
- **Comment-Composer**: 3 lớp shadow → `Effect/Input`; Rounded khi Default, XLarge khi có chữ/reply/attachment; reply-context = khung Badge Small (bg Neutral/Subtle đoán).
- **Sheets** dùng lại `BottomSheet` (Header/Title-Block/indicator đã có); Share-Sheet gộp Story-Share + Post-Share-Sheet (State Friend-Selected/Typing-Message = có `selectedIds`); Action-Label chữ → `Caption/Medium`. Comments-Sheet scroll + composer đặt trong body, chưa keyboard-avoiding.
- **Collection-List-Item**: cover 56 = `Image-Size/Large`; Default trailing = Checkbox Rounded (Figma vẽ ô tròn `Checkbox/Size/Medium`). **Collection-Card** bìa ghép flex 2:1 (kích thước thật 175×116 → aspectRatio). **Media-Item** 80 → `Image-Size/2XLarge` (88, gần nhất).
- Icon thêm 14 (72/919): circle-small-solid, message-text-circle-solid, paper-plane-solid, bookmark-solid, marker-pin-01-solid, image-list-line, volume-x-line, volume-max-line, refresh-ccw-01-line, play-solid, play-circle-solid, reply-solid, image-solid, marker-pin-02-line. Figma đặt tên có hậu tố " 1"/" 2" → bỏ hậu tố.

### 7d. Audit tương phản light/dark (2026-09-17) — `packages/ds/src/audit/contrast.test.ts`

Chạy `pnpm -F @gr/ds exec vitest run src/audit`: 259 cặp chữ/icon × 2 scheme, hợp alpha lên canvas hoặc ảnh xám trung tính, tính WCAG. Test FAIL khi có cặp mới dưới ngưỡng không nằm trong danh sách "thiết kế đã biết" hoặc cặp < 1.5:1.

**A. Lỗi code (đã sửa):**
- Chữ/icon trên ảnh/scrim (Post header overlay, Media-Info-Pill, Video-Control-Overlay, Story caption/reply/close, Comment-Media +N/duration, Media-Item duration, Top-Navigation Overlay, Page-Indicator Overlay) dùng `Color/Content/Inverse/*` theo Figma → **đảo màu khi dark** (chữ tối trên ảnh). Đổi sang `Color/Content/On-Dark-Overlay/*`, dot off `White-Disabled` (không đổi theo scheme). Story nền `Inverse/Solid` (trắng ở light) → `Black-Solid/Default`.
- ListItem Radio-Card nền `White-Solid` (trắng cả dark, chữ Strongest 1.04:1) → `Surface/Default`.
- Màn app tối (`picker`, `moment`) bọc `ThemeProvider dark` nhưng dùng token đảo (`Active/Neutral/Solid`, `Inverse/*`) → đảo hai lần. Sửa: trong provider dark dùng `Canvas/Alt` + `Neutral/*`; chữ trên ảnh `On-Dark-Overlay/*`; Package-card nền `Black-Overlay/Default`.
- DockIcon Yellow Solid icon On-Colors (1.7:1) → On-Brights; DockIcon Accent Solid → On-Accent/Default. Inline-Message icon `<Status>/Light` (Warning 1.8:1) → `/Base`. Search overlay icon On-Dark-Overlay/Light (1.5:1) → /Base.

**B. Alias DARK trong Figma sai → override tạm trong `createTheme.ts` (`DARK_FIXUP`, Dũng sửa Figma + dump lại thì xoá):**

| Token | Light | Dark (Figma) | Hệ quả | Override dark |
|---|---|---|---|---|
| `Input/Background/Default` | #ffffff | **#fafafa** (Focused = #191919) | chữ input Strongest #f5f5f5 trên #fafafa = 1.04:1 (TextField, OTP, Composer, StepperControl) | `Color/Background/Surface/Default` |
| `Color/Content/On-Accent/Default` | #ffffff | #ffffff, nhưng `Accent/Solid` dark = **#73e3be** | 1.56:1 (Badge/Avatar/DockIcon/AvatarGroup Accent Solid, Tooltip Accent) | `Color/Content/On-Brights` |
| `Button-Accent/Content/Default\|Pressed` | #ffffff | #ffffff trên bg #73e3be | 1.56:1 | `On-Brights` |
| `Button-Accent-Overlay/Content/*` | #135541 | **#ddf8ef** trên bg #fafafa | 1.07:1 | `On-Brights` |

**C. Quyết định thiết kế, không sửa code (báo designer):**
- Status solid + chữ trắng: Positive #3fab53 → 2.9:1; Info #0a85ff → 3.6:1; Support Blue 3.6, Orange 2.7, Green 2.9; Negative dark #ff3f4a → 3.5:1 (Button Positive/Danger, Badge, Alert-Banner, Toast). Đạt 3:1 "chữ lớn" nhưng không đạt 4.5 cho chữ 12–14px.
- Trên ảnh không scrim (header Story/Moment, pill, reply): trắng trên ảnh xám 2.7–4.0:1 — Figma cũng vậy; app nên thêm gradient scrim nếu ảnh sáng.
- Viền Checkbox/Radio chưa chọn `Checkbox/Border/Default` 5 % (1.1:1), Toggle off `Neutral/Subtle` (1.2:1), Page-Indicator dot off (1.1–1.3:1), Tag nút × `Placeholder` (2.6:1), DockIcon Yellow Subtle icon (1.8:1): nhận diện nhờ bóng/shape; WCAG 1.4.11 muốn 3:1.
- Disabled/Placeholder ≈ 2.5:1: WCAG miễn.

**Lượt 2 (2026-09-17, cùng ngày) — mở rộng 259 → 354 cặp:** thêm pressed (Button các level, Chip, ListItem), viền (TextField/Tertiary/Connector/Search overlay), Bottom-Navigation 7 theme × Floating/Floating-Glass × on/off, Bottom-Sheet.
- **Lỗi code (đã sửa):** `BottomNavigation` Floating-Glass nền `Active/Neutral/Solid` (đợt 1 đọc nhầm fill instance con) trong khi item bind Neutral → 1.0–1.9:1 tàng hình cả 7 theme. Figma 9017:42257: slot Nav-Item fill `Surface/Glass` 54 % + BACKGROUND_BLUR, screenshot là thanh sáng chữ tối → cả 2 type dùng `Surface/Glass` (blur vẫn chưa làm).
**Lượt 2b — review code RN (agent đọc 40 file `ui/**/*.tsx` + 5 màn), đã sửa:**
- BottomSheet: container/body thiếu `flexShrink`/`minHeight:0` → ScrollView bên trong không cuộn, sheet cao đẩy tràn; scrim + container là Pressable accessible → iOS VoiceOver gộp cả sheet thành nút "Đóng"; `secondary` chỉ render khi có `primary`, layout Icon thiếu icon nuốt im lặng; thêm `KeyboardAvoidingView` (iOS) cho TextInput trong sheet. Dialog box Pressable cùng lỗi gộp.
- Comment-Composer `multiline={expanded}` đổi động → iOS remount TextInput, mất focus sau chữ đầu → luôn multiline.
- Story-Viewer: header/bottom absolute nằm trong wrapper cao 0 → Android không nhận touch (Đóng/Theo dõi/Gửi chết), scrim wrapper chỉ tô vùng inset → bỏ absolute trong `storyStyles`, StoryViewer tự bọc lớp absolute + View inset; `moment.tsx` nhờ đó thành footer thật (hết che caption cuối). Prev/Next thêm role button.
- Pressable lồng control (iOS nuốt con): Tag có Remove, Card có subAction, ListItem không onPress (trailing Toggle/Checkbox), LikesSheet row → `accessible={false}` lớp ngoài. Tag không onPress bỏ role button.
- StepperControl: TextInput controlled clamp ngay khi gõ (xoá trắng kẹt, min=10 gõ "25" thành "105") → draft string, clamp khi blur. PostCaption "xem thêm" luôn hiện → đo bằng Text ẩn `onTextLayout` > 2 dòng. PostMedia `page` kẹp theo `sources.length`.
- A11y lẻ: Radio/ColorSelector role radio dùng `checked` (không phải `selected`); Skeleton thêm `importantForAccessibility` cho TalkBack; Avatar Photo thiếu source → theme Neutral, `accessible` chỉ khi có label.
- Bỏ qua có chủ đích: CollectionListItem/MediaItem (row = 1 control, con trang trí); keyboard-avoiding cho ô reply `moment.tsx`; gesture/blur vẫn nợ.

- **Thiết kế đã biết (KNOWN_DESIGN, không sửa):** viền Connector Connected/Error `Border/Active/*/Subtle` 1.7:1; Button Main/Secondary pressed 4.26:1 (Neutral/Base trên Neutral/Subtle/Pressed, thiếu 0.24); Bottom-Nav Neutral-Solid label off bind `Placeholder` 2.6:1; Search overlay border focused `Focus/Overlay/Subtle` 1.3:1.

### 7e. Parity token Figma ↔ code (2026-09-17, lượt 3) — `packages/ds/src/audit/figmaParity.test.ts`

**Cách đo:** dump `boundVariables` từng variant của component set (script `use_figma` trong plan batch-1 §parity, factored common/variants, ≤19 KB/call) → `src/audit/figma/*.json`; code gọi styles fn qua theme proxy ghi lại mọi key getter + key trong giá trị trả về; so sánh TÊN token hai chiều (thiếu/thừa). Ignore theo set có chú thích trong `CONFIG` (slot con là component khác, quyết định §7/§7d). Gate: `bad === 0`, chạy trong `pnpm test`.

**Đợt 1 (22 set) — lỗi code đã sửa:**
- Avatar initials Subtle: nền bind `Accent|Neutral|Support/<n>/Subtle` (code đang Surface/Default) + `Effect/Overlay`.
- Badge: màu nút × (`removeColor`): Subtle = Neutral/Light, Accent Subtle = Accent/Light, On-Color = Neutral/Strongest, Solid = màu chữ.
- Checkbox box có `Shadow/Action/Basic`. Toggle dot giữ shadow cả Disabled.
- Chip: pressed khi đã chọn → `Selected/Hover`; pressed chưa chọn chữ `Chip-Secondary/Content/Default`.
- List-Item: title `Body/Base/Medium` (không DemiBold), Selected → chữ Accent/Strongest, minHeight `gr-dm-56`.
- Card: Shadow = `Shadow/Bottom/Level-1` (không Level-2); Pale/Semi-Pale có `Effect/Overlay`.
- Button (Main/Flat/…): shadow chỉ ở State=Default (Pressed không).
- Text-Area (multiline): chữ `Body/Base/Medium` (Small: XSmall), focus viền `Border/Active/Neutral/Solid`, lỗi giữ nền Default, Disabled không viền, có `Effect/Input`.
- Tab Small: padding 3XSmall, icon Popular/Small, Subtle Small cao `Tab-Item/Size/Small/Height` + padding ngang XSmall.
- Segmented: container `Effect/Overlay`; Level = tên token item (Primary = Surface/Default + Item-Primary) — set Figma đặt tên ngược → NỢ FIGMA F1 (`docs/ds/figma-debt.md`), không ghép chéo trong code nữa.
- Top-Navigation: thanh KHÔNG có fill (trong suốt trên canvas); subtitle Medium `Body/XSmall/Regular`.

**Ghi nhận → chuyển thành NỢ FIGMA (`docs/ds/figma-debt.md`, Dũng chốt 2026-09-17: code là chuẩn tạm, Figma sửa sau):** token `Segmented/*-Corner-Radius-Small` + `Toggle` bind Segmented Small không có trong dump token (Medium = 1000 = Rounded, cùng giá trị); Focus 2 viền (Border/Default + ring) → 1 viền; Hover không có trên touch; Tab Subtle Select=Yes 40 vs 48 (§7); Card Semi-Pale gradient; Top-Nav Package-Select chưa build; Text-Area bộ đếm ký tự chưa làm.

**Đợt 2 (+22 set: Button Main-Overlay/Icon×3, OTP, Stepper-Control, Radio, Accordion, Feedback×5, Progress/Skeleton, Pagination/Breadcrumbs/Stepper, Dock-Icon/Connector/Color-Selector/Avatar-Group/Empty-State) — đã sửa:**
- Button: Icon-Main/Icon-Main-Overlay và Main-Overlay Primary giữ shadow khi Pressed (`shadowPressed`); Overlay/Icon-Tertiary Disabled không viền; Icon-Main Tertiary shadow Basic (không Tertiary).
- Radio mark `Shadow/Action/Basic`; Accordion Medium padding Medium + radius Large + icon Base; Tooltip `Effect/Popover` + Medium cũng `Caption/Medium`; Dialog title `Heading/3`, icon 2XLarge; Avatar-Group bubble +N viền Active/Accent/Subtle + Effect/Overlay; Stepper Focused nền `Neutral/Solid/Default`; Dock-Icon Pale = Neutral/Subtle + icon Light; Stepper-Control Disabled giữ nền/viền Default (chỉ chữ Disabled).

**Đợt 3 (+19 set composite: Post-action, Media-Info-Pill, Video-Control-Overlay, Header/Post, Post-Caption, Media-Frame, Story Header/Bottom, Comment-Item/Media/Composer, Share Action-Label, Collection List-Item/Card, Create-Post Media-Item, Search/Overlay, Bottom-Sheet, Radio row) — đã sửa:**
- Identity: thời gian `Caption/Regular` (handle `Body/XSmall/Regular`), verified Accent/Light + dot Neutral/Light đưa vào styles. Share Action-Label chữ `Body/XSmall/Medium`. Collection-List-Item Disabled chỉ đổi icon (chữ giữ Neutral/Base). Story reply field nền/viền `Input-Overlay/*`. Comment-Composer radius `Input/Medium` (Typing XLarge), `Shadow/Bottom/Level-3`, chữ `Body/Base/Medium`. Bottom-Sheet `Effect/Container`.

**Harness v2:** chỉ tính token có GIÁ TRỊ xuất hiện trong object trả về (bảng eager không còn gây nhiễu); `extraOk` cho fn trả hàm theo state (Pagination, Stepper, Connector, composite); `map` trả null để bỏ variant không có trên touch (Hover/Focus) hoặc Figma tự mâu thuẫn (Icon-Main Disabled shadow). Tổng 63 set / ~330 variant, gate xanh.

**Đợt 4 (trục Size, `src/audit/figma/sizes.json`, loader gộp nhiều file dump / set — `common` được mở vào từng variant rồi merge):** Button Main/Flat/Icon-Main mọi Size, Text-Field/Search/Text-Area Small→XLarge, OTP XLarge, Stepper-Control 4 size, Avatar 7 size × Circle/Square, Badge Small/XSmall, Chip Normal XSmall + Advanced + Number-Only, Tab-Item Icon=None/Top, Dock-Icon/Connector 5 size, Accordion XLarge/Large, Tooltip Small, Page-Indicator Small, Pagination XSmall, Card Small/Xsmall. Lệch thật đã sửa: Tab Icon=Top vẫn cao `Tab-Item/Size/<S>/Height` (Icon-Top-Height Figma không dùng), Icon=None không icon; Accordion header gap theo size (XLarge Medium / Large Small / Medium XSmall); Tooltip Small padding ngang XSmall + radius Rounded; Connector radius XLarge→2XLarge, Large→XLarge; Card Xsmall radius Large; Page-Indicator Small dot width `Popular/3XSmall` × height `gr-dm-6`. Đã khớp sẵn: Button label/spacing/radius theo size, Text-Field chữ Small/Medium XSmall-Medium & Large/XLarge Base-Medium, Avatar chữ + radius Square theo size, Dock-Icon bảng size, Chip Advanced/Number-Only. Ignore mới có lý do: icon button padding/gap = box − icon; Card `Gutter`/`Card-padding-small` = wrapper con; Accordion XLarge wrapper icon pad 2XSmall. Nợ Figma mới F38–F41 (`docs/ds/figma-debt.md`).

**Chưa dump (không thay đổi kết luận):** Skeleton các size, Video Media-Item, Bottom-Sheet Stack=On, Comments-Sheet/Likes-Sheet/Share-Sheet (chỉ ghép primitive đã kiểm).
