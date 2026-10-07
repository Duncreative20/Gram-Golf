import { Pressable, Text as RNText, type PressableProps } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import type { IconName } from '../../icons/generated';
import { buttonStyles, type ButtonSize, type FlatLevel, type MainLevel, type MainOverlayLevel } from './buttonStyles';

type Variant =
  | { type?: 'Main'; overlay?: false; level?: MainLevel }
  | { type?: 'Main'; overlay: true; level?: MainOverlayLevel }
  | { type: 'Flat'; overlay?: false; level?: FlatLevel };

export type ButtonProps = Variant & {
  /** Figma prop Text */
  text: string;
  /** Figma prop Size (giá trị nguyên văn, kể cả "Medium (Base)") */
  size?: ButtonSize;
  /** Figma Leading-Icon-Src / Trailing-Icon-Src */
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  disabled?: boolean;
  onPress?: PressableProps['onPress'];
  accessibilityLabel?: string;
};

export function Button({ type = 'Main', overlay, level = 'Primary', size = 'Large', text, leadingIcon, trailingIcon, disabled, onPress, accessibilityLabel }: ButtonProps) {
  const t = useTheme();
  const kind = type === 'Flat' ? 'Flat' : overlay ? 'Main-Overlay' : 'Main';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => buttonStyles(t, { kind, level, size, pressed, disabled }).container}
    >
      {({ pressed }) => {
        const s = buttonStyles(t, { kind, level, size, pressed, disabled });
        return (
          <>
            {leadingIcon ? <Icon name={leadingIcon} size={s.iconSize} color={s.iconColor} /> : null}
            <RNText style={s.label}>{text}</RNText>
            {trailingIcon ? <Icon name={trailingIcon} size={s.iconSize} color={s.iconColor} /> : null}
          </>
        );
      }}
    </Pressable>
  );
}
