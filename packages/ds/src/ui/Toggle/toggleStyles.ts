import type { ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import { paint, type PaintKey } from '../../theme/paint';

/**
 * Figma ❖ Toggle — `Toggle-Button` (1523:104: Size Large|Medium|Small, State, Select) + `Toggle` (1526:5703, Theme Text-First|Toggle-First).
 * Figma bind radius `Segmented/*-Corner-Radius-Small` (không có trong token dump) → Rounded (spec §7).
 */
export type ToggleSize = 'Large' | 'Medium' | 'Small';

export function toggleStyles(t: Theme, o: { size: ToggleSize; select: boolean; pressed?: boolean; disabled?: boolean }): { bar: ViewStyle; dot: ViewStyle } {
  const dot = t.size(`Toggle/Item/Size/${o.size}`);
  const pad = t.space('Spacing/Padding/3XSmall');
  let bar: PaintKey = o.select ? 'Toggle/Bar/Background/Selected/Default' : o.pressed ? 'Toggle/Bar/Background/Unselected/Hover' : 'Color/Background/Neutral/Subtle/Default';
  if (o.disabled) bar = o.select ? 'Toggle/Bar/Background/Selected/Disabled' : 'Toggle/Bar/Background/Unselected/Disabled';
  const dotBg: PaintKey = o.disabled
    ? (o.select ? 'Toggle/Dot/Background/Selected-Disabled' : 'Toggle/Dot/Background/Unselected-Disabled')
    : (o.select ? 'Toggle/Dot/Background/Selected-Default' : 'Toggle/Dot/Background/Unselected-Default');
  return {
    bar: {
      width: dot * 2 + pad * 2,
      height: dot + pad * 2,
      padding: pad,
      borderRadius: t.radius('Corner-Radius/Rounded'),
      backgroundColor: paint(t, bar),
      flexDirection: 'row',
      justifyContent: o.select ? 'flex-end' : 'flex-start',
    },
    dot: {
      width: dot,
      height: dot,
      borderRadius: t.radius('Corner-Radius/Rounded'),
      backgroundColor: paint(t, dotBg),
      ...(!o.select && !o.disabled ? { borderWidth: 1, borderColor: t.color('Color/Border/Neutral/Pale/Default') } : {}),
      ...t.shadow('Shadow/Action/Basic'),
    },
  };
}
