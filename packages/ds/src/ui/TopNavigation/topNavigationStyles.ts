import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import type { TextStylesKey } from '../../generated/keys';

/**
 * Figma ❖ Top-Navigations (Mobile) — set `Top-Navigations` (40012311:4291: Type Title|Search|Package-Select, Surface Default|Overlay, Divider)
 * + `.Primitives/Top-Navigation/Title-Block` (Type Start|Center, Size Large|Medium|Small|XSmall) + `Container/Title` (Align Center|Left).
 */
export type TopNavType = 'Title' | 'Search' | 'Package-Select';
export type TopNavSurface = 'Default' | 'Overlay';
export type TopNavAlign = 'Center' | 'Left';
export type TopNavTitleSize = 'Large' | 'Medium' | 'Small' | 'XSmall';

const HEADING: Record<TopNavTitleSize, TextStylesKey> = { Large: 'Heading/3', Medium: 'Heading/Subheading', Small: 'Body/Base/DemiBold', XSmall: 'Body/XSmall/DemiBold' };
const SUBTITLE: Record<TopNavTitleSize, TextStylesKey> = { Large: 'Body/Base/Regular', Medium: 'Body/XSmall/Regular', Small: 'Body/XSmall/Regular', XSmall: 'Body/XSmall/Regular' };

export interface TopNavigationStyles { bar: ViewStyle; leading: ViewStyle; trailing: ViewStyle; titleBlock: ViewStyle; heading: TextStyle; subtitle: TextStyle; divider: ViewStyle }

export function topNavigationStyles(t: Theme, o: { surface: TopNavSurface; align: TopNavAlign; size: TopNavTitleSize; divider?: boolean }): TopNavigationStyles {
  const overlay = o.surface === 'Overlay';
  return {
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.size('Navigation-Action/Text/Spacing/Horizontal-Padding'),
      paddingHorizontal: t.space('Spacing/Padding/Medium'),
      paddingVertical: t.space('Spacing/Padding/Small'),
    },
    leading: { flexDirection: 'row', gap: t.space('Spacing/Padding/2XSmall'), alignItems: 'center' },
    trailing: { flexDirection: 'row', gap: t.size('Navigation-Action/Icon/Spacing/Horizontal-Padding'), alignItems: 'center' },
    titleBlock: { flex: 1, alignItems: o.align === 'Center' ? 'center' : 'flex-start', gap: t.space(o.size === 'XSmall' ? 'Spacing/Gap/2XSmall' : 'Spacing/Gap/3XSmall') },
    heading: { ...t.text(HEADING[o.size]), color: t.color(overlay ? 'Color/Content/On-Dark-Overlay/Strongest' : 'Color/Content/Neutral/Strongest') },
    subtitle: { ...t.text(SUBTITLE[o.size]), color: t.color(overlay ? 'Color/Content/On-Dark-Overlay/Base' : 'Color/Content/Neutral/Base') },
    divider: o.divider ? { height: 1, backgroundColor: t.color('Color/Border/Neutral/Pale/Default') } : { height: 0 },
  };
}
