import type { ReactNode } from 'react';
import { a11yState } from '../a11y';
import { Pressable, Text as RNText, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { listItemStyles, type ListItemType } from './listItemStyles';
import { Radio } from '../Radio/Radio';

export interface ListItemProps {
  type?: ListItemType;
  /** Figma State=Selected */
  selected?: boolean;
  title: string;
  caption?: string;
  /** Figma Leading=True (Avatar/Dock-Icon…) */
  leading?: ReactNode;
  /** Figma Trailing=True (Button/Toggle/Icon…) */
  trailing?: ReactNode;
  /** trailing là control bấm được (Button/Toggle/Checkbox): hàng không nhận role/accessible để không lồng control (web: button trong button; iOS: hàng nuốt nút con) */
  trailingInteractive?: boolean;
  onPress?: () => void;
}

export function ListItem({ type = 'Inline', selected, title, caption, leading, trailing, trailingInteractive, onPress }: ListItemProps) {
  const t = useTheme();
  const role = type === 'Radio-Card' ? 'radio' : onPress && !trailingInteractive ? 'button' : undefined;
  // Radio-Card: hàng là radio, mark chỉ trang trí (không focus, không role) — trailing truyền vào bị bỏ qua
  const trail = type === 'Radio-Card' ? <Radio select={!!selected} decorative /> : trailing;
  return (
    <Pressable accessibilityRole={role} {...a11yState(type === 'Radio-Card' ? { checked: !!selected } : { selected }, role)} accessible={!!onPress && (type === 'Radio-Card' || !trailingInteractive)} disabled={!onPress} onPress={onPress} style={({ pressed }) => listItemStyles(t, { type, selected, pressed }).container}>
      {({ pressed }) => {
        const s = listItemStyles(t, { type, selected, pressed });
        return (
          <>
            {leading ? <View>{leading}</View> : null}
            <View style={s.contents}>
              <View style={s.info}>
                <RNText style={s.title} numberOfLines={1}>{title}</RNText>
                {caption ? <RNText style={s.caption} numberOfLines={2}>{caption}</RNText> : null}
              </View>
            </View>
            {trail ? <View style={s.trailing}>{trail}</View> : null}
          </>
        );
      }}
    </Pressable>
  );
}
