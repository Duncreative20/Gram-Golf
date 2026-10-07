import { useRef, useState, type ComponentRef } from 'react';
import { INPUT_RESET } from '../inputReset';
import { Pressable, Text as RNText, TextInput, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import { textFieldStyles } from '../TextField/textFieldStyles';
import { otpCellStyles, type OtpSize } from './otpFieldStyles';

export interface OtpFieldProps {
  value: string;
  onChangeText: (next: string) => void;
  /** Figma Length */
  length?: 4 | 6;
  size?: OtpSize;
  error?: boolean | string;
  disabled?: boolean;
  helpText?: string;
  onComplete?: (code: string) => void;
}

/** Ô nhập OTP: TextInput ẩn nhận phím, các ô chỉ hiển thị. */
export function OtpField({ value, onChangeText, length = 6, size = 'XLarge', error, disabled, helpText, onComplete }: OtpFieldProps) {
  const t = useTheme();
  const ref = useRef<ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(false);
  const help = textFieldStyles(t, { size: 'Medium (Base)', error: !!error, disabled });
  const message = typeof error === 'string' ? error : helpText;
  const digits = value.slice(0, length);
  const active = Math.min(digits.length, length - 1);
  return (
    <View style={help.wrapper}>
      <Pressable accessibilityRole="none" onPress={() => ref.current?.focus()} disabled={disabled} style={otpCellStyles(t, { size }).row}>
        {Array.from({ length }, (_, i) => {
          const s = otpCellStyles(t, { size, focused: focused && i === active, filled: !!digits[i], error: !!error, disabled });
          return (
            <View key={i} style={s.cell}>
              <RNText style={s.digit}>{digits[i] ?? '•'}</RNText>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={ref}
        value={digits}
        onChangeText={(v) => {
          const next = v.replace(/\D/g, '').slice(0, length);
          onChangeText(next);
          if (next.length === length) onComplete?.(next);
        }}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        editable={!disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel="OTP"
        style={{ ...INPUT_RESET, position: 'absolute', opacity: 0, width: 1, height: 1 }}
      />
      {message ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/2XSmall') }}>
          <Icon name={help.helpIcon} size={help.helpIconSize} color={help.helpIconColor} />
          <RNText style={help.help}>{message}</RNText>
        </View>
      ) : null}
    </View>
  );
}
