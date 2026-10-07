import type { ReactNode } from 'react';
import { a11yState } from '../a11y';
import { Pressable, Text as RNText, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Checkbox, type CheckboxProps } from '../Checkbox/Checkbox';
import { controlRowStyles, radioStyles, type ControlKind, type ControlSide } from './radioStyles';

export interface RadioProps {
  select: boolean;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  /** chỉ vẽ mark (Radio-Card đã là radio) — không role, không focus */
  decorative?: boolean;
}

/** Figma `Radio-Button/Radio-Mark` */
export function Radio({ select, disabled, onPress, accessibilityLabel, decorative }: RadioProps) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole={decorative ? undefined : 'radio'}
      {...(decorative ? {} : a11yState({ checked: select, disabled }))}
      accessibilityLabel={accessibilityLabel}
      accessible={!decorative}
      focusable={!decorative}
      aria-hidden={decorative}
      disabled={disabled || decorative}
      onPress={onPress}
      hitSlop={t.space('Spacing/Gap/XSmall')}
      style={({ pressed }) => radioStyles(t, { select, pressed, disabled }).box}
    >
      {({ pressed }) => {
        const s = radioStyles(t, { select, pressed, disabled });
        return s.dot ? <View style={s.dot} /> : null;
      }}
    </Pressable>
  );
}

export interface ControlRowProps {
  /** Figma Content: Label + Caption */
  label: string;
  caption?: string;
  /** Figma Radio-Side / Check-Side; Toggle: Theme Text-First = Right */
  side?: ControlSide;
  disabled?: boolean;
  onPress?: () => void;
}

/** Hàng label + control (dùng chung Radio-Button, Checkbox/Text, Toggle). */
export function ControlRow({ kind, control, label, caption, side = 'Left', disabled, onPress }: ControlRowProps & { kind: ControlKind; control: ReactNode }) {
  const t = useTheme();
  const s = controlRowStyles(t, { kind, side, disabled });
  return (
    <Pressable style={s.row} onPress={onPress} disabled={disabled || !onPress} accessible={false}>
      <View style={s.controlWrap}>{control}</View>
      <View style={s.content}>
        <RNText style={s.label}>{label}</RNText>
        {caption ? <RNText style={s.caption}>{caption}</RNText> : null}
      </View>
    </Pressable>
  );
}

/** Figma `Radio-Button/Radio-Button` */
export function RadioRow({ select, onPress, ...row }: ControlRowProps & { select: boolean }) {
  return <ControlRow kind="Radio" {...row} onPress={onPress} control={<Radio select={select} disabled={row.disabled} onPress={onPress} accessibilityLabel={row.label} />} />;
}

/** Figma `Checkbox/Text` */
export function CheckboxRow({ select, onChange, type, shape, ...row }: ControlRowProps & Pick<CheckboxProps, 'select' | 'onChange' | 'type' | 'shape'>) {
  return (
    <ControlRow kind="Checkbox" {...row} onPress={() => onChange?.(!select)} control={<Checkbox select={select} type={type} shape={shape} disabled={row.disabled} onChange={onChange} accessibilityLabel={row.label} />} />
  );
}
