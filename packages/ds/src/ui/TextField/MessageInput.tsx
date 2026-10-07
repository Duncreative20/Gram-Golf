import { useState } from 'react';
import { Pressable, Text as RNText, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import { textFieldStyles, type InputSize } from './textFieldStyles';

export interface MessageInputProps extends Omit<TextInputProps, 'style' | 'editable' | 'placeholderTextColor'> {
  helpText?: string;
  size?: InputSize;
  error?: boolean | string;
  readOnly?: boolean;
  disabled?: boolean;
  /** `Input/Message-Input-Overlay`: đặt trên ảnh/nền tối */
  overlay?: boolean;
  /** Nút gửi (arrow-right-line) — hiện khi focus hoặc có chữ như Figma State Focused/Typing/Inputted */
  onSend?: (text: string) => void;
}

/** Figma ❖ Input — `Input/Message-Input` (40012928:33331) / `Input/Message-Input-Overlay` (40012870:36201): pill + nút gửi tròn sát mép phải. */
export function MessageInput({ helpText, size = 'Medium (Base)', error, readOnly, disabled, overlay, onSend, value, onChangeText, onFocus, onBlur, ...input }: MessageInputProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const s = textFieldStyles(t, { size, variant: 'Message', focused, error: !!error, readOnly, disabled, overlay });
  const message = typeof error === 'string' ? error : helpText;
  const showSend = !!s.send && (focused || !!value);
  return (
    <View style={s.wrapper}>
      <View style={s.field}>
        <TextInput
          {...input}
          accessibilityLabel={input.accessibilityLabel ?? input.placeholder ?? 'Tin nhắn'}
          value={value}
          onChangeText={onChangeText}
          editable={!disabled && !readOnly}
          placeholderTextColor={s.placeholderColor}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          onSubmitEditing={() => { if (value) onSend?.(value); }}
          style={s.input}
        />
        {showSend && s.send ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Gửi" disabled={disabled || readOnly || !value} onPress={() => onSend?.(value ?? '')} style={s.send.button}>
            <Icon name="arrow-right-line" size={s.send.iconSize} color={s.send.iconColor} />
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
