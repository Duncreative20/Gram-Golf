import { View, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { dividerStyles, type DividerColor, type DividerDirection } from './dividerStyles';

export interface DividerProps extends ViewProps {
  /** Figma prop Color */
  color?: DividerColor;
  /** Figma prop Direction */
  direction?: DividerDirection;
}

export function Divider({ color = 'Default', direction = 'Horizontal', style, ...rest }: DividerProps) {
  const t = useTheme();
  return <View accessibilityRole="none" {...rest} style={[dividerStyles(t, { color, direction }), style]} />;
}
