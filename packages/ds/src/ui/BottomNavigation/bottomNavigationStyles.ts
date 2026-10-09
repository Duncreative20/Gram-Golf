import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import { paint, type PaintKey } from '../../theme/paint';

/**
 * Figma ❖ Bottom-Navigations (Mobile) — `Bottom-Navigation/Mobile/Floating` (9017:26239), `Floating-Glass` (9017:42257)
 * + `.Primitives/Bottom-Navigation/Items/Floating` (9017:25813: Select, Theme) + `Primitives/Notification-Dot`.
 */
export type BottomNavType = 'Floating' | 'Floating-Glass';
export type BottomNavTheme = 'Neutral' | 'Accent' | 'Neutral-Surface' | 'Accent-Surface' | 'Neutral-Solid' | 'Accent-Solid' | 'Overlay';

interface ItemPaint { bg?: PaintKey; icon: PaintKey; label: PaintKey; shadow?: boolean }
const THEME: Record<BottomNavTheme, { off: ItemPaint; on: ItemPaint }> = {
  Neutral: { off: { icon: 'Color/Content/Neutral/Light', label: 'Color/Content/Neutral/Light' }, on: { bg: 'Color/Background/Active/Neutral/Subtle', icon: 'Color/Content/Neutral/Strongest', label: 'Color/Content/Neutral/Strongest' } },
  Accent: { off: { icon: 'Color/Content/Neutral/Light', label: 'Color/Content/Neutral/Light' }, on: { bg: 'Color/Background/Active/Accent/Subtle', icon: 'Color/Content/Accent/Base', label: 'Color/Content/Accent/Base' } },
  'Neutral-Surface': { off: { icon: 'Color/Content/Neutral/Light', label: 'Color/Content/Neutral/Light' }, on: { bg: 'Color/Background/Surface/Default', icon: 'Color/Content/Neutral/Strongest', label: 'Color/Content/Neutral/Strongest', shadow: true } },
  'Accent-Surface': { off: { icon: 'Color/Content/Neutral/Light', label: 'Color/Content/Neutral/Light' }, on: { bg: 'Color/Background/Surface/Default', icon: 'Color/Content/Accent/Base', label: 'Color/Content/Accent/Base', shadow: true } },
  'Neutral-Solid': { off: { icon: 'Color/Content/Neutral/Light', label: 'Color/Content/Placeholder' }, on: { bg: 'Color/Background/Active/Neutral/Solid', icon: 'Color/Content/Inverse/Strongest', label: 'Color/Content/Inverse/Strongest', shadow: true } },
  'Accent-Solid': { off: { icon: 'Color/Content/Neutral/Light', label: 'Color/Content/Neutral/Light' }, on: { bg: 'Color/Background/Active/Accent/Solid', icon: 'Color/Content/On-Accent/Default', label: 'Color/Content/On-Accent/Default', shadow: true } }, // NỢ BRAND F-brand-4: Figma bind Inverse/Strongest (trắng 2.18:1 trên teal)
  Overlay: { off: { icon: 'Color/Content/Accent/Strongest', label: 'Color/Content/Accent/Strongest' }, on: { bg: 'Color/Background/Surface/Default', icon: 'Color/Content/Accent/Strongest', label: 'Color/Content/Accent/Strongest', shadow: true } },
};

/**
 * `dense` (≥5 mục) — NỢ FIGMA F55: Floating chỉ vừa 4 mục; 5 mục ở 390 cắt nhãn. Dense: pill trải hết bề ngang, mục chia đều,
 * gap + padding ngang trong thu về 3XSmall.
 */
export function bottomNavigationStyles(t: Theme, o: { type: BottomNavType; dense?: boolean }): { bar: ViewStyle; items: ViewStyle } {
  return {
    bar: { paddingHorizontal: t.layout('Margin-Small'), alignItems: 'center' },
    items: {
      flexDirection: 'row',
      maxWidth: '100%',
      ...(o.dense ? { alignSelf: 'stretch' } : {}),
      gap: t.space(o.dense ? 'Spacing/Gap/3XSmall' : 'Spacing/Gap/Small'),
      padding: t.space('Spacing/Padding/2XSmall'),
      borderRadius: t.radius('Corner-Radius/Rounded'),
      // Cả 2 type bind Surface/Glass (Floating-Glass: slot Nav-Item fill Surface/Glass 54 % + BACKGROUND_BLUR — đợt 1 đọc nhầm fill
      // instance con Active/Neutral/Solid → chữ tối trên nền tối, audit lượt 2). ponytail: chưa blur (spec §7 Open).
      backgroundColor: t.color('Color/Background/Surface/Glass'),
      ...t.shadow('Shadow/Bottom/Level-2'),
    },
  };
}

export interface BottomNavItemStyles { item: ViewStyle; inner: ViewStyle; label: TextStyle; iconSize: number; iconColor: PaintKey; noti: ViewStyle }

export function bottomNavItemStyles(t: Theme, o: { theme: BottomNavTheme; selected: boolean; dense?: boolean }): BottomNavItemStyles {
  const p = o.selected ? THEME[o.theme].on : THEME[o.theme].off;
  const dot = t.size('Element-Size/Popular/2XSmall');
  return {
    item: {
      flexShrink: 1, minWidth: 0,
      ...(o.dense ? { flex: 1 } : {}),
      padding: t.space('Spacing/Padding/2XSmall'),
      borderRadius: t.radius('Corner-Radius/Rounded'),
      ...(p.bg ? { backgroundColor: paint(t, p.bg) } : {}),
      ...(p.shadow ? t.shadow('Shadow/Bottom/Level-1') : {}),
    },
    inner: { alignItems: 'center', minWidth: 0, gap: t.space('Spacing/Gap/3XSmall'), paddingHorizontal: t.space(o.dense ? 'Spacing/Padding/3XSmall' : 'Spacing/Padding/Small'), paddingVertical: t.space('Spacing/Padding/Small') },
    label: { ...t.text('Label/Medium/DemiBold'), color: paint(t, p.label), maxWidth: '100%' },
    iconSize: t.size('Navigation-Mobile/Bottom/Icon-Size'),
    iconColor: p.icon,
    noti: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: dot,
      height: dot,
      borderRadius: t.radius('Corner-Radius/Rounded'),
      backgroundColor: t.color('Color/Background/Negative/Solid/Default'),
      borderWidth: 1,
      borderColor: t.color('Color/Border/Inverse'),
    },
  };
}
