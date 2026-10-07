/**
 * Đối chiếu token Figma ↔ token code cho từng variant.
 * - Figma: `figma/*.json` = dump `boundVariables` theo variant (script `docs/ds/superpowers/plans/2026-09-16-ds-batch-1.md` §parity), factored common/variants.
 * - Code: gọi styles fn với theme proxy ghi lại mọi key đi qua getter (+ key nằm trong giá trị trả về, vd iconColor).
 * So sánh theo TÊN token (bỏ tiền tố fill/text/stroke…): thiếu = Figma có mà code không; thừa = code dùng mà Figma không.
 * Chạy: pnpm -F @gr/ds exec vitest run src/audit/figmaParity
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createTheme, type Theme } from '../theme/createTheme';
import { themeLight } from '../generated/theme.light';
import { componentNeutralLight } from '../generated/component.neutral.light';
import { spacing } from '../generated/spacing';
import { radius } from '../generated/radius';
import { size } from '../generated/size';
import { breakpoints } from '../generated/breakpoints';
import { textStyles } from '../generated/textStyles';
import { effects } from '../generated/effects';
import { globalDimensions } from '../generated/primitives';
import { emphasis } from '../generated/weight';
import { badgeStyles } from '../ui/Badge/badgeStyles';
import { avatarStyles } from '../ui/Avatar/avatarStyles';
import { checkboxStyles } from '../ui/Checkbox/checkboxStyles';
import { tagStyles } from '../ui/Tag/tagStyles';
import { chipStyles } from '../ui/Chip/chipStyles';
import { listItemStyles } from '../ui/ListItem/listItemStyles';
import { cardStyles } from '../ui/Card/cardStyles';
import { dividerStyles } from '../ui/Divider/dividerStyles';
import { toggleStyles } from '../ui/Toggle/toggleStyles';
import { pageIndicatorStyles } from '../ui/PageIndicator/pageIndicatorStyles';
import { popoverItemStyles } from '../ui/Popover/popoverItemStyles';
import { buttonStyles } from '../ui/Button/buttonStyles';
import { segmentedContainerStyles, segmentedItemStyles } from '../ui/Segmented/segmentedStyles';
import { tabBarStyles, tabItemStyles } from '../ui/TabBar/tabStyles';
import { textFieldStyles } from '../ui/TextField/textFieldStyles';
import { topNavigationStyles } from '../ui/TopNavigation/topNavigationStyles';
import { bottomNavItemStyles } from '../ui/BottomNavigation/bottomNavigationStyles';
import { otpCellStyles } from '../ui/OtpField/otpFieldStyles';
import { stepperControlStyles, numberFieldStyles } from '../ui/StepperControl/stepperControlStyles';
import { fieldGroupStyles } from '../ui/TextField/fieldGroupStyles';
import { dayCellStyles, weekLabelStyles, monthHeaderStyles, wheelItemStyles, wheelStyles } from '../ui/DatePicker/datePickerStyles';
import { radioStyles } from '../ui/Radio/radioStyles';
import { accordionStyles } from '../ui/Accordion/accordionStyles';
import { alertBannerStyles, inlineMessageStyles, toastStyles, tooltipStyles, dialogStyles } from '../ui/Feedback/feedbackStyles';
import { progressStyles, skeletonStyles, skeletonTextStyles } from '../ui/Progress/progressStyles';
import { paginationStyles, breadcrumbsStyles, stepperStyles } from '../ui/Navigation/navigationStyles';
import { dockIconStyles, connectorStyles, colorSelectorStyles, avatarGroupStyles, emptyStateStyles } from '../ui/DockIcon/dockIconStyles';
import { socialActionStyles, identityStyles, mediaPillStyles, postMediaStyles, videoOverlayStyles, postCardStyles } from '../ui/PostCard/postCardStyles';
import { storyStyles } from '../ui/Story/storyStyles';
import { commentStyles, commentMediaStyles, composerStyles } from '../ui/Comment/commentStyles';
import { shareActionLabelStyles, collectionItemStyles, collectionCardStyles, mediaItemStyles } from '../ui/Social/socialStyles';
import { bottomSheetStyles } from '../ui/BottomSheet/bottomSheetStyles';
import { controlRowStyles } from '../ui/Radio/radioStyles';

type RawDump = Record<string, { id: string; common: string[]; variants: Record<string, string[]> }>;
type Dump = Record<string, { variants: Record<string, string[]> }>;
type Props = Record<string, string | boolean>;
type Fn = (t: Theme, o: never) => unknown;
/** map: props Figma (đã chuẩn hoá) → args cho styles fn; null = bỏ variant. */
/** extraOk: styles fn trả hàm theo state / bảng eager → token code là hợp của mọi state, chỉ kiểm chiều THIẾU. */
interface Entry { fn: Fn; map?: (p: Props) => object | null; ignore?: RegExp[]; extraOk?: boolean }

// State Figma → props code. Không có trong bảng → bỏ variant (Focused, Typing, Hover-Mark…).
const STATE: Record<string, Props> = { Default: {}, Hover: { pressed: true }, 'Hover-Row': { pressed: true }, Pressed: { pressed: true }, Disabled: { disabled: true }, Error: { error: true }, Selected: { selected: true }, 'Single-Selected': { selected: true }, Focused: { focused: true }, Typing: { focused: true }, Inputted: {}, 'Read-Only': { readOnly: true }, 'Inputted-Error': { error: true }, 'Blank-Error': { error: true } };
const SKIP = new Set(['Hover-Mark', 'Focus']);
function parse(name: string): Props | null {
  const p: Props = {};
  for (const part of name.split(',')) {
    const [k, v] = part.split('=').map((s) => s.trim());
    if (!k || v === undefined) continue;
    if (k === 'State') { if (SKIP.has(v)) return null; p.state = v; Object.assign(p, STATE[v] ?? {}); continue; }
    const key = k[0]!.toLowerCase() + k.slice(1);
    p[key] = v === 'Yes' || v === 'True' ? true : v === 'No' || v === 'False' ? false : v;
  }
  return p;
}

