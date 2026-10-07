import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import type { IconName } from '../../icons/generated';
import type { ThemeLightKey } from '../../generated/keys';

/**
 * Figma ❖ Feedback — `Alert-Banner` (6828:9393), `Inline-Message` (595:54857), `Toast-Message` (1579:13276), `Tooltip` (1595:2220).
 * Gom một file vì cùng bảng màu Status (Solid: On-Colors/On-Brights; Subtle: Content/<Status>/Strongest).
 */
export type StatusTheme = 'Neutral' | 'Info' | 'Positive' | 'Warning' | 'Negative';
export type AlertBannerSize = 'Medium' | 'Small';
export type ToastType = StatusTheme | 'Subtle';
export type TooltipColor = 'Default' | 'Accent' | 'White Overlay' | 'Black-Overlay';
export type TooltipSize = 'Medium' | 'Small';

const SOLID_BG: Record<StatusTheme, ThemeLightKey> = {
  Neutral: 'Color/Background/Neutral/Solid/Default', Info: 'Color/Background/Info/Solid/Default', Positive: 'Color/Background/Positive/Solid/Default',
  Warning: 'Color/Background/Warning/Solid/Default', Negative: 'Color/Background/Negative/Solid/Default',
};
const SOLID_CONTENT: Record<StatusTheme, ThemeLightKey> = {
  Neutral: 'Color/Content/Inverse/Strongest', Info: 'Color/Content/On-Colors', Positive: 'Color/Content/On-Colors', Warning: 'Color/Content/On-Brights', Negative: 'Color/Content/On-Colors',
};
const SUBTLE_BG: Record<StatusTheme, ThemeLightKey> = {
  Neutral: 'Color/Background/Neutral/Subtle/Default', Info: 'Color/Background/Info/Subtle/Default', Positive: 'Color/Background/Positive/Subtle/Default',
  Warning: 'Color/Background/Warning/Subtle/Default', Negative: 'Color/Background/Negative/Subtle/Default',
};
// Inline-Message content không dump được (slot) → Content/<Status>/Strongest chữ + Base icon (Light = 1.8:1 trên Warning/Subtle, audit §7d).
const SUBTLE_CONTENT: Record<StatusTheme, { text: ThemeLightKey; icon: ThemeLightKey }> = {
  Neutral: { text: 'Color/Content/Neutral/Strongest', icon: 'Color/Content/Neutral/Base' },
  Info: { text: 'Color/Content/Info/Strongest', icon: 'Color/Content/Info/Base' },
  Positive: { text: 'Color/Content/Positive/Strongest', icon: 'Color/Content/Positive/Base' },
  Warning: { text: 'Color/Content/Warning/Strongest', icon: 'Color/Content/Warning/Base' },
  Negative: { text: 'Color/Content/Negative/Strongest', icon: 'Color/Content/Negative/Base' },
};
export const STATUS_ICON: Record<StatusTheme, IconName> = { Neutral: 'info-circle-line', Info: 'info-circle-line', Positive: 'check-solid', Warning: 'alert-triangle-solid', Negative: 'x-circle-solid' };

export interface AlertBannerStyles { container: ViewStyle; text: TextStyle; iconSize: number; content: ThemeLightKey; closeSize: number }
export function alertBannerStyles(t: Theme, o: { size: AlertBannerSize; theme: StatusTheme }): AlertBannerStyles {
  const m = o.size === 'Medium';
  return {
    container: {
      flexDirection: 'row', alignItems: 'center',
      gap: t.space(m ? 'Spacing/Gap/Small' : 'Spacing/Gap/XSmall'),
      paddingHorizontal: t.space(m ? 'Spacing/Padding/Large' : 'Spacing/Padding/Medium'),
      paddingVertical: t.space(m ? 'Spacing/Padding/Small' : 'Spacing/Padding/XSmall'),
      backgroundColor: t.color(SOLID_BG[o.theme]),
    },
    text: { ...t.text(m ? 'Body/Base/Medium' : 'Body/XSmall/Medium'), color: t.color(SOLID_CONTENT[o.theme]), flex: 1 },
    iconSize: t.size(m ? 'Element-Size/Popular/Base' : 'Element-Size/Popular/Small'),
    content: SOLID_CONTENT[o.theme],
    closeSize: t.size('Element-Size/Popular/Small'),
  };
}

export interface InlineMessageStyles { container: ViewStyle; body: ViewStyle; title: TextStyle; caption: TextStyle; iconSize: number; iconColor: ThemeLightKey; closeColor: ThemeLightKey }
export function inlineMessageStyles(t: Theme, o: { theme: StatusTheme }): InlineMessageStyles {
  const c = SUBTLE_CONTENT[o.theme];
  return {
    container: { flexDirection: 'row', alignItems: 'flex-start', gap: t.space('Spacing/Gap/Small'), padding: t.space('Spacing/Padding/Medium'), borderRadius: t.radius('Corner-Radius/Large'), backgroundColor: t.color(SUBTLE_BG[o.theme]) },
    body: { flex: 1, gap: t.space('Spacing/Gap/XSmall') },
    title: { ...t.text('Body/Base/DemiBold'), color: t.color(c.text) },
    caption: { ...t.text('Body/XSmall/Regular'), color: t.color(c.text) },
    iconSize: t.size('Element-Size/Popular/Base'),
    iconColor: c.icon,
    closeColor: 'Color/Content/Neutral/Light',
  };
}

