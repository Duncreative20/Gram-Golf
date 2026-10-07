import { Pressable } from 'react-native';
import { a11yState } from '../a11y';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import { checkboxStyles, type CheckboxShape, type CheckboxType } from './checkboxStyles';

export interface CheckboxProps {
  /** Figma Select=Yes/No */
  select: boolean;
  type?: CheckboxType;
  shape?: CheckboxShape;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
  accessibilityLabel?: string;
}

export function Checkbox({ select, type = 'Default', shape = 'Default', disabled, onChange, accessibilityLabel }: CheckboxProps) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      {...a11yState({ checked: type === 'Indeterminate' && select ? 'mixed' : select, disabled })}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={() => onChange?.(!select)}
      hitSlop={t.space('Spacing/Gap/XSmall')}
      style={({ pressed }) => checkboxStyles(t, { type, select, shape, pressed, disabled }).box}
    >
      {({ pressed }) => {
        const s = checkboxStyles(t, { type, select, shape, pressed, disabled });
        return s.icon ? <Icon name={s.icon} size={s.iconSize} color={s.iconColor} /> : null;
      }}
    </Pressable>
  );
}
