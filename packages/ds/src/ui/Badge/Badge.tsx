import { Pressable, Text as RNText, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import type { IconName } from '../../icons/generated';
import { badgeStyles, type BadgeBackground, type BadgeSize, type BadgeTheme } from './badgeStyles';

export interface BadgeProps {
  /** Figma prop Text */
  text: string;
  size?: BadgeSize;
  theme?: BadgeTheme;
  background?: BadgeBackground;
  /** Figma Leading-Icon-Src */
  leadingIcon?: IconName;
  /** Figma Remove=True: hiện nút × ; bấm gọi onRemove */
  onRemove?: () => void;
}

export function Badge({ text, size = 'Small', theme = 'Neutral', background = 'Subtle', leadingIcon, onRemove }: BadgeProps) {
  const t = useTheme();
  const s = badgeStyles(t, { size, theme, background });
  return (
    <View style={s.container}>
      {leadingIcon ? <Icon name={leadingIcon} size={s.iconSize} color={s.iconColor} /> : null}
      <RNText style={s.label} numberOfLines={1}>{text}</RNText>
      {onRemove ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Remove" onPress={onRemove} hitSlop={t.space('Spacing/Gap/XSmall')}>
          <Icon name="x-small-line" size={s.iconSize} color={s.contentColor} />
        </Pressable>
      ) : null}
    </View>
  );
}
