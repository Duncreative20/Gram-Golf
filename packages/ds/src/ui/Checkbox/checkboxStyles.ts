import type { ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import { paint, type PaintKey } from '../../theme/paint';
import type { IconName } from '../../icons/generated';

/** Figma ❖ Checkbox — set `Checkbox/Mark` (311:47222): Type × State × Select × Shape. Hover-Row/Hover-Mark/Focus không có trên touch; pressed → token Hover. */
export type CheckboxType = 'Default' | 'Indeterminate';
export type CheckboxShape = 'Rounded' | 'Default';

export interface CheckboxStyles { box: ViewStyle; icon: IconName | null; iconSize: number; iconColor: PaintKey }

export function checkboxStyles(t: Theme, o: { type: CheckboxType; select: boolean; shape: CheckboxShape; pressed?: boolean; disabled?: boolean }): CheckboxStyles {
  const dim = t.size('Checkbox/Size/Medium');
  const radius = o.shape === 'Rounded' ? t.radius('Corner-Radius/Rounded') : t.radius('Corner-Radius/XSmall');
  const base: ViewStyle = { width: dim, height: dim, borderRadius: radius, alignItems: 'center', justifyContent: 'center', ...t.shadow('Shadow/Action/Basic') };
  if (!o.select) {
    return {
      box: {
        ...base,
        backgroundColor: o.disabled ? t.color('Color/Background/Solid-Disabled') : paint(t, o.pressed ? 'Checkbox/Background/Unselected/Hover' : 'Checkbox/Background/Unselected/Default'),
        borderWidth: 1,
        borderColor: o.disabled ? t.color('Color/Border/Disabled') : paint(t, o.pressed ? 'Checkbox/Border/Hover' : 'Checkbox/Border/Default'),
      },
      icon: null,
      iconSize: t.size('Element-Size/Popular/XSmall'),
      iconColor: 'Checkbox/Icon-Check/Default',
    };
  }
  return {
    box: {
      ...base,
      padding: t.space('Spacing/Padding/3XSmall'),
      backgroundColor: o.disabled ? t.color('Color/Background/Subtle-Disabled') : paint(t, o.pressed ? 'Checkbox/Background/Selected/Hover' : 'Checkbox/Background/Selected/Default'),
    },
    icon: o.type === 'Indeterminate' ? 'minus-line' : 'check-line',
    iconSize: t.size('Element-Size/Popular/XSmall'),
    iconColor: 'Checkbox/Icon-Check/Default',
  };
}
