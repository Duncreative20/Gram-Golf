import { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { IconButton } from '../Button/IconButton';
import { stepperControlStyles, type StepperControlSize } from './stepperControlStyles';

export interface StepperControlProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: StepperControlSize;
  error?: boolean;
  disabled?: boolean;
  /** Cho gõ trực tiếp (State=Typing) */
  editable?: boolean;
  accessibilityLabel?: string;
}

export function StepperControl({ value, onChange, min = 0, max = Number.MAX_SAFE_INTEGER, step = 1, size = 'Medium', error, disabled, editable = true, accessibilityLabel = 'Số lượng' }: StepperControlProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(String(value));
  useEffect(() => { setDraft(String(value)); }, [value]);
  const s = stepperControlStyles(t, { size, focused, error, disabled });
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <View style={s.row} accessibilityLabel={accessibilityLabel}>
      <IconButton level="Tertiary" size={s.buttonSize} icon="minus-line" accessibilityLabel="Giảm" disabled={disabled || value <= min} onPress={() => onChange(clamp(value - step))} />
      <View style={s.field}>
        <TextInput
          value={draft}
          editable={editable && !disabled}
          keyboardType="number-pad"
          selectTextOnFocus
          onChangeText={setDraft}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); const n = parseInt(draft, 10); if (Number.isNaN(n)) setDraft(String(value)); else onChange(clamp(n)); }}
          style={[s.value, { paddingVertical: 0, alignSelf: 'stretch' }]}
          accessibilityLabel={accessibilityLabel}
        />
      </View>
      <IconButton level="Tertiary" size={s.buttonSize} icon="plus-line" accessibilityLabel="Tăng" disabled={disabled || value >= max} onPress={() => onChange(clamp(value + step))} />
    </View>
  );
}
