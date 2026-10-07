import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import { paint, type PaintKey } from '../../theme/paint';

/**
 * Figma ❖ Date-Picker — `Date-Picker` (40012370:7976: Type Paged|Scroll, Size Large|Small) + primitive
 * `.Primitives/Date-Picker/Day` (40012358:1836), `Week-Labels` (40012370:1164), `Month-header` (40012370:377),
 * `Month-Grid` (40012370:2146), `Dot` (40012355:1785), `Wheel` (40012370:2867), `Wheel-Item` (40012370:2674).
 */
export type DatePickerSize = 'Large' | 'Small';
export type MonthHeaderAlign = 'Start' | 'Center';
// Figma Day/Week-Labels cỡ 48/40 là số cứng (không bind) — code lấy Button/Size/Medium|Small (NỢ FIGMA F47).
const CELL = { Large: 'Button/Size/Medium', Small: 'Button/Size/Small' } as const;

export interface DayCellStyles { cell: ViewStyle; band?: ViewStyle; inner: ViewStyle; text: TextStyle }

/** Day: State Default|Hover|Pressed|Today|Selected|Range-Start|Range-End|Range-Middle (+ -Hover)|Disabled|Outside × Size. Hover/Pressed = pressed. */
export function dayCellStyles(
  t: Theme,
  o: { size: DatePickerSize; today?: boolean; selected?: boolean; inRange?: boolean; rangeEdge?: 'start' | 'end'; pressed?: boolean; disabled?: boolean; outside?: boolean },
): DayCellStyles {
  const size = t.size(CELL[o.size]);
  const inner: PaintKey = o.selected
    ? o.pressed ? 'Date-Picker-Item/Background/Selected/Hover' : 'Date-Picker-Item/Background/Selected/Default'
    : o.inRange && o.pressed ? 'Date-Picker-Item/Background/Selected-In-Range/Hover'
    : o.pressed ? 'Date-Picker-Item/Background/Unselected/Hover' : 'Date-Picker-Item/Background/Unselected/Default';
  const text: PaintKey = o.disabled ? 'Date-Picker-Item/Content/Disabled' : o.outside ? 'Date-Picker-Item/Content/Outside' : o.selected ? 'Date-Picker-Item/Content/Selected' : 'Date-Picker-Item/Content/Default';
  const band = o.inRange || o.rangeEdge;
  return {
    cell: { flex: 1, height: size, alignItems: 'center', justifyContent: 'center' },
    band: band ? { position: 'absolute', top: 0, bottom: 0, left: o.rangeEdge === 'start' ? '50%' : 0, right: o.rangeEdge === 'end' ? '50%' : 0, backgroundColor: paint(t, 'Date-Picker-Item/Background/Selected-In-Range/Default') } : undefined,
    inner: {
      width: size, height: size, borderRadius: t.radius('Corner-Radius/Rounded'), alignItems: 'center', justifyContent: 'center',
      backgroundColor: paint(t, inner),
      ...(o.today ? { borderWidth: 1, borderColor: paint(t, 'Date-Picker-Item/Border/Today') } : {}),
    },
    // Small chưa dump style chữ — lấy Body/XSmall/DemiBold như Week-Labels Small.
    text: { ...t.text(o.size === 'Large' ? 'Body/Base/DemiBold' : 'Body/XSmall/DemiBold'), color: paint(t, text) },
  };
}

/** Dot (40012355:1785): Type Default (Accent) | Inverse (trên ô Selected). */
export function dayDotStyles(t: Theme, o: { inverse?: boolean }): ViewStyle {
  const d = t.size('Element-Size/Popular/2XSmall');
  return { width: d, height: d, borderRadius: t.radius('Corner-Radius/Rounded'), backgroundColor: t.color(o.inverse ? 'Color/Background/Inverse/Solid/Default' : 'Color/Background/Accent/Solid/Default') };
}

export interface WeekLabelStyles { row: ViewStyle; cell: ViewStyle; text: TextStyle }
/** Week-Labels: ô cao bằng Day (48/40 số cứng trong Figma — F47). */
export function weekLabelStyles(t: Theme, o: { size: DatePickerSize }): WeekLabelStyles {
  return {
    row: { flexDirection: 'row' },
    cell: { flex: 1, height: t.size(CELL[o.size]), alignItems: 'center', justifyContent: 'center', borderRadius: t.radius('Corner-Radius/Rounded'), backgroundColor: t.color('Color/Background/Neutral/Flat/Default') },
    text: { ...t.text(o.size === 'Large' ? 'Body/Base/DemiBold' : 'Body/XSmall/DemiBold'), color: t.color('Color/Content/Neutral/Light') },
  };
}

/** Month-header: tiêu đề = Button Flat (Large → Small, Small → XSmall), nút ‹ › = IconButton Tertiary XSmall; Align Start (tiêu đề trái, nút phải) | Center. */
export function monthHeaderStyles(t: Theme, o: { align: MonthHeaderAlign; size?: DatePickerSize }): { row: ViewStyle; titleSize: 'Small' | 'XSmall' } {
  // Align Start: Figma bind Spacing/Padding/2XSmall cho gap; Center: Spacing/Gap/2XSmall.
  return {
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: o.align === 'Center' ? 'space-between' : 'flex-start', gap: o.align === 'Start' ? t.space('Spacing/Padding/2XSmall') : t.space('Spacing/Gap/2XSmall') },
    titleSize: o.size === 'Small' ? 'XSmall' : 'Small',
  };
}

export function datePickerStyles(t: Theme): { container: ViewStyle; grid: ViewStyle; row: ViewStyle } {
  // Figma Date-Picker bind thẳng primitive gr-dm-12 cho padding khung.
  return { container: { padding: t.primitive('gr-dm-12'), gap: t.space('Spacing/Gap/XSmall'), alignSelf: 'stretch' }, grid: {}, row: { flexDirection: 'row' } };
}

export interface WheelItemStyles { item: ViewStyle; text: TextStyle }
export function wheelItemStyles(t: Theme, o: { active?: boolean }): WheelItemStyles {
  return {
    item: { height: t.size('Button/Size/Medium'), alignItems: 'center', justifyContent: 'center' },
    text: { ...t.text('Heading/4'), color: t.color(o.active ? 'Color/Content/Accent/Strongest' : 'Color/Content/Disabled') },
  };
}

export interface WheelStyles { container: ViewStyle; column: ViewStyle; indicator: ViewStyle; itemHeight: number; visible: number; fadeColor: string }
/** Wheel (Date|Time cùng token): nền Surface/Alt, thanh chọn Active/Accent/Subtle tròn, fade trên/dưới màu nền. */
export function wheelStyles(t: Theme): WheelStyles {
  const itemHeight = t.size('Button/Size/Medium');
  const visible = 5;
  const padH = t.space('Spacing/Padding/4XLarge');
  return {
    container: { flexDirection: 'row', height: itemHeight * visible, paddingHorizontal: padH, backgroundColor: t.color('Color/Background/Surface/Alt'), overflow: 'hidden' },
    column: { flex: 1 },
    indicator: { position: 'absolute', left: padH, right: padH, top: itemHeight * Math.floor(visible / 2), height: itemHeight, borderRadius: t.radius('Corner-Radius/Rounded'), backgroundColor: t.color('Color/Background/Active/Accent/Subtle') },
    itemHeight,
    visible,
    fadeColor: t.color('Color/Background/Surface/Alt'),
  };
}
