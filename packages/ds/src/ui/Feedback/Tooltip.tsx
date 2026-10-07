import { Text as RNText, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { tooltipStyles, type TooltipColor, type TooltipSize } from './feedbackStyles';

export interface TooltipProps {
  text: string;
  color?: TooltipColor;
  size?: TooltipSize;
}

/** Figma `Tooltip` — chỉ bong bóng; neo/định vị do app (mũi tên Figma bỏ, spec §7). */
export function Tooltip({ text, color = 'Default', size = 'Medium' }: TooltipProps) {
  const t = useTheme();
  const s = tooltipStyles(t, { color, size });
  return (
    <View accessibilityRole="text" style={s.container}>
      <RNText style={s.text}>{text}</RNText>
    </View>
  );
}
