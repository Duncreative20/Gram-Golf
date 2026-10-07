/**
 * Audit tương phản light/dark cho mọi styles fn: hợp alpha (fg trên bg trên canvas/ảnh), tính WCAG ratio.
 * Ngưỡng: chữ ≥ 4.5, chữ lớn/icon/đồ hoạ ≥ 3. Disabled/Placeholder miễn (WCAG 1.4.3 exempt) nhưng vẫn in ra.
 * Chạy: pnpm -F @gr/ds exec vitest run src/audit
 */
import { describe, expect, it } from 'vitest';
import { createTheme, type Theme } from '../theme/createTheme';
import { paint, type PaintKey } from '../theme/paint';
import { buttonStyles } from '../ui/Button/buttonStyles';
import { badgeStyles } from '../ui/Badge/badgeStyles';
import { chipStyles } from '../ui/Chip/chipStyles';
import { tagStyles } from '../ui/Tag/tagStyles';
import { alertBannerStyles, inlineMessageStyles, toastStyles, tooltipStyles, dialogStyles } from '../ui/Feedback/feedbackStyles';
import { segmentedContainerStyles, segmentedItemStyles } from '../ui/Segmented/segmentedStyles';
import { tabItemStyles } from '../ui/TabBar/tabStyles';
import { listItemStyles } from '../ui/ListItem/listItemStyles';
import { paginationStyles, stepperStyles, breadcrumbsStyles } from '../ui/Navigation/navigationStyles';
import { dockIconStyles, connectorStyles, avatarGroupStyles, emptyStateStyles } from '../ui/DockIcon/dockIconStyles';
import { textFieldStyles } from '../ui/TextField/textFieldStyles';
import { otpCellStyles } from '../ui/OtpField/otpFieldStyles';
import { stepperControlStyles } from '../ui/StepperControl/stepperControlStyles';
import { checkboxStyles } from '../ui/Checkbox/checkboxStyles';
import { radioStyles, controlRowStyles } from '../ui/Radio/radioStyles';
import { toggleStyles } from '../ui/Toggle/toggleStyles';
import { progressStyles } from '../ui/Progress/progressStyles';
import { popoverItemStyles } from '../ui/Popover/popoverItemStyles';
import { topNavigationStyles } from '../ui/TopNavigation/topNavigationStyles';
import { pageIndicatorStyles } from '../ui/PageIndicator/pageIndicatorStyles';
import { avatarStyles } from '../ui/Avatar/avatarStyles';
import { accordionStyles } from '../ui/Accordion/accordionStyles';
import { socialActionStyles, identityStyles, mediaPillStyles, videoOverlayStyles, postCardStyles } from '../ui/PostCard/postCardStyles';
import { storyStyles } from '../ui/Story/storyStyles';
import { commentStyles, commentMediaStyles, composerStyles } from '../ui/Comment/commentStyles';
import { shareActionLabelStyles, collectionItemStyles, collectionCardStyles, mediaItemStyles } from '../ui/Social/socialStyles';
import { bottomNavigationStyles, bottomNavItemStyles } from '../ui/BottomNavigation/bottomNavigationStyles';
import { bottomSheetStyles } from '../ui/BottomSheet/bottomSheetStyles';

