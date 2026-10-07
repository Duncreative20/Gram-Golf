import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import { paint, type PaintKey } from '../../theme/paint';

/** Figma ❖ Input — `OTP-Field` (40012547:5812: Length 4|6, Size XLarge|Large, State Default|Error|Disabled) + `.Primitives/OTP/Cell` (40012545:14628). */
export type OtpSize = 'XLarge' | 'Large';

export interface OtpStyles { row: ViewStyle; cell: ViewStyle; digit: TextStyle }

export function otpCellStyles(t: Theme, o: { size: OtpSize; focused?: boolean; filled?: boolean; error?: boolean; disabled?: boolean }): OtpStyles {
  let bg: PaintKey = 'Input/Background/Default';
  let border: PaintKey = 'Input/Border/Default';
  if (o.disabled) bg = 'Color/Background/Subtle-Disabled';
  else if (o.error) { bg = 'Input/Background/Focused'; border = 'Color/Border/Negative/Solid/Default'; }
  else if (o.focused) { bg = 'Input/Background/Focused'; border = 'Color/Focus/Neutral/Solid'; }
  const dim = t.size(`Input/Size/${o.size}`);
  return {
    row: { flexDirection: 'row', gap: t.space('Spacing/Gap/XSmall') },
    cell: {
      // NỢ FIGMA F53: Length=6 × XLarge = 424 > khung 358 → ô co đều (flexShrink) và giữ vuông; đủ chỗ thì đúng Input/Size.
      width: dim, aspectRatio: 1, flexShrink: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center',
      borderRadius: t.radius(`Corner-Radius/Input/${o.size}`),
      borderWidth: 1, borderColor: paint(t, border), backgroundColor: paint(t, bg),
      ...t.shadow('Effect/Input'),
    },
    digit: { ...t.text('Heading/Subheading'), color: t.color(o.disabled ? 'Color/Content/Disabled' : o.filled ? 'Color/Content/Neutral/Strongest' : 'Color/Content/Placeholder') },
  };
}
