import { Pressable, Text as RNText, View } from 'react-native';
import { a11yState } from '../a11y';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import { textFieldStyles, type InputSize } from './textFieldStyles';

export interface SelectFieldProps {
  label?: string;
  helpText?: string;
  size?: InputSize;
  placeholder?: string;
  /** Giá trị đang chọn (State=Inputted khi có) */
  value?: string;
  error?: boolean | string;
  disabled?: boolean;
  /** Mở picker (BottomSheet/Popover do app quyết) */
  onPress: () => void;
  accessibilityLabel?: string;
}

/** Figma ❖ Input — `Input/Select-Field` (421:7303): field chỉ đọc + chevron-down; picker nằm ngoài. */
export function SelectField({ label, helpText, size = 'Medium (Base)', placeholder, value, error, disabled, onPress, accessibilityLabel }: SelectFieldProps) {
  const t = useTheme();
  const s = textFieldStyles(t, { size, error: !!error, disabled });
  const message = typeof error === 'string' ? error : helpText;
  return (
    <View style={s.wrapper}>
      {label ? <RNText style={s.label}>{label}</RNText> : null}
      <Pressable accessibilityRole="combobox" accessibilityLabel={accessibilityLabel ?? label} {...a11yState({ disabled, expanded: false })} disabled={disabled} onPress={onPress} style={s.field}>
        <RNText style={[s.input, value ? null : { color: s.placeholderColor }]} numberOfLines={1}>{value || placeholder || ''}</RNText>
        <Icon name="chevron-down-line" size={s.iconSize} color={s.iconColor} />
      </Pressable>
      {message ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/2XSmall') }}>
          <Icon name={s.helpIcon} size={s.helpIconSize} color={s.helpIconColor} />
          <RNText style={s.help}>{message}</RNText>
        </View>
      ) : null}
    </View>
  );
}
