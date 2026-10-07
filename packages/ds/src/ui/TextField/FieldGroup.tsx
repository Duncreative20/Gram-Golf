import { Text as RNText, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import type { IconName } from '../../icons/generated';
import { fieldGroupStyles } from './fieldGroupStyles';
import type { InputSize } from './textFieldStyles';

export interface FieldGroupRow extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> { key: string; leadingIcon?: IconName }
export interface FieldGroupProps { label?: string; size?: InputSize; rows: FieldGroupRow[] }

/** Figma ❖ Input — `Input/Field-Group` (40012571:16727): nhóm ô nhập chung khung (vd địa chỉ: đường / phường / thành phố). */
export function FieldGroup({ label, size = 'Medium (Base)', rows }: FieldGroupProps) {
  const t = useTheme();
  const s = fieldGroupStyles(t, { size });
  return (
    <View style={s.wrapper}>
      {label ? <RNText style={s.label}>{label}</RNText> : null}
      <View style={s.group}>
        {rows.map(({ key, leadingIcon, ...input }, i) => (
          <View key={key} style={[s.row, i > 0 ? s.rowDivider : null]}>
            {leadingIcon ? <Icon name={leadingIcon} size={t.size('Element-Size/Popular/Base')} color="Color/Content/Neutral/Light" /> : null}
            <TextInput {...input} accessibilityLabel={input.accessibilityLabel ?? input.placeholder ?? label} placeholderTextColor={s.placeholderColor} style={s.input} />
          </View>
        ))}
      </View>
    </View>
  );
}
