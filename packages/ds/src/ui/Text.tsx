import { Text as RNText, type TextProps } from 'react-native';
import { useTheme } from '../theme/useTheme';
import type { TextStylesKey, ThemeLightKey } from '../generated/keys';

export interface DsTextProps extends TextProps {
  /** Tên text style Figma, vd "Body/Base/DemiBold" */
  variant?: TextStylesKey;
  /** Tên màu semantic Figma, vd "Color/Content/Neutral/Light" */
  color?: ThemeLightKey;
}

export function Text({ variant = 'Body/Base/Regular', color = 'Color/Content/Neutral/Strongest', style, ...rest }: DsTextProps) {
  const t = useTheme();
  return <RNText {...rest} style={[t.text(variant), { color: t.color(color) }, style]} />;
}
