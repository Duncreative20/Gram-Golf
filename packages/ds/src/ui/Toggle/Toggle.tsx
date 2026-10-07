import { Pressable, View } from 'react-native';
import { a11yState } from '../a11y';
import { useTheme } from '../../theme/useTheme';
import { ControlRow, type ControlRowProps } from '../Radio/Radio';
import { toggleStyles, type ToggleSize } from './toggleStyles';

export interface ToggleProps {
  select: boolean;
  onChange?: (next: boolean) => void;
  size?: ToggleSize;
  disabled?: boolean;
  accessibilityLabel?: string;
}

/** Figma `Toggle-Button` */
export function Toggle({ select, onChange, size = 'Medium', disabled, accessibilityLabel }: ToggleProps) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      {...a11yState({ checked: select, disabled })}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={() => onChange?.(!select)}
      hitSlop={t.space('Spacing/Gap/XSmall')}
      style={({ pressed }) => toggleStyles(t, { size, select, pressed, disabled }).bar}
    >
      {({ pressed }) => <View style={toggleStyles(t, { size, select, pressed, disabled }).dot} />}
    </Pressable>
  );
}

/** Figma `Toggle` (Theme Text-First = toggle bên phải, Toggle-First = bên trái) */
export function ToggleRow({ select, onChange, size, theme = 'Text-First', ...row }: Omit<ControlRowProps, 'side'> & Pick<ToggleProps, 'select' | 'onChange' | 'size'> & { theme?: 'Text-First' | 'Toggle-First' }) {
  return (
    <ControlRow kind="Toggle" side={theme === 'Text-First' ? 'Right' : 'Left'} {...row} onPress={() => onChange?.(!select)} control={<Toggle select={select} onChange={onChange} size={size} disabled={row.disabled} accessibilityLabel={row.label} />} />
  );
}
