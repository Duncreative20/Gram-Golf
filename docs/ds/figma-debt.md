# Nợ Figma — chỗ code cố ý KHÁC Figma, chờ sửa trong Figma

Chốt 2026-09-17 (Dũng): khi Figma tự mâu thuẫn hoặc bind sai, **code lấy phiên bản nhất quán làm chuẩn tạm**, ghi ở đây. Sửa Figma xong → dump lại set (`packages/ds/src/audit/figma/*.json`, script ở plan batch-1 §parity) hoặc token (`packages/ds/tokens/README.md`), bỏ `ignore`/`map`/`DARK_FIXUP` tương ứng, xoá dòng. File `wES4PDFvfC7546zuPPVhiW`.

Nguồn: audit tương phản (spec §7d) + parity token (spec §7e). Mã F* dùng để tham chiếu trong code (`// NỢ FIGMA F1`).

## A. Token / biến (sửa trong collection Variables)

| # | Chỗ | Figma hiện tại | Code đang làm | Việc trong Figma |
|---|---|---|---|---|
| F1 | `Segmented` (1238:892) Level | Level=Secondary dùng `Segmented-Item-Primary/*` + nền Surface/Default; Level=Primary dùng `Segmented-Item-Secondary/*` + Surface/Alt | Level = tên token item: Primary = Surface/Default + Item-Primary | Đổi tên 2 variant Level cho khớp token item (hoặc rebind item) |
| F2 | Dark mode: `Input/Background/Default` | dark = #fafafa (Focused = #191919) | `DARK_FIXUP` → `Color/Background/Surface/Default` | Alias dark → Surface/Default |
| F3 | Dark: `Color/Content/On-Accent/Default`, `Button-Accent/Content/*` | #ffffff trên `Accent/Solid` dark #73e3be (1.56:1) | On-Accent: lớp brand `tokens/brand/` đặt `On-Brand-*` = navy #0b2230 → đã bỏ `DARK_FIXUP` (2026-10-07); `Button-Accent/Content/*`: `DARK_FIXUP` → `On-Brights` | Alias dark → On-Brights (hoặc nhận brand GramGolf, xem mục F) |
| F4 | Dark: `Button-Accent-Overlay/Content/*` | #ddf8ef trên nền #fafafa (1.07:1) | `DARK_FIXUP` → `On-Brights` | Alias dark → On-Brights |
| F5 | `Segmented/Container-Corner-Radius-Small`, `Item-Corner-Radius-Small` | bind trong set Segmented Small + Toggle, nhưng không có trong collection dump (chỉ có `-Medium` = 1000) | dùng `-Medium` / `Corner-Radius/Rounded` | Đưa 2 biến vào collection publish (hoặc rebind Small → Medium) |
| F6 | `Segmented/Spacing/Small/Text-Wrapper-Padding 2` | tên có hậu tố " 2" | giữ đúng key | Đổi tên bỏ " 2" (rồi dump lại token + sửa key trong `segmentedStyles.ts`) |
| F7 | Alert-Banner, Toast nút hành động | `Button-old/Size/Small` | `Button/Size/Small` | Rebind sang `Button/Size/Small`, xoá collection cũ |
| F8 | Stepper item Default | nền `Date-Picker-Item/Background/Unselected/Hover` | giữ (cùng giá trị) | Rebind sang `Color/Background/Neutral/Subtle/Default` |
| F9 | Radio Disabled Select=Yes | `Color/Background/Fill/Disabled/Neutral/Solid` (không có trong dump) | `Color/Background/Solid-Disabled` | Rebind Solid-Disabled hoặc publish biến |
| F10 | Media-Info-Pill, Video overlay chữ | style cũ `Label/Mobile/Label 3` | `Caption/Medium` | Đổi sang text style DS |
| F11 | Chip Level=Primary Hover chữ | `Chip-Secondary/Content/Default` (không có `Chip-Primary/Content/Default`) | dùng Chip-Secondary/Content/Default | Thêm `Chip-Primary/Content/Default` hoặc chấp nhận dùng chung |
| F12 | Comment-Item avatar ring | `Border-divider/Inverse`, radius `Scale/9999` (style cũ) | `Color/Border/Inverse`, `Corner-Radius/Rounded` | Rebind |

## B. Màu trên ảnh / scrim (Figma bind token ĐẢO theo dark mode)

