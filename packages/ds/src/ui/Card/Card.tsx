import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { IconButton } from '../Button/IconButton';
import type { IconName } from '../../icons/generated';
import { cardStyles, type CardSpacing, type CardTheme } from './cardStyles';

export interface CardProps {
  theme?: CardTheme;
  spacing?: CardSpacing;
  /** Figma Active=True: cả card bấm được */
  onPress?: () => void;
  /** Figma Sub-Action=True: icon button Flat Small góc trên phải */
  subActionIcon?: IconName;
  onSubAction?: () => void;
  subActionLabel?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export function Card({ theme = 'Default', spacing = 'Medium', onPress, subActionIcon, onSubAction, subActionLabel = 'More', style, children }: CardProps) {
  const t = useTheme();
  const sub = subActionIcon ? (
    <View style={cardStyles(t, { theme, spacing }).subAction}>
      <IconButton type="Flat" level="Secondary" size="Small" icon={subActionIcon} onPress={onSubAction} accessibilityLabel={subActionLabel} />
    </View>
  ) : null;
  if (!onPress) {
    return <View style={[cardStyles(t, { theme, spacing }).container, style]}>{children}{sub}</View>;
  }
  return (
    <Pressable accessibilityRole="button" accessible={!sub} onPress={onPress} style={({ pressed }) => [cardStyles(t, { theme, spacing, pressed }).container, style]}>
      {children}
      {sub}
    </Pressable>
  );
}