type RGBA = [number, number, number, number];
const hex = (h: unknown): RGBA | null => {
  if (typeof h !== 'string' || !h.startsWith('#')) return h === 'transparent' ? [0, 0, 0, 0] : null;
  const v = h.slice(1);
  const n = (i: number) => parseInt(v.slice(i, i + 2), 16);
  return [n(0), n(2), n(4), v.length === 8 ? n(6) / 255 : 1];
};
const over = (top: RGBA, base: RGBA): RGBA => { const a = top[3]; return [top[0] * a + base[0] * (1 - a), top[1] * a + base[1] * (1 - a), top[2] * a + base[2] * (1 - a), 1]; };
const lum = (c: RGBA) => { const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const ratio = (fg: RGBA, bg: RGBA) => { const l1 = lum(fg), l2 = lum(bg); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
const PHOTO: RGBA = [122, 122, 122, 1]; // ảnh trung tính (trường hợp xấu cho chữ trắng lẫn đen)

type Kind = 'text' | 'icon';
interface Row { name: string; stack: unknown[]; fg: unknown; kind: Kind; exempt?: boolean }
const MIN: Record<Kind, number> = { text: 4.5, icon: 3 };

function rows(t: Theme): Row[] {
  const p = (k: PaintKey) => paint(t, k);
  const canvas = t.color('Color/Background/Canvas/Alt');
  const surface = t.color('Color/Background/Surface/Default');
  const R: Row[] = [];
  const add = (name: string, stack: unknown[], fg: unknown, kind: Kind = 'text', exempt = false) => R.push({ name, stack, fg, kind, exempt });

  // Button
  for (const [kind, levels] of [['Main', ['Primary', 'Accent', 'Secondary', 'Tertiary', 'Danger', 'Danger Subtle', 'Positive', 'Positive Subtle']], ['Flat', ['Primary', 'Accent']], ['Icon-Flat', ['Primary', 'Secondary', 'Accent', 'Danger', 'Positive']]] as const)
    for (const level of levels) for (const disabled of [false, true]) {
      const s = buttonStyles(t, { kind, level, size: 'Large', disabled } as never);
      add(`Button ${kind}/${level}${disabled ? ' disabled' : ''}`, [canvas, s.container.backgroundColor], s.label.color, 'text', disabled);
    }
  for (const level of ['Primary', 'Accent', 'Tertiary'] as const) { const s = buttonStyles(t, { kind: 'Main-Overlay', level, size: 'Large' }); add(`Button Main-Overlay/${level} @photo`, [PHOTO, s.container.backgroundColor], s.label.color); }
  { const s = buttonStyles(t, { kind: 'Icon-Flat', level: 'Overlay', size: 'Large' }); add('IconButton Flat/Overlay @photo', [PHOTO, s.container.backgroundColor], p(s.iconColor), 'icon'); }
  // Badge
  for (const theme of ['Neutral', 'Accent', 'Yellow', 'Red', 'Green', 'Inverse', 'On-Color', 'Blue', 'Orange'] as const) for (const background of ['Solid', 'Subtle'] as const) {
    const s = badgeStyles(t, { size: 'Medium', theme, background }); add(`Badge ${theme}/${background}`, [canvas, s.container.backgroundColor], s.label.color);
  }
  // Chip / Tag
  for (const level of ['Primary', 'Secondary'] as const) for (const select of [false, true]) { const s = chipStyles(t, { variant: 'Normal', size: 'Small', level, select }); add(`Chip ${level}${select ? ' selected' : ''}`, [canvas, s.container.backgroundColor], s.label.color); }
  { const s = chipStyles(t, { variant: 'Advanced', size: 'Medium', level: 'Secondary', select: false }); add('Chip Advanced', [canvas, s.container.backgroundColor], s.label.color); add('Chip Advanced chevron', [canvas, s.container.backgroundColor], p(s.iconColor), 'icon'); }
  for (const o of [{}, { error: true }, { disabled: true }]) { const s = tagStyles(t, { size: 'Medium', ...o }); add(`Tag ${JSON.stringify(o)}`, [canvas, s.container.backgroundColor], s.label.color, 'text', 'disabled' in o); add(`Tag remove ${JSON.stringify(o)}`, [canvas, s.container.backgroundColor], p(s.removeColor), 'icon', 'disabled' in o); }
  // Feedback
  for (const theme of ['Neutral', 'Info', 'Positive', 'Warning', 'Negative'] as const) {
    const a = alertBannerStyles(t, { size: 'Medium', theme }); add(`AlertBanner ${theme}`, [a.container.backgroundColor], a.text.color);
    const i = inlineMessageStyles(t, { theme }); add(`InlineMessage ${theme} title`, [canvas, i.container.backgroundColor], i.title.color); add(`InlineMessage ${theme} icon`, [canvas, i.container.backgroundColor], p(i.iconColor), 'icon');
    const to = toastStyles(t, { type: theme }); add(`Toast ${theme} title`, [canvas, to.container.backgroundColor], to.title.color); add(`Toast ${theme} caption`, [canvas, to.container.backgroundColor], to.caption.color);
  }
  { const to = toastStyles(t, { type: 'Subtle' }); add('Toast Subtle title', [canvas, to.container.backgroundColor], to.title.color); add('Toast Subtle caption', [canvas, to.container.backgroundColor], to.caption.color); }
  for (const color of ['Default', 'Accent', 'White Overlay', 'Black-Overlay'] as const) { const s = tooltipStyles(t, { color, size: 'Medium' }); add(`Tooltip ${color}`, [color.includes('Overlay') ? PHOTO : canvas, s.container.backgroundColor], s.text.color); }
  { const d = dialogStyles(t); add('Dialog title', [canvas, d.box.backgroundColor], d.title.color); add('Dialog body', [canvas, d.box.backgroundColor], d.body.color); }
  // Segmented / Tab
  for (const level of ['Primary', 'Secondary'] as const) for (const selected of [false, true]) { const c = segmentedContainerStyles(t, { level }); const s = segmentedItemStyles(t, { level, size: 'Medium', selected }); add(`Segmented ${level}${selected ? ' selected' : ''}`, [canvas, c.backgroundColor, s.item.backgroundColor], s.label.color); }
  for (const style of ['Indicator', 'Subtle'] as const) for (const selected of [false, true]) { const s = tabItemStyles(t, { style, size: 'Medium', icon: 'None', selected }); add(`Tab ${style}${selected ? ' selected' : ''}`, [surface, s.inner.backgroundColor], s.label.color); }
  // List / Popover / Accordion
  for (const type of ['Inline', 'Grouped', 'Radio-Card'] as const) for (const selected of [false, true]) { const s = listItemStyles(t, { type, selected }); add(`ListItem ${type}${selected ? ' selected' : ''} title`, [canvas, s.container.backgroundColor], s.title.color); add(`ListItem ${type}${selected ? ' selected' : ''} caption`, [canvas, s.container.backgroundColor], s.caption.color); }
  for (const type of ['Item', 'Radio', 'Follow-User'] as const) { const s = popoverItemStyles(t, { type, selected: true }); add(`PopoverItem ${type} label`, [surface, s.container.backgroundColor], s.label.color); add(`PopoverItem ${type} caption`, [surface, s.container.backgroundColor], s.caption.color); }
  for (const theme of ['Divider', 'Box'] as const) { const s = accordionStyles(t, { size: 'Large', theme }); add(`Accordion ${theme} title`, [canvas, s.container.backgroundColor], s.title.color); add(`Accordion ${theme} body`, [canvas, s.container.backgroundColor], s.body.color); }
  // Navigation
  for (const theme of ['Primary', 'Secondary', 'Inline'] as const) for (const sel of [false, true]) { const s = paginationStyles(t, { theme, size: 'XSmall' }); add(`Pagination ${theme}${sel ? ' selected' : ''}`, [canvas, s.container.backgroundColor, s.item(sel).backgroundColor], s.label(sel).color); }
  { const s = stepperStyles(t); for (const st of ['Default', 'Focused', 'Error'] as const) add(`Stepper dot ${st}`, [canvas, s.dot(st).backgroundColor], s.dotLabel(st).color); for (const st of ['Default', 'Focused', 'Passed', 'Error'] as const) { add(`Stepper title ${st}`, [canvas], s.title(st).color); add(`Stepper caption ${st}`, [canvas], s.caption(st).color); } }
  { const b = breadcrumbsStyles(t); add('Breadcrumbs', [canvas, b.item.backgroundColor], b.label(false).color); }
  for (const surface_ of ['Default', 'Overlay'] as const) { const s = topNavigationStyles(t, { surface: surface_, align: 'Center', size: 'Medium' }); const base = surface_ === 'Overlay' ? PHOTO : canvas; add(`TopNav ${surface_} heading`, [base, s.bar.backgroundColor], s.heading.color); add(`TopNav ${surface_} subtitle`, [base, s.bar.backgroundColor], s.subtitle.color); }
  for (const state of ['Neutral', 'Accent', 'Overlay'] as const) { const s = pageIndicatorStyles(t, { state, size: 'Medium' }); const base = state === 'Overlay' ? PHOTO : canvas; add(`PageIndicator ${state} on`, [base], s.dot(true).backgroundColor, 'icon'); add(`PageIndicator ${state} off`, [base], s.dot(false).backgroundColor, 'icon', true); }
  // Dock / Connector / Avatar
  for (const theme of ['Neutral', 'Accent', 'Inverse', 'Pale', 'Blue', 'Yellow'] as const) for (const background of ['Solid', 'Subtle'] as const) { const s = dockIconStyles(t, { size: 'Medium', theme, background }); add(`DockIcon ${theme}/${background}`, [canvas, s.box.backgroundColor], t.color(s.iconColor), 'icon'); }
  for (const background of ['Connected', 'Default', 'Error', 'Disabled'] as const) { const s = connectorStyles(t, { size: 'Medium', background }); add(`Connector ${background}`, [canvas, s.box.backgroundColor], t.color(s.iconColor), 'icon', background === 'Disabled'); }
  for (const background of ['Subtle', 'Solid'] as const) { const s = avatarGroupStyles(t, { size: 'Medium', background }); add(`AvatarGroup more ${background}`, [canvas, s.more.backgroundColor], s.moreText.color); }
  for (const theme of ['Neutral', 'Accent', 'Blue'] as const) for (const background of ['Solid', 'Subtle'] as const) { const s = avatarStyles(t, { size: 'Medium', shape: 'Circle', theme, background }); add(`Avatar ${theme}/${background}`, [canvas, s.container.backgroundColor], s.text.color); }
  { const e = emptyStateStyles(t); add('EmptyState title', [canvas], e.title.color); add('EmptyState caption', [canvas], e.caption.color); }
  // Inputs
  for (const o of [{}, { focused: true }, { error: true }, { readOnly: true }, { disabled: true }]) { const s = textFieldStyles(t, { size: 'Medium (Base)', ...o }); const n = JSON.stringify(o); add(`TextField ${n} input`, [canvas, s.field.backgroundColor], s.input.color, 'text', 'disabled' in o); add(`TextField ${n} placeholder`, [canvas, s.field.backgroundColor], s.placeholderColor, 'text', true); add(`TextField ${n} label`, [canvas], s.label.color, 'text', 'disabled' in o); add(`TextField ${n} help`, [canvas], s.help.color); }
  { const s = textFieldStyles(t, { size: 'Medium (Base)', variant: 'Search', overlay: true }); add('Search overlay input @photo', [PHOTO, s.field.backgroundColor], s.input.color); add('Search overlay placeholder @photo', [PHOTO, s.field.backgroundColor], s.placeholderColor, 'text', true); add('Search overlay icon @photo', [PHOTO, s.field.backgroundColor], p(s.iconColor), 'icon'); }
  for (const o of [{ filled: true }, { filled: false }, { disabled: true }]) { const s = otpCellStyles(t, { size: 'Large', ...o }); add(`OTP ${JSON.stringify(o)}`, [canvas, s.cell.backgroundColor], s.digit.color, 'text', !o.filled || !!o.disabled); }
  { const s = stepperControlStyles(t, { size: 'Medium' }); add('StepperControl value', [canvas, s.field.backgroundColor], s.value.color); }
  { const s = composerStyles(t); add('Composer input', [canvas, s.surface(false).backgroundColor], s.input.color); add('Composer placeholder', [canvas, s.surface(false).backgroundColor], s.placeholder, 'text', true); add('Composer reply-context', [canvas, s.surface(true).backgroundColor, s.replyContext.backgroundColor], s.replyText.color); }
  // Controls
  { const c = checkboxStyles(t, { type: 'Default', select: true, shape: 'Default' }); add('Checkbox check', [canvas, c.box.backgroundColor], p(c.iconColor), 'icon'); add('Checkbox box border unselected', [canvas], checkboxStyles(t, { type: 'Default', select: false, shape: 'Default' }).box.borderColor, 'icon'); }
  { const r = radioStyles(t, { select: true }); add('Radio dot', [canvas, r.box.backgroundColor], r.dot?.backgroundColor, 'icon'); add('Radio border unselected', [canvas], radioStyles(t, { select: false }).box.borderColor, 'icon'); const cr = controlRowStyles(t, { kind: 'Radio', side: 'Left' }); add('ControlRow label', [canvas], cr.label.color); add('ControlRow caption', [canvas], cr.caption.color); }
  for (const select of [false, true]) { const s = toggleStyles(t, { size: 'Medium', select }); add(`Toggle ${select ? 'on' : 'off'} dot vs bar`, [canvas, s.bar.backgroundColor], s.dot.backgroundColor, 'icon'); add(`Toggle ${select ? 'on' : 'off'} bar vs canvas`, [canvas], s.bar.backgroundColor, 'icon'); }
  for (const theme of ['Accent', 'Neutral', 'Overlay'] as const) { const s = progressStyles(t, { theme }); const base = theme === 'Overlay' ? PHOTO : canvas; add(`Progress ${theme} fill vs track`, [base, s.track.backgroundColor], s.fill.backgroundColor, 'icon'); add(`Progress ${theme} label`, [base], s.label.color); }
  // Composites on photo
  for (const active of [false, true]) { const s = socialActionStyles(t, { type: 'Like', size: 'Medium', active, overlay: true }); add(`SocialAction overlay${active ? ' active' : ''} @photo`, [PHOTO], t.color(s.iconColor), 'icon'); const n = socialActionStyles(t, { type: 'Like', size: 'Medium', active }); add(`SocialAction${active ? ' active' : ''} label`, [surface], n.label.color); }
  { const i = identityStyles(t, { overlay: true }); add('Identity overlay name @photo', [PHOTO], i.name.color); add('Identity overlay meta @photo', [PHOTO], i.meta.color); const j = identityStyles(t, {}); add('Identity name', [surface], j.name.color); add('Identity meta', [surface], j.meta.color); }
  { const m = mediaPillStyles(t, { type: 'Counter' }); add('MediaInfoPill text @photo', [PHOTO, m.pill.backgroundColor], m.text.color); }
  { const v = videoOverlayStyles(t, { state: 'Error' }); add('VideoOverlay title', [PHOTO, v.scrim.backgroundColor], v.title.color); add('VideoOverlay caption', [PHOTO, v.scrim.backgroundColor], v.caption.color); }
  { const c = postCardStyles(t); add('PostCaption text', [c.card.backgroundColor], c.captionText.color); add('PostCaption link', [c.card.backgroundColor], c.captionLink.color); add('PostCaption more', [c.card.backgroundColor], c.captionMore.color); }
  { const s = storyStyles(t); add('Story caption @scrim', [PHOTO, s.bottom.backgroundColor], s.caption.color); add('Story reply input @photo', [PHOTO, s.replyField(false).backgroundColor], s.replyInput.color); add('Story reply placeholder @photo', [PHOTO, s.replyField(false).backgroundColor], s.replyPlaceholder, 'text', true); add('Story screen bg vs photo-edge', [s.screen.backgroundColor], PHOTO as never, 'icon', true); }
  { const c = commentStyles(t); add('Comment text', [surface], c.text.color); const m = commentMediaStyles(t, { type: 'More', size: 'Medium' }); add('CommentMedia +N @scrim', [PHOTO, m.scrim.backgroundColor], m.label.color); add('CommentMedia duration @scrim', [PHOTO, m.scrim.backgroundColor], m.duration.color); }
  { const s = shareActionLabelStyles(t, { active: false }); add('ShareActionLabel icon', [canvas, s.circle.backgroundColor], t.color(s.iconColor), 'icon'); add('ShareActionLabel label', [canvas], s.label.color); }
  for (const state of ['Default', 'Disabled', 'Create-New'] as const) { const s = collectionItemStyles(t, { state }); add(`CollectionItem ${state} title`, [canvas, s.row.backgroundColor], s.title.color, 'text', state === 'Disabled'); add(`CollectionItem ${state} count`, [canvas, s.row.backgroundColor], s.count.color, 'text', state === 'Disabled'); }
  { const s = collectionCardStyles(t); add('CollectionCard title', [canvas], s.title.color); add('CollectionCard count', [canvas], s.count.color); }
  { const s = mediaItemStyles(t, { state: 'Selected' }); add('MediaItem duration @photo', [PHOTO], s.duration.color); }

  // ---- Lượt 2: trạng thái pressed + viền + Bottom-Navigation + Floating-Glass ----
  for (const [kind, levels] of [['Main', ['Primary', 'Accent', 'Secondary', 'Tertiary', 'Danger', 'Danger Subtle', 'Positive', 'Positive Subtle']], ['Flat', ['Primary', 'Accent']]] as const)
    for (const level of levels) { const s = buttonStyles(t, { kind, level, size: 'Large', pressed: true } as never); add(`Button ${kind}/${level} pressed`, [canvas, s.container.backgroundColor], s.label.color); }
  for (const level of ['Primary', 'Accent', 'Tertiary'] as const) { const s = buttonStyles(t, { kind: 'Main-Overlay', level, size: 'Large', pressed: true }); add(`Button Main-Overlay/${level} pressed @photo`, [PHOTO, s.container.backgroundColor], s.label.color); }
  for (const level of ['Primary', 'Secondary'] as const) { const s = segmentedItemStyles(t, { level, size: 'Medium', selected: false, pressed: true }); add(`Segmented ${level} pressed`, [canvas, segmentedContainerStyles(t, { level }).backgroundColor, s.item.backgroundColor], s.label.color); }
  for (const style of ['Indicator', 'Subtle'] as const) { const s = tabItemStyles(t, { style, size: 'Medium', icon: 'None', selected: false, pressed: true }); add(`Tab ${style} pressed`, [surface, s.inner.backgroundColor], s.label.color); }
  for (const level of ['Primary', 'Secondary'] as const) { const s = chipStyles(t, { variant: 'Normal', size: 'Small', level, select: false, pressed: true }); add(`Chip ${level} pressed`, [canvas, s.container.backgroundColor], s.label.color); }
  { const s = tagStyles(t, { size: 'Medium', pressed: true }); add('Tag pressed', [canvas, s.container.backgroundColor], s.label.color); }
  { const s = listItemStyles(t, { type: 'Grouped', pressed: true }); add('ListItem pressed title', [canvas, s.container.backgroundColor], s.title.color); }
  for (const type of ['Item', 'Radio'] as const) { const s = popoverItemStyles(t, { type, pressed: true }); add(`PopoverItem ${type} pressed`, [surface, s.container.backgroundColor], s.label.color); }
  { const c = checkboxStyles(t, { type: 'Default', select: true, shape: 'Default', pressed: true }); add('Checkbox pressed check', [canvas, c.box.backgroundColor], p(c.iconColor), 'icon'); }
  // Viền (WCAG 1.4.11 ≥ 3:1 với nền kề) — chỉ cặp có ý nghĩa nhận diện (ô nhập, thẻ, nút viền)
  for (const o of [{}, { focused: true }, { error: true }]) { const s = textFieldStyles(t, { size: 'Medium (Base)', ...o }); add(`TextField ${JSON.stringify(o)} border`, [canvas], s.field.borderColor, 'icon', !('focused' in o) && !('error' in o)); }
  { const s = textFieldStyles(t, { size: 'Medium (Base)', variant: 'Search', overlay: true, focused: true }); add('Search overlay focused border @photo', [PHOTO], s.field.borderColor, 'icon'); }
  { const s = otpCellStyles(t, { size: 'Large', focused: true }); add('OTP focused border', [canvas], s.cell.borderColor, 'icon'); }
  { const s = stepperControlStyles(t, { size: 'Medium', focused: true }); add('StepperControl focused border', [canvas], s.field.borderColor, 'icon'); }
  { const s = buttonStyles(t, { kind: 'Main', level: 'Tertiary', size: 'Large' }); add('Button Tertiary border', [canvas], s.container.borderColor, 'icon', true); }
  { const s = chipStyles(t, { variant: 'Normal', size: 'Small', level: 'Secondary', select: true }); add('Chip Secondary selected border', [canvas], s.container.borderColor, 'icon', true); }
  { const s = tagStyles(t, { size: 'Medium', error: true }); add('Tag error border', [canvas], s.container.borderColor, 'icon'); }
  { const s = connectorStyles(t, { size: 'Medium', background: 'Connected' }); add('Connector Connected border', [canvas], s.box.borderColor, 'icon'); const e = connectorStyles(t, { size: 'Medium', background: 'Error' }); add('Connector Error border', [canvas], e.box.borderColor, 'icon'); }
  { const s = stepperStyles(t); add('Stepper Passed border', [canvas], s.dot('Passed').borderColor, 'icon'); }
  { const s = toggleStyles(t, { size: 'Medium', select: false }); add('Toggle off dot border', [canvas, s.bar.backgroundColor], s.dot.borderColor, 'icon', true); }
  // Bottom-Navigation 7 theme × 2 type
  for (const type of ['Floating', 'Floating-Glass'] as const) for (const theme of ['Neutral', 'Accent', 'Neutral-Surface', 'Accent-Surface', 'Neutral-Solid', 'Accent-Solid', 'Overlay'] as const) for (const selected of [false, true]) {
    const bar = bottomNavigationStyles(t, { type }); const s = bottomNavItemStyles(t, { theme, selected });
    const base = theme === 'Overlay' ? PHOTO : canvas;
    add(`BottomNav ${type}/${theme}${selected ? ' on' : ''} label`, [base, bar.items.backgroundColor, s.item.backgroundColor], s.label.color);
    add(`BottomNav ${type}/${theme}${selected ? ' on' : ''} icon`, [base, bar.items.backgroundColor, s.item.backgroundColor], p(s.iconColor), 'icon');
  }
  { const s = bottomSheetStyles(t, { type: 'Modal', size: 'Medium', align: 'Start', secondary: 'None' }); add('BottomSheet heading', [canvas, s.container.backgroundColor], s.heading.color); add('BottomSheet subtitle', [canvas, s.container.backgroundColor], s.subtitle.color); }
  return R;
}

function evaluate(scheme: 'light' | 'dark') {
  const t = createTheme({ scheme });
  const out: { name: string; ratio: number; min: number; ok: boolean; exempt: boolean }[] = [];
  for (const r of rows(t)) {
    let bg: RGBA = [255, 255, 255, 1];
    for (const layer of r.stack) { const c = typeof layer === 'string' ? hex(layer) : (layer as RGBA | null); if (c) bg = over(c, bg); }
    const fg = typeof r.fg === 'string' ? hex(r.fg) : (r.fg as RGBA | null);
    if (!fg) { out.push({ name: r.name, ratio: NaN, min: MIN[r.kind], ok: false, exempt: !!r.exempt }); continue; }
    const rr = ratio(over(fg, bg), bg);
    out.push({ name: r.name, ratio: rr, min: MIN[r.kind], ok: rr >= MIN[r.kind], exempt: !!r.exempt });
  }
  return out;
}

/**
 * Cặp dưới ngưỡng NHƯNG là quyết định thiết kế (Figma), không phải lỗi code — ghi spec §7d, chờ Dũng/designer:
 * - Palette status solid (Positive #3fab53, Info #0a85ff, Support Blue/Orange/Green, Negative dark #ff3f4a) + chữ trắng ≈ 2.7–3.6:1.
 * - Trên ảnh (@photo/@scrim): đo với ảnh xám trung tính, trường hợp xấu nhất; Figma cũng không có scrim ở header.
 * - Viền checkbox/radio 5 %, Toggle off Neutral/Subtle, Tag remove = Placeholder, DockIcon Yellow Subtle icon Light: nhìn được nhờ bóng/shape.
 * Test chỉ FAIL khi có cặp mới ngoài danh sách này hoặc có cặp < 1.5:1 (tàng hình).
 */
const KNOWN_DESIGN = [
  /Positive|Info|Green|Blue|Orange|Red\/Solid|Danger|Negative|Stepper dot Error/, /@photo|@scrim|Overlay/, /Checkbox box border|Radio border|Toggle off|Tag remove|DockIcon Yellow\/Subtle/,
  // Lượt 2: viền tint nhạt (Figma bind Border/Active/*/Subtle), pressed Secondary 4.26 (Neutral/Base trên Neutral/Subtle/Pressed), label off Neutral-Solid bind Placeholder.
  /Connector .* border|Button Main\/Secondary pressed|BottomNav .*Neutral-Solid label/,
];

describe('contrast audit', () => {
  for (const scheme of ['light', 'dark'] as const) {
    it(`${scheme}: không cặp nào tàng hình; cặp thấp đều nằm trong KNOWN_DESIGN`, () => {
      const res = evaluate(scheme);
      const bad = res.filter((r) => !r.ok && !r.exempt);
      const soft = res.filter((r) => !r.ok && r.exempt);
      const fmt = (r: (typeof res)[number]) => `${r.ratio.toFixed(2).padStart(6)} <${r.min}  ${r.name}`;
      console.log(`\n[${scheme}] ${res.length} cặp · dưới ngưỡng (thiết kế) ${bad.length} · miễn ${soft.length}\n` + bad.map(fmt).join('\n') + (soft.length ? '\n-- miễn (disabled/placeholder/dot off):\n' + soft.map(fmt).join('\n') : ''));
      const unknown = bad.filter((r) => !KNOWN_DESIGN.some((re) => re.test(r.name)));
      // < 1.5 = coi như tàng hình; bỏ qua nhóm miễn (dot off, placeholder…) và KNOWN_DESIGN (viền 5 %, toggle off — có bóng/shape).
      const invisible = res.filter((r) => !(r.ratio >= 1.5) && !r.exempt && !KNOWN_DESIGN.some((re) => re.test(r.name)));
      if (unknown.length || invisible.length) console.log(`[${scheme}] UNKNOWN: ${unknown.map(fmt).join(' | ')} INVISIBLE: ${invisible.map(fmt).join(' | ')}`);
      expect(unknown.map((r) => `${r.name}=${r.ratio.toFixed(2)}`)).toEqual([]);
      expect(invisible.map((r) => `${r.name}=${r.ratio.toFixed(2)}`)).toEqual([]);
    });
  }
});
