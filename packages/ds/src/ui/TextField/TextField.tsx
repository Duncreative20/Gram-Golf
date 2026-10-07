import { useState } from 'react';
import { Pressable, Text as RNText, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import type { IconName } from '../../icons/generated';
import { textFieldStyles, type InputSize } from './textFieldStyles';

export interface TextFieldProps extends Omit<TextInputProps, 'style' | 'editable' | 'placeholderTextColor'> {
  /** Figma Label=True */
  label?: string;
  /** Figma Help-Text=True; khi `error` là chuỗi thì hiện lỗi thay help */
  helpText?: string;
  size?: InputSize;
  /** true hoặc thông báo lỗi (State=Inputted-Error/Blank-Error) */
  error?: boolean | string;
  readOnly?: boolean;
  disabled?: boolean;
  /** .Primitives/Input/Leading-Trailing: icon đầu/cuối */
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  /** Tên cho screen reader của nút trailing (bắt buộc khi có onTrailingPress), vd "Hiện mật khẩu" */
  trailingAccessibilityLabel?: string;
  onTrailingPress?: () => void;
  /** Figma Clear=True: nút × xoá khi có chữ */
  clearable?: boolean;
}

export function TextField({ label, helpText, size = 'Medium (Base)', error, readOnly, disabled, leadingIcon, trailingIcon, trailingAccessibilityLabel, onTrailingPress, clearable, value, onChangeText, onFocus, onBlur, ...input }: TextFieldProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const s = textFieldStyles(t, { size, focused, error: !!error, readOnly, disabled });
  const message = typeof error === 'string' ? error : helpText;
  return (
    <View style={s.wrapper}>
      {label ? <RNText style={s.label}>{label}</RNText> : null}
      <View style={s.field}>
        {leadingIcon ? <Icon name={leadingIcon} size={s.iconSize} color={s.iconColor} /> : null}
        <TextInput
          {...input}
          accessibilityLabel={input.accessibilityLabel ?? label ?? input.placeholder}
          value={value}
          onChangeText={onChangeText}
          editable={!disabled && !readOnly}
          placeholderTextColor={s.placeholderColor}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          style={s.input}
        />
        {clearable && value ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Xoá nội dung" onPress={() => onChangeText?.('')} hitSlop={t.space('Spacing/Gap/XSmall')}>
            <Icon name="x-circle-solid" size={s.iconSize} color={s.iconColor} />
          </Pressable>
        ) : null}
        {trailingIcon ? (
          <Pressable accessibilityRole={onTrailingPress ? 'button' : undefined} accessible={!!onTrailingPress} accessibilityLabel={trailingAccessibilityLabel} onPress={onTrailingPress} disabled={!onTrailingPress} hitSlop={t.space('Spacing/Gap/XSmall')}>
            <Icon name={trailingIcon} size={s.iconSize} color={s.iconColor} />
          </Pressable>
        ) : null}
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
