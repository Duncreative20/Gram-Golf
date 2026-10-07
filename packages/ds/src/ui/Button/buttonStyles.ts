import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import { paint, type PaintKey } from '../../theme/paint';
import type { EffectsKey, SizeKey } from '../../generated/keys';

/**
 * Figma ❖ Button — 6 set: Button/Main (1026:8312), Button/Flat (1070:18754), Button/Main-Overlay (40012137:978),
 * Button/Icon-Main (205:21062), Button/Icon-Flat (234:43906), Button/Icon-Main-Overlay (40012137:2263).
 * Giá trị prop giữ nguyên Figma (kể cả "Medium (Base)"). Hover/Focused không có trên touch → bỏ.
 */
export type ButtonKind = 'Main' | 'Flat' | 'Main-Overlay' | 'Icon-Main' | 'Icon-Flat' | 'Icon-Main-Overlay';
export type ButtonSize = 'XLarge' | 'Large' | 'Medium (Base)' | 'Small' | 'XSmall';
export type IconButtonSize = 'XLarge' | 'Large' | 'Medium' | 'Small' | 'XSmall' | '2XSmall';
export type MainLevel = 'Primary' | 'Accent' | 'Secondary' | 'Tertiary' | 'Danger' | 'Danger Subtle' | 'Positive' | 'Positive Subtle';
export type FlatLevel = 'Primary' | 'Accent';
export type MainOverlayLevel = 'Primary' | 'Accent' | 'Tertiary';
export type IconMainLevel = 'Primary' | 'Accent' | 'Secondary' | 'Tertiary' | 'Danger' | 'Danger Secondary' | 'Positive' | 'Positive Secondary';
export type IconFlatLevel = 'Primary' | 'Secondary' | 'Accent' | 'Danger' | 'Positive' | 'Overlay';
export type IconMainOverlayLevel = 'Primary' | 'Accent' | 'Liquid Glass';
export type ButtonLevel = MainLevel | FlatLevel | MainOverlayLevel | IconMainLevel | IconFlatLevel | IconMainOverlayLevel;

type State = 'Default' | 'Pressed' | 'Disabled';
interface Palette {
  bg: Record<State, PaintKey>;
  content: Record<State, PaintKey>;
  border?: { Default: PaintKey; Disabled?: PaintKey };
  shadow?: EffectsKey;
  /** Figma: Icon-Main/Icon-Main-Overlay và Main-Overlay Primary giữ shadow khi Pressed; Main/Flat/Accent-Overlay chỉ Default (parity §7e). */
  shadowPressed?: boolean;
}
const P = (bg: Palette['bg'], content: Palette['content'], extra?: Pick<Palette, 'border' | 'shadow' | 'shadowPressed'>): Palette => ({ bg, content, ...extra });
const DIS = {
  solid: 'Color/Background/Solid-Disabled',
  subtle: 'Color/Background/Subtle-Disabled',
  flat: 'Color/Background/Flat-Disabled',
  inverse: 'Color/Background/Inverse-Disabled',
} as const;
const DIS_CONTENT = 'Color/Content/Disabled';
const DIS_OVERLAY_CONTENT = 'Color/Content/On-Dark-Overlay/Disabled';
// ponytail: Figma bind effect qua biến màu Color/Shadow/Neutral/Light, không lộ tên effect style → chọn Shadow/Action/* (spec §7 Open).
const SHADOW: EffectsKey = 'Shadow/Action/Basic';
const SHADOW_TERTIARY: EffectsKey = 'Shadow/Action/Tertiary';