| # | Chỗ | Figma | Code | Việc trong Figma |
|---|---|---|---|---|
| F13 | Chữ/icon trên ảnh: Post header overlay, Media-Info-Pill, Video-Control-Overlay, Story header/caption/reply/close, Comment-Media +N/duration, Media-Item duration, Top-Nav Overlay, Search/Overlay, Progress Overlay label | `Color/Content/Inverse/*` (đảo khi dark → chữ tối trên ảnh) | `Color/Content/On-Dark-Overlay/*` | Rebind toàn bộ sang On-Dark-Overlay/* |
| F14 | Page-Indicator Overlay dot | `Inverse/Strongest` + `Inverse-Disabled` | `On-Dark-Overlay/Strongest` + `White-Disabled` | Rebind |
| F15 | Story-Viewer nền | `Inverse/Solid` (trắng ở light) | `Black-Solid/Default` | Rebind |
| F16 | List-Item Radio-Card nền | `White-Solid/Default` (trắng cả dark) | `Surface/Default` | Rebind |
| F17 | Tooltip White Overlay chữ | `Neutral/Strongest` (đảo khi dark) | `On-White-Overlay/Strongest` | Rebind |
| F18 | Bottom-Navigation Floating-Glass bar | thanh bind `Surface/Glass` 54 % + blur (đúng); instance con fill `Active/Neutral/Solid` gây nhầm | `Surface/Glass` | Bỏ fill thừa của instance con |

## C. Tương phản (chọn token khác vì < 3:1)

| # | Chỗ | Figma | Code | Việc trong Figma |
|---|---|---|---|---|
| F19 | Badge/Alert/Toast Warning, Dock-Icon Yellow Solid | icon/chữ `On-Colors` trắng trên vàng (1.7:1) | `On-Brights` | Rebind |
| F20 | Dock-Icon, Avatar-Group, Badge Accent Solid | `On-Colors` (dark Accent/Solid = mint sáng) | `On-Accent/Default` (+F3) | Rebind |
| F21 | Inline-Message icon | `<Status>/Light` (Warning 1.8:1) | `<Status>/Base` | Rebind |
| F22 | Search overlay icon | `On-Dark-Overlay/Light` (1.5:1) | `/Base` | Rebind |
| F23 | Status solid + chữ trắng (Positive #3fab53 2.9:1, Info 3.6, Support Blue/Orange/Green, Negative dark 3.5) | như vậy | giữ | Quyết định thiết kế: tối màu Solid hoặc chấp nhận "chữ lớn" |

## D. Cấu trúc component tự mâu thuẫn

| # | Chỗ | Figma | Code | Việc trong Figma |
|---|---|---|---|---|
| F24 | Button/Icon-Main, Icon-Main-Overlay State=Disabled | Primary/Accent/Positive còn `Shadow/Action/Basic`, Danger/Tertiary không | Disabled không shadow (mọi set) | Bỏ shadow ở Disabled |
| F25 | Button Main-Overlay/Icon Tertiary Disabled | có/không viền không nhất quán giữa set | Overlay & Icon Tertiary Disabled không viền; Main Tertiary Disabled viền `Border/Disabled` | Chốt một kiểu |
| F26 | Focus (Text-Field, Search, Stepper-Control, Chip, Radio row) | 2 viền: `Border/Default` + ring `Focus/*` | 1 viền Focus | Bỏ viền trong khi Focused (touch không có focus) |
| F27 | Tab Subtle Select=Yes | cao `Button/Size/Small` (40) vs No 48 | 48 cả hai | Đặt Select=Yes = `Button/Size/Medium` |
| F28 | Search/Overlay Type=Default Focused | nền `Input-Overlay/Background/Default`, Rounded Focused = `/Focused` | luôn `/Focused` | Thống nhất Focused |
| F29 | Avatar Square viền | Accent/Neutral bind `Border/Inverse`, Support màu bind `Border/Support/<n>/Subtle` | viền theo theme cả hai shape | Thống nhất |
| F30 | OTP-Field Disabled | padding bind `Input/Spacing-Regt/XLarge/*` dù Size=Large | cell vuông không padding | Rebind Large |
| F31 | List-Item Inline Selected | padding ngang `Margin-Comfortable` (Default = `Margin-Small`) | Margin-Comfortable khi selected (theo Figma) | Xác nhận có chủ ý không |
| F32 | Card Semi-Pale | gradient không bind token | Pale + viền Pale | Bind gradient stop vào token hoặc bỏ variant |
| F33 | Badge Accent Subtle icon | Medium bind `Accent/Base`, Small/XSmall `Accent/Light` | Base mọi size | Thống nhất |
| F34 | Icon-Flat Large icon | `gr-dm-28` (Icon-Main = Popular/Base 20) | Popular/Base | Thống nhất |
| F35 | Text-Field vs Text-Area Focused/Error | Text-Field: `Focus/Neutral/Solid`, lỗi nền Focused; Text-Area: `Border/Active/Neutral/Solid` + ring Subtle, lỗi nền Default | theo từng set | Thống nhất một kiểu |
| F36 | Stepper-Control Disabled | nền/viền Default, chỉ chữ Disabled (Text-Field Disabled nền `Active/Neutral/Subtle`) | theo từng set | Thống nhất |
| F37 | Onboarding (nhóm màn) | dùng style/variable ngoài DS (`Heading/Mobile/H2`, `bg/brand/default`) | map gần đúng | Rebind sang DS |
| F38 | Tab-Item Size=Small Icon=None | padding dọc `Spacing/Padding/2XSmall` (Icon=Leading/Top Small = `3XSmall`) | 3XSmall mọi Icon (harness bỏ qua variant) | Thống nhất 3XSmall |
| F39 | Chip/Normal Size=XSmall | padding dọc bind `Chip/Spacing/Small/Customized-Padding` (10; 2×10 + chữ > height 32) dù có `XSmall/Vertical-Padding` (8) | `Chip/Spacing/XSmall/Vertical-Padding` | Rebind XSmall/Vertical-Padding |
| F40 | Stepper-Control-Split Size=Large | padding trên/dưới bind `…/Large/Horizontal-Padding` (12), token `Large/Vertical-Padding` (16) không dùng | Vertical-Padding | Rebind Vertical-Padding (hoặc xoá token) |
| F41 | Tab-Item Icon=Top, Tab-Bar Style=Top | cao bind `Tab-Item/Size/<S>/Height` (48/32); token `Icon-Top-Height` (44/32) không được dùng | dùng `Height` | Bind Icon-Top-Height cho Icon=Top hoặc xoá token |
| F42 | `Input/Text-Field` (40012870:36201) | Set thứ hai trùng tên `Input/Text-Field`, thực chất là Message-Input bản overlay (token Input-Overlay, pill, nút gửi Accent/Subtle) | code `MessageInput overlay`, dump parity đặt tên `Input/Message-Input-Overlay` | Đổi tên set thành `Input/Message-Input-Overlay` |
| F43 | Message-Input (+Overlay) Inputted-Error | help text + icon bind `Color/Content/Inverse/Light` (Text-Field dùng `Negative/Light`) | `Color/Content/Negative/Light` | Rebind Negative/Light |
| F44 | Number-Align-Left Size=Large | paddingTop bind `…/Large/Horizontal-Padding-Left` thay vì `Vertical-Padding` | Vertical-Padding | Rebind |
| F45 | Field-Group mọi Size | gap nhãn↔khung bind `Input/Spacing-Regt/XLarge/Outside-Field-Gap` cho cả Small/Medium/Large | Outside-Field-Gap theo Size | Rebind theo Size |
| F46 | Message-Input-Overlay Focused vs Typing | Focused viền `Color/Focus/Overlay/Subtle`, Typing viền `Color/Border/Active/Overlay/Subtle` (Search/Overlay cũng vậy) | Focus/Overlay/Subtle cho cả hai | Thống nhất một token |
| F47 | Date-Picker Day / Week-Labels | cỡ ô 48 (Large) / 40 (Small) là số cứng, không bind size token | `Button/Size/Medium` / `Button/Size/Small` | Bind token (hoặc thêm `Date-Picker-Item/Size/*`) |
| F48 | Number-Align-Center Size=Large | padding trên/dưới bind `…/Large/Horizontal-Padding` (như F40 Split), `Large/Vertical-Padding` không dùng | Vertical-Padding | Rebind |
| F49 | Dark: `Button-Primary-Overlay/Content/*`, `Button-Tertiary-Overlay/Content/Default`; Main-Overlay Primary bind `Button-Primary/Content` | nền `*-Overlay/Background` cố định trắng 20 % nhưng chữ dark alias #1a1a1a → chữ tối trên nền trắng mờ trên ảnh | `DARK_FIXUP` → `On-Dark-Overlay/Strongest`; code Main-Overlay Primary dùng `*-Overlay/Content` | Alias dark → On-Dark-Overlay/Strongest; rebind Main-Overlay Primary |
| F50 | `Color/Background/Overlay` dùng làm scrim trên ảnh (Story, Comment-Media +N, Video-Control-Overlay) | token đổi theo scheme (light 25 % / dark 45 %) → light chìm trên ảnh sáng | Story: gradient `Black-Overlay/Hover→Default`; +N / video: `Black-Overlay/Default` | Thêm token `Scrim/*` cố định 2 theme, rebind |
| F51 | Media-Item viền `Color/Border/Active/Overlay/Solid`; các `*Overlay*/Border` | light #ffffff05 (tàng hình) vs dark #cecece (xám đặc); Border/Overlay/Subtle, Input-Overlay/Border, Button-*-Overlay/Border alpha 50 → 1a khi dark | `Border/Overlay/Subtle/Default` | Token overlay không đổi theo scheme |
| F52 | Onboarding 02-Intro ảnh minh hoạ | JPEG 896×1200 nền trắng nướng cứng → dark mode lộ ô trắng | thẻ `White-Solid` bo góc bọc ảnh | Xuất PNG/SVG nền trong suốt |
| F54 | Token màu dưới WCAG AA 4.5:1 (đo axe trên Storybook 2026-09-26, 58 lượt; trùng danh sách KNOWN_DESIGN của `src/audit/contrast.test.ts`) | Placeholder `#a1a1a1`/trắng 2.58; Disabled `#949494`/`#ebebeb` 2.54; Neutral/Light `#9e9e9e`/Alt `#fafafa` 2.56; Positive Solid trắng/`#3fab53` 2.93; Positive Subtle 3.22; Danger Subtle 4.48; Badge Orange/Crimson/Pink Solid 2.7–3.6; dark: Negative `#d51420`/`#1a1a1a` 3.27, Disabled `#555`/`#2a2a2a` 1.92, Bottom-Nav Neutral-Solid nhãn off 1.91 | giữ token Figma, ghi nợ | Nâng độ đậm token (Placeholder/Disabled/Neutral-Light ≥ 4.5, Solid status ≥ 3 cho chữ lớn) |
| F53 | OTP-Field Length=6 | ô `Input/Size/XLarge` 64 × 6 + gap 8 × 5 = 424 > khung 358 (390 − margin) → tràn phải; Large cũng 376 | ô `flexShrink` co đều, giữ vuông | Length=6 dùng ô nhỏ hơn hoặc gap nhỏ hơn |

