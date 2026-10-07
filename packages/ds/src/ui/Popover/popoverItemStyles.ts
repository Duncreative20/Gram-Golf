import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import { paint, type PaintKey } from '../../theme/paint';

/**
 * Figma ❖ Popover — set `Popover/Item-Select` (4059:17214): Type Radio|Item|Follow-User|Like, State Default|Pressed|Single-Selected,
 * boolean Trailing/Follow-Button/Select. Nội dung: `.Primitives/Popover/Item/Content` (Label Body/Base/DemiBold + Caption Body/XSmall/Medium).
 */
export type PopoverItemType = 'Radio' | 'Item' | 'Follow-User' | 'Like';

export interface PopoverItemStyles {
  container: ViewStyle;
  content: ViewStyle;
  label: TextStyle;
  caption: TextStyle;
  iconSize: number;
  iconColor: PaintKey;
  trailingSize: number;
  radio: { box: ViewStyle; dot: ViewStyle };
}

export function popoverItemStyles(t: Theme, o: { type: PopoverItemType; selected?: boolean; pressed?: boolean }): PopoverItemStyles {
  const radioDim = t.size('Checkbox/Size/Medium');
  return {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space(o.type === 'Follow-User' || o.type === 'Like' ? 'Spacing/Gap/Small' : 'Spacing/Gap/Medium'),
      paddingHorizontal: t.space('Spacing/Padding/Medium'),
      paddingVertical: t.space('Spacing/Padding/Small'),
      borderRadius: t.radius('Corner-Radius/Base'),
      backgroundColor: t.color(o.pressed ? 'Color/Background/Accent/Flat/Hover' : 'Color/Background/Neutral/Flat/Default'),
    },
    content: { flex: 1, gap: t.space('Spacing/Gap/3XSmall') },
    label: { ...t.text('Body/Base/DemiBold'), color: t.color('Color/Content/Neutral/Strongest') },
    caption: { ...t.text('Body/XSmall/Medium'), color: t.color('Color/Content/Neutral/Base') },
    iconSize: t.size('Element-Size/Popular/Base'),
    iconColor: 'Color/Content/Neutral/Base',
    trailingSize: t.size('Element-Size/Popular/Small'),
    radio: {
      box: {
        width: radioDim,
        height: radioDim,
        borderRadius: t.radius('Corner-Radius/Rounded'),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: paint(t, o.selected ? 'Checkbox/Background/Selected/Default' : 'Checkbox/Background/Unselected/Default'),
        ...(o.selected ? {} : { borderWidth: 1, borderColor: paint(t, 'Checkbox/Border/Default') }),
      },
      dot: {
        width: t.size('Element-Size/Popular/2XSmall'),
        height: t.size('Element-Size/Popular/2XSmall'),
        borderRadius: t.radius('Corner-Radius/Rounded'),
        backgroundColor: paint(t, 'Checkbox/Icon-Check/Default'),
      },
    },
  };
}
