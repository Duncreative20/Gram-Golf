import { Pressable, Text as RNText, type ImageSourcePropType } from 'react-native';
import { a11yState } from '../a11y';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import type { IconName } from '../../icons/generated';
import { Avatar } from '../Avatar/Avatar';
import { Badge } from '../Badge/Badge';
import { chipStyles, type ChipLevel, type ChipSize, type ChipVariant } from './chipStyles';

export interface ChipProps {
  /** Figma set: Normal | Advanced (có Counter + chevron) | Number-Only (vuông) */
  variant?: ChipVariant;
  text: string;
  size?: ChipSize;
  level?: ChipLevel;
  /** Theme=Leading-Icon */
  icon?: IconName;
  /** Theme=Leading-Photo */
  photo?: ImageSourcePropType;
  /** Advanced: Counter=True */
  counter?: string;
  select?: boolean;
  onPress?: () => void;
  /** Nhãn trình đọc màn hình khi chữ trên chip không nói hết việc bấm làm (vd chip tag bấm để bỏ) */
  accessibilityLabel?: string;
}

export function Chip({ variant = 'Normal', text, size = 'Small', level = 'Secondary', icon, photo, counter, select = false, onPress, accessibilityLabel }: ChipProps) {
  const t = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} {...a11yState({ selected: select }, 'button')} onPress={onPress} style={({ pressed }) => chipStyles(t, { variant, size, level, select, pressed }).container}>
      {({ pressed }) => {
        const s = chipStyles(t, { variant, size, level, select, pressed });
        return (
          <>
            {photo ? <Avatar size={s.photoSize} source={photo} /> : icon ? <Icon name={icon} size={s.iconSize} color={s.iconColor} /> : null}
            <RNText style={s.label} numberOfLines={1}>{text}</RNText>
            {variant === 'Advanced' && counter ? <Badge text={counter} size="XSmall" theme="Neutral" background="Subtle" /> : null}
            {variant === 'Advanced' ? <Icon name="chevron-down-line" size={s.trailingSize} color={s.iconColor} /> : null}
          </>
        );
      }}
    </Pressable>
  );
}