const MAIN: Record<MainLevel, Palette> = {
  Primary: P(
    { Default: 'Button-Primary/Background/Default', Pressed: 'Button-Primary/Background/Pressed', Disabled: DIS.solid },
    { Default: 'Button-Primary/Content/Default', Pressed: 'Button-Primary/Content/Pressed', Disabled: DIS_CONTENT },
    { shadow: SHADOW },
  ),
  Accent: P(
    { Default: 'Button-Accent/Background/Default', Pressed: 'Button-Accent/Background/Pressed', Disabled: DIS.solid },
    { Default: 'Button-Accent/Content/Default', Pressed: 'Button-Accent/Content/Pressed', Disabled: DIS_CONTENT },
    { shadow: SHADOW },
  ),
  Secondary: P(
    { Default: 'Color/Background/Accent/Subtle/Default', Pressed: 'Color/Background/Accent/Subtle/Pressed', Disabled: DIS.subtle },
    { Default: 'Color/Content/Accent/Base', Pressed: 'Color/Content/Accent/Base', Disabled: DIS_CONTENT },
  ),
  Tertiary: P(
    { Default: 'Button-Tertiary/Background/Default', Pressed: 'Button-Tertiary/Background/Pressed', Disabled: 'Button-Tertiary/Background/Disabled' },
    { Default: 'Button-Tertiary/Content/Default', Pressed: 'Button-Tertiary/Content/Default', Disabled: DIS_CONTENT },
    { border: { Default: 'Button-Tertiary/Border/Default', Disabled: 'Color/Border/Disabled' }, shadow: SHADOW_TERTIARY },
  ),
  Danger: P(
    { Default: 'Color/Background/Negative/Solid/Default', Pressed: 'Color/Background/Negative/Solid/Pressed', Disabled: DIS.solid },
    { Default: 'Color/Content/On-Colors', Pressed: 'Color/Content/On-Colors', Disabled: DIS_CONTENT },
    { shadow: SHADOW },
  ),
  'Danger Subtle': P(
    { Default: 'Color/Background/Negative/Subtle/Default', Pressed: 'Color/Background/Negative/Subtle/Pressed', Disabled: DIS.subtle },
    { Default: 'Color/Content/Negative/Light', Pressed: 'Color/Content/Negative/Base', Disabled: DIS_CONTENT },
  ),
  Positive: P(
    { Default: 'Color/Background/Positive/Solid/Default', Pressed: 'Color/Background/Positive/Solid/Pressed', Disabled: DIS.solid },
    { Default: 'Color/Content/On-Colors', Pressed: 'Color/Content/On-Colors', Disabled: DIS_CONTENT },
    { shadow: SHADOW },
  ),
  'Positive Subtle': P(
    { Default: 'Color/Background/Positive/Subtle/Default', Pressed: 'Color/Background/Positive/Subtle/Pressed', Disabled: DIS.subtle },
    { Default: 'Color/Content/Positive/Light', Pressed: 'Color/Content/Positive/Base', Disabled: DIS_CONTENT },
  ),
};
const FLAT: Record<FlatLevel, Palette> = {
  // Figma: Flat/Primary Disabled giữ nền Flat/Default (không phải Flat-Disabled) → giữ nguyên.
  Primary: P(
    { Default: 'Color/Background/Neutral/Flat/Default', Pressed: 'Color/Background/Neutral/Flat/Pressed', Disabled: 'Color/Background/Neutral/Flat/Default' },
    { Default: 'Color/Content/Neutral/Strongest', Pressed: 'Color/Content/Neutral/Strongest', Disabled: DIS_CONTENT },
  ),
  Accent: P(
    { Default: 'Color/Background/Accent/Flat/Default', Pressed: 'Color/Background/Accent/Flat/Pressed', Disabled: DIS.flat },
    { Default: 'Color/Content/Accent/Base', Pressed: 'Color/Content/Accent/Base', Disabled: DIS_CONTENT },
  ),
};
const MAIN_OVERLAY: Record<MainOverlayLevel, Palette> = {
  Primary: P(
    { Default: 'Button-Primary-Overlay/Background/Default', Pressed: 'Button-Primary-Overlay/Background/Pressed', Disabled: DIS.inverse },
    // Figma bind Button-Primary/Content (đảo theo scheme → dark = chữ tối trên nền trắng mờ) — code lấy *-Overlay/Content (NỢ FIGMA F49)
    { Default: 'Button-Primary-Overlay/Content/Default', Pressed: 'Button-Primary-Overlay/Content/Pressed', Disabled: DIS_OVERLAY_CONTENT },
    { border: { Default: 'Button-Primary-Overlay/Border/Default' }, shadow: SHADOW, shadowPressed: true },
  ),
  Accent: P(
    { Default: 'Button-Accent-Overlay/Background/Default', Pressed: 'Button-Accent-Overlay/Background/Pressed', Disabled: DIS.inverse },
    { Default: 'Button-Accent-Overlay/Content/Default', Pressed: 'Button-Accent-Overlay/Content/Pressed', Disabled: DIS_OVERLAY_CONTENT },
    { shadow: SHADOW },
  ),
  Tertiary: P(
    { Default: 'Button-Tertiary-Overlay/Background/Default', Pressed: 'Button-Tertiary-Overlay/Background/Pressed', Disabled: DIS.inverse },
    { Default: 'Button-Tertiary-Overlay/Content/Default', Pressed: 'Button-Tertiary-Overlay/Content/Default', Disabled: DIS_OVERLAY_CONTENT },
    { border: { Default: 'Button-Tertiary-Overlay/Border/Default' } },
  ),
};
const ICON_MAIN: Record<IconMainLevel, Palette> = {
  Primary: P(MAIN.Primary.bg, { Default: 'Button-Primary/Content/Default', Pressed: 'Button-Primary/Content/Default', Disabled: DIS_CONTENT }, { shadow: SHADOW, shadowPressed: true }),
  Accent: P(MAIN.Accent.bg, { Default: 'Button-Accent/Content/Default', Pressed: 'Button-Accent/Content/Default', Disabled: DIS_CONTENT }, { shadow: SHADOW, shadowPressed: true }),
  Secondary: MAIN.Secondary,
  // Figma Icon-Main Tertiary: shadow Basic (không Tertiary), Disabled không viền (parity §7e).
  Tertiary: { ...MAIN.Tertiary, border: { Default: 'Button-Tertiary/Border/Default' }, shadow: SHADOW },
  Danger: { ...MAIN.Danger, shadowPressed: true },
  'Danger Secondary': P(MAIN['Danger Subtle'].bg, { Default: 'Color/Content/Negative/Light', Pressed: 'Color/Content/Negative/Base', Disabled: DIS_CONTENT }),
  Positive: { ...MAIN.Positive, shadowPressed: true },
  // Figma: Pressed bind Positive/Flat/Pressed (không phải Subtle) → giữ nguyên.
  'Positive Secondary': P(
    { Default: 'Color/Background/Positive/Subtle/Default', Pressed: 'Color/Background/Positive/Flat/Pressed', Disabled: DIS.subtle },
    { Default: 'Color/Content/Positive/Light', Pressed: 'Color/Content/Positive/Base', Disabled: DIS_CONTENT },
  ),
};
const ICON_FLAT: Record<IconFlatLevel, Palette> = {
  Primary: P(
    { Default: 'Color/Background/Neutral/Flat/Default', Pressed: 'Color/Background/Neutral/Flat/Pressed', Disabled: DIS.flat },
    { Default: 'Color/Content/Neutral/Strongest', Pressed: 'Color/Content/Neutral/Strongest', Disabled: DIS_CONTENT },
  ),
  Secondary: P(
    { Default: 'Color/Background/Neutral/Flat/Default', Pressed: 'Color/Background/Neutral/Flat/Pressed', Disabled: DIS.flat },
    { Default: 'Color/Content/Neutral/Base', Pressed: 'Color/Content/Neutral/Base', Disabled: DIS_CONTENT },
  ),
  Accent: P(
    { Default: 'Color/Background/Accent/Flat/Default', Pressed: 'Color/Background/Accent/Flat/Pressed', Disabled: DIS.flat },
    { Default: 'Color/Content/Accent/Base', Pressed: 'Color/Content/Accent/Base', Disabled: DIS_CONTENT },
  ),
  Danger: P(
    { Default: 'Color/Background/Negative/Flat/Default', Pressed: 'Color/Background/Negative/Flat/Pressed', Disabled: DIS.flat },
    { Default: 'Color/Content/Negative/Light', Pressed: 'Color/Content/Negative/Base', Disabled: DIS_CONTENT },
  ),
  Positive: P(
    { Default: 'Color/Background/Positive/Flat/Default', Pressed: 'Color/Background/Positive/Flat/Pressed', Disabled: DIS.flat },
    { Default: 'Color/Content/Positive/Light', Pressed: 'Color/Content/Positive/Base', Disabled: DIS_CONTENT },
  ),
  // Figma: Overlay Pressed bind Inverse/Subtle/Hover → giữ nguyên.
  Overlay: P(
    { Default: 'Color/Background/Inverse/Flat/Default', Pressed: 'Color/Background/Inverse/Subtle/Hover', Disabled: DIS.flat },
    { Default: 'Color/Content/Inverse/Strongest', Pressed: 'Color/Content/Inverse/Strongest', Disabled: DIS_CONTENT },
  ),
};
const ICON_MAIN_OVERLAY: Record<IconMainOverlayLevel, Palette> = {
  Primary: P(
    MAIN_OVERLAY.Primary.bg,
    { Default: 'Button-Primary-Overlay/Content/Default', Pressed: 'Button-Primary-Overlay/Content/Default', Disabled: DIS_OVERLAY_CONTENT },
    { border: MAIN_OVERLAY.Primary.border, shadow: SHADOW, shadowPressed: true },
  ),
  Accent: P(
    MAIN_OVERLAY.Accent.bg,
    { Default: 'Button-Accent-Overlay/Content/Default', Pressed: 'Button-Accent-Overlay/Content/Pressed', Disabled: DIS_OVERLAY_CONTENT },
    { shadow: SHADOW, shadowPressed: true },
  ),
  // ponytail: Liquid Glass = blur trong Figma; đợt 1 vẽ như Primary-Overlay không blur (spec §7 Open).
  'Liquid Glass': P(MAIN_OVERLAY.Primary.bg, { Default: 'Button-Primary-Overlay/Content/Default', Pressed: 'Button-Primary-Overlay/Content/Default', Disabled: DIS_OVERLAY_CONTENT }),
};
const PALETTE: Record<ButtonKind, Partial<Record<ButtonLevel, Palette>>> = {
  Main: MAIN,
  Flat: FLAT,
  'Main-Overlay': MAIN_OVERLAY,
  'Icon-Main': ICON_MAIN,
  'Icon-Flat': ICON_FLAT,
  'Icon-Main-Overlay': ICON_MAIN_OVERLAY,
};