## E. Thiếu trong Figma (code chưa làm, chờ thiết kế)

- Scrim gradient cho chữ trên ảnh sáng (Story header/reply) — Figma không có; **code đã làm 2026-09-24** (`ui/Fade.tsx`, màu lấy token `Black-Overlay/Hover` → `Black-Overlay/Default` → trong suốt, KHÔNG đổi theo scheme; trước đó nền phẳng `Background/Overlay` 25 % ở light nên chìm trên ảnh sáng). Đề xuất Figma thêm token `Scrim/*` + primitive Scrim để rebind. Pill/Moment vẫn chưa có scrim.
- Top-Navigation Type=Package-Select, Text-Area bộ đếm ký tự, Bottom-Sheet Stack=On, Video Media-Item: chưa build (không phải nợ Figma).
- **State Focused chưa có trong Figma** cho Field-Group (row), Comment-Composer, Story reply → code không vẽ focus; trên web giữ outline mặc định trình duyệt cho các ô này (WCAG 2.4.7), chỉ tắt outline (`INPUT_RESET`) ở Text-Field/Search/Area/Message/Number/Stepper đã có state Focused. Chờ Figma thêm state Focused (viền `Color/Focus/*`) rồi rebind + tắt outline. *(reviewer 2026-09-26)*
- **Error + Focused** (Text-Field các loại, Number-Field): Figma chỉ có Error hoặc Focused riêng → code giữ viền Negative khi vừa lỗi vừa focus (dấu focus = caret + bg Focused). Chờ Figma chốt tổ hợp.

