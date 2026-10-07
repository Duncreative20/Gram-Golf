import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import type { SizeKey, ThemeLightKey } from '../../generated/keys';

/**
 * Figma ❖ Dock Icon — `Dock-Icon` (308:45902: Size XLarge…XSmall, Theme, Background Solid|Subtle).
 * ❖ Integration Connector — `Integration-Connector` (40012683:35216: Size, Background Connected|Default|Disabled|Error).
 * ❖ Color Selector — `Color-Selector` (373:97252: Select, Status). ❖ Avatar — `Avatar/Group` (364:92561). ❖ Empty State — `Empty-State` (6085:25796).
 * Theme On-Color|Emoji|Golden bỏ (spec §7).
 */
export type DockIconSize = 'XLarge' | 'Large' | 'Medium' | 'Small' | 'XSmall';
type SupportTheme = 'Yellow' | 'Orange' | 'Red' | 'Crimson' | 'Pink' | 'Plum' | 'Purple' | 'Violet' | 'Indigo' | 'Blue' | 'Cyan' | 'Teal' | 'Green' | 'Brown';
export type DockIconTheme = 'Accent' | 'Neutral' | 'Inverse' | 'Pale' | SupportTheme;
export type DockIconBackground = 'Solid' | 'Subtle';

export const DOCK_SIZE: Record<DockIconSize, { box: SizeKey; icon: SizeKey }> = {
  XLarge: { box: 'Image-Size/XLarge', icon: 'Element-Size/Popular/Large' },
  Large: { box: 'Image-Size/Large', icon: 'Element-Size/Popular/Medium' },
  Medium: { box: 'Image-Size/Medium', icon: 'Element-Size/Popular/Base' },
  Small: { box: 'Image-Size/Small', icon: 'Element-Size/Popular/Small' },
  XSmall: { box: 'Image-Size/XSmall', icon: 'Element-Size/Popular/XSmall' },
};

function dockPaint(theme: DockIconTheme, bg: DockIconBackground): { bg: ThemeLightKey; icon: ThemeLightKey } {
  if (theme === 'Neutral') return bg === 'Solid' ? { bg: 'Color/Background/Neutral/Solid/Default', icon: 'Color/Content/Inverse/Strongest' } : { bg: 'Color/Background/Neutral/Subtle/Default', icon: 'Color/Content/Neutral/Base' };
  // Accent Solid: Figma bind On-Colors (trắng) nhưng trắng trên teal brand chỉ 2.38:1 → On-Accent/Default (navy GramGolf), audit §7d.
  if (theme === 'Accent') return bg === 'Solid' ? { bg: 'Color/Background/Accent/Solid/Default', icon: 'Color/Content/On-Accent/Default' } : { bg: 'Color/Background/Accent/Subtle/Default', icon: 'Color/Content/Accent/Light' };
  if (theme === 'Inverse') return { bg: 'Color/Background/Inverse/Solid/Default', icon: 'Color/Content/Neutral/Strongest' };
  if (theme === 'Pale') return { bg: 'Color/Background/Neutral/Subtle/Default', icon: 'Color/Content/Neutral/Light' }; // Figma Pale = Neutral/Subtle + Light (parity §7e)
  // Yellow Solid: Figma bind On-Colors (trắng trên vàng 1.7:1) → On-Brights như Badge/Alert Warning (spec §7d).
  return bg === 'Solid' ? { bg: `Color/Background/Support/${theme}/Solid`, icon: theme === 'Yellow' ? 'Color/Content/On-Brights' : 'Color/Content/On-Colors' } : { bg: `Color/Background/Support/${theme}/Subtle`, icon: `Color/Content/Support/${theme}/Light` };
}

export function dockIconStyles(t: Theme, o: { size: DockIconSize; theme: DockIconTheme; background: DockIconBackground }): { box: ViewStyle; iconSize: number; iconColor: ThemeLightKey } {
  const p = dockPaint(o.theme, o.background);
  const dim = t.size(DOCK_SIZE[o.size].box);
  return { box: { width: dim, height: dim, borderRadius: t.radius('Corner-Radius/Rounded'), alignItems: 'center', justifyContent: 'center', backgroundColor: t.color(p.bg) }, iconSize: t.size(DOCK_SIZE[o.size].icon), iconColor: p.icon };
}

