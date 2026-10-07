import { useEffect, useState } from 'react';
import { Text as RNText, TextInput, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import { IconButton } from '../Button/IconButton';
import { numberFieldStyles, type NumberFieldAlign, type NumberFieldSize } from './stepperControlStyles';

export interface NumberFieldProps {
  value: number | null;
  onChange: (next: number | null) => void;
  label?: string;
  helpText?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  size?: NumberFieldSize;
  align?: NumberFieldAlign;
  error?: boolean | string;
  readOnly?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}

/** Figma ❖ Input — `Input/Number-Align-Left` / `Input/Number-Align-Center`: ô số có nút ± bên trong (Stepper-Control-Split = nút ngoài). */
export function NumberField({ value, onChange, label, helpText, placeholder = '0', min = 0, max = Number.MAX_SAFE_INTEGER, step = 1, size = 'Medium (Base)', align = 'Left', error, readOnly, disabled, accessibilityLabel }: NumberFieldProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(value === null ? '' : String(value));
  useEffect(() => { setDraft(value === null ? '' : String(value)); }, [value]);
  const s = numberFieldStyles(t, { size, align, focused, error: !!error, readOnly, disabled });
  const message = typeof error === 'string' ? error : helpText;
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const locked = disabled || readOnly;
  const cur = value ?? 0;
  const minus = <IconButton level="Tertiary" size={s.buttonSize} icon="minus-line" accessibilityLabel="Giảm" disabled={locked || cur <= min} onPress={() => onChange(clamp(cur - step))} />;
  const plus = <IconButton level="Tertiary" size={s.buttonSize} icon="plus-line" accessibilityLabel="Tăng" disabled={locked || cur >= max} onPress={() => onChange(clamp(cur + step))} />;
  const input = (
    <TextInput
      value={draft}
      editable={!locked}
      keyboardType="number-pad"
      selectTextOnFocus
      placeholder={placeholder}
      placeholderTextColor={s.placeholderColor}
      onChangeText={setDraft}
      onFocus={() => setFocused(true)}
      onBlur={() => { setFocused(false); const n = parseInt(draft, 10); if (Number.isNaN(n)) { setDraft(''); onChange(null); } else onChange(clamp(n)); }}
      style={s.value}
      accessibilityLabel={accessibilityLabel ?? label ?? 'Số lượng'}
    />
  );
  return (
    <View style={s.wrapper}>
      {align === 'Left' ? (
        <View style={s.field}>
          <View style={{ flex: 1 }}>
            {label ? <RNText style={s.label}>{label}</RNText> : null}
            {input}
          </View>
          {minus}
          {plus}
        </View>
      ) : (
        <View style={s.field}>{minus}{input}{plus}</View>
      )}
      {message ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/2XSmall') }}>
          <Icon name={error ? 'alert-octagon-line' : 'info-circle-line'} size={s.helpIconSize} color={s.helpIconColor} />
          <RNText style={s.help}>{message}</RNText>
        </View>
      ) : null}
    </View>
  );
}