type SizeToken = 'XLarge' | 'Large' | 'Medium' | 'Small' | 'XSmall';
const SIZE_KEY = {
  XLarge: 'XLarge', Large: 'Large', 'Medium (Base)': 'Medium', Medium: 'Medium', Small: 'Small', XSmall: 'XSmall', '2XSmall': '2XSmall',
} as const satisfies Record<ButtonSize | IconButtonSize, SizeToken | '2XSmall'>;
const LABEL = { XLarge: 'Button-Label/XL', Large: 'Button-Label/L', Medium: 'Button-Label/M', Small: 'Button-Label/S', XSmall: 'Button-Label/XS' } as const satisfies Record<SizeToken, string>;
// Icon-Flat ở Figma bind gr-dm-28 cho Large (khác Icon-Main = Base 20) → spec §7 Open; đợt 1 dùng chung bảng này.
const ICON_SIZE: Record<ButtonSize | IconButtonSize, SizeKey> = {
  XLarge: 'Element-Size/Popular/Large',
  Large: 'Element-Size/Popular/Base',
  'Medium (Base)': 'Element-Size/Popular/Base',
  Medium: 'Element-Size/Popular/Base',
  Small: 'Element-Size/Popular/Base',
  XSmall: 'Element-Size/Popular/Small',
  '2XSmall': 'Element-Size/Popular/XSmall',
};

