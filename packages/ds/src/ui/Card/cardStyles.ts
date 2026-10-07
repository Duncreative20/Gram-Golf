import type { ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';

/**
 * Figma ❖ Card — `Card` (6643:51021: Theme Default|Pale|Border|Shadow|Semi-Pale, Spacing Medium|Small|Xsmall, Active, Sub-Action).
 * Parity đợt 4: Small và Xsmall cùng radius Large, padding Card-padding-small/xsmall. Semi-Pale = Pale bg + Border stroke.
 */
export type CardTheme = 'Default' | 'Pale' | 'Border' | 'Shadow' | 'Semi-Pale';
export type CardSpacing = 'Medium' | 'Small' | 'Xsmall';

export function cardStyles(t: Theme, o: { theme: CardTheme; spacing: CardSpacing; pressed?: boolean }): { container: ViewStyle; subAction: ViewStyle } {
  const pad = o.spacing === 'Medium' ? t.layout('Card-padding-medium') : o.spacing === 'Small' ? t.layout('Card-padding-small') : t.layout('Card-padding-xsmall');
  const radius = o.spacing === 'Medium' ? t.radius('Corner-Radius/2XLarge') : t.radius('Corner-Radius/Large');
  const pale = o.theme === 'Pale' || o.theme === 'Semi-Pale';
  const border = o.theme === 'Border' || o.theme === 'Semi-Pale';
  return {
    container: {
      padding: pad,
      borderRadius: radius,
      backgroundColor: o.pressed ? t.color('Color/Background/Neutral/Flat/Hover') : pale ? t.color('Color/Background/Support/Neutral/Pale') : t.color('Color/Background/Surface/Default'),
      ...(border ? { borderWidth: 1, borderColor: t.color('Color/Border/Neutral/Pale/Default') } : {}),
      ...(o.theme === 'Shadow' ? t.shadow('Shadow/Bottom/Level-1') : pale ? t.shadow('Effect/Overlay') : {}),
    },
    subAction: { position: 'absolute', top: pad, right: pad },
  };
}