export interface ToastStyles { container: ViewStyle; body: ViewStyle; title: TextStyle; caption: TextStyle; iconSize: number; content: ThemeLightKey }
export function toastStyles(t: Theme, o: { type: ToastType }): ToastStyles {
  const subtle = o.type === 'Subtle';
  const status: StatusTheme = o.type === 'Subtle' ? 'Neutral' : o.type;
  const content: ThemeLightKey = subtle ? 'Color/Content/Neutral/Light' : SOLID_CONTENT[status];
  return {
    container: {
      flexDirection: 'row', alignItems: 'center',
      gap: t.space('Spacing/Gap/Medium'),
      paddingHorizontal: t.space('Spacing/Padding/Large'),
      paddingVertical: t.space('Spacing/Padding/Medium'),
      borderRadius: t.radius('Corner-Radius/2XLarge'),
      backgroundColor: t.color(subtle ? 'Color/Background/Popover/Default' : SOLID_BG[status]),
      ...(subtle ? { borderWidth: 1, borderColor: t.color('Color/Border/Popover/Subtle') } : {}),
      ...t.shadow('Effect/Popover'),
    },
    body: { flex: 1, gap: t.space('Spacing/Gap/3XSmall') },
    title: { ...t.text('Body/Base/DemiBold'), color: t.color(subtle ? 'Color/Content/Neutral/Strongest' : content) },
    caption: { ...t.text('Body/XSmall/Regular'), color: t.color(content) },
    iconSize: t.size('Element-Size/Popular/Base'),
    content,
  };
}

const TOOLTIP: Record<TooltipColor, { bg: ThemeLightKey; text: ThemeLightKey }> = {
  Default: { bg: 'Color/Background/Neutral/Solid/Default', text: 'Color/Content/Inverse/Strongest' },
  Accent: { bg: 'Color/Background/Accent/Solid/Default', text: 'Color/Content/On-Accent/Default' },
  'White Overlay': { bg: 'Color/Background/White-Solid/Default', text: 'Color/Content/On-White-Overlay/Strongest' },
  'Black-Overlay': { bg: 'Color/Background/Black-Overlay/Default', text: 'Color/Content/On-Dark-Overlay/Strongest' },
};
export function tooltipStyles(t: Theme, o: { color: TooltipColor; size: TooltipSize }): { container: ViewStyle; text: TextStyle } {
  const m = o.size === 'Medium';
  return {
    container: {
      alignSelf: 'flex-start',
      paddingHorizontal: t.space('Spacing/Padding/XSmall'),
      paddingVertical: t.space(m ? 'Spacing/Padding/2XSmall' : 'Spacing/Padding/3XSmall'),
      gap: t.space('Spacing/Gap/3XSmall'),
      borderRadius: t.radius(m ? 'Corner-Radius/Small' : 'Corner-Radius/Rounded'), // Figma Small = Rounded (parity đợt 4)
      backgroundColor: t.color(TOOLTIP[o.color].bg),
      ...t.shadow('Effect/Popover'),
    },
    text: { ...t.text('Caption/Medium'), color: t.color(TOOLTIP[o.color].text) }, // Figma Medium cũng Caption/Medium (parity §7e)
  };
}

/** Figma ❖ Modal — `Modal/Dialog` (841:17177): Theme chỉ đổi icon, khung giống nhau. */
export function dialogStyles(t: Theme): { scrim: ViewStyle; box: ViewStyle; content: ViewStyle; title: TextStyle; body: TextStyle; actions: ViewStyle } {
  const pad = t.layout('Modal-Padding');
  return {
    scrim: { flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small'), backgroundColor: t.color('Color/Background/Overlay') },
    box: { borderRadius: t.radius('Corner-Radius/XGiant'), backgroundColor: t.color('Color/Background/Container'), borderWidth: 1, borderColor: t.component('Container/Border'), ...t.shadow('Effect/Container'), overflow: 'hidden' },
    content: { padding: pad, gap: t.space('Spacing/Gap/Medium') },
    title: { ...t.text('Heading/3'), color: t.color('Color/Content/Neutral/Strongest') },
    body: { ...t.text('Body/Base/Regular'), color: t.color('Color/Content/Neutral/Base') },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: t.space('Spacing/Gap/Small'), paddingHorizontal: pad, paddingBottom: pad, paddingTop: t.space('Spacing/Padding/Small') },
  };
}
