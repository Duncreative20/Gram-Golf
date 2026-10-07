import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import type { RadiusKey, SizeKey, ThemeLightKey } from '../../generated/keys';

/**
 * Figma ❖ Progress — `Progress-Bar` (1536:260: Theme Accent|Neutral|Status|Overlay, Progress None…Done, Label boolean).
 * ❖ Skeleton — `Skeleton/Shapes` (1556:17525), `Skeleton/Body-Text` (1556:17566), `Skeleton/Heading-Text` (1556:17593).
 * Chiều cao thanh Figma không bind token → Element-Size/Popular/4XSmall (spec §7).
 */
export type ProgressTheme = 'Accent' | 'Neutral' | 'Status' | 'Overlay';
export type ProgressStatus = 'Positive' | 'Warning' | 'Negative';

export function progressStyles(t: Theme, o: { theme: ProgressTheme; status?: ProgressStatus }): { wrapper: ViewStyle; track: ViewStyle; fill: ViewStyle; label: TextStyle } {
  const fill: ThemeLightKey = o.theme === 'Accent' ? 'Color/Background/Active/Accent/Solid'
    : o.theme === 'Neutral' ? 'Color/Background/Active/Neutral/Solid'
    : o.theme === 'Overlay' ? 'Color/Background/Active/Overlay/Solid'
    : `Color/Background/${o.status ?? 'Positive'}/Solid/Default`;
  const h = t.size('Element-Size/Popular/4XSmall');
  return {
    wrapper: { gap: t.space('Spacing/Gap/XSmall'), alignSelf: 'stretch' },
    // Overlay lấy từ Story-Viewer/Header (Figma Progress-Bar Theme=Overlay không dump được): track White-Overlay, fill Active/Overlay/Solid.
    track: { height: h, borderRadius: t.radius('Corner-Radius/Rounded'), backgroundColor: t.color(o.theme === 'Overlay' ? 'Color/Background/White-Overlay/Default' : 'Color/Background/Neutral/Subtle/Default'), overflow: 'hidden' },
    fill: { height: h, borderRadius: t.radius('Corner-Radius/Rounded'), backgroundColor: t.color(fill) },
    label: { ...t.text('Body/Base/Regular'), color: t.color(o.theme === 'Overlay' ? 'Color/Content/On-Dark-Overlay/Strongest' : 'Color/Content/Neutral/Strongest') },
  };
}

export type SkeletonShape = 'Pill' | 'Round' | 'Square' | 'Rectangle';
export type SkeletonSize = 'Large - 48px' | 'Medium - 40px' | 'Small - 32px' | 'XSmall' | '2XSmall';
const SK_SIZE: Record<SkeletonSize, SizeKey> = { 'Large - 48px': 'Image-Size/Medium', 'Medium - 40px': 'Image-Size/Small', 'Small - 32px': 'Image-Size/XSmall', XSmall: 'Image-Size/2XSmall', '2XSmall': 'Image-Size/3XSmall' };
const SK_RADIUS: Record<SkeletonShape, RadiusKey> = { Pill: 'Corner-Radius/Rounded', Round: 'Corner-Radius/Rounded', Square: 'Corner-Radius/Base', Rectangle: 'Corner-Radius/Base' };
export type SkeletonHeading = 'Large' | 'Medium' | 'Small';
const SK_HEADING: Record<SkeletonHeading, SizeKey> = { Large: 'Image-Size/XSmall', Medium: 'Image-Size/2XSmall', Small: 'Image-Size/3XSmall' };

export function skeletonStyles(t: Theme, o: { shape: SkeletonShape; size: SkeletonSize; width?: number }): ViewStyle {
  const h = t.size(SK_SIZE[o.size]);
  const square = o.shape === 'Round' || o.shape === 'Square';
  return { height: h, width: square ? h : o.width, alignSelf: square || o.width ? 'auto' : 'stretch', borderRadius: t.radius(SK_RADIUS[o.shape]), backgroundColor: t.color('Color/Background/Neutral/Subtle/Default') };
}
export function skeletonTextStyles(t: Theme, o: { heading?: SkeletonHeading }): { column: ViewStyle; line: ViewStyle } {
  const h = o.heading ? t.size(SK_HEADING[o.heading]) : t.space('Spacing/Gap/XSmall');
  return {
    column: { gap: t.space('Spacing/Gap/XSmall'), alignSelf: 'stretch' },
    line: { height: h, borderRadius: t.radius('Corner-Radius/Rounded'), backgroundColor: t.color('Color/Background/Neutral/Subtle/Default') },
  };
}
