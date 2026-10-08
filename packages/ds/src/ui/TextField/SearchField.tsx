import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import { IconButton } from '../Button/IconButton';
import { textFieldStyles, type InputSize, type SearchType } from './textFieldStyles';

export interface SearchFieldProps extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  /** Figma Search/Default prop Type */
  type?: SearchType;
  size?: InputSize;
  /** Figma set `Search/Overlay`: đặt trên ảnh/nền tối */
  overlay?: boolean;
}

/** Figma ❖ Search — `Search/Default` + `Search/Overlay`: icon kính lúp đầu, nút × (Icon-Main Tertiary / Overlay 2XSmall) khi đang gõ. */
export function SearchField({ type = 'Default', size = 'Medium (Base)', overlay, value, onChangeText, onFocus, onBlur, ...input }: SearchFieldProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const s = textFieldStyles(t, { size, variant: 'Search', searchType: type, focused, overlay });
  return (
    <View style={s.field}>
      <Icon name="search-medium-line" size={s.iconSize} color={s.iconColor} />
      <TextInput
        {...input}
        accessibilityLabel={input.accessibilityLabel ?? input.placeholder ?? 'Tìm kiếm'}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={s.placeholderColor}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        style={s.input}
        returnKeyType="search"
      />
      {value ? (
        overlay
          ? <IconButton overlay level="Primary" size="2XSmall" icon="x-small-line" accessibilityLabel="Xoá nội dung" onPress={() => onChangeText?.('')} />
          : <IconButton level="Tertiary" size="2XSmall" icon="x-small-line" accessibilityLabel="Xoá nội dung" onPress={() => onChangeText?.('')} />
      ) : null}
    </View>
  );
}
