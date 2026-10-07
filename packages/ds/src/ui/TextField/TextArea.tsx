import { useState } from 'react';
import { Text as RNText, TextInput, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import type { TextFieldProps } from './TextField';
import { textFieldStyles, type InputSize } from './textFieldStyles';

export type TextAreaProps = Omit<TextFieldProps, 'leadingIcon' | 'trailingIcon' | 'onTrailingPress' | 'clearable' | 'size'> & { size?: Exclude<InputSize, 'XLarge'> };

/** Figma ❖ Input — `Input/Text-Area` (450:7027): Size Small|Medium (Base)|Large; label Body/XSmall/Regular Strongest (khác Text-Field). */
export function TextArea({ label, helpText, size = 'Medium (Base)', error, readOnly, disabled, value, onChangeText, onFocus, onBlur, ...input }: TextAreaProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const s = textFieldStyles(t, { size, focused, error: !!error, readOnly, disabled, multiline: true });
  const message = typeof error === 'string' ? error : helpText;
  return (
    <View style={s.wrapper}>
      {label ? <RNText style={{ ...t.text('Body/XSmall/Regular'), color: t.color(disabled ? 'Color/Content/Disabled' : 'Color/Content/Neutral/Strongest') }}>{label}</RNText> : null}
      <View style={s.field}>
        <TextInput
          {...input}
          accessibilityLabel={input.accessibilityLabel ?? label ?? input.placeholder}
          multiline
          value={value}
          onChangeText={onChangeText}
          editable={!disabled && !readOnly}
          placeholderTextColor={s.placeholderColor}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          style={s.input}
        />
      </View>
      {message ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/2XSmall') }}>
          <Icon name={s.helpIcon} size={s.helpIconSize} color={s.helpIconColor} />
          <RNText style={s.help}>{message}</RNText>
        </View>
      ) : null}
    </View>
  );
}