// Slot con (icon/avatar/nút trong) tính ở component khác → ignore theo set; quyết định thiết kế có chủ đích ghi chú tại chỗ.
const SLOT_ICON = /^Element-Size\/Popular\//;
const SLOT_AVATAR = /^Color\/Background\/Surface\/Default$|^Color\/Border\/Neutral\/Subtle\/Default$/;
const CHECK_SLOT = /^Checkbox\/|^Radio-Button\/|^Shadow\/Action\/Basic$|^Corner-Radius\/Rounded$|^Spacing\/Padding\/3XSmall$/;
const BUTTON_SLOT = /^Button-Tertiary\/|^Button-Primary-Overlay\/|^Button\/Size\/|^Button\/Spacing\/|^Corner-Radius\/Action\/|^Shadow\/Action\/|^Spacing\/Padding\/XSmall$|^Corner-Radius\/Rounded$|^Spacing\/Gap\/2XSmall$/;
const CONFIG: Record<string, Entry> = {
  Badge: { fn: badgeStyles },
  // Status dot (2XSmall, Positive) luôn được tính; Square: Figma bind Border/Inverse (ignore chung) còn code giữ viền theme.
  'Avatar/Single': { fn: avatarStyles, ignore: [SLOT_ICON, SLOT_AVATAR, /Positive\/Solid|^Corner-Radius\/Rounded$|^Heading\/Subheading$|Content\/Accent\/Base$|^Color\/Border\/(Active\/Accent|Support\/Neutral)\/Subtle$/] },
  'Checkbox/Mark': { fn: checkboxStyles, ignore: [SLOT_ICON, /Icon-Check/] },
  // Tag: chữ cao Popular/Base là hộp text; × bind Placeholder, icon Neutral/Base tính sẵn.
  Tag: { fn: tagStyles, map: (p) => ({ size: 'Medium', ...p }), ignore: [SLOT_ICON, SLOT_AVATAR, /Content\/(Placeholder|Neutral\/Base|Negative\/Light)$/] },
  // XSmall: Figma bind padding dọc = Chip/Spacing/Small/Customized-Padding (10, tràn height 32) → code dùng XSmall/Vertical-Padding (NỢ FIGMA F39).
  'Chip/Normal': { fn: chipStyles, map: (p) => ({ variant: 'Normal', ...p }), ignore: [SLOT_ICON, SLOT_AVATAR, /^Chip\/Spacing\/(Small\/Customized-Padding|XSmall\/Vertical-Padding)$/] },
  'Chip/Advanced': { fn: chipStyles, map: (p) => ({ variant: 'Advanced', ...p }), ignore: [SLOT_ICON, SLOT_AVATAR] },
  'Chip/Number-Only': { fn: chipStyles, map: (p) => ({ variant: 'Number-Only', ...p }), ignore: [SLOT_ICON] },
  // Radio-Card nền White-Solid → Surface (audit §7d); Inline Selected padding Margin-Comfortable là quirk Figma.
  'List-Item': { fn: listItemStyles, ignore: [SLOT_ICON, SLOT_AVATAR, /^Corner-Radius\/(Base|Rounded)$|^Button\/Size\/Small$|White-Solid|Neutral\/Flat\/Default$|^Margin-/] },
  // Semi-Pale = gradient trong Figma → Pale + viền Pale (spec §7). Sub-action là IconButton.
  // Gutter + Card-padding-small (cả ở Xsmall) = wrapper nội dung con trong dump Small/Xsmall; padding container đã kiểm ở Medium.
  Card: { fn: cardStyles, map: (p) => (p.active ? null : p), ignore: [/^Gutter$|^Card-padding-small$/, SLOT_ICON, /^Button\/Size\/Small$|Neutral\/Flat\/Default$|^Spacing\/Gap\/2XSmall$|^Corner-Radius\/Rounded$|Neutral\/Strongest$|Support\/Neutral\/Pale|Border\/Neutral\/Pale/] },
  Divider: { fn: dividerStyles },
  // Toggle bind token Segmented/*-Small (không có trong dump) → Rounded + padding 3XSmall (spec §7).
  'Toggle-Button': { fn: toggleStyles, ignore: [/^Segmented\/|Support\/Neutral\/Pale|^Corner-Radius\/Rounded$/] },
  'Page-Indicator': { fn: pageIndicatorStyles, ignore: [/^Scale\/9999$|^Corner-Radius\/Rounded$|Inverse|On-Dark-Overlay|White-Disabled/] },
  'Popover/Item-Select': { fn: popoverItemStyles, ignore: [SLOT_ICON, SLOT_AVATAR, CHECK_SLOT, /^Spacing\/Gap\/XSmall$|^Body\/XSmall\/Medium$|Neutral\/Base$|Neutral\/Flat\/Default$/] },
  'Button/Main': { fn: buttonStyles, map: (p) => ({ kind: 'Main', ...p }), ignore: [SLOT_ICON] },
  'Button/Flat': { fn: buttonStyles, map: (p) => ({ kind: 'Flat', ...p }), ignore: [SLOT_ICON] },
  // Container set chứa item; Container-Corner-Radius-Small không có trong dump token → Medium (=1000, spec §7).
  // NỢ FIGMA F1: Level Figma ngược tên token item → đảo khi map.
  Segmented: { fn: segmentedContainerStyles, map: (p) => ({ level: p.level === 'Secondary' ? 'Primary' : 'Secondary' }), ignore: [/^Segmented-Item-|^Segmented\/(Spacing|Size|Item-Corner)|Corner-Radius-(Small|Medium)$|^Shadow\/Action|^Body\/|Neutral\/Light$|Border\/Neutral\/Pale/] },
  'Primitives/Segmented/Item': { fn: segmentedItemStyles, map: (p) => ({ ...p, selected: p.select }), ignore: [SLOT_ICON, /Item-Corner-Radius-(Small|Medium)$/] },
  'Tab-Bar': { fn: tabBarStyles, ignore: [/^Tab|^Corner-Radius|^Element-Size|^Body\/|^Spacing\/Padding|^Button\/Size|^Emphasis/] },
  // Subtle Select=Yes cao Button/Size/Small (40) vs No 48 → giữ 48 (spec §7); Corner-Radius/Base là slot icon; underline trong suốt vẫn có Border-Weight.
  // Small Icon=None Figma bind Padding/2XSmall trong khi Icon=Leading/Top Small = 3XSmall → code giữ 3XSmall, bỏ qua variant (NỢ FIGMA F38).
  'Primitives/Tab-Item': { fn: tabItemStyles, map: (p) => (p.size === 'Small' && p.icon === 'None' ? null : { ...p, selected: p.select }), ignore: [/^Corner-Radius\/Base$|^Button\/Size\/(Small|Medium)$|^Emphasis\/|^Spacing\/Gap\/(XSmall|Small)$/] }, // Gap XSmall/Small = offset badge neo góc icon (Icon=Top), Figma đặt số cứng
  // Hover không có trên touch; focus Figma 2 viền (Border/Default + Focus ring) → 1 viền; label/help tính sẵn.
  'Input/Text-Field': { fn: textFieldStyles, map: (p) => (p.pressed ? null : p), ignore: [SLOT_ICON, /^Spacing\/Gap\/2XSmall$|^Input\/Border\/Default$|^Label\/Small\/DemiBold$|^Caption\/Regular$|Content\/(Placeholder|Neutral\/Strongest|Neutral\/Light)$|Neutral\/Subtle\/Default$/] },
  'Search/Default': { fn: textFieldStyles, map: (p) => (p.pressed ? null : { ...p, variant: 'Search', searchType: p.type }), ignore: [SLOT_ICON, BUTTON_SLOT, /^Spacing\/Gap\/XSmall$|Outside-Field-Gap$|Border\/Active\/Neutral\/Subtle$|^Label\/Small\/DemiBold$|^Caption\/Regular$|Content\/(Placeholder|Neutral\/Strongest)$/] },
  // Body/XSmall/Regular = bộ đếm ký tự (chưa làm); focus ring Focus/Neutral/Subtle bỏ (1 viền).
  'Input/Text-Area': { fn: textFieldStyles, map: (p) => (p.pressed ? null : { ...p, multiline: true }), ignore: [SLOT_ICON, /^Spacing\/Gap\/2XSmall$|^Body\/XSmall\/Regular$|Focus\/Neutral\/Subtle$|^Label\/Small\/DemiBold$|^Caption\/Regular$|Content\/(Placeholder|Neutral\/Strongest|Neutral\/Light)$|^Input\/Border\/Default$/] },
  // Overlay chữ Figma bind Inverse/* → On-Dark-Overlay (audit §7d); action = IconButton, Package-Select = Button XLarge (chưa làm Type).
  'Top-Navigations': { fn: topNavigationStyles, map: (p) => (p.type === 'Package-Select' ? null : { surface: p.surface, align: 'Left', size: 'Medium' }), ignore: [SLOT_ICON, BUTTON_SLOT, /Inverse\/|On-Dark-Overlay|Border\/Neutral\/Pale|^Effect\/Input$|^Body\/XSmall\/Regular$|Neutral\/Base$/] },
  '.Primitives/Bottom-Navigation/Items/Floating': { fn: bottomNavItemStyles, map: (p) => ({ theme: p.theme, selected: p.select }), ignore: [SLOT_ICON, /Negative\/Solid/] },
  // Overlay: Liquid-glass/Effect/Overlay chưa làm (blur); Disabled chữ On-Dark-Overlay/Disabled.
  'Button/Main-Overlay': { fn: buttonStyles, map: (p) => ({ kind: 'Main-Overlay', ...p }), ignore: [SLOT_ICON, /^Effect\//, /^Button-Primary(-Overlay)?\/Content\/(Default|Pressed)$/] }, // Primary: Figma bind Button-Primary/Content (đảo scheme) → code *-Overlay/Content (NỢ FIGMA F49)
  // Nút icon vuông: padding/gap Figma không dùng (width = height); Disabled: Figma giữ shadow không nhất quán (Primary/Accent/Positive có, Danger/Tertiary không) → bỏ Disabled.
  // Icon button = box cố định (Button/Size) + icon căn giữa → padding/gap trong Figma suy ra từ box − icon, không phải token riêng.
  'Button/Icon-Main': { fn: buttonStyles, map: (p) => (p.disabled ? null : { kind: 'Icon-Main', ...p }), ignore: [SLOT_ICON, /^Spacing\/(Padding\/(Medium|Small|XSmall)|Gap\/(XSmall|2XSmall))$|^Button-Label\//] },
  // Icon-Flat Large bind gr-dm-28 (spec §7) → dùng bảng Icon-Main.
  'Button/Icon-Flat': { fn: buttonStyles, map: (p) => ({ kind: 'Icon-Flat', ...p }), ignore: [SLOT_ICON, /^gr-dm-28$/, /^Spacing\/(Padding\/Medium|Gap\/XSmall)$|^Button-Label\//] },
  'Button/Icon-Main-Overlay': { fn: buttonStyles, map: (p) => (p.disabled ? null : { kind: 'Icon-Main-Overlay', ...p }), ignore: [SLOT_ICON, /^Effect\//, /^Spacing\/(Padding\/Medium|Gap\/XSmall)$|^Button-Label\//] },
  // Ô OTP vuông cố định → padding/gap trong không dùng; Error: ô chưa lỗi giữ Default (cùng variant); Disabled bind padding XLarge (quirk).
  'OTP-Field': { fn: otpCellStyles, map: (p) => ({ ...p }), ignore: [/^Spacing\/Gap\//, /Content\/(Placeholder|Neutral\/Strongest)$|Input\/Spacing-Regt|^Corner-Radius\/Input\/(XLarge|Large)$|^Input\/(Border|Background)\/Default$/] },
  // Nút ± là IconButton Tertiary; BACKGROUND_BLUR + 2 inner shadow bind biến màu → Effect/Input (spec §7).
  'Stepper-Control-Split': { fn: stepperControlStyles, map: (p) => (p.pressed ? null : { ...p }), ignore: [SLOT_ICON, BUTTON_SLOT, /^Color\/Content\/Disabled$|Border\/Active\/Neutral\/Subtle$|^Corner-Radius\/Input\/Rounded$|^effect#|BACKGROUND_BLUR|INNER_SHADOW|^Effect\/Input$|Content\/(Placeholder|Neutral\/Strongest)$|^Spacing\/(Gap\/(XSmall|2XSmall)|Padding\/Small)$|^Stepper-Control-Align-Center\/Spacing\/Large\/Vertical-Padding$/] }, // padding/gap = nút icon con; Large Vertical-Padding: Figma bind Horizontal-Padding cho trên/dưới (NỢ FIGMA F40)
  // Disabled Select=Yes bind Color/Background/Fill/Disabled/Neutral/Solid (không có trong dump) → Solid-Disabled (spec §7).
  'Radio-Button/Radio-Mark': { fn: radioStyles, ignore: [SLOT_ICON, /Icon-Check|Fill\/Disabled|^Radio-Button\/Size|Solid-Disabled/] },
  // Expanded=No: body style vẫn tính; Gap/XSmall + Padding/3XSmall = wrapper icon.
  // Padding/3XSmall + Padding/2XSmall (XLarge) = wrapper icon con; Body/Base/Regular + Neutral/Base = body chỉ hiện khi Expanded.
  'Accordion/Text': { fn: accordionStyles, ignore: [SLOT_ICON, /^Spacing\/Padding\/(2XSmall|3XSmall)$|^Body\/Base\/Regular$|Neutral\/Base$/] },
  // Nút hành động trong banner/toast = Button (slot); Custom bỏ.
  'Alert-Banner': { fn: alertBannerStyles, map: (p) => ({ ...p, theme: p.theme === 'Default' ? 'Neutral' : p.theme }), ignore: [SLOT_ICON, BUTTON_SLOT, /^Button-old|Button-Accent-Overlay|^Button-Label/] },
  // Icon Figma bind <Status>/Light (Warning 1.8:1) → Base (audit §7d).
  'Inline-Message': { fn: inlineMessageStyles, ignore: [SLOT_ICON, /Content\/\w+\/(Light|Base)$|^Spacing\/Padding\/3XSmall$/] },
  'Toast-Message': { fn: toastStyles, ignore: [SLOT_ICON, BUTTON_SLOT, /^Button-old|Button-Accent-Overlay|^Button-Label|^Corner-Radius\/Base$|Neutral\/Light$|^Spacing\/Gap\/XSmall$/] },
  // White Overlay: Figma chữ Neutral/Strongest (đảo khi dark) → On-White-Overlay/Strongest (audit §7d).
  Tooltip: { fn: tooltipStyles, map: (p) => ({ ...p }), ignore: [/On-White-Overlay|Neutral\/Strongest$|^Spacing\/Gap\/2XSmall$/] },
  // Scrim (Margin-Small + Overlay) không thuộc component Figma.
  'Modal/Dialog': { fn: dialogStyles, map: () => ({}), ignore: [SLOT_ICON, BUTTON_SLOT, /^Button-|Content\/\w+\/Light$|Negative\/Solid|On-Colors|^Spacing\/Gap\/(2XSmall|XSmall)$|^Effect\/Overlay$|^Margin-Small$|Background\/Overlay$/] },
  // Overlay label Inverse/Base → On-Dark-Overlay (audit §7d); Status = Positive khi không truyền status.
  'Progress-Bar': { fn: progressStyles, map: (p) => ({ theme: p.theme }), ignore: [/Inverse\/|On-Dark-Overlay|^Spacing\/|^Element-Size\/Popular\/4XSmall$/] },
  'Skeleton/Shapes': { fn: skeletonStyles, ignore: [/^Image-Size\/|^Corner-Radius\//] },
  'Skeleton/Body-Text': { fn: skeletonTextStyles, map: () => ({}), ignore: [/^Spacing\/|^Image-Size\/|^Corner-Radius\/|^Element-Size\//] },
  '.Primitives/Pagination/Item': { fn: paginationStyles, map: (p) => (p.pressed ? null : { theme: p.level, size: p.size }), ignore: [/^Spacing\/|^Element-Size\//], extraOk: true },
  '.Primitives/Breadcrumbs/Item': { fn: breadcrumbsStyles, map: () => ({}), ignore: [SLOT_ICON, /Neutral\/Flat\/(Default|Hover)$|^Spacing\/Gap\/2XSmall$|^Body\/Base\/Medium$|Neutral\/Light$/], extraOk: true },
  '.Primitives/Stepper/Item': { fn: stepperStyles, map: () => ({}), ignore: [SLOT_ICON, /Date-Picker|Focus-XSmall|Border\/Active\/Neutral\/(Subtle|Solid)$|Focus\/Negative|^Spacing\/|^Corner-Radius\/Rounded$|^Body\/XSmall\/(Medium|DemiBold)$/], extraOk: true },
  // Accent/Yellow Solid icon On-Colors → On-Accent/On-Brights (audit §7d).
  'Dock-Icon': { fn: dockIconStyles, ignore: [SLOT_ICON, /On-Colors|On-Accent|On-Brights|^Image-Size\//] },
  'Integration-Connector': { fn: connectorStyles, map: (p) => ({ size: p.size, background: p.background }), ignore: [SLOT_ICON, /Surface\/Default$|Positive\/Light$|^Corner-Radius\/Rounded$|^Spacing\/Gap\/3XSmall$|^Image-Size\//], extraOk: true },
  // Hover: Figma giữ viền Subtle/Hover + thêm ring Focus → 1 viền Focus.
  'Color-Selector': { fn: colorSelectorStyles, map: (p) => ({ select: p.select, pressed: p.status === 'Hover' }), ignore: [SLOT_ICON, /On-Colors|On-Dark-Overlay|^Select-Item\/|Border\/Neutral\/Subtle\/Hover$/] },
  // Chỉ so bong bóng "+N"; các avatar con tính ở Avatar.
  'Avatar/Group': { fn: avatarGroupStyles, ignore: [/Support\/|^Image-Size\/|Surface\/Default$|^Spacing\/Gap\/|^Emphasis\/|On-Colors$/] },
  'Empty-State': { fn: emptyStateStyles, map: () => ({}), ignore: [BUTTON_SLOT, /^Button-|^Button\/|Border\/Neutral|Surface\/Default$|Neutral\/Pale|Placeholder$|^Spacing\/Padding\/4XLarge$/] },
  // ---- Đợt 3 composite: chữ trên ảnh Figma bind Inverse/* → On-Dark-Overlay (audit §7d); slot con (Avatar, Button, Checkbox) bỏ.
  '.Primitives/Post-Card/Post-action': { fn: socialActionStyles, map: (p) => ({ type: p.type, size: 'Medium', active: p.active === 'On' }), ignore: [SLOT_ICON, /^Spacing\/Gap\/2XSmall$|^Body\/Base\/DemiBold$/] },
  // Label/Mobile/Label 3 (style cũ) → Caption/Medium (spec §7c); gr-dm-16 = icon.
  '.Primitives/Post-Card/Media-Info-Pill': { fn: mediaPillStyles, ignore: [SLOT_ICON, /Inverse\/|On-Dark-Overlay/, /^gr-dm-16$|^gr-dm-12$|Label\/Mobile|^Caption\/Medium$|^Spacing\/Gap\/3XSmall$|^Corner-Radius\/Rounded$/] },
  '..Primitives/Post-Card/Video-Control-Overlay': { fn: videoOverlayStyles, map: (p) => ({ state: p.state }), ignore: [SLOT_ICON, BUTTON_SLOT, /Inverse\/|On-Dark-Overlay/, /^Button-|^Button\/|^gr-dm-2$|^Spacing\/Gap\/Small$|Background\/(Overlay|Black-Overlay\/Default)$/], extraOk: true }, // scrim: Background/Overlay đổi scheme → Black-Overlay/Default (F50)
  '.Primitives/Post-Card/Header/Post': { fn: identityStyles, map: () => ({ overlay: false }), ignore: [SLOT_ICON, BUTTON_SLOT, SLOT_AVATAR, /^Button-|^Button\/|^Image-Size|Surface\/Alt$|Accent\/Subtle|Content\/Accent\/Base$|^Spacing\/Padding\/(Small|Medium)$/], extraOk: true },
  '.Primitives/Post-Caption': { fn: postCardStyles, map: () => ({}), ignore: [/^mixed$/], extraOk: true },
  '..Primitives/Post-Card//Media-Frame': { fn: postMediaStyles, map: () => ({}), extraOk: true },
  // Header/Bottom cùng storyStyles; Follow = Button Primary-Overlay, progress = ProgressBar Overlay, ô reply = Input-Overlay.
  '.Primitives/Story-Viewer/Header': { fn: storyStyles, map: () => ({}), ignore: [SLOT_ICON, BUTTON_SLOT, SLOT_AVATAR, /Inverse\/|On-Dark-Overlay/, /^Button-|^Button\/|^Image-Size|Surface\/Alt$|White-Overlay|Active\/Overlay\/Solid|On-Accent|^Effect\/Overlay$|^Spacing\/Padding\/2XSmall$|^Body\/XSmall\/(DemiBold|Regular)$|^Caption\/Regular$|Border\/Active\/Overlay\/Subtle$/], extraOk: true },
  '.Primitives/Story-Viewer/Bottom-Content': { fn: storyStyles, map: () => ({}), ignore: [SLOT_ICON, BUTTON_SLOT, /Inverse\/|On-Dark-Overlay/, /^Button-|^Button\/|^remote:|Blur|^mixed$|Input\/Spacing-(Pill|Regt)|^gr-dm-8$|^Spacing\/Padding\/Small$|^Corner-Radius\/Input\/Small$|^Spacing\/Padding\/2XLarge$/], extraOk: true },
  '.Primitives/Comment-Item': { fn: commentStyles, map: () => ({}), ignore: [SLOT_ICON, SLOT_AVATAR, /Inverse\/|On-Dark-Overlay/, /^VIDEO$|Border-divider|^Scale\/|^Image-Size|^gr-dm-24$|Accent\/Light$|Background\/Overlay$|^Caption\/DemiBold$|^Corner-Radius\/Small$|^Body\/XSmall\/(DemiBold|Regular)$|Neutral\/Light$/], extraOk: true },
  '.Primitives/Comment-Item/Comment-Media-Item': { fn: commentMediaStyles, ignore: [/Inverse\/|On-Dark-Overlay/, /^gr-dm-24$|Background\/(Overlay|Black-Overlay\/Default)$/], extraOk: true }, // scrim F50
  'Comment-Composer': { fn: composerStyles, map: () => ({}), ignore: [SLOT_ICON, BUTTON_SLOT, /^Button-|^Button\/|^Badge\/|Neutral\/(Light|Base|Strongest)$|^Body\/(XSmall\/DemiBold|Base\/Regular)$|^Corner-Radius\/XLarge$|Neutral\/Subtle\/Default$|^Spacing\/Gap\/XSmall$|^Spacing\/Padding\/2XSmall$/], extraOk: true },
  '.Primitives/Share-Sheet/Action-Label': { fn: shareActionLabelStyles, map: (p) => ({ active: p.state === 'Active' }), ignore: [SLOT_ICON, BUTTON_SLOT, /^Button-|^Spacing\/Padding\/Medium$|Neutral\/Strongest$/] },
  '.Primitives/Collection-Picker-Sheet/Colection-List-Item': { fn: collectionItemStyles, map: (p) => ({ state: p.state }), ignore: [SLOT_ICON, CHECK_SLOT, /Icon-Check|^Corner-Radius\/(XLarge|Base|Large)$|Accent\/Base$|Neutral\/(Light|Strongest)$|^Spacing\/Gap\/XSmall$|Surface\/Alt$/] },
  '.Primitives/Collection-Card': { fn: collectionCardStyles, map: () => ({}), ignore: [SLOT_ICON, /^Button\/|Neutral\/Flat|^Corner-Radius\/Rounded$|Neutral\/Strongest$|^Spacing\/Gap\/2XSmall$/], extraOk: true },
  // Video variant (duration Body/XSmall/DemiBold On-Dark-Overlay, corner Base) không dump.
  '.Primitives/Create-Post/Media-Item': { fn: mediaItemStyles, map: (p) => ({ state: p.state }), ignore: [SLOT_ICON, CHECK_SLOT, /Icon-Check|Solid-Disabled|Border\/Disabled|Neutral\/Strongest$|Border\/(Active\/Overlay\/Solid|Overlay\/Subtle\/Default)$/], extraOk: true }, // viền F51
  'Search/Overlay': { fn: textFieldStyles, map: (p) => (p.pressed ? null : { size: 'Medium (Base)', variant: 'Search', searchType: p.type, overlay: true, focused: p.focused }), ignore: [SLOT_ICON, BUTTON_SLOT, /Inverse\/|On-Dark-Overlay/, /^Button-|^Spacing\/Gap\/XSmall$|Outside-Field-Gap$|Border\/Active\/Overlay\/Subtle$|^Effect\/Overlay$|^Label\/Small\/DemiBold$|^Caption\/Regular$|Overlay\/Subtle\/(Default|Hover)$|Neutral\/Light$|Input-Overlay\/(Background\/(Default|Focused)|Border\/Default)$/] },
  // Header/nút đóng = TopNavigation/IconButton; Modal Stack=Off có ảnh nền + gradient (mẫu), Action có list row (Neutral/Subtle/Pressed, Support/Neutral/Solid grabber).
  'Bottom-Sheet': { fn: bottomSheetStyles, map: (p) => ({ type: p.type, size: 'Medium', align: 'Start', secondary: 'None' }), ignore: [SLOT_ICON, BUTTON_SLOT, /^Button-|^Button\/|^Viewport-Width$|^remote:|GRADIENT|^Overlay\/Light$|^Corner-Radius\/XLarge$|^Navigation-Action|^Margin-|Neutral\/Subtle\/Pressed|Canvas\/Alt|Surface\/(Default|Alt)$|Background\/Overlay$|^Effect\/Overlay$|Border\/Neutral\/Pale|^Spacing\/Padding\/(Small|XSmall|2XSmall)$|^Heading\/Subheading$|Neutral\/Strongest$|^Spacing\/Gap\/3XSmall$/], extraOk: true },
  // Đợt 5 — Input còn lại + Date-Picker (dump input3.json / datepicker.json)
  'Input/Message-Input': { fn: textFieldStyles, map: (p) => (p.pressed ? null : { ...p, variant: 'Message' }), ignore: [SLOT_ICON, BUTTON_SLOT, /^Spacing\/Padding\/Small$|^Input\/Border\/Default$|Negative\/Light$|^Button-Accent\/|Solid-Disabled$|^Color\/Content\/Disabled$|^Corner-Radius\/Input\/Medium$|Inverse\/|^Label\/Small\/DemiBold$|^Caption\/Regular$|Content\/(Placeholder|Neutral\/Strongest)$|Neutral\/Subtle\/Default$|Neutral\/Light$/] }, // nút gửi = slot; Corner-Radius/Input/Medium bind thừa cạnh Rounded; help Inverse/Light = NỢ FIGMA F43
  'Input/Message-Input-Overlay': { fn: textFieldStyles, map: (p) => (p.pressed ? null : { ...p, variant: 'Message', overlay: true }), ignore: [SLOT_ICON, BUTTON_SLOT, /Inverse\/|On-Dark-Overlay/, /^Spacing\/Padding\/Small$|Focus\/Overlay\/Subtle$|Accent\/(Subtle\/Default|Base)$|Subtle-Disabled$|^Color\/Content\/Disabled$|^Corner-Radius\/Input\/Medium$|^Label\/Small\/DemiBold$|^Caption\/Regular$|Input-Overlay\/(Border\/Hover|Background\/Default)$|Border\/Active\/Overlay\/Subtle$|Negative\/Light$|Neutral\/Light$/] }, // NỢ FIGMA F42 (tên set), F46 (Typing ≠ Focused border)
  'Input/Date-Field': { fn: textFieldStyles, map: (p) => (p.pressed ? null : p), ignore: [SLOT_ICON, /^Spacing\/Gap\/(2XSmall|XSmall)$|^Input\/Border\/Default$|^Label\/Small\/DemiBold$|^Caption\/Regular$|Content\/(Placeholder|Neutral\/Strongest|Neutral\/Light)$|Neutral\/Subtle\/Default$|^Color\/Content\/Disabled$/] }, // icon calendar Read-Only = Disabled đặt trong DateField.tsx
  'Input/Number-Align-Left': { fn: numberFieldStyles, map: (p) => (p.pressed ? null : { ...p, align: 'Left' }), ignore: [SLOT_ICON, BUTTON_SLOT, /^Stepper-Control\/Background\/Default$|^effect#|BACKGROUND_BLUR|INNER_SHADOW|^Effect\/Input$|Border\/Active\/Neutral\/Subtle$|^Color\/Content\/Disabled$|Content\/(Placeholder|Neutral\/Strongest)$|^Caption\/Regular$|Neutral\/Light$|^Stepper-Control-Align-Left\/Spacing\/Large\/Vertical-Padding$|Border\/Disabled$/] }, // nút ± = slot; Read-Only fill Figma không bind; Large trên/dưới bind Horizontal-Padding-Left (NỢ FIGMA F44)
  'Input/Number-Align-Center': { fn: numberFieldStyles, map: (p) => (p.pressed ? null : { ...p, align: 'Center' }), ignore: [SLOT_ICON, BUTTON_SLOT, /^Stepper-Control-Align-Center\/Spacing\/Large\/Vertical-Padding$|Border\/Disabled$|^Stepper-Control\/Background\/Default$|^effect#|BACKGROUND_BLUR|INNER_SHADOW|^Effect\/Input$|Border\/Active\/Neutral\/Subtle$|^Color\/Content\/Disabled$|Content\/(Placeholder|Neutral\/Strongest)$|^Caption\/Regular$|Neutral\/Light$/] }, // Large trên/dưới bind Horizontal-Padding (NỢ FIGMA F48)
  'Input/Field-Group': { fn: fieldGroupStyles, map: (p) => ({ size: p.size === 'Medium' ? 'Medium (Base)' : p.size }), ignore: [/^Spacing\/Gap\/2XSmall$|^Corner-Radius\/Large$|^Corner-Radius\/Input\/Large$|Outside-Field-Gap$/] }, // Outside-Field-Gap bind XLarge cho mọi Size (NỢ FIGMA F45); Corner-Radius/Large|Input/Large thừa ở XLarge/Medium
  '.Primitives/Date-Picker/Day': { fn: dayCellStyles, map: (p) => (p.state === 'Pressed' ? null : { size: p.size, pressed: /Hover/.test(String(p.state)), today: /Today/.test(String(p.state)), selected: /^(Selected|Range-(Start|End))/.test(String(p.state)), rangeEdge: /Range-Start/.test(String(p.state)) ? 'start' : /Range-End/.test(String(p.state)) ? 'end' : undefined, inRange: /Range-Middle/.test(String(p.state)), disabled: p.state === 'Disabled', outside: p.state === 'Outside' }), ignore: [/^Button\/Size\/|Accent\/Solid\/Default$/] }, // cỡ ô Figma số cứng (NỢ FIGMA F47); Pressed → RN pressed = Hover token; Accent/Solid = Dot (dayDotStyles)
  '.Primitives/Date-Picker/Week-Labels': { fn: weekLabelStyles, ignore: [/^Button\/Size\//] },
  '.Primitives/Date-Picker/Month-header': { fn: monthHeaderStyles, map: (p) => ({ align: p.align, size: p.size }), ignore: [SLOT_ICON, BUTTON_SLOT, /^Button\/|^Button-|^Corner-Radius\/|Neutral\/(Flat\/Default|Strongest)$/] }, // tiêu đề = Button Flat Small, ‹ › = IconButton Tertiary XSmall
  '.Primitives/Date-Picker/Wheel-Item': { fn: wheelItemStyles, map: (p) => ({ active: p.active === 'On' }), ignore: [/^Button\/Size\//] },
  '.Primitives/Date-Picker/Wheel': { fn: wheelStyles, map: () => ({}), ignore: [/^Scale\/9999$|^Corner-Radius\/Rounded$|^Button\/Size\/|^Heading\/4$|Content\/(Disabled|Accent\/Strongest)$|^Effect\/Overlay$/] }, // item = Wheel-Item; Effect/Overlay = lớp fade svg
  'Radio-Button/Radio-Button': { fn: controlRowStyles, map: (p) => ({ kind: 'Radio', side: p['radio-Side'], disabled: p.disabled }), ignore: [SLOT_ICON, CHECK_SLOT, /Icon-Check|Fill\/Disabled|Border\/Disabled|^Radio-Button\/|^Spacing\/Gap\/(XSmall|2XSmall)$/], extraOk: true },
};

// Token Figma không phải việc của styles fn (ảnh, slot con là component khác, wrapper text nội bộ).
const GLOBAL_IGNORE = [/^IMAGE$|^GRADIENT|^remote:|^mixed$|^#|^\?$/, /Text-Wrapper-Padding|Minimum-Padding|Customized-Padding/, /^Image-Size\//, /^Color\/Border\/Inverse$/];

const KNOWN = new Set<string>();
for (const m of [themeLight, componentNeutralLight, spacing, radius, size, breakpoints, textStyles, effects, globalDimensions, emphasis]) for (const k of Object.keys(m)) KNOWN.add(k);

function record(fn: Fn, args: object): Set<string> {
  const base = createTheme({ scheme: 'light' });
  // Ghi (key → giá trị) mọi getter được gọi; chỉ giữ key có giá trị XUẤT HIỆN trong object trả về
  // (styles fn hay dựng bảng eager cho mọi state → getter gọi thừa, không phải token của variant).
  const calls = new Map<string, unknown>();
  const wrap = <K extends keyof Theme>(k: K) => (key: string) => { const v = (base[k] as (x: string) => unknown)(key); calls.set(key, v); return v; };
  const t = { ...base, color: wrap('color'), component: wrap('component'), space: wrap('space'), radius: wrap('radius'), size: wrap('size'), layout: wrap('layout'), primitive: wrap('primitive'), weight: wrap('weight'), text: wrap('text'), shadow: wrap('shadow') } as unknown as Theme;
  const used = new Set<string>();
  let out: unknown;
  try { out = fn(t, args as never); } catch (e) { used.add(`LỖI: ${(e as Error).message}`); return used; }
  const leaves = new Set<unknown>();
  const ARGS: unknown[] = [false, true, 'Default', 'Focused', 'Passed', 'Error'];
  const scan = (v: unknown, depth = 0) => {
    if (depth > 5 || v === null || v === undefined) return;
    if (typeof v === 'string') { leaves.add(v); if (KNOWN.has(v)) used.add(v); return; }
    if (typeof v === 'number') { leaves.add(v); return; }
    if (typeof v === 'function') { for (const a of ARGS) { try { scan((v as (...x: unknown[]) => unknown)(a), depth + 1); } catch { /* fn cần args khác */ } } return; }
    if (typeof v === 'object') for (const x of Object.values(v as object)) scan(x, depth + 1);
  };
  scan(out);
  for (const [key, v] of calls) {
    if (typeof v === 'string' || typeof v === 'number') { if (leaves.has(v)) used.add(key); continue; }
    if (v && typeof v === 'object') { const vals = Object.values(v as object).filter((x) => typeof x !== 'object'); if (vals.length && vals.every((x) => leaves.has(x))) used.add(key); }
  }
  return used;
}

const figmaTokens = (list: string[]) => new Set(list.map((s) => s.slice(s.indexOf(':') + 1)));

describe('Figma parity', () => {
  const dir = join(__dirname, 'figma');
  const dumps: Dump = {};
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const raw = JSON.parse(readFileSync(join(dir, f), 'utf8')) as RawDump;
    for (const [set, d] of Object.entries(raw)) {
      const target = (dumps[set] ??= { variants: {} });
      for (const [v, delta] of Object.entries(d.variants)) target.variants[v] = [...d.common, ...delta];
    }
  }
  const report: string[] = [];
  let bad = 0;
  for (const [set, d] of Object.entries(dumps)) {
    const cfg = CONFIG[set];
    if (!cfg) { report.push(`## ${set}: CHƯA CẤU HÌNH`); continue; }
    const ignore = [...GLOBAL_IGNORE, ...(cfg.ignore ?? [])];
    const groups = new Map<string, string[]>();
    for (const [variant, delta] of Object.entries(d.variants)) {
      const p = parse(variant);
      if (!p) continue;
      const args = cfg.map ? cfg.map(p) : p;
      if (!args) continue;
      const fig = new Set([...figmaTokens(delta)].filter((x) => !ignore.some((re) => re.test(x))));
      const code = new Set([...record(cfg.fn, args)].filter((x) => !ignore.some((re) => re.test(x))));
      const missing = [...fig].filter((x) => !code.has(x));
      const extra = cfg.extraOk ? [] : [...code].filter((x) => !fig.has(x));
      if (!missing.length && !extra.length) continue;
      const key = `  − ${missing.join(', ') || '∅'}\n  + ${extra.join(', ') || '∅'}`;
      groups.set(key, [...(groups.get(key) ?? []), variant]);
    }
    if (!groups.size) { report.push(`## ${set}: OK`); continue; }
    report.push(`## ${set}`);
    for (const [key, vs] of groups) { bad += vs.length; report.push(`${vs.join(' | ')}\n${key}`); }
  }
  // eslint-disable-next-line no-console
  console.log(report.join('\n'));
  it('mọi variant Figma đã dump khớp token code (ngoài ignore có chú thích)', () => { expect(bad).toBe(0); });
});