## F. Brand GramGolf (override code-side, 2026-10-07)

**Brand GramGolf teal là override code-side `packages/ds/tokens/brand/` — Figma vẫn GR xanh cũ.** Thang `GR`/`GR-Alpha` (light+dark) = teal, step 9 `#14be96`; `On-Brand-*` = navy `#0b2230` (light Pressed = trắng trên step 11); `Color/Content/Accent/Light` → Brand 11. Phân tích: `docs/ds/REBRAND.md`. Việc trong Figma: đưa thang teal + On-Brand navy vào collection `global-colors`/`base-colors`, dump lại, xoá `tokens/brand/`.

| # | Chỗ | Figma | Code | Việc trong Figma |
|---|---|---|---|---|
| F-brand-1 | Page-Indicator dot Accent đang chọn | teal step 9 trên canvas trắng 2.38:1 (< 3, WCAG 1.4.11) | giữ, `KNOWN_DESIGN` (khối hình, vị trí chấm vẫn đọc được) | Chọn dot đậm hơn (Brand 11) hoặc chấp nhận |
| F-brand-2 | Progress Accent fill vs track | 1.98:1 | giữ, `KNOWN_DESIGN` | Track tối hơn / fill Brand 11 |
| F-brand-3 | Toggle on: bar vs canvas (light 2.38), dot vs bar (light 2.38, dark 2.28) | như vậy | giữ, `KNOWN_DESIGN` (shape + bóng dot) | Bar Brand 10–11 hoặc dot navy |
| F-brand-4 | Bottom-Navigation item `Accent-Solid` nhãn chọn | `Content/Inverse/Strongest` (trắng 2.18:1 trên teal) | `Content/On-Accent/Default` (navy) như icon; parity `ignore` | Rebind nhãn sang On-Accent/Default |
