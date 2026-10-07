import { Pressable, Text as RNText, View } from 'react-native';
import { a11yState } from '../a11y';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import { textFieldStyles, type InputSize } from './textFieldStyles';

export interface DateFieldProps {
  label?: string;
  helpText?: string;
  size?: InputSize;
  placeholder?: string;
  /** Chuỗi ngày đã format (State=Inputted khi có) — format do app quyết */
  value?: string;
  error?: boolean | string;
  readOnly?: boolean;
  disabled?: boolean;
  /** Mở DatePicker (BottomSheet do app quyết) */
  onPress: () => void;
  accessibilityLabel?: string;
}

/** Figma ❖ Input — `Input/Date-Field` (40012324:12084): Text-Field chỉ đọc + icon calendar-line; picker nằm ngoài. */
export function DateField({ label, helpText, size = 'Medium (Base)', placeholder, value, error, readOnly, disabled, onPress, accessibilityLabel }: DateFieldProps) {
  const t = useTheme();
  const s = textFieldStyles(t, { size, error: !!error, readOnly, disabled });
  const message = typeof error === 'string' ? error : helpText;
  return (
    <View style={s.wrapper}>
      {label ? <RNText style={s.label}>{label}</RNText> : null}
      <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label} {...a11yState({ disabled: disabled || readOnly })} disabled={disabled || readOnly} onPress={onPress} style={s.field}>
        <RNText style={[s.input, value ? null : { color: s.placeholderColor }]} numberOfLines={1}>{value || placeholder || ''}</RNText>
        {/* Figma Read-Only: icon Content/Disabled (khác Text-Field) */}
        <Icon name="calendar-line" size={s.iconSize} color={readOnly ? 'Color/Content/Disabled' : s.iconColor} />
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
