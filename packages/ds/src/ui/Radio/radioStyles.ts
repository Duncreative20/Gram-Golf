import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import { paint } from '../../theme/paint';

/**
 * Figma ❖ Radio Button — `Radio-Button/Radio-Mark` (373:96225) + `Radio-Button/Radio-Button` (373:96272: Content, Radio-Side).
 * Figma bind token Checkbox/* cho mark (dù có bộ Radio-Button/*) → giữ đúng Figma. Hover → pressed.
 * Cũng dùng cho hàng Checkbox/Text (311:… Check-Side) và Toggle (Theme Text-First|Toggle-First).
 */
export type ControlKind = 'Checkbox' | 'Radio' | 'Toggle';
export type ControlSide = 'Left' | 'Right';

export function radioStyles(t: Theme, o: { select: boolean; pressed?: boolean; disabled?: boolean }): { box: ViewStyle; dot: ViewStyle | null } {
  const dim = t.size('Checkbox/Size/Medium');
  const base: ViewStyle = { width: dim, height: t.size('Radio-Button/Size/Medium'), borderRadius: t.radius('Corner-Radius/Rounded'), alignItems: 'center', justifyContent: 'center', ...t.shadow('Shadow/Action/Basic') };
  if (!o.select) {
    return {
      box: {
        ...base,
        backgroundColor: paint(t, o.pressed ? 'Checkbox/Background/Unselected/Hover' : 'Checkbox/Background/Unselected/Default'),
        borderWidth: 1,
        borderColor: o.disabled ? t.color('Color/Border/Disabled') : paint(t, o.pressed ? 'Checkbox/Border/Hover' : 'Checkbox/Border/Default'),
      },
      dot: null,
    };
  }
  return {
    // Figma Disabled Select=Yes bind `Color/Background/Fill/Disabled/Neutral/Solid` (không có trong dump) → Solid-Disabled (spec §7).
    box: { ...base, padding: t.space('Spacing/Padding/3XSmall'), backgroundColor: o.disabled ? t.color('Color/Background/Solid-Disabled') : paint(t, o.pressed ? 'Checkbox/Background/Selected/Hover' : 'Checkbox/Background/Selected/Default') },
    dot: { width: t.size('Element-Size/Popular/2XSmall'), height: t.size('Element-Size/Popular/2XSmall'), borderRadius: t.radius('Corner-Radius/Rounded'), backgroundColor: paint(t, 'Checkbox/Icon-Check/Default') },
  };
}

export interface ControlRowStyles { row: ViewStyle; controlWrap: ViewStyle; content: ViewStyle; label: TextStyle; caption: TextStyle }

export function controlRowStyles(t: Theme, o: { kind: ControlKind; side: ControlSide; disabled?: boolean }): ControlRowStyles {
  const gap = o.kind === 'Toggle' ? 'Spacing/Gap/Medium' : o.kind === 'Radio' ? 'Spacing/Gap/Small' : 'Spacing/Gap/XSmall';
  return {
    row: { flexDirection: o.side === 'Right' ? 'row-reverse' : 'row', alignItems: o.kind === 'Toggle' ? 'center' : 'flex-start', gap: t.space(gap) },
    controlWrap: o.kind === 'Toggle' ? {} : { paddingTop: t.space('Spacing/Padding/3XSmall') },
    content: { flex: 1, gap: t.space('Spacing/Gap/3XSmall') },
    label: { ...t.text('Body/Base/Regular'), color: t.color(o.disabled ? 'Color/Content/Disabled' : 'Color/Content/Neutral/Strongest') },
    caption: { ...t.text('Caption/Regular'), color: t.color(o.disabled ? 'Color/Content/Disabled' : 'Color/Content/Neutral/Light') },
  };
}
