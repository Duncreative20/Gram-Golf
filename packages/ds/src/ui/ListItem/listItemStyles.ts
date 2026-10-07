import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';

/**
 * Figma ❖ List Item — `List-Item` (4080:11700: Type Inline|Grouped|Radio-Card, State Default|Selected, Leading/Trailing boolean, Contents slot).
 * Contents slot Figma: title Body/Base/Medium + caption Body/XSmall/Regular; Selected → title Accent/Strongest (parity §7e).
 */
export type ListItemType = 'Inline' | 'Grouped' | 'Radio-Card';

export interface ListItemStyles { container: ViewStyle; contents: ViewStyle; info: ViewStyle; title: TextStyle; caption: TextStyle; trailing: ViewStyle; leadingSize: number }

export function listItemStyles(t: Theme, o: { type: ListItemType; selected?: boolean; pressed?: boolean }): ListItemStyles {
  const inline = o.type === 'Inline';
  // Figma Radio-Card bind White-Solid (trắng cả dark → chữ Strongest tàng hình) → Surface/Default (spec §7d).
  const bg = o.type === 'Radio-Card' ? t.color('Color/Background/Surface/Default') : t.color('Color/Background/Neutral/Flat/Default');
  return {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: t.primitive('gr-dm-56'),
      gap: t.space('Spacing/Gap/Medium'),
      paddingHorizontal: inline ? t.layout(o.selected ? 'Margin-Comfortable' : 'Margin-Small') : t.space('Spacing/Padding/Small'),
      paddingVertical: t.space('Spacing/Padding/Small'),
      borderRadius: inline ? 0 : t.radius('Corner-Radius/Base'),
      backgroundColor: o.selected ? t.color('Color/Background/Active/Accent/Subtle') : o.pressed ? t.color('Color/Background/Neutral/Flat/Hover') : bg,
    },
    contents: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/Medium') },
    info: { flex: 1, gap: t.space('Spacing/Gap/2XSmall') },
    title: { ...t.text('Body/Base/Medium'), color: t.color(o.selected ? 'Color/Content/Accent/Strongest' : 'Color/Content/Neutral/Strongest') },
    caption: { ...t.text('Body/XSmall/Regular'), color: t.color('Color/Content/Neutral/Light') },
    trailing: { flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/Small') },
    leadingSize: t.size('Image-Size/Medium'),
  };
}
