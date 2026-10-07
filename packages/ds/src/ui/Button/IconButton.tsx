import { Pressable, type PressableProps } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import type { IconName } from '../../icons/generated';
import { buttonStyles, type IconButtonSize, type IconFlatLevel, type IconMainLevel, type IconMainOverlayLevel } from './buttonStyles';

type Variant =
  | { type?: 'Main'; overlay?: false; level?: IconMainLevel }
  | { type?: 'Main'; overlay: true; level?: IconMainOverlayLevel }
  | { type: 'Flat'; overlay?: false; level?: IconFlatLevel };

export type IconButtonProps = Variant & {
  /** Figma Leading-Icon-Src */
  icon: IconName;
  size?: IconButtonSize;
  disabled?: boolean;
  onPress?: PressableProps['onPress'];
  /** Bắt buộc: nút chỉ có icon */
  accessibilityLabel: string;
};

export function IconButton({ type = 'Main', overlay, level = 'Primary', size = 'Large', icon, disabled, onPress, accessibilityLabel }: IconButtonProps) {
  const t = useTheme();
  const kind = type === 'Flat' ? 'Icon-Flat' : overlay ? 'Icon-Main-Overlay' : 'Icon-Main';
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
        return <Icon name={icon} size={s.iconSize} color={s.iconColor} />;
      }}
    </Pressable>
  );
}
