import { Pressable, Text as RNText, type ImageSourcePropType } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import type { IconName } from '../../icons/generated';
import { Avatar } from '../Avatar/Avatar';
import { tagStyles, type TagSize } from './tagStyles';

export interface TagProps {
  text: string;
  size?: TagSize;
  /** Theme=Leading-Icon */
  icon?: IconName;
  /** Theme=Leading-Photo */
  photo?: ImageSourcePropType;
  /** State=Error */
  error?: boolean;
  disabled?: boolean;
  /** Remove=Yes */
  onRemove?: () => void;
  onPress?: () => void;
}

export function Tag({ text, size = 'Medium', icon, photo, error, disabled, onRemove, onPress }: TagProps) {
  const t = useTheme();
  return (
    <Pressable accessibilityRole={onPress ? 'button' : undefined} accessible={!onRemove} disabled={disabled || !onPress} onPress={onPress} style={({ pressed }) => tagStyles(t, { size, error, disabled, pressed: pressed && !!onPress }).container}>
      {({ pressed }) => {
        const s = tagStyles(t, { size, error, disabled, pressed: pressed && !!onPress });
        return (
          <>
            {photo ? <Avatar size="2XSmall" source={photo} /> : icon ? <Icon name={icon} size={s.iconSize} color={s.iconColor} /> : null}
            <RNText style={s.label} numberOfLines={1}>{text}</RNText>
            {onRemove ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Remove" onPress={onRemove} disabled={disabled} hitSlop={t.space('Spacing/Gap/XSmall')}>
                <Icon name="x-small-line" size={s.iconSize} color={s.removeColor} />
              </Pressable>
            ) : null}
          </>
        );
      }}
    </Pressable>
  );
}
