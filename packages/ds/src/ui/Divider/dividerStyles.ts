import type { ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';

/** Figma ❖ Divider — set `Divider` (460:38361): Color × Direction, stroke 1px bound vào Color/Border/Neutral/*. */
export type DividerColor = 'Default' | 'Medium' | 'High';
export type DividerDirection = 'Horizontal' | 'Vertical';

// Đúng như Figma: Vertical/Default bound Subtle (không phải Pale) → giữ nguyên, không "sửa" hộ.
const STROKE = {
  Horizontal: { Default: 'Color/Border/Neutral/Pale/Default', Medium: 'Color/Border/Neutral/Subtle/Default', High: 'Color/Border/Neutral/Solid/Default' },
  Vertical: { Default: 'Color/Border/Neutral/Subtle/Default', Medium: 'Color/Border/Neutral/Subtle/Default', High: 'Color/Border/Neutral/Solid/Default' },
} as const;

export function dividerStyles(t: Theme, o: { color: DividerColor; direction: DividerDirection }): ViewStyle {
  const backgroundColor = t.color(STROKE[o.direction][o.color]);
  return o.direction === 'Vertical'
    ? { width: 1, alignSelf: 'stretch', backgroundColor }
    : { height: 1, alignSelf: 'stretch', backgroundColor };
}
