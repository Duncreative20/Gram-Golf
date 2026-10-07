# Biên bản cổng UI — gallery `@gr/ds` (2026-09-24)

Lượt 1–5: chưa có Storybook, gallery `apps/golf/app/(dev)/ds/*` (28 trang) + `scripts/shot-web.mjs` thay thế. Từ lượt 6 (2026-09-24, theo yêu cầu
"Mở storybook để check"): Storybook 10.6 tại `packages/ds` (`pnpm -F @gr/ds storybook` → http://localhost:6006) — story theo variant có Controls/a11y
+ nhóm `Gallery/*` nhúng nguyên 28 trang; chụp bằng `scripts/shot-storybook.mjs`.
Ba trục theo `tu-kiem-truoc-khi-giao.md` §A: **Mắt** (ảnh 28 trang × sáng/tối, 390×2400), **Số** (`getComputedStyle` qua CDP,
script `scripts/measure-web.mjs`), **Component/hardcode** (quét `packages/ds/src/ui`, `apps/golf/app`, parity token).

## Kết quả tự động (trục Số + Component)

| Phép đo | Kết quả |
| --- | --- |
| `pnpm check:literals` (hex / fontSize / padding / margin / gap số) | OK, 0 vi phạm |
| Quét thêm `packages/ds/src/ui`: width/height/radius/lineHeight/… số lẻ ≠ 0/1, hex, rgba, fontWeight/fontFamily literal | 0 |
| `t.primitive()` (chỉ khi Figma bind thẳng primitive) | 18 chỗ, 10 key (`gr-dm-2…128`), đều có chú thích |
| Parity token Figma ↔ code (`figmaParity.test.ts`) | 76/76 set OK |
| Đo web 20 điểm (MessageInput, DateField, NumberField, FieldGroup, Day, Week-Labels, Month-header, Wheel) | 20/20 khớp token (52/16/8/1000, 48/12/16/8, 40, 20/26 Heading/4, 48px padding Wheel…) |
| Màn app dùng control RN thô thay DS | 1: `(create-post)/editor.tsx` caption `TextInput` (token đủ, DS chưa có ô caption không viền); `playground.tsx` Pressable = link dev |

## Trục Mắt — finding

| # | Trang | Finding | Loại | Xử lý (2026-09-24) |
| --- | --- | --- | --- | --- |
| 1 | tab (sáng + tối) | Tab-Item **Icon=Top có badge**: Badge là con thứ 3 trong cột → rơi xuống dưới nhãn, ra ngoài ô, đè lên heading kế tiếp | **Lỗi DS** | ĐÃ SỬA: `tabItemStyles.badgeTop` (absolute, offset Gap/XSmall · Gap/Small) + TabBar bọc icon; parity ignore có chú thích |
| 2 | popover, listitem, social (cả 2 theme) | Toast web "`<button>` cannot contain a nested `<button>`": hàng Pressable (Popover Follow-User, List-Item Inline có nút "Theo dõi"/Toggle, Collection-List-Item) bọc nút con | **A11y** (web HTML sai; iOS: hàng `accessible` nuốt nút con) | ĐÃ SỬA: luật *hàng có control con → không role, `accessible={false}`* — ListItem prop `trailingInteractive`, PopoverItem (followText), Collection-List-Item Default, Collection-Card (onMore), Media-Item; editor.tsx dùng `trailingInteractive` |
| 3 | button, topnav, input2, pageindicator (sáng); input2/button/topnav (tối) | Hộp demo "trên nền tối" dùng `Color/Background/Neutral/Solid/Default` → ĐẢO theo theme: sáng thì mất Overlay, tối thì hộp trắng; Page-Indicator Overlay không có hộp | Gallery | ĐÃ SỬA: helper `apps/golf/lib/demo.ts` `darkDemo(t)` dùng ở button/topnav/pageindicator/input2/input3 |
| 4 | textfield, input3 | Nhãn `Label/Small/DemiBold` = **9 px** (token Figma) | Open decision (Figma) | CÒN MỞ: nhỏ hơn mức a11y thường dùng (≥ 11); chờ Dũng quyết token |
| 5 | button (sáng) | Icon-Flat level Overlay, Icon-Main-Overlay Tertiary trên nền sáng gần như vô hình | Cố ý (token overlay) | Không sửa (hiện đúng trong hộp tối sau #3) |

Không thấy lệch màu/khoảng cách ở 23 trang còn lại (badge, avatar, checkbox, segmented, chip, tag, toggle, radio, feedback, progress,
bottomnav, bottomsheet, misc, post, story, comment, datepicker, input3, icon, divider…).

## Lượt 2 — mở bằng click + state pressed (`scripts/interact-web.mjs`, ảnh `scratchpad/review/open/*`)

- Mở và chụp sáng + tối: Dialog, Action-Sheet, Bottom-Sheet Modal (Button), Comments-Sheet, Likes-Sheet, Share-Sheet, Collection-Picker → 14 ảnh, không finding.
- Pressed (giữ chuột): Button Primary → Hover token, Day cell → Unselected/Hover, Chip (dark) → Hover, List-Item không onPress → không đổi (đúng). Focus/typing: chỉ qua styles fn + parity.

## Chưa nhìn tới

- Chỉ web 390 (app mobile, 900/1440 không áp); chưa iPhone thật (cần Dũng quét QR tunnel).
- Wheel cuộn/snap, gesture story: chỉ kiểm tĩnh.

## Sau sửa (ảnh `scratchpad/review/after/*`)

- tab: badge Icon=Top nằm góc trên-phải icon, không tràn ô. listitem/popover/social: hết toast "button lồng button".
- button/topnav/pageindicator/input2/input3: hộp overlay tối ở cả 2 theme.
- Gate: typecheck ✓, check:literals ✓, vitest 109/109, parity 76/76.

## Lượt 3 — dark/light & bind biến (2026-09-24, theo yêu cầu review lại)

| Phép đo | Kết quả |
| --- | --- |
| Collection semantic light ↔ dark (398 key) | dark đủ 398; light == dark ngoài nhóm cố định: 10 (8 `*/Flat/Default` trong suốt, `Border/Active/Accent/Subtle` alpha, `On-Accent/Default` trắng = F3 đã `DARK_FIXUP`) → **không có key quên đảo** |
| Hướng đảo (Neutral/Strongest, Canvas, Surface, Placeholder, Disabled, Inverse/*, Neutral/Solid) | đúng chiều cả 30 key kiểm |
| Collection component (151 key) | dark đủ; light == dark 9 (đều trong suốt/Table); 54 key "đảo neutral" (Primary nền sáng chữ tối ở dark) = chủ ý; lệch thật chỉ `Input/Background/Default` dark #fafafa (F2) + `Button-Accent/Content` (F3) — đã `DARK_FIXUP` |
| Token ĐẢO dùng trong `ui/` (Inverse/*, White-Solid, Active/Neutral/Solid, Neutral/Solid) | 31 chỗ, tất cả đi cặp nền-đảo + chữ-đảo (Badge Inverse, Button Primary-Overlay, Bottom-Nav Solid, Pagination, Toast Neutral, Dock-Icon, Avatar, Day Dot Inverse) → đúng luật §7d |
| Audit tương phản (`contrast.test.ts`) | light 354 cặp: 42 dưới ngưỡng đều KNOWN_DESIGN (F19–F23), 36 miễn; dark tương tự; không cặp tàng hình |
| Ảnh dark 9 trang chưa xem lượt 1 (popover, radio, tag, progress, story, bottomsheet, icon, divider, datepicker) | không finding |

**Finding từ ảnh Dũng gửi (Story reply trên ảnh sáng):** nền thanh đáy là `Color/Background/Overlay` phẳng — token này ĐỔI theo scheme (light 25 %, dark 45 %) nên ở light chìm vào ảnh sáng. ĐÃ SỬA: `ui/Fade.tsx` (gradient svg dùng chung với Wheel), scrim Story header + đáy = `Black-Overlay/Hover` → `Black-Overlay/Default` → trong suốt (token cố định 2 theme). Ghi `figma-debt.md` §E: Figma cần token `Scrim/*`.

## Lượt 4 — rà toàn bộ lỗi cùng loại "token đổi theo scheme đặt trên ảnh" (2026-09-24)

Phương pháp: so collection light ↔ dark cho mọi key có tên Overlay/Glass/On-Dark (29 key ĐỔI theo scheme dù tên "overlay"), rồi quét mọi dòng
`ui/` + `apps/golf/app` ngữ cảnh ảnh/overlay dùng token đổi theo scheme (script tạm, kết quả 30 dòng, soi tay từng dòng).

| # | Chỗ | Lỗi | Xử lý |
| --- | --- | --- | --- |
| A | Button Main-Overlay Primary/Tertiary, Icon-Main-Overlay Primary, Liquid Glass (dark) | nền `*-Overlay/Background` cố định trắng 20 %, chữ Figma dark alias #1a1a1a (Main-Overlay Primary còn bind `Button-Primary/Content` đảo scheme) → chữ tối trên nền trắng mờ | ĐÃ SỬA: `DARK_FIXUP` 4 key → `On-Dark-Overlay/Strongest`; Main-Overlay Primary dùng `*-Overlay/Content`; test createTheme; **F49** |
| B | Comment-Media +N, Video-Control-Overlay | scrim `Background/Overlay` đổi scheme (25 %/45 %) — cùng lỗi Story | ĐÃ SỬA: `Black-Overlay/Default` cố định; **F50** |
| C | Media-Item viền `Border/Active/Overlay/Solid` | light #ffffff05 tàng hình, dark #cecece xám đặc | ĐÃ SỬA: `Border/Overlay/Subtle/Default`; **F51** (kèm nhóm `*Overlay*/Border` alpha 50→1a khi dark) |
| D | Post header pill `Surface/Overlay` (trắng mờ ↔ đen mờ), Bottom-Nav `Surface/Glass` | đổi theo scheme nhưng là "glass theo theme", chữ trên pill = F13 đã ghi | Giữ, open decision |
| E | BottomSheet/Dialog scrim `Background/Overlay` trên canvas | đúng chỗ (scrim modal theo theme) | Không đổi |

Ảnh sau sửa: `after/button-dark3.png` (Main-Overlay chữ trắng), `after/comment-light3.png`, `after/post-light3.png`.
Gate: typecheck ✓ · literals ✓ · vitest 110/110 · parity 76/76.

## Lượt 5 — màn app (ngoài gallery), sáng + tối 390 (`scratchpad/review/app/*`)

Route: `/` (→ intro), `/playground`, `/moment`, `/moment?reply=1`, `(create-post)/picker`, `(create-post)/editor` (+ sheet Tag bạn bè qua click), `(onboarding)/intro`.

| # | Màn | Lỗi | Xử lý |
| --- | --- | --- | --- |
| 1 | Onboarding intro (dark) | ảnh minh hoạ là JPEG nền trắng → ô trắng vuông trên canvas tối | ĐÃ SỬA: bọc thẻ `White-Solid` bo góc Large (light trùng nền Canvas/Alt #fff, dark = thẻ sáng có chủ ý); **F52** cần asset PNG trong suốt |
| 2 | Picker (chưa chọn) | Segmented "Gần đây" bị cắt "Gần …" — item `flex: 1` trong container hug | ĐÃ SỬA DS: item `flexGrow 1 / flexBasis auto` (gallery Segmented không đổi) |
| 3 | Editor | icon "Golf-Relax" 16 px trong List-Item nhìn như đốm đen | Minor, để designer quyết icon riêng |
| – | Moment (+reply), Playground, Editor, Tag sheet | không finding; Moment bọc `ThemeProvider dark` đúng luật §7d | – |

Story trên ảnh trời xanh (ảnh Dũng gửi lần 2): scrim gradient đã có, chữ/ô nhập đọc được.
Script `shot-web/interact-web/measure-web` nhận `METRO_URL` (chạy Metro riêng cổng 8082 khi 8081 là của phiên khác).
Gate: typecheck ✓ · literals ✓ · vitest 110/110 · parity 76/76.

## Lượt 6 — Storybook `@gr/ds` (2026-09-24, ảnh `scratchpad/review/sb/*`, sau sửa `sb2/*`)

Cài: `storybook@10.6` + `@storybook/react-native-web-vite` + addon docs/a11y; theme light/dark = toolbar global → `ThemeProvider`
(`.storybook/preview.tsx`), font MiSans tự host (`.storybook/fonts.css`), `expo-router` stub cho trang gallery. 75 story
(47 story variant × Controls ở nhóm Controls/Input/Navigation/Feedback/Data + 28 `Gallery/*`) × sáng/tối = 150 ảnh, khổ 390.

| Story | Mắt | Kết luận |
| --- | --- | --- |
| Controls/Button (7) · Checkbox, Radio, Toggle (4) · Data/Badge (5) · List-Item, Avatar (3) · Feedback (6) · Segmented, Tab-Bar (3) | sáng + tối OK, font MiSans render, hover/pressed/disabled đúng token | ✅ |
| Input/Text-Field (10) · Number-Field (4) · Date-Picker (4) | OK, trừ 2 dòng dưới | ✅ |
| Input/Number-Field › OTP · Gallery › input-2 | **6 ô XLarge tràn phải** (6×64 + 5×8 = 424 > 358) — cả gallery lẫn Storybook | 🔧 ô `flexShrink` + `aspectRatio 1` (F53) → vừa khung (`sb2/`) |
| Input/Date-Picker › Wheel (khung 358) | **"Tháng 10" xuống 2 dòng** vì 3 cột chia đều | 🔧 `WheelColumn.weight`, cột tháng 1.5 → 1 dòng (`sb2/`) |
| Gallery › bottom-nav (5 mục nhãn tiếng Việt) | **nhãn mép trái/phải bị cắt** (hàng hug tràn 2 mép) | 🔧 mục `flexShrink` + nhãn ellipsis → không tràn, nhưng nhãn `Tra…` — **open**: 5 mục + padding Nav-Item Figma (12) không vừa 390; cần Figma chốt nhãn ngắn hơn / padding nhỏ hơn |
| Navigation › Tab-Bar (khung 358, 4 tab có icon) | tab thứ 4 tràn phải; ở gallery 390 vừa | ⚠ open nhỏ: Tab-Bar không cuộn ngang khi hug > khung — chờ quyết (ScrollView ngang hay co) |
| Gallery còn lại (icon, divider, popover, top-nav, bottom-sheet, list-item, feedback, progress, input-3, misc, post, story, comment, social, chip, tag, avatar, badge, button, text-field, segmented) | sáng + tối OK, khớp lượt 3–5 | ✅ |

Số: `tsc` DS (kèm stories) 0 lỗi (sửa `topnav.tsx` gallery 2 lỗi `noUncheckedIndexedAccess` lộ ra khi biên dịch dưới tsconfig DS);
`check:literals` OK; vitest 110/110 (cập nhật test OTP theo F53). Chưa: addon a11y chỉ chạy trong panel khi mở tay (chưa có
`@storybook/addon-vitest` để chạy hàng loạt) — mục "Accessibility" trong Storybook Dũng bấm từng story sẽ thấy.

## Lượt 7 — state focus THẬT + Tab-Bar (2026-09-26, Dũng phát hiện trong Storybook)

| Finding | Nguyên nhân | Sửa | Bằng chứng |
| --- | --- | --- | --- |
| Focus TextField: viền đen vuông bên trong khung | `<input>` của react-native-web giữ outline `:focus-visible` mặc định Chrome; DS vẽ focus bằng viền khung | `ui/inputReset.ts` `INPUT_RESET` (web: `outlineStyle: none`, native `{}`) spread vào mọi style input (TextField/Search/Area/Message, Field-Group, Comment composer, Story reply, Stepper/Number) | `scripts/focus-storybook.mjs` click thật → `outline: none`, viền khung Focused; ảnh `review/focus-{light,dark,msg,num}.png` |
| Tab-Bar: "Bài viết" icon solid dù tab chọn là "Đã thích" → nhìn như 2 tab được chọn | demo dùng `home-03-solid` cố định, các tab khác line | `TabItem.iconSelected` (như Bottom-Nav) — line mặc định, solid khi Selected; gallery + story dùng cặp line/solid | ảnh `review/sb4/*` |

Bài học ghi vào luật A4: state phải tạo bằng tương tác thật (click/tab), không chỉ render qua prop — lượt 1–6 chỉ xem
state `focused`/`error` qua props nên không lộ outline trình duyệt. Từ lượt này review chỉ qua Storybook (Dũng chốt).

## Lượt 8 — TỰ KIỂM FULL qua Storybook (2026-09-26, theo yêu cầu "Tự kiểm full")

**Cách đo (`scripts/audit-storybook.mjs`, mỗi story × sáng/tối × 390/430 = 300 lượt):**
(1) **Mắt** — ảnh cao theo nội dung (đo `#sb-content` + ScrollView `flex:1` nới viewport, sửa I1/I2 của reviewer: lượt 6 ảnh cắt ở 3000 px, trang Icon 1230 icon giờ 20000 px) + **state thật**: click vào ô nhập (focus), rê chuột (hover) và giữ chuột (pressed) lên control đầu tiên → 3 ảnh thêm ở 390.
(2) **Số** — `getComputedStyle` MỌI phần tử: màu chữ/nền/viền phải thuộc bộ token của scheme (theme + component + primitive, so rgba), font phải MiSans, phần tử đang focus không được có outline trần.
(3) **a11y** — axe-core 4 chạy trên từng story (tắt 3 rule trang: region/heading/main).
(4) **Reviewer độc lập** (opus) soi diff 3fe1533..HEAD: 4 Important + 13 Minor — đã kiểm chứng và xử lý (bảng dưới).

**Kết quả trước → sau (cùng 300 lượt):**

| Trục | Trước (lượt 6 code) | Sau sửa | Còn mở |
| --- | --- | --- | --- |
| Lỗi render | 0 | 0 | — |
| Màu ngoài token / font ≠ MiSans | 0 / 0 (chỉ input ẩn OTP) | 0 / 0 | — |
| Outline trần khi focus | OTP (input ẩn) | Field-Group, Comment composer, Story reply (cố ý) | Figma chưa có state Focused → giữ outline trình duyệt (figma-debt §E) |
| axe `aria-required-attr` (checkbox/radio/switch/combobox thiếu aria-checked/expanded) | 28 + 6 | **0** | — |
| axe `label` (ô số/ô nhập không tên) | 16 + 4 | **0** | — |
| axe `role-img-alt` (Avatar, Comment media) | 22 + 2 | **0** | — |
| axe `aria-progressbar-name` (Page-Indicator, Progress-Bar, Stepper, spinner) | 14 + 8 | **0** | — |
| axe `button-name` (nút trailing TextField) | 4 | **0** | — |
| axe `nested-interactive` / `aria-toggle-field-name` / `aria-hidden-focus` / `aria-allowed-attr` (Radio-Card, Popover) | 2 + 2 + 2 + 2 | **0** | — |
| axe `color-contrast` | 56 | 58 (đo cả state) | **F54** — toàn bộ là token Figma (Placeholder 2.58, Disabled 2.54, Neutral/Light 2.56, Positive 2.93, Badge Orange/Pink…, dark Negative 3.27) — trùng KNOWN_DESIGN của `contrast.test.ts` |
| axe `scrollable-region-focusable` | 4 | 4 | ScrollView của react-native-web không nhận focus bàn phím — mở, chỉ web |

**Nguyên nhân gốc lớn nhất:** react-native-web 0.21 **bỏ** `accessibilityState`/`accessibilityValue` (chỉ nhận `aria-*`) → trên web mọi checkbox/radio/switch/tab/progressbar mất trạng thái dù native đúng. Sửa một chỗ: `ui/a11y.ts` (`a11yState`, `a11yValue`) phát cả hai dạng, `aria-selected` chỉ cho tab/option/row…, button dùng `aria-pressed`; áp cho 19 file component. Luật ghi vào CLAUDE.md.

**Reviewer độc lập — xử lý:** I1/I2 ảnh cắt → sửa cách đo (ở trên); I3 comment a11y `test: 'error'` sai → sửa comment, gate thật = script này; I4 tắt outline làm mất dấu focus ở ô chưa có state → rút `INPUT_RESET` khỏi Field-Group/Comment/Story reply + figma-debt §E. M1 viewport initialGlobals; M3 guard chrome mồ côi; M4 keycode Tab + đo viền `closest`; M5 `check:literals` quét stories/.storybook; M6 bỏ primitive + `value` không cho Controls sửa; M7 wheel label 1 dòng; M8 test bottom-nav co + INPUT_RESET native; M9 ghi chú Flat level; M10 ảnh local; M13 nút Trước/Sau = Button. Không làm: M2 (tách `.web.ts` — `typeof document` đủ, vitest đã có test native `{}`), M11 (DarkBox trùng `darkDemo` — dev-only), M12 (ghi CLAUDE.md), M9 độ phủ story (Tooltip/Dialog/Toast Info… có qua Gallery).

**Lượt chạy chốt (sau mọi sửa, `docs/ds/audit-2026-09-26-storybook-report.md`, ảnh `scratchpad/audit-final/*`):** 300/300 render, 0 màu ngoài token, 0 font lạ, axe chỉ còn `color-contrast` 58 (F54) + `scrollable-region-focusable` 4 (rn-web); outline trần 6 lượt = 3 ô cố ý giữ (§E). **296/300 sạch** ngoài hai mục mở đó.

**Chưa nhìn tới:** render native thật (Expo Go) của các sửa a11y/OTP/Bottom-Nav; bàn phím Tab xuyên story (mới chỉ click); viewport 768; Docs (autodocs) của Storybook.