export interface ButtonStyleInput {
  kind: ButtonKind;
  level: ButtonLevel;
  size: ButtonSize | IconButtonSize;
  pressed?: boolean;
  disabled?: boolean;
}
export interface ButtonStyles { container: ViewStyle; label: TextStyle; iconSize: number; iconColor: PaintKey }

export function buttonStyles(t: Theme, o: ButtonStyleInput): ButtonStyles {
  const pal = PALETTE[o.kind][o.level];
  if (!pal) throw new Error(`Button: Level "${o.level}" không có trong set ${o.kind}`);
  const state: State = o.disabled ? 'Disabled' : o.pressed ? 'Pressed' : 'Default';
  const s = SIZE_KEY[o.size];
  const iconOnly = o.kind.startsWith('Icon');
  const height = t.size(`Button/Size/${s}`);
  const base: ViewStyle = {
    height,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: paint(t, pal.bg[state]),
    ...(pal.border && (state !== 'Disabled' || pal.border.Disabled) ? { borderWidth: 1, borderColor: paint(t, state === 'Disabled' ? pal.border.Disabled! : pal.border.Default) } : {}),
    // Figma: shadow ở Default (+ Pressed với set có shadowPressed); Disabled không — parity §7e.
    ...(pal.shadow && (state === 'Default' || (state === 'Pressed' && pal.shadowPressed)) ? t.shadow(pal.shadow) : {}),
  };
  // Nút chữ không có 2XSmall trong Figma; ép kiểu để TS kiểm tra tên token.
  const ts = (s === '2XSmall' ? 'XSmall' : s) as SizeToken;
  const container: ViewStyle = iconOnly
    ? { ...base, width: height, borderRadius: t.radius('Corner-Radius/Rounded') }
    : {
        ...base,
        paddingHorizontal: t.size(`Button/Spacing/${ts}/Horizontal-Padding`),
        paddingVertical: t.size(`Button/Spacing/${ts}/Vertical-Padding`),
        gap: t.size(`Button/Spacing/${ts}/Gap`),
        borderRadius: t.radius(`Corner-Radius/Action/${ts}`),
      };
  return {
    container,
    label: {
      ...t.text(LABEL[ts]),
      color: paint(t, pal.content[state]),
      paddingHorizontal: iconOnly ? 0 : t.size(`Button/Spacing/${ts}/Text-Wrapper-Padding`),
    },
    iconSize: t.size(ICON_SIZE[o.size]),
    iconColor: pal.content[state],
  };
}