export type ConnectorBackground = 'Connected' | 'Default' | 'Disabled' | 'Error';
export function connectorStyles(t: Theme, o: { size: DockIconSize; background: ConnectorBackground }): { box: ViewStyle; iconSize: number; iconColor: ThemeLightKey; badge: ViewStyle | null; badgeSize: number } {
  const dim = t.size(DOCK_SIZE[o.size].box);
  const active = t.weight('Emphasis/Border-Weight/Active');
  const B = o.background;
  const paint: Record<ConnectorBackground, ViewStyle & { icon: ThemeLightKey }> = {
    Connected: { backgroundColor: t.color('Color/Background/Active/Accent/Subtle'), borderWidth: active, borderColor: t.color('Color/Border/Active/Accent/Subtle'), icon: 'Color/Content/Accent/Base' },
    Default: { backgroundColor: t.color('Color/Background/Neutral/Subtle/Default'), borderWidth: 1, borderColor: t.color('Color/Border/Active/Neutral/Subtle'), icon: 'Color/Content/Neutral/Light' },
    Error: { backgroundColor: t.color('Color/Background/Negative/Subtle/Default'), borderWidth: active, borderColor: t.color('Color/Border/Negative/Subtle/Default'), icon: 'Color/Content/Negative/Strongest' },
    Disabled: { backgroundColor: t.color('Color/Background/Subtle-Disabled'), icon: 'Color/Content/Disabled' },
  };
  const { icon, ...box } = paint[B];
  return {
    // Figma radius theo size: XLarge 2XLarge, Large XLarge, còn lại Base (parity đợt 4).
    box: { width: dim, height: dim, borderRadius: t.radius(o.size === 'XLarge' ? 'Corner-Radius/2XLarge' : o.size === 'Large' ? 'Corner-Radius/XLarge' : 'Corner-Radius/Base'), alignItems: 'center', justifyContent: 'center', ...box },
    iconSize: t.size(DOCK_SIZE[o.size].icon),
    iconColor: icon,
    badge: B === 'Connected' ? { position: 'absolute', right: -t.space('Spacing/Gap/3XSmall'), bottom: -t.space('Spacing/Gap/3XSmall'), borderRadius: t.radius('Corner-Radius/Rounded'), backgroundColor: t.color('Color/Background/Surface/Default') } : null,
    badgeSize: t.size('Element-Size/Popular/Small'),
  };
}

export function colorSelectorStyles(t: Theme, o: { color?: string; select: boolean; pressed?: boolean }): { box: ViewStyle; iconSize: number } {
  const dim = t.size('Select-Item/Size/Small');
  return {
    box: {
      width: dim, height: dim, padding: t.space('Spacing/Padding/XSmall'), borderRadius: t.radius('Corner-Radius/Rounded'), alignItems: 'center', justifyContent: 'center',
      backgroundColor: o.color ?? t.color('Color/Background/Active/Accent/Solid'),
      borderWidth: 1, borderColor: t.color(o.pressed ? 'Color/Focus/Neutral/Solid' : 'Color/Border/Neutral/Subtle/Hover'),
    },
    iconSize: t.size('Element-Size/Popular/Small'),
  };
}

export type AvatarGroupSize = 'Medium' | 'Small';
export function avatarGroupStyles(t: Theme, o: { size: AvatarGroupSize; background: 'Subtle' | 'Solid' }): { row: ViewStyle; ring: ViewStyle; overlap: ViewStyle; more: ViewStyle; moreText: TextStyle } {
  const dim = t.size(o.size === 'Medium' ? 'Image-Size/Medium' : 'Image-Size/Small');
  const solid = o.background === 'Solid';
  return {
    row: { flexDirection: 'row', alignItems: 'center' },
    ring: { borderRadius: t.radius('Corner-Radius/Rounded'), borderWidth: t.weight('Emphasis/Border-Weight/Active'), borderColor: t.color('Color/Background/Surface/Default') },
    overlap: { marginLeft: -t.space(o.size === 'Medium' ? 'Spacing/Gap/XSmall' : 'Spacing/Gap/2XSmall') },
    more: { width: dim, height: dim, borderRadius: t.radius('Corner-Radius/Rounded'), alignItems: 'center', justifyContent: 'center', backgroundColor: t.color(solid ? 'Color/Background/Accent/Solid/Default' : 'Color/Background/Accent/Subtle/Default'), borderWidth: 1, borderColor: t.color('Color/Border/Active/Accent/Subtle'), ...t.shadow('Effect/Overlay') },
    moreText: { ...t.text(o.size === 'Medium' ? 'Heading/Subheading' : 'Body/Base/DemiBold'), color: t.color(solid ? 'Color/Content/On-Accent/Default' : 'Color/Content/Accent/Strongest') },
  };
}

export function emptyStateStyles(t: Theme): { wrapper: ViewStyle; content: ViewStyle; title: TextStyle; caption: TextStyle; cta: ViewStyle } {
  return {
    wrapper: { alignItems: 'center', gap: t.space('Spacing/Gap/XSmall'), alignSelf: 'stretch' },
    content: { alignItems: 'center', gap: t.space('Spacing/Gap/Large'), alignSelf: 'stretch' },
    title: { ...t.text('Heading/4'), color: t.color('Color/Content/Neutral/Strongest'), textAlign: 'center' },
    caption: { ...t.text('Body/Base/Regular'), color: t.color('Color/Content/Neutral/Light'), textAlign: 'center' },
    cta: { flexDirection: 'row', gap: t.space('Spacing/Gap/XSmall') },
  };
}
